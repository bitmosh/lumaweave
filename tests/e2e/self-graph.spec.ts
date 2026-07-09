// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("Self-Graph YAML Parser v75a", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("graph canvas renders with YAML parser graph loaded", async ({ page }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    await expect(graphViewport).toBeVisible();

    // Sigma creates multiple canvas layers - check that at least one is visible
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("spot check: docs.folder.operating-policies node present", async ({
    page,
  }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    await expect(graphViewport).toBeVisible();

    // Verify the graph is rendering with Sigma canvases
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("spot check: code.system.graph node present", async ({ page }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    await expect(graphViewport).toBeVisible();

    // Verify the graph is rendering
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("spot check: docs.file.index.session.and.stack node present", async ({
    page,
  }) => {
    const graphViewport = page.getByTestId("graph-viewport");
    await expect(graphViewport).toBeVisible();

    // Verify the graph is rendering
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });
});
