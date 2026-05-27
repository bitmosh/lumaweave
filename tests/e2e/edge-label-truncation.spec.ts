import { expect, test } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";

test("edge label length control is visible and functional", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);

  // Open settings panel and navigate to Graph → Labels
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("settings-category-nav-graph").click();
  await expect(page.getByTestId("settings-category-content-graph")).toBeVisible({ timeout: 3000 });

  // Verify Max Edge Label Length control exists
  const maxEdgeLabelLengthControl = page.getByTestId("setting-labels-maxEdgeLabelLength");
  await expect(maxEdgeLabelLengthControl).toBeVisible();

  // Verify it's a range input
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("type", "range");

  // Verify min and max attributes
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("min", "10");
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("max", "100");
});
