// SPDX-License-Identifier: Apache-2.0
/**
 * v97a/v97b: Command registry unit tests
 *
 * Tests that commandRegistry is populated with the expected entries from
 * command-registry.entries.ts. Pure function tests — no browser required.
 */

import { test, expect } from "@playwright/test";
import { commandRegistry } from "../../src/control-plane/commands/command-registry";
import "../../src/control-plane/commands/command-registry.entries";

test.describe("command registry", () => {
  test("has 32 entries", () => {
    expect(commandRegistry.getAll()).toHaveLength(32);
  });

  test("all entry IDs are unique", () => {
    const ids = commandRegistry.getAll().map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("all entries have non-empty labels", () => {
    for (const cmd of commandRegistry.getAll()) {
      expect(cmd.label.trim().length).toBeGreaterThan(0);
    }
  });

  test("all entries have non-empty categories", () => {
    for (const cmd of commandRegistry.getAll()) {
      expect(cmd.category.trim().length).toBeGreaterThan(0);
    }
  });

  test("all entries have an execute function", () => {
    for (const cmd of commandRegistry.getAll()) {
      expect(typeof cmd.execute).toBe("function");
    }
  });

  test("core commands are present", () => {
    const ids = commandRegistry.getAll().map((c) => c.id);
    expect(ids).toContain("view.openSettings");
    expect(ids).toContain("graph.fit");
    expect(ids).toContain("graph.resetView");
    expect(ids).toContain("view.toggleInspector");
    expect(ids).toContain("inspector.pinTarget");
  });

  test("Export Theme Override Bundle entry exists", () => {
    const cmd = commandRegistry.getAll().find((c) => c.id === "theme.exportBundle");
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe("Export Theme Override Bundle");
    expect(cmd?.category).toBe("theme");
  });

  test("Toggle Theme Target Inspector entry exists", () => {
    const cmd = commandRegistry
      .getAll()
      .find((c) => c.id === "inspector.toggleThemeTargetInspector");
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe("Toggle Theme Target Inspector");
    expect(cmd?.category).toBe("inspector");
  });

  test("destructive commands are flagged", () => {
    const cmd = commandRegistry.getAll().find((c) => c.id === "debug.clearAllOverrides");
    expect(cmd).toBeDefined();
    expect(cmd?.destructive).toBe(true);
  });

  test("disabled commands have enabled returning false", () => {
    const cmd = commandRegistry.getAll().find((c) => c.id === "theme.openWorkshop");
    expect(cmd).toBeDefined();
    expect(cmd?.enabled?.()).toBe(false);
  });

  test("getById returns the correct entry", () => {
    const cmd = commandRegistry.getById("graph.fit");
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe("Fit Graph to View");
  });

  test("getById returns undefined for unknown id", () => {
    expect(commandRegistry.getById("nonexistent.command")).toBeUndefined();
  });
});
