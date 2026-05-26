# Test Debt Inventory — v92

**Date:** 2026-05-25  
**Branch:** `chore/test-debt-inventory-v92`  
**Baseline:** Full suite run — `npm run qa:e2e`  
**Result:** 36 failed · 7 skipped · 526 passed  

> **Note on baseline shift.** The original prompt anticipated ~82 failures. The actual
> count is 36. The delta is explained by the CSS hotfix landed in this same session
> (commit `889b604`): `SettingsPanel.css` was missing entirely, so the settings panel
> had `position: static` and its inline `top/left` were ignored — the panel was
> invisible. Creating that file resolved ~46 failures that were downstream of the panel
> not rendering at all.

---

## Executive Summary

| Category | Count |
|---|---|
| `feature-removed` | 15 |
| `race-timing` | 10 |
| `real-regression` | 4 |
| `interaction-state` | 3 |
| `selector-drift` | 2 |
| `state-stale` | 2 |
| **Total** | **36** |

Six root cause clusters identified. Fixing Cluster A (single file: `ControlDock.tsx`)
resolves 15 failures in one edit. Fixing Cluster C (two lines in `SettingsPanel.css`)
resolves 2 more.

---

## Root Cause Clusters

### Cluster A — ControlDock section removal (15 tests, `feature-removed`)

**Root cause:** `src/control-plane/panels/ControlDock.tsx` renders only
`TypographyPlaygroundSection`. The `physics`, `appearance`, and `labels` sections are
registered in `tileSectionRegistry` but absent from ControlDock's render output.
`PhysicsSectionContent`, `AppearanceSectionContent`, and `LabelsSectionContent` exist
in source and are functional, but no UI path reaches them.

**Tests affected:** `gwells-physics` (7), `v86c-tile-system` (6),
`edge-label-truncation` (1), `settings-label-controls` (1).

**Smallest safe fix:** Restore the three section components to ControlDock.
Alternatively, if the architecture has intentionally moved elsewhere, update all
15 tests to target the new location.

---

### Cluster B — settings-panel race-timing (6 tests, `race-timing`)

**Root cause:** Full-suite parallel workers cause settings-panel tests to fail.
The panel opens via the `Control+,` global keyboard shortcut; under parallel load,
another worker's page may capture the keypress or the panel state bleeds between
workers. **Confirmed:** all 6 pass when run in isolation
(`npm run qa:e2e -- tests/e2e/settings-panel.spec.ts`).

**Tests affected:** `settings-panel` lines 40, 47, 55, 85, 95, 112.

**Smallest safe fix:** Run the settings-panel spec with `workers: 1` or mark it
`fullyParallel: false` in its config. Alternatively, route panel open/close through
a non-global trigger in tests (e.g., click the topbar gear button per test).

---

### Cluster C — CSS scope conflict `.lw-toggle` global (2 tests, `real-regression`)

**Root cause:** `src/control-plane/settings/SettingsPanel.css` (commit `889b604`)
styles `.lw-toggle` without scope — the rule applies to every `.lw-toggle` element
in the document. `Topbar.tsx` uses `<label className="lw-toggle">` for the glitter
and reduce-motion toggles. The SettingsPanel CSS overrides their dimensions and
`::after` knob pseudo-element, causing toggle interaction tests to time out.

**Tests affected:** `theme-selector:58` (glitter toggle can be toggled),
`contract-registry:150` (glitter toggle updates visual state).

**Smallest safe fix:** Prefix all `.lw-toggle` rules in `SettingsPanel.css` with
`.lw-settings-panel-chrome` to scope them:

```css
/* before */
.lw-toggle { ... }
/* after */
.lw-settings-panel-chrome .lw-toggle { ... }
```

---

### Cluster D — Known flaky helpers (4 tests, `race-timing`)

**Root cause:** Two pre-existing, documented flaky patterns.

1. **gwells-physics C9.0** (line 252): Documented in
   `docs/known-bugs/gwells-c9-0-drift-back-flake.md`. Passes 18/18 in isolation;
   fails intermittently under full-suite load due to physics engine timing sensitivity.

2. **contract-registry qa-check-previous chain** (lines 280, 294, 305): Documented in
   `docs/known-bugs/contract-registry-qa-check-previous-timeout.md`. Line 305 times
   out clicking `qa-check-previous` at 30s; lines 280 and 294 cascade from the same
   helper timeout.

**Tests affected:** `gwells-physics:252`, `contract-registry:280,294,305`.

**No action needed.** Known flakes, already documented. Verify by running specs in
isolation before treating any of these as regressions.

---

### Cluster E — Selector drift (4 tests, `selector-drift` + `interaction-state`)

**Root cause:** Tests reference UI elements that no longer exist under their expected
testids or text.

- **`app-smoke:3`** — expects visible text `"LumaWeave Observatory"`. Not found in any
  source file.
