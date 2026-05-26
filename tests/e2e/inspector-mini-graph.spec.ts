import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("inspector mini-graph", () => {
  test("Alt+Shift+click opens mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a registered theme target (e.g., the topbar)
    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await expect(target).toBeVisible();

    // Alt+Shift+click it
    await openInspectorOnTopbar(page);

    // Mini-graph should appear
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
  });

  test("Esc closes mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);

    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).not.toBeVisible();
  });

  test("dim mode activates on open, restores on close", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Capture initial dim mode
    const initialDim = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      return store.getState().settings.graphView?.dimMode ?? "off";
    });

    await openInspectorOnTopbar(page);

    // Dim mode should now be outside-cluster
    const openDim = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      return store.getState().settings.graphView.dimMode;
    });
    expect(openDim).toBe("outside-cluster");

    // Close
    await page.keyboard.press("Escape");

    // Dim mode should restore
    const closedDim = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      return store.getState().settings.graphView?.dimMode ?? "off";
    });
    expect(closedDim).toBe(initialDim);
  });

  test("registered spokes render around root", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);

    const spokes = page.locator('[data-lw-theme-target="inspector.spoke"]');
    await expect(spokes.first()).toBeVisible({ timeout: 3000 });
    const count = await spokes.count();
    expect(count).toBeGreaterThan(0);
  });
});
