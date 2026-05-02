import { test, expect } from "@playwright/test";
import { runThemeTokenGovernanceChecks, assertThemeTokenGovernanceClean } from "../../src/themes/themeTokenGovernance";

test.describe("Theme Token Governance", () => {
  test("active token bindings and presets comply with canonical vocabulary", () => {
    const result = runThemeTokenGovernanceChecks();

    expect(result.invalidBindings, "Active token bindings should use canonical ThemeTokenPath values")
      .toEqual([]);

    expect(result.plannedTokenBindings, "Active bindings must not reference planned-only token paths")
      .toEqual([]);

    expect(result.plannedTargetsWithBindings, "Planned targets should remain placeholders without bindings")
      .toEqual([]);

    expect(result.presetMissingTokenPaths, "Built-in presets must resolve every canonical token path")
      .toEqual([]);
  });

  test("governance helper throws when violations exist", () => {
    expect(() => assertThemeTokenGovernanceClean()).not.toThrow();
  });
});
