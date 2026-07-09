// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

async function openGeometryTab(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openInspectorOnTopbar(page);
  await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
  await page.locator('[data-spoke-id="geometry"]').click();
  await expect(page.locator('[data-testid="geometry-tab"]')).toBeVisible();
}

test.describe("v89.4 Geometry Spoke", () => {
  test("geometry spoke opens geometry-tab", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-preset-grid"]')).toBeVisible();
  });

  test("all 5 preset thumbnails render", async ({ page }) => {
    await openGeometryTab(page);

    const presets = ["sun", "glass-sphere", "crystal", "orb", "pip"];
    for (const presetId of presets) {
      await expect(page.locator(`[data-testid="geometry-preset-${presetId}"]`)).toBeVisible();
    }
  });

  test("clicking a preset updates aria-pressed to true", async ({ page }) => {
    await openGeometryTab(page);

    const sunBtn = page.locator('[data-testid="geometry-preset-sun"]');
    await expect(sunBtn).toBeVisible();
    await sunBtn.click();
    await expect(sunBtn).toHaveAttribute("aria-pressed", "true");
  });

  test("scope picker renders with this and all options", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-scope-picker"]')).toBeVisible();
    await expect(page.locator('[data-testid="geometry-scope-picker"] button', { hasText: "This" })).toBeVisible();
    await expect(page.locator('[data-testid="geometry-scope-picker"] button', { hasText: "All" })).toBeVisible();
  });

  test("clicking a preset at 'this' scope writes target override", async ({ page }) => {
    await openGeometryTab(page);

    // Select "this" scope (default)
    await page.locator('[data-testid="geometry-scope-picker"] button', { hasText: "This" }).click();

    // Click glass-sphere preset
    await page.locator('[data-testid="geometry-preset-glass-sphere"]').click();

    // Verify override was written to localStorage
    const overrides = await page.evaluate(() => {
      const raw = localStorage.getItem("lumaweave-theme-overrides");
      if (!raw) return null;
      return JSON.parse(raw);
    });

    expect(overrides).not.toBeNull();
    const match = overrides?.overrides?.find(
      (o: any) => o.tokenPath === "node.geometry.preset" && o.scope.kind === "target",
    );
    expect(match).toBeDefined();
    expect(match?.value).toBe("glass-sphere");
  });

  test("clicking a preset at 'all' scope writes global override", async ({ page }) => {
    await openGeometryTab(page);

    // Select "all" scope
    await page.locator('[data-testid="geometry-scope-picker"] button', { hasText: "All" }).click();

    // Click orb preset
    await page.locator('[data-testid="geometry-preset-orb"]').click();

    const overrides = await page.evaluate(() => {
      const raw = localStorage.getItem("lumaweave-theme-overrides");
      if (!raw) return null;
      return JSON.parse(raw);
    });

    expect(overrides).not.toBeNull();
    const match = overrides?.overrides?.find(
      (o: any) => o.tokenPath === "node.geometry.preset" && o.scope.kind === "global",
    );
    expect(match).toBeDefined();
    expect(match?.value).toBe("orb");
  });

  test("back button returns to ring view", async ({ page }) => {
    await openGeometryTab(page);
    await expect(page.locator('[data-testid="geometry-tab"]')).toBeVisible();

    await page.locator('[aria-label="back"]').click();
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="geometry-tab"]')).not.toBeVisible();
  });
});
