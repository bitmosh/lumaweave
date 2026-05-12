/**
 * vP-Render-Refactor-Test-Net: Camera Persistence Across Settings Changes
 *
 * This test documents the desired post-refactor behavior:
 * Camera state should persist across physics slider changes without reset.
 *
 * Expected: FAIL against current main (documenting desired behavior)
 */

import { test, expect } from "@playwright/test";
import { getSigmaCameraState } from "../helpers/app-state";

test("Camera state persists across physics slider changes", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Wait for Sigma instance to be available
  await page.waitForTimeout(200);

  // Set camera to known state
  await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    sigma.getCamera().setState({
      x: 0.5,
      y: 0.5,
      ratio: 5
    });
  });

  // Capture before state
  const cameraBefore = await getSigmaCameraState(page);

  // Trigger a settings change — adjust Repel Force slider
  const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");
  await expect(repelForceSlider).toBeVisible();
  await repelForceSlider.fill("150");
  await page.waitForTimeout(500);

  // Capture after state
  const cameraAfter = await getSigmaCameraState(page);

  // Assert: camera state unchanged (within tolerance)
  expect(Math.abs(cameraAfter.x - cameraBefore.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.y - cameraBefore.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(cameraAfter.ratio - cameraBefore.ratio)).toBeLessThanOrEqual(0.01);
});
