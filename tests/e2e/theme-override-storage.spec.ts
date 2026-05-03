/**
 * Theme Override Storage Tests (v34a)
 * 
 * Tests for global-only theme override storage foundation.
 * Validates canonical token paths, rejects planned/noncanonical paths,
 * and tests reset/remove behavior.
 */

import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __LUMAWEAVE_THEME_OVERRIDE_STORAGE__: {
      validateTokenPath: (tokenPath: string) => { isValid: boolean; error?: string };
      validateTokenValue: (value: unknown) => { isValid: boolean; error?: string };
      loadOverrides: () => { version: string; overrides: unknown[] };
      saveOverrides: (storage: unknown) => void;
      setGlobalOverride: (tokenPath: string, value: string | number) => void;
      getGlobalOverride: (tokenPath: string) => string | number | undefined;
      removeGlobalOverride: (tokenPath: string) => void;
      resetAllOverrides: () => void;
      getAllOverrides: () => unknown[];
      hasOverrides: () => boolean;
      exportGlobalThemeOverrideBundle: () => {
        version: number;
        kind: string;
        scope: string;
        overrides: Array<{ tokenPath: string; value: string | number }>;
      };
    };
  }
}

test.beforeEach(async ({ page }) => {
  // Clear localStorage before each test
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("lumaweave-theme-overrides");
  });
});

test("validate canonical token path", async ({ page }) => {
  await page.goto("/");

  const result = await page.evaluate(() => {
    const { validateTokenPath } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return validateTokenPath("panel.background");
  });

  expect(result).toEqual({ isValid: true });
});

test("reject planned token path", async ({ page }) => {
  await page.goto("/");

  const result = await page.evaluate(() => {
    const { validateTokenPath } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return validateTokenPath("control.background");
  });

  expect(result.isValid).toBe(false);
  expect(result.error).toContain("not a canonical ThemeTokenPath");
});

test("reject noncanonical token string", async ({ page }) => {
  await page.goto("/");

  const result = await page.evaluate(() => {
    const { validateTokenPath } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return validateTokenPath("custom.token.path");
  });

  expect(result.isValid).toBe(false);
  expect(result.error).toContain("not a canonical ThemeTokenPath");
});

test("set and get global override", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, getGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    return getGlobalOverride("panel.background");
  });

  const value = await page.evaluate(() => {
    const { getGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return getGlobalOverride("panel.background");
  });

  expect(value).toBe("#1a1a2e");
});

test("remove global override", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, removeGlobalOverride, getGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    removeGlobalOverride("panel.background");
    return getGlobalOverride("panel.background");
  });

  const value = await page.evaluate(() => {
    const { getGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return getGlobalOverride("panel.background");
  });

  expect(value).toBeUndefined();
});

test("reset all overrides", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, resetAllOverrides, hasOverrides } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    setGlobalOverride("text.primary", "#ffffff");
    resetAllOverrides();
    return hasOverrides();
  });

  const hasOverrides = await page.evaluate(() => {
    const { hasOverrides } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return hasOverrides();
  });

  expect(hasOverrides).toBe(false);
});

test("get all overrides", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, getAllOverrides } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    setGlobalOverride("text.primary", "#ffffff");
    return getAllOverrides();
  });

  const overrides = await page.evaluate(() => {
    const { getAllOverrides } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return getAllOverrides() as Array<{ tokenPath: string; value: string | number }>;
  });

  expect(overrides).toHaveLength(2);
  expect(overrides[0].tokenPath).toBe("panel.background");
  expect(overrides[1].tokenPath).toBe("text.primary");
});

test("reject invalid token value", async ({ page }) => {
  await page.goto("/");

  const result = await page.evaluate(() => {
    const { validateTokenValue } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return validateTokenValue({ invalid: "object" });
  });

  expect(result.isValid).toBe(false);
  expect(result.error).toContain("must be a string or number");
});

test("storage persists across page reloads", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
  });

  await page.reload();

  const value = await page.evaluate(() => {
    const { getGlobalOverride } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return getGlobalOverride("panel.background");
  });

  expect(value).toBe("#1a1a2e");
});

test("export empty override bundle", async ({ page }) => {
  await page.goto("/");

  const bundle = await page.evaluate(() => {
    const { exportGlobalThemeOverrideBundle } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return exportGlobalThemeOverrideBundle();
  });

  expect(bundle.version).toBe(1);
  expect(bundle.kind).toBe("lumaweave.themeOverrideBundle");
  expect(bundle.scope).toBe("global");
  expect(bundle.overrides).toEqual([]);
});

test("export valid global overrides", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, exportGlobalThemeOverrideBundle } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    setGlobalOverride("text.primary", "#ffffff");
    return exportGlobalThemeOverrideBundle();
  });

  const bundle = await page.evaluate(() => {
    const { exportGlobalThemeOverrideBundle } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return exportGlobalThemeOverrideBundle();
  });

  expect(bundle.version).toBe(1);
  expect(bundle.kind).toBe("lumaweave.themeOverrideBundle");
  expect(bundle.scope).toBe("global");
  expect(bundle.overrides).toHaveLength(2);
  expect(bundle.overrides[0].tokenPath).toBe("panel.background");
  expect(bundle.overrides[0].value).toBe("#1a1a2e");
  expect(bundle.overrides[1].tokenPath).toBe("text.primary");
  expect(bundle.overrides[1].value).toBe("#ffffff");
});

test("export filters out invalid token paths", async ({ page }) => {
  await page.goto("/");

  // Manually inject invalid data into localStorage to test sanitization
  await page.evaluate(() => {
    const storage = {
      version: "1.0.0",
      overrides: [
        { tokenPath: "panel.background", value: "#1a1a2e", timestamp: Date.now() },
        { tokenPath: "invalid.token.path", value: "#ff0000", timestamp: Date.now() },
        { tokenPath: "control.background", value: "#00ff00", timestamp: Date.now() }, // planned token
      ],
    };
    localStorage.setItem("lumaweave-theme-overrides", JSON.stringify(storage));
  });

  const bundle = await page.evaluate(() => {
    const { exportGlobalThemeOverrideBundle } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return exportGlobalThemeOverrideBundle();
  });

  expect(bundle.overrides).toHaveLength(1);
  expect(bundle.overrides[0].tokenPath).toBe("panel.background");
  expect(bundle.overrides[0].value).toBe("#1a1a2e");
});

test("export does not mutate storage", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const { setGlobalOverride, getAllOverrides, exportGlobalThemeOverrideBundle } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    setGlobalOverride("panel.background", "#1a1a2e");
    const beforeExport = getAllOverrides();
    exportGlobalThemeOverrideBundle();
    const afterExport = getAllOverrides();
    return { beforeExport, afterExport };
  });

  const { beforeExport, afterExport } = await page.evaluate(() => {
    const { getAllOverrides } = window.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__;
    return {
      beforeExport: getAllOverrides(),
      afterExport: getAllOverrides(),
    };
  });

  expect(afterExport).toEqual(beforeExport);
});
