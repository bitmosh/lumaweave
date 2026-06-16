# Bandit — v108.0 (Tier 1): self-graph live mode — read_file + run_script + Regenerate button

Opens v108 (Source Adapters — Tier 1 arc). Delivers Tier 1 of `docs/prototypes/source-adapter-plan.md`: replace the static fixture fetch with a live disk read via a new Tauri `read_file` command, plus a `run_script` command + Regenerate button to re-invoke the self-graph generator. First arc with real OS-level access; security surface is the dominant design concern.

Basis: `docs/prototypes/v108_t1_report.md` (terminal Claude investigation, all 9 sections + 8 decisions). All 8 decisions locked with Ryan. ONE pass, THREE commits with merge gates between each.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (run in order for EACH of the 3 commits)
For each commit: 0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this. Then proceed to next commit.

The arc-close minor bump is in the FINAL commit (.0.3). Earlier commits get internal/patch bumps per normal pass discipline.

## Locked decisions (from v108_t1_report.md + Ryan's confirmation)

1. **`read_file`:** manual Rust validation (`canonicalize → starts_with project root`). No `tauri-plugin-fs` — its static-string scope doesn't fit a dynamic project root. ~15 lines of Rust reusing the existing `get_project_root` pattern.
2. **`run_script`:** manual `std::process::Command`. No `tauri-plugin-shell` — overkill for one allowed script.
3. **stdout:** buffer (`output()`). No streaming. 60s timeout via `tokio::time::timeout`, 10 MB output cap.
4. **Filename allowlist:** hard-coded Rust constant `const ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"]`. Single element. NOT config-driven.
5. **Permission prompt: NONE.** Capability config + hard-coded allowlist + path validation are the security model. NO modal, NO "don't ask again" setting. NOW.md will explicitly log that regenerate runs without confirmation and why.
6. **`inputPath` for self-graph: lazy module-level cache.** No settings entry for inputPath. Inside `loadSelfGraph`, on first invocation, call `get_project_root` via Tauri invoke and cache the result in a module-level `let`. All subsequent calls use the cached value. Avoids settings-migration timing risk.
7. **`refreshToken: number` in settings.sources.** Schema migration 91→92 (additive backfill `refreshToken: 0`). `useGraphSourceSummary` adds it to the effect dependency array. Regenerate success increments via `setSetting("sources.refreshToken", current + 1)`.
8. **`__lwTauriMock` E2E shim:** build it. Two-line dev/test-gated shim in the Tauri invoke wrapper. Production code path unaffected; tests can inject mock command responses.

## Security: the manual Rust validation must be reviewable by eyeball
The whole defensibility of D1+D2 rests on the Rust path validation + allowlist being small, obvious, and auditable. Keep it that way:
- No clever abstractions. Direct `canonicalize → starts_with` for read_file; direct `if !ALLOWED_SCRIPTS.contains(...) { return Err(...) }` for run_script.
- Every error path returns a string error (not a panic).
- Comment the security invariants at the top of each command (one line each — "Path must canonicalize within project root" / "Script must be in ALLOWED_SCRIPTS").

---

## Commit 1 — `feat(v108.0.1): read_file Tauri command + live self-graph load`

**Files (explicit paths only):**
- `src-tauri/src/ide.rs` — extract `get_project_root_inner() -> Result<PathBuf, String>` as a private helper (the existing `get_project_root` Tauri command keeps its current signature; the helper is what `read_file` reuses).
- `src-tauri/src/lib.rs` — add `read_file` command, register in `invoke_handler`. Or create `src-tauri/src/fs.rs` for the new command and `mod fs;` in lib.rs — Bandit's call on file placement. Keep it idiomatic to the existing project layout.
- `src/graph/ingest/loadSource.ts` — activate `loadSelfGraph(inputPath)`'s unused `_inputPath` param. Lazy module-level cache for project root. Replace HTTP fixture fetch with Tauri `invoke("read_file", { path })`.
- `src/control-plane/settings/settings.schema.ts` — add `refreshToken: number` to `SourcesSettings`. Bump `version: 91 → 92`.
- `src/control-plane/settings/settings.defaults.ts` — add `refreshToken: 0` to `defaultSources`.
- `src/control-plane/settings/settings.migrations.ts` — add `92:` migration, additive backfill mirroring the `91:` pattern.
- `src/control-plane/settings/settings.store.ts` — bump `CURRENT_SCHEMA_VERSION` to 92.

