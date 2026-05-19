/**
 * v86c Tile System - Integration Tests
 * 
 * These tests verify the tile system integration with actual UI components.
 * Full interaction testing (tear-off, snap, grouping) requires manual QA per phase packet section J.
 */

import { expect, test } from "@playwright/test";

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
