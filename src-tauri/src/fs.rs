// SPDX-License-Identifier: Apache-2.0
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

// Security: caller provides a user-configured root; we validate every yielded path
// is canonical and within that root. No symlink-following. Capped recursion depth.
// Defense-in-depth: canonicalize-on-each-file catches TOCTOU edge cases where
// a directory is replaced by a symlink between read_dir and the file check.
#[tauri::command]
pub async fn list_files(
    root: String,
    extensions: Vec<String>,
    exclude_prefixes: Vec<String>,
    max_depth: Option<u32>,
) -> Result<Vec<String>, String> {
    let canonical_root = std::fs::canonicalize(&root)
        .map_err(|e| format!("Cannot canonicalize root: {e}"))?;
    if !canonical_root.is_dir() {
        return Err(format!("Root is not a directory: {root}"));
    }
    let depth_cap = max_depth.unwrap_or(20).min(50); // hard cap 50
    let mut results = Vec::new();
    walk(&canonical_root, &canonical_root, &extensions, &exclude_prefixes, depth_cap, 0, &mut results)?;
    Ok(results)
}

fn walk(
    canonical_root: &std::path::Path,
    current: &std::path::Path,
    extensions: &[String],
    exclude_prefixes: &[String],
    depth_cap: u32,
    depth: u32,
    out: &mut Vec<String>,
) -> Result<(), String> {
    if depth > depth_cap { return Ok(()); }
    let entries = std::fs::read_dir(current)
        .map_err(|e| format!("Read dir failed: {e}"))?;
    for entry in entries {
        let entry = entry.map_err(|e| format!("Entry read failed: {e}"))?;
        let path = entry.path();
        let file_name = entry.file_name();
        let name_str = file_name.to_string_lossy();
        // Skip if name starts with any exclude prefix
        if exclude_prefixes.iter().any(|p| name_str.starts_with(p.as_str())) { continue; }
        // Skip symlinks entirely (no follow, no record)
        let metadata = entry.metadata().map_err(|e| format!("Metadata failed: {e}"))?;
        if metadata.file_type().is_symlink() { continue; }
        if metadata.is_dir() {
            walk(canonical_root, &path, extensions, exclude_prefixes, depth_cap, depth + 1, out)?;
        } else if metadata.is_file() {
            // Extension filter (empty list = accept all)
            if !extensions.is_empty() {
                let ext_match = path.extension()
                    .and_then(|e| e.to_str())
                    .map(|e| extensions.iter().any(|allowed| allowed == e))
                    .unwrap_or(false);
                if !ext_match { continue; }
            }
            // Defense-in-depth: canonicalize the file and re-check scope
            let canonical_path = std::fs::canonicalize(&path)
                .map_err(|e| format!("Canonicalize failed: {e}"))?;
            if !canonical_path.starts_with(canonical_root) {
                return Err(format!("Path escapes root: {}", path.display()));
            }
            // Return path relative to root (don't expose absolute paths to frontend)
            let relative = canonical_path.strip_prefix(canonical_root)
                .map_err(|e| format!("Strip prefix failed: {e}"))?
                .to_string_lossy()
                .to_string();
            out.push(relative);
        }
        // Anything else (block device, fifo, etc.) silently skipped
    }
    Ok(())
}

// Security: caller supplies absolute path. Validate: canonicalizable,
// regular file (not directory/device), not a symlink. NO scope restriction —
// the user picked the file via the form; we trust that intent.
#[tauri::command]
pub async fn read_user_file(path: String) -> Result<String, String> {
    let canonical = std::fs::canonicalize(&path)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    // Reject symlinks (caller could have specified one; canonicalize follows them,
    // but we want to reject even reaching the file through a symlink).
    let metadata = std::fs::symlink_metadata(&path)
        .map_err(|e| format!("Cannot stat path: {e}"))?;
    if metadata.file_type().is_symlink() {
        return Err(format!("Symlinks not permitted: {path}"));
    }
    let final_metadata = std::fs::metadata(&canonical)
        .map_err(|e| format!("Cannot stat canonical path: {e}"))?;
    if !final_metadata.is_file() {
        return Err(format!("Not a regular file: {path}"));
    }
    std::fs::read_to_string(&canonical)
        .map_err(|e| format!("Read failed: {e}"))
}

// Same shape as read_file but validates against a user-configured root, not project_root.
#[tauri::command]
pub async fn read_vault_file(root: String, relative_path: String) -> Result<String, String> {
    let canonical_root = std::fs::canonicalize(&root)
        .map_err(|e| format!("Cannot canonicalize root: {e}"))?;
    let candidate = canonical_root.join(&relative_path);
    let canonical_path = std::fs::canonicalize(&candidate)
        .map_err(|e| format!("Cannot canonicalize path: {e}"))?;
    if !canonical_path.starts_with(&canonical_root) {
        return Err(format!("Path escapes root: {relative_path}"));
    }
    std::fs::read_to_string(&canonical_path)
        .map_err(|e| format!("Read failed: {e}"))
}
