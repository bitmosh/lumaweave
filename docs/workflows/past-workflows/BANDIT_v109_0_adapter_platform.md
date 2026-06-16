# Bandit — v109.0: Source Adapter Platform (Tier 2 infrastructure)

Opens v109 (Source Adapter Platform arc). Lands the platform foundation that 4 adapters will plug into across v109.1–v109.4. Implements the SDK contract specified in `~/Projects/future-integration/SDK_SPEC.md` v0.1. No adapters built this pass — purely platform + scaffolding.

Per Ryan's minor-version-per-adapter scheme: v109.0 = platform; v109.1 = markdown-vault (Obsidian); v109.2 = Cytoscape JSON; v109.3 = package-dependency; v109.4 = CSV; v109.5 (or whenever the close lands) = arc close.

Basis docs (read these first, in order):
- `~/Projects/future-integration/SDK_SPEC.md` — the SDK contract (authoritative)
- `~/Projects/future-integration/INTEGRATION_FUTURES.md` — why the forward-compat hooks exist
- `~/Projects/future-integration/SHARED_SCHEMA.md` — the cerebra-graph.json contract (informs the export envelope convention)
- `docs/prototypes/v109_adapter_portfolio_report.md` — strategic context

ONE pass, FOUR commits with merge gates between each.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (run in order for EACH of the 4 commits)
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this. Then proceed to next commit.

No semver bump this pass (v109.0 opens the arc; close lands at v109.5 with the minor bump to 0.16.0). Each commit gets a patch-level internal version.

## Locked decisions (carried in from SDK_SPEC §10 resolution + Ryan's confirmation)

1. **`LoaderFn` is a union type, not generic.** Adapters declare their `AdapterConfig` shape via discriminated union (keyed by `adapterId`); each adapter's `load()` does a small type-guard at the entry. Avoids generic-inference pain across the `Map.get()` dispatch.
2. **`loadSource(adapterId)` — single parameter.** Drop the `inputPath` parameter from v108. All per-invocation data comes from `sources.configurations[adapterId]` via `buildAdapterConfig()`.
3. **Truncation order is DEFERRED to v109.1** (when markdown-vault is built). Ryan's lean: by modification date descending ("most recent thinking first"). Not implemented in this pass; the limit declaration in `SourceAdapterEntry.limits.maxNodes` stays as metadata until the markdown-vault loader enforces it.
4. **All forward-compatibility hooks from SDK_SPEC are implemented.** `coupling?: "external" | "sibling-module"` field on `SourceAdapterEntry`. `transport` + `extensions` fields validated in the file-envelope path. No `"live"` transport implementation (rejected at parse time with a clear error).
5. **Cerebra-aware scaffolding is documentation + interface fields only.** No `cerebra-vault` adapter built or registered. The hooks exist so the future Cerebra integration has somewhere to land.

## Security: maintaining the v108 audit-by-eyeball discipline
The new `list_files` Tauri command extends the security model from v108. Same principles apply:
- No `tauri-plugin-fs`. Manual `canonicalize → starts_with` validation.
- Per-adapter root from settings (passed from frontend), not project-root. This is the v108-deferred D1 decision; resolve here with manual Rust against user-configured root.
- The Rust must stay small and reviewable by eyeball (~30 lines for `list_files`, similar to `read_file`).
- Symlinks NOT followed (prevents loops).
- Max depth cap (default 20, hard cap 50) prevents pathological recursion.

---

## Commit 1 — `feat(v109.0.1): SDK contract — BaseSourceAdapter, family bases, settings schema 92→93`

The SDK interfaces + the settings schema migration. All TypeScript, no Rust.

