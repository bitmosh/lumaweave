import { expect, test } from "@playwright/test";

test("settings panel shows label controls", async ({ page }) => {
  await page.goto("/");

  // SettingsPanel is in the right dock under "Control Plane"
  const settingsPanel = page.getByTestId("settings-panel");
  await expect(settingsPanel).toBeVisible();

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
