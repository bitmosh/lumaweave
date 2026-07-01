use fossic::{
    FirstOpenPolicy, OpenOptions, Store, StoredEvent, SubscribeQuery, SubscriptionHandle,
    SubscriptionHandler, SubscriptionMode,
};
use serde_json::json;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

// ── Managed state ─────────────────────────────────────────────────────────────

pub struct CerebraWatcher {
    inner: Mutex<Option<WatcherInner>>,
}

struct WatcherInner {
    _store: Store,
    _handle: SubscriptionHandle,
}

impl CerebraWatcher {
    pub fn new() -> Self {
        CerebraWatcher {
            inner: Mutex::new(None),
        }
    }
}

// ── Subscription handler ──────────────────────────────────────────────────────

struct GsaHandler {
    app: AppHandle,
}

impl SubscriptionHandler for GsaHandler {
    fn on_event(&self, event: &StoredEvent) {
        if event.event_type != "GraphSnapshotAvailable" {
            return;
        }
        let payload = match event.deserialize_payload_json() {
            Ok(v) => v,
            Err(e) => {
                eprintln!("[cerebra_watcher] GSA payload decode failed: {e}");
                return;
            }
        };
        let snapshot_ref = match payload.get("snapshot_ref").and_then(|v| v.as_str()) {
            Some(s) => s.to_string(),
            None => {
                eprintln!("[cerebra_watcher] GSA missing snapshot_ref");
                return;
            }
        };
        let lineage_id = payload
            .get("lineage_id")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();
        let graph_version = payload
            .get("graph_version")
            .and_then(|v| v.as_u64())
            .unwrap_or(0);
        let causation_id = event.id.to_hex();

        if let Err(e) = self.app.emit(
            "cerebra:snapshot-available",
            json!({
                "snapshot_ref": snapshot_ref,
                "lineage_id": lineage_id,
                "graph_version": graph_version,
                "causation_id": causation_id,
            }),
        ) {
            eprintln!("[cerebra_watcher] failed to emit tauri event: {e}");
        }
    }
}

// ── Hub store open ────────────────────────────────────────────────────────────

fn hub_store_path() -> Option<std::path::PathBuf> {
    if let Ok(path) = std::env::var("LATTICA_FOSSIC_STORE") {
        return Some(std::path::PathBuf::from(path));
    }
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .ok()?;
    Some(std::path::PathBuf::from(home).join(".lattica/fossic/store.db"))
}

fn try_open_hub_store() -> Option<Store> {
    let path = hub_store_path()?;
    if !path.exists() {
        return None;
    }
    let opts = OpenOptions {
        on_first_open: FirstOpenPolicy::RequireExisting,
        ..OpenOptions::default()
    };
    match Store::open(&path, opts) {
        Ok(store) => Some(store),
        Err(e) => {
            eprintln!("[cerebra_watcher] hub store open failed at {path:?}: {e}");
            None
        }
    }
}

// ── Watcher thread ────────────────────────────────────────────────────────────

pub fn start(app: AppHandle, state: Arc<CerebraWatcher>) {
    std::thread::spawn(move || {
        let mut backoff_secs = 5u64;
        loop {
            match try_open_hub_store() {
                Some(store) => {
                    backoff_secs = 5;
                    let q = SubscribeQuery {
                        stream_pattern: "cerebra/graph/**".to_string(),
                        branch: "main".to_string(),
                        include_system: false,
                    };
                    let handler = GsaHandler { app: app.clone() };
                    match store.subscribe(
                        q,
                        SubscriptionMode::PostCommit { queue_size: 64 },
                        handler,
                    ) {
                        Ok(handle) => {
                            *state.inner.lock().unwrap() = Some(WatcherInner {
                                _store: store,
                                _handle: handle,
                            });
                            // Poll for degradation; re-subscribe if the channel backs up
                            loop {
                                std::thread::sleep(std::time::Duration::from_secs(30));
                                let degraded = state
                                    .inner
                                    .lock()
                                    .unwrap()
                                    .as_ref()
                                    .map(|w| w._handle.is_degraded())
                                    .unwrap_or(true);
                                if degraded {
                                    eprintln!(
                                        "[cerebra_watcher] subscription degraded, re-subscribing"
                                    );
                                    *state.inner.lock().unwrap() = None;
                                    break;
                                }
                            }
                        }
                        Err(e) => {
                            eprintln!("[cerebra_watcher] subscribe failed: {e}");
                        }
                    }
                }
                None => {
                    // Hub store not present — normal when hub hasn't started yet
                }
            }
            std::thread::sleep(std::time::Duration::from_secs(backoff_secs));
            backoff_secs = (backoff_secs * 2).min(60);
        }
    });
}
