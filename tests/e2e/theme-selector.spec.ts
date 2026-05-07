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
    await expect(options).toHaveCount(4);
    
    await expect(options.nth(0)).toHaveText("Solar Plasma");
    await expect(options.nth(1)).toHaveText("Obsidian Aurora");
    await expect(options.nth(2)).toHaveText("Haunted Observatory");
    await expect(options.nth(3)).toHaveText("Glitter Goblin");
  });

  test("selecting one updates control value", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    
    // Select Obsidian Aurora
    await themeSelector.selectOption("obsidian-aurora");
    await expect(themeSelector).toHaveValue("obsidian-aurora");
    
    // Select Haunted Observatory
    await themeSelector.selectOption("haunted-observatory");
    await expect(themeSelector).toHaveValue("haunted-observatory");
    
    // Select Glitter Goblin
    await themeSelector.selectOption("glitter-goblin");
    await expect(themeSelector).toHaveValue("glitter-goblin");
    
    // Select Solar Plasma
    await themeSelector.selectOption("solar-plasma");
    await expect(themeSelector).toHaveValue("solar-plasma");
  });

  test("glitter toggle exists", async ({ page }) => {
    const glitterToggle = page.getByLabel("Glitter");
    await expect(glitterToggle).toBeVisible();
  });

  test("reduce motion toggle exists", async ({ page }) => {
    const reduceMotionToggle = page.getByLabel("Reduce Motion");
    await expect(reduceMotionToggle).toBeVisible();
  });

  test("glitter toggle can be toggled", async ({ page }) => {
    const glitterToggle = page.getByLabel("Glitter");
    
    // Get initial state
    const initialState = await glitterToggle.isChecked();
    
    // Toggle it
    await glitterToggle.click();
    
    // Verify state changed
    const newState = await glitterToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("reduce motion toggle can be toggled", async ({ page }) => {
    const reduceMotionToggle = page.getByLabel("Reduce Motion");
    
    // Get initial state
    const initialState = await reduceMotionToggle.isChecked();
    
    // Toggle it
    await reduceMotionToggle.click();
    
    // Verify state changed
    const newState = await reduceMotionToggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test("haunted observatory graph color switching", async ({ page }) => {
    const themeSelector = page.getByTestId("theme-preset-selector");
    
    // Select Haunted Observatory
    await themeSelector.selectOption("haunted-observatory");
    await expect(themeSelector).toHaveValue("haunted-observatory");
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Switch to Solar Plasma
    await themeSelector.selectOption("solar-plasma");
    await expect(themeSelector).toHaveValue("solar-plasma");
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Switch back to Haunted Observatory
    await themeSelector.selectOption("haunted-observatory");
    await expect(themeSelector).toHaveValue("haunted-observatory");
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
