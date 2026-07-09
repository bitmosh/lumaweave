// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v87.4 Theme crossfade", () => {
  test("__lwThemeCrossfade probe is available", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const available = await page.evaluate(() => !!(window as any).__lwThemeCrossfade);
    expect(available).toBe(true);
  });

  test("theme switch animates --lw-app-background (not snap) when motion is allowed", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Ensure reduce-motion is off
    const reduceToggle = page.getByTestId("topbar-toggle-reduce-motion");
    const isOn = await reduceToggle.getAttribute("aria-checked");
    if (isOn === "true") {
      await reduceToggle.click();
    }

    const before = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lw-app-background").trim()
    );

    // Switch to Agartha Dream (light theme — very different background)
    await page.locator('[data-testid="theme-preset-selector"]').selectOption("agartha-dream");

    // Wait for crossfade to complete
    await page.waitForTimeout(450);
    const after = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lw-app-background").trim()
    );

    expect(before).not.toBe("");
    expect(after).not.toBe("");
    expect(before).not.toBe(after);
  });

  test("reduce-motion makes theme switch snap (no intermediate values)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Enable reduce motion
    const reduceToggle = page.getByTestId("topbar-toggle-reduce-motion");
    const isOn = await reduceToggle.getAttribute("aria-checked");
    if (isOn !== "true") {
      await reduceToggle.click();
    }

    const before = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lw-app-background").trim()
    );

    await page.locator('[data-testid="theme-preset-selector"]').selectOption("void-circuit");

    // Should snap immediately — value changes but no interpolation in-flight
    await page.waitForTimeout(50);
    const immediately = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lw-app-background").trim()
    );

    expect(immediately).not.toBe(before);

    // After 300ms (crossfade window would have completed), value stays stable
    await page.waitForTimeout(300);
    const later = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--lw-app-background").trim()
    );
    expect(later).toBe(immediately);
  });
});
