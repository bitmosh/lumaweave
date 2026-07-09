// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { openQaPanel } from "./helpers/qa";

test("QA panel allows typing and deleting notes", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const notesBox = page.locator("textarea").first();

  await expect(notesBox).toBeVisible();

  await notesBox.fill("testing qa notes");
  await expect(notesBox).toHaveValue("testing qa notes");

  await notesBox.fill("");
  await expect(notesBox).toHaveValue("");

  await notesBox.fill("new note after delete");
  await expect(notesBox).toHaveValue("new note after delete");
});