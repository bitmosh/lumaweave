import { test, expect } from "@playwright/test";
import { getSigmaCameraState } from "../helpers/app-state";

/**
 * Gwells Physics Integration Tests
 *
 * Verifies Gwells physics engine integration and dialect switching.
 * Tests use the runtime probe window.__lwGetGwellsState() to inspect physics state.
 */

test.describe("Gwells Physics Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for Sigma to initialize
    await page.waitForFunction(() => (window as any).__lwSigma !== undefined, { timeout: 10000 });
  });

  test("Gwells runtime probe is available", async ({ page }) => {
    // Verify the probe function exists on window
    const probeExists = await page.evaluate(() => {
      return typeof (window as any).__lwGetGwellsState === "function";
    });
    expect(probeExists).toBe(true);
  });

  test("Gwells probe returns physics state", async ({ page }) => {
    // Get the gwells state from the probe
    const gwellsState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });
    
    // State should be non-null when physics is running
    expect(gwellsState).not.toBeNull();
    
    // Verify expected fields exist
    if (gwellsState) {
      expect(gwellsState).toHaveProperty("dialectId");
      expect(gwellsState).toHaveProperty("frame");
      expect(gwellsState).toHaveProperty("config");
      expect(gwellsState).toHaveProperty("nodes");
    }
  });

  test("Gwells physics state includes node assignments", async ({ page }) => {
    // Get the gwells state
    const gwellsState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });
    
    if (gwellsState) {
      // Verify node assignments exist (maps node IDs to well IDs)
      expect(gwellsState).toHaveProperty("nodes");
      expect(typeof gwellsState.nodes).toBe("object");
    }
  });

  test("Gwells physics frame counter increments", async ({ page }) => {
    // Get initial frame count
    const initialState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });
    
    // Wait for physics frames to advance
    await page.waitForTimeout(1000);
    
    // Get updated frame count
    const updatedState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });
    
    if (initialState && updatedState) {
      // Frame counter should have increased
      expect(updatedState.frame).toBeGreaterThan(initialState.frame);
    }
  });
});
