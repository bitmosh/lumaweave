import { test, expect } from "@playwright/test";

test.describe("v88c canonical CSS variables", () => {
  test("canonical variables are set on app shell element", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      // AppShell writes CSS vars to <main data-lw-theme-target="app.shell">
      const shell = document.querySelector('main[data-lw-theme-target="app.shell"]');
      if (!shell) return null;
      const computed = getComputedStyle(shell);
      return {
        appBackground: computed.getPropertyValue("--lw-app-background").trim(),
        panelBackground: computed.getPropertyValue("--lw-panel-background").trim(),
        panelBorder: computed.getPropertyValue("--lw-panel-border").trim(),
        textPrimary: computed.getPropertyValue("--lw-text-primary").trim(),
        textMuted: computed.getPropertyValue("--lw-text-muted").trim(),
        accent: computed.getPropertyValue("--lw-accent").trim(),
      };
    });

    expect(result).not.toBeNull();
    expect(result!.appBackground).toBeTruthy();
    expect(result!.panelBackground).toBeTruthy();
    expect(result!.panelBorder).toBeTruthy();
    expect(result!.textPrimary).toBeTruthy();
    expect(result!.textMuted).toBeTruthy();
    expect(result!.accent).toBeTruthy();
  });

  test("legacy variables are no longer written", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const result = await page.evaluate(() => {
      // Check the element where AppShell writes inline styles
      const shell = document.querySelector('main[data-lw-theme-target="app.shell"]') as HTMLElement | null;
      if (!shell) return null;
      return {
        legacyPanelBg: shell.style.getPropertyValue("--lw-panel-bg"),
        legacyAppBg: shell.style.getPropertyValue("--lw-app-bg"),
      };
    });

    expect(result).not.toBeNull();
    expect(result!.legacyPanelBg).toBe("");
    expect(result!.legacyAppBg).toBe("");
  });

  test("theme switch updates canonical variables", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const before = await page.evaluate(() => {
      const shell = document.querySelector('main[data-lw-theme-target="app.shell"]');
      if (!shell) return "";
      return getComputedStyle(shell).getPropertyValue("--lw-panel-background").trim();
    });

    await page.locator('[data-testid="theme-preset-selector"]').selectOption("agartha-dream");
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const shell = document.querySelector('main[data-lw-theme-target="app.shell"]');
      if (!shell) return "";
      return getComputedStyle(shell).getPropertyValue("--lw-panel-background").trim();
    });

    expect(before).not.toBe("");
    expect(after).not.toBe("");
    expect(before).not.toBe(after);
  });
});
