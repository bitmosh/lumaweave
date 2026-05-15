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
    background: "#03000A", // v86a restyled: void-deep
    panelBackground: "rgba(27, 8, 48, 0.82)", // v86a restyled: void-warm
    panelBorder: "rgba(255, 179, 71, 0.32)", // v86a restyled: gold
    textPrimary: "#FFE9D6", // v86a restyled: cream
    textMuted: "rgba(255, 215, 188, 0.55)", // v86a restyled: cream muted
    accent: "#FFB347", // v86a restyled: gold
    glow: "rgba(255, 107, 26, 0.40)", // v86a restyled: flare
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
    nodeLabel: "#FFE9D6", // v86a restyled: cream
    nodeLabelHover: "#1B0830", // v86a restyled: void-warm
    edgeLabel: "rgba(255, 215, 188, 0.55)", // v86a restyled: cream muted
    edgeLabelHover: "rgba(255, 233, 214, 0.85)", // v86a restyled: cream brighter
    nodeColorScale: [
      "#7B2FFF",  // peripheral — deep coronal purple
      "#4FACFF",  // coronal blue
      "#00D4FF",  // solar wind cyan
      "#CC2EFA",  // chromosphere magenta
      "#FFB347",  // prominence amber
      "#FF6B1A",  // solar flare orange (hub nodes)
    ],
    edgeColorScale: [
      "rgba(75,100,180,0.2)",
      "rgba(204,46,250,0.3)",
      "rgba(255,215,0,0.35)",
      "rgba(255,140,0,0.45)",
      "rgba(255,107,26,0.55)",
      "rgba(255,69,0,0.7)",
    ],
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: true,
    glowIntensity: 1.0,
  },
  // NEW v86a: Additional token paths
  backdrop: {
    coronaColor: "rgba(255,179,71,0.28)",
    coronaIntensity: 0.7,
    flareColor: "rgba(255,107,26,0.55)",
    starfieldDensity: 0.7,
    vignetteIntensity: 0.92,
  },
  node: {
    sphereHumDuration: 4.86,
    sphereFlowDuration: 4.73,
    sphereGlowStrength: 1.0,
  },
  edge: {
    stylePreset: "plasma",
    plasmaFlowSpeed: 0.55,
  },
  selection: {
    haloColor: "rgba(255,179,71,0.6)",
    haloMaxRadiusRatio: 0.25,
    glitterDensityScale: 1.0,
    dimOpacity: 0.18,
  },
  bookmark: {
    alertColor: "#FF4D6D",
    pinnedColor: "#FFB347",
    refColor: "#00D4FF",
  },
  panel: {
    blurAmount: 16,
    tileHandleColor: "rgba(255,179,71,0.62)",
    tileGroupOutlineColor: "#FFB347",
  },
  inspector: {
    radialSpokeColor: "#FFB347",
    radialHaloColor: "rgba(255,179,71,0.6)",
  },
  typography: {
    fontDisplay: '"Space Grotesk", system-ui, sans-serif',
    fontBody: '"IBM Plex Sans", system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", ui-monospace, monospace',
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
    nodeColorScale: [
      "#3b1f6e",  // deep void purple
      "#6d28d9",  // aurora violet
      "#8b5cf6",  // violet mid
      "#a78bfa",  // soft purple
      "#c084fc",  // bright purple
      "#f0abfc",  // aurora pink peak
    ],
    edgeColorScale: [
      "rgba(109,40,217,0.2)",
      "rgba(139,92,246,0.3)",
      "rgba(167,139,250,0.35)",
      "rgba(192,132,252,0.45)",
      "rgba(240,171,252,0.55)",
      "rgba(216,180,254,0.65)",
    ],
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.7,
  },
  // NEW v86a: Additional token paths (neutral defaults)
  backdrop: {
    coronaColor: "rgba(139,92,246,0.28)", // TODO(v87): review
    coronaIntensity: 0.5, // TODO(v87): review
    flareColor: "rgba(139,92,246,0.4)", // TODO(v87): review
    starfieldDensity: 0.5, // TODO(v87): review
    vignetteIntensity: 0.85, // TODO(v87): review
  },
  node: {
    sphereHumDuration: 3.0, // TODO(v87): review
    sphereFlowDuration: 3.0, // TODO(v87): review
    sphereGlowStrength: 0.8, // TODO(v87): review
  },
  edge: {
    stylePreset: "default", // TODO(v87): review
    plasmaFlowSpeed: 0.5, // TODO(v87): review
  },
  selection: {
    haloColor: "rgba(139,92,246,0.5)", // TODO(v87): review
    haloMaxRadiusRatio: 0.2, // TODO(v87): review
    glitterDensityScale: 0.8, // TODO(v87): review
    dimOpacity: 0.2, // TODO(v87): review
  },
  bookmark: {
    alertColor: "#f472b6", // TODO(v87): review
    pinnedColor: "#8b5cf6", // TODO(v87): review
    refColor: "#c084fc", // TODO(v87): review
  },
  panel: {
    blurAmount: 12, // TODO(v87): review
    tileHandleColor: "rgba(139,92,246,0.5)", // TODO(v87): review
    tileGroupOutlineColor: "#8b5cf6", // TODO(v87): review
  },
  inspector: {
    radialSpokeColor: "#8b5cf6", // TODO(v87): review
    radialHaloColor: "rgba(139,92,246,0.5)", // TODO(v87): review
  },
  typography: {
    fontDisplay: "system-ui, sans-serif", // TODO(v87): review
    fontBody: "system-ui, sans-serif", // TODO(v87): review
    fontMono: "ui-monospace, monospace", // TODO(v87): review
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
    nodeColorScale: [
      "#78350f",  // deep ember
      "#b45309",  // amber dark
      "#d97706",  // amber mid
      "#f59e0b",  // amber bright
      "#fbbf24",  // gold
      "#fde68a",  // pale gold peak
    ],
    edgeColorScale: [
      "rgba(120,53,15,0.25)",
      "rgba(180,83,9,0.35)",
      "rgba(217,119,6,0.4)",
      "rgba(245,158,11,0.5)",
      "rgba(251,191,36,0.6)",
      "rgba(253,230,138,0.65)",
    ],
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.6,
  },
  // NEW v86a: Additional token paths (neutral defaults)
  backdrop: {
    coronaColor: "rgba(251,191,36,0.28)", // TODO(v87): review
    coronaIntensity: 0.5, // TODO(v87): review
    flareColor: "rgba(251,191,36,0.4)", // TODO(v87): review
    starfieldDensity: 0.5, // TODO(v87): review
    vignetteIntensity: 0.85, // TODO(v87): review
  },
  node: {
    sphereHumDuration: 3.0, // TODO(v87): review
    sphereFlowDuration: 3.0, // TODO(v87): review
    sphereGlowStrength: 0.8, // TODO(v87): review
  },
  edge: {
    stylePreset: "default", // TODO(v87): review
    plasmaFlowSpeed: 0.5, // TODO(v87): review
  },
  selection: {
    haloColor: "rgba(251,191,36,0.5)", // TODO(v87): review
    haloMaxRadiusRatio: 0.2, // TODO(v87): review
    glitterDensityScale: 0.8, // TODO(v87): review
    dimOpacity: 0.2, // TODO(v87): review
  },
  bookmark: {
    alertColor: "#f97316", // TODO(v87): review
    pinnedColor: "#fbbf24", // TODO(v87): review
    refColor: "#f59e0b", // TODO(v87): review
  },
  panel: {
    blurAmount: 12, // TODO(v87): review
    tileHandleColor: "rgba(251,191,36,0.5)", // TODO(v87): review
    tileGroupOutlineColor: "#fbbf24", // TODO(v87): review
  },
  inspector: {
    radialSpokeColor: "#fbbf24", // TODO(v87): review
    radialHaloColor: "rgba(251,191,36,0.5)", // TODO(v87): review
  },
  typography: {
    fontDisplay: "system-ui, sans-serif", // TODO(v87): review
    fontBody: "system-ui, sans-serif", // TODO(v87): review
    fontMono: "ui-monospace, monospace", // TODO(v87): review
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
    nodeColorScale: [
      "#1e1b4b",  // deep void indigo
      "#4f46e5",  // circuit indigo
      "#7c3aed",  // neon purple
      "#db2777",  // circuit pink
      "#ec4899",  // hot pink
      "#06b6d4",  // cyan spark peak
    ],
    edgeColorScale: [
      "rgba(79,70,229,0.2)",
      "rgba(124,58,237,0.3)",
      "rgba(219,39,119,0.35)",
      "rgba(236,72,153,0.45)",
      "rgba(6,182,212,0.55)",
      "rgba(103,232,249,0.65)",
    ],
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: true,
    glowIntensity: 1.2,
  },
  // NEW v86a: Additional token paths (neutral defaults)
  backdrop: {
    coronaColor: "rgba(236,72,153,0.28)", // TODO(v87): review
    coronaIntensity: 0.5, // TODO(v87): review
    flareColor: "rgba(236,72,153,0.4)", // TODO(v87): review
    starfieldDensity: 0.5, // TODO(v87): review
    vignetteIntensity: 0.85, // TODO(v87): review
  },
  node: {
    sphereHumDuration: 3.0, // TODO(v87): review
    sphereFlowDuration: 3.0, // TODO(v87): review
    sphereGlowStrength: 0.8, // TODO(v87): review
  },
  edge: {
    stylePreset: "default", // TODO(v87): review
    plasmaFlowSpeed: 0.5, // TODO(v87): review
  },
  selection: {
    haloColor: "rgba(236,72,153,0.5)", // TODO(v87): review
    haloMaxRadiusRatio: 0.2, // TODO(v87): review
    glitterDensityScale: 0.8, // TODO(v87): review
    dimOpacity: 0.2, // TODO(v87): review
  },
  bookmark: {
    alertColor: "#06b6d4", // TODO(v87): review
    pinnedColor: "#ec4899", // TODO(v87): review
    refColor: "#22d3ee", // TODO(v87): review
  },
  panel: {
    blurAmount: 12, // TODO(v87): review
    tileHandleColor: "rgba(236,72,153,0.5)", // TODO(v87): review
    tileGroupOutlineColor: "#ec4899", // TODO(v87): review
  },
  inspector: {
    radialSpokeColor: "#ec4899", // TODO(v87): review
    radialHaloColor: "rgba(236,72,153,0.5)", // TODO(v87): review
  },
  typography: {
    fontDisplay: "system-ui, sans-serif", // TODO(v87): review
    fontBody: "system-ui, sans-serif", // TODO(v87): review
    fontMono: "ui-monospace, monospace", // TODO(v87): review
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
    nodeColorScale: [
      "#c9aaff",  // pale amethyst
      "#a78bfa",  // crystal purple
      "#7fdfb8",  // bioluminescent mint
      "#87ceeb",  // underground lake blue
      "#ffd89b",  // inner sun amber
      "#ffb3de",  // rose quartz peak
    ],
    edgeColorScale: [
      "rgba(167,139,250,0.2)",
      "rgba(127,223,184,0.3)",
      "rgba(135,206,235,0.35)",
      "rgba(255,216,155,0.4)",
      "rgba(255,179,222,0.5)",
      "rgba(201,170,255,0.55)",
    ],
  },
  effects: {
    glitterEnabled: true,
    starfieldEnabled: false,
    glowIntensity: 0.4,
  },
  // NEW v86a: Additional token paths (neutral defaults)
  backdrop: {
    coronaColor: "rgba(168,85,247,0.28)", // TODO(v87): review
    coronaIntensity: 0.5, // TODO(v87): review
    flareColor: "rgba(168,85,247,0.4)", // TODO(v87): review
    starfieldDensity: 0.5, // TODO(v87): review
    vignetteIntensity: 0.85, // TODO(v87): review
  },
  node: {
    sphereHumDuration: 3.0, // TODO(v87): review
    sphereFlowDuration: 3.0, // TODO(v87): review
    sphereGlowStrength: 0.8, // TODO(v87): review
  },
  edge: {
    stylePreset: "default", // TODO(v87): review
    plasmaFlowSpeed: 0.5, // TODO(v87): review
  },
  selection: {
    haloColor: "rgba(168,85,247,0.5)", // TODO(v87): review
    haloMaxRadiusRatio: 0.2, // TODO(v87): review
    glitterDensityScale: 0.8, // TODO(v87): review
    dimOpacity: 0.2, // TODO(v87): review
  },
  bookmark: {
    alertColor: "#f472b6", // TODO(v87): review
    pinnedColor: "#a855f7", // TODO(v87): review
    refColor: "#c084fc", // TODO(v87): review
  },
  panel: {
    blurAmount: 12, // TODO(v87): review
    tileHandleColor: "rgba(168,85,247,0.5)", // TODO(v87): review
    tileGroupOutlineColor: "#a855f7", // TODO(v87): review
  },
  inspector: {
    radialSpokeColor: "#a855f7", // TODO(v87): review
    radialHaloColor: "rgba(168,85,247,0.5)", // TODO(v87): review
  },
  typography: {
    fontDisplay: "system-ui, sans-serif", // TODO(v87): review
    fontBody: "system-ui, sans-serif", // TODO(v87): review
    fontMono: "ui-monospace, monospace", // TODO(v87): review
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
    nodeColorScale: [
      "#1e1b4b",  // deep indigo night
      "#4338ca",  // moonlit indigo
      "#7c3aed",  // dusk purple
      "#a855f7",  // purple bloom
      "#c084fc",  // soft violet
      "#f472b6",  // pink moonrise peak
    ],
    edgeColorScale: [
      "rgba(67,56,202,0.2)",
      "rgba(124,58,237,0.3)",
      "rgba(168,85,247,0.35)",
      "rgba(192,132,252,0.45)",
      "rgba(244,114,182,0.55)",
      "rgba(196,181,253,0.6)",
    ],
  },
  effects: {
    glitterEnabled: false,
    starfieldEnabled: true,
    glowIntensity: 0.5,
  },
  // NEW v86a: Additional token paths (neutral defaults)
  backdrop: {
    coronaColor: "rgba(244,114,182,0.28)", // TODO(v87): review
    coronaIntensity: 0.5, // TODO(v87): review
    flareColor: "rgba(244,114,182,0.4)", // TODO(v87): review
    starfieldDensity: 0.5, // TODO(v87): review
    vignetteIntensity: 0.85, // TODO(v87): review
  },
  node: {
    sphereHumDuration: 3.0, // TODO(v87): review
    sphereFlowDuration: 3.0, // TODO(v87): review
    sphereGlowStrength: 0.8, // TODO(v87): review
  },
  edge: {
    stylePreset: "default", // TODO(v87): review
    plasmaFlowSpeed: 0.5, // TODO(v87): review
  },
  selection: {
    haloColor: "rgba(244,114,182,0.5)", // TODO(v87): review
    haloMaxRadiusRatio: 0.2, // TODO(v87): review
    glitterDensityScale: 0.8, // TODO(v87): review
    dimOpacity: 0.2, // TODO(v87): review
  },
  bookmark: {
    alertColor: "#c084fc", // TODO(v87): review
    pinnedColor: "#f472b6", // TODO(v87): review
    refColor: "#a78bfa", // TODO(v87): review
  },
  panel: {
    blurAmount: 12, // TODO(v87): review
    tileHandleColor: "rgba(244,114,182,0.5)", // TODO(v87): review
    tileGroupOutlineColor: "#f472b6", // TODO(v87): review
  },
  inspector: {
    radialSpokeColor: "#f472b6", // TODO(v87): review
    radialHaloColor: "rgba(244,114,182,0.5)", // TODO(v87): review
  },
  typography: {
    fontDisplay: "system-ui, sans-serif", // TODO(v87): review
    fontBody: "system-ui, sans-serif", // TODO(v87): review
    fontMono: "ui-monospace, monospace", // TODO(v87): review
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
    nodeColorScale: string[];
    edgeColorScale: string[];
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
    nodeColorScale: themeGraphTokens.nodeColorScale,
    edgeColorScale: themeGraphTokens.edgeColorScale,
    selectionHaloColor: "#3b82f6",
  };
}
