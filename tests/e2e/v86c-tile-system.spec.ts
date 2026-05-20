/**
 * v86c Tile System - Integration Tests
 * 
 * These tests verify the tile system integration with actual UI components.
 * Full interaction testing (tear-off, snap, grouping) requires manual QA per phase packet section J.
 */

import { expect, test } from "@playwright/test";
import { tileSectionRegistry } from "../../src/control-plane/panels/tileSectionRegistry";

/**
 * Helper for v86c section-content meta-tests.
 * Tears off a section and verifies content rendered inside the tile.
 *
 * Usage: see the registry-driven meta-tests at the bottom of this
 * file. One test per registry entry.
 */
async function tearOffAndCheckContent(
  page: import("@playwright/test").Page,
  sourceTestId: string,
  expectedContentTestId: string
): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Locate the tear-off handle in the source slot
  const handle = page.locator(
    `[data-testid="${sourceTestId}"] [title="Drag to tear off as tile"]`
  );
  await expect(handle).toBeVisible({ timeout: 10000 });

  // Scroll the handle into the viewport if needed (critical for off-screen sections)
  await handle.scrollIntoViewIfNeeded();

  // Drag past the 8px threshold to tear off
  const box = await handle.boundingBox();
  if (!box) throw new Error(`No bounding box for handle in ${sourceTestId}`);

  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 120, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Verify the floating tile exists
  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();

  // Critical: the expected content testid must be present inside
  // the tile, NOT just anywhere on the page (which could match
  // the original undocked rendering).
  const content = tileLayer.getByTestId(expectedContentTestId);
  await expect(content).toBeVisible();

  // Cleanup: reset tile layout so subsequent tests start clean
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) {
      store.getState().setSetting("ui.tileLayout", []);
    }
  });
  await page.waitForTimeout(200);
}

test("v86c-integration: tile-tear-off handle visible", async ({ page }) => {
  await page.goto("/");

  // Verify tear-off handles (⤴) are visible on tileable sections
  const tearOffHandles = page.getByText("⤴");
  const count = await tearOffHandles.count();
  
  // Should have at least 7 tear-off handles (4 left-panel + 3 right-dock)
  expect(count).toBeGreaterThanOrEqual(7);
});

test("v86c-integration: tile-tear-off handle clickable", async ({ page }) => {
  await page.goto("/");

  // Find a tear-off handle and verify it's clickable
  const tearOffHandle = page.getByText("⤴").first();
  await expect(tearOffHandle).toBeVisible();
  await expect(tearOffHandle).toHaveAttribute("title", "Drag to tear off as tile");
});

test("v86c-integration: data-tiled-out attribute exists", async ({ page }) => {
  await page.goto("/");

  // Verify sections have data-tiled-out attribute infrastructure
  // Initially all sections should have data-tiled-out undefined (not tiled out)
  const sections = page.locator("[data-testid^='section-']");
  const count = await sections.count();
  
  // Should have multiple sections with test IDs
  expect(count).toBeGreaterThan(0);
  
  // Verify first section doesn't have data-tiled-out="true" initially
  const firstSection = sections.first();
  await expect(firstSection).not.toHaveAttribute("data-tiled-out", "true");
});

test("v86c-integration: TileLayer renders", async ({ page }) => {
  await page.goto("/");

  // Verify TileLayer is present (indicates TileProvider is mounted)
  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();
});

test("v86c-integration: tileable sections match registry", async ({ page }) => {
  await page.goto("/");

  // Verify sections with tileableKey props are rendered
  // Use testId selectors for specificity
  await expect(page.getByTestId("section-graph-sources")).toBeVisible();
  await expect(page.getByTestId("section-qa-panel")).toBeVisible();
  await expect(page.getByTestId("section-graph-visual-inventory")).toBeVisible();
  await expect(page.getByTestId("section-system-index")).toBeVisible();
  await expect(page.getByTestId("section-command-deck")).toBeVisible();

  // Right dock sections (now wrapped in CollapsibleSection with tileableKey)
  await expect(page.getByTestId("settings-section-physics")).toBeVisible();
  await expect(page.getByTestId("settings-section-labels")).toBeVisible();
  await expect(page.getByTestId("settings-section-graph-view")).toBeVisible();
});

