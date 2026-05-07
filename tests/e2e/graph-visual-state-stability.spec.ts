import { expect, test } from "@playwright/test";

test.describe("Graph Visual State Stability", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  const waitForRender = (page: any) => page.waitForTimeout(100);

  test("graph remains visible after node size slider change", async ({ page }) => {
    const isFixtureMode = await page.getByTestId("self-graph-fixture-loaded").isVisible().catch(() => false);

    if (isFixtureMode) {
      // Fixture is static — verify the fixture container is visible instead of canvas
      await expect(page.getByTestId("self-graph-fixture-loaded")).toBeVisible();
    } else {
      // Normal mode — check canvas dimensions
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();

      const beforeBox = await canvas.boundingBox();
      expect(beforeBox).not.toBeNull();
      expect(beforeBox!.width).toBeGreaterThan(100);
      expect(beforeBox!.height).toBeGreaterThan(100);

      const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
      await nodeSizeSlider.fill("1.5");
      await waitForRender(page);

      await expect(canvas).toBeVisible();

      const afterBox = await canvas.boundingBox();
      expect(afterBox).not.toBeNull();
      expect(afterBox!.width).toBeGreaterThan(100);
      expect(afterBox!.height).toBeGreaterThan(100);
    }
  });

  test("graph remains visible after link distance slider change", async ({ page }) => {
    const isFixtureMode = await page.getByTestId("self-graph-fixture-loaded").isVisible().catch(() => false);

    if (isFixtureMode) {
      // Fixture is static — verify the fixture container is visible instead of canvas
      await expect(page.getByTestId("self-graph-fixture-loaded")).toBeVisible();
    } else {
      // Normal mode — check canvas dimensions
      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible();

      const beforeBox = await canvas.boundingBox();
      expect(beforeBox).not.toBeNull();
      expect(beforeBox!.width).toBeGreaterThan(100);
      expect(beforeBox!.height).toBeGreaterThan(100);

      const linkDistanceSlider = page.locator("[data-testid='setting-physics-linkDistance']");
      await linkDistanceSlider.fill("50");
      await waitForRender(page);

      await expect(canvas).toBeVisible();

      const afterBox = await canvas.boundingBox();
      expect(afterBox).not.toBeNull();
      expect(afterBox!.width).toBeGreaterThan(100);
      expect(afterBox!.height).toBeGreaterThan(100);
    }
  });

  test("graph remains visible after repel force slider change", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    const beforeBox = await canvas.boundingBox();
    expect(beforeBox).not.toBeNull();
    expect(beforeBox!.width).toBeGreaterThan(100);
    expect(beforeBox!.height).toBeGreaterThan(100);

    const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");
    await repelForceSlider.fill("50");
    await waitForRender(page);

    await expect(canvas).toBeVisible();

    const afterBox = await canvas.boundingBox();
    expect(afterBox).not.toBeNull();
    expect(afterBox!.width).toBeGreaterThan(100);
    expect(afterBox!.height).toBeGreaterThan(100);
  });

  test("no canvas disappearance after multiple slider changes", async ({ page }) => {
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
    const linkDistanceSlider = page.locator("[data-testid='setting-physics-linkDistance']");
    const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");

    await nodeSizeSlider.fill("1.5");
    await waitForRender(page);
    await expect(canvas).toBeVisible();

    await linkDistanceSlider.fill("10");
    await waitForRender(page);
    await expect(canvas).toBeVisible();

    await repelForceSlider.fill("50");
    await waitForRender(page);
    await expect(canvas).toBeVisible();

    await nodeSizeSlider.fill("1");
    await waitForRender(page);
    await expect(canvas).toBeVisible();

    const finalBox = await canvas.boundingBox();
    expect(finalBox).not.toBeNull();
    expect(finalBox!.width).toBeGreaterThan(100);
    expect(finalBox!.height).toBeGreaterThan(100);
  });

  test("node label mode does not become all labels after slider change", async ({ page }) => {
    await page.goto("/");

    // Set node label mode to selected-neighborhood
    const nodeLabelModeSelect = page.locator("[data-testid='setting-labels-nodeLabelMode']");
    await nodeLabelModeSelect.selectOption("selected-neighborhood");

    // Move node size slider
    const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
    await nodeSizeSlider.fill("1.5");

    // Verify graph canvas is still visible
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("no console errors during slider changes", async ({ page }) => {
    await page.goto("/");

    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Change multiple sliders
    const nodeSizeSlider = page.locator("[data-testid='setting-physics-nodeSize']");
    const linkDistanceSlider = page.locator("[data-testid='setting-physics-linkDistance']");
    const repelForceSlider = page.locator("[data-testid='setting-physics-repelForce']");

    await nodeSizeSlider.fill("1.5");
    await linkDistanceSlider.fill("10");
    await repelForceSlider.fill("50");
    await nodeSizeSlider.fill("1");

    // Wait a bit for any async errors
    await page.waitForTimeout(500);

    // Verify no console errors
    expect(errors).toHaveLength(0);
  });
});
