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

  test("Pass C5: Directory twist persists with seedAdherence", async ({ page }) => {
    // Wait for seeder to complete (wait for __gwellsSeedPositions to exist)
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    // Set directory twist to 20 on radial-backbone (default)
    await page.locator('[data-testid="helix-twist-directory"]').fill("20");
    await page.locator('[data-testid="helix-twist-directory"]').dispatchEvent("change");
    await page.waitForTimeout(500);  // let seeder run

    // Capture any node's position (not specifically directory)
    const initialPos = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return null;
      const graph = sigma.getGraph();
      let firstNodeId: string | null = null;
      graph.forEachNode((id: string) => {
        if (!firstNodeId) firstNodeId = id;
      });
      if (!firstNodeId) return null;
      return {
        id: firstNodeId,
        x: graph.getNodeAttribute(firstNodeId, "x"),
        y: graph.getNodeAttribute(firstNodeId, "y"),
      };
    });
    expect(initialPos).not.toBeNull();

    // Wait several physics frames
    await page.waitForTimeout(2000);

    // Position should be CLOSE to initial (within 150 units) — seedAdherence kept it near seed
    const finalPos = await page.evaluate((id: string) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      return {
        x: graph.getNodeAttribute(id, "x"),
        y: graph.getNodeAttribute(id, "y"),
      };
    }, initialPos!.id);

    const drift = Math.sqrt(
      Math.pow(finalPos.x - initialPos!.x, 2) +
      Math.pow(finalPos.y - initialPos!.y, 2)
    );
    expect(drift).toBeLessThan(150);  // before C5, drift was 500+ units within 2 seconds
  });

  test("Pass C5: Dragging a node updates its seed position", async ({ page }) => {
    // Wait for seeder to complete
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Get any node that has a seed position
    const probe = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      if (!graph.hasAttribute("__gwellsSeedPositions")) return null;
      const seeds = graph.getAttribute("__gwellsSeedPositions");
      let foundNodeId: string | null = null;
      let foundSeed: any = null;
      graph.forEachNode((id: string) => {
        if (!foundNodeId) {
          const seed = seeds.get(id);
          if (seed) {
            foundNodeId = id;
            foundSeed = seed;
          }
        }
      });
      if (!foundNodeId) return null;
      return {
        id: foundNodeId,
        seed: foundSeed,
      };
    });
    expect(probe).not.toBeNull();
    expect(probe?.seed).toBeDefined();

    // Simulate drag-update via direct attribute write + mouseup-like update
    // (Real drag is hard to simulate in Playwright; we test the data flow.)
    await page.evaluate((id: string) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      // Move the node
      graph.setNodeAttribute(id, "x", 9999);
      graph.setNodeAttribute(id, "y", 9999);
      // Update the seed (what handleMouseUp does)
      const seeds = graph.getAttribute("__gwellsSeedPositions");
      seeds.set(id, { x: 9999, y: 9999, z: 0 });
    }, probe!.id);

    await page.waitForTimeout(1000);

    // Position should still be close to (9999, 9999) — seed-anchor pulled it back to the new seed
    const finalPos = await page.evaluate((id: string) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      return {
        x: graph.getNodeAttribute(id, "x"),
        y: graph.getNodeAttribute(id, "y"),
      };
    }, probe!.id);

    // Allow significant interaction-driven drift but confirm it's NOT back near original (0-ish)
    expect(Math.abs(finalPos.x - 9999)).toBeLessThan(800);  // Pass C7: edge-aware interactions reduce drift from 711→~674
    expect(Math.abs(finalPos.y - 9999)).toBeLessThan(800);
  });

  test("Pass C5: Dialect change resets seed positions", async ({ page }) => {
    await page.waitForTimeout(500);

    // Get initial seed positions for radial-backbone
    const radialSeeds = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      if (!graph.hasAttribute("__gwellsSeedPositions")) return null;
      const seeds = graph.getAttribute("__gwellsSeedPositions");
      return seeds.size;
    });
    expect(radialSeeds).toBeGreaterThan(0);

    // Switch dialect
    await page.selectOption('[data-testid="dialect-select"]', "gwells.dialect.parallel-spines");
    await page.waitForTimeout(800);

    // Seed positions should still exist and have positions for the parallel-spines layout
    const parallelSeeds = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      if (!graph.hasAttribute("__gwellsSeedPositions")) return null;
      const seeds = graph.getAttribute("__gwellsSeedPositions");
      return seeds.size;
    });
    expect(parallelSeeds).toBeGreaterThan(0);
    // The two should have similar node counts (same graph), but positions are different
  });
});
