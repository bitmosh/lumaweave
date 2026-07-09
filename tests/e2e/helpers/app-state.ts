// SPDX-License-Identifier: Apache-2.0
import { Page } from "@playwright/test";

/**
 * Playwright helpers for app state inspection
 * Provides utilities for reading Sigma and application state from the browser
 */

/**
 * Get the current camera state from the Sigma instance
 * @param page - Playwright page
 * @returns Camera state with x, y, and ratio properties
 */
export async function getSigmaCameraState(page: Page): Promise<{ x: number; y: number; ratio: number }> {
  return await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    const camera = sigma.getCamera();
    const state = camera.getState();
    return {
      x: state.x,
      y: state.y,
      ratio: state.ratio
    };
  });
}

/**
 * Get the current Sigma instance sentinel value
 * Used to detect Sigma recreation across state changes
 * @param page - Playwright page
 * @returns Sentinel value or undefined if not set
 */
export async function getSigmaSentinel(page: Page): Promise<string | undefined> {
  return await page.evaluate(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    return (sigma as any).__sentinel;
  });
}

/**
 * Set a sentinel value on the Sigma instance
 * @param page - Playwright page
 * @param sentinel - Sentinel value to set
 */
export async function setSigmaSentinel(page: Page, sentinel: string): Promise<void> {
  await page.evaluate((value) => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not available");
    (sigma as any).__sentinel = value;
  }, sentinel);
}

/**
 * Get the currently selected node ID from the application state
 * Tries multiple methods: store state, Sigma internal state, inspector panel
 * @param page - Playwright page
 * @returns Selection information including method used and selectedNodeId if available
 */
export async function getSelectedNode(page: Page): Promise<{ method: string; selectedNodeId?: string; selected?: boolean }> {
  return await page.evaluate(() => {
    // Method 1: Check window state for selectedNodeId
    const store = (window as any).__lwStore;
    if (store) {
      const state = store.getState();
      if (state.selectedNodeId) {
        return { method: 'store', selectedNodeId: state.selectedNodeId };
      }
    }

    // Method 2: Check Sigma's internal selection state
    const sigma = (window as any).__lwSigma;
    if (sigma) {
      const selectedNodes = sigma.getGraph().filterNodes((n: any) => n.selected);
      if (selectedNodes.length > 0) {
        return { method: 'sigma', selectedNodeId: selectedNodes[0] };
      }
    }

    // Method 3: Check if inspector panel shows selection
    const inspectorPanel = document.querySelector('[data-testid="inspector-panel"]');
    if (inspectorPanel) {
      const isVisible = inspectorPanel.getAttribute('data-visible') === 'true';
      if (isVisible) return { method: 'inspector', selected: true };
    }

    return { method: 'none', selected: false };
  });
}
