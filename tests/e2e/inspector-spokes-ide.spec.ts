import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("v86d.4 Code spoke (was: IDE spoke)", () => {
  const openCodeTab = async (page: any) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="code"]').click();
    await expect(page.locator('[data-testid="code-tab"]')).toBeVisible();
  };

  test("Code spoke appears in mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-spoke-id="code"]')).toHaveCount(1);
  });

  test("clicking Code spoke opens code-tab", async ({ page }) => {
    await openCodeTab(page);
  });

  test("code-tab shows source-info for targets with provenance (v86d.5+)", async ({ page }) => {
    await openCodeTab(page);
    // topbar.root has provenance data — source-info should be shown
    await expect(page.locator('[data-testid="source-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="code-empty"]')).toHaveCount(0);
  });

  test("back button returns to ring view", async ({ page }) => {
    await openCodeTab(page);
    await page.locator('[data-testid="code-tab"] button[aria-label="back"]').click();
    await expect(page.locator('[data-testid="code-tab"]')).not.toBeVisible();
    await expect(page.locator('[data-spoke-id="code"]')).toBeVisible();
  });
});
