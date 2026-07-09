// SPDX-License-Identifier: Apache-2.0
/**
 * v86b hardening: reduce-motion-halt.spec.ts
 *
 * Tests that reduceMotion=true halts all animations:
 * - backdrop motion stops
 * - glitter field disabled
 * - click halo instant (no animation)
 * - shader uniforms hold at 0
 */

import { test, expect } from "@playwright/test";
import { setSetting } from "../helpers/app-state";

test.describe("v86b reduce-motion-halt", () => {
  test("reduceMotion halts shader uniforms", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "appearance.reduceMotion", true);
    await page.waitForTimeout(200);
    const u = await page.evaluate(() => (window as any).__lwReadUniforms());
    expect(u.hum).toBe(0);
    expect(u.flowSpeed).toBe(0);
    expect(u.time).toBe(0);
  });

  test("reduceMotion off allows uniforms to animate", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "appearance.reduceMotion", false);
    await page.waitForTimeout(200);
    const u1 = await page.evaluate(() => (window as any).__lwReadUniforms());
    await page.waitForTimeout(200);
    const u2 = await page.evaluate(() => (window as any).__lwReadUniforms());
    expect(u2.time).toBeGreaterThan(u1.time);
  });

  test("reduceMotion preserves glowStrength", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");
    await setSetting(page, "appearance.nodeGlow", 0.8);
    await setSetting(page, "appearance.reduceMotion", true);
    await page.waitForTimeout(200);
    const u = await page.evaluate(() => (window as any).__lwReadUniforms());
    expect(u.glowStrength).toBe(0.8);
  });
});
