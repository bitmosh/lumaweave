# QA Report — Registered/Unregistered Heuristic Runtime Probe v27a

**Checklist Key:** v27a  
**Advisory Set Key:** v27a  
**Submitted At:** 2026-05-02T20:05:00-05:00

## Acceptance Decision

**ACCEPT**

## Summary

- Pass: 16  
- Fail: 0  
- Blocked: 0  
- Unverified: 0  
- Untested: 0

## Evidence Highlights

1. **Playwright coverage** — `npm run qa:e2e` exercises both the QA panel contract (`tests/e2e/contract-registry.spec.ts`) and the runtime probe helper (`tests/e2e/theme-target-inspector.spec.ts`), providing automated proof for every checklist item without requiring manual DevTools commands.@tests/e2e/contract-registry.spec.ts#246-398 @tests/e2e/theme-target-inspector.spec.ts#18-345
2. **Runtime probe helper** — QA Debug now shows the probe snapshot immediately after Playwright triggers `window.__lwRunThemeTargetProbe`, ensuring QA reviewers can capture evidence straight from the UI without console scripting.@tests/e2e/contract-registry.spec.ts#269-287 @src/control-plane/qa/QaPanel.tsx#1075-1115
3. **Validation commands** — `npm run typecheck` and `npm run qa:e2e` complete with zero failures or skips (logs captured in this pass), satisfying the baseline infrastructure checks.

## Check Results

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | v27a is default active checklist | PASS | Playwright asserts the panel auto-selects `v27a` immediately after load, covering header badge + dropdown identity surfaces.@tests/e2e/contract-registry.spec.ts#246-255 |
| 2 | Heuristic runtime probe helper exists | PASS | Playwright calls `window.__lwRunThemeTargetProbe()` within tests, verifies it returns structured data, and QA Debug renders the summary cards.@tests/e2e/theme-target-inspector.spec.ts#218-237 @tests/e2e/contract-registry.spec.ts#269-287 |
| 3 | ≥3 candidate signals enforced | PASS | Playwright injects a synthetic `.lw-panel` container with structural, landmark, layout, and control aggregation hints, then confirms it appears inside `result.candidates` with at least three recorded signals—no manual console is involved.@tests/e2e/theme-target-inspector.spec.ts#277-314 |
| 4 | Insufficient signals return unknown/no warning | PASS | A <3-signal DOM snippet is injected during Playwright execution and immediately routed to `result.unknown` with status `unknown`, proving the fallback path without badges or DevTools scripts.@tests/e2e/theme-target-inspector.spec.ts#315-336 |
| 5 | Never-warn categories excluded | PASS | Probe output is inspected in Playwright to ensure nested QA tabs, toggle buttons, and other never-warn controls are absent from both `candidates[]` and `unknown[]`.@tests/e2e/theme-target-inspector.spec.ts#238-250 |
| 6 | Nested controls/text remain excluded | PASS | Same Playwright assertions confirm nested layout/utility nodes (e.g., QA tab buttons) are filtered out before signal counting.@tests/e2e/theme-target-inspector.spec.ts#238-250 |
| 7 | UI Inspector overlay DOM excluded | PASS | When the overlay is toggled on during Playwright, probe descriptors explicitly lack `theme-target-ghost-layer`, `theme-target-ghost-outline`, and `theme-target-inspector-panel`.@tests/e2e/theme-target-inspector.spec.ts#251-264 |
| 8 | Sigma/graph primitives ignored | PASS | Probe descriptors from Playwright never include `graph-viewport`, canvas, or Sigma-specific nodes, proving DOM-only scanning.@tests/e2e/theme-target-inspector.spec.ts#266-275 |
| 9 | No visible warning badges | PASS | After forcing the probe to run inside Playwright, the overlay is toggled and zero `data-testid="theme-target-warning-badge"` elements appear.@tests/e2e/theme-target-inspector.spec.ts#339-345 |
|10 | Ghost overlay behavior unchanged | PASS | Existing ghost-layer hotkey coverage passes unchanged, verifying pointer-events-none outlines still only render when the inspector is on.@tests/e2e/theme-target-inspector.spec.ts#205-215 |
|11 | Mission Control toggle unchanged | PASS | QA Debug’s toggle button and HUD indicator remain in sync in Playwright, ensuring no additional actions were added during v27a.@tests/e2e/theme-target-inspector.spec.ts#142-159 |
|12 | Alt+Shift+I hotkey unchanged | PASS | Baseline overlay hotkey spec continues to pass, proving v27a introduced no hotkey regressions.@tests/e2e/theme-target-inspector.spec.ts#39-88 |
|13 | No Theme Mapping/editing/storage added | PASS | Code diff confines runtime changes to the probe helper + QA wiring; Playwright plus repository diff review confirm no Theme Mapping panels, editing controls, lock/pin behavior, or override storage were introduced.@src/themes/themeTargetHeuristics.ts#1-362 @src/control-plane/qa/QaPanel.tsx#1-140 |
|14 | Graph renderer unaffected | PASS | Probe excludes Graph viewport primitives (see Check 8) and does not mutate Sigma renderers; documentation and code confirm the renderer path remains untouched.@docs/graph-intelligence/GRAPH_VIEW_ELEMENT_REGISTRATION_MODEL.md#38-57 @src/themes/ThemeTargetInspectorOverlay.tsx#1-246 |
|15 | Typecheck passes | PASS | `npm run typecheck` completes with zero errors before QA submission (log captured in session console).
|16 | Playwright passes with 0 skipped | PASS | `npm run qa:e2e` completes successfully; the runtime probe specs now live inside the suite ensuring evidence is collected programmatically.

## Advisory Snapshot

- Bandit questions for `v27a` remain unanswered pending next-pass decisions (badge visualization + lock/pin scope). Their status does not block runtime probe acceptance; they simply inform the upcoming v27b planning cycle.

## Notes

- The two previously blocked checks (≥3 signals, insufficient-signal fallback) are now covered by Playwright, so QA reviewers no longer need to run manual console snippets to gather evidence.
- Runtime probe output is fully auditable in QA Debug (`theme-target-probe-summary`) immediately after Playwright triggers the helper, keeping the evidence path UI-visible.
