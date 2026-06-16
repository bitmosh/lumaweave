# Bandit — v109.0.2: registerSourceAdapter() API + dispatch refactor + signature simplification

Second commit of the v109.0 platform pass. Converts the const-array registry to a register-based pattern (Gap 5 resolution from the v107 plan), introduces the Map-based dispatch in loadSource.ts, and simplifies the `loadSource(adapterId, inputPath)` signature to `loadSource(adapterId)`. Cleans the v109.0.1 type-assertion bridge in useGraphSourceSummary as part of the signature change.

Basis: `~/Projects/future-integration/SDK_SPEC.md` §5 (Registration & Dispatch) + the v109.0.1 commit (`087a10e`).

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`. ONE commit this pass.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump (v109 arc-close bumps minor at v109.5).

## Targeted test scope for this commit

**New convention starting this pass:** verification runs only the test files directly affected by the changes. The full suite is no longer a per-commit gate; it's a manual checkpoint at arc close. This prevents the suite-timing flake problem (full suite > Bash 10-min cap) from contaminating verification.

For v109.0.2, the verification scope is:
- `tests/e2e/source-adapter.spec.ts` — registry conversion changes the underlying API surface
- `tests/e2e/graph-sources.spec.ts` — Regenerate flow routes through loadSource
- `tests/e2e/settings-migrations.spec.ts` — sanity, no schema change but adjacent

If any of these go red, STOP and report — that's a real signal. Anything outside this scope is out of scope for this commit's verification; pre-existing flakes are not Bandit's problem.

## Locked decisions carried in
- **LoaderFn is a union type** (not generic). Discriminated AdapterConfig union from v109.0.1; each loader does a type-guard at entry.
- **loadSource(adapterId)** — single parameter. The `inputPath` arg from v108 goes away. All per-invocation data comes from `sources.configurations[adapterId]` via `buildAdapterConfig`.
- **registerSourceAdapter(entry, loader)** — single call registers both entry + loader; mirrors physicsDialectRegistry pattern.
- **8 candidate adapters register with a shared candidateNoOpLoader** that returns the same "not yet implemented" error they return today.

## Pre-flight (verify, report, STOP if anything diverges)
1. Confirm v109.0.1 (commit `087a10e`) is on HEAD.
2. Confirm `sourceAdapterRegistry.ts` currently has `const SOURCE_ADAPTER_ENTRIES: readonly SourceAdapterEntry[] = [...] as const` shape with 9 entries (1 registered + 8 candidates), all stamped `coupling: "external"`.
3. Confirm `loadSource.ts` currently has the hardcoded `if (adapterId === "self-graph-yaml-frontmatter")` dispatch with the `loadSource(adapterId, inputPath)` two-parameter signature.
4. Confirm `useGraphSourceSummary.ts` contains the v109.0.1 type-assertion bridge for `.inputPath` (the temporary cast Bandit landed last commit).
5. Confirm `physicsDialectRegistry.ts:28–56` is the reference pattern (quote the actual `register`/`subscribe`/`listeners` lines).
6. Confirm only ONE caller of `loadSource` exists: `useGraphSourceSummary.ts` (grep to confirm).

## Files to commit (explicit paths only)

- `src/source-adapter/sourceAdapterRegistry.ts` — the registry conversion
- `src/graph/ingest/loadSource.ts` — Map-based dispatch + single-parameter signature
- `src/graph/ingest/buildAdapterConfig.ts` — NEW, reads from settings
- `src/graph/ingest/loadSelfGraph.ts` — updated to accept AdapterConfig
- `src/graph/ingest/useGraphSourceSummary.ts` — single-parameter call + type-assertion cleanup
- `src/source-adapter/baseSourceAdapter.ts` — add SelfGraphConfig to the AdapterConfig union (backport edit)

DO NOT touch any other file. Hard stop if scope creep.

## Implementation notes

### sourceAdapterRegistry.ts conversion
Convert the const-array shape to:

```typescript
const entries: SourceAdapterEntry[] = [];
const loaderMap = new Map<string, LoaderFn>();
const listeners: Array<() => void> = [];

export function registerSourceAdapter(entry: SourceAdapterEntry, loader: LoaderFn): void {
  entries.push(entry);
  loaderMap.set(entry.adapterId, loader);
  listeners.forEach(l => l());
}

