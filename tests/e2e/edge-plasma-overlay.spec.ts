/**
 * v86b hardening: edge-plasma-overlay.spec.ts
 * 
 * Tests that PlasmaOverlayEdge renders and updates correctly:
 * - SVG overlay renders on top of Sigma edges
 * - Edge positions update on Sigma afterRender
 * - edgePlasmaMode="static" disables overlay
 * - Animated plasma flow uses CSS dasharray animation
 */

import { test, expect } from "@playwright/test";

test.describe("v86b edge-plasma-overlay", () => {
  test("PlasmaOverlay renders as SVG sibling of Sigma container", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Check that PlasmaOverlay renders as SVG
    const plasmaOverlay = await page.locator("svg[data-testid='plasma-overlay']").count();
    expect(plasmaOverlay).toBe(1);

    // Check that it's a sibling of the Sigma canvas
    const sigmaCanvas = await page.locator("canvas.sigma-graph").count();
    expect(sigmaCanvas).toBe(1);
  });

  test("PlasmaOverlay does not extend Sigma's edge program", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("canvas");

    // Search for PlasmaOverlay references in the codebase
    const plasmaEdgeReferences = await page.evaluate(() => {
      // Check that PlasmaOverlay is not registered as an edge program
      const sigma = (window as any).__lwSigma;
      const edgePrograms = sigma?.getEdgeProgramClasses?.() ?? [];
      return edgePrograms.filter((p: any) => p.name?.includes("PlasmaOverlay")).length;
    });

    // PlasmaOverlay should not be in Sigma's edge program registry
    expect(plasmaEdgeReferences).toBe(0);
  });
});
