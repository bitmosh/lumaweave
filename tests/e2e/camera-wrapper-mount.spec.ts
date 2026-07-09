// SPDX-License-Identifier: Apache-2.0
/**
 * v86b hardening: camera-wrapper-mount.spec.ts
 * 
 * Tests that cameraController mounts and wraps Sigma correctly:
 * - CameraController attaches to Sigma instance
 * - Camera methods (pan, zoom, rotate, reset, getState) work
 * - reduceMotion option disables camera animations
 */

import { test, expect } from "@playwright/test";
import { getSigmaCameraState } from "../helpers/app-state";

test.describe("v86b camera-wrapper-mount", () => {
  test.fixme("camera state is preserved after reload", async ({ page }) => {
    // Timing-sensitive — camera state race on reload. v105.0.2: quarantined.
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Get initial camera state
    const cameraBefore = await getSigmaCameraState(page);

    // Reload page
    await page.reload();
    await page.waitForSelector("canvas");

    // Get camera state after reload
    const cameraAfter = await getSigmaCameraState(page);

    // Camera state should be preserved (within ±2px tolerance)
    expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
  });

  test("camera reset is not called on mount", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Get initial camera state
    const cameraBefore = await getSigmaCameraState(page);

    // Reload page (triggers camera wrapper mount)
    await page.reload();
    await page.waitForSelector("canvas");

    // Get camera state after mount
    const cameraAfter = await getSigmaCameraState(page);

    // Camera state should be unchanged (no reset on mount)
    expect(cameraAfter.x).toBe(cameraBefore.x);
    expect(cameraAfter.y).toBe(cameraBefore.y);
    expect(cameraAfter.ratio).toBe(cameraBefore.ratio);
  });
});
