/**
 * vP-Render-Refactor-Test-Net: Sigma Instance Identity Persistence
 *
 * This test documents the desired post-refactor behavior:
 * Sigma instance should persist across state changes (settings, theme) without recreation.
 *
 * Uses a sentinel property to detect Sigma recreation.
 *
 * Expected: FAIL against current main (documenting desired behavior)
 */

import { test, expect } from "@playwright/test";

test.describe("Sigma instance identity persists across state changes", () => {
  test("PART A: physics slider change does not recreate Sigma", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Wait for Sigma instance to be available
    await page.waitForTimeout(200);

    // Inject a sentinel
    const originalSentinel = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      const sentinel = "alpha-" + Date.now();
      (sigma as any).__sentinel = sentinel;
      return sentinel;
    });

    // Trigger physics slider change
    const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");
    await expect(repelForceSlider).toBeVisible();
    await repelForceSlider.fill("150");
    await page.waitForTimeout(500);

    // Capture sentinel after change
    const sentinelAfter = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      return (sigma as any).__sentinel;
    });

    // Assert: sentinel UNCHANGED (Sigma not recreated)
    expect(sentinelAfter).toBe(originalSentinel);
  });

  test("PART B: theme change does not recreate Sigma", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Wait for Sigma instance to be available
    await page.waitForTimeout(200);

    // Inject a sentinel
    const originalSentinel = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      const sentinel = "beta-" + Date.now();
      (sigma as any).__sentinel = sentinel;
      return sentinel;
    });

    // Trigger theme change
    const themeSelector = page.getByTestId("theme-preset-selector");
    await expect(themeSelector).toBeVisible();
    await themeSelector.selectOption("midnight-loom");
    await page.waitForTimeout(500);

    // Capture sentinel after change
    const sentinelAfter = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      return (sigma as any).__sentinel;
    });

    // Assert: sentinel UNCHANGED (Sigma not recreated)
    expect(sentinelAfter).toBe(originalSentinel);
  });

  test.skip("PART C: source change DOES recreate Sigma (positive control)", async ({ page }) => {
    // TODO: This test requires a working source switcher UI.
    // The current Graph Sources panel may not have a functional source switcher.
    // When source switcher is implemented, this test should:
    // 1. Inject sentinel
    // 2. Switch graph source
    // 3. Assert sentinel CHANGED (Sigma legitimately recreated on source change)
    // This serves as a positive control to verify the test methodology works.
    
    await page.goto("/");
    await page.waitForSelector("canvas");
    await page.waitForTimeout(200);

    // Check if source switcher exists
    const sourceSelector = page.getByTestId("graph-source-selector");
    const hasSourceSwitcher = await sourceSelector.isVisible().catch(() => false);

    if (!hasSourceSwitcher) {
      console.log("Source switcher UI not available - skipping positive control test");
      return;
    }

    // Inject sentinel
    const originalSentinel = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      const sentinel = "gamma-" + Date.now();
      (sigma as any).__sentinel = sentinel;
      return sentinel;
    });

    // Switch source
    await sourceSelector.selectOption("alternate-source");
    await page.waitForTimeout(500);

    // Capture sentinel after change
    const sentinelAfter = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) throw new Error("Sigma instance not available");
      return (sigma as any).__sentinel;
    });

    // Assert: sentinel CHANGED (Sigma recreated on source change)
    expect(sentinelAfter).not.toBe(originalSentinel);
  });
});
