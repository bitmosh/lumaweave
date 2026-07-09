// SPDX-License-Identifier: Apache-2.0
/**
 * Theme Application Helpers
 * 
 * This file provides helper functions for applying theme presets and tokens.
 */

import type { ThemePreset } from "./theme.types";
import { builtInThemePresets } from "./themePresets";
import { getThemeRuntimeTokens } from "./themeTokens";

/**
 * Get a theme preset by ID
 */
export function getThemePreset(presetId: string): ThemePreset | undefined {
  return builtInThemePresets.find((preset) => preset.id === presetId);
}

/**
 * Get theme runtime tokens by theme ID
 * This is a re-export from themeTokens for convenience
 */
export { getThemeRuntimeTokens };
