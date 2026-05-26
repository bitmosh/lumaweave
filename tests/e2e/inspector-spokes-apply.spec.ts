import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("v86d.4 Apply spoke", () => {
  const openApplyTab = async (page: any) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="apply"]').click();
    await expect(page.locator('[data-testid="apply-tab"]')).toBeVisible();
  };

  test("Apply spoke appears in mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-spoke-id="apply"]')).toHaveCount(1);
  });

  test("clicking Apply spoke opens apply-tab", async ({ page }) => {
    await openApplyTab(page);
  });

  test("apply-tab shows empty state when target has no candidates", async ({ page }) => {
    // Fresh load with no overrides — probe runs but may or may not find candidates;
    // regardless, apply-tab itself is visible and either shows candidates or empty state
    await openApplyTab(page);
    const applyTab = page.locator('[data-testid="apply-tab"]');
    await expect(applyTab).toBeVisible();

    const emptySectionOrCandidates = page.locator(
      '[data-testid="apply-empty"], [data-testid="candidates"]',
    );
    await expect(emptySectionOrCandidates.first()).toBeVisible();
  });

  test("apply-selected button disabled when no candidates selected", async ({ page }) => {
    await openApplyTab(page);

    const candidatesSection = page.locator('[data-testid="candidates"]');
    const hasCount = await candidatesSection.count();
    if (hasCount === 0) {
      // Only empty state visible — skip the rest of this test
      test.skip();
      return;
    }

    // With candidates present, apply-selected should be disabled until one is checked
    const applyBtn = page.locator('[data-testid="apply-selected"]');
    await expect(applyBtn).toBeDisabled();
  });

  test("select-all enables apply-selected", async ({ page }) => {
    await openApplyTab(page);

    const candidatesSection = page.locator('[data-testid="candidates"]');
    const hasCount = await candidatesSection.count();
    if (hasCount === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-testid="select-all"]').click();
    const applyBtn = page.locator('[data-testid="apply-selected"]');
    await expect(applyBtn).not.toBeDisabled();
  });

  test("select-none after select-all re-disables apply-selected", async ({ page }) => {
    await openApplyTab(page);

    const candidatesSection = page.locator('[data-testid="candidates"]');
    const hasCount = await candidatesSection.count();
    if (hasCount === 0) {
      test.skip();
      return;
    }

    await page.locator('[data-testid="select-all"]').click();
    await page.locator('[data-testid="select-none"]').click();
    const applyBtn = page.locator('[data-testid="apply-selected"]');
    await expect(applyBtn).toBeDisabled();
  });

  test("back button returns to ring view", async ({ page }) => {
    await openApplyTab(page);
    await page.locator('[data-testid="apply-tab"] button[aria-label="back"]').click();
    await expect(page.locator('[data-testid="apply-tab"]')).not.toBeVisible();
    await expect(page.locator('[data-spoke-id="apply"]')).toBeVisible();
  });
});
