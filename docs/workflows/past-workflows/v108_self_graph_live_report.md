# v108 End-Pass Report — Self-Graph Live Mode

**Arc:** v108 · Source Adapters Tier 1  
**Semver:** 0.14.0 → 0.15.0  
**Commits:** 08ac499, d66bd50, 5020b82  
**Date:** 2026-06-05  
**Tests:** 672 passed · 0 failed · 16 skipped (baseline was 668; +4 from new graph-sources spec)

---

## What shipped

Three commits, three clean gates.

**v108.0.1 — read_file + live self-graph load (schema 91→92)**

- `src-tauri/src/fs.rs`: new `read_file` Tauri command, ~15 lines. Security model: `canonicalize → starts_with(project_root)`. Resolves relative paths against `get_project_root_inner()` before canonicalizing — symlink traversal is caught by `starts_with` post-canonicalize.
- `get_project_root_inner()` extracted as `pub` helper in `ide.rs`, shared by `read_file`.
- `src/lib/tauri-invoke.ts` created as thin invoke wrapper. In v108.0.1 it's a straight passthrough; the mock shim is added in v108.0.2 so the wrapper exists before it's needed.
- `loadSelfGraph` rewired: `fetch(baseUrl/graph.json)` → `invoke("read_file", { path: "src/fixtures/self-graph-generated.json" })`. Module-level lazy `cachedProjectRoot` cache avoids repeated Tauri round-trips.
- **Normalizer fix:** `loadSelfGraph` was using `normalizeGraphifyGraph` (the Graphify-output normalizer), wrong for `lumaweave-self-graph/v1`. Switched to `adaptSelfGraphToSigma`. The 404 had hidden this divergence for the entire v107 arc.
- Settings schema 91→92: `sources.refreshToken: number` added to `SourcesSettings`, `defaultSources`, and `settings.migrations.ts` (additive backfill, `refreshToken: 0`).

**v108.0.2 — run_script + Regenerate button + mock shim**

- `run_script` Tauri command (appended to `fs.rs`): `ALLOWED_SCRIPTS = ["scripts/generate-self-graph.mjs"]` hard-coded constant (not config-driven, per D3), same `canonicalize → starts_with` path validation, `tokio::task::spawn_blocking` + `tokio::time::timeout(60s)`, 10 MB stdout/stderr cap, `ScriptResult { stdout, stderr, exit_code }`.
- `tokio = { version = "1", features = ["rt", "time"] }` added to `Cargo.toml` — tokio was already transitively present (v1.52.1 in Cargo.lock via Tauri) but the crate couldn't access it directly. Ryan approved.
- `__lwTauriMock` shim added to `tauri-invoke.ts`, gated on `import.meta.env.DEV || window.PLAYWRIGHT`. Matches the existing `__lwStore` exposure pattern in AppShell.
- `GraphSourcesTileContent.tsx` rewritten with Regenerate button. State machine: `idle → running → success (2s, auto-revert) | error`. On success: `sources.refreshToken++` via `setSetting`, which re-triggers `useGraphSourceSummary`'s effect → graph reload.
- `useGraphSourceSummary.ts`: `refreshToken` added to effect dep array.
- 4 new E2E tests in `tests/e2e/graph-sources.spec.ts`: button presence, success→refreshToken increment, error display + "Retry" label, disabled-during-running. All use `__lwTauriMock` injection.

**v108.0.3 — arc close**

- `package.json`: 0.14.0 → 0.15.0
- `docs/LUMAWEAVE_NOW.md`: v108 closed arc section added, header updated, v107 table SHA fixed, v107 Tier 1 deferred item removed.

---

## Pre-flight findings (notable)

**Normalizer divergence** — `loadSelfGraph` was importing `normalizeGraphifyGraph` from the graph normalize module. The Graphify normalizer handles generic/Graphify-output data (nested `graph.nodes`, various edge shapes). The self-graph generator produces `lumaweave-self-graph/v1` schema, which needs `adaptSelfGraphToSigma`. AppShell had always been using the correct one for its static import; only `loadSource.ts` was wrong. The 404 on every HTTP fetch meant this had never mattered until now.

**tokio not accessible** — `tokio` is transitively in `Cargo.lock` (v1.52.1, pulled by Tauri) but the LumaWeave crate can't reference it without a direct `Cargo.toml` entry. Two options were presented (Option A: add direct dep; Option B: stdlib `mpsc::recv_timeout`). Ryan chose Option A. Confirmed: `spawn_blocking` + `timeout` is correct async hygiene; the stdlib alternative would have blocked the tokio executor thread for up to 60s on every regenerate click.

**No central Tauri invoke wrapper** — The existing codebase uses per-callsite dynamic imports (`const { invoke } = await import("@tauri-apps/api/core")`). Creating `src/lib/tauri-invoke.ts` as the canonical wrapper in v108.0.1 (before the mock shim was needed) keeps the mock shim out of `loadSource.ts` and makes it reusable.

---

## What's deferred / not in scope

- **`_inputPath` parameter** — `loadSelfGraph(_inputPath: string)` still ignores its argument. The SELF_GRAPH_FIXTURE_PATH is hard-coded. Tier 2+ will let users configure the path via `sources.configurations`.
- **Manifest and report reads** — The original HTTP path attempted to fetch `GRAPH_REPORT.md` and a provenance manifest. Not implemented in Tier 1 (not needed for the core loop).
- **Tier 2+ adapters** — `markdown-vault`, `package-dependency`, etc. `registerSourceAdapter()` API deferred to when Tier 2 needs dynamic registration.
- **`settings-migrations.spec.ts` stale assertion** — `expect(result.version).toBe(90)` has been wrong since v91 (source adapters). Passes in the full suite (listed as skipped) but fails in isolation. Pre-existing; not introduced by v108. Noted for cleanup in a future pass.

---

## Test results breakdown

| Suite | Before v108 | After v108 |
|---|---|---|
| Full suite | 668/0/16 | 672/0/16 |
| graph-sources.spec | — (new) | 4/0/0 |
| tile-system.spec | 15/0/2 | 15/0/2 (migration 91→92 clean) |
| settings-migrations.spec (isolated) | fail (pre-existing) | fail (pre-existing, now 1 version further off) |

---

## Process notes

**Gate polling** — Throughout this arc, the Discord polling pattern was stopping after 1-2 `fetch_messages` calls rather than looping persistently. Ryan was approving in Discord but the agent had already moved on, causing repeated disconnects (~12 times across both arcs). Fixed for future passes: use `Monitor` or a persistent poll loop via `fetch_messages` until a recognized response keyword is detected, rather than a fixed call count.

**BANDIT hard stops honored** — Two hard stops triggered correctly:
1. `tokio::time::timeout` not available → stopped, presented two options, waited for Ryan's call before writing any Rust.
2. No attempt to add `tauri-plugin-fs` or `tauri-plugin-shell` (explicitly rejected in BANDIT D1/D2).
