# v108 Source Adapters Tier 1 — Investigation Report

**Investigator:** Terminal Claude  
**Date:** 2026-06-05  
**Basis:** `INVESTIGATION_v108_source_adapters_tier1.md` + live code reads  
**No code changes were made during this investigation.**

---

## §1 — Tier 0 Outcome Verification

All five assertions hold.

**1. `loadSource` exists with dispatch logic.**  
`src/graph/ingest/loadSource.ts:124–152`. Exported `async function loadSource(adapterId: string | null, inputPath: string)` guards null → error, unknown adapter → error, non-registered → error, then routes `"self-graph-yaml-frontmatter"` explicitly to `loadSelfGraph(inputPath)`. A fallback error covers any future registered adapter without a loader yet (`:150–152`).

**2. `useGraphSourceSummary` reads `settings.sources.active` and re-fires on change.**  
`src/graph/ingest/useGraphSourceSummary.ts:26–30` selects `activeAdapterId` and `inputPath` from the store. The `useEffect` dependency array is `[activeAdapterId, inputPath]` at `:66`. Source switch re-triggers immediately.

**3. `SourceAdapterPanel` has a "Set as active" button per registered entry.**  
`src/source-adapter/SourceAdapterPanel.tsx:187–196`. Button rendered only when `entry.status === "registered"` (`isRegistered`), disabled when `entry.adapterId === activeAdapterId`. `data-testid="source-adapter-set-active-{slugify(adapterId)}"`.

**4. `sources.active` defaults to `"self-graph-yaml-frontmatter"` on a clean install.**  
`src/control-plane/settings/settings.defaults.ts:3–6`: `defaultSources = { active: "self-graph-yaml-frontmatter", configurations: {} }`. Wired into `defaultSettings.sources` at `:149`.

**5. `loadGraphifySource.ts` is fully deleted — no shim.**  
`git log --all --oneline -- src/graph/ingest/loadGraphifySource.ts` returns `8a796ac feat(v107.0.2): loadSource...` as the last commit referencing it, with `f16fc00` as the earlier baseline. The file does not exist in the working tree or any current import. Deletion is clean.

**Verdict:** Tier 0 is sound. Tier 1 planning can proceed.

---

## §2 — Where Tier 1 Plugs In

**1. The dispatch in `loadSource.ts`.**  
`src/graph/ingest/loadSource.ts:146–148`:
```typescript
if (adapterId === "self-graph-yaml-frontmatter") {
  return loadSelfGraph(inputPath);
}
```
This is a named string dispatch — not a universal default. The fixture fetch lives entirely inside `loadSelfGraph` (`loadSource.ts:58–122`). Tier 1 modifies `loadSelfGraph`'s internals (replacing the HTTP fixture fetch with a Tauri `read_file` call) without touching the dispatch at all.

**2. Current self-graph fixture path is a static constant, and `inputPath` is currently ignored.**  
`loadSource.ts:9`: `const SELF_GRAPH_PUBLIC_BASE = "/examples/ai-lab/graphify-out"`. The function signature is `loadSelfGraph(_inputPath: string)` (underscore prefix, line `:58`) — the `inputPath` argument is received but unused. Tier 1 activates this parameter.

Confirming the 404: `public/examples/` does not exist in the working tree. The fixture fetch always fails with a network 404 on `/examples/ai-lab/graphify-out/graph.json`. The app falls back to the fixture at `src/fixtures/self-graph-generated.json` via AppShell's `hasRealSource` guard (fixture fallback when `summary.normalizedNodes` is null).

**3. `inputPath` shape recommendation for self-graph.**  
The current schema (`settings.schema.ts`) stores `configurations: Record<string, { inputPath?: string }>`. For self-graph, `inputPath` should be an **absolute path to the project root** — not a relative path. Reasoning: `generate-self-graph.mjs` writes its output to `src/fixtures/self-graph-generated.json` relative to `repoRoot` (script line `:18`). The Rust `read_file` command will need an absolute path to read it.

**Recommended convention:** At startup, if `configurations["self-graph-yaml-frontmatter"].inputPath` is empty, call the existing `get_project_root()` Tauri command and cache the result into settings. The `loadSelfGraph` function then receives this path and constructs `{inputPath}/src/fixtures/self-graph-generated.json` at call time. This avoids calling `get_project_root()` on every graph load.

