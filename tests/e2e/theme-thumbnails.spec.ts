// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v87.3 Theme thumbnails", () => {
  test("generator produces SVG strings for all themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const themeIds = [
        "solar-plasma", "obsidian-aurora", "midnight-loom",
        "void-circuit", "agartha-dream", "agartha-dusk",
      ];
      const probe = (window as any).__lwThemeThumbnail;
      return themeIds.map((id) => {
        const svg = probe.generateThumbnail(id);
        return { themeId: id, isSvg: svg.startsWith("<svg"), length: svg.length };
      });
    });

    for (const r of result) {
      expect(r.isSvg).toBe(true);
      expect(r.length).toBeGreaterThan(200);
    }
  });

  test("different themes produce different SVG content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const probe = (window as any).__lwThemeThumbnail;
      return {
        solar:  probe.generateThumbnail("solar-plasma"),
        dream:  probe.generateThumbnail("agartha-dream"),
        aurora: probe.generateThumbnail("obsidian-aurora"),
      };
    });

    expect(result.solar).not.toEqual(result.dream);
    expect(result.solar).not.toEqual(result.aurora);
    expect(result.dream).not.toEqual(result.aurora);
  });

  test("cache returns same string on repeat calls", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const probe = (window as any).__lwThemeThumbnail;
      const first  = probe.generateThumbnail("solar-plasma");
      const second = probe.generateThumbnail("solar-plasma");
      return { equal: first === second };
    });

    expect(result.equal).toBe(true);
  });
});
