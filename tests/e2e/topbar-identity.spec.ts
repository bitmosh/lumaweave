// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("v87.2 Topbar identity", () => {
  test("hex logo renders", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('[data-lw-theme-target="topbar.root"] svg[aria-label="LumaWeave hex logo"]')
    ).toBeVisible();
  });

  test("wordmark renders with correct text", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".lw-wordmark-name")).toHaveText("LumaWeave");
  });

  test("status pill shows active theme name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".lw-status-label")).toHaveText("Solar Plasma");

    await page.locator('[data-testid="theme-preset-selector"]').selectOption("obsidian-aurora");
    await expect(page.locator(".lw-status-label")).toHaveText("Obsidian Aurora");
  });

  test("status cluster shows graph node count", async ({ page }) => {
    await page.goto("/");
    const clusterText = await page.locator(".lw-status-cluster").textContent();
    expect(clusterText).toMatch(/\d+n/);
  });

  test("status cluster shows fps", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    const clusterText = await page.locator(".lw-status-cluster").textContent();
    expect(clusterText).toMatch(/fps/);
  });

  test("reduce motion stops pulsing dot animation", async ({ page }) => {
    await page.goto("/");

    const animationBefore = await page.locator(".lw-status-dot").evaluate(
      (el) => window.getComputedStyle(el).animationName
    );
    expect(animationBefore).toBe("lw-pulse");

    await page.getByTestId("topbar-toggle-reduce-motion").click();

    const animationAfter = await page.locator(".lw-status-dot").evaluate(
      (el) => window.getComputedStyle(el).animationName
    );
    expect(animationAfter).toBe("none");
  });

  test("hex logo gradient adapts when theme changes", async ({ page }) => {
    await page.goto("/");

    const stopsBefore = await page.locator("#hexFill stop").evaluateAll(
      (stops) => stops.map((s) => window.getComputedStyle(s).stopColor)
    );

    await page.locator('[data-testid="theme-preset-selector"]').selectOption("obsidian-aurora");
    await page.waitForTimeout(200);

    const stopsAfter = await page.locator("#hexFill stop").evaluateAll(
      (stops) => stops.map((s) => window.getComputedStyle(s).stopColor)
    );

    expect(stopsBefore).not.toEqual(stopsAfter);
  });
});
