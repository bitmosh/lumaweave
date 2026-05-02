# Session Log: QA Panel v4 Recovery + Edge Hover Checklist Activation Fix

## Goal
Restore QA Panel functionality and ensure the active in-app checklist is baseline-b-consolidation-followup-v0:v4.

## Context
- Edge Hover Parity v0 visually looks good
- In-app QA panel showed "No QA checks found for this feature"
- qa:e2e failed with QA panel tests unable to find textarea/controls
- Bandit reported QA v4 was activated, but the app did not show the v4 checklist

## Root Cause Analysis

### "No QA checks found" Root Cause
**File:** src/control-plane/qa/QaPanel.tsx
**Line 8:** `const [activeQaVersion, setActiveQaVersion] = useState<number>(3);`

The QaPanel component was hardcoded to default to qaVersion 3. When Edge Hover Parity v0 archived v3 checks (set active: false, archived: true) and activated v4 checks (set active: true), the panel continued to look for v3 checks. The filter `check.active !== false` (line 22) excluded the archived v3 checks, resulting in an empty array. When no checks are found, the panel renders "No QA checks found for this feature" instead of the QA UI.

### Playwright Failures Root Cause
The Playwright tests (qa-panel.spec.ts, qa-navigation.spec.ts, qa-refresh.spec.ts, qa-submit.spec.ts, viewport-stability.spec.ts) were unable to find the textarea and navigation buttons because the QA panel was not rendering the normal UI - it was showing the "No QA checks found" message instead. Once the panel was fixed to default to v4, the tests passed without any changes to the test files.

## Files Changed

### src/control-plane/qa/QaPanel.tsx
**Line 8:** Changed default qaVersion from 3 to 4
```typescript
const [activeQaVersion, setActiveQaVersion] = useState<number>(4);
```

**Lines 25-51:** Added fallback logic to auto-select newest active checklist if current checklist has no active checks
```typescript
// Fallback: if current checklist has no active checks, auto-select newest active checklist
useEffect(() => {
  if (activeChecks.length === 0) {
    // Find all active checklists
    const allActiveChecklists = Array.from(
      new Set(
        qaCheckDefinitions
          .filter((check) => check.active !== false)
          .map((check) => `${check.featureId}:v${check.qaVersion}`)
      )
    ).map((checklistKey) => {
      const [featureId, versionStr] = checklistKey.split(":v");
      const qaVersion = parseInt(versionStr, 10);
      return { featureId, qaVersion, checklistKey };
    });

    // Sort by version descending to get newest
    allActiveChecklists.sort((a, b) => b.qaVersion - a.qaVersion);

    if (allActiveChecklists.length > 0) {
      const newest = allActiveChecklists[0];
      setActiveFeatureId(newest.featureId);
      setActiveQaVersion(newest.qaVersion);
      setCurrentIndex(0);
    }
  }
}, [activeFeatureId, activeQaVersion]);
```

## Checklist v4 Activation Status
- **Active featureId:** baseline-b-consolidation-followup-v0
- **Active qaVersion:** 4
- **v4 checklist contains 10 checks:**
  1. edge-hover-highlight-visible
  2. edge-hover-clears-on-leave
  3. edge-hover-does-not-clear-selection
  4. selected-edge-still-persists
  5. selected-node-still-persists
  6. node-hover-regression
  7. edge-label-mode-regression
  8. node-label-mode-regression
  9. background-clear-regression
  10. depth-regression
- **v4 checks status:** All active (active: true)
- **v3 checks status:** All archived (active: false, archived: true)
- **Old Label Controls Repair v0:** Remains archived/inactive
- **No checklists deleted:** All historical checklists preserved

## Validation Results

### Typecheck
✅ PASSED (npm run typecheck)

### qa:e2e
✅ PASSED (8/8 tests)
- app-smoke.spec.ts: PASSED
- settings-label-controls.spec.ts: PASSED
- edge-label-truncation.spec.ts: PASSED
- qa-panel.spec.ts: PASSED
- qa-navigation.spec.ts: PASSED
- qa-refresh.spec.ts: PASSED
- qa-submit.spec.ts: PASSED
- viewport-stability.spec.ts: PASSED

## Manual QA Instructions
To run the v4 in-app checklist for edge hover:

1. Open the LumaWeave app
2. Navigate to the QA Panel in the right dock
3. Confirm the active checklist is "Baseline B Consolidation Follow-up v4"
4. Run through the 10 checks:
   - edge-hover-highlight-visible: Hover over an unselected edge, confirm it highlights
   - edge-hover-clears-on-leave: Move cursor away, confirm hover clears
   - edge-hover-does-not-clear-selection: Select a node/edge, hover another, confirm selection persists
   - selected-edge-still-persists: Click an edge, confirm it stays selected after moving cursor
   - selected-node-still-persists: Click a node, confirm it stays selected after moving cursor
   - node-hover-regression: Hover a node, confirm it highlights and clears on leave
   - edge-label-mode-regression: Test off/all-short/selected-neighborhood modes
   - node-label-mode-regression: Test off/all/selected-neighborhood modes
   - background-clear-regression: Select node/edge, click background, confirm highlights clear
   - depth-regression: Test Node Selection Stage 1/2/3 for node and edge selection
5. Submit the report when all checks pass

## Acceptance Recommendation
ACCEPT - QA Panel v4 recovery is complete. The panel now correctly defaults to baseline-b-consolidation-followup-v0:v4, shows the 10 edge hover regression checks, and all Playwright tests pass. The fallback behavior ensures the panel will auto-select the newest active checklist if the current one becomes inactive in the future.
