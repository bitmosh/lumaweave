// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { openInspectorOnTopbar } from "./helpers/inspector";

test.describe("Inspector Type spoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await openInspectorOnTopbar(page);
    await expect(page.locator('[data-testid="inspector-mini-graph"]')).toBeVisible();
    await page.locator('[data-spoke-id="type"]').click();
  });

  test("Type tab renders 3 role cards", async ({ page }) => {
    await expect(page.getByTestId("inspector-type-tab")).toBeVisible();
    await expect(page.getByTestId("type-role-card-display")).toBeVisible();
    await expect(page.getByTestId("type-role-card-body")).toBeVisible();
    await expect(page.getByTestId("type-role-card-mono")).toBeVisible();
  });

  test("each role card shows specimen text", async ({ page }) => {
    const specimen = "The quick brown fox jumps over the lazy dog";
    await expect(
      page.getByTestId("type-role-card-display").getByText(specimen)
    ).toBeVisible();
    await expect(
      page.getByTestId("type-role-card-body").getByText(specimen)
    ).toBeVisible();
    await expect(
      page.getByTestId("type-role-card-mono").getByText(specimen)
    ).toBeVisible();
  });

  test("specimen text uses the role's font family", async ({ page }) => {
    const monoCard = page.getByTestId("type-role-card-mono");
    const specimen = monoCard.locator(".lw-type-role-specimen");
    await expect(specimen).toHaveCSS("font-family", /IBM Plex Mono|monospace/i);
  });

  test("placeholder message is no longer visible (real content renders)", async ({ page }) => {
    await expect(
      page.getByText("Typography controls are in development.")
    ).not.toBeVisible();
  });
});
