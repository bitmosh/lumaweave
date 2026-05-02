import { expect, test } from "@playwright/test";

test("app loads core LumaWeave shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("LumaWeave Observatory")).toBeVisible();
  await expect(page.getByText("Graph Sources")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Control Plane" })).toBeVisible();
});