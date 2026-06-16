# Bandit — v109.0.3: list_files + read_vault_file Tauri commands + DirectoryAdapter wiring

Third commit of the v109.0 platform pass. Adds the new Tauri filesystem commands that support user-configured (non-project-root) directory access — the prerequisite for the markdown-vault adapter in v109.1. Wires `DirectoryAdapter.listFiles()` and `readVaultFile()` to the new commands. No new dependencies; pure Rust + frontend.

This is the security-surface widening commit. The validation pattern from v108 (`read_file`'s `canonicalize → starts_with`) extends to per-adapter user-configured roots instead of the project root. Same audit-by-eyeball discipline applies.

Basis: `~/Projects/future-integration/SDK_SPEC.md` §4 (Family Bases) + v109.0.1 commit (`087a10e`) + v109.0.2 commit (`d26039b`).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`. ONE commit this pass.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (v109 arc-close bumps minor at v109.5).

## Targeted test scope for this commit

- `tests/e2e/graph-sources.spec.ts` — Regenerate flow still works (the only Tauri-invoking spec via the existing __lwTauriMock shim)
- `tests/e2e/source-adapter.spec.ts` — adapter panel still functions
- Plus: `cargo build` / `cargo check` in `src-tauri/` — the Rust changes must compile clean

NO full-suite run. If anything in the target scope goes red: STOP and report.

## Security: the v108 audit-by-eyeball discipline applies
This widens the filesystem-access surface. The Rust must stay small enough that you (and Ryan) can eyeball-audit it.
- No `tauri-plugin-fs`. Manual validation only.
- Per-adapter root from caller (frontend), not project root.
- `canonicalize → starts_with(canonical_root)` is the load-bearing safety check.
- Symlinks NOT followed (prevents loops; prevents escape via symlink to /etc/).
- Max depth cap (default 20, hard cap 50).
- Defense-in-depth canonicalize on every yielded file path (catches TOCTOU edge cases).
- Total new Rust: ~80 lines for both commands combined. If the implementation grows much beyond that, something has gone wrong.

## Locked decisions carried in
- Caller-supplied root (passed from frontend) — NOT project root. This is the v108-D1 deferred decision now resolved.
- Manual `std::fs::read_dir` recursion. NOT `walkdir` (no new crate dep).
- Tokio's `time` feature stays from v108; no Cargo.toml changes this commit.
- Caller responsible for ensuring the root path is actually a user-trusted location (settings UI in v109.0.4 handles the persistence; the Rust just validates structurally).

## Pre-flight (verify, report, STOP if anything diverges)
1. Confirm v109.0.2 (commit `d26039b`) is on HEAD.
2. Confirm the v108 `read_file` command shape in `src-tauri/src/fs.rs` — quote the `canonicalize → starts_with` lines. This is the pattern we're paralleling.
3. Confirm `src-tauri/src/lib.rs` currently registers `read_file` + `run_script` in `invoke_handler!`. We'll add two more.
4. Confirm the Tauri invoke wrapper location (likely `src/lib/tauriInvoke.ts` from v108.0.2). Quote the existing pattern.
5. Confirm `tokio = { version = "1", features = ["time"] }` is already in `src-tauri/Cargo.toml` from v108. **STOP if any Cargo.toml change appears needed.**
6. Confirm `directoryAdapter.ts` from v109.0.1 currently has the throwing stubs we'll replace.

## Files to commit (explicit paths only)

- `src-tauri/src/fs.rs` — add `list_files` + `read_vault_file` commands
- `src-tauri/src/lib.rs` — register the two new commands in `invoke_handler!`
- `src/lib/tauriInvoke.ts` (confirm exact path in pre-flight) — add typed wrappers `invokeListFiles` + `invokeReadVaultFile`
- `src/source-adapter/directoryAdapter.ts` — replace the throwing stubs with real implementations calling the typed wrappers

DO NOT touch any other file. Hard stop if scope creep.

## Implementation — `list_files`

```rust
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
    let depth_cap = max_depth.unwrap_or(20).min(50);  // hard cap 50
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
        if exclude_prefixes.iter().any(|p| name_str.starts_with(p)) { continue; }
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
```

Keep the security comments at the top as documentation. Don't optimize out the defense-in-depth canonicalize — it's intentional even if redundant in the common case.

## Implementation — `read_vault_file`

```rust
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
```

Register both in `lib.rs` alongside the existing `read_file` + `run_script`:
```rust
.invoke_handler(tauri::generate_handler![
    // existing commands ...
    fs::read_file,
    fs::run_script,
    fs::list_files,
    fs::read_vault_file,
])
```

## Implementation — frontend wrappers

In the Tauri invoke wrapper file (confirm path in pre-flight). Add typed wrappers that pass through the existing mock-shim path from v108.0.2:

```typescript
export async function invokeListFiles(
  root: string,
  extensions: string[],
  excludePrefixes: string[],
  maxDepth?: number,
): Promise<string[]> {
  return invoke<string[]>("list_files", { root, extensions, excludePrefixes, maxDepth });
}

export async function invokeReadVaultFile(
  root: string,
  relativePath: string,
): Promise<string> {
  return invoke<string>("read_vault_file", { root, relativePath });
}
```

These go through the same `invoke()` wrapper that has the `__lwTauriMock` shim — so E2E tests in v109.1+ can mock these.

## Implementation — `DirectoryAdapter` wiring

Replace the v109.0.1 throwing stubs with real calls:

```typescript
// In directoryAdapter.ts — replace stubs from v109.0.1
import { invokeListFiles, invokeReadVaultFile } from "../lib/tauriInvoke";

abstract class DirectoryAdapter implements BaseSourceAdapter {
  // ... existing abstract fields ...

  protected async listFiles(
    root: string,
    extensions: string[],
    excludePrefixes: string[],
  ): Promise<string[]> {
    return invokeListFiles(root, extensions, excludePrefixes, 20);
  }

  protected async readVaultFile(root: string, relativePath: string): Promise<string> {
    return invokeReadVaultFile(root, relativePath);
  }

  abstract load(config: AdapterConfig): Promise<GraphSourceSummary>;
}
```

The depth cap of 20 is the Rust default; frontend passes it explicitly so the contract is visible at the call site.

## Verify (targeted scope)

```
cd src-tauri && cargo check
cd ..
npm run typecheck
npx playwright test tests/e2e/graph-sources.spec.ts --reporter=line
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
```

Expected:
- `cargo check` → 0 errors, 0 warnings (or pre-existing warnings only; nothing new)
- typecheck → 0 errors
- graph-sources.spec.ts → all 4 tests pass (no behavior change; Regenerate still works through the existing read_file path)
- source-adapter.spec.ts → all 9 tests pass (panel surface unchanged)

**Manual smoke (Ryan, `npm run tauri dev`):**
- App starts. Self-graph still loads (uses `read_file`, not the new commands).
- No visible change in the UI (DirectoryAdapter has no concrete users yet — that's v109.1).
- Open devtools console: no errors.
- Open the Tauri devtools / Rust logs if possible: no warnings about the new commands.

**Optional smoke test of the new commands** (Ryan, if you want extra confidence):
- In devtools console, run:
  ```javascript
  await __TAURI_INTERNALS__.invoke("list_files", { root: "/tmp", extensions: [], excludePrefixes: [".git"], maxDepth: 2 });
  ```
  Should return an array of relative paths (whatever's in /tmp). No error.
- Try an invalid root: `await __TAURI_INTERNALS__.invoke("list_files", { root: "/does/not/exist", extensions: [], excludePrefixes: [] });` → should return a clear error string, not crash.
- Try a traversal attempt: `await __TAURI_INTERNALS__.invoke("read_vault_file", { root: "/tmp", relativePath: "../etc/passwd" });` → should return a "Path escapes root" error. **This is the critical security test.** If this returns file contents instead of an error, STOP and report — the validation is broken.

## Commit
- MERGE GATE → commit (explicit paths only — list above): `feat(v109.0.3): list_files + read_vault_file Tauri commands + DirectoryAdapter wiring`
- END-OF-RUN REPORT to #changelog + bump+push gate.

## END-OF-RUN REPORT (#changelog)
- Files committed (explicit list).
- Pre-flight findings (HEAD state, v108 fs.rs pattern confirmed, Cargo.toml unchanged).
- Verification results: cargo check, typecheck, targeted E2E.
- Manual smoke notes (confirm the optional security test if Ryan ran it).
- Total new Rust line count (sanity check it's ~80 lines as expected).
- Any divergences from prompt.

## Hard stops
- **Targeted-test-scope only.** No full-suite run.
- No installs. No new Rust crates (no `walkdir`, no `tauri-plugin-fs`, no `tauri-plugin-shell`). No new npm packages.
- If `Cargo.toml` needs ANY change, STOP and ask Ryan. The pre-flight check for tokio's `time` feature is the only Cargo.toml-adjacent check; everything else in this commit uses `std::fs`.
- No new dependencies. Explicit-path git (NEVER `git add -A`). Discord MCP only.
- No semver bump.
- **The Rust must stay reviewable by eyeball.** If you find yourself writing more than ~80-100 lines total for both new commands, something is wrong — STOP and report.
- **DO NOT follow symlinks.** The `metadata.file_type().is_symlink()` check must skip them. Following symlinks creates traversal escapes and infinite loops.
- **DO NOT optimize away the defense-in-depth canonicalize-on-each-file.** It's intentional; the security comment documents why.
- **DO NOT add `walkdir` or any directory-traversal crate.** Manual `std::fs::read_dir` recursion is what we're shipping.
- If the optional traversal-attack security smoke test (the `../etc/passwd` one) returns file contents instead of an error: STOP, do not commit, report immediately. That's a critical vulnerability.
