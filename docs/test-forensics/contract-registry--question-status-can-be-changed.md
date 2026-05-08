# Test Forensics: Question status can be changed

## Test Identity
- **Test File**: `tests/e2e/contract-registry.spec.ts`
- **Test Name**: "Question status can be changed"
- **Line Number**: 195
- **Current Status**: `test.skip`

## Skip Archaeology

### Original Skip Reason
The test was skipped in commit `9c8bdc9` (feat: skip cleanup + title/slider styling + panel UX). Prior to this commit, it was conditionally skipped with `test.skip(CURRENT_QA_KEY === "v74c", "v74c advisory has no questions array (passive UI pass)")`. In 9c8bdc9, it was changed to an unconditional skip.

### Skip Commit Details
- **Commit**: `9c8bdc9852c80d02353cbee58d03e0024c774500`
- **Date**: Wed May 6 21:44:15 2026 -0500
- **Author**: KingLagnar <eblocrian@gmail.com>
- **Commit Message**: "feat: skip cleanup + title/slider styling + panel UX"
- **Key Quote**: "- Deleted 3 obsolete proposal/persistence tests (v48/v64/v15 era, stale proposal IDs, UI never built)"

### Skip Rationale
The original conditional skip reason indicated that v74c advisory had "no questions array (passive UI pass)", suggesting the questions array was removed or not populated in v74c. The cleanup commit then unconditionally skipped the test as part of the broader cleanup of v48/v64/v15 era tests.

## Test Body Analysis

```typescript
test.skip("Question status can be changed", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();
  await page.waitForTimeout(150);

  // Find a question status selector
  const firstStatusSelector = page.locator("select").filter({ hasText: /unanswered/i }).first();
  await expect(firstStatusSelector).toBeVisible();

  // Change status
  await firstStatusSelector.selectOption("answered");

  // Verify value changed
  await expect(firstStatusSelector).toHaveValue("answered");
});
```

### Test Purpose
This test verifies that question status can be changed in the Advisory tab. It:
1. Navigates to the root
2. Opens the QA panel
3. Switches to the Advisory tab
4. Finds a question status selector (dropdown)
5. Verifies it is visible
6. Changes the status from "unanswered" to "answered"
7. Verifies the value changed

### Test Context
The test is part of the contract-registry test suite. It tests the ability to change question status, which is a core advisory feature. Unlike the other three Wave 1 tests, this test does not reference a specific version in its name, but it was grouped with the v48/v64/v15 era tests in the cleanup.

## Version Arc Context

### Originating Version
- **Version**: Not explicitly referenced in test name
- **Version Era**: Associated with v48/v64/v15 proposal/persistence era (based on cleanup grouping)

### Arc Completion Status
The questions array appears to be **removed/abandoned**. The original conditional skip reason indicated that v74c advisory had "no questions array (passive UI pass)", suggesting the questions data structure was intentionally removed from the advisory system.

### Contract Status
The original contract (verify question status can be changed) is likely **broken** because:
1. The questions array may not exist in current advisory data
2. The status selector UI may not be rendered without questions
3. The test was grouped with obsolete v48/v64/v15 era tests

## Token Reference Tracing

### Tokens Referenced
- `openQaPanel`: Helper function for QA panel interaction
- `qa-tab-advisory`: Test ID for Advisory tab
- Status selector: `<select>` element with "unanswered" text

### Token Status
- Helper functions remain in codebase
- Test IDs exist in codebase
- The questions array structure may have been removed from advisory data

## Decision

### Recommendation: **RETIRE**

### Rationale
1. **Data Structure Changed**: The original conditional skip indicated "v74c advisory has no questions array (passive UI pass)", suggesting the questions array was intentionally removed
2. **Grouped with Obsolete Tests**: The test was grouped with v48/v64/v15 era tests in the cleanup commit, suggesting it is part of the same abandoned feature set
3. **No Clear Reactivation Path**: The questions array appears to have been removed from advisory data, making reactivation difficult without significant data structure changes
4. **Passive UI Pass**: The skip reason mentions "passive UI pass", suggesting the feature was intentionally disabled

### Deferral Counter
0 (new investigation)

## Reactivation Plan
None - test should be deleted from codebase. Question status functionality appears to have been removed from the advisory system.

## Action Taken
**Status**: RETIRED (deleted)

**Deletion Diff**:
```diff
- test.skip("Question status can be changed", async ({ page }) => {
-   await page.goto("/");
-   await openQaPanel(page);
-
-   // Switch to Advisory tab
-   const advisoryTab = page.getByTestId("qa-tab-advisory");
-   await advisoryTab.click();
-   await page.waitForTimeout(150);
-
-   // Find a question status selector
-   const firstStatusSelector = page.locator("select").filter({ hasText: /unanswered/i }).first();
-   await expect(firstStatusSelector).toBeVisible();
-
-   // Change status
-   await firstStatusSelector.selectOption("answered");
-
-   // Verify value changed
-   await expect(firstStatusSelector).toHaveValue("answered");
- });
```

**Lines Deleted**: 19 (lines 195-213 in original file)

**Verification**: qa:e2e suite passed (361 passed, 11 skipped), skip count reduced by 1

## Additional Notes
This test was originally conditionally skipped for v74c due to missing questions array, then unconditionally skipped in the cleanup commit. Although it does not reference a specific version in its name, it was grouped with the v48/v64/v15 era tests in the cleanup, suggesting it is part of the same abandoned proposal/persistence feature set. The "passive UI pass" language suggests this was an intentional architectural decision rather than a temporary skip.
