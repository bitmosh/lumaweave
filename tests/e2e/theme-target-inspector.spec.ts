import { test, expect } from "@playwright/test";
import { openQaPanel, openDebugTab } from "./helpers/qa";

const OVERLAY_TOGGLE = "theme-target-inspector-toggle-state";

test.describe("Theme Target Registry + Inspector Overlay", () => {
  test("debug tab shows Theme Target registry summary", async ({ page }) => {
    await page.goto("/");
    await openQaPanel(page);
    await openDebugTab(page);

    await expect(page.getByTestId("theme-target-summary")).toBeVisible();
    await expect(page.getByTestId("theme-target-summary-total")).toContainText(/\d+/);
    await expect(page.getByTestId("theme-target-summary-active")).toContainText(/\d+/);
    await expect(page.getByTestId("theme-target-surface-list")).toBeVisible();
  });

  test("data-lw-theme-target attributes exist on shell + mission control + graph", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('[data-lw-theme-target="app.shell"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="topbar.root"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="mission-control.panel"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="graph.frame"]').first()).toBeVisible();
    await expect(page.locator('[data-lw-theme-target="settings.panel"]').first()).toBeVisible();
  });

  test("inspector overlay toggles via hotkey and shows metadata", async ({ page }) => {
    await page.goto("/");

    const toggleIndicator = page.getByTestId(OVERLAY_TOGGLE);
    await expect(toggleIndicator).toContainText("OFF");

    await page.keyboard.press("Control+Alt+T");
    await expect(toggleIndicator).toContainText("ON");

    const missionControlPanel = page.locator('[data-lw-theme-target="mission-control.panel"]').first();
    await missionControlPanel.hover();

    const tooltip = page.getByTestId("theme-target-inspector-tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("mission-control.panel");
    await expect(tooltip).toContainText("Token Bindings");

    // Toggle off to ensure overlay hides cleanly
    await page.keyboard.press("Control+Alt+T");
    await expect(toggleIndicator).toContainText("OFF");
    await expect(page.getByTestId("theme-target-inspector-tooltip")).toHaveCount(0);
  });
});
