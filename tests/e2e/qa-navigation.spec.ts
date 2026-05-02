import { expect, test } from "@playwright/test";

test("QA notes persist when moving next and previous", async ({ page }) => {
  await page.goto("/");

  const notesBox = page.locator("textarea").first();

  await expect(notesBox).toBeVisible();

  await notesBox.fill("note before navigation");
  await expect(notesBox).toHaveValue("note before navigation");

  await page.getByRole("button", { name: /next/i }).click();
  await page.getByRole("button", { name: /previous/i }).click();

  await expect(notesBox).toHaveValue("note before navigation");
});