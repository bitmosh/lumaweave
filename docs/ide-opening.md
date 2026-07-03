# IDE Opening — Bug Diagnosis & Fix Plan

Covers why "Open in editor" in the Code spoke doesn't reliably open the file at the specified line, with fixes ordered by impact.

**Audited:** 2026-06-03  
**Files:** `src/control-plane/ide/installOpenInIdeListener.ts`, `src/control-plane/ide/editorTemplateRegistry.ts`, `src/control-plane/inspector/spokes/CodeTab.tsx`, `src-tauri/src/ide.rs`, `src/control-plane/settings/settings.defaults.ts`

---

## Call Chain

```
CodeTab.tsx — user clicks "Open in editor"
  ↓
window.dispatchEvent(CustomEvent "inspector:open-in-ide", { filePath, lineNumber })
  ↓
installOpenInIdeListener.ts
  getProjectRoot()  → Tauri invoke "get_project_root" → env::current_dir() in Rust
  resolveAbsolutePath(filePath, projectRoot)
  buildEditorUrl(preferredEditor, absolutePath, lineNumber)
    → e.g. "vscode://file//~/Projects/lumaweave/src/app/AppShell.tsx:381"
  invoke("open_in_ide", { url })
  ↓
ide.rs — open_in_ide Tauri command
  app.opener().open_url(&url, None)
  ↓
Linux: xdg-open vscode://file//home/.../AppShell.tsx:381
  → requires code-url-handler.desktop to be registered with xdg-open
  → VS Code (hopefully) opens the file at line 381
```

The URL format and line numbers are correct. The failure is in the system-level plumbing.

---

## Bug 1 — Primary cause: `open_url` is fire-and-forget, failure is invisible

**File:** `src-tauri/src/ide.rs:16–20`

```rust
pub async fn open_in_ide(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}
```

`tauri_plugin_opener::open_url` on Linux spawns `xdg-open` as a **detached process**. Detached means it returns `Ok(())` the moment the subprocess is spawned — it does not wait for the exit code. Whether `xdg-open` found a handler, whether VS Code's URL handler is registered, whether the file was actually opened — none of that is reflected in the return value.

The Tauri command returns success. The JS `invoke()` doesn't throw. No `console.error`. No UI feedback. The user clicks the button and nothing happens, with zero indication of why.

Additionally, `xdg-open vscode://file//path:line` requires VS Code's `code-url-handler.desktop` to be separately registered (distinct from `code.desktop`). When installed via Snap, Flatpak, or some package managers, this registration may be absent or broken. The whole feature silently no-ops every time.

**Severity:** Critical — the primary reason the feature appears completely broken.

---

## Bug 2 — `file://` fallback silently drops the line number

**File:** `src/control-plane/ide/installOpenInIdeListener.ts:69–71`

```typescript
const fileUrl = `file://${absolutePath}`;
await invoke("open_in_ide", { url: fileUrl });
```

This branch is hit when `buildEditorUrl` returns `null` — which happens for `vim`, `neovim`, and `system-default` (all have `urlTemplate: null`). The `file://` URL carries no line information. Whatever application opens the file does so at line 1.

If the user's `preferredEditor` is set to `system-default` for any reason, this is the exact symptom: "the file opens, but not at the specified line."

**Severity:** Major — directly causes the wrong-line symptom for null-template editors.

---

## Bug 3 — `customEditorTemplate` default is CLI syntax, not a URL

**File:** `src/control-plane/settings/settings.defaults.ts:100`

```typescript
customEditorTemplate: "code --goto {path}:{line}",
```

`buildEditorUrl` treats whatever the custom template produces as a URL string and passes it to `open_url`. If someone selects "custom" editor and leaves the default template, `open_url` receives:

```
"code --goto ~/Projects/lumaweave/src/app/AppShell.tsx:381"
```

This is a shell command, not a URL. `xdg-open` finds no handler for scheme `"code"` and fails. Tauri's `open_url` may return an error or silently fail depending on how `xdg-open` exits.

**Severity:** Major — custom editor selection is broken out of the box.

---

## Bug 4 — `get_project_root()` is `env::current_dir()`, unreliable outside dev mode

**File:** `src-tauri/src/ide.rs:5–13`

```rust
pub fn get_project_root() -> Result<String, String> {
    env::current_dir()
        // ...
}
```

`env::current_dir()` returns the Tauri process's working directory at spawn time. In `tauri dev` (started from the project root), this is the project root directory — correct. In a packaged or installed build, the CWD is wherever the binary lives or wherever the user launched from — wrong. `resolveAbsolutePath` would then compute a path that doesn't exist, and VS Code would fail to open the file or open a blank one.

**Severity:** Major in production builds, benign in dev mode.

---

## Fix Plan

### Fix 1 — Use VS Code CLI directly on Linux instead of URL scheme (highest impact)

**File:** `src-tauri/src/ide.rs`

Replace the `open_url` call with a direct `code --goto path:line` invocation for VS Code-family editors. This bypasses `xdg-open` and its URL handler registration requirements entirely. `code --goto` works as long as the editor binary is in `$PATH`, which is far more reliably true than URL handler registration.