**Pre-flight (verify, report, STOP if anything diverges):**
1. Confirm v107 is on HEAD (production 0.14.0, `loadGraphifySource.ts` deleted, `loadSelfGraph(_inputPath)` exists with `_inputPath` unused).
2. Confirm `get_project_root` in `ide.rs` returns a portable absolute path (the v105.0.5 fix that pops src-tauri/ from CWD).
3. Confirm no `tauri-plugin-fs` or `tauri-plugin-shell` is currently in `Cargo.toml` — this commit must not introduce them. If they're present unexpectedly, STOP.
4. Report the proposed Rust file layout (new `fs.rs` module or inline in `lib.rs`) before writing.

**Rust implementation — `read_file`:**
```rust
// Security invariant: path must canonicalize within the project root.
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
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
```
- `get_project_root_inner` is a private helper extracted from the existing `get_project_root` Tauri command (so both call the same root-resolution logic).
- Register `read_file` in the `tauri::generate_handler![...]` macro in `lib.rs`.
- No new capability permissions needed (the command is registered manually, not behind a plugin).
- The `candidate` is path-joined BEFORE canonicalize, so a non-existent file errors at canonicalize with a clear message (not a panic).

**Frontend — `loadSelfGraph` rewrite:**
```ts
// Module-level lazy cache for project root (D6).
let cachedProjectRoot: string | null = null;
async function getProjectRoot(): Promise<string> {
  if (cachedProjectRoot === null) {
    cachedProjectRoot = await invoke<string>("get_project_root");
  }
  return cachedProjectRoot;
}

async function loadSelfGraph(_inputPath: string): Promise<GraphSourceSummary> {
  try {
    const root = await getProjectRoot();
    // Convention: read the generator's known output location.
    // inputPath is reserved for future user-configurable paths; for now, hard-coded to the generator output.
    const filePath = "src/fixtures/self-graph-generated.json";
    const json = await invoke<string>("read_file", { path: filePath });
    const raw = JSON.parse(json);
    // ... existing normalization logic from the prior fixture fetch path
    return { status: "loaded", sourceId: "self-graph-yaml-frontmatter", sourcePath: `${root}/${filePath}`, normalizedNodes: ..., normalizedEdges: ..., label: ..., rawNodes: ..., rawEdges: ... };
  } catch (err) {
    return { status: "error", error: String(err), sourceId: "self-graph-yaml-frontmatter", sourcePath: null };
  }
}
```
- Preserve `GraphSourceSummary`'s exact return shape (AppShell's `hasRealSource` chain at `:84-94` depends on it).
- Browser/Playwright `invoke` is a no-op (see D8's mock shim, lands in .0.2) — when invoke returns nothing/throws, fall through to error status, which triggers AppShell's fixture fallback. Same fallback chain as today; just the path through it is different.
- The `_inputPath` param stays in the signature but is intentionally unused for Tier 1 (future Tier 2+ adapters parametrize this). Keep the underscore prefix for now.

**Schema migration (mirrors the 91 pattern from v107):**
```ts
// settings.migrations.ts
92: (s) => ({ ...s, version: 92, sources: { ...(s.sources ?? defaultSources), refreshToken: (s as any).sources?.refreshToken ?? 0 } }),
```
- Additive only. Preserves existing `active` and `configurations`.

**Verify:**
- `cargo build` (or `cd src-tauri && cargo check`) — Rust compiles clean.
- typecheck 0, lint:css 0.
- E2E foreground full suite: baseline must hold (v107 close was 635/0/15 — confirm or close). Note: in Playwright, Tauri invoke is no-op, so `loadSelfGraph` will error → fixture fallback chain still runs → graph still renders. The transparency of the rewire is the test.
- Run the tile-system spec specifically (`tests/e2e/v86c-tile-system.spec.ts`) to confirm the schema 91→92 migration doesn't disturb tile init.
- **Manual smoke (Ryan, in `npm run tauri dev`):** the self-graph still loads, but now via the Tauri command not HTTP. The 404 in devtools console is gone (no fixture-fetch happening). Reload — still loads.

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v108.0.1): read_file Tauri command + live self-graph load via disk (schema 91→92)`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 2 — `feat(v108.0.2): run_script Tauri command + Regenerate button + E2E shim`

**Files (explicit paths only):**
- `src-tauri/src/lib.rs` (or `src-tauri/src/fs.rs` from commit 1) — add `run_script` command. Hard-coded allowlist. `spawn_blocking` for the synchronous Command::output. `tokio::time::timeout(60s)`. Output size check (10 MB cap). Register in `invoke_handler`.
- `src-tauri/Cargo.toml` — verify `tokio` is available with the `time` feature. Tauri 2 pulls tokio transitively; if `time` isn't enabled, add `tokio = { version = "1", features = ["time"] }` to dependencies. **STOP and ask Ryan before adding a tokio entry to Cargo.toml** — this is a dependency-adjacent change and falls under the install-safeguard even though tokio is already transitively present.
- `src/control-plane/graph-sources/GraphSourcesTileContent.tsx` — add Regenerate button + state machine (idle/running/success/error). On success: `setSetting("sources.refreshToken", current + 1)`.
- `src/graph/ingest/useGraphSourceSummary.ts` — add `refreshToken` to effect dependency array: `[activeAdapterId, inputPath, refreshToken]`.
- `tests/e2e/graph-sources.spec.ts` — new spec (button presence, error-state rendering, refreshToken increment) using the mock shim.
- The Tauri invoke wrapper file (Bandit identifies the canonical wrapper — likely `src/lib/tauri.ts` or similar; report in pre-flight) — add the two-line `__lwTauriMock` shim, gated on dev/test.

**Pre-flight (verify, report, STOP):**
1. Confirm v108.0.1 is on HEAD.
2. Report Tauri invoke wrapper location (where to add the mock shim).
3. **Confirm tokio's `time` feature** availability before writing `tokio::time::timeout`. If `tokio = { features = ["time"] }` isn't already configured (directly or via Tauri's deps), STOP and ask Ryan before adding it.
4. Confirm `scripts/generate-self-graph.mjs` exists at that exact path. Confirm `node` is the correct interpreter (no shebang assumption).

**Rust implementation — `run_script`:**
```rust
// Security invariant: script must be in ALLOWED_SCRIPTS; runs as node <script> [args];
// Timeout 60s; stdout/stderr each capped at 10 MB.
const ALLOWED_SCRIPTS: &[&str] = &["scripts/generate-self-graph.mjs"];
const OUTPUT_CAP_BYTES: usize = 10 * 1024 * 1024;
const TIMEOUT_SECS: u64 = 60;

