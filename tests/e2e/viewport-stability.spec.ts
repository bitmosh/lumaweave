import { expect, test } from "@playwright/test";
import { openQaPanel } from "./helpers/qa";

test("graph remains visible after QA navigation (for multi-check checklists)", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  await expect(page.getByTestId("tab-qa")).toBeVisible();

  // Check if navigation is available (multi-check checklist)
  const nextButton = page.getByRole("button", { name: /next/i });
  const isNextDisabled = await nextButton.isDisabled();

  if (isNextDisabled) {
    // Single-check checklist - navigation not applicable
    // Verify that the graph is visible instead
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    return;
  }

  // Multi-check checklist - test navigation
  await nextButton.click();
  await nextButton.click();
  const previousButton = page.getByRole("button", { name: /previous/i });
  await previousButton.click();

  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();

  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  expect(beforeBox!.width).toBeGreaterThan(100);
  expect(beforeBox!.height).toBeGreaterThan(100);

  await nextButton.click();
  await previousButton.click();

  await expect(canvas).toBeVisible();

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  expect(afterBox!.width).toBeGreaterThan(100);
  expect(afterBox!.height).toBeGreaterThan(100);
});