import { expect, test } from "@playwright/test";

test("graph remains visible after QA navigation", async ({ page }) => {
  await page.goto("/");

  const canvas = page.locator("canvas").first();

  await expect(canvas).toBeVisible();

  const beforeBox = await canvas.boundingBox();
  expect(beforeBox).not.toBeNull();
  expect(beforeBox!.width).toBeGreaterThan(100);
  expect(beforeBox!.height).toBeGreaterThan(100);

  const nextButton = page.getByRole("button", { name: /next/i });
  const previousButton = page.getByRole("button", { name: /previous/i });

  await nextButton.click();
  await nextButton.click();
  await previousButton.click();

  await expect(canvas).toBeVisible();

  const afterBox = await canvas.boundingBox();
  expect(afterBox).not.toBeNull();
  expect(afterBox!.width).toBeGreaterThan(100);
  expect(afterBox!.height).toBeGreaterThan(100);
});