#[derive(serde::Serialize)]
struct ScriptResult { stdout: String, stderr: String, exit_code: i32 }

#[tauri::command]
async fn run_script(script: String, args: Vec<String>) -> Result<ScriptResult, String> {
    if !ALLOWED_SCRIPTS.contains(&script.as_str()) {
        return Err(format!("Script not in allowlist: {script}"));
    }
    let root = get_project_root_inner()?;
    let canonical_root = std::fs::canonicalize(&root).map_err(|e| format!("Cannot canonicalize root: {e}"))?;
    let candidate = std::path::Path::new(&root).join(&script);
    let canonical_script = std::fs::canonicalize(&candidate).map_err(|e| format!("Cannot canonicalize script: {e}"))?;
    if !canonical_script.starts_with(&canonical_root) {
        return Err(format!("Script escapes project root: {script}"));
    }
    // Synchronous Command::output, wrapped in spawn_blocking, wrapped in timeout.
    let script_path = canonical_script.clone();
    let extra_args = args.clone();
    let handle = tokio::task::spawn_blocking(move || {
        std::process::Command::new("node")
            .arg(&script_path)
            .args(&extra_args)
            .output()
    });
    let output = tokio::time::timeout(std::time::Duration::from_secs(TIMEOUT_SECS), handle)
        .await
        .map_err(|_| format!("Script timeout after {TIMEOUT_SECS}s"))?
        .map_err(|e| format!("spawn_blocking failed: {e}"))?
        .map_err(|e| format!("Command failed: {e}"))?;
    if output.stdout.len() > OUTPUT_CAP_BYTES { return Err(format!("stdout exceeded cap of {OUTPUT_CAP_BYTES} bytes")); }
    if output.stderr.len() > OUTPUT_CAP_BYTES { return Err(format!("stderr exceeded cap of {OUTPUT_CAP_BYTES} bytes")); }
    Ok(ScriptResult {
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}
```
- Register in `invoke_handler` alongside `read_file`.
- The double `.await ... .map_err` chain unwraps three nested results (timeout → spawn_blocking join → command). Keep them on separate lines for readability.

**Frontend — Regenerate button (`GraphSourcesTileContent.tsx`):**
- New action row at the bottom of the status card (after stats block, before card close — per investigation §6).
- States: idle / running / success (briefly, 2s auto-revert to idle) / error (persists until next attempt).
- testids: `graph-sources-regenerate-row`, `graph-sources-regenerate-btn`, `graph-sources-regenerate-status`, `graph-sources-regenerate-error`, `graph-sources-last-generated`.
- On click: `setIsRegenerating(true)` → `invoke("run_script", { script: "scripts/generate-self-graph.mjs", args: [] })` → on success: `setSetting("sources.refreshToken", current + 1)`, briefly show "Done ✓", then revert; on error: show stderr in error testid, button becomes "Retry".

**`__lwTauriMock` shim** (in the Tauri invoke wrapper):
```ts
// Two-line dev/test mock shim. Production code path unaffected.
export async function invoke<T>(cmd: string, args?: any): Promise<T> {
  if (typeof window !== "undefined" && (window as any).__lwTauriMock?.[cmd]) {
    return (window as any).__lwTauriMock[cmd](args);
  }
  // ... existing invoke implementation
}
```
- Gate on `import.meta.env.DEV || process.env.NODE_ENV === "test"` if the wrapper needs explicit environment-gating (Bandit's call based on how the wrapper is currently structured).
- Document the shim's contract briefly in a comment so future devs know it exists.

**E2E spec (`tests/e2e/graph-sources.spec.ts`):**
- Test 1: Regenerate button is present and enabled by default.
- Test 2: Mock `run_script` to return success → click button → assert `refreshToken` incremented in store (`window.__lwStore.getState().settings.sources.refreshToken`).
- Test 3: Mock `run_script` to return an error → click → assert `graph-sources-regenerate-error` testid is visible with the error text.
- Test 4: Disabled state during running (set local state via the mock's delay or check post-click).

**Verify:**
- `cargo build` clean. typecheck 0, lint:css 0.
- Full E2E foreground: new graph-sources spec passes; baseline holds.
- **Manual smoke (Ryan, in `npm run tauri dev`):** click Regenerate → script runs → "Done ✓" briefly → graph updates with newly generated data. Try a bad state (e.g. delete the generator script and click → error shows). Confirm timeouts behave (if you can artificially extend the script — optional).

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v108.0.2): run_script + Regenerate button + __lwTauriMock E2E shim`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 3 — `chore(v108.0.3): arc close — semver 0.14.0 → 0.15.0 + NOW.md`

**Files (explicit paths only):**
- `package.json` (0.14.0 → 0.15.0)
- `src-tauri/Cargo.toml` (if it tracks the main semver — confirm; if it tracks separately at 0.1.0 leave alone)
- `docs/LUMAWEAVE_NOW.md`

**Pre-flight:**
1. Confirm v108.0.1 + .0.2 are on HEAD.
2. Read LIVE package.json version (don't trust cached; was 0.14.0 at v107 close).
3. Confirm no diagnostic console.logs lingering (sanity grep).

**NOW.md reconcile (preserve everything previously deferred):**
- Header: `Production version: 0.15.0`, `Internal arc: v109 (TBD — likely Tier 2: markdown-vault, OR pivot to enrichments / inspectable-coverage / token-hygiene per Ryan)`, `Last closed: v108 (Source Adapters — Tier 1)`.
- Move v108 from "Open arc" to a new "Closed arc — v108 (CLOSED)" block with the 3-commit table.
- v107 stays closed; preserve its block intact.
- "Architectural notes — v108" (new section): 
  - `read_file` contract: manual Rust validation (`canonicalize → starts_with project root`). NOT a Tauri plugin. Per-command, not capability-gated. Reviewable at `src-tauri/src/<file>.rs:<lines>`.
  - `run_script` contract: hard-coded allowlist (currently `["scripts/generate-self-graph.mjs"]`), 60s timeout, 10MB stdout/stderr cap, `node` interpreter, no shell expansion. Allowlist widening requires Rust code change + Tauri rebuild (intentional friction).
  - **Permission model:** no runtime confirmation prompts. Capability config + hard-coded allowlist + path validation are the security model. Decision rationale: dev tool dogfooding its own repo; user is the developer. Documented here so the choice is explicit.
  - `loadSelfGraph` project-root cache: lazy module-level (one Tauri invoke per session). No settings entry for inputPath.
  - `__lwTauriMock`: dev/test-gated invoke shim. Production code path unaffected.
- Coverage gap log: `read_file` + `run_script` Tauri commands are manual-smoke-only at the Tauri-runtime layer. Playwright covers button presence + error-state rendering via `__lwTauriMock`, but full disk-read + script-execution cycles require `tauri dev`.
- Windows portability note (forward-only): canonicalize returns UNC paths; `node` may not be in PATH. LumaWeave is Linux-only dogfood at v1.0; Windows port would need integration work.
- Roadmap: v108 → CLOSED. Tier 2+ (markdown-vault, git-codebase) remain queued. Note that Tier 2's user-supplied paths may justify revisiting `tauri-plugin-fs` (per D1 deferred recommendation).
- Standing arcs (preserve untouched): Inspectable-Coverage + Token-Hygiene, minimap E2E debt, tile-content theming, mis-homed tile sections, test-hardening, security debt (Code spoke enrichments still queued).

**Verify:**
- typecheck 0. No E2E re-run needed (no code changes from .0.2).
- MERGE GATE → commit (explicit paths above): `chore(v108): Source Adapters Tier 1 arc close — semver 0.14.0→0.15.0, NOW.md reconcile, security model documented`
- PASS COMPLETE to #changelog with SHA (arc-close bump). Bump+push gate.

---

## END-OF-RUN REPORT after each commit (#changelog)
Each commit's report: files committed (explicit list), pre-flight findings, verification numbers, manual smoke notes (for .0.1 and .0.2), divergences from prompt if any.

**Final report (after .0.3)** additionally: landed-state audit across all 3 commits, semver was→now, deferred items preserved, the security model documented in NOW.md cited verbatim.

## Hard stops
- No installs WITHOUT EXPLICIT RYAN APPROVAL. This pass uses NO new Rust crates and NO new npm packages. If tokio's `time` feature requires an entry in `Cargo.toml`, STOP and ask Ryan first (it falls under the install safeguard even if tokio is already transitively pulled in by Tauri).
- Explicit-path git (NEVER `git add -A`). Playwright foreground. Discord MCP only.
- **NO `tauri-plugin-fs` or `tauri-plugin-shell` this pass.** Both were considered and explicitly rejected for Tier 1 (D1, D2).
- **NO confirmation prompts.** D5 locked: no modal, no "don't ask again" setting. Security model is capability + allowlist + path validation; document it in NOW.md.
- **Path validation MUST be `canonicalize → starts_with`.** Not `path.contains(root)`, not regex, not string comparison. The Rust must be small (~15 lines) and reviewable by eyeball.
- **Allowlist MUST be a hard-coded Rust constant.** Not read from a config file. Adding scripts requires Rust changes (intentional friction).
- **Preserve `GraphSourceSummary` return shape** — AppShell's `hasRealSource` chain depends on it. The rewire must be transparent.
- If a real regression appears (anything beyond the intentional v108 changes), STOP and report. Do not loosen tests to make them pass.
- Mock shim: dev/test-gated only. The check should be `import.meta.env.DEV || process.env.NODE_ENV === "test"` or equivalent — never unconditional.
