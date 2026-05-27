import { Page, expect } from "@playwright/test";

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

/**
 * Inject a single tile via store, replacing any existing layout.
 * Sets the bootstrap flag to prevent TileProvider auto-populate race.
 */
async function injectTile(
  page: Page,
  sectionKey: string,
  tileId: string,
  contentTestId: string,
  opts: { x?: number; y?: number; w?: number; h?: number } = {}
): Promise<void> {
  const tileLocator = page.getByTestId(contentTestId);
  if (await tileLocator.isVisible().catch(() => false)) {
    return;
  }
  await page.evaluate(
    ({ sectionKey, tileId, opts }) => {
      const store = (window as any).__lwStore;
      if (!store) return;
      const tile = {
        id: tileId,
        sectionKey,
        x: opts.x ?? 300,
        y: opts.y ?? 60,
        w: opts.w ?? 400,
        h: opts.h ?? 560,
        collapsed: false,
        z: 10,
      };
      store.getState().setSetting("ui.tileLayout", [tile]);
      localStorage.setItem("lumaweave-tiles-bootstrapped", "1");
    },
    { sectionKey, tileId, opts }
  );
  await expect(tileLocator).toBeVisible({ timeout: 5000 });
}

export async function openGraphVisualInventory(page: Page): Promise<void> {
  await injectTile(page, "graph-visual-inventory-section", "tile_graph-visual-inventory", "graph-visual-inventory-panel", { w: 400, h: 560 });
}

export async function openSystemIndex(page: Page): Promise<void> {
  await injectTile(page, "system-index-section", "tile_system-index", "system-index-tile-content", { w: 360, h: 520 });
}

export async function openCommandDeck(page: Page): Promise<void> {
  await injectTile(page, "command-deck-section", "tile_command-deck", "command-deck-panel", { w: 400, h: 560 });
}
