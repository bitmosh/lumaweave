import { test, expect } from "@playwright/test";

async function navigateToExport(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator('[data-testid="topbar-settings-button"]').click();
  await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  await page.getByTestId("settings-category-nav-theme").click();
  await expect(page.getByTestId("settings-category-content-theme")).toBeVisible({ timeout: 3000 });
  await page.locator('nav[aria-label="Theme sections"]').getByRole("button", { name: "Export" }).click();
  await expect(page.getByTestId("theme-export-button")).toBeVisible({ timeout: 2000 });
}

async function applyTestOverride(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    const storage = {
      version: "1.0.0",
      overrides: [{
        tokenPath: "app.background",
        value: "#ff0000",
        timestamp: 1,
        scope: { kind: "global" },
      }],
    };
    localStorage.setItem("lumaweave-theme-overrides", JSON.stringify(storage));
    window.dispatchEvent(new CustomEvent("lw:override-change"));
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("lumaweave-theme-overrides"));
});

test.describe("Theme Export sub-area", () => {
  test("export button is disabled when no overrides exist", async ({ page }) => {
    await navigateToExport(page);
    const button = page.getByTestId("theme-export-button");
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("title", "Apply some overrides first.");
  });

  test("export button enables after applying an override", async ({ page }) => {
    await navigateToExport(page);
    await expect(page.getByTestId("theme-export-button")).toBeDisabled();
    await applyTestOverride(page);
    await expect(page.getByTestId("theme-export-button")).toBeEnabled({ timeout: 2000 });
  });

  test("clicking export triggers a download with correct filename pattern", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await applyTestOverride(page);
    await page.locator('[data-testid="topbar-settings-button"]').click();
    await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
    await page.getByTestId("settings-category-nav-theme").click();
    await expect(page.getByTestId("settings-category-content-theme")).toBeVisible({ timeout: 3000 });
    await page.locator('nav[aria-label="Theme sections"]').getByRole("button", { name: "Export" }).click();
    await expect(page.getByTestId("theme-export-button")).toBeEnabled({ timeout: 2000 });

    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("theme-export-button").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(
      /^lumaweave-overrides-[a-z-]+-\d{8}T\d{6}Z\.json$/
    );
  });

  test("scope hint is visible in export sub-area", async ({ page }) => {
    await navigateToExport(page);
    await expect(
      page.getByText("Exports your global theme overrides")
    ).toBeVisible();
  });
});
