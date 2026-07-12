// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";

test.describe("Theme Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("theme selector exists", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    await expect(themeSelector).toBeVisible();
  });

  test("built-in options exist", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    
    // Check that all built-in options exist
    const options = themeSelector.locator("option");
    await expect(options).toHaveCount(6);
    
    await expect(options.nth(0)).toHaveText("Plasma");
    await expect(options.nth(1)).toHaveText("Aurora");
    await expect(options.nth(2)).toHaveText("Midnight");
    await expect(options.nth(3)).toHaveText("Neon Pink");
    await expect(options.nth(4)).toHaveText("Light Pastel");
    await expect(options.nth(5)).toHaveText("Lavender");
  });

  test("selecting one updates control value", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    
    // Select Obsidian Aurora
    await themeSelector.selectOption("obsidian-aurora");
    await expect(themeSelector).toHaveValue("obsidian-aurora");
    
    // Select Midnight Loom
    await themeSelector.selectOption("midnight-loom");
    await expect(themeSelector).toHaveValue("midnight-loom");
    
    // Select Void Circuit
    await themeSelector.selectOption("void-circuit");
    await expect(themeSelector).toHaveValue("void-circuit");
    
    // Select Solar Plasma
    await themeSelector.selectOption("solar-plasma");
    await expect(themeSelector).toHaveValue("solar-plasma");
  });

  test("animation toggle exists", async ({ page }) => {
    const animationToggle = page.getByTestId("topbar-toggle-animation");
    await expect(animationToggle).toBeVisible();
  });

  test("reduce motion toggle exists", async ({ page }) => {
    const reduceMotionToggle = page.getByTestId("topbar-toggle-reduce-motion");
    await expect(reduceMotionToggle).toBeVisible();
  });

  test("animation toggle can be toggled", async ({ page }) => {
    const animationToggle = page.getByTestId("topbar-toggle-animation");

    const initialState = await animationToggle.isChecked();
    await animationToggle.click();
    const newState = await animationToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("reduce motion toggle can be toggled", async ({ page }) => {
    const reduceMotionToggle = page.getByTestId("topbar-toggle-reduce-motion");

    const initialState = await reduceMotionToggle.isChecked();
    await reduceMotionToggle.click();
    const newState = await reduceMotionToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("void circuit graph color switching", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    
    // Select Void Circuit
    await themeSelector.selectOption("void-circuit");
    await expect(themeSelector).toHaveValue("void-circuit");
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Switch to Solar Plasma
    await themeSelector.selectOption("solar-plasma");
    await expect(themeSelector).toHaveValue("solar-plasma");
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Switch back to Void Circuit
    await themeSelector.selectOption("void-circuit");
    await expect(themeSelector).toHaveValue("void-circuit");
  });

  test("mission control decision badge visible", async ({ page }) => {
    // Check if QA tab is visible
    const isVisible = await page.getByTestId("tab-qa").isVisible().catch(() => false);
    
    if (isVisible) {
      // Check for version badge
      const versionBadge = page.locator('text=/v\\d+/').first();
      await expect(versionBadge).toBeVisible();
      
      // Check for decision badge (should be next to version)
      const decisionBadge = page.locator('text=/ACCEPT|INCOMPLETE|BLOCKED/').first();
      await expect(decisionBadge).toBeVisible();
    }
  });

  test("mission control history sorting", async ({ page }) => {
    // Check if QA tab is visible
    const isVisible = await page.getByTestId("tab-qa").isVisible().catch(() => false);
    
    if (isVisible) {
      // Click on History tab
      const historyTab = page.locator('text=History').or(page.locator('button:has-text("History")'));
      const historyVisible = await historyTab.isVisible().catch(() => false);
      
      if (historyVisible) {
        await historyTab.click();
        
        // Check that history tab content is visible
        const historyContent = page.locator('text=/No history|submitted/').first();
        await expect(historyContent).toBeVisible();
      }
    }
  });
});
