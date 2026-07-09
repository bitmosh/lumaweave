// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v88a Theme Lineage", () => {
  test("empty by default", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const count = await page.evaluate(() => {
      const probe = (window as any).__lwThemeLineage;
      return probe.getLineage("custom-theme-1").length;
    });
    expect(count).toBe(0);
  });

  test("appendLineage adds entry", async ({ page }) => {
    await page.goto("/");
    const lineage = await page.evaluate(() => {
      const probe = (window as any).__lwThemeLineage;
      probe.appendLineage("custom-theme-1", {
        parentId: "solar-plasma",
        parentHash: "abc123",
        timestamp: Date.now(),
        changeKind: "fork",
      });
      return probe.getLineage("custom-theme-1");
    });
    expect(lineage.length).toBe(1);
    expect(lineage[0].changeKind).toBe("fork");
  });

  test("multiple appends accumulate", async ({ page }) => {
    await page.goto("/");
    const length = await page.evaluate(() => {
      const probe = (window as any).__lwThemeLineage;
      probe.appendLineage("custom-theme-2", { parentId: "x", timestamp: 1, changeKind: "fork" });
      probe.appendLineage("custom-theme-2", { parentId: "y", timestamp: 2, changeKind: "remix" });
      return probe.getLineage("custom-theme-2").length;
    });
    expect(length).toBe(2);
  });
});
