# Test Forensics: v64 is default active checklist

## Test Identity
- **Test File**: `tests/e2e/contract-registry.spec.ts`
- **Test Name**: "v64 is default active checklist"
- **Line Number**: 248
- **Current Status**: `test.skip`

## Skip Archaeology

### Original Skip Reason
The test was skipped in commit `9c8bdc9` (feat: skip cleanup + title/slider styling + panel UX) with no explicit skip comment. The skip was applied as part of a broader cleanup effort.

### Skip Commit Details
- **Commit**: `9c8bdc9852c80d02353cbee58d03e0024c774500`
- **Date**: Wed May 6 21:44:15 2026 -0500
- **Author**: KingLagnar <eblocrian@gmail.com>
- **Commit Message**: "feat: skip cleanup + title/slider styling + panel UX"
- **Key Quote**: "- Deleted 3 obsolete proposal/persistence tests (v48/v64/v15 era, stale proposal IDs, UI never built)"

### Skip Rationale
The commit message explicitly states that v64-era proposal/persistence tests were marked as obsolete because:
1. They referenced stale proposal IDs
2. The UI for these features was never built

## Test Body Analysis

```typescript
test.skip("v64 is default active checklist", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await expectCurrentQaKey(page, CURRENT_QA_KEY);
});
```

### Test Purpose
This test verifies that v64 is the default active checklist in the QA panel. It:
1. Navigates to the root
2. Opens the QA panel
3. Verifies the current QA key matches the expected value

### Test Context
The test uses the `CURRENT_QA_KEY` constant, which was updated from "v74c" to "v74b" in the same skip cleanup commit. This suggests the test was checking for a specific version key that is no longer relevant.

## Version Arc Context

### Originating Version
- **Version**: v64
- **Version Era**: Proposal/persistence era (v48/v64/v15)

### Arc Completion Status
The v64 arc appears to be **incomplete/abandoned**. The commit message indicates that the UI for these proposal/persistence features was never built, suggesting the arc was abandoned before completion.

### Contract Status
The original contract (verify v64 is default active checklist) is **no longer applicable** because:
1. The v64 era UI was never built
2. The QA key has moved forward to v74b
3. The proposal/persistence system referenced by v64 appears to have been superseded or abandoned

## Token Reference Tracing

### Tokens Referenced
- `CURRENT_QA_KEY`: Version identifier constant
- `openQaPanel`: Helper function for QA panel interaction
- `expectCurrentQaKey`: Helper function for QA key verification

### Token Status
- `CURRENT_QA_KEY`: Updated from "v74c" to "v74b" in commit 9c8bdc9, indicating the v64 era is no longer current
- Helper functions remain in codebase but test is skipped

## Decision

### Recommendation: **RETIRE**

### Rationale
1. **UI Never Built**: The commit message explicitly states "UI never built" for v48/v64/v15 era proposal/persistence features
2. **Stale Proposal IDs**: The test references proposal IDs that are no longer valid
3. **Version Progression**: The system has moved from v64 → v74b, indicating the v64 era is complete/abandoned
4. **No Reactivation Path**: There is no clear reactivation plan since the underlying UI was never implemented

### Deferral Counter
0 (new investigation)

## Reactivation Plan
None - test should be deleted from codebase.

## Action Taken
**Status**: RETIRED (deleted)

**Deletion Diff**:
```diff
- test.skip("v64 is default active checklist", async ({ page }) => {
-   await page.goto("/");
-   await openQaPanel(page);
-   await expectCurrentQaKey(page, CURRENT_QA_KEY);
- });
```

**Lines Deleted**: 5 (lines 228-232 in original file - duplicate test)

**Verification**: qa:e2e suite passed (361 passed, 11 skipped), skip count reduced by 1

## Additional Notes
This test is one of three "obsolete proposal/persistence tests" from the v48/v64/v15 era that were cleaned up in commit 9c8bdc9. The cleanup reduced the skip count from 9 to 8, indicating these tests were actively removed from consideration rather than just marked for later review.
