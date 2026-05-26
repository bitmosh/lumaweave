/**
 * v97a: Hotkey registry unit tests
 *
 * Tests that hotkeyRegistry is populated with the expected entries from
 * hotkey-registry.entries.ts and that hotkey-utils works correctly.
 * Pure function tests — no browser required.
 */

import { test, expect } from "@playwright/test";
import { hotkeyRegistry } from "../../src/control-plane/commands/hotkey-registry";
import "../../src/control-plane/commands/hotkey-registry.entries";
import { formatBinding } from "../../src/control-plane/commands/hotkey-utils";

test.describe("hotkey registry", () => {
  test("has 11 entries total", () => {
    expect(hotkeyRegistry.getAll()).toHaveLength(11);
  });

  test("has 6 active entries", () => {
    expect(hotkeyRegistry.getActive()).toHaveLength(6);
  });

  test("has 3 native entries", () => {
    expect(hotkeyRegistry.getNative()).toHaveLength(3);
  });

  test("has 2 banned entries", () => {
    expect(hotkeyRegistry.getBanned()).toHaveLength(2);
  });

  test("Alt+Shift+I maps to inspector.toggle", () => {
    const entry = hotkeyRegistry.getActive().find((e) => e.id === "inspector.toggle");
    expect(entry).toBeDefined();
    expect(formatBinding(entry!.binding)).toBe("Alt+Shift+I");
    expect(entry!.label).toBe("Inspector Toggle");
  });

  test("Alt+Shift+P maps to inspector.pinTarget", () => {
    const entry = hotkeyRegistry.getActive().find((e) => e.id === "inspector.pinTarget");
    expect(entry).toBeDefined();
    expect(formatBinding(entry!.binding)).toBe("Alt+Shift+P");
    expect(entry!.label).toBe("Pin/Unpin Target");
  });

  test("formatBinding produces canonical modifier order", () => {
    expect(formatBinding({ modifiers: ["Shift", "Alt"], key: "I" })).toBe("Alt+Shift+I");
    expect(formatBinding({ modifiers: ["Ctrl", "Shift"], key: "I" })).toBe("Ctrl+Shift+I");
    expect(formatBinding({ modifiers: ["Ctrl"], key: "," })).toBe("Ctrl+,");
    expect(formatBinding({ modifiers: [], key: "F" })).toBe("F");
  });
});
