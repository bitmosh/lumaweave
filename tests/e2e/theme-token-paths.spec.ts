// SPDX-License-Identifier: Apache-2.0
import { test, expect } from "@playwright/test";
import { themeTokenMap } from "../../src/themes/themeTokens";
import {
  CANONICAL_THEME_TOKEN_PATHS,
  resolveThemeTokenPath,
} from "../../src/themes/themeTokenPaths";

test.describe("Theme Token Path Map", () => {
  test("canonical paths resolve for every built-in preset", () => {
    for (const [themeId, tokens] of Object.entries(themeTokenMap)) {
      for (const path of CANONICAL_THEME_TOKEN_PATHS) {
        const value = resolveThemeTokenPath(tokens, path);
        expect(value, `${themeId} missing ${path}`).not.toBeUndefined();
        expect(value, `${themeId} missing ${path}`).not.toBeNull();
        if (typeof value === "string") {
          expect(value.length, `${themeId} ${path} should not be empty`).toBeGreaterThan(0);
        }
      }
    }
  });
});
