/**
 * v97a: Command registry unit tests
 *
 * Tests that commandRegistry is populated with the expected entries from
 * command-registry.entries.ts. Pure function tests — no browser required.
 */

import { test, expect } from "@playwright/test";
import { commandRegistry } from "../../src/control-plane/commands/command-registry";
import "../../src/control-plane/commands/command-registry.entries";

test.describe("command registry", () => {
  test("has 15 entries", () => {
    expect(commandRegistry.getAll()).toHaveLength(15);
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
    expect(ids).toContain("settings.open");
    expect(ids).toContain("graph.fit");
    expect(ids).toContain("graph.resetView");
    expect(ids).toContain("inspector.toggle");
    expect(ids).toContain("inspector.pinTarget");
  });

  test("Export Theme Override Bundle entry exists", () => {
    const cmd = commandRegistry.getAll().find((c) => c.id === "theme.exportBundle");
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe("Export Theme Override Bundle");
    expect(cmd?.category).toBe("Theme");
  });

  test("Toggle Theme Target Inspector entry exists", () => {
    const cmd = commandRegistry
      .getAll()
      .find((c) => c.id === "inspector.toggleThemeTargetInspector");
    expect(cmd).toBeDefined();
    expect(cmd?.label).toBe("Toggle Theme Target Inspector");
    expect(cmd?.category).toBe("View");
  });
});
