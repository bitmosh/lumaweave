mod cerebra_watcher;
mod events;
mod fs;
mod ide;
pub mod inference;

use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let event_store = ide::get_project_root_inner()
        .map(|root| events::init(&root))
        .unwrap_or_else(|e| {
            eprintln!("[lumaweave] could not resolve project root for fossic store: {e}");
            events::LwEventStore::unavailable()
        });

    let watcher = Arc::new(cerebra_watcher::CerebraWatcher::new());
    let watcher_for_setup = Arc::clone(&watcher);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(event_store)
        .manage(watcher)
        .setup(move |app| {
            cerebra_watcher::start(app.handle().clone(), watcher_for_setup);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ide::get_project_root,
            ide::open_in_ide,
            fs::read_file,
            fs::read_user_file,
            fs::run_script,
            fs::list_files,
            fs::read_vault_file,
            inference::commands::chat,
            inference::commands::test_inference_connection,
            events::lw_emit_source_loaded,
            events::lw_emit_source_load_failed,
            events::lw_emit_source_switched,
            events::lw_emit_theme_changed,
            events::lw_emit_graph_layout_settled,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