- **`geometry-spoke:37`** — expects testid `geometry-scope-picker`. Only `scope-picker`
  exists (in `ColorTab.tsx`, not `GeometryTab`). The geometry spoke's scope picker
  either has a different testid or was not yet implemented.
- **`geometry-spoke:44,68`** — downstream: these tests attempt to click presets after
  finding the scope picker (which fails at :37), so they inherit the failure.

**Tests affected:** `app-smoke:3`, `geometry-spoke:37,44,68`.

**Smallest safe fix:** For app-smoke, find the current app shell text and update the
assertion. For geometry-spoke, locate the actual geometry spoke scope picker component
and align the testid.

---

### Cluster F — Registry / spoke count drift (2 tests, `state-stale`)

**Root cause:** Tests embed a hardcoded count assumption that has diverged from the
actual registry state.

- **`inspector-mini-graph:62`** — expects 4 spoke slots (the old placeholder count).
  `MiniGraphRenderer` now renders all registered spokes. The spoke registry currently
  has 9 entries (color, geometry, type, motion, layout, code, apply, ide, history).
- **`v86c-tile-system:109`** — expects tileable section count to match the registry
  (4 registered). ControlDock renders only 1 (typography-playground), so the
  accessible-to-tear-off count is 1, not 4.

**Tests affected:** `inspector-mini-graph:62`, `v86c-tile-system:109`.

**Note:** v86c:109 shares its root cause with Cluster A — fixing ControlDock to render
all 4 registered sections would also resolve this test.

**Smallest safe fix for inspector-mini-graph:** Update expectation to match the
registry count dynamically, or update the hardcoded count to 9 (and plan to keep it
in sync with the registry going forward).

---

## Orphan Real-Regressions

Three failures that don't fit a shared cluster and represent genuine production bugs:

### settings-panel:130 — geometry persists across reload (`real-regression`)

**Symptom:** After dragging the panel to a new position, the close button ends up
outside the viewport. Playwright logs "element is outside of viewport" when trying to
click close. The geometry-persistence test then fails on the close step.

**Root cause:** Panel drag sets position freely without clamping to viewport bounds.
When the user drags near a viewport edge, the panel body can extend off-screen. The
resize-event clamp handler (added in this session) only fires on window resize, not
after drag release.

**Fix direction:** Apply viewport clamping in the `up` handler of `startDrag` in
`SettingsPanel.tsx` after the final `setRect` call, mirroring the resize-event handler
logic.

---

### theme-override-storage:220 — export filters out invalid token paths (`real-regression`)

**Symptom:** Test expects `exportGlobalThemeOverrideBundle` to return 1 valid override.
It returns 0.

**Root cause:** The `panel.background` token path IS referenced in source
(`ThemeMappingPanel.tsx`, `graphVisualThemeMappingRegistry.ts`), so the token is valid.
The export function appears to filter it out incorrectly — likely a predicate bug in
`exportGlobalThemeOverrideBundle` or a mismatch between the stored key format and
what the function considers valid.

**Fix direction:** Instrument `exportGlobalThemeOverrideBundle` and trace what it
receives vs. what it filters. The filtering predicate is the prime suspect.

---

### color-tab-functional:132 — recent swatches list capped at 8 entries (`interaction-state`)

**Symptom:** The "recent swatches list capped at 8 entries" test times out during the
add-color interaction in the full suite. Passes in the single-file run.

**Root cause:** Most likely race-timing under parallel load (same pattern as
Cluster B). The color tab hex input fill doesn't complete under worker contention.
Not confirmed in isolation; classify as `interaction-state` pending isolation run.

**Fix direction:** Run `npm run qa:e2e -- tests/e2e/color-tab-functional.spec.ts`
in isolation. If it passes, reclassify as `race-timing` (parallel worker issue).
If it still fails, investigate the hex input interaction path.

---

## Per-Spec Inventory

### app-smoke.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 3 | app loads core LumaWeave shell | `selector-drift` | Cluster E — text "LumaWeave Observatory" not in source |

---

### color-tab-functional.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 132 | recent swatches list capped at 8 entries | `interaction-state` | Orphan — pending isolation run to confirm race-timing vs real-regression |

---

### contract-registry.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 150 | Theme runtime integrity - glitter toggle updates visual state | `real-regression` | Cluster C — `.lw-toggle` CSS globally scoped |
| 280 | v48 report stays blocked when control checks are unverified | `race-timing` | Cluster D — cascade from qa-check-previous timeout |
| 294 | v48 acceptance decision requires zero blocked or unverified | `race-timing` | Cluster D — cascade from qa-check-previous timeout |
| 305 | v48 checklist includes detail mode checks | `race-timing` | Cluster D — documented known flaky |

---

### edge-label-truncation.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 3 | edge label length control is visible and functional | `feature-removed` | Cluster A — label controls not rendered in ControlDock |

---

