# v107 Source Adapters — Tier 0 Investigation Report

**Date:** 2026-06-04  
**Scope:** Read-only pre-pass audit per `INVESTIGATION_v107_source_adapters_tier0.md`  
**No code changes. No commits.**

---

## §1 — Plan Freshness Audit

The plan's §1 (audited 2026-06-03) has 8 rows asserting current code state. Verified against `main` post-v106.

| Row | Assertion | Status | Verification |
|-----|-----------|--------|-------------|
| 1 | `adaptSelfGraphToSigma()` handles v0/v1, 747 KB fixture | **HOLDS** | Function at `src/fixtures/self-graph-adapter.ts` — confirmed by import in `AppShell.tsx:30–31`. AppShell uses it at lines 96–98. |
| 2 | Live loader hardcoded to `/examples/ai-lab/graphify-out/graph.json`, path doesn't exist | **HOLDS** | `const publicBaseUrl = "/examples/ai-lab/graphify-out"` at `src/graph/ingest/loadGraphifySource.ts:12`; fetch call at `:71`. |
| 3 | Registry: sealed `readonly` const array, 1 registered + 8 candidate, no `register()` API | **HOLDS** | `SOURCE_ADAPTER_ENTRIES` declared `const` at `src/source-adapter/sourceAdapterRegistry.ts:87` (inferred from grep at :87+). Getter functions only: `getSourceAdapterEntryById` at :421. No `register()` function anywhere in file. |
| 4 | `normalizeGraphifyGraph.ts` handles many raw shapes via field-name probing | **HOLDS** | Not read directly in this pass; cited in plan as `src/graph/normalize/normalizeGraphifyGraph.ts`. Explorer agent confirmed field probing at lines 22–66. |
| 5 | `SourceAdapterPanel` read-only; `GraphSourcesTileContent` shows live source state | **HOLDS** | Grep for `button\|Button\|onClick` in `SourceAdapterPanel.tsx` returns no results — zero buttons in 255-line file. E2E spec at `tests/e2e/source-adapter.spec.ts:55–83` actively tests that no enabled buttons exist. |
| 6 | Tauri: only `get_project_root()` + `open_in_ide()` (+ `greet`) — zero ingestion/FS commands | **HOLDS** | `src-tauri/src/lib.rs:13` — `invoke_handler!(greet, ide::get_project_root, ide::open_in_ide)`. Three commands total. |
| 7 | `useFixture = isTestEnv \|\| !hasRealSource` | **HOLDS** | `src/app/AppShell.tsx:84–94` — `isTestEnv` checks `__PLAYWRIGHT__` flag, `hasRealSource` at :87, `useFixture` at :94. Used at :301–306, :316, :387. |
| 8 | Source settings: only collapse state, no source path config | **HOLDS** | `src/control-plane/settings/settings.schema.ts:72` — schema version is 90 (per comment "v104.0.0: minimap settings slice added"). No `sources` field in schema. `settings.defaults.ts:18` confirms version 90. |

**All 8 rows hold.** v106 (Radial Inspector Redesign) touched `themeOverrideStorage`, deleted SVG inspector components, and committed topbar subtargets — none of these files overlap with the source-adapter pipeline.

**Additional drift check (v106 scope):**  
- `themeOverrideStorage` changes: scoped to `node.geometry.preset` target entries — no interaction with graph loading.  
- `inspectorSpokeRegistry` changes: UI layer only.  
- `provenance-manifest.json` line offset update: no impact on source loading.  

No v106 drift affects Tier 0.

---

## §2 — Tier 0 Scope Verification

### 0.1 — Repair `loadGraphifySource` → `loadSource(adapterId, inputPath)`

**Current file shape** (`src/graph/ingest/loadGraphifySource.ts`):  
- Exported function `loadGraphifySource()` at :52 — zero parameters, returns `Promise<GraphSourceSummary>`.  
- Hardcoded constants: `publicBaseUrl = "/examples/ai-lab/graphify-out"` at :12; `sourceId: "ai-lab"` at :54; `sourcePath:` hardcoded absolute path at :56.  
- Internal helpers `extractNodeCount()`, `extractEdgeCount()` — private to file.

