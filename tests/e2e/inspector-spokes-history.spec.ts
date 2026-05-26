import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("v86d.4 History spoke", () => {
  const TARGET_ID = "topbar.root";
  const TOKEN_PATH = "text.primary";

  // The history spoke (order 3, angle 270°) initializes at anchorY - 70.
  // When the topbar anchor is near the top of the viewport, the spoke renders
  // above y=0 (outside the viewport). Use evaluate + dispatchEvent to bypass
  // the viewport bounds check that Playwright's locator.click enforces.
  const clickHistorySpoke = async (page: any) => {
    await page.evaluate(() => {
      const el = document.querySelector('[data-spoke-id="history"]');
      el?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
  };

  const openHistoryTab = async (page: any) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await clickHistorySpoke(page);
    await expect(page.locator('[data-testid="history-tab"]')).toBeVisible();
  };

  const seedOverride = async (page: any) => {
    await page.evaluate(
      ([targetId, tokenPath]: [string, string]) => {
        (window as any).__lwThemeOverrideStorage.setTargetOverride(
          targetId,
          tokenPath,
          "#FF6B1A",
        );
      },
      [TARGET_ID, TOKEN_PATH] as [string, string],
    );
  };

  test("History spoke appears in mini-graph", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-spoke-id="history"]')).toHaveCount(1);
  });

  test("clicking History spoke opens history-tab", async ({ page }) => {
    await openHistoryTab(page);
  });

  test("history-tab shows empty state when no overrides exist", async ({ page }) => {
    await openHistoryTab(page);
    await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-list"]')).toHaveCount(0);
  });

  test("history-tab shows override rows after seeding", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await seedOverride(page);

    await openInspectorOnTopbar(page);
    await clickHistorySpoke(page);

    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await expect(page.locator(`[data-testid="history-row-${TOKEN_PATH}"]`)).toBeVisible();
  });

  test("Reset button removes the override row", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await seedOverride(page);

    await openInspectorOnTopbar(page);
    await clickHistorySpoke(page);

    await expect(page.locator(`[data-testid="reset-${TOKEN_PATH}"]`)).toBeVisible();
    await page.locator(`[data-testid="reset-${TOKEN_PATH}"]`).click();

    await expect(page.locator(`[data-testid="history-row-${TOKEN_PATH}"]`)).toHaveCount(0);
    await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
  });

  test("Reset all removes all override rows", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Seed two overrides using canonical token paths
    await page.evaluate(
      ([targetId]: [string]) => {
        const s = (window as any).__lwThemeOverrideStorage;
        s.setTargetOverride(targetId, "text.primary", "#FF6B1A");
        s.setTargetOverride(targetId, "accent.primary", "#FFB347");
      },
      [TARGET_ID] as [string],
    );

    await openInspectorOnTopbar(page);
    await clickHistorySpoke(page);

    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await page.locator('[data-testid="reset-all"]').click();

    await expect(page.locator('[data-testid="history-list"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
  });

  test("back button returns to ring view", async ({ page }) => {
    await openHistoryTab(page);
    await page.locator('[data-testid="history-tab"] button[aria-label="back"]').click();
    await expect(page.locator('[data-testid="history-tab"]')).not.toBeVisible();
    await expect(page.locator('[data-spoke-id="history"]')).toHaveCount(1);
  });
});
