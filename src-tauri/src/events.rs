use fossic::{Append, EventId, OpenOptions, Store};
use serde_json::json;
use tauri::State;

const STREAM: &str = "lumaweave/graph/events";

// ---------------------------------------------------------------------------
// Managed state
// ---------------------------------------------------------------------------

pub struct LwEventStore(Option<Store>);

impl LwEventStore {
    pub fn unavailable() -> Self {
        LwEventStore(None)
    }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

pub fn init(project_root: &std::path::Path) -> LwEventStore {
    match try_open(project_root) {
        Ok(store) => LwEventStore(Some(store)),
        Err(e) => {
            eprintln!("[lumaweave/events] fossic store failed to open: {e}");
            LwEventStore(None)
        }
    }
}

fn try_open(project_root: &std::path::Path) -> Result<Store, fossic::Error> {
    let db_dir = project_root.join(".lumaweave");
    std::fs::create_dir_all(&db_dir)?;
    let db_path = db_dir.join("fossic.db");
    let store = Store::open(&db_path, OpenOptions::default())?;
    store.declare_stream(STREAM, "lumaweave", Some("LumaWeave graph lifecycle events"))?;
    Ok(store)
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

fn emit(store: &State<'_, LwEventStore>, event_type: &str, payload: serde_json::Value) -> Result<(), String> {
    if let Some(s) = &store.0 {
        s.append(Append {
            stream_id: STREAM.to_string(),
            event_type: event_type.to_string(),
            payload,
            ..Append::default()
        })
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Tauri commands — all fire-and-forget from the frontend; errors are logged,
// never propagated to the user.
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn lw_emit_source_loaded(
    store: State<'_, LwEventStore>,
    adapter_id: String,
    source_key: String,
    node_count: u32,
    edge_count: u32,
    causation_id: Option<String>,
) -> Result<(), String> {
    let causation = causation_id
        .as_deref()
        .map(EventId::from_hex)
        .transpose()
        .map_err(|e| e.to_string())?;
    if let Some(s) = &store.0 {
        s.append(Append {
            stream_id: STREAM.to_string(),
            event_type: "SourceLoaded".to_string(),
            payload: json!({
                "adapter_id": adapter_id,
                "source_key": source_key,
                "node_count": node_count,
                "edge_count": edge_count,
            }),
            causation_id: causation,
            ..Append::default()
        })
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn lw_emit_source_load_failed(
    store: State<'_, LwEventStore>,
    adapter_id: String,
    source_key: String,
    error: String,
) -> Result<(), String> {
    emit(&store, "SourceLoadFailed", json!({
        "adapter_id": adapter_id,
        "source_key": source_key,
        "error": error,
    }))
}

#[tauri::command]
pub fn lw_emit_source_switched(
    store: State<'_, LwEventStore>,
    from_adapter_id: String,
    to_adapter_id: String,
) -> Result<(), String> {
    emit(&store, "SourceSwitched", json!({
        "from_adapter_id": from_adapter_id,
        "to_adapter_id": to_adapter_id,
    }))
}

#[tauri::command]
pub fn lw_emit_theme_changed(
    store: State<'_, LwEventStore>,
    from_theme_id: String,
    to_theme_id: String,
) -> Result<(), String> {
    emit(&store, "ThemeChanged", json!({
        "from_theme_id": from_theme_id,
        "to_theme_id": to_theme_id,
    }))
}

// Frontend wire-up: call this command after gwells exposes a convergence
// signal. GWRuntimeState currently has no "settled" variant (v0.1.5 comment:
// "Future profile/runtime work may add idle, settled states"). When gwells
// adds convergence detection, mount a side-effect in SigmaGraphView that
// reads node_count from the graph and duration_ms from a start-time ref.
#[tauri::command]
pub fn lw_emit_graph_layout_settled(
    store: State<'_, LwEventStore>,
    node_count: u32,
    duration_ms: u32,
) -> Result<(), String> {
    emit(&store, "GraphLayoutSettled", json!({
        "node_count": node_count,
        "duration_ms": duration_ms,
    }))
}