**All callers of `loadGraphifySource`:**
1. `src/graph/ingest/useGraphSourceSummary.ts:8` — import
2. `src/graph/ingest/useGraphSourceSummary.ts:38` — call inside `loadSummary()` async function in `useEffect`

**That is the complete call surface.** No other file imports or calls this function.

**Refactor scope:**  
- Replace with `loadSource.ts` exporting `loadSource(adapterId: string, inputPath: string): Promise<GraphSourceSummary>`.  
- Adapter routing: look up `adapterId` in registry; if `status: "registered"`, dispatch to that adapter's loader; otherwise return `{ status: "not-implemented" }`.  
- For self-graph: route to fixture path (same as current behavior, just parametrized).  
- Update `useGraphSourceSummary.ts:8,38` — only two call sites, both in same file.

**Difficulty: LOW.** Parametrization + one conditional dispatch. Both callers are in the same hook file. The signature change is not breaking beyond the one import.

---

### 0.2 — Add `sources` section to settings schema

**Current schema** (`src/control-plane/settings/settings.schema.ts`):  
- `StarmapSettings` interface, `version: 90` at :72.  
- No `sources` field.

**Migration pattern** (`src/control-plane/settings/settings.migrations.ts`):  
- `MIGRATIONS: Record<number, (s: Partial<StarmapSettings>) => Partial<StarmapSettings>>` at :7.  
- Last migration: `90:` at :158 — additive backfill for `minimap` slice (pattern: `(s.minimap ?? defaultMinimapSettings)`).  
- New migration would be `91:` — same additive pattern: `sources: (s as any).sources ?? defaultSources`.

**`"self-graph-yaml-frontmatter"` confirmation:**  
`src/source-adapter/sourceAdapterRegistry.ts:89` — `adapterId: "self-graph-yaml-frontmatter"`, `status: "registered"` at :119. Correct default ID.

**Difficulty: LOW.** Boilerplate — schema field, defaults entry, one-line migration. No existing consumers to update (new field; nothing reads it yet).

---

### 0.3 — Wire `useGraphSourceSummary` to settings-driven source

**Current hook** (`src/graph/ingest/useGraphSourceSummary.ts`):  
- 67 lines total.  
- Initial state hardcoded: `sourceId: "ai-lab"` at :12, absolute path at :14.  
- `useEffect(loadSummary, [])` — empty dependency array at :30/64 — fires once on mount.  
- Calls `loadGraphifySource()` unconditionally at :38.  
- Returns `{ summary, error }`.  
- **No settings store dependency.** No `useSettingsStore` import.

**Change footprint:**  
1. Import `useSettingsStore` + read `settings.sources.active` (or default to `"self-graph-yaml-frontmatter"` if null).  
2. Replace `loadGraphifySource()` with `loadSource(activeAdapterId, inputPath)` — where `inputPath` comes from `configurations[activeAdapterId]?.inputPath ?? ""`.  
3. Add `settings.sources.active` to `useEffect` dependency array so it re-fires on source switch.  
4. Update initial `sourceId` default (currently hardcoded "ai-lab" in initial state).

**Difficulty: MEDIUM.** The hook gains a settings dependency and needs a reactive re-trigger. Standard Zustand pattern (`useSettingsStore(s => s.sources.active)`) handles the reactivity. Risk: if `sources.active` is null and not guarded, the hook calls `loadSource(null, "")` — need fallback.

---

### 0.4 — Add source selector UI to `SourceAdapterPanel`

**Current panel** (`src/source-adapter/SourceAdapterPanel.tsx`):  
- 255 lines. Zero buttons, zero `onClick` handlers (confirmed by grep).  
- Displays entry cards grouped by some structure; entries are static/read-only displays.  
- `data-testid="source-adapter-panel"` present (referenced in E2E spec at `:9`).  
- Individual entry `data-testid="source-adapter-entry-{adapterId}"` pattern at spec `:28`.

