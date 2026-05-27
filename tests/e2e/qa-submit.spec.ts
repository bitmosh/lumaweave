import { expect, test } from "@playwright/test";
import { openQaPanel } from "./helpers/qa";

test("QA submit clears working form", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const notesBox = page.locator("textarea").first();
  await expect(notesBox).toBeVisible();

  await notesBox.fill("note that should clear after submit");
  await expect(notesBox).toHaveValue("note that should clear after submit");

  const statusSelect = page.locator("select").filter({
    has: page.locator("option[value='pass']"),
  }).first();

  await expect(statusSelect).toBeVisible();

  await statusSelect.selectOption("pass");
  await expect(statusSelect).toHaveValue("pass");

  await page.getByRole("button", { name: /submit/i }).click();

  await expect(notesBox).toHaveValue("");
  await expect(statusSelect).toHaveValue("untested");
});