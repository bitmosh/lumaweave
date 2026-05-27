import { expect, test } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";

test("settings panel shows label controls", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);

  // Open settings panel and navigate to Graph category
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("settings-category-nav-graph").click();
  await expect(page.getByTestId("settings-category-content-graph")).toBeVisible({ timeout: 3000 });

  // Verify Node Label Mode control exists (Labels category)
  const nodeLabelModeControl = page.getByTestId("setting-labels-nodeLabelMode");
  await expect(nodeLabelModeControl).toBeVisible();

  // Verify Edge Label Mode control exists
  const edgeLabelModeControl = page.getByTestId("setting-labels-edgeLabelMode");
  await expect(edgeLabelModeControl).toBeVisible();

  // Verify Edge Label Font Size control exists
  const edgeLabelFontSizeControl = page.getByTestId("setting-labels-edgeLabelFontSize");
  await expect(edgeLabelFontSizeControl).toBeVisible();

  // Verify Node Label Font Size control exists
  const nodeLabelFontSizeControl = page.getByTestId("setting-labels-nodeLabelFontSize");
  await expect(nodeLabelFontSizeControl).toBeVisible();
});
