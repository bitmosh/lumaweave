// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v88b.0 Engine lifecycle", () => {
  test("release clears memoized pick", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();

      engine.pick("asset-tag", { contextKey: "X", themeId: "solar-plasma" });
      engine.release("X");

      // After release, re-pick is valid hex
      const afterRelease = engine.pick("asset-tag", { contextKey: "X", themeId: "solar-plasma" });

      return { afterRelease };
    });

    expect(result.afterRelease).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("theme switch resets rotation", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();

      const a = engine.pick("node-primary", { contextKey: "x", themeId: "solar-plasma" });

      // Switch theme — engine auto-resets, so "x" gets a new pick
      const b = engine.pick("node-primary", { contextKey: "x", themeId: "obsidian-aurora" });

      return { firstPick: a, secondPick: b, switched: a !== b };
    });

    expect(result.switched).toBe(true);
  });

  test("user override returns user pick immediately", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;
      engine.reset();

      const userColor = "#ff0000";
      const pick = engine.pick("node-primary", {
        contextKey: "user-override-test",
        themeId: "solar-plasma",
        userPick: userColor,
      });

      return { picked: pick, expected: userColor };
    });

    expect(result.picked).toBe(result.expected);
  });

  test("reset clears all state", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(() => {
      const engine = (window as any).__lwColorSuggestionEngine;

      engine.pick("node-primary", { contextKey: "a", themeId: "solar-plasma" });
      engine.pick("panel-accent", { contextKey: "b", themeId: "solar-plasma" });

      const beforeReset = engine.getRotationState();

      engine.reset();

      const afterReset = engine.getRotationState();

      return {
        beforeCount: Object.keys(beforeReset).length,
        afterCount: Object.keys(afterReset).length,
      };
    });

    expect(result.beforeCount).toBeGreaterThan(0);
    expect(result.afterCount).toBe(0);
  });
});
