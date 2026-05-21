/**
 * Palette Pipeline Runtime
 *
 * Two accessors for palette consumption:
 * 1. useActiveThemePrimitives() — reactive hook for active theme colors
 * 2. getTargetBindings() — sync function for target token bindings
 */

import { useSettingsStore } from "../control-plane/settings/settings.store";
import { themePrimitives } from "./tokenPrimitives";
import { getThemeTargetById } from "./themeTargetRegistry";
import type { ThemeId } from "../control-plane/settings/settings.schema";

export interface ActiveThemePrimitive {
  path: string;
  hex: string;
  family: string;
  shade: number;
}

export interface TargetBinding {
  property: string;
  tokenPath: string;
  label?: string;
}

/**
 * Reactive hook returning the active theme's Tier 1 primitives,
 * in canonical sort order (by family alphabetical, then shade ascending).
 *
 * Re-renders consumer when the user switches themes.
 *
 * Canonical family order: corona, cream, flare, fuchsia, gold, green,
 * magenta, purple, red, void (alphabetical).
 * Within family: shades in ascending numeric order.
 */
export function useActiveThemePrimitives(): ActiveThemePrimitive[] {
  const themeId = useSettingsStore((s) => s.settings.appearance.theme);
  return getActiveThemePrimitivesForTheme(themeId);
}

/**
 * Internal: extract and flatten primitives for a specific theme.
 * Separated from hook so tests can call it directly with any themeId.
 */
function getActiveThemePrimitivesForTheme(themeId: ThemeId): ActiveThemePrimitive[] {
  const prims = themePrimitives[themeId];
  if (!prims || !prims.color) return [];

  const result: ActiveThemePrimitive[] = [];

  // Iterate families in canonical order
  const familyOrder = ["corona", "cream", "flare", "fuchsia", "gold", "green", "magenta", "purple", "red", "void"];

  for (const family of familyOrder) {
    const familyKey = family as keyof typeof prims.color;
    const shades = prims.color[familyKey];

    if (!shades) continue;

    // Collect all shades for this family
    const shadeEntries: Array<[number, string]> = [];
    for (const [shadeStr, hex] of Object.entries(shades)) {
      const shade = Number(shadeStr);
      if (!isNaN(shade)) {
        shadeEntries.push([shade, hex as string]);
      }
    }

    // Sort by shade ascending
    shadeEntries.sort((a, b) => a[0] - b[0]);

    // Add to result
    for (const [shade, hex] of shadeEntries) {
      result.push({
        path: `color.${family}.${shade}`,
        hex,
        family,
        shade,
      });
    }
  }

  return result;
}

/**
 * Returns the token bindings declared by a registered target.
 * Returns [] if the target is not registered.
 *
 * Synchronous — not reactive. Target bindings are configured at
 * registry build time and don't change at runtime.
 */
export function getTargetBindings(targetId: string): TargetBinding[] {
  const entry = getThemeTargetById(targetId);
  if (!entry) return [];

  const result: TargetBinding[] = [];

  // Iterate the target's tokenBindings map
  // Shape: Partial<Record<ThemeEditableProperty, ThemeTokenPath>>
  for (const [property, tokenPath] of Object.entries(entry.tokenBindings)) {
    if (tokenPath) {
      result.push({
        property,
        tokenPath,
        // label is optional; can be added in future if label registry exists
      });
    }
  }

  return result;
}
