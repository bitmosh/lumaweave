import { test, expect, Page } from "@playwright/test";

type OverrideStorageWindow = Window & {
  __lwThemeOverrideStorage?: {
    resetAllOverrides: () => void;
    setGlobalOverride: (tokenPath: string, value: string) => void;
    setTargetOverride: (targetId: string, tokenPath: string, value: string) => void;
    setTargetKindOverride: (targetKind: string, tokenPath: string, value: string) => void;
    getAllScopeIndicatorState: (targetId: string) => {
      hasGlobal: boolean;
      hasTarget: boolean;
      hasTargetKind: boolean;
    };
  };
};

const enableInspector = async (page: Page): Promise<void> => {
  await page.click("body");
  await page.keyboard.press("Alt+Shift+I");
};

const waitForPoll = async (page: Page): Promise<void> => {
  await page.waitForTimeout(700);
};

const reset = async (page: Page): Promise<void> => {
  await page.evaluate(() => {
    (window as OverrideStorageWindow).__lwThemeOverrideStorage?.resetAllOverrides();
  });
};

test.describe("v89.3 Multi-scope override indicator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await reset(page);
  });

  test.afterEach(async ({ page }) => {
    await reset(page);
  });

  test("target with no overrides — indicator hidden", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');
    await waitForPoll(page);
    await expect(page.locator(".lw-override-indicator-multi")).toHaveCount(0);
  });

  test("global override only — cream center, no rings", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setGlobalOverride(
        "app.background",
        "#111111",
      );
    });
    await waitForPoll(page);

    // Every target should show an indicator (global applies to all)
    const indicators = page.locator(".lw-override-indicator-multi");
    await expect(indicators.first()).toBeVisible();

    // The app.shell indicator should show global only
    const indicator = page.getByTestId("override-indicator-app.shell");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "global");
  });

  test("target override only — gold ring, no cream", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setTargetOverride(
        "settings.panel",
        "panel.background",
        "#ff0000",
      );
    });
    await waitForPoll(page);

    const indicator = page.getByTestId("override-indicator-settings.panel");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "target");
  });

  test("target-kind override only — cyan ring", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    // settings.panel has surface="settings", but panel targets have surface="panel"
    // Use "panel" kind to match mission-control.panel, settings.panel
    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setTargetKindOverride(
        "panel",
        "panel.background",
        "#00ff00",
      );
    });
    await waitForPoll(page);

    // settings.panel has surface="settings", not "panel". Use mission-control.panel (surface="mission-control")
    // Actually check getAllScopeIndicatorState for a panel-surface target
    const state = await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      return s.getAllScopeIndicatorState("settings.panel");
    });
    // settings.panel surface is "settings", so hasTargetKind checks for kind="settings"
    // The override was set for kind="panel" — this target won't match
    // Use app.shell (surface="shell") with kind="shell" override for isolation
    expect(typeof state.hasTargetKind).toBe("boolean");

    // More targeted: set kind override matching mission-control.panel (surface=mission-control)
    await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.resetAllOverrides();
      s.setTargetKindOverride("mission-control", "panel.background", "#00ff00");
    });
    await waitForPoll(page);

    const indicator = page.getByTestId("override-indicator-mission-control.panel");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "target-kind");
  });

  test("target + target-kind — gold and cyan rings", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      // mission-control.panel has surface="mission-control"
      s.setTargetKindOverride("mission-control", "panel.background", "#00ff00");
      s.setTargetOverride("mission-control.panel", "panel.background", "#ff0000");
    });
    await waitForPoll(page);

    const indicator = page.getByTestId("override-indicator-mission-control.panel");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "target-kind, target");
  });

  test("all three scopes — cream center + cyan + gold rings", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setGlobalOverride("panel.background", "#111111");
      s.setTargetKindOverride("mission-control", "panel.background", "#00ff00");
      s.setTargetOverride("mission-control.panel", "panel.background", "#ff0000");
    });
    await waitForPoll(page);

    const indicator = page.getByTestId("override-indicator-mission-control.panel");
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute("data-active-scopes", "global, target-kind, target");
  });

  test("reactivity — adding target-kind override updates indicator without reload", async ({
    page,
  }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    // Start with target only
    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setTargetOverride(
        "mission-control.panel",
        "panel.background",
        "#ff0000",
      );
    });
    await waitForPoll(page);

    const indicator = page.getByTestId("override-indicator-mission-control.panel");
    await expect(indicator).toHaveAttribute("data-active-scopes", "target");

    // Add target-kind override
    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.setTargetKindOverride(
        "mission-control",
        "panel.background",
        "#00ff00",
      );
    });
    await waitForPoll(page);

    await expect(indicator).toHaveAttribute("data-active-scopes", "target-kind, target");
  });

  test("remove all overrides — indicator disappears", async ({ page }) => {
    await enableInspector(page);
    await page.waitForSelector('[data-testid="theme-target-ghost-outline"]');

    await page.evaluate(() => {
      const s = (window as OverrideStorageWindow).__lwThemeOverrideStorage!;
      s.setTargetOverride("mission-control.panel", "panel.background", "#ff0000");
      s.setTargetKindOverride("mission-control", "panel.background", "#00ff00");
    });
    await waitForPoll(page);
    await expect(page.getByTestId("override-indicator-mission-control.panel")).toBeVisible();

    await page.evaluate(() => {
      (window as OverrideStorageWindow).__lwThemeOverrideStorage?.resetAllOverrides();
    });
    await waitForPoll(page);

    await expect(page.locator('[data-testid="override-indicator-mission-control.panel"]')).toHaveCount(0);
  });
});
