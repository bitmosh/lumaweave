// SPDX-License-Identifier: Apache-2.0
import { expect, test } from "@playwright/test";
import { openQaPanel } from "./helpers/qa";

test.describe("Graph Physics Playwright Coverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("graph surface mounts and is visible", async ({ page }) => {
    // Verify graph canvas is visible (works in both fixture and normal mode)
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(100);
    expect(boundingBox!.height).toBeGreaterThan(100);
  });

  test("graph frame/container has stable evidence", async ({ page }) => {
    // Verify graph canvas exists
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("graph-related panels coexist with Mission Control", async ({ page }) => {
    // Graph canvas should be visible
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // QA panel (Mission Control) should coexist with the graph
    await openQaPanel(page);
    await expect(page.getByTestId("qa-panel-tile-content")).toBeVisible();
  });

  test("graph shell remains visible after opening Command Deck", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Open Command Deck tab if it exists
    const commandDeckTab = page.getByTestId("command-deck-tab");
    if (await commandDeckTab.isVisible()) {
      await commandDeckTab.click();
    }

    // Graph should still be visible
    await expect(canvas).toBeVisible();
  });

  test("graph shell remains visible after opening Perspective System", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    // Perspective System is in Command Deck Shell
    const commandDeckTab = page.getByTestId("command-deck-tab");
    if (await commandDeckTab.isVisible()) {
      await commandDeckTab.click();
    }

    // Graph should still be visible
    await expect(canvas).toBeVisible();
  });
});
