/**
 * v86b/vC3.1.1 hardening: quality-preset-coupling.spec.ts
 *
 * Tests that qualityPreset correctly couples to appearance settings.
 * Note: After C3.1.1, qualityPreset is preserved during FA2→gwells migration
 * (the old v82 incorrectly deleted it as a side effect).
 *
 * - potato: reduceMotion=true, glitterDensity="off", edgePlasmaMode="static", backdropMotion="off"
 * - balanced: reduceMotion=false, glitterDensity="medium", edgePlasmaMode="animated-overlay", backdropMotion="half"
 * - fancy: reduceMotion=false, glitterDensity="high", edgePlasmaMode="animated-overlay", backdropMotion="full"
 */

import { test, expect } from "@playwright/test";
import { setSetting, getSettings } from "../helpers/app-state";

test.describe("v86b quality-preset-coupling", () => {
  test("setSetting qualityPreset=balanced sets all appearance values", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "physics.qualityPreset", "balanced");
    await page.waitForTimeout(100);
    const settings = await getSettings(page);
    // After C3.1.1, qualityPreset is preserved during migration
    expect((settings as any).physics.qualityPreset).toBe("balanced");
    expect(settings.appearance.reduceMotion).toBe(false);
    expect(settings.appearance.glitterDensity).toBe("medium");
    expect(settings.appearance.edgePlasmaMode).toBe("animated-overlay");
    expect(settings.appearance.backdropMotion).toBe("half");
  });

  test("setSetting motionScale to non-default flips qualityPreset to custom", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "physics.qualityPreset", "balanced");
    await page.waitForTimeout(100);
    await setSetting(page, "appearance.glitterDensity", "high");
    await page.waitForTimeout(100);
    const settings = await getSettings(page);
    // After C3.1.1, qualityPreset is preserved during migration
    expect((settings as any).physics.qualityPreset).toBe("custom");
  });

  test("setSetting qualityPreset=potato sets all appearance values", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "physics.qualityPreset", "potato");
    await page.waitForTimeout(100);
    const settings = await getSettings(page);
    // After C3.1.1, qualityPreset is preserved during migration
    expect((settings as any).physics.qualityPreset).toBe("potato");
    expect(settings.appearance.reduceMotion).toBe(true);
    expect(settings.appearance.glitterDensity).toBe("off");
    expect(settings.appearance.edgePlasmaMode).toBe("static");
    expect(settings.appearance.backdropMotion).toBe("off");
  });
});
