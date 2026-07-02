use fossic::{
    FirstOpenPolicy, OpenOptions, ReadQuery, Store, StoredEvent, SubscribeQuery, SubscriptionHandle,
    SubscriptionHandler, SubscriptionMode,
};
use serde_json::json;
use std::collections::HashMap;
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

// ── GSA event processing ──────────────────────────────────────────────────────

fn emit_gsa_event(app: &AppHandle, event: &StoredEvent) {
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

    if let Err(e) = app.emit(
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

// ── Subscription handler ──────────────────────────────────────────────────────

struct GsaHandler {
    app: AppHandle,
    // Tracks the highest version delivered per stream so catch_up_missed knows
    // where to resume. Updated on every event, not just GSA, to track position
    // across all events in matched streams.
    last_seen: Arc<Mutex<HashMap<String, u64>>>,
}

impl SubscriptionHandler for GsaHandler {
    fn on_event(&self, event: &StoredEvent) {
        {
            let mut map = self.last_seen.lock().unwrap();
            let entry = map.entry(event.stream_id.clone()).or_insert(0);
            if event.version > *entry {
                *entry = event.version;
            }
        }
        emit_gsa_event(&self.app, event);
    }
}

// ── Catch-up read ─────────────────────────────────────────────────────────────

// Replays GSA events that arrived during a degraded window on all previously
// seen streams. New streams (new lineage_ids) that appeared while degraded
// are not covered here — the fresh subscription picks them up going forward.
fn catch_up_missed(store: &Store, last_seen: &HashMap<String, u64>, app: &AppHandle) {
    for (stream_id, &last_version) in last_seen {
        let q = ReadQuery {
            stream_id: stream_id.clone(),
            branch: "main".to_string(),
            from_version: Some(last_version + 1),
            to_version: None,
            limit: None,
            event_type_filter: Some("GraphSnapshotAvailable".to_string()),
        };
        match store.read_range(q) {
            Ok(events) => {
                for event in &events {
                    emit_gsa_event(app, event);
                }
            }
            Err(e) => {
                eprintln!("[cerebra_watcher] catch-up read failed for {stream_id}: {e}");
            }
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
        // Shared cursor state: handler writes, watcher reads on degradation.
        let last_seen: Arc<Mutex<HashMap<String, u64>>> = Arc::new(Mutex::new(HashMap::new()));
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
                    let handler = GsaHandler {
                        app: app.clone(),
                        last_seen: Arc::clone(&last_seen),
                    };
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

                            // Poll for degradation every 30s.
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
                                        "[cerebra_watcher] subscription degraded, replaying gap"
                                    );

                                    // Snapshot cursors then replay missed events
                                    // while the store is still alive in WatcherInner.
                                    let seen_snapshot = last_seen.lock().unwrap().clone();
                                    {
                                        let lock = state.inner.lock().unwrap();
                                        if let Some(w) = lock.as_ref() {
                                            catch_up_missed(&w._store, &seen_snapshot, &app);
                                        }
                                    }

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