### geometry-spoke.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 37 | scope picker renders with this and all options | `selector-drift` | Cluster E — `geometry-scope-picker` testid not found |
| 44 | clicking a preset at 'this' scope writes target override | `interaction-state` | Cluster E — downstream from :37 |
| 68 | clicking a preset at 'all' scope writes global override | `interaction-state` | Cluster E — downstream from :37 |

---

### gwells-physics.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 77 | Gwells dialect switching works | `feature-removed` | Cluster A — `dialect-select` in PhysicsSectionContent, not rendered |
| 106 | Pass C4: HelixTwistSliders render and persist | `feature-removed` | Cluster A — `helix-twist-sliders` in PhysicsSectionContent, not rendered |
| 147 | Pass C4: Per-dialect persistence of slider values | `feature-removed` | Cluster A — same root as C4 |
| 200 | Pass C5: Directory twist persists with seedAdherence | `feature-removed` | Cluster A — PhysicsSectionContent not in ControlDock |
| 252 | Pass C9.0: Dragging a node without modifier drifts back toward seed | `race-timing` | Cluster D — documented known flaky |
| 329 | Pass C5: Dialect change resets seed positions | `feature-removed` | Cluster A — PhysicsSectionContent not in ControlDock |
| 358 | Pass C9.1: Pin survives dialect-switch round-trip | `feature-removed` | Cluster A — PhysicsSectionContent not in ControlDock |
| 681 | Pass C9.4b: onUpdatePins writes under the current dialect after a switch | `feature-removed` | Cluster A — PhysicsSectionContent not in ControlDock |

---

### inspector-mini-graph.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 62 | registered spokes render around root | `state-stale` | Cluster F — expects 4 spokes; registry has 9 |

---

### settings-label-controls.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 3 | settings panel shows label controls | `feature-removed` | Cluster A — label controls not in ControlDock |

---

### settings-panel.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 40 | close button closes panel | `race-timing` | Cluster B — passes in isolation |
| 47 | Escape closes panel | `race-timing` | Cluster B — passes in isolation |
| 55 | all 8 category nav items are present | `race-timing` | Cluster B — passes in isolation |
| 85 | minimize button toggles minimized state | `race-timing` | Cluster B — passes in isolation |
| 95 | title bar drag moves panel | `race-timing` | Cluster B — passes in isolation |
| 112 | SE resize handle resizes panel | `race-timing` | Cluster B — passes in isolation |
| 130 | geometry persists across reload | `real-regression` | Orphan — close button outside viewport after drag |

---

### theme-override-storage.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 220 | export filters out invalid token paths | `real-regression` | Orphan — export returns 0 instead of 1 |

---

### theme-selector.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 58 | glitter toggle can be toggled | `real-regression` | Cluster C — `.lw-toggle` CSS globally scoped |

---

### v86c-tile-system.spec.ts

| Line | Test | Category | Root cause cluster |
|------|------|----------|-------------------|
| 65 | tile-tear-off handle visible | `feature-removed` | Cluster A — `settings-section-physics` not rendered |
| 109 | tileable sections match registry | `state-stale` | Cluster F + Cluster A — registry has 4, ControlDock renders 1 |
| 126 | Physics section renders content when tiled out | `feature-removed` | Cluster A — `settings-section-physics` not in ControlDock |
| 169 | Tiled-out indicator appears in source slot when section is torn off | `feature-removed` | Cluster A — depends on tearing off a non-rendered section |
| 506 | v86c-meta: physics-section renders content when tiled out | `feature-removed` | Cluster A — `settings-section-physics` not in ControlDock |
| 506 | v86c-meta: appearance-section renders content when tiled out | `feature-removed` | Cluster A — `settings-section-appearance` not in ControlDock |
| 506 | v86c-meta: labels-section renders content when tiled out | `feature-removed` | Cluster A — `settings-section-labels` not in ControlDock |

---

## Remediation Priority

| Priority | Cluster | Tests fixed | Effort |
|----------|---------|------------|--------|
| 1 | Cluster C — CSS scope `.lw-toggle` | 2 | ~5 lines in SettingsPanel.css |
| 2 | Cluster A — ControlDock sections | 15 | Restore 3 section components |
| 3 | Cluster B — settings-panel workers | 6 | playwright.config tweak or test refactor |
| 4 | Cluster F — spoke/section count stale | 2 | Update hardcoded count expectations |
| 5 | Orphan: settings-panel geometry | 1 | Clamp rect in `startDrag` up-handler |
| 6 | Orphan: theme-override-storage export | 1 | Debug export predicate |
| 7 | Cluster E — selector drift | 4 | Identify current UI surfaces |
| 8 | Orphan: color-tab-functional | 1 | Run in isolation first |
| — | Cluster D — known flakes | 4 | Already documented, no action |

**Fixing priorities 1–3 resolves 23 of 36 failures.**
