# Session Log: QA Panel v1

## Goal
Upgrade the existing QA panel into a usable in-app manual QA harness for Label Controls Repair v0 acceptance testing.

## Files Changed
- `src/control-plane/qa/qa.types.ts` - Added QaStatus type, QaCheckDefinition interface, QaCheckResult interface
- `src/control-plane/qa/qa-registry.ts` - Added qaCheckDefinitions array with Label Controls Repair v0 checklist (15 checks)
- `src/control-plane/qa/QaPanel.tsx` - Complete rewrite from checkbox-based to status-selector-based with acceptance decision logic

## What Changed

### QA Types
- Added `QaStatus` type: "untested" | "pass" | "fail" | "blocked" | "unverified"
- Added `QaCheckDefinition` interface with id, featureId, featureName, title, expected, steps, required, fallbackAllowed
- Added `QaCheckResult` interface with checkId, status, notes, updatedAt

### QA Registry
- Added `qaCheckDefinitions` array with 15 Label Controls Repair v0 checks:
  1. app-reachable
  2. node-label-dropdown-visible
  3. edge-label-dropdown-visible
  4. node-label-off
  5. node-label-all
  6. node-label-selected-neighborhood
  7. hover-label-shows
  8. hover-no-stale-style
  9. edge-label-off
  10. edge-label-all-short (fallbackAllowed: true)
  11. edge-label-selected-neighborhood (fallbackAllowed: true)
  12. selection-node
  13. selection-edge
  14. background-clears-selection
  15. label-settings-do-not-break-selection

### QA Panel Component
- Replaced checkbox-based UI with status selector dropdown (Untested | Pass | Fail | Blocked | Unverified)
- Added feature selector dropdown (currently only Label Controls Repair v0)
- Added summary counts display (pass, fail, blocked, unverified, untested)
- Added acceptance decision computation logic:
  - ACCEPT if all required checks pass
  - ACCEPT WITH FALLBACK REQUIRED if only fallback-allowed checks fail with notes
  - DO NOT ACCEPT if any required check fails (non-fallback)
  - BLOCKED if any required check is blocked/unverified
  - INCOMPLETE if any required check is untested
- Added Copy QA Report button (copies markdown report to clipboard)
- Added Reset button (clears all QA results)
- Added expandable details for expected behavior and test steps
- Added notes textarea for each check
- Added persistence note (v1 uses local React state, persistence planned)
- Color-coded status dropdowns and decision display

## Validation
- Typecheck passed: `npm run typecheck` succeeded with no errors
- QaPanel is already wired into AppShell (imported and rendered at line 209)

## Known Limitations
- Persistence: v1 uses local React state only. QA state is lost on page refresh. Persistence in Zustand/localStorage is planned for v2.
- Single feature: Currently only supports Label Controls Repair v0. Feature selector exists but only has one option.
- No browser automation: QA panel is for manual in-app testing only. No automated test execution.
- No external dependencies: Uses only React built-in hooks and browser clipboard API.

## Next Step
User should manually verify QA panel renders and functions correctly in the running app at http://localhost:1420:
- QA panel appears in left sidebar
- Status selector works
- Notes textarea works
- Summary counts update
- Acceptance decision updates
- Copy Report button copies markdown to clipboard
- Reset button clears all results
- Expected & Steps details expand/collapse

## Design Decision
Changed from checkboxes to status selector dropdowns as requested. This provides more precise QA state tracking:
- Untested = not yet tested
- Pass = test passed
- Fail = test failed
- Blocked = test cannot be performed (dependency missing, etc.)
- Unverified = test was attempted but result is uncertain

This distinction is critical for acceptance decisions and prevents ambiguity between "not tested" and "test failed".
