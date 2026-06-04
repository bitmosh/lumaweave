use tauri_plugin_opener::OpenerExt;
use std::env;

#[tauri::command]
pub fn get_project_root() -> Result<String, String> {
    let cwd = env::current_dir()
        .map_err(|e| format!("Failed to get project root: {}", e))?;

    // If CWD is src-tauri/, pop to parent (project root).
    // Under `tauri dev`, Rust process CWD is src-tauri/; otherwise it's already the root.
    let root = if cwd.file_name()
        .and_then(|name| name.to_str())
        .map(|s| s == "src-tauri")
        .unwrap_or(false)
    {
        cwd.parent()
            .map(|p| p.to_path_buf())
            .ok_or_else(|| "src-tauri parent is invalid".to_string())?
    } else {
        cwd
    };

    root.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Project root path is not valid UTF-8".to_string())
}

#[tauri::command]
pub async fn open_in_ide(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}
