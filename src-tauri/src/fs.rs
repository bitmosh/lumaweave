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

// Security invariant: script must be in ALLOWED_SCRIPTS; runs as node <script> [args];
// timeout 60s; stdout/stderr each capped at 10 MB.
const ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"];
const OUTPUT_CAP_BYTES: usize = 10 * 1024 * 1024;
const TIMEOUT_SECS: u64 = 60;

#[derive(serde::Serialize)]
pub struct ScriptResult {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[tauri::command]
pub async fn run_script(script: String, args: Vec<String>) -> Result<ScriptResult, String> {
    if !ALLOWED_SCRIPTS.contains(&script.as_str()) {
        return Err(format!("Script not in allowlist: {script}"));
    }
    let root = get_project_root_inner()?;
    let canonical_root = std::fs::canonicalize(&root)
        .map_err(|e| format!("Cannot canonicalize root: {e}"))?;
    let candidate = std::path::Path::new(&root).join(&script);
    let canonical_script = std::fs::canonicalize(&candidate)
        .map_err(|e| format!("Cannot canonicalize script: {e}"))?;
    if !canonical_script.starts_with(&canonical_root) {
        return Err(format!("Script escapes project root: {script}"));
    }

    // Synchronous Command::output wrapped in spawn_blocking, wrapped in timeout.
    let handle = tokio::task::spawn_blocking(move || {
        std::process::Command::new("node")
            .arg(&canonical_script)
            .args(&args)
            .output()
    });
    let output = tokio::time::timeout(
        std::time::Duration::from_secs(TIMEOUT_SECS),
        handle,
    )
    .await
    .map_err(|_| format!("Script timeout after {TIMEOUT_SECS}s"))?
    .map_err(|e| format!("spawn_blocking failed: {e}"))?
    .map_err(|e| format!("Command failed: {e}"))?;

    if output.stdout.len() > OUTPUT_CAP_BYTES {
        return Err(format!("stdout exceeded cap of {OUTPUT_CAP_BYTES} bytes"));
    }
    if output.stderr.len() > OUTPUT_CAP_BYTES {
        return Err(format!("stderr exceeded cap of {OUTPUT_CAP_BYTES} bytes"));
    }

    Ok(ScriptResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}
