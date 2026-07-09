// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { openQaPanel } from "./helpers/qa";

test("QA notes persist after browser refresh before submit", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const notesBox = page.locator("textarea").first();

  await expect(notesBox).toBeVisible();

  await notesBox.fill("note before refresh");
  await expect(notesBox).toHaveValue("note before refresh");

  await page.reload();
  await openQaPanel(page);

  await expect(notesBox).toBeVisible();
  await expect(notesBox).toHaveValue("note before refresh");
});