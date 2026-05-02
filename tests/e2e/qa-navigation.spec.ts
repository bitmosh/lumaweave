import { expect, test } from "@playwright/test";

test("QA notes persist when moving next and previous (for multi-check checklists)", async ({ page }) => {
  await page.goto("/");

  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Check if navigation is available (multi-check checklist)
  const nextButton = page.getByRole("button", { name: /next/i });
  const isNextDisabled = await nextButton.isDisabled();

  if (isNextDisabled) {
    // Single-check checklist - navigation not applicable
    // Verify that the single check is visible instead
    const notesBox = qaPanel.locator("textarea").first();
    await expect(notesBox).toBeVisible();
    return;
  }

  // Multi-check checklist - test navigation
  const notesBox = qaPanel.locator("textarea").first();
  await notesBox.fill("note before navigation");

  await nextButton.click();
  const previousButton = page.getByRole("button", { name: /previous/i });
  await previousButton.click();

  await expect(notesBox).toHaveValue("note before navigation");
});