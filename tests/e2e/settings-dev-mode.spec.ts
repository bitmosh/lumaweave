import { test, expect } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";

async function openAdvancedSettings(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("settings-category-nav-advanced").click();
  await expect(page.getByTestId("settings-category-content-advanced")).toBeVisible();
}

test.describe("Dev mode settings toggle", () => {
  test("dev mode toggle is present and off by default", async ({ page }) => {
    await openAdvancedSettings(page);
    const toggle = page.getByTestId("settings-dev-mode-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).not.toBeChecked();
  });

  test("developer.devMode is false on fresh settings", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const devMode = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.developer?.devMode
    );
    expect(devMode).toBe(false);
  });

  test("toggling dev mode persists to settings store", async ({ page }) => {
    await openAdvancedSettings(page);
    const toggle = page.getByTestId("settings-dev-mode-toggle");
    await toggle.click();
    const state = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.developer?.devMode
    );
    expect(state).toBe(true);
    // Toggle back off to avoid polluting other tests
    await toggle.click();
    const stateOff = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.developer?.devMode
    );
    expect(stateOff).toBe(false);
  });

  test("settings store has developer.devMode field after load", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const state = await page.evaluate(
      () => (window as any).__lwStore.getState().settings
    );
    expect(state.developer).toBeDefined();
    expect(typeof state.developer.devMode).toBe("boolean");
    expect(state.version).toBe(94);
  });
});