**Files (explicit paths only):**
- `src/source-adapter/baseSourceAdapter.ts` — NEW. `BaseSourceAdapter` interface, `AdapterFamily` type, `AdapterCapabilities` type, `AdapterConfig` union (discriminated by `adapterId`), per-adapter config interfaces (`MarkdownVaultConfig`, `CytoscapeJsonConfig`, `PackageDependencyConfig`, `CsvEdgeListConfig` — note: just the type shapes, no logic).
- `src/source-adapter/directoryAdapter.ts` — NEW. Abstract `DirectoryAdapter` base class. `listFiles()` and `readVaultFile()` are stubbed to throw "Not yet wired to Tauri" — they get implemented in Commit 3 when `list_files` exists. The class structure ships now so v109.1 can subclass it.
- `src/source-adapter/singleFileAdapter.ts` — NEW. Abstract `SingleFileAdapter` base class. `readFile()` wraps the existing v108 `read_file` Tauri invoke. This one CAN be fully wired today since `read_file` exists.
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. Add optional `coupling?: "external" | "sibling-module"` field to `SourceAdapterEntry` interface (default `"external"` when reading). All existing 9 entries get explicit `coupling: "external"` for clarity (cerebra-vault is not added — it's not yet a candidate; that lands in a later arc).
- `src/control-plane/settings/settings.schema.ts` — MODIFIED. `SourcesSettings.configurations` type narrowed from `Record<string, { inputPath?: string }>` to `Record<string, AdapterConfig>`. Schema version 92 → 93.
- `src/control-plane/settings/settings.defaults.ts` — MODIFIED. `defaultSources` shape unchanged in practice (empty `configurations` map), but the type narrowing means TypeScript will catch any future inconsistency.
- `src/control-plane/settings/settings.migrations.ts` — MODIFIED. Add `93:` migration. Purely additive: `93: (s) => ({ ...s, version: 93, sources: { ...s.sources, configurations: s.sources?.configurations ?? {} } })`. Existing `configurations` entries pass through; old `{ inputPath?: string }` shape is forward-compatible (it's a subset of all per-adapter configs structurally — TypeScript will catch any runtime issues during adapter implementation in v109.1+).
- `src/control-plane/settings/settings.store.ts` — MODIFIED. Bump `CURRENT_SCHEMA_VERSION` to 93.

**Pre-flight (verify, report, STOP if anything diverges):**
1. Confirm v108 closed clean: HEAD is at 0.15.0, schema 92, `loadSource(adapterId, inputPath)` exists with the inputPath parameter, no `coupling` field on `SourceAdapterEntry`.
2. Confirm all 9 existing entries in `sourceAdapterRegistry.ts` have complete `translationSet`, `limits`, `inputPattern`, `qaReportFormat`.
3. Confirm `~/Projects/future-integration/SDK_SPEC.md` is accessible (the authoritative reference).

**Implementation notes:**
- The discriminated union shape:
  ```typescript
  type AdapterConfig =
    | MarkdownVaultConfig
    | CytoscapeJsonConfig
    | PackageDependencyConfig
    | CsvEdgeListConfig;
  ```
  Each interface has `adapterId: "<literal>"`. Type-guards in adapter `load()` implementations narrow via the literal. No generic parameters.
- `BaseSourceAdapter.load(config: AdapterConfig)` — takes the *union*, not a generic. Each concrete adapter's `load` does `if (config.adapterId !== "markdown-vault") { /* type-impossible-but-runtime-safe */ }` at the entry.
- `DirectoryAdapter.listFiles()` and `readVaultFile()` ship as stubs that throw — they reference functions in `tauriInvoke.ts` that don't exist until Commit 3. The class structure is what v109.1 will subclass, so it has to exist now; the methods just need to be present (even if non-functional) for typecheck.

**Verify:**
- `npm run typecheck` 0 errors.
- `npm run lint:css` 0.
- Full E2E foreground baseline: should hold (672/0/16 from v108). The schema 92→93 migration mirrors the proven v107/v108 pattern; tile-system spec should remain green.
- **No manual smoke needed** — no user-visible changes this commit. Types only.

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v109.0.1): SDK contract — BaseSourceAdapter, family bases, settings schema 92→93`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 2 — `feat(v109.0.2): registerSourceAdapter() — registry conversion + dispatch refactor`

Converts the const-array registry to a register-based pattern matching `physicsDialectRegistry`. Refactors `loadSource.ts` to use a `Map<string, LoaderFn>` and the simplified single-parameter signature.

**Files (explicit paths only):**
- `src/source-adapter/sourceAdapterRegistry.ts` — MODIFIED. The big one. Convert `const SOURCE_ADAPTER_ENTRIES: readonly SourceAdapterEntry[] = [...] as const` to:
  ```typescript
  const entries: SourceAdapterEntry[] = [];
  const loaderMap = new Map<string, LoaderFn>();
  const listeners: Array<() => void> = [];
  
  export function registerSourceAdapter(entry: SourceAdapterEntry, loader: LoaderFn): void { ... }
  export function subscribeSourceAdapters(listener: () => void): () => void { ... }
  // Existing getters: getAllSourceAdapterEntries, getSourceAdapterEntryById — unchanged signatures, read from entries[]
  // NEW: getSourceAdapterLoader(id: string): LoaderFn | undefined — reads from loaderMap
  ```
  Then convert each of the 9 existing entries to a `registerSourceAdapter({...}, selfGraphLoader | candidateNoOpLoader)` call at the bottom of the file. The 8 candidate entries register with a `candidateNoOpLoader` that returns `errorSummary(...)` with "Adapter not yet implemented" — same behavior as today, just routed through the new dispatch.
- `src/graph/ingest/loadSource.ts` — MODIFIED. **Signature change:** `loadSource(adapterId: string | null): Promise<GraphSourceSummary>` — drop the second parameter. Replace the hardcoded `if (adapterId === "self-graph-yaml-frontmatter")` with the loader-map dispatch from SDK_SPEC §5. Inside dispatch:
  ```typescript
  const config = buildAdapterConfig(adapterId);  // reads from settings
  const loader = getSourceAdapterLoader(adapterId);
  if (!loader) return errorSummary(...);
  return loader(config);
  ```
- `src/graph/ingest/buildAdapterConfig.ts` — NEW. Pure function. Reads `useSettingsStore.getState().sources.configurations[adapterId]` and returns the discriminated `AdapterConfig`. Synchronous; called from `loadSource.ts`. Note: per CLAUDE.md / known-sharp-edges, `useSettingsStore.getState()` is the correct read-from-outside-React-render pattern.
- `src/graph/ingest/loadSelfGraph.ts` — MODIFIED. Update the self-graph loader to take `AdapterConfig` (specifically a new `SelfGraphConfig` shape with the cached project-root pattern preserved from v108). Lazy module-level cache for project root stays as-is. The loader is registered via `registerSourceAdapter(selfGraphEntry, loadSelfGraph)` at registry construction time.
- `src/graph/ingest/useGraphSourceSummary.ts` — MODIFIED. Update the call from `loadSource(activeAdapterId, inputPath)` to `loadSource(activeAdapterId)`. The `inputPath` effect-dependency stays in the dependency array but is no longer passed (it's now read by `buildAdapterConfig` inside `loadSource`).

**Pre-flight (verify, report, STOP):**
1. Confirm Commit 1 (v109.0.1) is on HEAD.
2. Confirm `physicsDialectRegistry.ts:28-56` is the reference pattern. Quote the actual lines for sanity.
3. Confirm all 9 current adapter entries in the registry — list their adapterIds.
4. Confirm only ONE caller of `loadSource` exists: `useGraphSourceSummary.ts:38` (or wherever it now lives).

**Implementation notes:**
- Add `SelfGraphConfig` to the discriminated union in `baseSourceAdapter.ts` (Commit 1 file — backport edit, or include in this commit). Decision: include in this commit since it's coupled with the self-graph loader refactor. Note this in the report.
- The `candidateNoOpLoader` is a single shared function that returns `errorSummary(adapterId, entry.adapterType, "Adapter not yet implemented")`. Register each candidate with this same loader; saves boilerplate.
- The `subscribeSourceAdapters` pattern from SDK_SPEC §5 isn't load-bearing in v1.0 (all registration is synchronous module-init). Implement the function correctly but don't wire it to anything yet. v109.1+ adapters' UI may use it; the plugin model would use it if it ever lands.

**Verify:**
- `npm run typecheck` 0 errors.
- `npm run lint:css` 0.
- Full E2E foreground baseline: 672/0/16 must hold. The self-graph still loads, the source-adapter panel still shows 9 entries with 1 registered + 8 candidates.
- **Manual smoke:** open the app — self-graph still renders. Open SourceAdapterPanel — all 9 entries listed as today. Click "Set as active" on a different (candidate) adapter — it sets active but the load reports "Adapter not yet implemented" cleanly (no crash).

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v109.0.2): registerSourceAdapter() API — registry conversion + Map-based dispatch + single-param loadSource()`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 3 — `feat(v109.0.3): list_files Tauri command + DirectoryAdapter wiring`

Adds the new Tauri command for directory traversal. Wires `DirectoryAdapter.listFiles()` and `readVaultFile()` to it. This is the Rust commit; the security surface widens here. NO new dependencies. Manual canonicalize-and-starts_with against a user-configured root (per-adapter, not project-root).

**Files (explicit paths only):**
- `src-tauri/src/fs.rs` — MODIFIED. Add `list_files` and `read_vault_file` commands. Both validate against a *user-configured root* parameter (passed by the caller), NOT `get_project_root_inner()`. Same `canonicalize → starts_with(canonical_root)` security pattern. `list_files` also enforces: extension filter (whitelist), exclude-prefixes filter, max_depth cap, no symlink-following.
- `src-tauri/src/lib.rs` — MODIFIED. Register the two new commands in `invoke_handler!`.
- `src/lib/tauriInvoke.ts` (or wherever the existing wrapper lives — confirm in pre-flight) — MODIFIED. Add typed wrappers: `invokeListFiles(root, extensions, excludePrefixes, maxDepth)` and `invokeReadVaultFile(root, relativePath)`. The mock-shim path from v108 continues to work — these new commands are mockable via `__lwTauriMock`.
- `src/source-adapter/directoryAdapter.ts` — MODIFIED. Replace the throwing stubs from Commit 1 with real implementations that call the typed Tauri wrappers.

**Pre-flight (verify, report, STOP):**
1. Confirm Commits 1 + 2 are on HEAD.
2. Confirm the v108 `read_file` command shape in `src-tauri/src/fs.rs` — quote the canonicalize+starts_with lines.
3. Confirm the Tauri invoke wrapper file path (from v108.0.2 — likely `src/lib/tauriInvoke.ts`).
4. Confirm tokio's `time` feature is in `Cargo.toml` from v108. (Not used by `list_files` directly, but confirm the dependency surface hasn't drifted.)
5. **STOP if any Cargo.toml change would be needed.** This pass uses only existing dependencies (`std::fs`, `walkdir` if you propose it — DON'T, use plain `std::fs::read_dir` recursion).

**Rust — `list_files`:**
```rust
// Security: caller provides a user-configured root; we validate every yielded path
// is canonical and within that root. No symlink-following. Capped recursion depth.
#[tauri::command]
async fn list_files(
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
            // Final canonicalize + scope check (defense in depth)
            let canonical_path = std::fs::canonicalize(&path)
                .map_err(|e| format!("Canonicalize failed: {e}"))?;
            if !canonical_path.starts_with(canonical_root) {
                return Err(format!("Path escapes root: {}", path.display()));
            }
            // Return relative path
            let relative = canonical_path.strip_prefix(canonical_root)
                .map_err(|e| format!("Strip prefix failed: {e}"))?
                .to_string_lossy()
                .to_string();
            out.push(relative);
        }
    }
    Ok(())
}
```
Keep the security comments at the top. The defense-in-depth canonicalize-on-each-file is intentional — yes it's redundant with the dir-walking from a canonical root, but it catches edge cases like TOCTOU where a directory is replaced by a symlink between `read_dir` and the file check.

**Rust — `read_vault_file`:**
```rust
// Same shape as read_file but validates against a user-configured root, not project_root.
#[tauri::command]
async fn read_vault_file(root: String, relative_path: String) -> Result<String, String> {
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

**Frontend wrappers:** add typed `invokeListFiles` and `invokeReadVaultFile` to the existing wrapper. Both go through the mock-shim path (the `__lwTauriMock[cmd]?.(args)` check from v108.0.2).

**`DirectoryAdapter` implementation:** replace the Commit 1 stubs with calls to the typed wrappers. `listFiles(root, extensions, excludePrefixes)` → `invokeListFiles(root, extensions, excludePrefixes, 20)`. `readVaultFile(root, relativePath)` → `invokeReadVaultFile(root, relativePath)`.

**Verify:**
- `cd src-tauri && cargo build` clean.
- `npm run typecheck` 0, `npm run lint:css` 0.
- Full E2E foreground: 672/0/16 baseline. No new specs this commit — `DirectoryAdapter` has no concrete users until v109.1.
- **Manual smoke (Ryan, `npm run tauri dev`):** self-graph still loads, app still works. No visible change (no DirectoryAdapter consumers exist yet). Open devtools — no errors.

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v109.0.3): list_files + read_vault_file Tauri commands + DirectoryAdapter wiring`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 4 — `feat(v109.0.4): SourceAdapterPanel per-adapter settings scaffolding`

Adds the per-adapter settings sub-panel scaffolding to `SourceAdapterPanel`. Each adapter gets a placeholder settings section that reads/writes `sources.configurations[adapterId]`. Empty for now — v109.1+ adapters fill in their specific fields (vault root text input for markdown-vault, file path for cytoscape-json, etc.). The scaffolding ships now so v109.1's prompt is "fill in the markdown-vault config sub-panel" rather than "add settings UI from scratch."

**Files (explicit paths only):**
- `src/source-adapter/SourceAdapterPanel.tsx` — MODIFIED. Below each entry card (when that entry is `active`), render a "Configuration" section. For the active adapter, the section renders an `AdapterConfigForm` component (new) that delegates to a per-adapter form lookup.
- `src/source-adapter/AdapterConfigForm.tsx` — NEW. Dispatch component. Reads `useSettingsStore(s => s.sources.configurations[adapterId])`, renders the matching per-adapter form, or a `null` if no form is registered for that adapter (the case for all 8 candidates today, and self-graph which doesn't need user config).
- `src/source-adapter/adapterConfigFormRegistry.ts` — NEW. Simple registry: `Map<adapterId, React.FC<{ config, onChange }>>`. Exports `registerAdapterConfigForm(adapterId, component)` and `getAdapterConfigForm(adapterId)`. Empty in v109.0 — v109.1+ adapters register their own forms.
- `tests/e2e/source-adapter.spec.ts` — MODIFIED. Add a small test: the active entry's card shows a Configuration section (even if empty). The non-active entries do not. Keep all existing tests from v107.0.3 passing.

**Pre-flight (verify, report, STOP):**
1. Confirm Commits 1–3 are on HEAD.
2. Confirm `SourceAdapterPanel.tsx` structure from v107.0.3 — quote the entry-card render loop.
3. Confirm the existing E2E spec covers the "Set as active" flow from v107.0.3 — that's preserved as a baseline regression check.

**Implementation notes:**
- The `AdapterConfigForm` is small — ~30 lines. It just renders whatever's in the registry, or null.
- No forms register in this commit. `adapterConfigFormRegistry.ts` ships empty. v109.1 adds the markdown-vault form via `registerAdapterConfigForm("markdown-vault", MarkdownVaultConfigForm)`.
- The Configuration section testid: `data-testid="adapter-config-{adapterId}"`. The empty-state testid: `data-testid="adapter-config-empty"` (rendered when no form is registered — useful for v109.1's smoke check).

**Verify:**
- `npm run typecheck` 0, `npm run lint:css` 0.
- Full E2E foreground: 672/0/16 baseline; the new "Configuration section appears on active entry" test passes.
- **Manual smoke:** open SourceAdapterPanel — active entry (self-graph) shows a "Configuration" section that's empty (no form registered). Click "Set as active" on another entry → it becomes active → its Configuration section shows empty too. No crashes.

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v109.0.4): SourceAdapterPanel per-adapter settings scaffolding (AdapterConfigForm registry)`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## END-OF-RUN REPORT after each commit (#changelog)
Each commit's report: files committed (explicit list), pre-flight findings, verification numbers, manual smoke notes, any divergences from prompt.

**Final report (after Commit 4)** additionally:
- Landed-state audit across all 4 commits.
- v109.0 arc-opener complete; v109.1 (markdown-vault) is teed up.
- All forward-compatibility hooks present (`coupling`, `extensions`, `transport`).
- `SDK_SPEC.md` should be updated to reflect any spec amendments surfaced by implementation. If the implementation matched the spec verbatim, note "spec held — no amendments needed." If anything diverged (e.g. a field name changed, a signature was simpler than specced), note the amendment and update the spec file.
- 672/0/16 baseline preserved.

## Hard stops
- **No installs.** No new Rust crates. No new npm packages. Only existing deps.
- **No `tauri-plugin-fs` or `tauri-plugin-shell`.** Manual Rust validation continues.
- **No semver bump this pass.** v109.0 opens the arc; the close (v109.5 or whenever) bumps minor.
- Explicit-path git (NEVER `git add -A`). Playwright foreground. Discord MCP only.
- **NO adapters built this pass.** No markdown-vault loader, no Cytoscape parser, no package-dependency reader, no CSV parser. The 8 candidate entries stay candidates. v109.0 is platform; v109.1+ are adapters.
- **NO `cerebra-vault` entry added.** It's mentioned in scaffolding docs (SDK_SPEC, INTEGRATION_FUTURES) but doesn't appear in the registry. The cerebra-vault adapter lands in a future arc when Cerebra reaches the maturity to ship it.
- Preserve `GraphSourceSummary` return shape — AppShell's `hasRealSource` chain depends on it.
- If a real regression appears (anything beyond intentional v109.0 changes), STOP and report. Do not loosen tests to make them pass.
- The Rust `list_files` walk must NOT follow symlinks. The defense-in-depth canonicalize-per-file is intentional; don't optimize it away.
