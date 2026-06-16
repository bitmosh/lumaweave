# Bandit — v107.0 (Tier 0): source adapter plumbing repair — settings schema → loadSource refactor → selector UI

Opens v107 (Source Adapter System arc). Delivers Tier 0 of `docs/prototypes/source-adapter-plan.md`: repair the broken-by-design plumbing without adding new adapters. Verified by `docs/prototypes/v107_report.md` (Tier 0 investigation): all 8 plan assertions hold, ~7 files, no Rust, no new dependencies, total difficulty 2×LOW + 2×MEDIUM.

ONE pass, THREE commits with merge gates between each. Run all three; pause only on STOP signals.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE (run in order for EACH of the 3 commits)
For each commit below: 0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this. Then proceed to next commit.

The arc-close bump is in the FINAL commit (.0.3). Earlier commits get version bumps per normal pass discipline (patch/internal).

## Locked decisions (from the v107 report + Ryan's confirmation)
- **One pass, three commits** (not split into two passes).
- **`loadSource` null guard:** if `sources.active` is null/missing, return `{ status: "error", error: "No active source configured" }`. Surfaces the state in the panel/tile; falls through to fixture via existing `hasRealSource` chain. Do NOT silently return `idle`.
- **E2E spec scope (commit 3):** full flow — assert button exists + enabled on registered entries, click "Set as active" on a non-active entry, assert `useSettingsStore` reflects the change, assert active indicator updates in the panel. ~15 extra lines per terminal Claude's estimate.
- **`loadGraphifySource.ts`:** DELETE (`git rm`). Only one caller, deletion is clean. No re-export shim.
- **Registry conversion (Gap 5):** DEFERRED to whenever Tier 2 (`markdown-vault`) needs dynamic registration. NOT in Tier 0.

---

## Commit 1 — `feat(v107.0.1): settings schema — sources slice + migration 90→91`

**Files (explicit paths only):**
- `src/control-plane/settings/settings.schema.ts`
- `src/control-plane/settings/settings.defaults.ts`
- `src/control-plane/settings/settings.migrations.ts`

**Pre-flight (verify, no STOP unless something diverges):**
1. Confirm current schema version is 90 (per `settings.schema.ts:72` and `settings.defaults.ts:18`).
2. Confirm `MIGRATIONS` record in `settings.migrations.ts` has `90:` as the last entry (~line 158) — additive backfill pattern (`(s.minimap ?? defaultMinimapSettings)`).
3. Confirm `"self-graph-yaml-frontmatter"` is the registered adapter id at `sourceAdapterRegistry.ts:89,119` (the report cites this).

**Implementation:**
- Add `SourcesSettings` interface to schema: `{ active: string | null; configurations: Record<string, { inputPath?: string }> }`.
- Add `sources: SourcesSettings` to `StarmapSettings`. Bump `version: 90 → 91`.
- Add `defaultSources` to `settings.defaults.ts`: `{ active: "self-graph-yaml-frontmatter", configurations: {} }`.
- Add migration `91: (s) => ({ ...s, version: 91, sources: (s as any).sources ?? defaultSources })`. Purely additive — backfill only, mirrors the `90:` pattern.

**Verify:**
- typecheck 0.
- `npm run qa:e2e -- tests/e2e/v86c-tile-system.spec.ts` → green (the report's WATCH item — the tile-init spec touches settings migration; confirm 90→91 doesn't disturb it).
- Run `tests/e2e/settings-migrations.spec.ts` (or equivalent) — green.

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v107.0.1): settings schema — sources slice (active + configurations), migration 90→91`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 2 — `feat(v107.0.2): loadSource refactor — replaces loadGraphifySource, settings-driven`

**Files (explicit paths only):**
- `src/graph/ingest/loadSource.ts` (NEW)
- `src/graph/ingest/loadGraphifySource.ts` (`git rm`)
- `src/graph/ingest/useGraphSourceSummary.ts`

**Pre-flight:**
1. Confirm commit 1 (v107.0.1) is on HEAD. Schema has `sources` slice, defaults set, migration 91 present.
2. Confirm `loadGraphifySource`'s only callers are `useGraphSourceSummary.ts:8` (import) and `:38` (call) — no other consumers.

**Implementation:**

`loadSource.ts` (new):
```ts
import { getSourceAdapterEntryById } from "../../source-adapter/sourceAdapterRegistry";
import type { GraphSourceSummary } from "./types";

