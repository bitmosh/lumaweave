/**
 * Theme Runtime Tokens
 * 
 * This file defines the visual token values for each built-in theme preset.
 */

import type { ThemeId } from "../control-plane/settings/settings.schema";
import type { ThemeRuntimeTokens } from "./theme.types";
import { validateThemeTokenPaths } from "./themeTokenPaths";

/**
 * Solar Plasma theme tokens
 * Bright solar/cyan/gold plasma theme
 */
export const solarPlasmaTokens: ThemeRuntimeTokens = {
  app: {
    background: "#020617", // slate-950
    panelBackground: "rgba(15, 23, 42, 0.82)", // slate-900 with opacity
    panelBorder: "rgba(34, 211, 238, 0.2)", // cyan-400/20
    textPrimary: "#f1f5f9", // slate-100
    textMuted: "#94a3b8", // slate-400
    accent: "#22d3ee", // cyan-400
    glow: "rgba(34, 211, 238, 0.3)", // cyan-400 glow
  },
  graph: {
    nodeDefault: "#22d3ee", // cyan-400
    nodeHover: "#ffffff",
    nodeSelected: "#fbbf24", // amber-400
    nodeSecondary: "#3b82f6", // blue-500
    nodeTertiary: "#60a5fa", // blue-400
    edgeDefault: "#64748b", // slate-500
    edgeHover: "#d8b4fe", // purple-300
    edgeSelected: "#a855f7", // purple-500
    edgeSecondary: "#c4b5fd", // purple-300
    edgeTertiary: "#ddd6fe", // purple-200
    nodeLabel: "#f1f5f9", // slate-100
    nodeLabelHover: "#0f172a", // slate-900
    edgeLabel: "#94a3b8", // slate-400
    edgeLabelHover: "#cbd5e1", // slate-300
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: true,
    glowIntensity: 1.0,
  },
};

/**
 * Obsidian Aurora theme tokens
 * Dark theme with aurora borealis color palette
 */
export const obsidianAuroraTokens: ThemeRuntimeTokens = {
  app: {
    background: "#0a0a0f", // very dark
    panelBackground: "rgba(10, 10, 15, 0.85)",
    panelBorder: "rgba(139, 92, 246, 0.25)", // violet-500/25
    textPrimary: "#e2e8f0", // slate-200
    textMuted: "#64748b", // slate-500
    accent: "#8b5cf6", // violet-500
    glow: "rgba(139, 92, 246, 0.25)",
  },
  graph: {
    nodeDefault: "#8b5cf6", // violet-500
    nodeHover: "#e9d5ff", // purple-200
    nodeSelected: "#f472b6", // pink-400
    nodeSecondary: "#a78bfa", // purple-400
    nodeTertiary: "#c4b5fd", // purple-300
    edgeDefault: "#475569", // slate-600
    edgeHover: "#a78bfa", // purple-400
    edgeSelected: "#c084fc", // purple-400
    edgeSecondary: "#d8b4fe", // purple-300
    edgeTertiary: "#e9d5ff", // purple-200
    nodeLabel: "#e2e8f0", // slate-200
    nodeLabelHover: "#0f172a", // slate-900
    edgeLabel: "#64748b", // slate-500
    edgeLabelHover: "#94a3b8", // slate-400
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.7,
  },
};

/**
 * Haunted Observatory theme tokens
 * Spooky dark theme with spectral green accents
 */
export const hauntedObservatoryTokens: ThemeRuntimeTokens = {
  app: {
    background: "#050a05", // very dark green
    panelBackground: "rgba(5, 15, 5, 0.85)",
    panelBorder: "rgba(34, 197, 94, 0.25)", // green-500/25
    textPrimary: "#d1fae5", // green-100
    textMuted: "#4b5563", // gray-600
    accent: "#22c55e", // green-500
    glow: "rgba(34, 197, 94, 0.25)",
  },
  graph: {
    nodeDefault: "#22c55e", // green-500
    nodeHover: "#bbf7d0", // green-200
    nodeSelected: "#a3e635", // lime-400
    nodeSecondary: "#4ade80", // green-400
    nodeTertiary: "#86efac", // green-300
    edgeDefault: "#374151", // gray-700
    edgeHover: "#4ade80", // green-400
    edgeSelected: "#22c55e", // green-500
    edgeSecondary: "#86efac", // green-300
    edgeTertiary: "#bbf7d0", // green-200
    nodeLabel: "#d1fae5", // green-100
    nodeLabelHover: "#022c22", // green-950
    edgeLabel: "#4b5563", // gray-600
    edgeLabelHover: "#6b7280", // gray-500
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.5,
  },
};

/**
 * Glitter Goblin theme tokens
 * Playful theme with bright glitter effects
 */
export const glitterGoblinTokens: ThemeRuntimeTokens = {
  app: {
    background: "#1a0524", // deep purple
    panelBackground: "rgba(30, 5, 40, 0.85)",
    panelBorder: "rgba(236, 72, 153, 0.3)", // pink-500/30
    textPrimary: "#fce7f3", // pink-100
    textMuted: "#a855f7", // purple-500
    accent: "#ec4899", // pink-500
    glow: "rgba(236, 72, 153, 0.4)",
  },
  graph: {
    nodeDefault: "#ec4899", // pink-500
    nodeHover: "#fbcfe8", // pink-200
    nodeSelected: "#facc15", // yellow-400
    nodeSecondary: "#f472b6", // pink-400
    nodeTertiary: "#f9a8d4", // pink-300
    edgeDefault: "#7c3aed", // violet-600
    edgeHover: "#f472b6", // pink-400
    edgeSelected: "#d946ef", // fuchsia-500
    edgeSecondary: "#f9a8d4", // pink-300
    edgeTertiary: "#fbcfe8", // pink-200
    nodeLabel: "#fce7f3", // pink-100
    nodeLabelHover: "#4a044e", // pink-950
    edgeLabel: "#a855f7", // purple-500
    edgeLabelHover: "#c084fc", // purple-400
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: true,
    glowIntensity: 1.5,
  },
};

