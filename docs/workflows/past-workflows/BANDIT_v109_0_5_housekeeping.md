# Bandit — v109.0.5: housekeeping (sharp-edge log + NOW.md update + arc state)

Tiny housekeeping pass. NOT an arc close — v109 stays open until v109.1–v109.4 (the four adapters) land and v109.5 (or later) does the formal close + semver bump.

Three small bankings:
1. Log the Zustand-selector-inline-fallback lesson in `KNOWN_SHARP_EDGES.md`
2. Update `LUMAWEAVE_NOW.md` to reflect v109.0 platform-complete state (mid-arc status)
3. Log the test-hardening + suite-split work as the high-priority v110 candidate

NO code changes. Docs only. ONE commit.

Generic rules: `~/Projects/CLAUDE.md`; project: `~/Projects/lumaweave/CLAUDE.md`; Discord/gates: `~/Projects/DISCORD_PROTOCOL.md`.

## ⏩ BANDIT PASS PREFACE
0. Discord MCP else HALT. 1. START→#current-task. 2. Work+verify. 3. END→#current-task. 4. MERGE GATE→#approve-this (1506441138612080680), commit explicit paths. 5. END-OF-RUN REPORT→#changelog w/ SHA. 6. BUMP+PUSH GATE→#approve-this.

No semver bump.

## Targeted test scope

None — docs only. Just `npm run typecheck` for sanity (no code changes, should be trivially 0).

## Pre-flight (verify, report, STOP)
1. Confirm v109.0.4 (commit `182ea67`) is on HEAD.
2. Confirm `KNOWN_SHARP_EDGES.md` exists at its canonical location (likely `docs/KNOWN_SHARP_EDGES.md` — confirm in pre-flight). If it doesn't exist, STOP and ask Ryan where it should live.
3. Confirm `docs/LUMAWEAVE_NOW.md` is at expected location and reflects v107/v108 closed + v109 open state.

## Files to commit (explicit paths only)

- `docs/KNOWN_SHARP_EDGES.md` — append Zustand selector lesson
- `docs/LUMAWEAVE_NOW.md` — mid-arc status update + v110 test-hardening entry

DO NOT touch other files.

## Item 1 — KNOWN_SHARP_EDGES.md entry

Append a new entry. Match the existing format (whatever it is — confirm by reading current entries first; mirror the style).

Suggested entry content:

```markdown
### Zustand selectors: never construct new object references inline as fallbacks

**Symptom:** Component enters infinite re-render loop when reading optional config from settings store.

**Cause:** A selector that returns a freshly-constructed object (or array) when the underlying value is undefined produces a new reference on every call. Zustand's default equality check (`Object.is`) treats each new reference as a state change → re-render → selector re-runs → new reference → re-render → loop.

**Anti-pattern:**
```typescript
const config = useSettingsStore(
  (s) => s.settings.sources.configurations[adapterId] ?? { adapterId },
);
```
The `?? { adapterId }` fallback creates a new object every call. Infinite loop.

**Correct pattern:** keep the selector pure (return the actual stored value or undefined), apply the fallback OUTSIDE the selector:
```typescript
const storedConfig = useSettingsStore(
  (s) => s.settings.sources.configurations[adapterId],
);
const config = storedConfig ?? { adapterId };
```
The selector returns `undefined` consistently (same reference) when the config is missing. The render-body fallback is fine — React doesn't re-render based on render-body object identity.

**First encountered:** v109.0.4 (`AdapterConfigForm.tsx`). Caught during typecheck-clean implementation; manifested as a frozen browser tab in dev preview.

**Related patterns:** any Zustand selector returning an aggregated value, e.g. `(s) => s.items.filter(...)` — the filter result is a new array every call. Same fix: select the raw state, derive in the component body.
```

Adjust phrasing to match the existing doc's tone. The technical content matters more than the exact wording.

## Item 2 — LUMAWEAVE_NOW.md mid-arc status

Update the header AND the open-arc section to reflect: v109.0 platform-complete in 4 commits, v109 still open, next pass is v109.1 (markdown-vault). v107 + v108 closed blocks stay intact.

**Header changes:**
- Production version: stays 0.15.0 (no semver bump until arc close)
- Internal arc: v109 (Source Adapter Platform — open, platform [v109.0] complete; v109.1 markdown-vault next)
- Last closed: v108 (Source Adapters — Tier 1) — unchanged

