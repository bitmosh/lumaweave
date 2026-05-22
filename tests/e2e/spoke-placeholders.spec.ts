import { test, expect } from "@playwright/test";

const PLACEHOLDER_CONFIG = [
  {
    id: "type",
    message: "Coming in future arc (Typography axis token wiring)",
    hasIntendedPaths: false,
  },
  {
    id: "motion",
    message: "Coming in v92 (Audio Reactivity arc)",
    hasIntendedPaths: true,
    paths: ["motion.reduce"],
  },
  {
    id: "layout",
    message: "Coming in v93 (Physics Dialect arc)",
    hasIntendedPaths: false,
  },
  {
    id: "code",
    message: "Coming in v98 (Code Spoke arc)",
    hasIntendedPaths: false,
  },
];

async function openPlaceholderTab(page: import("@playwright/test").Page, spokeId: string) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const target = page.locator('[data-lw-theme-target="topbar.root"]');
  await target.click({ modifiers: ["Alt", "Shift"] });
  await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
  await page.locator(`[data-spoke-id="${spokeId}"]`).click();
  await expect(page.locator('[data-testid="placeholder-tab"]')).toBeVisible();
}

test.describe("v89.4 Spoke Placeholders", () => {
  for (const config of PLACEHOLDER_CONFIG) {
    test(`${config.id} spoke shows correct placeholder message`, async ({ page }) => {
      await openPlaceholderTab(page, config.id);
      const message = page.locator('[data-testid="placeholder-message"]');
      await expect(message).toBeVisible();
      await expect(message).toHaveText(config.message);
    });

    if (config.hasIntendedPaths && config.paths) {
      test(`${config.id} spoke shows intended targets when expanded`, async ({ page }) => {
        await openPlaceholderTab(page, config.id);
        const details = page.locator('[data-testid="placeholder-intended-targets"]');
        await expect(details).toBeVisible();
        await details.click();

        for (const path of config.paths) {
          await expect(page.locator(`code:has-text("${path}")`)).toBeVisible();
        }
      });
    } else {
      test(`${config.id} spoke has no intended-targets section`, async ({ page }) => {
        await openPlaceholderTab(page, config.id);
        await expect(page.locator('[data-testid="placeholder-intended-targets"]')).not.toBeVisible();
      });
    }
  }

  test("back button from placeholder returns to ring view", async ({ page }) => {
    await openPlaceholderTab(page, "type");
    await page.locator('[aria-label="back"]').click();
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="placeholder-tab"]')).not.toBeVisible();
  });
});