export function subscribeSourceAdapters(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getSourceAdapterLoader(id: string): LoaderFn | undefined {
  return loaderMap.get(id);
}

// Existing getters keep their signatures, read from entries[]:
export function getAllSourceAdapterEntries(): readonly SourceAdapterEntry[] { return entries; }
export function getSourceAdapterEntryById(id: string): SourceAdapterEntry | undefined { ... }
```

Then convert each of the 9 existing entries from inline-in-const-array to a `registerSourceAdapter({...}, <loader>)` call at the bottom of the file:
- self-graph entry → `registerSourceAdapter(selfGraphEntry, loadSelfGraph)` (the actual loader)
- 8 candidates → `registerSourceAdapter(<entry>, candidateNoOpLoader)` (shared shared)

The `candidateNoOpLoader` is a single shared function:
```typescript
const candidateNoOpLoader: LoaderFn = async (config) => {
  const entry = getSourceAdapterEntryById(config.adapterId);
  return errorSummary(
    config.adapterId,
    entry?.adapterType ?? config.adapterId,
    "Adapter not yet implemented",
  );
};
```

### loadSource.ts refactor
Replace the hardcoded if-chain with Map dispatch. New signature:

```typescript
export async function loadSource(adapterId: string | null): Promise<GraphSourceSummary> {
  if (!adapterId) {
    return errorSummary("", "Unknown", "No active source configured");
  }
  const entry = getSourceAdapterEntryById(adapterId);
  if (!entry) {
    return errorSummary(adapterId, adapterId, `Unknown adapter: ${adapterId}`);
  }
  const loader = getSourceAdapterLoader(adapterId);
  if (!loader) {
    return errorSummary(adapterId, entry.adapterType, `No loader for adapter: ${adapterId}`);
  }
  const config = buildAdapterConfig(adapterId);
  return loader(config);
}
```

### buildAdapterConfig.ts (NEW)
Pure function. Reads from settings store via `useSettingsStore.getState()` (the canonical outside-React-render pattern). Returns the discriminated AdapterConfig for the given adapterId.

```typescript
import { useSettingsStore } from "../../control-plane/settings/settings.store";
import type { AdapterConfig } from "../../source-adapter/baseSourceAdapter";

export function buildAdapterConfig(adapterId: string): AdapterConfig {
  const { configurations } = useSettingsStore.getState().sources;
  const storedConfig = configurations[adapterId] ?? {};
  return { adapterId, ...storedConfig } as AdapterConfig;
}
```

The `as AdapterConfig` cast at the end is unavoidable here — TypeScript can't narrow a `Record<string, AdapterConfig>` lookup by string key into a specific union member. Adapter loaders do the discrimination via type-guard at their entry point (the Q1-locked pattern).

### loadSelfGraph.ts update
Update signature from `loadSelfGraph(_inputPath: string)` to `loadSelfGraph(config: SelfGraphConfig)`. The lazy module-level project-root cache from v108 stays as-is — that's the right pattern for the self-graph adapter. The `inputPath` (was unused via the underscore prefix) is now formally part of the config object if needed; for self-graph it remains unused (the generator output path is internal to loadSelfGraph).

Add `SelfGraphConfig` to the AdapterConfig union in `baseSourceAdapter.ts`:
```typescript
interface SelfGraphConfig extends BaseAdapterConfig {
  adapterId: "self-graph-yaml-frontmatter";
  // No user-configurable fields; the generator output path is internal
}
```

### useGraphSourceSummary.ts cleanup
- Change `loadSource(activeAdapterId, inputPath)` to `loadSource(activeAdapterId)`.
- Remove the v109.0.1 type-assertion bridge for `.inputPath` (it was a temporary cast; the signature simplification removes the need).
- Keep `activeAdapterId` in the effect dependency array. `inputPath` reads inside `buildAdapterConfig` from settings, so settings changes already re-fire via the existing settings-store subscription path; the dependency array doesn't need `inputPath` anymore.
- **Confirm in pre-flight:** if the existing effect has `inputPath` in the dep array, verify whether removing it changes refresh behavior. The settings store subscription should cover it, but verify rather than assume.

## Verify (targeted scope)

Run ONLY these foreground:
```
npm run typecheck
npx playwright test tests/e2e/source-adapter.spec.ts --reporter=line
npx playwright test tests/e2e/graph-sources.spec.ts --reporter=line
npx playwright test tests/e2e/settings-migrations.spec.ts --reporter=line
```

Expected:
- typecheck → 0 errors
- source-adapter.spec.ts → all 9 tests pass (the registry surface still presents 9 entries, set-active still works through new dispatch)
- graph-sources.spec.ts → all 4 tests pass (Regenerate still works through the simplified signature)
- settings-migrations.spec.ts → passes (no schema change this commit; should still be green)

If any go red: STOP and report. That's a real signal — likely either (a) the loadSource signature change broke a caller other than useGraphSourceSummary that grep missed, or (b) the dispatch is subtly wrong (e.g. the candidateNoOpLoader is returning the wrong error shape).

**Manual smoke (Ryan, `npm run tauri dev`):**
- App starts. Self-graph loads.
- Open SourceAdapterPanel — 9 entries listed, self-graph shown as active.
- Click "Set as active" on a candidate (e.g. markdown-vault) → it sets active, the panel shows the appropriate "not yet implemented" state when the load fires.
- Click "Set as active" back on self-graph → returns to working state.

## Commit
- MERGE GATE → commit (explicit paths only — list above): `feat(v109.0.2): registerSourceAdapter() API — registry conversion + Map-based dispatch + single-param loadSource()`
- END-OF-RUN REPORT to #changelog + bump+push gate.

## END-OF-RUN REPORT (#changelog)
- Files committed (explicit list).
- Pre-flight findings (HEAD state, current shapes confirmed).
- Targeted verification results — each spec file's pass count.
- Manual smoke notes.
- Any divergences from prompt (e.g. if grep found additional loadSource callers).
- Confirmation that the v109.0.1 type-assertion bridge is removed.

## Hard stops
- **Targeted-test-scope convention applies.** Do NOT run the full suite. Only the three named spec files. Full-suite verification is a manual checkpoint at arc close, not this pass.
- No installs. No new deps. Explicit-path git (NEVER `git add -A`). Discord MCP only.
- No semver bump.
- No new Rust this commit. No `tauri-plugin-fs`, no `tauri-plugin-shell`.
- DO NOT add any adapter loaders this commit. All 8 candidates stay candidates routed through `candidateNoOpLoader`.
- DO NOT add the `cerebra-vault` entry. Its scaffolding exists in docs only.
- Preserve `GraphSourceSummary` return shape — AppShell's `hasRealSource` chain depends on it.
- If grep reveals additional `loadSource` callers beyond `useGraphSourceSummary.ts`, STOP and report. The "only one caller" assumption is load-bearing for the signature change.