**v109 open-arc section** (create or expand it):
- Tracks the 4 platform commits with their SHAs:
  - v109.0.1 — SDK interfaces + family bases + settings schema 92→93 (`087a10e`)
  - v109.0.2 — registerSourceAdapter() + Map dispatch + signature simplification (`d26039b`)
  - v109.0.3 — list_files + read_vault_file Tauri commands + DirectoryAdapter wiring (`51e58f6`); runtime-verified security boundary
  - v109.0.4 — SourceAdapterPanel per-adapter settings scaffolding (`182ea67`)
- Note: arc remains OPEN through v109.1–v109.4 (the four adapters); v109.5 (or whichever number lands the close) does the semver bump 0.15.0 → 0.16.0 + reconcile.
- **Architectural notes added during v109.0:**
  - Adapter SDK contract canonical doc: `~/Projects/future-integration/SDK_SPEC.md`
  - Sibling-integration deferred vision: `~/Projects/future-integration/INTEGRATION_FUTURES.md`
  - Cross-project schema: `~/Projects/future-integration/SHARED_SCHEMA.md`
  - Coupling field on SourceAdapterEntry: `"external"` (default, all 9 current entries) vs `"sibling-module"` (reserved for future cerebra-vault — not yet registered)
  - Forward-compat hooks: `transport: "file" | "live"` + reserved `extensions: {}` in file-envelope adapters
  - Targeted-test-scope convention established (per-commit verification runs only relevant spec files; full suite is manual checkpoint at arc close, not per-commit gate)

**Tier 2 build set (planned):**
- v109.1 — markdown-vault (Obsidian) [NEXT]
- v109.2 — Cytoscape JSON
- v109.3 — package-dependency (JSON-only initially; Cargo.toml TOML parser deferred)
- v109.4 — CSV edge list
- v109.5 (or later) — arc close + semver bump

## Item 3 — v110 test-hardening + split entry in NOW.md

Add to the "Standing arcs / deferred work" section (or whatever it's called in the current NOW.md). High-priority v110 candidate:

```markdown
### v110 candidate (HIGH PRIORITY): Test-hardening + suite split

**Driver:** full-suite runtime (~9–12 minutes) now exceeds the Bash tool's 10-minute cap, contaminating Bandit verification with timing flakes. Bandit's `cargo`-style targeted verification works around it per-commit, but full-suite checkpoints (arc closes, regression hunts) require human-run-only.

**Goals:**
- Split `graph-visual-inventory.spec.ts` (~8.7 min of 9 min total) into smaller files or use `test.describe.parallel()` so it doesn't gate the whole suite
- Convert `waitForTimeout()` chains in QA helpers (especially `tests/e2e/helpers/qa.ts`) to web-first assertions (`expect.poll`, `toBeVisible({ timeout })`)
- Audit the 7 timing-sensitive specs that flaked under v109.0.1 manual full-suite (color-tab, contract-registry x3, graph-sources L83, gwells-physics C9.4, settings-panel reload)
- Restore sub-10-min full-suite so Bandit's Bash-cap verification becomes viable again

**Estimated scope:** ~3–4 hours, multi-pass (audit pass → graph-visual-inventory split → helper-pattern conversions → flaky-spec triage).

**Relationship to v1.0 ship goal:** not strictly required for shipping, but CI green stability matters for the public release. Worth banking before any major feature arc.
```

Match the existing doc's section conventions / naming.

## Verify
- `npm run typecheck` → 0 errors (sanity; no code changes anyway)
- No E2E run needed (docs only)

## Commit
- MERGE GATE → commit (explicit paths only): `docs(v109.0.5): KNOWN_SHARP_EDGES Zustand selector + NOW.md mid-arc status + v110 test-hardening entry`
- END-OF-RUN REPORT to #changelog + bump+push gate.

## END-OF-RUN REPORT (#changelog)
- Files updated (explicit list).
- Confirmation that v109 remains OPEN (no semver bump, no arc-close ritual).
- Brief summary of what was logged in each doc.
- Note: v109.1 (markdown-vault) is teed up as next concrete pass.

## Hard stops
- **Docs only.** No code changes. No new dependencies.
- No semver bump. v109 stays open.
- Explicit-path git. Discord MCP only.
- If `KNOWN_SHARP_EDGES.md` doesn't exist where expected: STOP and ask Ryan rather than creating it in an arbitrary location.
- If `LUMAWEAVE_NOW.md`'s current shape differs from what this prompt assumes (e.g. no clear "open arc" section), adapt to the existing structure — don't impose a new one.
