# Session Log: QA Focused Checklist Activation v0

## Goal
Create and activate a focused in-app QA checklist for Baseline B Consolidation Follow-up v0, replacing the stale full Label Controls Repair v0 checklist in the app.

## Context
- Baseline B Consolidation Pass v0 created docs/35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md
- The in-app QA panel still showed the stale full Label Controls Repair v0 checklist
- User goal: One checklist to use per pass, inside the app (not separate manual doc + in-app checklist)
- Label Controls Repair v0 is already accepted (15 pass, 0 fail) and should not be repeated every pass

## Files Changed

### src/control-plane/qa/qa-registry.ts
- Added 10 new checks for baseline-b-consolidation-followup-v0 (active: true)
- Archived 15 checks for label-controls-repair-v0 (active: false, archived: true)
- New checks:
  1. inspector-starts-collapsed
  2. debug-starts-collapsed
  3. inspector-opens-on-node-selection
  4. inspector-opens-on-edge-selection
  5. debug-manual-only
  6. node-label-mode-regression
  7. edge-label-mode-regression
  8. hover-label-regression
  9. background-clear-regression
  10. edge-label-font-size-regression

### src/control-plane/qa/QaPanel.tsx
- Changed default activeFeatureId from "label-controls-repair-v0" to "baseline-b-consolidation-followup-v0"
- QA Panel already filters by active !== false, so archived checklists won't appear in dropdown
- QA Panel shows dropdown only if multiple active checklists exist (currently only 1 active)

### docs/35_BASELINE_B_CONSOLIDATION_QA_CHECKLIST.md
- Updated status to indicate checklist is now active in-app (featureId: baseline-b-consolidation-followup-v0)

## What Changed

1. New active checklist: baseline-b-consolidation-followup-v0 with 10 focused regression checks
2. Old archived checklist: label-controls-repair-v0 with 15 checks (accepted contract, preserved but not active)
3. QA Panel now defaults to the new focused checklist
4. Archived checklists do not appear in active checklist selector
5. Old submitted reports remain preserved in qa.store (submissions by featureId)

## Validation Results

- npm run typecheck: PASSED
- npm run qa:e2e: PASSED (7 tests)

## What Accepted Behavior Was Preserved

No graph renderer, label, or panel UX behavior changes. This was QA registry/checklist behavior only.

## Known Limitations

1. Manual QA required to verify the 10 focused checks in the new in-app checklist
2. Old label-controls-repair-v0 submissions remain in localStorage but are not visible in UI (archived)
3. No UI to view archived checklists or their historical submissions (future enhancement if needed)

## Issues Fixed Now
- Stale in-app checklist showing accepted baseline instead of current pass checklist
- Duplicate checklist workflow (manual doc + in-app) resolved to single in-app source of truth

## Issues Planned Next
- Manual QA pass using the new in-app focused checklist

## Issues Documented Only
- None

## Decision
ACCEPT

Rationale:
- All automated validation passed (typecheck, qa:e2e)
- No graph renderer, label, or panel UX behavior changes
- QA Panel behavior preserved (active filtering, dropdown logic, submission persistence)
- Old accepted checklist preserved as archived (not deleted)
- New focused checklist matches the consolidation pass scope
- Single source of truth for QA checklist per pass achieved

## Next Step
Manual QA pass using the in-app Baseline B Consolidation Follow-up v0 checklist
