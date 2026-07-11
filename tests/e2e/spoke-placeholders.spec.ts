// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

// Only spokes still registered with status: "placeholder" belong here.
// "code" graduated in v105.0.1. "type" and "motion" have since graduated too — they now
// render real TypeTab / MotionTab components and are covered by inspector-type-spoke.spec.ts
// and inspector-motion-spoke.spec.ts. Keeping them here asserted a placeholder UI that no
// longer exists. "layout" is the last remaining placeholder (registerLayoutSpoke.ts:13).
const PLACEHOLDER_CONFIG = [
  {
    id: "layout",
    message: "Physics layout controls are in development.",
    hasIntendedPaths: false,
  },
];

async function openPlaceholderTab(page: import("@playwright/test").Page, spokeId: string) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await openInspectorOnTopbar(page);
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
    await openPlaceholderTab(page, "layout");
    await page.locator('[aria-label="back"]').click();
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="placeholder-tab"]')).not.toBeVisible();
  });
});
