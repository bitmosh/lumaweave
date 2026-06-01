/**
 * v98.3 Tile System - Integration Tests
 *
 * Updated for the auto-populate contract (v98.3):
 * tiles-visible-by-default-via-registry replaces tear-off-from-source-slot.
 *
 * Deleted in v98.3 (tear-off model removed):
 *   - tile-tear-off handle visible
 *   - tile-tear-off handle clickable
 *   - data-tiled-out attribute exists
 *   - Physics section renders content when tiled out (drag-based)
 *   - Tiled-out indicator appears in source slot
 */

import { expect, test } from "@playwright/test";
import { tileSectionRegistry } from "../../src/control-plane/panels/tileSectionRegistry";

test("v86c-integration: TileLayer renders", async ({ page }) => {
  await page.goto("/");

  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();
});

test("v98.3: default-visible tiles appear on first load", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();

  // The 5 default-visible tiles should be present (FloatingTile renders tile-body-${sectionKey})
  await expect(page.getByTestId("tile-body-physics-section")).toBeVisible();
  await expect(page.getByTestId("tile-body-appearance-section")).toBeVisible();
  await expect(page.getByTestId("tile-body-labels-section")).toBeVisible();
  await expect(page.getByTestId("tile-body-graph-sources-section")).toBeVisible();
  await expect(page.getByTestId("tile-body-graph-inspector-section")).toBeVisible();
});

test("v98.3: hidden tiles can be opened via Tiles popover", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Clear tiles and bootstrap flag so the status bar is unobstructed
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) store.getState().setSetting("ui.tileLayout", []);
    localStorage.removeItem("lumaweave-tiles-bootstrapped");
  });
  await page.waitForTimeout(150);

  // Open Tiles popover in status bar
  await page.getByTestId("status-bar-tiles-button").click();

  // QA/Feedback tile should be listed and unchecked by default
  const qaCheckbox = page.getByTestId("tiles-popover-checkbox-qa-feedback-section");
  await expect(qaCheckbox).toBeVisible();

  // Toggle it on
  const isChecked = await qaCheckbox.isChecked();
  if (!isChecked) {
    await qaCheckbox.check();
  }

  // Close popover and verify tile appeared
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("qa-panel-tile-content")).toBeVisible({ timeout: 5000 });
});

test("v86c: tile near viewport bottom renders flipped", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Override tile layout directly via store
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return;
    const viewportH = window.innerHeight;
    const tileH = 240;
    const tile = {
      id: "test_flip_tile",
      sectionKey: "physics-section",
      x: 200,
      y: viewportH - 100,
      w: 280,
      h: tileH,
      collapsed: false,
      z: 10,
    };
    store.getState().setSetting("ui.tileLayout", [tile]);
  });

  await page.waitForTimeout(300);

  const flipped = await page
    .locator(".tile")
    .first()
    .getAttribute("data-flipped");
  expect(flipped).toBe("true");

  // Cleanup
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("ui.tileLayout", []);
  });
});

test("v86c: tile in middle of viewport renders normally", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return;
    const tile = {
      id: "test_normal_tile",
      sectionKey: "physics-section",
      x: 200,
      y: 100,
      w: 280,
      h: 240,
      collapsed: false,
      z: 10,
    };
    store.getState().setSetting("ui.tileLayout", [tile]);
  });

  await page.waitForTimeout(300);

  const flipped = await page
    .locator(".tile")
    .first()
    .getAttribute("data-flipped");
  expect(flipped).toBe("false");

  // Cleanup
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("ui.tileLayout", []);
  });
});

test.fixme("v86c: Group collapse-all expands ALL tiles including non-top-row", async ({ page }) => {
  // Disabled: tile grouping disabled in v86c-disable-groups; revisit when re-enabled
  await page.goto("/");
});

test.fixme("v86c: 3 tiles snap into a single 3-wide group", async ({ page }) => {
  // Disabled: tile grouping disabled in v86c-disable-groups; revisit when re-enabled
  await page.goto("/");
});

/**
 * Registry-driven content rendering tests.
 *
 * For each default-visible entry in the registry with a contentTestId,
 * verify its content is visible inside the tile-layer on first load.
 * The auto-populate logic (v98.3) ensures these tiles are present without
 * requiring tear-off interaction.
 */
for (const section of tileSectionRegistry.list()) {
  const { id, contentTestId, defaultVisible } = section;

  if (!defaultVisible || !contentTestId) {
    continue;
  }

  const testName = `v98.3-meta: ${id} content visible on first load`;

  test(testName, async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const tileLayer = page.getByTestId("tile-layer");
    await expect(tileLayer).toBeVisible();

    const content = tileLayer.getByTestId(contentTestId);
    await expect(content).toBeVisible({ timeout: 10000 });

    // Cleanup: reset tile layout for subsequent tests
    await page.evaluate(() => {
      const store = (window as any).__lwStore;
      if (store) {
        store.getState().setSetting("ui.tileLayout", []);
        localStorage.removeItem("lumaweave-tiles-bootstrapped");
      }
    });
    await page.waitForTimeout(200);
  });
}

// v101.0.6: graph click-through acceptance test
// Proves that .tile-layer does NOT intercept clicks over empty graph areas.
// The fix: .tile-layer { pointer-events: none } + .tile { pointer-events: auto }
// CSS pointer-events affects elementFromPoint — a pointer-events:none element
// is invisible to it, so it falls through to the element below.
test("v101.0.6: tile-layer never intercepts clicks (pointer-events: none); tiles stay interactive", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("tile-layer")).toBeVisible();
  await expect(page.locator(".tile").first()).toBeVisible({ timeout: 5000 });

  // 1. The tile-layer must NEVER be the top element at any viewport point.
  //    With pointer-events:none, elementFromPoint skips it and returns the element below.
  const tileLayerNeverTop = await page.evaluate(() => {
    const W = window.innerWidth, H = window.innerHeight;
    for (let x = 5; x < W; x += 60) {
      for (let y = 5; y < H; y += 60) {
        const el = document.elementFromPoint(x, y);
        if (el?.getAttribute("data-testid") === "tile-layer") {
          return `tile-layer intercepted at (${x},${y})`;
        }
      }
    }
    return "ok";
  });
  expect(tileLayerNeverTop).toBe("ok");

  // 2. Tiles must remain interactive — a tile's center returns an element inside the tile.
  const tileInteractive = await page.evaluate(() => {
    const tile = document.querySelector(".tile");
    if (!tile) return "no-tile";
    const rect = tile.getBoundingClientRect();
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return tile.contains(top) ? "tile-interactive" : `not-interactive: ${top?.tagName}`;
  });
  expect(tileInteractive).toBe("tile-interactive");
});
