import { expect, test } from "@playwright/test";

test("app loads core LumaWeave shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("LumaWeave", { exact: true })).toBeVisible();
  await expect(page.getByText("Map. Understand. Build.")).toBeVisible();
  await expect(page.getByText("Graph Sources")).toBeVisible();
});