test("v86c-B: Physics section renders content when tiled out", async ({ page }) => {
  await page.goto("/");

  // Find the Physics tear-off handle in the settings panel
  const physicsHandle = page.locator(
    '[data-testid="settings-section-physics"] [title="Drag to tear off as tile"]'
  );
  await expect(physicsHandle).toBeVisible();

  // Tear off — click + small drag to trigger the >8px threshold
  const box = await physicsHandle.boundingBox();
  await page.mouse.move(box!.x + 5, box!.y + 5);
  await page.mouse.down();
  await page.mouse.move(box!.x + 100, box!.y + 100, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  // Verify the tile rendered with Physics content
  const tileLayer = page.getByTestId("tile-layer");
  await expect(tileLayer).toBeVisible();

  const physicsContent = tileLayer.getByTestId("physics-section-content");
  await expect(physicsContent).toBeVisible();

  // Specifically: verify Physics-internal controls render inside the tile
  const dialectSelect = physicsContent.getByTestId("dialect-select");
  await expect(dialectSelect).toBeVisible();

  // Verify source slot greys out
  const sourceSection = page.locator(
    '[data-testid="settings-section-physics"]'
  );
  await expect(sourceSection).toHaveAttribute("data-tiled-out", "true");

  // Cleanup: clear the tile so subsequent tests aren't affected
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    const settings = store.getState().settings;
    store.getState().setSetting("ui.tileLayout", []);
  });
  await page.waitForTimeout(200);
});

test("v86c: Tiled-out indicator appears in source slot when section is torn off", async ({ page }) => {
  await page.goto("/");

  const physicsHandle = page.locator(
    '[data-testid="settings-section-physics"] [title="Drag to tear off as tile"]'
  );
  await expect(physicsHandle).toBeVisible();

  const box = await physicsHandle.boundingBox();
  if (!box) throw new Error("Physics handle has no bounding box");

  await page.mouse.move(box.x + 5, box.y + 5);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 120, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  // The indicator should now be visible in the source slot
  const sourceSection = page.locator(
    '[data-testid="settings-section-physics"]'
  );
  const indicator = sourceSection.getByTestId("settings-section-physics-tiled-indicator");
  await expect(indicator).toBeVisible();

  // And the original Physics content should NOT be visible in the source slot
  // (it's been replaced by the indicator). The dialect-select is the load-bearing
  // Physics control we test for absence here.
  const dialectInSlot = sourceSection.getByTestId("dialect-select");
  // The dialect select should still exist in the document (inside the floating tile),
  // but not within the source section.
  await expect(dialectInSlot).toHaveCount(0);

  // Cleanup
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("ui.tileLayout", []);
  });
  await page.waitForTimeout(200);
});

/**
 * v86c-C5a: 3-wide group formation test
 * Verifies that 3 tiles positioned edge-adjacent form a single group.
 * This tests adjacency detection independent of drag UX.
 */
test.fixme("v86c: Group collapse-all expands ALL tiles including non-top-row", async ({ page }) => {
  // Disabled: tile grouping disabled in v86c-disable-groups; revisit when re-enabled
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Capture console logs for debugging
  const consoleLogs: string[] = [];
  page.on("console", (msg) => {
    if (msg.text().includes("[GroupBar")) {
      consoleLogs.push(msg.text());
    }
  });

  // Reset persisted tile layout
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) {
      store.getState().setSetting("ui.tileLayout", []);
    }
  });
  await page.waitForTimeout(200);

  // Tear off 3 right-dock sections
  const tearOff = async (sourceTestId: string, dropX: number, dropY: number) => {
    const handle = page.locator(
      `[data-testid="${sourceTestId}"] [title="Drag to tear off as tile"]`
    );
    await handle.scrollIntoViewIfNeeded();
    await expect(handle).toBeVisible();
    const box = await handle.boundingBox();
    if (!box) throw new Error(`No box for ${sourceTestId}`);
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(dropX, dropY, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  };

  await tearOff("settings-section-physics", 400, 300);
  await tearOff("settings-section-labels", 700, 300);
  await tearOff("settings-section-graph-view", 1000, 300);

  // Position them precisely in a 3-wide group
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    const tiles = store.getState().settings.ui?.tileLayout ?? [];
    if (tiles.length !== 3) return;
    const sorted = [...tiles].sort((a: any, b: any) => a.x - b.x);
    let cursorX = 200;
    const baseY = 300;
    const updated = sorted.map((t: any) => {
      const newTile = { ...t, x: cursorX, y: baseY };
      cursorX += t.w;
      return newTile;
    });
    store.getState().setSetting("ui.tileLayout", updated);
  });
  await page.waitForTimeout(300);

  // Verify group bar exists
  const groupBar = page.locator(".group-bar");
  await expect(groupBar).toBeVisible();

  // Get initial collapsed state of all tiles
  const getCollapsedStates = async () => {
    return await page.evaluate(() => {
      const store = (window as any).__lwStore;
      const tiles = store.getState().settings.ui?.tileLayout ?? [];
      return tiles.map((t: any) => ({ id: t.id, collapsed: t.collapsed }));
    });
  };

  const initialStates = await getCollapsedStates();
  console.log("Initial states:", initialStates);

  // Click collapse-all button
  const collapseBtn = page.locator(".group-bar [title='Collapse all']");
  await collapseBtn.click();
  await page.waitForTimeout(200);

  let afterFirstClick = await getCollapsedStates();
  console.log("After first click (collapse-all):", afterFirstClick);
  afterFirstClick.forEach((t) => {
    expect(t.collapsed).toBe(true);
  });

  // Click collapse-all button again (should expand all)
  const expandBtn = page.locator(".group-bar [title='Expand all']");
  await expandBtn.click();
  await page.waitForTimeout(200);

  let afterSecondClick = await getCollapsedStates();
  console.log("After second click (expand-all):", afterSecondClick);
  console.log("Console logs:", consoleLogs);

  // All tiles should be expanded
  afterSecondClick.forEach((t) => {
    expect(t.collapsed).toBe(false);
  });

  // Cleanup
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("ui.tileLayout", []);
  });
});

