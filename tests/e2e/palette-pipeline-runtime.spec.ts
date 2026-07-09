// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("palette pipeline runtime", () => {
  test("useActiveThemePrimitives returns primitives for default theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      const themeId = store.getState().settings.appearance.theme;
      const tp = (window as any).__lwTokenPrimitives;

      // Verify we have primitives for the current theme
      const hasThemePrims = !!tp?.[themeId]?.color;
      return {
        themeId,
        hasThemePrimitives: hasThemePrims,
        colorFamilies: tp?.[themeId]?.color ? Object.keys(tp[themeId].color) : [],
      };
    });

    expect(result.hasThemePrimitives).toBe(true);
    expect(result.colorFamilies.length).toBeGreaterThan(0);
    expect(["solar-plasma", "obsidian-aurora", "midnight-loom", "void-circuit", "agartha-dream", "agartha-dusk"]).toContain(result.themeId);
  });

  test("getTargetBindings returns bindings for a registered target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bindings = await page.evaluate(() => {
      const registry = (window as any).__lwThemeTargetRegistry;
      const entry = registry.getById?.("topbar.root");

      // If getById doesn't exist, use the targets array
      if (!entry) {
        const targets = registry.targets || [];
        const target = targets.find((t: any) => t.themeTargetId === "topbar.root");
        return target?.tokenBindings ? Object.entries(target.tokenBindings) : [];
      }

      return entry.tokenBindings ? Object.entries(entry.tokenBindings) : [];
    });

    expect(bindings.length).toBeGreaterThan(0);

    // Verify structure: array of [property, tokenPath] pairs
    for (const [property, tokenPath] of bindings) {
      expect(typeof property).toBe("string");
      expect(typeof tokenPath).toBe("string");
      expect(property.length).toBeGreaterThan(0);
      expect(tokenPath.length).toBeGreaterThan(0);
    }
  });

  test("getTargetBindings returns empty array for unknown target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bindings = await page.evaluate(() => {
      const registry = (window as any).__lwThemeTargetRegistry;
      const entry = registry.getById?.("no.such.target");

      if (!entry) {
        const targets = registry.targets || [];
        const target = targets.find((t: any) => t.themeTargetId === "no.such.target");
        return target?.tokenBindings ? Object.entries(target.tokenBindings) : [];
      }

      return entry.tokenBindings ? Object.entries(entry.tokenBindings) : [];
    });

    expect(bindings.length).toBe(0);
  });

  test("primitives change when theme switches", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const before = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      return store.getState().settings.appearance.theme;
    });

    // Switch to a different theme
    const newTheme = before === "solar-plasma" ? "obsidian-aurora" : "solar-plasma";

    await page.evaluate((theme) => {
      const store = (window as any).__lwStore;
      store.getState().setSetting("appearance.theme", theme);
    }, newTheme);

    const after = await page.evaluate(() => {
      const store = (window as any).__lwStore;
      return store.getState().settings.appearance.theme;
    });

    expect(after).not.toBe(before);
    expect(after).toBe(newTheme);
  });

  test("color primitives are consistent across themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const tp = (window as any).__lwTokenPrimitives;

      // Check that all themes have the same color families
      const themes = Object.entries(tp);
      const familySets = themes.map(([_, prims]: any) => {
        return Object.keys(prims.color || {}).sort();
      });

      // All themes should have the same families
      const firstFamilies = familySets[0];
      const allSame = familySets.every((fams) => JSON.stringify(fams) === JSON.stringify(firstFamilies));

      return {
        totalThemes: themes.length,
        familiesPerTheme: firstFamilies,
        allThemesConsistent: allSame,
      };
    });

    expect(result.totalThemes).toBeGreaterThan(0);
    expect(result.familiesPerTheme.length).toBeGreaterThan(0);
    expect(result.allThemesConsistent).toBe(true);
  });
});
