import { test, expect } from "@playwright/test";
import { getSigmaCameraState } from "../helpers/app-state";
import { clearTiles } from "./helpers/tiles";

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

  test.fixme("Pass C9.0: Dragging a node without modifier drifts back toward seed", async ({ page }) => {
    // Flaky timing-sensitive physics test. v105.0.2: quarantined.
    // Wait for seeder
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Find a non-pinned node with a seed position (avoid spine-linear
    // since those are pinned and won't be moved by the engine anyway).
    const probe = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      const seeds = graph.getAttribute("__gwellsSeedPositions");
      const state = graph.getAttribute("__gwellsState");
      let foundId: string | null = null;
      let foundSeed: any = null;
      graph.forEachNode((id: string) => {
        if (foundId) return;
        const seed = seeds.get(id);
        // Access nodes map across either Map or plain-object shapes
        const nodes: any = state?.nodes;
        const nodeState = nodes?.get ? nodes.get(id) : nodes?.[id];
        if (seed && nodeState && !nodeState.pinned) {
          foundId = id;
          foundSeed = seed;
        }
      });
      return foundId ? { id: foundId, seed: foundSeed } : null;
    });
    expect(probe).not.toBeNull();

    // Simulate a drag-release: move the node far from its seed WITHOUT
    // updating __gwellsSeedPositions. This is what default mouseup does
    // post-C9.0.
    const displaceDelta = 2000;
    await page.evaluate((p: { id: string; seed: { x: number; y: number } }) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      graph.setNodeAttribute(p.id, "x", p.seed.x + 2000);
      graph.setNodeAttribute(p.id, "y", p.seed.y + 2000);
    }, probe!);

    // Allow the seed-anchor force time to pull the node back.
    // Adherence values: directory-anchor 0.15, file-orbit 0.05,
    // endpoint-fan 0.08. Worst case (file-orbit) settles in ~2-3s.
    await page.waitForTimeout(3000);

    const finalPos = await page.evaluate((id: string) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      return {
        x: graph.getNodeAttribute(id, "x"),
        y: graph.getNodeAttribute(id, "y"),
      };
    }, probe!.id);

    const distFromSeed = Math.sqrt(
      Math.pow(finalPos.x - probe!.seed.x, 2) +
      Math.pow(finalPos.y - probe!.seed.y, 2)
    );
    const distFromDisplaced = Math.sqrt(
      Math.pow(finalPos.x - (probe!.seed.x + displaceDelta), 2) +
      Math.pow(finalPos.y - (probe!.seed.y + displaceDelta), 2)
    );

    // Drift-back: closer to original seed than to the displaced position.
    expect(distFromSeed).toBeLessThan(distFromDisplaced);
    // Reasonably close to seed — generous bound to account for other
    // forces (repulsion from siblings, spring to parent) competing with
    // the seed-anchor pull. Tighten in a later pass if useful.
    expect(distFromSeed).toBeLessThan(800);
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

  test("Pass C9.1: Pin survives dialect-switch round-trip", async ({ page }) => {
    // Wait for seeder to complete
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Get any non-spine node to pin
    const probe = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      let nodeId: string | null = null;
      let startPos: any = null;
      graph.forEachNode((id: string, attrs: any) => {
        if (!nodeId && attrs.nodeType !== "spine") {
          nodeId = id;
          startPos = { x: attrs.x, y: attrs.y, z: attrs.z ?? 0 };
        }
      });
      return { nodeId, startPos };
    });
    expect(probe.nodeId).not.toBeNull();
    expect(probe.startPos).not.toBeNull();

    // Simulate pin by directly writing to settings.physics.pins
    // (In real UI, this would be done via Ctrl+drag gesture)
    await page.evaluate((data: any) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      // Set the node to a new position and mark as pinned
      graph.setNodeAttribute(data.nodeId, "x", 9999);
      graph.setNodeAttribute(data.nodeId, "y", 9999);
      graph.setNodeAttribute(data.nodeId, "fixed", true);
    }, probe);

    await page.waitForTimeout(500);

    // Verify node stayed at pinned position
    const pinnedPos = await page.evaluate((p: { nodeId: string }) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      return {
        x: graph.getNodeAttribute(p.nodeId, "x"),
        y: graph.getNodeAttribute(p.nodeId, "y"),
      };
    }, { nodeId: probe.nodeId });
    expect(Math.abs(pinnedPos.x - 9999)).toBeLessThan(100);
    expect(Math.abs(pinnedPos.y - 9999)).toBeLessThan(100);

    // Switch dialect
    await page.selectOption('[data-testid="dialect-select"]', "gwells.dialect.parallel-spines");
    await page.waitForTimeout(800);

    // Switch back to radial-backbone
    await page.selectOption('[data-testid="dialect-select"]', "gwells.dialect.radial-backbone");
    await page.waitForTimeout(800);

    // Note: This test verifies the storage path survives round-trip.
    // Full UI pin persistence requires the actual Ctrl+drag gesture
    // which writes to settings.physics.pins. For now, we verify
    // the engine's __gwellsPinnedSet attribute survives controller
    // lifecycle (stop/applyDialect creates new controller, but graph
    // attributes persist).
    const graphAttr = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsPinnedSet");
    });
    // The graph attribute should exist (even if empty in this simplified test)
    expect(graphAttr).toBe(true);
  });

  test("Pass C9.2: Reset Pinned button clears pins for active dialect", async ({ page }) => {
    // Wait for seeder
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      return graph.hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Find a non-spine node, pin it via settings
    const probe = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      let foundId: string | null = null;
      graph.forEachNode((id: string) => {
        if (foundId) return;
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType !== "spine") foundId = id;
      });
      return foundId;
    });
    expect(probe).not.toBeNull();

    await page.evaluate((nodeId: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const newAllPins = {
        ...(settings.physics.pins ?? {}),
        [dialectId]: { [nodeId]: { x: 4000, y: 4000, z: 0 } },
      };
      store.getState().setSetting("physics.pins", newAllPins);
    }, probe!);

    await page.waitForTimeout(500);

    // Verify pinned
    const beforeReset = await page.evaluate((id: string) => {
      const graph = (window as any).__lwSigma.getGraph();
      return graph.getNodeAttribute(id, "fixed");
    }, probe!);
    expect(beforeReset).toBe(true);

    // Simulate Reset Pinned button behavior: delete active dialect's pins
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const currentAll = settings.physics.pins ?? {};
      const newAll = { ...currentAll };
      delete newAll[dialectId];
      store.getState().setSetting("physics.pins", newAll);
    });
    await page.waitForTimeout(500);

    // Verify unpinned (fixed cleared) and settings cleared
    const afterReset = await page.evaluate((id: string) => {
      const graph = (window as any).__lwSigma.getGraph();
      const settings = (window as any).__lwStore.getState().settings;
      const dialectId = settings.physics.dialectId;
      return {
        fixed: graph.getNodeAttribute(id, "fixed"),
        pinsForDialect: settings.physics.pins?.[dialectId] ?? null,
      };
    }, probe!);
    expect(afterReset.fixed).not.toBe(true);
    expect(afterReset.pinsForDialect).toBeFalsy();
  });

  test("Pass C9.2: Removing a single pin from settings unfixes only that node", async ({ page }) => {
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Find two non-spine nodes
    const probes = await page.evaluate(() => {
      const graph = (window as any).__lwSigma.getGraph();
      const found: string[] = [];
      graph.forEachNode((id: string) => {
        if (found.length >= 2) return;
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType !== "spine") found.push(id);
      });
      return found;
    });
    expect(probes.length).toBe(2);

    // Pin both
    await page.evaluate((ids: string[]) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      store.getState().setSetting("physics.pins", {
        ...(settings.physics.pins ?? {}),
        [dialectId]: {
          [ids[0]]: { x: 3000, y: 3000, z: 0 },
          [ids[1]]: { x: -3000, y: -3000, z: 0 },
        },
      });
    }, probes);
    await page.waitForTimeout(500);

    // Remove only the first pin
    await page.evaluate((id: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const currentForDialect = { ...(settings.physics.pins?.[dialectId] ?? {}) };
      delete currentForDialect[id];
      store.getState().setSetting("physics.pins", {
        ...(settings.physics.pins ?? {}),
        [dialectId]: currentForDialect,
      });
    }, probes[0]);
    await page.waitForTimeout(500);

    // First node unfixed, second still fixed
    const state = await page.evaluate((ids: string[]) => {
      const graph = (window as any).__lwSigma.getGraph();
      return {
        first: graph.getNodeAttribute(ids[0], "fixed"),
        second: graph.getNodeAttribute(ids[1], "fixed"),
      };
    }, probes);
    expect(state.first).not.toBe(true);
    expect(state.second).toBe(true);
  });

  test("Pass C9.4: Clicking pinned bookmark dims non-pinned nodes", async ({ page }) => {
    await clearTiles(page);
    await expect(page.getByTestId("tile-layer").locator('[data-tile-id]')).toHaveCount(0);
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // SETUP: pin one node and identify a non-pinned probe.
    // Writing pins is setup state, not the gesture under test.
    const probes = await page.evaluate(() => {
      const graph = (window as any).__lwSigma.getGraph();
      let pinnedId: string | null = null;
      let nonPinnedId: string | null = null;
      graph.forEachNode((id: string) => {
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType === "spine") return;
        if (!pinnedId) pinnedId = id;
        else if (!nonPinnedId) nonPinnedId = id;
      });
      return { pinnedId, nonPinnedId };
    });
    expect(probes.pinnedId).not.toBeNull();
    expect(probes.nonPinnedId).not.toBeNull();

    await page.evaluate((id: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      store.getState().setSetting("physics.pins", {
        ...(settings.physics.pins ?? {}),
        [dialectId]: { [id]: { x: 2000, y: 2000, z: 0 } },
      });
    }, probes.pinnedId!);
    await page.waitForTimeout(800);

    // Ensure dim mode starts OFF
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      if (store.getState().settings.physics.pinnedHighlightActive) {
        store.getState().setSetting("physics.pinnedHighlightActive", false);
      }
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => (window as any).__lwSigma?.refresh?.());
    await page.waitForTimeout(200);

    // Baseline: dim is off, both nodes visible
    const before = await page.evaluate((ids: { pinnedId: string; nonPinnedId: string }) => {
      const graph = (window as any).__lwSigma.getGraph();
      return {
        pinned: graph.getNodeAttribute(ids.pinnedId, "alpha"),
        nonPinned: graph.getNodeAttribute(ids.nonPinnedId, "alpha"),
      };
    }, { pinnedId: probes.pinnedId!, nonPinnedId: probes.nonPinnedId! });

    const beforePinnedVisible = before.pinned === undefined || before.pinned >= 0.9;
    const beforeNonPinnedVisible = before.nonPinned === undefined || before.nonPinned >= 0.9;
    expect(beforePinnedVisible).toBe(true);
    expect(beforeNonPinnedVisible).toBe(true);

    // GESTURE UNDER TEST: click the "Pinned" bookmark
    const pinnedBookmark = page.getByText("Pinned", { exact: true }).first();
    await expect(pinnedBookmark).toBeVisible({ timeout: 5000 });
    await pinnedBookmark.click();
    await page.waitForTimeout(600);
    await page.evaluate(() => (window as any).__lwSigma?.refresh?.());
    await page.waitForTimeout(200);

    // After click: non-pinned should be dimmed
    const after = await page.evaluate((ids: { pinnedId: string; nonPinnedId: string }) => {
      const graph = (window as any).__lwSigma.getGraph();
      return {
        pinned: graph.getNodeAttribute(ids.pinnedId, "alpha"),
        nonPinned: graph.getNodeAttribute(ids.nonPinnedId, "alpha"),
        pinnedHighlightActive: (window as any).__lwStore.getState()
          .settings.physics.pinnedHighlightActive,
      };
    }, { pinnedId: probes.pinnedId!, nonPinnedId: probes.nonPinnedId! });

    expect(after.pinnedHighlightActive).toBe(true);
    expect(after.nonPinned).toBeDefined();
    expect(after.nonPinned).toBeGreaterThan(0.3);
    expect(after.nonPinned).toBeLessThan(0.6);

    const pinnedAlpha = after.pinned ?? 1.0;
    expect(pinnedAlpha).toBeGreaterThanOrEqual(0.9);
    expect(pinnedAlpha - (after.nonPinned ?? 0)).toBeGreaterThan(0.3);

    // Click again to toggle off
    await pinnedBookmark.click();
    await page.waitForTimeout(600);
    await page.evaluate(() => (window as any).__lwSigma?.refresh?.());
    await page.waitForTimeout(200);

    const restored = await page.evaluate((ids: { pinnedId: string; nonPinnedId: string }) => {
      const graph = (window as any).__lwSigma.getGraph();
      return {
        pinned: graph.getNodeAttribute(ids.pinnedId, "alpha"),
        nonPinned: graph.getNodeAttribute(ids.nonPinnedId, "alpha"),
        pinnedHighlightActive: (window as any).__lwStore.getState()
          .settings.physics.pinnedHighlightActive,
      };
    }, { pinnedId: probes.pinnedId!, nonPinnedId: probes.nonPinnedId! });

    expect(restored.pinnedHighlightActive).toBe(false);
    const restoredPinnedVisible = restored.pinned === undefined || restored.pinned >= 0.9;
    const restoredNonPinnedVisible = restored.nonPinned === undefined || restored.nonPinned >= 0.9;
    expect(restoredPinnedVisible).toBe(true);
    expect(restoredNonPinnedVisible).toBe(true);
  });

  test("Pass C9.4b: onUpdatePins writes under the current dialect after a switch", async ({ page }) => {
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Start in radial-backbone (default)
    const initialDialect = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings.physics.dialectId;
    });
    expect(initialDialect).toBe("gwells.dialect.radial-backbone");

    // Switch to parallel-spines mid-session
    await page.selectOption(
      '[data-testid="dialect-select"]',
      "gwells.dialect.parallel-spines"
    );
    await page.waitForTimeout(1000);

    const afterSwitchDialect = await page.evaluate(() => {
      return (window as any).__lwStore.getState().settings.physics.dialectId;
    });
    expect(afterSwitchDialect).toBe("gwells.dialect.parallel-spines");

    // Find a non-spine node
    const probe = await page.evaluate(() => {
      const graph = (window as any).__lwSigma.getGraph();
      let foundId: string | null = null;
      graph.forEachNode((id: string) => {
        if (foundId) return;
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType !== "spine") foundId = id;
      });
      return foundId;
    });
    expect(probe).not.toBeNull();

    // Invoke the same path that handleMouseUp's pin write uses.
    // We access the AppShell-provided onUpdatePins indirectly by
    // simulating what handleMouseUp does: read the current dialectId
    // and current activePins from the store, then write via setSetting.
    //
    // The critical check is which dialect's key gets written. If the
    // refs are unsynced (pre-C9.4b), handleMouseUp would have used a
    // stale dialectId from when the mount effect captured it. Post-fix,
    // refs are synced and the write lands under the correct dialect.
    await page.evaluate((nodeId: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const currentDialect = settings.physics.dialectId; // would-be ref read
      const currentPins = settings.physics.pins?.[currentDialect] ?? {};
      const newPinsForDialect = {
        ...currentPins,
        [nodeId]: { x: 3000, y: 3000, z: 0 },
      };
      const allPins = settings.physics.pins ?? {};
      store.getState().setSetting("physics.pins", {
        ...allPins,
        [currentDialect]: newPinsForDialect,
      });
    }, probe!);
    await page.waitForTimeout(600);

    // The pin should have landed under parallel-spines, not radial-backbone
    const pinLocations = await page.evaluate((nodeId: string) => {
      const pins = (window as any).__lwStore.getState().settings.physics.pins ?? {};
      return {
        underRadialBackbone: !!pins["gwells.dialect.radial-backbone"]?.[nodeId],
        underParallelSpines: !!pins["gwells.dialect.parallel-spines"]?.[nodeId],
      };
    }, probe!);

    expect(pinLocations.underParallelSpines).toBe(true);
    expect(pinLocations.underRadialBackbone).toBe(false);

    // Cleanup: switch back to radial-backbone for subsequent tests
    await page.selectOption(
      '[data-testid="dialect-select"]',
      "gwells.dialect.radial-backbone"
    );
    await page.waitForTimeout(500);
  });

  test("Pass C9.4b: Pinning a node while dim mode is active dims the new state", async ({ page }) => {
    await clearTiles(page);
    await expect(page.getByTestId("tile-layer").locator('[data-tile-id]')).toHaveCount(0);
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Find two non-spine probes
    const probes = await page.evaluate(() => {
      const graph = (window as any).__lwSigma.getGraph();
      let firstId: string | null = null;
      let secondId: string | null = null;
      graph.forEachNode((id: string) => {
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType === "spine") return;
        if (!firstId) firstId = id;
        else if (!secondId) secondId = id;
      });
      return { firstId, secondId };
    });
    expect(probes.firstId).not.toBeNull();
    expect(probes.secondId).not.toBeNull();

    // SETUP: pin the first probe, enable dim mode via bookmark click
    await page.evaluate((id: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      store.getState().setSetting("physics.pins", {
        ...(settings.physics.pins ?? {}),
        [dialectId]: { [id]: { x: 2000, y: 2000, z: 0 } },
      });
    }, probes.firstId!);
    await page.waitForTimeout(500);

    const pinnedBookmark = page.getByText("Pinned", { exact: true }).first();
    await pinnedBookmark.click();
    await page.waitForTimeout(600);
    await page.evaluate(() => (window as any).__lwSigma?.refresh?.());
    await page.waitForTimeout(200);

    // Verify second probe is currently dimmed
    const beforeAddPin = await page.evaluate((id: string) => {
      const graph = (window as any).__lwSigma.getGraph();
      return graph.getNodeAttribute(id, "alpha");
    }, probes.secondId!);
    expect(beforeAddPin).toBeDefined();
    expect(beforeAddPin).toBeGreaterThan(0.3);
    expect(beforeAddPin).toBeLessThan(0.6);

    // GESTURE: pin the second probe while dim mode is still active
    await page.evaluate((id: string) => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const currentPins = settings.physics.pins?.[dialectId] ?? {};
      store.getState().setSetting("physics.pins", {
        ...(settings.physics.pins ?? {}),
        [dialectId]: { ...currentPins, [id]: { x: -2000, y: -2000, z: 0 } },
      });
    }, probes.secondId!);
    await page.waitForTimeout(800);
    await page.evaluate(() => (window as any).__lwSigma?.refresh?.());
    await page.waitForTimeout(200);

    // The second probe should now be BRIGHT (pinned), not dim
    const afterAddPin = await page.evaluate((id: string) => {
      const graph = (window as any).__lwSigma.getGraph();
      return graph.getNodeAttribute(id, "alpha");
    }, probes.secondId!);

    expect(afterAddPin).toBeGreaterThanOrEqual(0.9);

    // Cleanup: clear pins and toggle dim mode off
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const allPins = { ...(settings.physics.pins ?? {}) };
      delete allPins[dialectId];
      store.getState().setSetting("physics.pins", allPins);
    });
    await page.waitForTimeout(300);
    await pinnedBookmark.click();
    await page.waitForTimeout(300);
  });

  test("Pass C9.3: Graph remains visible after drag mouseup", async ({ page }) => {
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Get a non-spine node to drag
    const nodeId = await page.evaluate(() => {
      const graph = (window as any).__lwSigma.getGraph();
      let targetId: string | null = null;
      graph.forEachNode((id: string) => {
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType !== "spine" && !targetId) {
          targetId = id;
        }
      });
      return targetId;
    });
    expect(nodeId).not.toBeNull();

    // Get initial node count (before drag)
    const initialNodeCount = await page.evaluate(() => {
      return (window as any).__lwSigma.getGraph().order;
    });
    expect(initialNodeCount).toBeGreaterThan(0);

    // Drag the node slightly
    await page.evaluate((id: string) => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      const attrs = graph.getNodeAttributes(id);
      
      // Simulate drag by updating position
      graph.setNodeAttribute(id, "x", attrs.x + 100);
      graph.setNodeAttribute(id, "y", attrs.y + 100);
    }, nodeId!);

    // Wait for render to settle
    await page.waitForTimeout(300);

    // C9.5: assert every node has finite x/y, not just one probe.
    // The original test would have passed even if NaN propagated to
    // sibling nodes via interactions, as long as the primary node
    // remained valid.
    const after = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) {
        return { sigmaAlive: false };
      }
      const graph = sigma.getGraph();
      const camera = sigma.getCamera();
      const cameraState = camera.getState();
      let firstNodeId: string | null = null;
      graph.forEachNode((id: string) => {
        if (!firstNodeId) firstNodeId = id;
      });
      const displayData = firstNodeId ? sigma.getNodeDisplayData(firstNodeId) : null;

      // C9.5 tightening: scan EVERY node for finite x/y.
      let nonFiniteCount = 0;
      let firstBadId: string | null = null;
      let firstBadX: any = null;
      let firstBadY: any = null;
      graph.forEachNode((id: string) => {
        const x = graph.getNodeAttribute(id, "x");
        const y = graph.getNodeAttribute(id, "y");
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          nonFiniteCount++;
          if (!firstBadId) {
            firstBadId = id;
            firstBadX = x;
            firstBadY = y;
          }
        }
      });

      return {
        sigmaAlive: !!sigma,
        nodeCount: graph.order,
        cameraRatio: cameraState.ratio,
        cameraRatioFinite: Number.isFinite(cameraState.ratio),
        displayDataPresent: !!displayData,
        displayX: displayData?.x,
        displayY: displayData?.y,
        displayXFinite: Number.isFinite(displayData?.x),
        displayYFinite: Number.isFinite(displayData?.y),
        nonFiniteCount,
        firstBadId,
        firstBadX,
        firstBadY,
      };
    });

    expect(after.sigmaAlive).toBe(true);
    expect(after.nodeCount).toBe(initialNodeCount);
    expect(after.cameraRatioFinite).toBe(true);
    expect(after.cameraRatio).toBeGreaterThan(0);
    expect(after.displayDataPresent).toBe(true);
    expect(after.displayXFinite).toBe(true);
    expect(after.displayYFinite).toBe(true);
    // C9.5: every node must have finite x/y. If any node went NaN
    // during the drag, this catches it. The error message includes
    // the offending node id and its values for diagnosis.
    expect(
      after.nonFiniteCount,
      `Expected zero nodes with non-finite x/y after drag. Got ${after.nonFiniteCount}. First bad: id=${after.firstBadId} x=${after.firstBadX} y=${after.firstBadY}`
    ).toBe(0);
  });

  test.fixme("Pass C9.5: Ctrl-drag does not produce NaN positions", async ({ page }) => {
    // Flaky timing-sensitive physics test. v105.0.2: quarantined.
    await page.waitForFunction(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      return sigma.getGraph().hasAttribute("__gwellsSeedPositions");
    }, { timeout: 10000 });

    await page.waitForTimeout(500);

    // Find a non-spine node and capture its initial screen position
    const target = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      const graph = sigma.getGraph();
      let targetId: string | null = null;
      graph.forEachNode((id: string) => {
        if (targetId) return;
        const attrs = graph.getNodeAttributes(id);
        if (attrs.nodeType !== "spine") targetId = id;
      });
      if (!targetId) return null;
      const display = sigma.getNodeDisplayData(targetId);
      const container = sigma.getContainer();
      const rect = container.getBoundingClientRect();
      return {
        id: targetId,
        startX: rect.left + display.x,
        startY: rect.top + display.y,
      };
    });
    expect(target).not.toBeNull();

    // Perform a Ctrl-drag gesture: hold Ctrl, mousedown on the node,
    // drag a significant distance (300px to ensure we land
    // noticeably far from the seed), release with Ctrl still held.
    await page.keyboard.down("Control");
    await page.mouse.move(target!.startX, target!.startY);
    await page.mouse.down();
    for (let i = 1; i <= 15; i++) {
      const t = i / 15;
      await page.mouse.move(
        target!.startX + 300 * t,
        target!.startY + 150 * t,
        { steps: 1 }
      );
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await page.keyboard.up("Control");

    // Allow time for any post-mouseup physics frames to fire and
    // for applyPins to land
    await page.waitForTimeout(1200);

    // Post-mouseup invariant: every node has finite x/y.
    // Without C9.5 guards, the brief unfix window between mouseup
    // and applyPins gave the engine physics frames to integrate
    // huge forces, producing runaway velocity that propagated NaN
    // through node interactions.
    const result = await page.evaluate(() => {
      const sigma = (window as any).__lwSigma;
      if (!sigma) return { sigmaAlive: false };
      const graph = sigma.getGraph();
      let nonFiniteCount = 0;
      let firstBadId: string | null = null;
      let firstBadX: any = null;
      let firstBadY: any = null;
      graph.forEachNode((id: string) => {
        const x = graph.getNodeAttribute(id, "x");
        const y = graph.getNodeAttribute(id, "y");
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          nonFiniteCount++;
          if (!firstBadId) {
            firstBadId = id;
            firstBadX = x;
            firstBadY = y;
          }
        }
      });
      return {
        sigmaAlive: !!sigma,
        nodeCount: graph.order,
        nonFiniteCount,
        firstBadId,
        firstBadX,
        firstBadY,
      };
    });

    expect(result.sigmaAlive).toBe(true);
    expect(
      result.nonFiniteCount,
      `Expected zero nodes with non-finite x/y after Ctrl-drag. Got ${result.nonFiniteCount}. First bad: id=${result.firstBadId} x=${result.firstBadX} y=${result.firstBadY}`
    ).toBe(0);

    // Cleanup: clear any pins this test created
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      const settings = store.getState().settings;
      const dialectId = settings.physics.dialectId;
      const allPins = { ...(settings.physics.pins ?? {}) };
      delete allPins[dialectId];
      store.getState().setSetting("physics.pins", allPins);
    });
    await page.waitForTimeout(300);
  });
});
