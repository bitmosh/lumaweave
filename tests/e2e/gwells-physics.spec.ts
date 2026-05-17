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

  test("Gwells dialect switching works", async ({ page }) => {
    // Get initial dialect (should be radial-backbone by default)
    const initialState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });

    if (initialState) {
      expect(initialState.dialectId).toBe("gwells.dialect.radial-backbone");
    }

    // Switch to parallel-spines via the dropdown UI
    await page.selectOption(
      '[data-testid="dialect-select"]',
      "gwells.dialect.parallel-spines"
    );

    // Wait for physics to restart with new dialect
    await page.waitForTimeout(500);

    // Verify dialect changed
    const updatedState = await page.evaluate(() => {
      return (window as any).__lwGetGwellsState?.();
    });

    if (updatedState) {
      expect(updatedState.dialectId).toBe("gwells.dialect.parallel-spines");
    }
  });

  test("Pass C4: HelixTwistSliders render and persist", async ({ page }) => {
    // Verify sliders are rendered in ControlDock
    const slidersContainer = page.locator('[data-testid="helix-twist-sliders"]');
    await expect(slidersContainer).toBeVisible();

    // Verify all three sliders exist
    const spineSlider = page.locator('[data-testid="helix-twist-spine"]');
    const directorySlider = page.locator('[data-testid="helix-twist-directory"]');
    const fileSlider = page.locator('[data-testid="helix-twist-file"]');

    await expect(spineSlider).toBeVisible();
    await expect(directorySlider).toBeVisible();
    await expect(fileSlider).toBeVisible();

    // Get initial slider values (should default to 0)
    const initialSpineValue = await spineSlider.inputValue();
    const initialDirectoryValue = await directorySlider.inputValue();
    const initialFileValue = await fileSlider.inputValue();

    expect(parseFloat(initialSpineValue)).toBe(0);
    expect(parseFloat(initialDirectoryValue)).toBe(0);
    expect(parseFloat(initialFileValue)).toBe(0);

    // Drag spine slider to new value
    await spineSlider.fill("10");
    await page.waitForTimeout(100);

    // Verify value changed in DOM
    const updatedSpineValue = await spineSlider.inputValue();
    expect(parseFloat(updatedSpineValue)).toBe(10);

    // Verify value persisted to settings
    const settings = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings;
    });
    const activeDialectId = settings.physics.dialectId;
    const dialectOverrides = settings.physics.seedParamOverrides[activeDialectId];
    expect(dialectOverrides).toBeDefined();
    expect(dialectOverrides.helixTwist.spine).toBe(10);
  });

  test("Pass C4: Per-dialect persistence of slider values", async ({ page }) => {
    // Set a value for radial-backbone dialect
    const spineSlider = page.locator('[data-testid="helix-twist-spine"]');
    await spineSlider.fill("5");
    await page.waitForTimeout(100);

    // Verify value persisted for radial-backbone
    let settings = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings;
    });
    const radialOverrides = settings.physics.seedParamOverrides["gwells.dialect.radial-backbone"];
    expect(radialOverrides.helixTwist.spine).toBe(5);

    // Switch to parallel-spines dialect
    await page.selectOption(
      '[data-testid="dialect-select"]',
      "gwells.dialect.parallel-spines"
    );
    await page.waitForTimeout(500);

    // Verify slider reset to 0 for new dialect
    const updatedSpineValue = await spineSlider.inputValue();
    expect(parseFloat(updatedSpineValue)).toBe(0);

    // Set a different value for parallel-spines
    await spineSlider.fill("15");
    await page.waitForTimeout(100);

    // Verify value persisted for parallel-spines
    settings = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings;
    });
    const parallelOverrides = settings.physics.seedParamOverrides["gwells.dialect.parallel-spines"];
    expect(parallelOverrides.helixTwist.spine).toBe(15);

    // Switch back to radial-backbone
    await page.selectOption(
      '[data-testid="dialect-select"]',
      "gwells.dialect.radial-backbone"
    );
    await page.waitForTimeout(500);

    // Verify slider shows previous radial-backbone value (per-dialect persistence)
    const restoredSpineValue = await spineSlider.inputValue();
    expect(parseFloat(restoredSpineValue)).toBe(5);

    // Verify parallel-spines value was preserved independently
    settings = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings;
    });
    expect(settings.physics.seedParamOverrides["gwells.dialect.parallel-spines"].helixTwist.spine).toBe(15);
  });
});
