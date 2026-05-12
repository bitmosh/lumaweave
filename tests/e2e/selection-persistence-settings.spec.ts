/**
 * vP-Render-Refactor-Test-Net: Selection Persistence Across Settings Changes
 *
 * This test documents the desired post-refactor behavior:
 * Selected node should persist across physics slider changes without being deselected.
 *
 * Expected: FAIL against current main (documenting desired behavior)
 *
 * NOTE: This test may require additional testIDs in src/ code:
 * - Inspector panel testID for selection verification
 * - Selected node state exposed in window.__lwStore or similar
 */

import { test, expect } from "@playwright/test";

test("Selected node persists across physics slider changes", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");

  // Wait for Sigma instance to be available
  await page.waitForTimeout(200);

  // Get any visible node ID
  const nodeId = await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    const graph = sigma.getGraph();
    const nodes = graph.nodes();
    if (nodes.length === 0) throw new Error("No nodes in graph");
    return nodes[0];
  });

  // Set camera to center for reliable node clicking
  await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    sigma.getCamera().setState({
      x: 0.5,
      y: 0.5,
      ratio: 5
    });
  });

  // Trigger a click on that node using Sigma's API
  await page.evaluate((id) => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    // Sigma's clickNode handler expects { node, event } where event has .original
    sigma.emit('clickNode', { node: id, event: { original: { ctrlKey: false } } });
  }, nodeId);

  // Wait 200ms for selection to take effect
  await page.waitForTimeout(200);

  // Verify selection took effect
  // Try multiple methods to detect selection:
  // 1. Check inspector panel visibility
  // 2. Check window state for selectedNodeId
  const selectionBefore = await page.evaluate(() => {
    // Method 1: Check if inspector panel shows selection
    const inspectorPanel = document.querySelector('[data-testid="inspector-panel"]');
    if (inspectorPanel) {
      const isVisible = inspectorPanel.getAttribute('data-visible') === 'true';
      if (isVisible) return { method: 'inspector', selected: true };
    }

    // Method 2: Check window state for selectedNodeId
    const store = (window as any).__lwStore;
    if (store) {
      const state = store.getState();
      if (state.selectedNodeId) {
        return { method: 'store', selectedNodeId: state.selectedNodeId };
      }
    }

    // Method 3: Check Sigma's internal selection state
    const sigma = (window as any).__lwSigma;
    if (sigma) {
      const selectedNodes = sigma.getGraph().filterNodes((n: any) => n.selected);
      if (selectedNodes.length > 0) {
        return { method: 'sigma', selectedNodeId: selectedNodes[0] };
      }
    }

    return { method: 'none', selected: false };
  });

  // If no selection method worked, skip test with informative message
  if (selectionBefore.method === 'none' && !selectionBefore.selected) {
    console.log("Selection verification failed - no method to detect selection state");
    console.log("Required testIDs: inspector-panel with data-visible, or selectedNodeId in window.__lwStore");
    test.skip();
    return;
  }

  // Trigger a settings change — adjust any slider
  const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
  await expect(nodeSizeSlider).toBeVisible();
  await nodeSizeSlider.fill("1.5");
  await page.waitForTimeout(500);

  // Assert: same node is still selected
  const selectionAfter = await page.evaluate(() => {
    // Method 1: Check inspector panel
    const inspectorPanel = document.querySelector('[data-testid="inspector-panel"]');
    if (inspectorPanel) {
      const isVisible = inspectorPanel.getAttribute('data-visible') === 'true';
      if (isVisible) return { method: 'inspector', selected: true };
    }

    // Method 2: Check window state
    const store = (window as any).__lwStore;
    if (store) {
      const state = store.getState();
      if (state.selectedNodeId) {
        return { method: 'store', selectedNodeId: state.selectedNodeId };
      }
    }

    // Method 3: Check Sigma internal state
    const sigma = (window as any).__lwSigma;
    if (sigma) {
      const selectedNodes = sigma.getGraph().filterNodes((n: any) => n.selected);
      if (selectedNodes.length > 0) {
        return { method: 'sigma', selectedNodeId: selectedNodes[0] };
      }
    }

    return { method: 'none', selected: false };
  });

  // Assert based on the method that worked before
  if (selectionBefore.method === 'store' && selectionBefore.selectedNodeId) {
    expect(selectionAfter.selectedNodeId).toBe(selectionBefore.selectedNodeId);
  } else if (selectionBefore.method === 'sigma' && selectionBefore.selectedNodeId) {
    expect(selectionAfter.selectedNodeId).toBe(selectionBefore.selectedNodeId);
  } else if (selectionBefore.method === 'inspector') {
    expect(selectionAfter.selected).toBe(true);
  } else {
    // If we got here, selection detection is not working
    console.log("Cannot verify selection persistence - no reliable detection method");
    test.skip();
  }
});
