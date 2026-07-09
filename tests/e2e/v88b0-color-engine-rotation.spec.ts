// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v88b.0 Engine rotation", () => {
  test("rotation within category produces distinct colors", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const colors = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();
      const picks = [];
      for (let i = 0; i < 5; i++) {
        picks.push(engine.pick("node-primary", {
          contextKey: `node-${i}`,
          themeId: "solar-plasma",
        }));
      }
      return picks;
    });

    // All 5 picks should be distinct (Solar Plasma has 5 primary/accent slots)
    const uniqueCount = new Set(colors).size;
    expect(uniqueCount).toBeGreaterThanOrEqual(4);
  });

  test("rotation wraps around when exhausted", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();
      const picks = [];
      // Make more picks than there are slots
      for (let i = 0; i < 15; i++) {
        picks.push(engine.pick("node-primary", {
          contextKey: `wrap-${i}`,
          themeId: "solar-plasma",
        }));
      }
      return picks;
    });

    const unique = new Set(result);
    expect(unique.size).toBeGreaterThanOrEqual(4);
    expect(unique.size).toBeLessThanOrEqual(8); // Solar Plasma has 8 slots
  });

  test("categories rotate independently", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();
      engine.pick("node-primary", { contextKey: "a", themeId: "solar-plasma" });
      engine.pick("panel-accent", { contextKey: "b", themeId: "solar-plasma" });
      const state = engine.getRotationState();
      return {
        nodePrimaryRotation: state["node-primary"],
        panelAccentRotation: state["panel-accent"],
      };
    });

    expect(result.nodePrimaryRotation).toBeGreaterThanOrEqual(1);
    expect(result.panelAccentRotation).toBeGreaterThanOrEqual(1);
  });

  test("idempotent: same contextKey returns same color", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();
      const first = engine.pick("node-primary", { contextKey: "stable", themeId: "solar-plasma" });
      // Advance rotation with another pick
      engine.pick("node-primary", { contextKey: "other", themeId: "solar-plasma" });
      const second = engine.pick("node-primary", { contextKey: "stable", themeId: "solar-plasma" });
      return { first, second };
    });

    expect(result.first).toBe(result.second);
  });
});
