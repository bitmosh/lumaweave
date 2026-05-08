/**
 * v86b hardening: screenshot-artifact.spec.ts
 * 
 * Tests that screenshot artifact is captured for visual regression:
 * - Capture screenshot of running app and save to docs/screenshots/v86b-runtime.png
 */

import { test, expect } from "@playwright/test";

test.describe("v86b screenshot-artifact", () => {
  test("should capture screenshot", async ({ page }) => {
    // Navigate to graph
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Wait for animations to settle
    await page.waitForTimeout(500);

    // Capture screenshot to file
    await page.screenshot({ path: "docs/screenshots/v86b-runtime.png", fullPage: true });
  });
});