/**
 * Theme token map
 * Maps theme IDs to their token definitions
 */
export const themeTokenMap: Record<ThemeId, ThemeRuntimeTokens> = {
  "solar-plasma": solarPlasmaTokens,
  "obsidian-aurora": obsidianAuroraTokens,
  "haunted-observatory": hauntedObservatoryTokens,
  "glitter-goblin": glitterGoblinTokens,
};

/**
 * Get theme runtime tokens by theme ID
 */
export function getThemeRuntimeTokens(themeId: ThemeId): ThemeRuntimeTokens {
  return themeTokenMap[themeId] || solarPlasmaTokens;
}

/**
 * Validate theme tokens structure
 * Ensures all built-in themes have required token groups
 * Dev-only warning for missing tokens
 */
export function validateThemeTokens(): void {
  const requiredAppKeys = ["background", "panelBackground", "panelBorder", "textPrimary", "textMuted", "accent", "glow"];
  const requiredGraphKeys = ["nodeDefault", "nodeHover", "nodeSelected", "nodeSecondary", "nodeTertiary", "edgeDefault", "edgeHover", "edgeSelected", "edgeSecondary", "edgeTertiary", "nodeLabel", "nodeLabelHover", "edgeLabel", "edgeLabelHover"];
  const requiredEffectsKeys = ["glitterEnabled", "starfieldEnabled", "glowIntensity"];

  for (const [themeId, tokens] of Object.entries(themeTokenMap)) {
    // Check app tokens
    for (const key of requiredAppKeys) {
      if (!(key in tokens.app)) {
        console.warn(`[THEME VALIDATION] Theme "${themeId}" missing app token: ${key}`);
      }
    }

    // Check graph tokens
    for (const key of requiredGraphKeys) {
      if (!(key in tokens.graph)) {
        console.warn(`[THEME VALIDATION] Theme "${themeId}" missing graph token: ${key}`);
      }
    }

    // Check effects tokens
    for (const key of requiredEffectsKeys) {
      if (!(key in tokens.effects)) {
        console.warn(`[THEME VALIDATION] Theme "${themeId}" missing effects token: ${key}`);
      }
    }

    const missingTokenPaths = validateThemeTokenPaths(tokens);
    if (missingTokenPaths.length > 0) {
      console.warn(
        `[THEME VALIDATION] Theme "${themeId}" missing canonical token paths: ${missingTokenPaths.join(", ")}`,
      );
    }
  }
}

/**
 * Resolve graph visual tokens from theme tokens with settings overrides
 * Theme tokens provide defaults, settings can override specific values
 */
export function resolveGraphVisualTokens(
  themeGraphTokens: {
    nodeDefault: string;
    nodeHover: string;
    nodeSelected: string;
    nodeSecondary: string;
    nodeTertiary: string;
    edgeDefault: string;
    edgeHover: string;
    edgeSelected: string;
    edgeSecondary: string;
    edgeTertiary: string;
    nodeLabel: string;
    nodeLabelHover: string;
    edgeLabel: string;
    edgeLabelHover: string;
  },
  settings: {
    hoverNodeColor?: string;
    selectedNodeColor?: string;
    defaultNodeColor?: string;
    selectedEdgeColor?: string;
  }
) {
  return {
    nodeColor: {
      default: settings.defaultNodeColor || themeGraphTokens.nodeDefault,
      selected: settings.selectedNodeColor || themeGraphTokens.nodeSelected,
      hover: settings.hoverNodeColor || themeGraphTokens.nodeHover,
      relationshipEndpoint: "#2563eb",
      secondary: themeGraphTokens.nodeSecondary,
      tertiary: themeGraphTokens.nodeTertiary,
    },
    edgeColor: {
      default: themeGraphTokens.edgeDefault,
      selected: settings.selectedEdgeColor || themeGraphTokens.edgeSelected,
      hovered: themeGraphTokens.edgeHover,
      secondary: themeGraphTokens.edgeSecondary,
      tertiary: themeGraphTokens.edgeTertiary,
    },
    nodeLabelColor: {
      default: themeGraphTokens.nodeLabel,
      hover: themeGraphTokens.nodeLabelHover,
      selected: themeGraphTokens.nodeLabel,
    },
    edgeLabelColor: {
      default: themeGraphTokens.edgeLabel,
      selected: themeGraphTokens.edgeLabelHover,
    },
    labelFontSize: {
      node: 13,
      edge: 13,
    },
    nodeSizeMultiplier: {
      default: 1.0,
      selected: 1.6,
      relationshipEndpoint: 1.6,
      secondary: 1.3,
      tertiary: 1.2,
    },
    edgeSize: {
      default: 3,
      selected: 6,
      hovered: 4,
      secondary: 4,
      tertiary: 3,
    },
    labelTruncation: {
      maxEdgeLabelLength: 48,
      allMediumMultiplier: 2,
    },
    sigmaConfig: {
      labelRenderedSizeThreshold: 6,
      labelFont: "sans-serif",
      edgeLabelFont: "sans-serif",
    },
  };
}