**4. `GraphSourcesTileContent` location and structure.**  
`src/control-plane/graph-sources/GraphSourcesTileContent.tsx:1–42`. The component is 42 lines with no buttons, no actions. Current structure:
```
<div lw-graph-sources-tile>           ← outer
  <div space-y-3 p-1>                 ← inner
    <div rounded-xl border>           ← status card
      summary.label                   ← source name
      summary.sourcePath              ← optional path display
      status badge                    ← "loading"/"loaded"/"error"/etc.
      <div space-y-1>                 ← stats rows
        Raw nodes / edges
        Normalized nodes / edges
      </div>
    </div>
  </div>
</div>
```
The "Regenerate" button fits cleanly as a new row inside the status card, after the stats block and before the card closes. There is no existing action surface to conflict with.

**5. The self-graph generator script.**  
`scripts/generate-self-graph.mjs`. Reads all `docs/**/*.md`, `src/**/*.{ts,tsx,mjs,js}`, and a hardcoded CONFIG_FILES list; builds nodes (doc/code/config/fixture/spine/directory types), extracts edges (code-import, wiki-link, markdown-link, tag-overlap, describes, contains, governs, explicit-reference); enforces a per-node tag-overlap cap; writes three output files to hardcoded absolute paths (`script:17–21`):
- `src/fixtures/self-graph-generated.json` — the main graph (used by `loadSelfGraph` in Tier 1)
- `src/fixtures/self-graph-manifest.json` — health metadata
- `src/fixtures/GRAPH_REPORT.md` — human-readable stats

All three output paths are relative to `repoRoot` (script `:14`), which is `path.resolve(__dirname, "..")` — the project root. Output location is therefore predictable and stable.

---

## §3 — Tauri 2 Filesystem Access

_Claims in this section marked (docs) are from Tauri 2 official documentation at https://v2.tauri.app/plugin/file-system/. Claims marked (cached) are from training data and should be verified against current docs before implementation._

### 3.1 `tauri-plugin-fs` Route

**Does it exist?** Yes. `tauri-plugin-fs` is the canonical filesystem-access plugin for Tauri 2. (docs) Official plugin page: https://v2.tauri.app/plugin/file-system/

**Current status in LumaWeave:** NOT installed. `src-tauri/Cargo.toml:21` shows only `tauri = "2"`, `tauri-plugin-opener = "2"`, `serde`, `serde_json`. Adding `tauri-plugin-fs` requires Ryan's per-install sign-off per CLAUDE.md package-install safeguard.

**Scope configuration example.** (docs) In `src-tauri/capabilities/default.json`, you'd add a scope entry:
```json
{
  "permissions": [
    "core:default",
    "opener:default",
    "fs:read-text-file",
    {
      "identifier": "fs:scope",
      "allow": [{ "path": "$APPDATA/**" }, { "path": "$HOME/Projects/lumaweave/**" }]
    }
  ]
}
```
The `$APPDATA` variables resolve at runtime. For a project-relative scope, you'd need to either hardcode the project root (fragile) or use a runtime capability scope update API.

**Path normalization by the plugin.** (cached — verify against docs) The `tauri-plugin-fs` plugin normalizes paths before scope-checking, resolving `..` traversal. Symlink resolution behavior: `canonicalize` is called before scope-check, so symlinks pointing outside the allowed scope are caught. Recommend verifying this in the current v2 docs before relying on it.

**Frontend API surface.** (cached) The plugin exposes:
- `readTextFile(path: string, options?: { baseDir?: BaseDirectory }): Promise<string>`
- `readDir(path: string, options?: { baseDir?: BaseDirectory }): Promise<DirEntry[]>`
- `stat(path: string): Promise<FileInfo>`
- `exists(path: string): Promise<boolean>`
- `BaseDirectory` enum for well-known system directories (AppData, Home, etc.)

**Tradeoff analysis:**