```rust
use tauri_plugin_opener::OpenerExt;
use std::env;
use std::process::Command;

#[tauri::command]
pub async fn open_in_ide(app: tauri::AppHandle, url: String) -> Result<(), String> {
    // For VS Code-family editors: prefer direct CLI invocation over xdg-open URL scheme.
    // xdg-open requires code-url-handler.desktop to be registered, which is often missing
    // on Snap/Flatpak installs. CLI via --goto is reliable as long as the binary is in PATH.
    let cli_result = try_cli_open(&url);
    if cli_result.is_ok() {
        return Ok(());
    }

    // Fallback: open_url for other editors or if CLI binary not found
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| format!("open_url failed: {}; cli also failed: {:?}", e, cli_result))
}

fn try_cli_open(url: &str) -> Result<(), String> {
    let (binary, path_and_line) = if let Some(rest) = url.strip_prefix("vscode://file/") {
        ("code", rest.trim_start_matches('/'))
    } else if let Some(rest) = url.strip_prefix("cursor://file/") {
        ("cursor", rest.trim_start_matches('/'))
    } else if let Some(rest) = url.strip_prefix("windsurf://file/") {
        ("windsurf", rest.trim_start_matches('/'))
    } else {
        return Err("not a supported CLI editor URL".to_string());
    };

    Command::new(binary)
        .arg("--goto")
        .arg(path_and_line)
        .spawn()
        .map(|_| ())
        .map_err(|e| format!("{} --goto failed: {}", binary, e))
}
```

`trim_start_matches('/')` handles the double-slash artifact from the URL template (`vscode://file//home/...` → strips leading `//` → `/home/...`).

---

### Fix 2 — Surface errors to the user

**File:** `src/control-plane/ide/installOpenInIdeListener.ts`

When `invoke("open_in_ide", ...)` throws, currently only `console.error` fires. The user sees nothing.

```typescript
} catch (err) {
  if (err instanceof Error && err.message.includes("Failed to get project root")) {
    return; // Not in Tauri context — expected in browser/Playwright
  }
  console.error("[open-in-ide] failed:", err);
  // TODO: show a visible error — toast notification or status bar message
  // e.g.: window.dispatchEvent(new CustomEvent("lw:notify-error", {
  //   detail: { message: `Could not open in editor: ${err}` }
  // }))
}
```

At minimum, the error message from the Rust command now includes both the CLI failure and the `open_url` failure reason (from Fix 1), so the console output is actionable.

---

### Fix 3 — Fix the `customEditorTemplate` default

**File:** `src/control-plane/settings/settings.defaults.ts`

The default is a CLI command, not a URL. Two options:

**Option A:** Change the default to a URL template example:
```typescript
customEditorTemplate: "vscode://file{path}:{line}",
```

**Option B:** Document in the settings UI that custom templates must be URL schemes (e.g., `myeditor://file/{path}:{line}`), and change the default to an empty string or a commented example. The CLI invocation path (Fix 1) does not apply to custom templates since the binary name is unknown.

---

### Fix 4 — Warn when `file://` fallback drops line number

**File:** `src/control-plane/ide/installOpenInIdeListener.ts`

```typescript
} else {
  // vim, neovim, system-default — no URL scheme, no line number
  console.warn(
    "[open-in-ide] editor has no URL scheme — opening without line number.",
    "Switch to a URL-scheme editor (vscode, cursor, windsurf) to land on the right line."
  );
  const fileUrl = `file://${absolutePath}`;
  await invoke("open_in_ide", { url: fileUrl });
}
```

The line number is unrecoverable in a bare `file://` URL. The fix for vim/neovim/system-default is a separate `invoke_editor_cli` Tauri command that runs the editor with its native CLI args, but that's a separate feature.

---

### Fix 5 — Make `get_project_root()` reliable outside dev mode

**File:** `src-tauri/src/ide.rs` + `src/control-plane/ide/installOpenInIdeListener.ts`

Instead of relying on the Rust process's CWD, pass the project root from the frontend. The frontend knows the provenance manifest path, which is always relative to the project root. The app's `import.meta.url` or a Vite env variable can provide the root at build time.

Short-term: document that the feature only works correctly when the Tauri app is run from the project root (i.e., `npm run tauri dev`).

Long-term: expose `VITE_PROJECT_ROOT` as a build-time env var and read it in the listener instead of calling `get_project_root()`.

---

## Summary

| Bug | Symptom | Fix |
|---|---|---|
| `open_url` fire-and-forget — xdg-open failure invisible | Nothing happens, no feedback | Fix 1: use `code --goto` CLI directly |
| `file://` fallback drops line number | File opens at line 1 | Fix 4: warn; separate CLI command is future work |
| `customEditorTemplate` default is CLI syntax | Custom editor broken out of box | Fix 3: change default to URL template |
| `get_project_root()` = CWD | Wrong absolute path in packaged builds | Fix 5: pass root from frontend |
| No UI error feedback | User doesn't know what failed | Fix 2: surface errors visibly |

**Minimum to fix the reported symptom:** Fix 1 (CLI invocation) + Fix 2 (error visibility). Everything else is secondary.
