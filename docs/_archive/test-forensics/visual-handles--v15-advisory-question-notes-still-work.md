# Test Forensics: v15 advisory question notes still work

## Test Identity
- **Test File**: `tests/e2e/visual-handles.spec.ts`
- **Test Name**: "v15 advisory question notes still work"
- **Line Number**: 39
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
The commit message explicitly states that v15-era proposal/persistence tests were marked as obsolete because:
1. They referenced stale proposal IDs
2. The UI for these features was never built

The original conditional skip reason indicated that v74c advisory had "no questions array (passive UI pass)", suggesting the questions array was removed or not populated in v74c.

## Test Body Analysis

```typescript
test.skip("v15 advisory question notes still work", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const qaPanel = page.getByTestId("qa-panel").first();
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  const firstQuestionNotes = qaPanel.locator("[data-testid^='bandit-question-notes-']").first();
  await expect(firstQuestionNotes).toBeVisible();
  
  await firstQuestionNotes.fill("Test notes for visual handle library v0");
  await expect(firstQuestionNotes).toHaveValue("Test notes for visual handle library v0");
});
```

### Test Purpose
This test verifies that advisory question notes can be filled and persist. It:
1. Navigates to the root
2. Opens the QA panel
3. Switches to the Advisory tab
4. Finds the first question notes field
5. Verifies it is visible
6. Fills it with test text
7. Verifies the value persists

### Test Context
The test is part of the "Visual Handle Library v0" test suite. It tests the visual handle library's question notes functionality, specifically for v15-era advisory questions.

## Version Arc Context

### Originating Version
- **Version**: v15
- **Version Era**: Proposal/persistence era (v48/v64/v15)

### Arc Completion Status
The v15 arc appears to be **incomplete/abandoned**. The commit message indicates that the UI for these proposal/persistence features was never built. Additionally, the original conditional skip reason mentioned that v74c advisory had "no questions array", suggesting the questions data structure was removed or changed.

### Contract Status
The original contract (verify question notes work) is likely **broken** because:
1. The questions array may not exist in current advisory data
2. The UI for question notes may not have been built or was removed
3. The v15 era is complete/abandoned

## Token Reference Tracing

### Tokens Referenced
- `openQaPanel`: Helper function for QA panel interaction
- `qa-panel`: Test ID for QA panel
- `qa-tab-advisory`: Test ID for Advisory tab
- `bandit-question-notes-`: Test ID prefix for question notes fields

### Token Status
- Helper functions remain in codebase
- Test IDs may or may not exist in current UI
- The questions array structure may have been removed from advisory data

## Decision

### Recommendation: **RETIRE**

### Rationale
1. **UI Never Built**: The commit message explicitly states "UI never built" for v15-era proposal/persistence features
2. **Data Structure Changed**: The original conditional skip indicated "v74c advisory has no questions array (passive UI pass)", suggesting the questions data structure was removed
3. **Version Progression**: The system has moved from v15 → v74b, indicating the v15 era is complete/abandoned
4. **No Clear Reactivation Path**: The questions array appears to have been removed from advisory data, making reactivation difficult without significant data structure changes

### Deferral Counter
0 (new investigation)

## Reactivation Plan
None - test should be deleted from codebase. Question notes functionality may have been removed or moved to a different implementation.

## Action Taken
**Status**: RETIRED (deleted)

**Deletion Diff**:
```diff
-  test.skip("v15 advisory question notes still work", async ({ page }) => {
-    await page.goto("/");
-    await openQaPanel(page);
-
-    const qaPanel = page.getByTestId("qa-panel").first();
-    const advisoryTab = page.getByTestId("qa-tab-advisory");
-    await advisoryTab.click();
-
-    const firstQuestionNotes = qaPanel.locator("[data-testid^='bandit-question-notes-']").first();
-    await expect(firstQuestionNotes).toBeVisible();
-    
-    await firstQuestionNotes.fill("Test notes for visual handle library v0");
-    await expect(firstQuestionNotes).toHaveValue("Test notes for visual handle library v0");
-  });
```

**Lines Deleted**: 14 (lines 39-52 in original file)

**Verification**: qa:e2e suite passed (361 passed, 11 skipped), skip count reduced by 1

## Additional Notes
This test is one of three "obsolete proposal/persistence tests" from the v48/v64/v15 era that were cleaned up in commit 9c8bdc9. The test was originally conditionally skipped for v74c due to missing questions array, then unconditionally skipped in the cleanup commit. This suggests the questions array was intentionally removed from the advisory data structure.
