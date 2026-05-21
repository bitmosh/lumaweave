import { test, expect } from "@playwright/test";

test.describe("v87.3 ThemeAccessibilityProfile", () => {
  test("profile populates for all 6 themes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const themeIds = [
        "solar-plasma", "obsidian-aurora", "midnight-loom",
        "void-circuit", "agartha-dream", "agartha-dusk",
      ];
      const probe = (window as any).__lwAccessibilityProfile;
      return themeIds.map((id) => {
        const p = probe.getAccessibilityProfile(id);
        return {
          themeId: id,
          hasWcag: p?.wcag !== undefined,
          pairCount: p?.wcag?.pairs?.length ?? 0,
          aa: p?.wcag?.aa,
          aaa: p?.wcag?.aaa,
        };
      });
    });

    expect(result.length).toBe(6);
    for (const r of result) {
      expect(r.hasWcag).toBe(true);
      expect(r.pairCount).toBe(4);
      expect(typeof r.aa).toBe("boolean");
      expect(typeof r.aaa).toBe("boolean");
    }
  });

  test("contrast pairs compute distinct values per theme", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const probe = (window as any).__lwAccessibilityProfile;
      const solar = probe.getAccessibilityProfile("solar-plasma");
      const dream = probe.getAccessibilityProfile("agartha-dream");
      return {
        solarTextRatio: solar.wcag.pairs[0]?.ratio,
        dreamTextRatio: dream.wcag.pairs[0]?.ratio,
      };
    });

    expect(result.solarTextRatio).toBeGreaterThan(0);
    expect(result.dreamTextRatio).toBeGreaterThan(0);
    // Solar Plasma (dark) and Agartha Dream (light) have inverted palettes
    expect(result.solarTextRatio).not.toBeCloseTo(result.dreamTextRatio, 1);
  });

  test("WCAG badge renders for active theme", async ({ page }) => {
    await page.goto("/");
    const badge = page.locator('[data-testid="wcag-badge"]');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(["AAA", "AA", "partial"]).toContain(text?.trim());
  });

  test("WCAG badge updates when theme switches", async ({ page }) => {
    await page.goto("/");
    const badge = page.locator('[data-testid="wcag-badge"]');

    await page.locator('[data-testid="theme-preset-selector"]').selectOption("agartha-dream");
    await page.waitForTimeout(200);

    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(["AAA", "AA", "partial"]).toContain(text?.trim());
  });
});
