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

async function openTilesPopover(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await clearTiles(page);
  await page.getByTestId("status-bar-tiles-button").click();
  await expect(page.getByTestId("tiles-popover-content")).toBeVisible({ timeout: 5000 });
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

test.describe("Dev mode tile gating", () => {
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      if (store) store.getState().setSetting("developer.devMode", false);
    });
  });

  test("qa-feedback-section not in tiles popover by default (dev mode off)", async ({ page }) => {
    await openTilesPopover(page);
    await expect(page.getByTestId("tiles-popover-checkbox-qa-feedback-section")).not.toBeVisible();
  });

  test("qa-feedback-section appears in tiles popover when dev mode is on", async ({ page }) => {
    await openTilesPopover(page);
    // Enable dev mode — TilesPopoverContent reacts to store, re-renders in place
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      if (store) store.getState().setSetting("developer.devMode", true);
    });
    await expect(page.getByTestId("tiles-popover-checkbox-qa-feedback-section")).toBeVisible({ timeout: 3000 });
  });

  test("command-deck-section appears as Keyboard Shortcuts regardless of dev mode", async ({ page }) => {
    await openTilesPopover(page);
    await expect(page.getByTestId("tiles-popover-checkbox-command-deck-section")).toBeVisible();
    // label should say Keyboard Shortcuts, not Command Deck
    const label = page.locator("label").filter({ has: page.getByTestId("tiles-popover-checkbox-command-deck-section") });
    await expect(label).toContainText("Keyboard Shortcuts");
    await expect(label).not.toContainText("Command Deck");
  });
});
