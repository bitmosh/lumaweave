// SPDX-License-Identifier: Apache-2.0
/**
 * State helper functions for Playwright tests
 * Provides utilities for interacting with Sigma and UI state
 */

/**
 * Get a Sigma setting value via the exposed __lwSigma instance
 */
export async function getSigmaSetting(page: any, key: string): Promise<any> {
  return await page.evaluate((k: string) => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not exposed");
    if (typeof sigma.getSetting !== 'function') throw new Error("Sigma.getSetting not available");
    return sigma.getSetting(k);
  }, key);
}

/**
 * Set an appearance setting via the UI
 */
export async function setAppearanceSetting(page: any, settingName: string, value: any): Promise<void> {
  // Click the settings button to open settings panel
  await page.click('[data-testid="settings-button"]');
  
  // Find the setting input/slider
  const settingSelector = `[data-testid="setting-${settingName}"]`;
  await page.waitForSelector(settingSelector);
  
  // Set the value based on the input type
  const inputType = await page.getAttribute(settingSelector, 'type');
  if (inputType === 'range') {
    await page.fill(settingSelector, String(value));
  } else if (inputType === 'checkbox') {
    if (value) {
      await page.check(settingSelector);
    } else {
      await page.uncheck(settingSelector);
    }
  } else {
    await page.fill(settingSelector, String(value));
  }
  
  // Close settings panel
  await page.click('[data-testid="close-settings"]');
}

/**
 * Open a collapsible section by clicking its header
 */
export async function openCollapsibleSection(page: any, sectionId: string): Promise<void> {
  const sectionSelector = `[data-testid="collapsible-${sectionId}"]`;
  await page.click(sectionSelector);
  await page.waitForSelector(`${sectionSelector}[data-open="true"]`);
}

/**
 * Tear off a tile from the main layout
 */
export async function tearOffTile(page: any, tileId: string): Promise<void> {
  const tileSelector = `[data-testid="tile-${tileId}"]`;
  const tearOffButton = `${tileSelector} [data-testid="tear-off-button"]`;
  
  await page.hover(tileSelector);
  await page.click(tearOffButton);
  await page.waitForSelector(`${tileSelector}[data-torn-off="true"]`);
}

/**
 * Select a node in the Sigma graph
 */
export async function selectNode(page: any, nodeId: string): Promise<void> {
  await page.evaluate((id: string) => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) throw new Error("Sigma instance not exposed");
    
    // Find the node in the graph
    const graph = sigma.getGraph();
    const node = graph.getNode(id);
    if (!node) throw new Error(`Node ${id} not found`);
    
    // Trigger the clickNode event
    sigma.emit('clickNode', { node: id });
  }, nodeId);
}
