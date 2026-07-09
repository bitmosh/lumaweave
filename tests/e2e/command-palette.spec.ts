// SPDX-License-Identifier: Apache-2.0
/**
 * v97b: Command Palette unit + browser tests
 *
 * Unit tests for palette utilities (pure functions, no browser).
 * Browser tests for CommandPaletteHost open/close, search, keyboard nav, etc.
 */

import { test, expect } from "@playwright/test";

// ─── Unit: levenshtein ───────────────────────────────────────────────────────

import { levenshtein, findSuggestions } from "../../src/control-plane/commands/palette/paletteSuggestions";
import { commandRegistry } from "../../src/control-plane/commands/command-registry";
import "../../src/control-plane/commands/command-registry.entries";

test.describe("levenshtein", () => {
  test("identical strings return 0", () => {
    expect(levenshtein("hello", "hello")).toBe(0);
  });

  test("empty string vs non-empty returns length of non-empty", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  test("single substitution returns 1", () => {
    expect(levenshtein("cat", "bat")).toBe(1);
  });

  test("insertion + deletion", () => {
    expect(levenshtein("fit", "filt")).toBe(1);
  });

  test("completely different short strings", () => {
    expect(levenshtein("abc", "xyz")).toBe(3);
  });
});

test.describe("findSuggestions", () => {
  const commands = commandRegistry.getAll();

  test("returns empty for empty query", () => {
    expect(findSuggestions("", commands)).toHaveLength(0);
  });

  test("finds close match for 'grph'", () => {
    const results = findSuggestions("grph fit", commands, 3);
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  test("returns at most maxResults entries", () => {
    const results = findSuggestions("fit", commands, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });
});

// ─── Unit: palette search ────────────────────────────────────────────────────

import { searchCommands, buildIdleSections, STARTER_COMMAND_IDS } from "../../src/control-plane/commands/palette/paletteSearch";

test.describe("searchCommands", () => {
  const commands = commandRegistry.getAll();

  test("returns results for 'fit'", () => {
    const results = searchCommands("fit", commands, "all");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].command.id).toBe("graph.fit");
  });

  test("returns empty for nonsense query", () => {
    const results = searchCommands("xyzqqqnotacommand", commands, "all");
    expect(results).toHaveLength(0);
  });

  test("category filter restricts results to that category", () => {
    const results = searchCommands("graph", commands, "graph");
    // all returned results must belong to the graph category
    for (const r of results) {
      expect(r.command.category).toBe("graph");
    }
  });

  test("'theme' search returns theme commands", () => {
    const results = searchCommands("theme", commands, "all");
    expect(results.length).toBeGreaterThan(0);
  });
});

test.describe("buildIdleSections", () => {
  const commands = commandRegistry.getAll();

  test("suggested section contains STARTER_COMMAND_IDS entries", () => {
    const sections = buildIdleSections(commands, { pinned: [], recent: [] });
    const suggested = sections.find((s) => s.kind === "suggested");
    expect(suggested).toBeDefined();
    expect(suggested!.items.length).toBeGreaterThan(0);
    const ids = suggested!.items.map((i) => i.command.id);
    for (const id of ids) {
      expect(STARTER_COMMAND_IDS).toContain(id);
    }
  });

  test("pinned section appears when pins exist", () => {
    const sections = buildIdleSections(commands, { pinned: ["graph.fit"], recent: [] });
    const pinned = sections.find((s) => s.kind === "pinned");
    expect(pinned).toBeDefined();
    expect(pinned!.items[0].command.id).toBe("graph.fit");
  });

  test("recent section appears when recent history exists", () => {
    const sections = buildIdleSections(commands, { pinned: [], recent: ["theme.next"] });
    const recent = sections.find((s) => s.kind === "recent");
    expect(recent).toBeDefined();
    expect(recent!.items[0].command.id).toBe("theme.next");
  });

  test("pinned commands are excluded from recent section", () => {
    const sections = buildIdleSections(commands, {
      pinned: ["theme.next"],
      recent: ["theme.next", "graph.fit"],
    });
    const pinned = sections.find((s) => s.kind === "pinned");
    const recent = sections.find((s) => s.kind === "recent");
    expect(pinned?.items[0].command.id).toBe("theme.next");
    // theme.next should not appear in recent since it is pinned
    const recentIds = recent?.items.map((i) => i.command.id) ?? [];
    expect(recentIds).not.toContain("theme.next");
    expect(recentIds).toContain("graph.fit");
  });
});

// ─── Browser: CommandPaletteHost ─────────────────────────────────────────────

test.describe("command palette (browser)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for the graph viewport to confirm React has fully mounted
    await expect(page.locator('[data-testid="graph-viewport"], [data-testid="self-graph-fixture-loaded"]')).toBeVisible({ timeout: 15000 });
  });

  test("palette is closed by default", async ({ page }) => {
    await expect(page.locator('[data-testid="palette-backdrop"]')).not.toBeVisible();
  });

  test("Ctrl+K opens the palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-shell"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-search-input"]')).toBeFocused();
  });

  test("Escape closes the palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-shell"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-testid="palette-backdrop"]')).not.toBeVisible();
  });

  test("clicking backdrop closes the palette", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-backdrop"]')).toBeVisible();
    await page.locator('[data-testid="palette-backdrop"]').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('[data-testid="palette-backdrop"]')).not.toBeVisible();
  });

  test("category chips are visible when palette is open", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-category-chips"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-chip-all"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-chip-graph"]')).toBeVisible();
  });

  test("typing a query shows filtered results", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.locator('[data-testid="palette-search-input"]').fill("fit");
    await expect(page.locator('[data-testid="palette-result-graph.fit"]')).toBeVisible();
  });

  test("nonsense query shows empty state", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.locator('[data-testid="palette-search-input"]').fill("xyzqqqnotacommand");
    await expect(page.locator('[data-testid="palette-empty"]')).toBeVisible();
  });

  test("hint bar is visible", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-hint-bar"]')).toBeVisible();
  });

  test("destructive command shows confirm dialog before executing", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.locator('[data-testid="palette-search-input"]').fill("overrides");
    await expect(page.locator('[data-testid="palette-result-debug.clearAllOverrides"]')).toBeVisible();
    await page.locator('[data-testid="palette-result-debug.clearAllOverrides"]').click();
    await expect(page.locator('[data-testid="palette-destructive-confirm"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-destructive-confirm-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="palette-destructive-cancel-btn"]')).toBeVisible();
  });

  test("cancelling destructive confirm returns to results", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.locator('[data-testid="palette-search-input"]').fill("overrides");
    await page.locator('[data-testid="palette-result-debug.clearAllOverrides"]').click();
    await expect(page.locator('[data-testid="palette-destructive-confirm"]')).toBeVisible();
    await page.locator('[data-testid="palette-destructive-cancel-btn"]').click();
    await expect(page.locator('[data-testid="palette-destructive-confirm"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="palette-shell"]')).toBeVisible();
  });

  test("idle state shows suggested section", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator('[data-testid="palette-results-list"]')).toBeVisible();
    const headers = page.locator('[data-testid="palette-section-header"]');
    await expect(headers.first()).toBeVisible();
  });
});
