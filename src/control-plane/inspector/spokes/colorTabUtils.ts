// SPDX-License-Identifier: Apache-2.0
/**
 * Color Tab Utilities (v86d.3b)
 *
 * Helper functions for ColorTab functionality:
 * - Recent swatches FIFO (localStorage)
 * - Color commit routing (target vs global scope)
 * - Apply-to-kind one-shot iteration
 */

import { setTargetOverride, setGlobalOverride } from "../../../themes/themeOverrideStorage";
import type { ThemeTokenPath } from "../../../themes/themeTokenPaths";
import { getThemeTargetsBySurface } from "../../../themes/themeTargetRegistry";

const RECENT_KEY = "ins-recent-colors";
const MAX_RECENT = 8;

/**
 * Get recent swatches from localStorage (FIFO, capped at 8)
 */
export function getRecentSwatches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

/**
 * Add a swatch to recent list (prepend, remove duplicates, cap at 8)
 */
export function pushRecentSwatch(hex: string): void {
  try {
    const current = getRecentSwatches();
    const filtered = current.filter((h) => h !== hex);
    const updated = [hex, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

/**
 * Commit a color to a binding (routes by scope)
 */
export function commitColorToBinding(
  targetId: string,
  tokenPath: ThemeTokenPath,
  hex: string,
  scope: "this" | "all",
): void {
  if (scope === "this") {
    setTargetOverride(targetId, tokenPath, hex);
  } else {
    setGlobalOverride(tokenPath, hex);
  }
}

/**
 * Apply a color to all targets matching a surface kind (one-shot iteration)
 */
export function applyToKind(kind: string, tokenPath: ThemeTokenPath, hex: string): void {
  const matching = getThemeTargetsBySurface(kind as any);
  for (const target of matching) {
    setTargetOverride(target.themeTargetId, tokenPath, hex);
  }
}

/**
 * Validate hex color format (#RGB, #RRGGBB, or #RRGGBBAA)
 */
export function isValidHex(hex: string): boolean {
  if (!hex.startsWith("#")) return false;
  const digits = hex.slice(1);
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(digits);
}
