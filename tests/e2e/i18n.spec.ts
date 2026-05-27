/**
 * v97c.2: i18n full sweep — per-surface assertions
 *
 * Unit tests: t() function + manifest key coverage by surface.
 * Browser tests: html[lang/dir], topbar, settings panel, command palette.
 */

import { test, expect } from "@playwright/test";
import { clearTiles } from "./helpers/tiles";

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

// ── Unit: settings panel manifest keys ──────────────────────────────────────

test.describe("i18n: settings panel manifest keys", () => {
  test.beforeAll(() => {
    initializeLocale("en");
  });

  test("settings.panel.title resolves", () => {
    expect(t("settings.panel.title")).toBe("Settings");
  });

  test("settings.panel.buttons.dockLeft resolves", () => {
    expect(t("settings.panel.buttons.dockLeft")).toBe("Dock left");
  });

  test("settings.panel.search.placeholder resolves", () => {
    expect(t("settings.panel.search.placeholder")).toMatch(/Search settings/);
  });

  test("settings.panel.statusBar.positions.floating resolves", () => {
    expect(t("settings.panel.statusBar.positions.floating")).toBe("floating");
  });

  test("settings.panel.categories.theme.label resolves", () => {
    expect(t("settings.panel.categories.theme.label")).toBe("Theme");
  });
});

// ── Unit: inspector spokes manifest keys ────────────────────────────────────

test.describe("i18n: inspector spokes manifest keys", () => {
  test.beforeAll(() => {
    initializeLocale("en");
  });

  test("inspector.back resolves", () => {
    expect(t("inspector.back")).toBe("← back");
  });

  test("inspector.spokes.color.label resolves", () => {
    expect(t("inspector.spokes.color.label")).toBe("Color");
  });

  test("inspector.spokes.geometry.presets.sun resolves", () => {
    expect(t("inspector.spokes.geometry.presets.sun")).toBe("Sun");
  });

  test("inspector.spokes.history.reset resolves", () => {
    expect(t("inspector.spokes.history.reset")).toBe("Reset");
  });

  test("inspector.spokes.placeholder.coming resolves", () => {
    expect(t("inspector.spokes.placeholder.coming")).toBe("Coming soon");
  });
});

// ── Unit: palette + commandDeck manifest keys ────────────────────────────────

test.describe("i18n: palette manifest keys", () => {
  test.beforeAll(() => {
    initializeLocale("en");
  });

  test("palette.searchPlaceholder resolves", () => {
    expect(t("palette.searchPlaceholder")).toBe("Type a command...");
  });

  test("palette.noResults resolves", () => {
    expect(t("palette.noResults")).toBe("No results");
  });

  test("palette.categories.all resolves", () => {
    expect(t("palette.categories.all")).toBe("All");
  });

  test("palette.hintNavigate resolves", () => {
    expect(t("palette.hintNavigate")).toBe("navigate");
  });

  test("palette.confirmButton resolves", () => {
    expect(t("palette.confirmButton")).toBe("Confirm");
  });

  test("commandDeck.title resolves", () => {
    expect(t("commandDeck.title")).toBe("Command Deck");
  });
});

// ── Unit: commands manifest keys ────────────────────────────────────────────

test.describe("i18n: commands manifest keys", () => {
  test.beforeAll(() => {
    initializeLocale("en");
  });

  test("commands.view_openSettings resolves", () => {
    expect(t("commands.view_openSettings")).toBe("Open Settings");
  });

  test("commands.graph_fit resolves", () => {
    expect(t("commands.graph_fit")).toBe("Fit Graph to View");
  });

  test("commands.debug_clearAllOverrides resolves", () => {
    expect(t("commands.debug_clearAllOverrides")).toBe("Clear All Theme Overrides");
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

  test("wordmark renders brand name from manifest", async ({ page }) => {
    await expect(page.locator(".lw-wordmark-name")).toHaveText("LumaWeave");
  });

  test("status cluster labels come from manifest", async ({ page }) => {
    const cluster = page.locator(".lw-status-cluster");
    const keys = cluster.locator(".lw-cluster-key");
    await expect(keys.nth(0)).toHaveText("graph");
    await expect(keys.nth(1)).toHaveText("layout");
    await expect(keys.nth(2)).toHaveText("fps");
  });
});

// ── Browser: settings panel i18n ────────────────────────────────────────────

test.describe("i18n: settings panel browser strings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator('[data-testid="topbar-settings-button"]').click();
    await expect(page.getByTestId("settings-panel-root")).toBeVisible({ timeout: 5000 });
  });

  test("dock-left button aria-label comes from manifest", async ({ page }) => {
    const btn = page.getByTestId("settings-panel-dock-left");
    await expect(btn).toHaveAttribute("aria-label", "Dock left");
  });

  test("close button aria-label comes from manifest", async ({ page }) => {
    const btn = page.getByTestId("settings-panel-close");
    await expect(btn).toHaveAttribute("aria-label", "Close");
  });

  test("search input placeholder comes from manifest", async ({ page }) => {
    const input = page.getByTestId("settings-panel-search");
    await expect(input).toHaveAttribute("placeholder", /Search settings/);
  });
});

// ── Browser: command palette i18n ───────────────────────────────────────────

test.describe("i18n: command palette browser strings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await clearTiles(page);
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("palette-shell")).toBeVisible({ timeout: 5000 });
  });

  test("search input placeholder comes from manifest", async ({ page }) => {
    const input = page.getByTestId("palette-search-input");
    await expect(input).toHaveAttribute("placeholder", "Type a command...");
  });

  test("hint bar renders manifest strings", async ({ page }) => {
    await expect(page.getByTestId("palette-hint-bar")).toContainText("navigate");
    await expect(page.getByTestId("palette-hint-bar")).toContainText("close");
  });

  test("category chip 'All' comes from manifest", async ({ page }) => {
    const allChip = page.getByTestId("palette-chip-all");
    await expect(allChip).toHaveText("All");
  });
});
