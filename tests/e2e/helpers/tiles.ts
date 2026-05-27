import { Page } from "@playwright/test";

/**
 * Clear all auto-populated tiles and prevent re-population.
 *
 * v98.3 introduced TileProvider auto-populate which creates default-visible
 * tiles on first load. These tiles float over the canvas and can intercept
 * pointer events intended for LeftTabPanel or other overlays. Tests that
 * interact with UI elements that may be overlapped by tiles should call
 * this helper after page.goto() and before any interactions.
 */
export async function clearTiles(page: Page): Promise<void> {
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return;
    store.getState().setSetting("ui.tileLayout", []);
    localStorage.setItem("lumaweave-tiles-bootstrapped", "1");
  });
}
