/**
 * v97c.1: i18n scaffolding + topbar migration tests
 *
 * Unit tests: t() function behavior (key lookup, interpolation, fallback).
 * Browser tests: html[lang/dir] attributes, topbar strings from manifest.
 */

import { test, expect } from "@playwright/test";

// ── Unit: t() function ──────────────────────────────────────────────────────

import { t } from "../../src/i18n/t";
import { initializeLocale } from "../../src/i18n/locale";

test.describe("i18n: t() function", () => {
  test.beforeAll(() => {
    initializeLocale("en");
  });

  test("returns correct string for a known key", () => {
    expect(t("topbar.brand.name")).toBe("LumaWeave");
  });

  test("returns correct string for a nested key", () => {
    expect(t("topbar.brand.subtitle")).toBe("PANORAMA ATLAS");
  });

  test("interpolates {var} placeholders", () => {
    expect(t("topbar.settings.title", { kbd: "Ctrl+," })).toBe("Settings · Ctrl+,");
  });

  test("leaves missing var placeholder intact", () => {
    expect(t("topbar.settings.title")).toBe("Settings · {kbd}");
  });

  test("falls back to key on missing key", () => {
    expect(t("topbar.nonexistent.key")).toBe("topbar.nonexistent.key");
  });

  test("falls back to key when intermediate node is missing", () => {
    expect(t("totally.unknown")).toBe("totally.unknown");
  });
});

// ── Browser: html attributes + topbar strings ───────────────────────────────

test.describe("i18n: browser locale attributes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator('[data-testid="graph-viewport"], [data-testid="self-graph-fixture-loaded"]')
    ).toBeVisible({ timeout: 15000 });
  });

  test("html[lang] is set to 'en' after app loads", async ({ page }) => {
    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe("en");
  });

  test("html[dir] is set to 'ltr' after app loads (RTL gate)", async ({ page }) => {
    const dir = await page.evaluate(() => document.documentElement.dir);
    expect(dir).toBe("ltr");
  });

  test("settings button aria-label matches manifest", async ({ page }) => {
    const btn = page.locator('[data-testid="topbar-settings-button"]');
    await expect(btn).toHaveAttribute("aria-label", "Open settings");
  });

  test("wordmark renders brand name, subtitle, and tagline from manifest", async ({ page }) => {
    await expect(page.locator(".lw-wordmark-name")).toHaveText("LumaWeave");
    await expect(page.locator(".lw-wordmark-sub")).toHaveText("PANORAMA ATLAS");
    await expect(page.locator(".lw-wordmark-tag")).toHaveText("Map. Understand. Build.");
  });

  test("status cluster labels come from manifest", async ({ page }) => {
    const cluster = page.locator(".lw-status-cluster");
    const keys = cluster.locator(".lw-cluster-key");
    await expect(keys.nth(0)).toHaveText("graph");
    await expect(keys.nth(1)).toHaveText("layout");
    await expect(keys.nth(2)).toHaveText("fps");
  });
});
