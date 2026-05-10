# Test Forensics: advisory backlog reorder moves item down

## Test Identity
- **Test File**: `tests/e2e/contract-registry.spec.ts`
- **Test Name**: "advisory backlog reorder moves item down"
- **Line Number**: 288
- **Current Status**: `test.skip`

## Skip Archaeology

### Original Skip Reason
The test was skipped in commit `9c8bdc9` (feat: skip cleanup + title/slider styling + panel UX). The skip was applied as part of a broader cleanup effort, likely due to the same backlog data structure issues affecting other backlog tests.

### Skip Commit Details
- **Commit**: `9c8bdc9852c80d02353cbee58d03e0024c774500`
- **Date**: Wed May 6 21:44:15 2026 -0500
- **Author**: KingLagnar <eblocrian@gmail.com>
- **Commit Message**: "feat: skip cleanup + title/slider styling + panel UX"
- **Key Quote**: "- Deleted 3 obsolete proposal/persistence tests (v48/v64/v15 era, stale proposal IDs, UI never built)"

### Skip Rationale
The commit message explicitly states that v48/v64/v15-era proposal/persistence tests were marked as obsolete because:
1. They referenced stale proposal IDs
2. The UI for these features was never built

This test is part of the backlog reorder functionality, which depends on the backlog data structure that was removed (as indicated by the "empty backlog array" skip reason for the related "Bandit Backlog Top 10 renders" test).

## Test Body Analysis

```typescript
test.skip("advisory backlog reorder moves item down", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  await waitForAdvisorySection(page);

  // Wait for backlog items to be rendered
  await page.waitForSelector('[data-testid="bandit-backlog-item-1"]');

  const firstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-down-1").click();
  await expect(page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title")).toHaveText(firstTitle || "");
});
```

### Test Purpose
This test verifies that backlog items can be reordered by moving an item down. It:
1. Navigates to the root
2. Opens the QA panel and Advisory tab
3. Waits for backlog items to be rendered
4. Gets the title of the first backlog item
5. Clicks the move-down button for the first item
6. Verifies the item moved to position 2

### Test Context
The test is part of the contract-registry test suite. It tests the backlog reorder functionality, which is part of the proposal/persistence system.

## Version Arc Context

### Originating Version
- **Version**: v15
- **Version Era**: Proposal/persistence era (v48/v64/v15)

### Arc Completion Status
The v15 arc appears to be **incomplete/abandoned**. The commit message indicates that the UI for these proposal/persistence features was never built. The related "Bandit Backlog Top 10 renders" test had a skip reason indicating "empty backlog array", suggesting the backlog data structure was removed.

### Contract Status
The original contract (verify backlog reorder down works) is likely **broken** because:
1. The backlog array may not exist in current advisory data
2. The backlog reorder UI may not have been built or was removed
3. The v15 era is complete/abandoned

## Token Reference Tracing

### Tokens Referenced
- `openQaPanel`: Helper function for QA panel interaction
- `openAdvisoryTab`: Helper function for Advisory tab
- `bandit-backlog-item-1`: Test ID for first backlog item
- `bandit-backlog-move-down-1`: Test ID for move-down button
- `bandit-backlog-title`: Test ID for backlog item title

### Token Status
- Helper functions remain in codebase
- Test IDs may or may not exist in current UI
- The backlog array structure may have been removed from advisory data

## Decision

### Recommendation: **RETIRE**

### Rationale
1. **UI Never Built**: The commit message explicitly states "UI never built" for v48/v64/v15 era proposal/persistence features
2. **Data Structure Changed**: The related "Bandit Backlog Top 10 renders" test had a skip reason indicating "v74c advisory has empty backlog array (passive UI pass)", suggesting the backlog data structure was intentionally removed
3. **Version Progression**: The system has moved from v15 → v74b, indicating the v15 era is complete/abandoned
4. **No Clear Reactivation Path**: The backlog array appears to have been removed from advisory data, making reactivation difficult without significant data structure changes

### Deferral Counter
0 (new investigation)

## Action Taken
**Status**: DELETED

**Deletion Diff**:
```diff
- test.skip("advisory backlog reorder moves item down", async ({ page }) => {
-   await page.goto("/");
-   await openQaPanel(page);
-   await openAdvisoryTab(page);
-
-   await waitForAdvisorySection(page);
-
-   // Wait for backlog items to be rendered
-   await page.waitForSelector('[data-testid="bandit-backlog-item-1"]');
-
-   const firstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
-   await page.getByTestId("bandit-backlog-move-down-1").click();
-   await expect(page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title")).toHaveText(firstTitle || "");
- });
```

**Lines Deleted**: 14 (lines 288-301 in original file)

**Verification**: Test deleted from contract-registry.spec.ts. RETIRE decision executed immediately per vP-Forensics-2 process.

## Additional Notes
This test is part of the v48/v64/v15 era proposal/persistence feature set that was marked as obsolete in commit 9c8bdc9. It depends on the backlog data structure that was removed, making it functionally impossible to run without significant data structure restoration.
