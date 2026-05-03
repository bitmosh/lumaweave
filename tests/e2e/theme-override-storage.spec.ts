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
