import { expect, test } from "@playwright/test";

test("edge label length control is visible and functional", async ({ page }) => {
  await page.goto("/");

  // SettingsPanel is in the right dock under "Control Plane"
  const settingsPanel = page.getByTestId("settings-panel");
  await expect(settingsPanel).toBeVisible();

  // Verify Max Edge Label Length control exists
  const maxEdgeLabelLengthControl = page.getByTestId("setting-labels-maxEdgeLabelLength");
  await expect(maxEdgeLabelLengthControl).toBeVisible();

  // Verify it's a range input
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("type", "range");

  // Verify min and max attributes
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("min", "10");
  await expect(maxEdgeLabelLengthControl).toHaveAttribute("max", "100");
});
