import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

const CANONICAL_SPOKE_ORDER = [
  "color", "geometry", "type", "motion", "layout", "code", "apply", "ide", "history",
];

const PLACEHOLDER_SPOKES = ["type", "motion", "layout", "code"];

test.describe("v89.4 Inspector Full Radial — 9 spokes", () => {
  test("all 9 spokes render in canonical order", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();

    // All 9 spoke IDs should be present
    for (const spokeId of CANONICAL_SPOKE_ORDER) {
      await expect(page.locator(`[data-spoke-id="${spokeId}"]`)).toBeVisible();
    }
  });

  test("placeholder spokes render with data-placeholder attribute", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();

    for (const spokeId of PLACEHOLDER_SPOKES) {
      const spokeEl = page.locator(`[data-spoke-id="${spokeId}"]`);
      await expect(spokeEl).toBeVisible();
      await expect(spokeEl).toHaveAttribute("data-placeholder", "true");
    }
  });

  test("active spoke (geometry) does not have data-placeholder", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();

    const geometrySpoke = page.locator('[data-spoke-id="geometry"]');
    await expect(geometrySpoke).toBeVisible();
    await expect(geometrySpoke).not.toHaveAttribute("data-placeholder");
  });

  for (const spokeId of PLACEHOLDER_SPOKES) {
    test(`${spokeId} placeholder spoke opens tab with "Coming" message`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      await openInspectorOnTopbar(page);
      await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();

      // Click the placeholder spoke
      await page.locator(`[data-spoke-id="${spokeId}"]`).click();

      // Placeholder tab should appear with a "Coming" message
      await expect(page.locator('[data-testid="placeholder-tab"]')).toBeVisible();
      const message = page.locator('[data-testid="placeholder-message"]');
      await expect(message).toBeVisible();
      await expect(message).toContainText("Coming");
    });
  }
});
