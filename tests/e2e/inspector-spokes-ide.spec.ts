import { test, expect } from "@playwright/test";

test.describe("v86d.4 IDE spoke", () => {
  const openIdeTab = async (page: any) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="ide"]').click();
    await expect(page.locator('[data-testid="ide-tab"]')).toBeVisible();
  };

  test("IDE spoke appears in mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const target = page.locator('[data-lw-theme-target="topbar.root"]');
    await target.click({ modifiers: ["Alt", "Shift"] });
    await expect(page.locator('[data-spoke-id="ide"]')).toHaveCount(1);
  });

  test("clicking IDE spoke opens ide-tab", async ({ page }) => {
    await openIdeTab(page);
  });

  test("ide-tab shows empty state (no source location in v86d.4)", async ({ page }) => {
    await openIdeTab(page);
    // Provenance system not yet wired — ide-empty is always shown
    await expect(page.locator('[data-testid="ide-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="source-info"]')).toHaveCount(0);
  });

  test("back button returns to ring view", async ({ page }) => {
    await openIdeTab(page);
    await page.locator('[data-testid="ide-tab"] button[aria-label="back"]').click();
    await expect(page.locator('[data-testid="ide-tab"]')).not.toBeVisible();
    await expect(page.locator('[data-spoke-id="ide"]')).toBeVisible();
  });
});
