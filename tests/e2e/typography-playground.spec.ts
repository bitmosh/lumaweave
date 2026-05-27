import { test, expect } from "@playwright/test";
import { setSetting } from "../helpers/app-state";

async function openTypographyPlaygroundTile(page: any) {
  await setSetting(page, "ui.tileLayout", [
    {
      id: "tile_typography_test",
      sectionKey: "typography-playground-section",
      x: 100,
      y: 100,
      w: 360,
      h: 420,
      collapsed: false,
      z: 1,
    },
  ]);
  await expect(page.locator('[data-testid="typography-playground"]')).toBeVisible({ timeout: 5000 });
}

test.describe("v87.4 Typography playground", () => {
  test("playground section appears in dock", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openTypographyPlaygroundTile(page);
  });

  test("three font families render with sliders", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openTypographyPlaygroundTile(page);
    await expect(page.locator('[data-testid="playground-family-space-grotesk-wght"]')).toBeVisible();
    await expect(page.locator('[data-testid="playground-family-ibm-plex-sans-wght"]')).toBeVisible();
    await expect(page.locator('[data-testid="playground-family-ibm-plex-mono-wght"]')).toBeVisible();
  });

  test("changing weight slider updates sample text font-weight", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openTypographyPlaygroundTile(page);

    const slider = page.locator('[data-testid="playground-slider-space-grotesk-wght"]');
    // Use native input value setter to bypass React's synthetic event layer
    await slider.evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      nativeSetter?.call(el, "700");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Wait for React to flush the state update and re-render
    await page.waitForFunction(() => {
      const sample = document.querySelector(
        '[data-testid="playground-family-space-grotesk-wght"] .lw-playground-sample'
      ) as HTMLElement | null;
      return sample ? window.getComputedStyle(sample).fontWeight === "700" : false;
    }, { timeout: 3000 });

    const sample = page.locator('[data-testid="playground-family-space-grotesk-wght"] .lw-playground-sample');
    const weight = await sample.evaluate((el) => window.getComputedStyle(el).fontWeight);
    expect(weight).toBe("700");
  });

  test("fontAxisRegistry has 3 wght entries", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const count = await page.evaluate(() => {
      const reg = (window as any).__lwFontAxisRegistry;
      return reg?.list().length ?? 0;
    });
    expect(count).toBe(3);
  });
});
