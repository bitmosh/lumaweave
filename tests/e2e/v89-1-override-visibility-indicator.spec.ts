import { test, expect, Page } from "@playwright/test";

type OverrideStorageWindow = Window & {
  __lwThemeOverrideStorage?: {
    setTargetOverride: (targetId: string, tokenPath: string, value: string) => void;
    removeTargetOverride: (targetId: string, tokenPath: string) => void;
    resetAllOverrides: () => void;
    getTargetOverrides: (targetId: string) => unknown[];
  };
};

const enableInspector = async (page: Page): Promise<void> => {
  await page.click("body");
  await page.keyboard.press("Alt+Shift+I");
};

const setTargetOverride = async (page: Page, targetId: string, tokenPath: string, value: string): Promise<void> => {
  await page.evaluate(
    ({ id, path, val }) => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setTargetOverride(id, path, val);
    },
    { id: targetId, path: tokenPath, val: value },
  );
};

const removeTargetOverride = async (page: Page, targetId: string, tokenPath: string): Promise<void> => {
  await page.evaluate(
    ({ id, path }) => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.removeTargetOverride(id, path);
    },
    { id: targetId, path: tokenPath },
  );
};

const resetAllOverrides = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    (window as OverrideStorageWindow).__lwThemeOverrideStorage?.resetAllOverrides();
  });
};

const waitForOverrideIndicatorPoll = async (page: Page): Promise<void> => {
  // Poll interval is 500ms; wait 700ms to ensure at least one tick fires
  await page.waitForTimeout(700);
};

test.describe("v89.1 Override Visibility Indicator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await resetAllOverrides(page);
  });

  test.afterEach(async ({ page }) => {
    await resetAllOverrides(page);
  });

  test("no indicator dot when no target overrides exist", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    // Confirm ghost outlines are visible but no indicator dots
    const ghostOutlines = page.getByTestId("theme-target-ghost-outline");
    await expect(ghostOutlines.first()).toBeVisible();
    await expect(page.locator(".lw-override-indicator-multi")).toHaveCount(0);
  });

  test("indicator appears when target-scoped override is set", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await setTargetOverride(page, "app.shell", "app.background", "#ff0000");
    await waitForOverrideIndicatorPoll(page);

    const indicator = page.getByTestId("override-indicator-app.shell");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "target");
  });

  test("indicator disappears when override is removed", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await setTargetOverride(page, "app.shell", "app.background", "#ff0000");
    await waitForOverrideIndicatorPoll(page);
    await expect(page.getByTestId("override-indicator-app.shell")).toBeVisible();

    await removeTargetOverride(page, "app.shell", "app.background");
    await waitForOverrideIndicatorPoll(page);
    await expect(page.locator('[data-testid="override-indicator-app.shell"]')).toHaveCount(0);
  });

  test("indicator uses correct testid pattern and data-active-scopes", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await setTargetOverride(page, "topbar.root", "text.primary", "#ffffff");
    await waitForOverrideIndicatorPoll(page);

    const indicator = page.getByTestId("override-indicator-topbar.root");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "target");
  });
});
