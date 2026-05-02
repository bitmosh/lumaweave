/**
 * Theme Presets Registry
 * 
 * This file contains the built-in theme presets for LumaWeave.
 */

import type { ThemePreset, ThemePresetRegistry } from "./theme.types";

export const builtInThemePresets: ThemePreset[] = [
  {
    id: "solar-plasma",
    name: "Solar Plasma",
    description: "Default luminous theme with cyan and purple accents",
    builtIn: true,
    themeId: "solar-plasma",
    tags: ["default", "luminous"],
    notes: "The primary LumaWeave theme",
  },
  {
    id: "obsidian-aurora",
    name: "Obsidian Aurora",
    description: "Dark theme with aurora borealis color palette",
    builtIn: true,
    themeId: "obsidian-aurora",
    tags: ["dark", "aurora"],
    notes: "Inspired by northern lights over dark stone",
  },
  {
    id: "haunted-observatory",
    name: "Haunted Observatory",
    description: "Spooky dark theme with spectral green accents",
    builtIn: true,
    themeId: "haunted-observatory",
    tags: ["dark", "spooky"],
    notes: "Perfect for late-night debugging sessions",
  },
  {
    id: "glitter-goblin",
    name: "Glitter Goblin",
    description: "Playful theme with bright glitter effects",
    builtIn: true,
    themeId: "glitter-goblin",
    tags: ["playful", "glitter"],
    notes: "Maximum glitter, maximum chaos",
  },
];

export const themePresetRegistry: ThemePresetRegistry = {
  version: "1.0.0",
  updatedAt: new Date().toISOString(),
  presets: builtInThemePresets,
};
