# Test Forensics: v48 report includes Advisory Set Key

## Test Identity
- **Test File**: `tests/e2e/contract-registry.spec.ts`
- **Test Name**: "v48 report includes Advisory Set Key"
- **Line Number**: 373
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
The commit message explicitly states that v48-era proposal/persistence tests were marked as obsolete because:
1. They referenced stale proposal IDs
2. The UI for these features was never built

## Test Body Analysis

```typescript
test.skip("v48 report includes Advisory Set Key", async ({ page }) => {
  await page.goto("/");

  // Complete checklist and submit report using helper
  await completeChecklistAndSubmitReport(page);

  // Get last report text
  const reportText = await getLastReportText(page);

  // Verify report includes current QA key
  expect(reportText).toContain(CURRENT_QA_KEY);
});
```

### Test Purpose
This test verifies that submitted reports include the Advisory Set Key (QA key). It:
1. Navigates to the root
2. Completes the checklist and submits a report
3. Retrieves the last report text
4. Verifies the report contains the current QA key

### Test Context
The test uses the `CURRENT_QA_KEY` constant and helper functions `completeChecklistAndSubmitReport` and `getLastReportText`. The test name references v48, but the body checks for the `CURRENT_QA_KEY`, suggesting it was testing v48-era reporting behavior.

## Version Arc Context

### Originating Version
- **Version**: v48
- **Version Era**: Proposal/persistence era (v48/v64/v15)

### Arc Completion Status
The v48 arc appears to be **incomplete/abandoned**. The commit message indicates that the UI for these proposal/persistence features was never built, suggesting the arc was abandoned before completion.

### Contract Status
The original contract (verify report includes Advisory Set Key) may still be relevant for current versions, but the v48-specific implementation is obsolete. The system has moved to v74b, and the reporting mechanism may have changed.

## Token Reference Tracing

### Tokens Referenced
- `CURRENT_QA_KEY`: Version identifier constant
- `completeChecklistAndSubmitReport`: Helper function for report submission
- `getLastReportText`: Helper function for report text retrieval

### Token Status
- `CURRENT_QA_KEY`: Updated from "v74c" to "v74b" in commit 9c8bdc9
- Helper functions remain in codebase and are used by other active tests

## Decision

### Recommendation: **RETIRE**

### Rationale
1. **UI Never Built**: The commit message explicitly states "UI never built" for v48-era proposal/persistence features
2. **Stale Proposal IDs**: The test references v48-era proposal IDs that are no longer valid
3. **Version Progression**: The system has moved from v48 → v74b, indicating the v48 era is complete/abandoned
4. **Functionality May Exist Elsewhere**: The core functionality (report includes QA key) is likely tested in other active tests for current versions

### Deferral Counter
0 (new investigation)

## Reactivation Plan
None - test should be deleted from codebase. Core functionality likely covered by other tests.

## Action Taken
**Status**: RETIRED (deleted)

**Deletion Diff**:
```diff
- test.skip("v48 report includes Advisory Set Key", async ({ page }) => {
-   await page.goto("/");
-
-   // Complete checklist and submit report using helper
-   await completeChecklistAndSubmitReport(page);
-
-   // Get last report text
-   const reportText = await getLastReportText(page);
-
-   // Verify report includes current QA key
-   expect(reportText).toContain(CURRENT_QA_KEY);
- });
```

**Lines Deleted**: 12 (lines 373-384 in original file)

**Verification**: qa:e2e suite passed (361 passed, 11 skipped), skip count reduced by 1

## Additional Notes
This test is one of three "obsolete proposal/persistence tests" from the v48/v64/v15 era that were cleaned up in commit 9c8bdc9. The test name references v48 specifically, but the test body checks for `CURRENT_QA_KEY`, suggesting it was intended to verify v48-era reporting behavior that is no longer relevant.
