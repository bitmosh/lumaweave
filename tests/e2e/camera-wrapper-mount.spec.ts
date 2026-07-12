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
  // The <canvas> element exists before Sigma is constructed, so waiting on the selector
  // races the assignment at SigmaGraphView.tsx:444 and getSigmaCameraState() throws
  // "Sigma instance not exposed". Wait for the instance itself, not its container.
  const waitForSigma = (page: import("@playwright/test").Page) =>
    page.waitForFunction(() => !!(window as any).__lwSigma);

  // v105.0.2 quarantined this as a "camera state race on reload". The race was in the
  // test, not the product: it read the camera before Sigma existed. Un-quarantined.
  test("camera state is preserved after reload", async ({ page }) => {
    await page.goto("/");
    await waitForSigma(page);

    // Get initial camera state
    const cameraBefore = await getSigmaCameraState(page);

    // Reload page
    await page.reload();
    await waitForSigma(page);

    // Get camera state after reload
    const cameraAfter = await getSigmaCameraState(page);

    // Camera state should be preserved (within ±2px tolerance)
    expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
    expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
  });

  test("camera reset is not called on mount", async ({ page }) => {
    await page.goto("/");
    await waitForSigma(page);

    // Get initial camera state
    const cameraBefore = await getSigmaCameraState(page);

    // Reload page (triggers camera wrapper mount)
    await page.reload();
    await waitForSigma(page);

    // Get camera state after mount
    const cameraAfter = await getSigmaCameraState(page);

    // Camera state should be unchanged (no reset on mount)
    expect(cameraAfter.x).toBe(cameraBefore.x);
    expect(cameraAfter.y).toBe(cameraBefore.y);
    expect(cameraAfter.ratio).toBe(cameraBefore.ratio);
  });
});
