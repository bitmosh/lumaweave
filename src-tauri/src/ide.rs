use tauri_plugin_opener::OpenerExt;
use std::env;

#[tauri::command]
pub fn get_project_root() -> Result<String, String> {
    env::current_dir()
        .map_err(|e| format!("Failed to get project root: {}", e))
        .and_then(|path| {
            path.to_str()
                .ok_or_else(|| "Project root path is not valid UTF-8".to_string())
                .map(|s| s.to_string())
        })
}

#[tauri::command]
pub async fn open_in_ide(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}
