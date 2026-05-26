import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("v86d.4 IDE spoke", () => {
  const openIdeTab = async (page: any) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="ide"]').click();
    await expect(page.locator('[data-testid="ide-tab"]')).toBeVisible();
  };

  test("IDE spoke appears in mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-spoke-id="ide"]')).toHaveCount(1);
  });

  test("clicking IDE spoke opens ide-tab", async ({ page }) => {
    await openIdeTab(page);
  });

  test("ide-tab shows source-info for targets with provenance (v86d.5+)", async ({ page }) => {
    await openIdeTab(page);
    // topbar.root has provenance data — source-info should be shown
    await expect(page.locator('[data-testid="source-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="ide-empty"]')).toHaveCount(0);
  });

  test("back button returns to ring view", async ({ page }) => {
    await openIdeTab(page);
    await page.locator('[data-testid="ide-tab"] button[aria-label="back"]').click();
    await expect(page.locator('[data-testid="ide-tab"]')).not.toBeVisible();
    await expect(page.locator('[data-spoke-id="ide"]')).toBeVisible();
  });
});
