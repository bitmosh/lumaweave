import { expect, test } from "@playwright/test";

test("QA notes persist after browser refresh before submit", async ({ page }) => {
  await page.goto("/");

  const notesBox = page.locator("textarea").first();

  await expect(notesBox).toBeVisible();

  await notesBox.fill("note before refresh");
  await expect(notesBox).toHaveValue("note before refresh");

  await page.reload();

  await expect(notesBox).toBeVisible();
  await expect(notesBox).toHaveValue("note before refresh");
});