| | `tauri-plugin-fs` |
|---|---|
| **Cost** | New Rust + JS dependency (requires Ryan's per-install approval); capability config learning curve; scope declarations must enumerate allowed paths at build time (project root is dynamic — requires runtime scope API or broad allow) |
| **Gain** | Battle-tested path normalization + scope enforcement maintained by Tauri team; no custom Rust to write or audit; future adapters (markdown-vault, git-codebase) can reuse the same plugin |
| **Fit for Tier 1** | Poor — scope declarations are static; project root is dynamic (different per machine). You'd need `$HOME/**` which is essentially no scope at all, or the runtime scope update API which adds more complexity. |
| **Fit for Tier 2+** | Better — when adapters read user-specified vault paths, the plugin handles the path safety automatically |

### 3.2 Manual Path Validation in Rust

**Robust `read_file` sketch:**
```rust
#[tauri::command]
async fn read_file(app: tauri::AppHandle, path: String) -> Result<String, String> {
    let root = get_project_root_inner()?; // reuse get_project_root logic
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
```

**Symlinks:** `canonicalize` follows all symlink hops before the `starts_with` check. A symlink at `src/fixtures/secret → ../../../../etc/shadow` would resolve to `/etc/shadow`, which does NOT start with the canonical project root, so the check catches it correctly. This is sound.

**Windows:** `std::fs::canonicalize` on Windows returns UNC-prefixed paths (`\\?\C:\...`). The `starts_with` comparison still works because both `canonical_root` and `canonical_path` are UNC-prefixed — they share the same prefix format. A Windows port needs integration testing but the logic is correct. (LumaWeave is currently Linux-only dogfood; this is a forward note only.)

**`list_files` sandbox approach:** Same pattern — canonicalize the `root` argument first, then for each file discovered via `std::fs::read_dir`, canonicalize its path and filter any that don't start with `canonical_root`. Return only the paths that pass the check.

**Tradeoff analysis:**

| | Manual Rust validation |
|---|---|
| **Cost** | More Rust to write and maintain; `canonicalize` panics if the file doesn't exist (must check existence before canonicalizing or handle the error); need to implement output cap and timeout manually |
| **Gain** | No new dependency; no per-install approval needed; scope is enforced per-call (project root at runtime, not build-time); the `get_project_root` function already exists in `ide.rs:5–26` and can be extracted to a shared helper |
| **Fit for Tier 1** | Good — only one file to read (`src/fixtures/self-graph-generated.json`); the validation is 10 lines of Rust |

### 3.3 Recommendation

**Use manual Rust validation for Tier 1.** Reasons:

1. `tauri-plugin-fs`'s scope declarations are static strings. The project root is dynamic. Using `$HOME/**` as the scope is equivalent to no scope. A runtime scope update API exists but adds ceremony that outweighs the benefit for a single known file.
2. Manual validation requires zero new dependencies (no per-install gate to block the arc).
3. The implementation is small. `get_project_root()` already resolves the root. The validator is ~10 lines.
4. For Tier 2 (markdown-vault, arbitrary user paths), revisit `tauri-plugin-fs` — at that tier, the plugin's scope-enforcement value increases because input paths are user-controlled and diverse.

**Hybrid future path:** Tier 1 uses manual validation for `read_file`. When Tier 2 lands and introduces `list_files` + `read_files_batch`, add `tauri-plugin-fs` then — the per-install approval is a one-time cost that unlocks multiple adapters.

**Difficulty:** LOW. `read_file` is ~15 lines of Rust reusing the existing `get_project_root` pattern.

**Per-install approval:** NOT required for Tier 1 (no new dependencies). Would be required if switching to `tauri-plugin-fs`.

---

## §4 — `run_script` — Highest-Risk Command

**1. What scripts does the allowlist need for Tier 1?**  
One script only: `scripts/generate-self-graph.mjs` (the full relative path from project root, as confirmed at `scripts/generate-self-graph.mjs:1`). The allowlist for Tier 1 is trivially a single-element constant:
```rust
const ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"];
```
No pattern matching needed. Hard-coded is correct here — the BANDIT spec explicitly requires a filename allowlist, not a pattern. A single entry eliminates the "any script in `scripts/`" attack surface.

**2. `tauri-plugin-shell` — does it exist?**  
(cached) Yes. `tauri-plugin-shell` is the official Tauri 2 shell/process plugin at https://v2.tauri.app/plugin/shell/. It provides a capability-config-gated `Command.create("node")` API on the frontend and `tauri_plugin_shell::init()` in the Tauri builder. The capability config can restrict which sidecar binaries and which shell commands are permitted.

Like `tauri-plugin-fs`, it is NOT currently in `Cargo.toml` and requires Ryan's per-install approval.

**Tradeoff for `tauri-plugin-shell` vs manual `std::process::Command`:**

| | `tauri-plugin-shell` | Manual `std::process::Command` |
|---|---|---|
| **Capability config** | Enforced at plugin level — binary allowlist in JSON | Manual allowlist in Rust — must implement yourself |
| **Frontend API** | `Command.create("node").args([scriptPath]).execute()` from JS/TS | Tauri invoke only (no JS-side Command object) |
| **stdout streaming** | Built-in — `spawn()` returns a `Child` with `stdout` event emitter | Manual channel or buffer; streaming requires `tokio::sync::mpsc` |
| **New dependency** | Yes — requires per-install approval | No |
| **Fit for Tier 1** | Overkill for one script. The per-install gate adds risk. | Correct fit. One allowed script, one `std::process::Command::new("node")`. |

**Recommendation:** Manual `std::process::Command` for Tier 1. The `tauri-plugin-shell` frontend API is attractive for multi-script scenarios (Tier 2+), but for one known script it adds a dependency without proportional gain.

**3. `Command` in Tauri 2 Rust.**  
Standard library `std::process::Command` — no Tauri-specific wrapper on the Rust side. The Tauri command is just a normal `#[tauri::command] async fn` that internally calls `std::process::Command::new("node").arg(script_path).args(extra_args).output()`. On async: wrap with `tokio::task::spawn_blocking` since `std::process::Command::output()` is synchronous (blocks the thread). (cached — verify Tauri 2's tokio version before using `spawn_blocking` directly.)

**4. stdout/stderr delivery — buffer vs stream.**  
**Recommendation: buffer.** The self-graph generator takes roughly 1–5 seconds on a typical codebase (file I/O + tag-overlap cap enforcement). Buffered invocation: the Tauri command awaits `output()`, returns `{ stdout, stderr, exit_code }` as a struct. The frontend shows "Regenerating…" while the Promise is pending, then transitions to success/error on resolution.

Streaming is more complex (requires Tauri events, a `spawn()` rather than `output()`, and frontend listener setup) and the UX benefit is marginal for a sub-10-second script. Defer streaming to a later arc when scripts that take 30+ seconds (git-codebase traversal) make it worth the complexity.

**5. Non-zero exit handling.**  
Return `Err(format!("Script exited with code {code}; stderr: {stderr}"))`. On the frontend, the Tauri invoke rejects, and the panel can surface the error. The last-good summary should remain visible — the error state is additive, not replacing.

**Rate: MEDIUM.** Path validation + allowlist + `spawn_blocking` + timeout (`tokio::time::timeout`) + output size cap (~10 MB) is 50–80 lines of Rust. Each component is straightforward but the combination requires care. The timeout integration is the subtlest part: `tokio::time::timeout(Duration::from_secs(60), spawn_blocking(...))` — the outer timeout wraps the blocking task future.

**Windows note (forward-only):** On Windows, `node` may not be in PATH when launched via Tauri. Running `cmd /c node scripts/...` would be needed. This is out of scope for LumaWeave's current Linux-only target but should be documented.

---

## §5 — Permission Grant Model

**1. Tauri 2 permission UX.**  
(cached — verify at https://v2.tauri.app/security/permissions/) Tauri 2's permission model is entirely **build-time capability config**. There is no automatic runtime system dialog for `fs` or `shell` plugin use. Permissions are declared in `capabilities/*.json` and compiled into the app. An unpermissioned command invocation returns an error; it does not prompt.

Current capability file `src-tauri/capabilities/default.json` confirms: only `"core:default"` and `"opener:default"` are declared. Any new command using `tauri-plugin-fs` or `tauri-plugin-shell` would require new entries here.

For manually-implemented Tauri commands (`#[tauri::command]`), there is no built-in permission gate — the command is callable as long as it's registered in `invoke_handler`. Access control is entirely within the Rust implementation.

**2. Is a runtime prompt appropriate?**  
No. LumaWeave is a dev tool where the user is the developer. They installed the app, configured the project root, and initiated the "Regenerate" flow explicitly. A system permission dialog on every run would be disruptive and inconsistent with other developer tooling (VS Code doesn't prompt before running tasks). The capability config + path validation in Rust is the appropriate defense-in-depth layer.

**3. Recommendation.**  
- **`read_file` (reading `src/fixtures/self-graph-generated.json`):** No prompt. The path is within the project root, the validation is in Rust, and the operation is read-only. Capability config covers manual commands automatically (no additional config needed beyond registering the command in `invoke_handler`).
- **`run_script` (running `generate-self-graph.mjs`):** A lightweight **one-time UI-level confirmation** on first use — not a system dialog, just a `<dialog>` or inline banner: "This will run `scripts/generate-self-graph.mjs` in your project directory. [Run it] [Cancel] [Don't ask again]". The "don't ask again" state is stored in settings. This is defense-in-depth without being paranoid — it surfaces the intent to the developer before first execution, but doesn't interrupt the workflow on subsequent runs.

---

## §6 — UI Surface — "Regenerate" Button + Status

**1. Where does the button go?**  
`src/control-plane/graph-sources/GraphSourcesTileContent.tsx:7–42`.  

Current structure (simplified):
```
<div lw-graph-sources-tile>
  <div space-y-3 p-1>
    <div rounded-xl border ... p-3>       ← status card, lines 9–38
      label (line 10)
      sourcePath (lines 11–13)
      status badge (lines 14–19)
      stats rows (lines 20–37)
    </div>                                ← end of card
  </div>
</div>
```

Proposed insertion: a new action row at the bottom of the status card, after the stats block (after line 37, before the card's closing `</div>` at line 38):
```tsx
<div className="mt-3 flex items-center justify-between gap-2"
     data-testid="graph-sources-regenerate-row">
  <button
    disabled={isRegenerating}
    onClick={handleRegenerate}
    data-testid="graph-sources-regenerate-btn"
  >
    {isRegenerating ? "Regenerating…" : "Regenerate"}
  </button>
  {lastGenerated && (
    <span data-testid="graph-sources-last-generated">{lastGenerated}</span>
  )}
</div>
{regenerateError && (
  <div data-testid="graph-sources-regenerate-error">{regenerateError}</div>
)}
```

**2. States the button needs.**

| State | Button | Status display |
|---|---|---|
| `idle` | Enabled, "Regenerate" | Last-generated timestamp or nothing |
| `running` | Disabled, "Regenerating…" | Spinner or animated pulse |
| `success` | Briefly show "Done ✓", revert to idle after 2s | Show new timestamp |
| `error` | Re-enabled ("Retry") | Red error text below the card (stderr from `run_script`) |

Success auto-reverts to idle — don't keep a success state permanently. Error persists until the next attempt.

**3. What triggers re-read after regeneration?**  
The cleanest pattern: add `refreshToken: number` to `sources` in the settings schema, incremented when `run_script` succeeds. `useGraphSourceSummary`'s effect array becomes `[activeAdapterId, inputPath, refreshToken]`. Incrementing it re-fires the load without any imperative calls.

**Why not component-local state?** `GraphSourcesTileContent` owns the regenerate action, but `useGraphSourceSummary` is consumed by `AppShell` (where graph data drives the Sigma render). If the reload is triggered by local state, `AppShell`'s hook won't re-fire unless it also subscribes to the same signal. Settings store is the correct cross-component broadcast channel.

**Why not force a new hook mount?** Key reset (`key={refreshToken}` on the component using the hook) is a React anti-pattern here — it remounts the graph renderer.

**Implementation note:** `refreshToken` is ephemeral (resets to 0 on restart is fine). It should live in `sources` alongside `active` and `configurations`. Requires a settings migration bump (schema version 92, migration backfills `refreshToken: 0`).

**4. Proposed testids.**

| Element | testid |
|---|---|
| Regenerate row container | `graph-sources-regenerate-row` |
| Regenerate / Retry button | `graph-sources-regenerate-btn` |
| Running status text | `graph-sources-regenerate-status` |
| Error message | `graph-sources-regenerate-error` |
| Last-generated timestamp | `graph-sources-last-generated` |

**Rate: MEDIUM.** The idle/running/success/error state machine is the main complexity. The `refreshToken` settings bump requires a migration (LOW — additive). Button placement is LOW. Total UI work is in the MEDIUM range due to the state machine + settings schema touch.

---

## §7 — E2E and Manual-Smoke Implications

**1. What can be Playwright-tested.**
- Button presence (`graph-sources-regenerate-btn` is visible)
- Disabled state when `isRegenerating = true` (injectable via `window.__lwStore.getState().setSetting(...)` if regenerating state is stored, or via a mock invoke)
- Error state rendering — if a mock Tauri invoke returns an error, the error testid should appear
- `refreshToken` increment — can assert via `window.__lwStore.getState().settings.sources.refreshToken`
- The settings store still reflects the default active adapter (already covered by `source-adapter.spec.ts`)

**2. What must be manual-smoke only.**
- Actual `run_script` Tauri invocation (Tauri invoke is a no-op in browser/Playwright)
- Actual `read_file` from disk
- The full generate→read→render cycle with real generated JSON
- Generator script output correctness

**3. Is there a mock-invoke pattern in the existing suite?**  
Searching for `__lwTauriInvoke`, `tauriInvoke`, `invoke_mock`: nothing found in `tests/e2e/`. The open-in-IDE tests (from v105.0.4) validate the command deck UI but don't stub the Tauri invoke — they document it as "manual-smoke-only" in NOW.md and accept the gap.

**Recommendation:** Build `window.__lwTauriMock` for Tier 1. The Tauri `invoke` call from TS could check `(window as any).__lwTauriMock?.[commandName]` first and, if present, call that instead of the real invoke. This requires a small shim in the invoke wrapper (two lines of TypeScript). The upside: state-transition tests become possible for the Regenerate button (mock returns success or error, assert the panel UI transitions). The downside: adds a test-only code path to production code. The tradeoff is worth it for Tier 1 given how central the Regenerate flow is.

**Alternative (simpler, less coverage):** Accept manual-smoke for the Tauri commands, and only E2E-test the button's DOM presence and disabled state. This matches the existing open-in-IDE precedent.

**4. Coverage gap log.**  
The following should be added to NOW.md's "Architectural notes — v108" when the arc closes:  
> `read_file` + `run_script` Tauri commands — manual-smoke only. Playwright can verify button presence and error-state rendering via `__lwTauriMock`, but the actual disk read and script execution require the Tauri runtime. Full E2E coverage for the generate→load→render cycle is not automated.

---

## §8 — Pre-flight Decisions for Ryan

**Decision 1: `tauri-plugin-fs` vs manual Rust validation for `read_file`.**  
*Investigator recommends: Manual Rust validation for Tier 1.*  
Reason: `tauri-plugin-fs` scope config is static strings; project root is dynamic. The only viable scope config would be `$HOME/**`, which is effectively no scope. Manual validation is 15 lines of Rust reusing the existing `get_project_root` pattern. Zero new dependencies. Revisit `tauri-plugin-fs` at Tier 2 when user-supplied paths justify it.  
Tradeoff: Manual Rust is more code to maintain and must be implemented correctly. If the implementation has a bug, there's no second layer of defense (unlike the plugin's capability-config layer).

**Decision 2: `tauri-plugin-shell` vs manual `std::process::Command` for `run_script`.**  
*Investigator recommends: Manual `std::process::Command` for Tier 1.*  
Reason: One script, one allowed binary (`node`). The plugin adds a per-install approval gate and frontend API surface that isn't needed for a single invocation. Manual implementation is ~60 lines of Rust and gives full control over timeout + output cap.  
Tradeoff: `tauri-plugin-shell`'s capability config provides a second layer of enforcement (allowed binaries declared in JSON, not just in Rust code). If the Rust allowlist logic has a bug, the plugin catches it. The manual path requires the Rust code to be the sole enforcement layer.

**Decision 3: Stream vs buffer for `run_script` stdout.**  
*Investigator recommends: Buffer.*  
Reason: The self-graph generator takes 1–5 seconds. Buffered invocation is 10 lines of Rust; streaming requires Tauri events, a `spawn()` rather than `output()`, and a frontend event listener. The UX benefit of seeing incremental progress is minimal at 1–5 second durations.  
Tradeoff: Buffered means the UI shows "Regenerating…" with no progress feedback until the script completes. If the script gets slow (large codebase), users may wonder if it hung. A timeout (60s recommended) mitigates this.

**Decision 4: Filename allowlist — hard-coded array vs config-driven.**  
*Investigator recommends: Hard-coded `const ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"]`.*  
Reason: There is exactly one script in Tier 1. Config-driven allowlists can be trivially widened by changing a config file, defeating the purpose. Hard-coded enforces the "cannot be widened without a code change and review."  
Tradeoff: Hard-coded means adding a second allowed script in Tier 2 requires modifying Rust code (and a Tauri rebuild). This is intentional friction for a security-critical list.

**Decision 5: Permission prompt model for `run_script`.**  
*Investigator recommends: One-time UI-level confirmation (settable "don't ask again") on first use.*  
Reason: A system dialog for every "Regenerate" is disruptive for a dev tool. No prompt at all leaves no record of the user's intent before first script execution. A one-time in-app confirmation surfaces the behavior without adding friction to subsequent uses.  
Tradeoff: "Don't ask again" is stored in settings — if settings are cleared, the prompt re-appears. Some users may prefer never prompting (treat it like any other button). Ryan's call.

**Decision 6: `inputPath` convention for self-graph.**  
*Investigator recommends: Absolute path to project root, cached in `configurations["self-graph-yaml-frontmatter"].inputPath` at startup via `get_project_root()`.*  
Reason: `loadSelfGraph`'s `_inputPath` parameter is already plumbed through — it just needs to be activated. Deriving the fixture path as `{inputPath}/src/fixtures/self-graph-generated.json` at call time is explicit and testable. Calling `get_project_root()` inside `loadSelfGraph` on every load adds an extra Tauri round-trip.  
Tradeoff: Seeding the path into settings at startup requires determining when/where to call `get_project_root()` during app init. If the settings migration runs before the Tauri runtime is ready, it will fail. An alternative is to call `get_project_root()` lazily inside `loadSelfGraph` and cache it in a module-level ref (no settings change needed). That avoids the migration but is less transparent.

**Decision 7: `refreshToken` in settings schema vs component-local state for re-triggering reads.**  
*Investigator recommends: `refreshToken: number` in `settings.sources`, incremented on regenerate success.*  
Reason: `useGraphSourceSummary` is consumed by AppShell — the hook must re-fire to update the graph render. Component-local state in `GraphSourcesTileContent` won't propagate to AppShell's instance of the hook. Settings store is the correct broadcast channel.  
Tradeoff: Requires a settings schema migration (version 91 → 92, migration backfills `refreshToken: 0`). Adds a semantically odd field to the persisted schema — a counter that resets on restart is fine but may look strange to a future reader. Alternative: expose a `forceRefresh()` function from the hook (imperative refresh API) and call it from the panel. This avoids the schema change but creates tighter coupling between the panel and the hook.

**Decision 8: `window.__lwTauriMock` shim for E2E testing.**  
*Investigator recommends: Build it for Tier 1, as a two-line shim in the invoke wrapper.*  
Reason: Without it, the Regenerate button's state transitions can't be Playwright-tested. The precedent is `window.__lwStore` (already exists), which normalizes this pattern.  
Tradeoff: Test-only code path in production. If the mock shim has a bug, it could affect real behavior. The `window.__lwTauriMock` check should be guarded by `process.env.NODE_ENV === "test"` or an explicit dev flag.

---

## §9 — Recommended Pass Shape

**Single pass or multiple?**  
Multiple. Tier 1 has two independent Rust commands + one settings schema change + UI work + optional E2E shim. Three commits is the right granularity:

**v108.0.1 — `read_file` Rust command + live self-graph path**

Files:
- `src-tauri/src/lib.rs` — add `read_file` command (path validation using `get_project_root` pattern; register in `invoke_handler`)
- `src-tauri/src/ide.rs` — extract `get_project_root_inner()` as a shared private helper (no longer need to re-implement root resolution in `read_file`)
- `src/graph/ingest/loadSource.ts` — activate `_inputPath` in `loadSelfGraph`: replace HTTP fixture fetch with a Tauri `invoke("read_file", { path: resolvedFixturePath })` call; parse the returned JSON string
- `src/control-plane/settings/settings.schema.ts` — add `refreshToken: number` to `SourcesSettings`
- `src/control-plane/settings/settings.defaults.ts` — add `refreshToken: 0` to `defaultSources`
- `src/control-plane/settings/settings.migrations.ts` — migration 91 → 92: backfill `refreshToken: 0`
- `src/control-plane/settings/settings.store.ts` — bump `CURRENT_SCHEMA_VERSION` to 92

**Hard dependency:** None (first commit of the arc).  
**Result:** App reads `src/fixtures/self-graph-generated.json` from disk via Tauri instead of HTTP. The 404 is gone. The fixture still lives in the same place — just routed through Rust instead of the web server.

---

**v108.0.2 — `run_script` Rust command + Regenerate button UI**

Files:
- `src-tauri/src/lib.rs` — add `run_script` command (allowlist: `["scripts/generate-self-graph.mjs"]`; `spawn_blocking(|| Command::new("node").arg(script).output())`; timeout 60s; output cap 10MB; return `{stdout, stderr, exit_code}`)
- `src/control-plane/graph-sources/GraphSourcesTileContent.tsx` — add Regenerate button (idle/running/success/error states; calls `invoke("run_script", { script: "scripts/generate-self-graph.mjs", args: [] })`; on success increments `sources.refreshToken` via `setSetting`; on error shows `regenerateError`)
- `src/graph/ingest/useGraphSourceSummary.ts` — add `refreshToken` to effect deps `[activeAdapterId, inputPath, refreshToken]` (or pass as param if cleaner)
- `tests/e2e/graph-sources.spec.ts` — new spec: button presence, `data-testid` attrs, error state via `__lwTauriMock`
- `src/tauri-invoke.ts` (or wherever the Tauri invoke wrapper lives) — add `__lwTauriMock` shim (two lines, gated on dev/test)

**Hard dependency:** v108.0.1 must be in place (the button's success callback reads the refreshed file via `read_file`, which must exist).  
**Result:** Full Regenerate flow is functional. Click button → generate-self-graph.mjs runs → `refreshToken` bumps → `useGraphSourceSummary` re-fires → `read_file` reads the new JSON → graph updates.

---

**v108.0.3 — Arc close: semver bump + NOW.md reconcile**

Files:
- `package.json` — 0.14.0 → 0.15.0 (minor, feature arc)
- `src-tauri/Cargo.toml` — if tracking semver (currently 0.1.0, may not change)
- `docs/LUMAWEAVE_NOW.md` — v108 closed arc; architectural notes (read_file + run_script contracts); refresh the roadmap; add manual-smoke-only coverage note for Tauri commands

**Hard dependency:** v108.0.2.  
**Result:** v108 arc closed, blog bumped.

---

**Hard sequencing summary:**

```
v108.0.1 (read_file + live path + schema)
    ↓
v108.0.2 (run_script + Regenerate button + E2E)
    ↓
v108.0.3 (arc close)
```

v108.0.1 and v108.0.2 cannot be reversed — the button depends on both Tauri commands and the `refreshToken` schema field.

**Estimated total scope:** 3 commits, 1–2 sessions. The Rust implementation is the risk surface — path validation + `spawn_blocking` + timeout is the part most likely to require iteration. Budget extra time if the tokio integration has friction (verify Tauri 2's tokio version before writing the timeout).

**Files touched summary:**

| Commit | Files |
|---|---|
| v108.0.1 | `src-tauri/src/lib.rs`, `src-tauri/src/ide.rs`, `src/graph/ingest/loadSource.ts`, `settings.schema.ts`, `settings.defaults.ts`, `settings.migrations.ts`, `settings.store.ts` |
| v108.0.2 | `src-tauri/src/lib.rs`, `GraphSourcesTileContent.tsx`, `useGraphSourceSummary.ts`, `tests/e2e/graph-sources.spec.ts`, Tauri invoke wrapper |
| v108.0.3 | `package.json`, `src-tauri/Cargo.toml` (if needed), `docs/LUMAWEAVE_NOW.md` |

---

## Appendix — Current Tauri Command Inventory

From `src-tauri/src/lib.rs:13` and `src-tauri/src/ide.rs`:

| Command | Location | What it does |
|---|---|---|
| `greet` | `lib.rs:4–7` | Hello-world stub |
| `get_project_root` | `ide.rs:4–26` | Returns project root (pops src-tauri/ CWD to parent) |
| `open_in_ide` | `ide.rs:28–33` | Opens a URL via `tauri-plugin-opener` |

Tier 1 adds two more: `read_file` and `run_script`.
