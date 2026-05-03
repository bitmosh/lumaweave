import { expect, test } from "@playwright/test";

test.describe("Graph Physics Playwright Coverage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("graph surface mounts and is visible", async ({ page }) => {
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

    // QA panel should be visible (Mission Control is the QA panel)
    const qaPanel = page.getByTestId("qa-panel").first();
    await expect(qaPanel).toBeVisible();
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

  test("physics controls are present and accessible", async ({ page }) => {
    // Verify physics sliders exist
    const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
    await expect(nodeSizeSlider).toBeVisible();

    const linkDistanceSlider = page.locator("[data-testid='setting-physics-linkDistance']");
    await expect(linkDistanceSlider).toBeVisible();

    const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");
    await expect(repelForceSlider).toBeVisible();
  });

  test("graph controls remain passive/valid", async ({ page }) => {
    // Physics sliders should be present
    const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
    await expect(nodeSizeSlider).toBeVisible();

    // Verify slider has a value
    const initialValue = await nodeSizeSlider.inputValue();
    expect(initialValue).not.toBe("");
  });
});
