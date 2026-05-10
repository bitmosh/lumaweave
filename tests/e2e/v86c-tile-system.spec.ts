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
  await expect(tearOffHandle).toHaveAttribute("title", "Tear off as tile");
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
