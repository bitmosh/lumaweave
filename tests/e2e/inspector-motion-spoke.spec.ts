import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("Inspector Motion spoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="motion"]').click();
  });

  test("Motion tab renders toggle + safety reference", async ({ page }) => {
    await expect(page.getByTestId("inspector-motion-tab")).toBeVisible();
    await expect(page.getByTestId("motion-reduce-toggle")).toBeVisible();
    await expect(page.getByText("Effect Safety Reference")).toBeVisible();
  });

  test("Reduce Motion toggle reflects settings state", async ({ page }) => {
    const toggle = page.getByTestId("motion-reduce-toggle");
    const initialState = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.appearance.reduceMotion
    );
    if (initialState) {
      await expect(toggle).toBeChecked();
    } else {
      await expect(toggle).not.toBeChecked();
    }
  });

  test("Toggling Reduce Motion updates settings state", async ({ page }) => {
    const toggle = page.getByTestId("motion-reduce-toggle");
    const initialState = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.appearance.reduceMotion
    );

    await toggle.click();

    await page.waitForFunction(
      (before) => (window as any).__lwStore.getState().settings.appearance.reduceMotion !== before,
      initialState,
      { timeout: 2000 }
    );

    const newState = await page.evaluate(
      () => (window as any).__lwStore.getState().settings.appearance.reduceMotion
    );
    expect(newState).toBe(!initialState);
  });

  test("Safety reference shows classification groups", async ({ page }) => {
    const visibleGroups = await page.locator('[data-testid^="motion-safety-group-"]').count();
    expect(visibleGroups).toBeGreaterThan(0);
  });

  test("Placeholder message is no longer visible (real content renders)", async ({ page }) => {
    await expect(
      page.getByText("Animation and motion controls are in development.")
    ).not.toBeVisible();
  });
});
