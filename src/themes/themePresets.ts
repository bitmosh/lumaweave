/**
 * Theme Presets Registry
 * 
 * This file contains the built-in theme presets for LumaWeave.
 */

import type { ThemePreset, ThemePresetRegistry } from "./theme.types";
import { getAccessibilityProfile } from "./themeAccessibilityProfile";
import "./themeThumbnail"; // side-effect: registers window.__lwThemeThumbnail dev probe

export const builtInThemePresets: ThemePreset[] = [
  {
    id: "solar-plasma",
    name: "Solar Plasma",
    description: "Dark sci-fi with cyan and gold plasma",
    builtIn: true,
    themeId: "solar-plasma",
    tags: ["dark", "sci-fi"],
    notes: "Default LumaWeave theme",
    assetRefs: [], // v88 Workshop will populate
  },
  {
    id: "obsidian-aurora",
    name: "Obsidian Aurora",
    description: "Dark crystalline aurora borealis",
    builtIn: true,
    themeId: "obsidian-aurora",
    tags: ["dark", "aurora"],
    notes: "Inspired by northern lights over dark stone",
    assetRefs: [], // v88 Workshop will populate
  },
  {
    id: "midnight-loom",
    name: "Midnight Loom",
    description: "Dark warm gold candlelight",
    builtIn: true,
    themeId: "midnight-loom",
    tags: ["dark", "warm"],
    notes: "Cozy candlelit workspace",
    assetRefs: [], // v88 Workshop will populate
  },
  {
    id: "void-circuit",
    name: "Void Circuit",
    description: "Dark cyberpunk neon",
    builtIn: true,
    themeId: "void-circuit",
    tags: ["dark", "cyberpunk"],
    notes: "High-contrast neon aesthetic",
    assetRefs: [], // v88 Workshop will populate
  },
  {
    id: "agartha-dream",
    name: "Agartha Dream",
    description: "Light pastel dreamy",
    builtIn: true,
    themeId: "agartha-dream",
    tags: ["light", "pastel"],
    notes: "Gentle dreamlike workspace",
    assetRefs: [], // v88 Workshop will populate
  },
  {
    id: "agartha-dusk",
    name: "Agartha Dusk",
    description: "Dark pastel moonlit night",
    builtIn: true,
    themeId: "agartha-dusk",
    tags: ["dark", "pastel"],
    notes: "Soft moonlit atmosphere",
    assetRefs: [], // v88 Workshop will populate
  },
];

export const themePresetRegistry: ThemePresetRegistry = {
  version: "1.0.0",
  updatedAt: new Date().toISOString(),
  presets: builtInThemePresets,
};

// Warm the accessibility profile cache for all built-in themes at module load
// so StatusPill never hits a cold cache during render.
for (const preset of builtInThemePresets) {
  getAccessibilityProfile(preset.themeId);
}