export async function loadSource(
  adapterId: string | null,
  inputPath: string,
): Promise<GraphSourceSummary> {
  // null guard — Ryan's confirmed decision: surface as error, don't silent-idle
  if (!adapterId) {
    return { status: "error", error: "No active source configured", sourceId: null, sourcePath: null };
  }
  const entry = getSourceAdapterEntryById(adapterId);
  if (!entry) {
    return { status: "error", error: `Unknown adapter: ${adapterId}`, sourceId: adapterId, sourcePath: null };
  }
  if (entry.status !== "registered") {
    return { status: "not-implemented", sourceId: adapterId, sourcePath: null };
  }
  // self-graph routing: preserves current fixture-loading behavior, just parametrized
  // (lift the existing fetch + normalization from the old loadGraphifySource here, parametrized by inputPath)
  // ...
}
```
- Lift the existing fetch + parsing + normalization logic from `loadGraphifySource.ts`, parametrized by `inputPath` (or use the adapter's default fixture path if `inputPath` is empty).
- Preserve the exact return-shape contract — `GraphSourceSummary` fields unchanged.
- Match error-status shape that `AppShell.tsx`'s `hasRealSource` check expects (so the fixture fallback chain at `:84-94` still works).

`useGraphSourceSummary.ts`:
- Import `useSettingsStore` + `loadSource`.
- Read `activeAdapterId = useSettingsStore(s => s.sources.active)` and `inputPath = useSettingsStore(s => s.sources.configurations[activeAdapterId ?? ""]?.inputPath ?? "")`.
- Replace `loadGraphifySource()` call with `loadSource(activeAdapterId, inputPath)`.
- Add `activeAdapterId` and `inputPath` to the `useEffect` dependency array — so source switches retrigger the load.
- Update initial state from hardcoded `sourceId: "ai-lab"` to neutral `{ status: "idle", sourceId: null, sourcePath: null, ... }` (per the report's §3.5 note — avoids stale hardcoded values).

`loadGraphifySource.ts`: `git rm` — clean deletion, no re-export shim.

**Verify:**
- typecheck 0.
- E2E foreground full suite. Target: same baseline as post-v106 (635/0/15 or close — terminal Claude's investigation passed at that level). The data-flow change should be transparent to specs.
- **Manual smoke (Ryan):** the app still loads the self-graph as before (Tier 0 doesn't change behavior visibly — it just routes through `loadSource` instead of `loadGraphifySource`). Reload the app — self-graph loads fine. The smoke confirms the rewire is transparent.

**Commit:**
- MERGE GATE → commit (explicit paths above; include `git rm` for the deleted file): `feat(v107.0.2): loadSource — adapter-routed, settings-driven (replaces loadGraphifySource)`
- END-OF-RUN REPORT to #changelog + bump+push gate.

---

## Commit 3 — `feat(v107.0.3): SourceAdapterPanel — set-active source selector + E2E coverage + v107 close`

**Files (explicit paths only):**
- `src/source-adapter/SourceAdapterPanel.tsx`
- `tests/e2e/source-adapter.spec.ts`
- `package.json` (arc-close minor bump)
- `src-tauri/Cargo.toml` (if it tracks version)
- `docs/LUMAWEAVE_NOW.md` (arc close reconcile)

**Pre-flight:**
1. Confirm commits 1 + 2 are on HEAD.
2. Confirm `SourceAdapterPanel.tsx` is still 255 lines, zero buttons, with the entry cards structure described in the report.
3. Confirm the source-adapter.spec.ts:55–83 block currently iterates buttons and throws on any enabled button (the assertion we're intentionally changing).

**Implementation — UI:**
- Import `useSettingsStore` + `setSetting` in `SourceAdapterPanel.tsx`.
- Read `activeAdapterId = useSettingsStore(s => s.sources.active)`.
- For each entry: if `entry.status === "registered"`, render a "Set as active" button. Disabled when `entry.adapterId === activeAdapterId`. On click: `setSetting("sources.active", entry.adapterId)`.
- Visual indication of active entry (highlight + a small "active" badge or check). Use existing aurora/panel tokens; don't introduce new design.
- `data-testid="source-adapter-set-active-{adapterId}"` per button for the spec.
- `data-testid="source-adapter-active-indicator-{adapterId}"` on the active visual marker.

**Implementation — E2E spec update (full flow per Ryan's confirmation):**
- Replace the "rejects enabled buttons" block (currently :55-83) with:
  1. Iterate registered entries → assert each has a `set-active` button + button is enabled (when not active) or disabled (when active).
  2. Click "Set as active" on a non-active registered entry.
  3. Assert the settings store reflects the change: `useSettingsStore.getState().sources.active === entry.adapterId`. (Use the existing test pattern for reading the settings store — there's a probe at `__lwSettingsStore` or similar; check existing patterns in the repo.)
  4. Assert the active indicator now sits on the newly-active entry.
  5. Assert previously-active entry's button is now enabled (and new active's is disabled).
- Keep the existing entry-count + entry-name assertions (lines :13–48 per the report). Those still hold.

**Verify:**
- typecheck 0, lint:css 0.
- E2E foreground: full suite green at baseline; specifically the updated `source-adapter.spec.ts` runs the new flow successfully.
- **Manual smoke (Ryan):** open the SourceAdapterPanel — each registered entry has a "Set as active" button. Click one — the panel updates, the active marker moves, settings persist (reload → still active). Disabled state correct on the active entry.

**Arc close (in same commit):**
- Bump semver: read LIVE package.json (was 0.13.0 at v106 close). v107 is a feature arc → bump minor → **0.14.0**. Update package.json + src-tauri/Cargo.toml if it tracks.
- Update `docs/LUMAWEAVE_NOW.md`:
  - Header: `Production version: 0.14.0`, `Internal arc: v108 (TBD)`, `Last closed: v107 (Source Adapters — Tier 0)`.
  - Move v107 from "Open arc" to a new "Closed arc — v107 (CLOSED)" block with the 3-commit table.
  - Preserve all standing-deferred items: registry conversion (deferred per §4 — fold in when Tier 2 needs it); Tier 1+ scoping notes (see §5 — `tauri-plugin-fs` for path-scoping needs per-install approval; `run_script` sandbox sketch banked; `tauri-plugin-stronghold` for Tier 6 credential storage needs per-install approval).
  - Architectural notes: `loadSource`'s null-guard contract; initial-state cleanup in `useGraphSourceSummary` (no more hardcoded `ai-lab`).
  - Roadmap row: v107 → CLOSED. Note Tier 1+ work (self-graph live mode, etc.) remains queued under the Source Adapter program.
  - Standing arcs (preserve untouched): Inspectable-Coverage + Token-Hygiene, minimap E2E debt, tile-content theming, mis-homed tile sections, test-hardening, security debt.
  - Known bugs/paperweights: REMOVE the "Source-adapter JSON-404" entry — Tier 0 clears it. (Confirm it's gone after the loadSource refactor: the live load now routes through the registered self-graph adapter, no 404.)

**Commit:**
- MERGE GATE → commit (explicit paths above): `feat(v107.0.3): SourceAdapterPanel — set-active selector + E2E + arc close (semver 0.13.0→0.14.0)`
- END-OF-RUN REPORT to #changelog with SHA (arc-close bump).
- Bump+push gate.

---

## END-OF-RUN REPORT after each commit (#changelog)

Each commit's report should include:
- Files committed (explicit paths).
- Pre-flight findings + any divergence from the prompt.
- Verification numbers (typecheck, E2E if run).
- Manual smoke notes (for commits 2 and 3).

**Final report (after commit 3)** additionally includes:
- Landed-state audit across the 3 commits.
- Semver: 0.13.0 → 0.14.0.
- JSON-404 paperweight confirmed cleared.
- Deferred items preserved + any drift from this prompt logged for a cleanup pass.

## Hard stops
- No installs. No new dependencies (Tier 0 uses only existing imports). Explicit-path git (NEVER `git add -A`). Playwright foreground. Discord MCP only.
- DO NOT touch Rust this pass (`src-tauri/**` other than `Cargo.toml` version bump). Tier 0 is frontend-only.
- DO NOT add `registerSourceAdapter()` API — registry conversion deferred per §4.
- DO NOT change `sourceAdapterRegistry.ts` entries — Tier 0 doesn't add new adapters.
- DO NOT touch `normalizeGraphifyGraph.ts` — already handles many raw shapes; preserve.
- DO NOT silent-idle on null `active` — the explicit `error` status is the chosen contract.
- DO NOT re-export `loadGraphifySource` as a shim — delete cleanly.
- If a real regression is found during E2E (failure that's NOT the intentionally-changed source-adapter.spec.ts), STOP and report — do not loosen a test to make it pass; that's a real signal.