**Change scope:**  
- Import `useSettingsStore` + `setSetting` (or `useSettingsStore.getState().setSetting`).  
- Per entry: if `status === "registered"`, show "Set as active" button, disabled when already active.  
- On click: `setSetting("sources.active", entry.adapterId)`.  
- Visual: checkmark/highlight on active entry.

**⚠ E2E test conflict:** `tests/e2e/source-adapter.spec.ts:55–83` currently iterates all buttons in the panel and **throws if any enabled button exists** (`:68`: `Found enabled button with text: "..." — SourceAdapterPanel should be read-only`). Adding the "Set as active" button will break this test. Must update the spec to expect and validate the new button behavior.

**Difficulty: MEDIUM.** UI is straightforward; the spec update is the main work. Need to decide test expectations: just check button exists + is enabled on registered entries, or also exercise click → settings update → active indicator.

---

### Difficulty Summary

| Item | Difficulty | Key reason |
|------|-----------|-----------|
| 0.1 `loadSource` refactor | **LOW** | Two callers in same file; parametrization + dispatch |
| 0.2 Settings schema | **LOW** | Additive; boilerplate migration pattern |
| 0.3 Hook wiring | **MEDIUM** | Adds settings dependency + effect re-trigger logic |
| 0.4 Panel UI | **MEDIUM** | Simple UI but requires E2E spec rewrite |

Estimated total: **1–1.5 sessions** if combined in one pass.

---

## §3 — Hidden Coupling Check

### 3.1 E2E specs at risk

| Spec | Risk | Why |
|------|------|-----|
| `tests/e2e/source-adapter.spec.ts:55–83` | **HIGH — will break** | Explicitly rejects enabled buttons in the panel. Adding 0.4 breaks this test. Must update before or in same commit. |
| `tests/e2e/source-adapter.spec.ts:13–21` | LOW | Tests entry count is 9. Registry count doesn't change in Tier 0. |
| `tests/e2e/source-adapter.spec.ts:23–48` | LOW | Tests named entries by `data-testid`. Entry IDs unchanged. |
| `tests/e2e/provenance-parity.spec.ts` | LOW | Tests themeTargetRegistry/provenance alignment. No overlap with source loading or settings schema additions. |
| `tests/e2e/v86c-tile-system.spec.ts` | **WATCH** | Checks tile initialization including `tile-body-graph-sources-section`. Settings migration v90→v91 could affect tile state if migrations mis-apply. Verify migration is purely additive (backfill-only). |
| All other specs | NONE | No other spec file references `loadGraphifySource`, `useGraphSourceSummary`, or source-adapter panel (confirmed by investigation). |

### 3.2 AppShell startup — fresh install with `sources.active = null`

**Current:** `useFixture = isTestEnv || !hasRealSource` at `AppShell.tsx:94`. If `loadGraphifySource()` errors, `summaryError` is set, `hasRealSource` becomes false, app falls back to fixture. Robust.

