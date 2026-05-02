# v20 Theme Target Registry + Inspector Overlay — Session Log (2026-05-02)

## Goal
Deliver the v20 inspection substrate: canonical Theme Target Registry, safe DOM bindings, read-only inspector overlay, Debug evidence, and refreshed QA/advisory coverage.

## Files Touched
- `src/themes/themeTargetRegistry.ts`
- `src/themes/index.ts`
- `src/themes/ThemeTargetInspectorOverlay.tsx`
- `src/app/AppShell.tsx`
- `src/control-plane/qa/QaPanel.tsx`
- `src/control-plane/qa/qa-registry.ts`
- `src/control-plane/qa/advisory-registry.ts`
- `src/themes/themeTokenPaths.ts` (import consumers)
- `docs/theme-system/THEME_TARGET_REGISTRY.md`
- `docs/theme-system/THEME_MAPPING_SYSTEM_BACKLOG.md`
- `docs/theme-system/00_THEME_SYSTEM_OVERVIEW.md`
- `docs/DOCS_INDEX.md`
- `docs/logs/sessions/2026-05-02-v20-theme-target-registry-inspector-overlay.md`
- `tests/e2e` (upcoming overlay/debug specs TBD)

## Blast Radius Highlights
- Risk Tier: 2→3 (metadata + read-only overlay across shell + Mission Control).
- Intended Zones: `src/themes/*`, `src/app/AppShell.tsx`, QA panel, docs, tests.
- Forbidden Zones: Sigma renderer, theme preset values, settings store, glitter.
- Stop Conditions: Typecheck/Playwright failure (twice), overlay causing layout regressions, graph disappearance, qaKey drift, new skipped tests.

## Registry Summary
- Active targets: app.shell, topbar.root, mission-control panel/cards, settings.panel, graph.frame.
- Planned targets: graph node/edge states, Theme Mapping panel/control placeholders.
- Helpers: `getThemeTargetById`, `getActiveThemeTargets`, `getPlannedThemeTargets`, `getThemeTargetSummary`, `getThemeTargetsBySurface`.
- Exports surfaced via `src/themes/index.ts`.

## DOM + Overlay Work
- Added `data-lw-theme-target` markers to shell, topbar, mission control cards, settings panel, graph frame.
- Implemented `ThemeTargetInspectorOverlay` (Ctrl+Alt+T hotkey, tooltip with metadata, HUD indicator, pointer-events none).
- Mounted overlay at AppShell root; overlay default OFF.

## Mission Control Debug Evidence
- QA Debug tab now lists Theme Target summary counts + per-surface registry entries via new helper functions.

## Documentation
- Created `docs/theme-system/THEME_TARGET_REGISTRY.md` (<220 lines) covering purpose, relationships, contract shape, active vs planned targets, overlay behavior, non-goals, validation.
- Linked new doc from overview, backlog, and docs index.

## QA / Advisory Updates
- Added v20 checklist with 20 granular checks covering identity, registry, DOM markers, overlay behavior, non-goals, validation.
- Default QA key updated to v20.
- Added advisoryV20 with targeted questions + backlog migration (inspector hardening, Theme Mapping Panel v0, overrides, physics coverage, token governance).

## Validation (to date)
- Typecheck: PASS after each major slice (registry, DOM markers, overlay, debug UI, QA/advisory updates).
- Playwright: Full suite pending final Step 10 run (required after overlay tests land); interim targeted tests forthcoming.
- `grep -R "test.skip" -n tests/e2e`: 0 matches.

## Remaining Work
- Add Playwright coverage for overlay hotkey/tooltip + debug summary assertions (Step 9).
- Update QA helpers/tests for v20 identity.
- Final validation + blast radius report per instructions.

## Risks/Notes
- Overlay keyed to DOM attributes only; no editing UI introduced.
- Graph/Sigma untouched; registry planned entries remain token-less placeholders.
- Visual handle CSS unchanged; future binding work tracked via backlog.

(Summary kept under 150 lines as required.)
