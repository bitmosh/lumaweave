// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v88a Palette Generation", () => {
  test("generates from valid hex anchor", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const result = await page.evaluate(() => {
      const probe = (window as any).__lwPaletteGeneration;
      const palette = probe.generatePaletteFromHue("#8b5cf6");
      return {
        hasColor: palette.color !== undefined,
        hasSpace: palette.space !== undefined,
        hasRadius: palette.radius !== undefined,
        goldBase: palette.color.gold?.[500],
      };
    });
    expect(result.hasColor).toBe(true);
    expect(result.hasSpace).toBe(true);
    expect(result.hasRadius).toBe(true);
    expect(result.goldBase).toBe("#8b5cf6");
  });

  test("rejects invalid hex", async ({ page }) => {
    await page.goto("/");
    const errored = await page.evaluate(() => {
      const probe = (window as any).__lwPaletteGeneration;
      try {
        probe.generatePaletteFromHue("not-a-hex");
        return false;
      } catch {
        return true;
      }
    });
    expect(errored).toBe(true);
  });

  test("different anchors produce different palettes", async ({ page }) => {
    await page.goto("/");
    const result = await page.evaluate(() => {
      const probe = (window as any).__lwPaletteGeneration;
      const a = probe.generatePaletteFromHue("#8b5cf6");
      const b = probe.generatePaletteFromHue("#f472b6");
      return {
        differentGold: a.color.gold[500] !== b.color.gold[500],
        differentCorona: a.color.corona[500] !== b.color.corona[500],
      };
    });
    expect(result.differentGold).toBe(true);
    expect(result.differentCorona).toBe(true);
  });
});