test.fixme("v86c: 3 tiles snap into a single 3-wide group", async ({ page }) => {
  // Disabled: tile grouping disabled in v86c-disable-groups; revisit when re-enabled
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Reset persisted tile layout
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (store) {
      store.getState().setSetting("ui.tileLayout", []);
    }
  });
  await page.waitForTimeout(200);

  // Tear off 3 right-dock sections
  const tearOff = async (sourceTestId: string, dropX: number, dropY: number) => {
    const handle = page.locator(
      `[data-testid="${sourceTestId}"] [title="Drag to tear off as tile"]`
    );
    await handle.scrollIntoViewIfNeeded();
    await expect(handle).toBeVisible();
    const box = await handle.boundingBox();
    if (!box) throw new Error(`No box for ${sourceTestId}`);
    await page.mouse.move(box.x + 5, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(dropX, dropY, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  };

  await tearOff("settings-section-physics", 400, 300);
  await tearOff("settings-section-labels", 700, 300);
  await tearOff("settings-section-graph-view", 1000, 300);

  // Position them precisely edge-adjacent via the store
  // (bypasses drag UX to test the adjacency detection itself)
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    const tiles = store.getState().settings.ui?.tileLayout ?? [];
    if (tiles.length !== 3) return;
    const sorted = [...tiles].sort((a: any, b: any) => a.x - b.x);
    let cursorX = 200;
    const baseY = 300;
    const updated = sorted.map((t: any) => {
      const newTile = { ...t, x: cursorX, y: baseY };
      cursorX += t.w;
      return newTile;
    });
    store.getState().setSetting("ui.tileLayout", updated);
  });
  await page.waitForTimeout(300);

  // Verify the runtime group: tile-layer should contain a group bar
  // element indicating 3 tiles are grouped
  const groupInfo = await page.evaluate(() => {
    const store = (window as any).__lwStore;
    const tiles = store.getState().settings.ui?.tileLayout ?? [];
    return {
      tileCount: tiles.length,
      tilePositions: tiles.map((t: any) => ({
        id: t.id,
        sectionKey: t.sectionKey,
        x: t.x,
        y: t.y,
        w: t.w,
        right: t.x + t.w,
      })),
    };
  });

  expect(groupInfo.tileCount).toBe(3);

  // Verify group bar exists. Group bars use className "group-bar"
  // and indicate that 3 tiles have formed a single group.
  const groupBarCount = await page.locator(".group-bar").count();
  expect(groupBarCount).toBeGreaterThanOrEqual(1);

  // Cleanup
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    store.getState().setSetting("ui.tileLayout", []);
  });
});

test("v86c: tile near viewport bottom renders flipped", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Set up: a tile near the bottom of the viewport
  await page.evaluate(() => {
    const store = (window as any).__lwStore;
    if (!store) return;
    const viewportH = window.innerHeight;
    const tileH = 240;
    // Position so tile would clip bottom AND has room above
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

  // Verify the tile rendered with data-flipped="true"
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

  // Set up: a tile in the middle, plenty of room
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

/**
 * Registry-driven section content rendering tests.
 *
 * Iterates tileSectionRegistry and generates one test per entry.
 * Sections with contentTestId set → real assertion; should pass.
 * Sections without contentTestId → test.fail (expected failure
 * until Scope C wires the section's content() function).
 *
 * As each section gets its content wired (and its contentTestId
 * set in the registry), the test starts passing automatically.
 * No edits to this file required to track Scope C progress.
 */
for (const section of tileSectionRegistry.list()) {
  const { id, contentTestId, sourceTestId } = section;

  // Skip entries with no sourceTestId (shouldn't happen for
  // wired sections, but defensive)
  if (!sourceTestId) {
    continue;
  }

  const testName = `v86c-meta: ${id} renders content when tiled out`;

  if (contentTestId) {
    // Wired section — expect the test to pass
    test(testName, async ({ page }) => {
      await tearOffAndCheckContent(page, sourceTestId, contentTestId);
    });
  } else {
    // Section's content() function is not yet wired (Scope C work).
    // test.fixme marks this as intentionally pending — Playwright
    // won't run the body, won't fail, won't affect exit code.
    // When this section's contentTestId is set in the registry
    // (signal that content() is wired), this branch will not be
    // taken and the section will fall into the passing branch above.
    test.fixme(
      `${testName} (pending: section not yet wired)`,
      async () => {
        // Body intentionally empty — fixme tests don't execute.
      }
    );
  }
}
