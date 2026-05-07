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
 * Dark sci-fi with cyan/gold plasma
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
    edgeDefault: "rgba(100,163,224,0.4)", // visible blue
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
 * Dark crystalline aurora borealis
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
    edgeDefault: "rgba(139,92,246,0.35)", // visible purple
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
 * Midnight Loom theme tokens
 * Dark warm gold candlelight
 */
export const midnightLoomTokens: ThemeRuntimeTokens = {
  app: {
    background: "#0c0a09", // amber-950
    panelBackground: "rgba(20, 15, 10, 0.85)",
    panelBorder: "rgba(251, 191, 36, 0.2)", // amber-400/20
    textPrimary: "#fef3c7", // amber-100
    textMuted: "#d6d3d1", // stone-300
    accent: "#fbbf24", // amber-400
    glow: "rgba(251, 191, 36, 0.3)",
  },
  graph: {
    nodeDefault: "#fbbf24", // amber-400
    nodeHover: "#fef9c3", // yellow-100
    nodeSelected: "#f97316", // orange-500
    nodeSecondary: "#f59e0b", // amber-500
    nodeTertiary: "#fcd34d", // amber-300
    edgeDefault: "rgba(251,191,36,0.35)", // visible amber
    edgeHover: "#f59e0b", // amber-500
    edgeSelected: "#f97316", // orange-500
    edgeSecondary: "#fcd34d", // amber-300
    edgeTertiary: "#fef9c3", // yellow-100
    nodeLabel: "#fef3c7", // amber-100
    nodeLabelHover: "#1c1917", // stone-900
    edgeLabel: "#d6d3d1", // stone-300
    edgeLabelHover: "#e7e5e4", // stone-200
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.6,
  },
};

/**
 * Void Circuit theme tokens
 * Dark cyberpunk neon
 */
export const voidCircuitTokens: ThemeRuntimeTokens = {
  app: {
    background: "#050505", // black
    panelBackground: "rgba(5, 5, 5, 0.9)",
    panelBorder: "rgba(236, 72, 153, 0.3)", // pink-500/30
    textPrimary: "#f0abfc", // fuchsia-300
    textMuted: "#a3a3a3", // neutral-400
    accent: "#ec4899", // pink-500
    glow: "rgba(236, 72, 153, 0.4)",
  },
  graph: {
    nodeDefault: "#ec4899", // pink-500
    nodeHover: "#f0abfc", // fuchsia-300
    nodeSelected: "#06b6d4", // cyan-500
    nodeSecondary: "#d946ef", // fuchsia-500
    nodeTertiary: "#e879f9", // fuchsia-400
    edgeDefault: "rgba(236,72,153,0.35)", // visible pink
    edgeHover: "#06b6d4", // cyan-500
    edgeSelected: "#0891b2", // cyan-600
    edgeSecondary: "#22d3ee", // cyan-400
    edgeTertiary: "#67e8f9", // cyan-300
    nodeLabel: "#f0abfc", // fuchsia-300
    nodeLabelHover: "#09090b", // neutral-950
    edgeLabel: "#a3a3a3", // neutral-400
    edgeLabelHover: "#d4d4d4", // neutral-300
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: true,
    glowIntensity: 1.2,
  },
};

/**
 * Agartha Dream theme tokens
 * Light pastel dreamy
 */
export const agarthaDreamTokens: ThemeRuntimeTokens = {
  app: {
    background: "#fefce8", // yellow-50
    panelBackground: "rgba(255, 255, 255, 0.85)",
    panelBorder: "rgba(168, 85, 247, 0.2)", // purple-500/20
    textPrimary: "#1e1b4b", // indigo-950
    textMuted: "#6b7280", // gray-500
    accent: "#a855f7", // purple-500
    glow: "rgba(168, 85, 247, 0.2)",
  },
  graph: {
    nodeDefault: "#a855f7", // purple-500
    nodeHover: "#e9d5ff", // purple-200
    nodeSelected: "#f472b6", // pink-400
    nodeSecondary: "#c084fc", // purple-400
    nodeTertiary: "#d8b4fe", // purple-300
    edgeDefault: "rgba(168,85,247,0.4)", // visible violet
    edgeHover: "#c084fc", // purple-400
    edgeSelected: "#a855f7", // purple-500
    edgeSecondary: "#e9d5ff", // purple-200
    edgeTertiary: "#f3e8ff", // purple-100
    nodeLabel: "#1e1b4b", // indigo-950
    nodeLabelHover: "#ffffff", // white
    edgeLabel: "#6b7280", // gray-500
    edgeLabelHover: "#9ca3af", // gray-400
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: false,
    glowIntensity: 0.4,
  },
};

/**
 * Agartha Dusk theme tokens
 * Dark pastel moonlit night
 */
export const agarthaDuskTokens: ThemeRuntimeTokens = {
  app: {
    background: "#1e1b4b", // indigo-950
    panelBackground: "rgba(30, 27, 75, 0.85)",
    panelBorder: "rgba(244, 114, 182, 0.2)", // pink-400/20
    textPrimary: "#f5d0fe", // fuchsia-200
    textMuted: "#a78bfa", // purple-400
    accent: "#f472b6", // pink-400
    glow: "rgba(244, 114, 182, 0.25)",
  },
  graph: {
    nodeDefault: "#f472b6", // pink-400
    nodeHover: "#f9a8d4", // pink-300
    nodeSelected: "#c084fc", // purple-400
    nodeSecondary: "#f9a8d4", // pink-300
    nodeTertiary: "#fbcfe8", // pink-200
    edgeDefault: "rgba(244,114,182,0.4)", // visible pink
    edgeHover: "#a78bfa", // purple-400
    edgeSelected: "#c084fc", // purple-400
    edgeSecondary: "#c4b5fd", // purple-300
    edgeTertiary: "#ddd6fe", // purple-200
    nodeLabel: "#f5d0fe", // fuchsia-200
    nodeLabelHover: "#0f172a", // slate-900
    edgeLabel: "#a78bfa", // purple-400
    edgeLabelHover: "#c4b5fd", // purple-300
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.5,
  },
};

/**
 * Theme token map
 * Maps theme IDs to their token definitions
 */
export const themeTokenMap: Record<ThemeId, ThemeRuntimeTokens> = {
  "solar-plasma": solarPlasmaTokens,
  "obsidian-aurora": obsidianAuroraTokens,
  "midnight-loom": midnightLoomTokens,
  "void-circuit": voidCircuitTokens,
  "agartha-dream": agarthaDreamTokens,
  "agartha-dusk": agarthaDuskTokens,
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
