// SPDX-License-Identifier: Apache-2.0
use tauri_plugin_opener::OpenerExt;
use std::env;
use std::path::PathBuf;

/// Shared helper: resolves the project root as an absolute PathBuf.
/// Pops src-tauri/ from CWD when running under `tauri dev`.
pub fn get_project_root_inner() -> Result<PathBuf, String> {
    let cwd = env::current_dir()
        .map_err(|e| format!("Failed to get project root: {}", e))?;

    // Under `tauri dev`, Rust process CWD is src-tauri/; otherwise it's already the root.
    if cwd.file_name()
        .and_then(|name| name.to_str())
        .map(|s| s == "src-tauri")
        .unwrap_or(false)
    {
        cwd.parent()
            .map(|p| p.to_path_buf())
            .ok_or_else(|| "src-tauri parent is invalid".to_string())
    } else {
        Ok(cwd)
    }
}

#[tauri::command]
pub fn get_project_root() -> Result<String, String> {
    get_project_root_inner()?
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Project root path is not valid UTF-8".to_string())
}

#[tauri::command]
pub async fn open_in_ide(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}
