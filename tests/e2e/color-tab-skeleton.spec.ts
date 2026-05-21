import { test, expect } from "@playwright/test";

test.describe("v86d.3a Color spoke skeleton", () => {
  test("Color spoke appears in mini-graph when opened", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });

    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();

    // One spoke should be the Color spoke (look for id attribute)
    const spokes = page.locator('[data-spoke-id="color"]');
    await expect(spokes).toHaveCount(1);
  });

  test("clicking Color spoke opens ColorTab", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });

    await page.locator('[data-spoke-id="color"]').click();

    await expect(page.locator('[data-testid="color-tab"]')).toBeVisible();
  });

  test("ColorTab shows binding rows for the target", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="color"]').click();

    const bindings = page.locator('[data-testid^="binding-"]');
    const count = await bindings.count();
    expect(count).toBeGreaterThan(0);
  });

  test("ColorTab palette section shows active theme primitives", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="color"]').click();

    const swatches = page.locator('[data-testid="palette"] button');
    const count = await swatches.count();
    expect(count).toBeGreaterThan(0);
  });

  test("ColorTab palette swatches are disabled in v86d.3a", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="color"]').click();

    const firstSwatch = page.locator('[data-testid="palette"] button').first();
    await expect(firstSwatch).toBeDisabled();
  });

  test("back button returns to ring view", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="color"]').click();

    await expect(page.locator('[data-testid="color-tab"]')).toBeVisible();
    await page.locator('[data-testid="color-tab"] button[aria-label="back"]').click();

    await expect(page.locator('[data-testid="color-tab"]')).not.toBeVisible();
    // Ring view should be back
    await expect(page.locator('[data-spoke-id="color"]')).toBeVisible();
  });

  test("scope picker shows kind+cluster disabled", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await page.locator('[data-spoke-id="color"]').click();

    const scopePicker = page.locator('[data-testid="scope-picker"]');
    const kindButton = scopePicker.locator('button:has-text("Kind")');
    const clusterButton = scopePicker.locator('button:has-text("Cluster")');

    await expect(kindButton).toBeDisabled();
    await expect(clusterButton).toBeDisabled();
  });
});
