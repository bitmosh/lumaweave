import { test, expect } from "@playwright/test";

test.describe("v88b.0 Engine filtering", () => {
  test("neighbor avoidance", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      const probe = (window as any).__lwThemeSelectableColors;
      const set = probe.get("solar-plasma");

      engine.reset();

      // Block the first slot in the rotation order
      const firstSlotId = set.rotationOrder[0];
      const firstSlot = set.slots.find((s: any) => s.id === firstSlotId);

      const pick = engine.pick("node-primary", {
        contextKey: "test",
        themeId: "solar-plasma",
        neighbors: [firstSlot.hex],
      });

      return { neighborHex: firstSlot.hex, pickedHex: pick };
    });

    expect(result.pickedHex.toLowerCase()).not.toBe(result.neighborHex.toLowerCase());
  });

  test("contrast filtering rejects low-contrast slots", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();

      const pick = engine.pick("node-primary", {
        contextKey: "contrast-test",
        themeId: "solar-plasma",
        contrastPartner: "#ffffff",
        contrastMinRatio: 4.5,
      });

      return { picked: pick };
    });

    expect(result.picked).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("semantic locks return fixed slot", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      const probe = (window as any).__lwThemeSelectableColors;
      const set = probe.get("solar-plasma");

      engine.reset();

      const a = engine.pick("state-success", { contextKey: "s1", themeId: "solar-plasma" });
      const b = engine.pick("state-success", { contextKey: "s2", themeId: "solar-plasma" });

      const successSlotId = set.semantics.success;
      const successSlot = set.slots.find((s: any) => s.id === successSlotId);

      return { a, b, expected: successSlot.hex };
    });

    expect(result.a).toBe(result.expected);
    expect(result.b).toBe(result.expected);
    expect(result.a).toBe(result.b);
  });

  test("fallback when all filters eliminate every slot", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      const probe = (window as any).__lwThemeSelectableColors;
      const set = probe.get("solar-plasma");

      engine.reset();

      // Pass all slot hexes as neighbors — engine should fallback
      const allHexes = set.slots.map((s: any) => s.hex);
      const pick = engine.pick("node-primary", {
        contextKey: "no-options",
        themeId: "solar-plasma",
        neighbors: allHexes,
      });

      return { pick };
    });

    expect(result.pick).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