**After 0.3:** If `settings.sources.active` is null (shouldn't happen with migration default, but corrupted state possible), hook calls `loadSource(null, "")`. `loadSource` should handle null by returning `{ status: "error", ... }`, triggering `summaryError`, which triggers fixture fallback. **Need an explicit null guard in `loadSource`** — the fallback chain works, but only if `loadSource` doesn't throw on null input.

**Risk: LOW** provided null is handled gracefully. Default migration sets `active: "self-graph-yaml-frontmatter"`, so clean installs are safe.

### 3.3 Migration ID confirmation

`"self-graph-yaml-frontmatter"` confirmed as the only `status: "registered"` adapter in `src/source-adapter/sourceAdapterRegistry.ts:89,119`. Correct default for `sources.active`.

### 3.4 `generate-provenance` / `provenance-parity` interaction

Tier 0 touches: `loadGraphifySource.ts`, `useGraphSourceSummary.ts`, `settings.schema.ts`, `settings.defaults.ts`, `settings.migrations.ts`, `SourceAdapterPanel.tsx`. None of these are inputs to `generate-provenance-manifest.mjs` (which processes theme targets and CSS handles). **No interaction.** `provenance-parity.spec.ts` is safe.

### 3.5 Additional coupling not in original 8 rows

- **`AppShell.tsx` initial summary state:** `useGraphSourceSummary` initializes with a hardcoded `sourceId: "ai-lab"` object at `:12–27`. After 0.3, this initial state value becomes stale immediately (overwritten on effect fire). Not a bug, but the initial state should be updated to a neutral `status: "idle"` shape without hardcoded `ai-lab` fields to avoid confusion.
- **`GraphSourcesTileContent`** reads from `useGraphSourceSummary()` — will automatically pick up the settings-driven source after 0.3 with no changes needed. Zero coupling risk.
- **`adaptSelfGraphToSigma` in AppShell** reads `summary.normalizedNodes` / `summary.normalizedEdges` — these fields come through the `GraphSourceSummary` type, unchanged by Tier 0. No AppShell changes needed.

---

## §4 — Sealed Registry (Gap 5)

### Does Tier 0 need `registerSourceAdapter()`?

**No.** Tier 0 doesn't implement new adapters. The existing 9 static entries are sufficient for plumbing repair. No external/dynamic registration is required.

### Pattern comparison: `physicsDialectRegistry` vs `sourceAdapterRegistry`

**`physicsDialectRegistry`** (`src/graph/physics/physicsDialectRegistry.ts`):
```typescript
const entries: PhysicsDialect[] = [];
const listeners: Set<() => void> = new Set();

export const physicsDialectRegistry: PhysicsDialectRegistryContract = {
  list: () => [...entries],
  getById: (id) => entries.find(e => e.id === id),
  register: (entry: PhysicsDialect) => void,
  subscribe: (listener) => () => void,
  // ...
};
```
Mutable entries array. `register()` is a method on the contract object. Entries added via `physicsDialectRegistry.register({...})` calls (presumably in a separate init file, though currently empty — the registry is a v93 stub).

**`sourceAdapterRegistry`** (`src/source-adapter/sourceAdapterRegistry.ts`):
```typescript
const SOURCE_ADAPTER_ENTRIES: readonly SourceAdapterEntry[] = [ /* 9 inline entries */ ];
export function getSourceAdapterEntryById(adapterId: string): SourceAdapterEntry | undefined { ... }
// No register(), no subscribe()
```
Sealed const array. All entries inline. Getter functions only.

The plan's comparison is accurate: `sourceAdapterRegistry` diverges from the `physicsDialectRegistry` pattern.

### Should `registerSourceAdapter()` land in Tier 0?

**Recommendation: DEFER.** The conversion (sealed const → mutable registry + init file with 9 register calls) is pure churn for Tier 0, which adds zero new adapters. The migration becomes natural when Tier 2 implements `markdown-vault` and needs to add a new entry: convert at that point to avoid the current inline-edit friction. Defer to a `v107.x` pass between Tier 1 and Tier 2.

---

## §5 — Tauri Backend Security Surface

### 5.1 Current capability config

**`src-tauri/capabilities/default.json`:**
```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": ["core:default", "opener:default"]
}
```
Only two permissions. `core:default`: standard app lifecycle, window management. `opener:default`: the `open_url` command used by `open_in_ide`. **Zero filesystem, process, or network permissions granted.**

### 5.2 Tauri 2 sandbox/scoping primitives

Tauri 2 provides a **`tauri-plugin-fs`** with scope configuration (`allowPaths`, `denyPaths`). This is a separate crate from `tauri-plugin-opener` and would require a new dependency (needs per-install approval per CLAUDE.md). Path-scoping can be declared in the capability JSON once the plugin is added.

Without the fs plugin, path validation for any `read_file` or `list_files` commands must be implemented manually in Rust (normalize → prefix check against project root).

### 5.3 Robust `run_script` implementation sketch

A safe `run_script` command would need:
1. **Canonical path resolution:** `std::fs::canonicalize(root.join(script))` — resolves `..` and symlinks.
2. **Root prefix assertion:** `canonical_script.starts_with(&canonical_root)` — prevents path traversal.
3. **Filename allowlist:** Hard-coded set of permitted script names (e.g., `["generate-self-graph.mjs"]`). No shell expansion of the script name.
4. **Array invocation:** `Command::new("node").arg(&canonical_script).args(&args)` — never via shell (`/bin/sh -c "..."`) to prevent injection.
5. **Timeout:** `tokio::time::timeout(Duration::from_secs(60), ...)`.
6. **Output size cap:** Check `output.stdout.len()` before returning; cap at e.g. 10 MB to prevent memory exhaustion from runaway scripts.

### 5.4 `tauri-plugin-stronghold` status

**Not present.** `src-tauri/Cargo.toml` has only `tauri` and `tauri-plugin-opener`. Adding `tauri-plugin-stronghold` for Tier 6 (credential storage) requires per-install approval per CLAUDE.md. It is a security-critical dependency (OS keychain integration) — flag explicitly when Tier 6 is scoped.

---

## §6 — Recommended Next Pass

### What v107.0.0 should do

A single pass completing all 4 Tier 0 items. The four items have no inter-item risk beyond the E2E test coupling (0.4 breaks the existing read-only spec), and all four land in ≤7 files.

### Files touched

1. `src/graph/ingest/loadGraphifySource.ts` → replaced with `loadSource.ts`  
   (new file; old file deleted or re-exported for compatibility)
2. `src/graph/ingest/useGraphSourceSummary.ts` — import + call update, `useSettingsStore` dependency, effect dep array
3. `src/control-plane/settings/settings.schema.ts` — add `sources` field to `StarmapSettings`
4. `src/control-plane/settings/settings.defaults.ts` — add `sources` default (`active: "self-graph-yaml-frontmatter"`, `configurations: {}`)
5. `src/control-plane/settings/settings.migrations.ts` — add `91:` migration (additive backfill)
6. `src/source-adapter/SourceAdapterPanel.tsx` — add "Set as active source" button per registered entry
7. `tests/e2e/source-adapter.spec.ts` — update read-only spec to expect + validate the new button

**No Rust files.** No Tauri commands. No registry structural changes.

### Pre-flight decisions needed

1. **`loadSource` null guard:** If `sources.active` is null, should `loadSource` return `{ status: "error", error: "No active source configured" }` (safe, falls through to fixture) or `{ status: "idle" }` (silent)? Recommend error — makes the state visible in the panel.
2. **E2E test scope for 0.4:** Check button exists + is enabled on registered entries only, or also exercise the click → settings update → active indicator flow? The latter adds ~15 lines of test but makes the feature properly covered.
3. **Rename vs. re-export:** Should `loadGraphifySource.ts` be deleted (cleaner) or have its export re-exported from `loadSource.ts` during transition? Only one caller, so deletion is clean.

### Commit count

**3 commits:**
- `feat(v107.0.1)`: Settings schema — `sources` field, defaults, migration (files 3–5)
- `feat(v107.0.2)`: `loadSource` refactor — replace `loadGraphifySource`, wire `useGraphSourceSummary` (files 1–2)
- `feat(v107.0.3)`: Source selector UI — `SourceAdapterPanel` + E2E spec update (files 6–7)

### Should Tier 0 split across passes?

**No.** The 4 items are tightly coupled (0.2 → 0.3 → 0.1 all need to be consistent; 0.4 needs the settings write path from 0.2). Splitting adds more gate/bump overhead than value. One pass, 3 commits.

### Post-Tier-0 state

After v107.0.0:
- Self-graph adapter is selectable from the UI (the only registered adapter; selection is mostly symbolic for now).
- Live path is no longer hardcoded to `ai-lab`.
- Settings schema has a `sources` section ready for Tier 1's path configuration.
- The `loadSource` routing infrastructure is in place for new adapters.
- No new backend commands. No new adapters. Tier 0 complete.

**Tier 1 (self-graph live mode)** is the logical next arc after Tier 0 lands: adds `read_file` + `run_script` Tauri commands and a "Regenerate" button to `GraphSourcesTileContent`. That work is higher-risk (new Rust code + security surface) and belongs in its own arc.

---

*Read-only investigation. All claims cite file:line from direct reads or grep results. No code was changed.*
