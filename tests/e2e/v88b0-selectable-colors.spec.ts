import { test, expect } from "@playwright/test";

test.describe("v88b.0 Selectable colors per theme", () => {
  test("all 6 themes have selectable sets", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      const themeIds = ["solar-plasma", "obsidian-aurora", "midnight-loom", "void-circuit", "agartha-dream", "agartha-dusk"];
      const probe = (window as any).__lwThemeSelectableColors;
      return themeIds.map(id => ({
        themeId: id,
        hasSet: probe.get(id) !== undefined,
        slotCount: probe.get(id)?.slots?.length ?? 0,
      }));
    });

    expect(result.length).toBe(6);
    for (const r of result) {
      expect(r.hasSet).toBe(true);
      expect(r.slotCount).toBeGreaterThanOrEqual(8);
      expect(r.slotCount).toBeLessThanOrEqual(10);
    }
  });

  test("each theme passes validation", async ({ page }) => {
    await page.goto("/");
    const themeIds = ["solar-plasma", "obsidian-aurora", "midnight-loom", "void-circuit", "agartha-dream", "agartha-dusk"];

    for (const id of themeIds) {
      const result = await page.evaluate((themeId) => {
        const probe = (window as any).__lwThemeSelectableColors;
        const set = probe.get(themeId);
        return probe.validate(set);
      }, id);
      if (!result.valid) {
        console.error(`Validation errors for ${id}:`, result.errors);
      }
      expect(result.valid).toBe(true);
    }
  });

  test("each theme has all 4 semantic locks", async ({ page }) => {
    await page.goto("/");
    const themeIds = ["solar-plasma", "obsidian-aurora", "midnight-loom", "void-circuit", "agartha-dream", "agartha-dusk"];

    for (const id of themeIds) {
      const result = await page.evaluate((themeId) => {
        const probe = (window as any).__lwThemeSelectableColors;
        const set = probe.get(themeId);
        return {
          hasSuccess: typeof set.semantics?.success === "string",
          hasWarning: typeof set.semantics?.warning === "string",
          hasDanger: typeof set.semantics?.danger === "string",
          hasInfo: typeof set.semantics?.info === "string",
        };
      }, id);
      expect(result.hasSuccess).toBe(true);
      expect(result.hasWarning).toBe(true);
      expect(result.hasDanger).toBe(true);
      expect(result.hasInfo).toBe(true);
    }
  });
});
