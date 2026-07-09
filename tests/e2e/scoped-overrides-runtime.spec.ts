// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("scoped overrides runtime", () => {
  test("target override wins over global", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      // Set global override
      storage.setGlobalOverride("panel.background", "#111111");
      // Set target override for a specific target
      storage.setTargetOverride("topbar.root", "panel.background", "#222222");
    });

    const resolved = await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      return storage.resolveForTarget("panel.background", "topbar.root");
    });

    expect(resolved).toBe("#222222");
  });

  test("falls through to global when no target override", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      storage.setGlobalOverride("panel.background", "#111111");
    });

    const resolved = await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      return storage.resolveForTarget("panel.background", "topbar.root");
    });

    expect(resolved).toBe("#111111");
  });

  test("removing target override falls back to global", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      storage.setGlobalOverride("panel.background", "#111111");
      storage.setTargetOverride("topbar.root", "panel.background", "#222222");
      storage.removeTargetOverride("topbar.root", "panel.background");
    });

    const resolved = await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      return storage.resolveForTarget("panel.background", "topbar.root");
    });

    expect(resolved).toBe("#111111");
  });

  test("resolveForTarget returns undefined when no overrides exist", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const resolved = await page.evaluate(() => {
      const storage = (window as any).__lwThemeOverrideStorage;
      return storage.resolveForTarget("panel.background.never.set", "no.such.target");
    });

    expect(resolved).toBeUndefined();
  });
});
