use crate::ide::get_project_root_inner;

// Security invariant: path must canonicalize within the project root.
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    let root = get_project_root_inner()?;
    let canonical_root = std::fs::canonicalize(&root)
        .map_err(|e| format!("Cannot canonicalize root: {e}"))?;
    let candidate = std::path::Path::new(&root).join(&path);
    let canonical_path = std::fs::canonicalize(&candidate)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    if !canonical_path.starts_with(&canonical_root) {
        return Err(format!("Path escapes project root: {path}"));
    }
    std::fs::read_to_string(&canonical_path)
        .map_err(|e| format!("Read failed: {e}"))
}
