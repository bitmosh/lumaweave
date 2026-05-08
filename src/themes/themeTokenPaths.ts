import type { ThemeRuntimeTokens } from "./theme.types";

// Two-step model:
// 1. PLANNED: paths added but not yet bound to active targets. Themes may or may not populate values.
// 2. CANONICAL: paths populated across all six themes and available for active target binding.
//
// Contract #4: paths must be staged in PLANNED first, then promoted to CANONICAL only after
// all six themes populate values. This prevents binding to incomplete paths.

// v86a: 16 existing + 24 promoted = 40 total canonical paths
export type ThemeTokenPath =
  // Existing 16 (pre-v86a)
  | "app.background"
  | "app.glow"
  | "panel.background"
  | "panel.border"
  | "text.primary"
  | "text.muted"
  | "accent.primary"
  | "graph.node.fill"
  | "graph.node.hoverFill"
  | "graph.node.selectedFill"
  | "graph.node.label"
  | "graph.edge.stroke"
  | "graph.edge.hoverStroke"
  | "graph.edge.selectedStroke"
  | "graph.edge.label"
  | "effects.glow.intensity"
  // v86a promoted (24 paths - promoted from PLANNED in v86a)
  | "backdrop.corona.color"
  | "backdrop.corona.intensity"
  | "backdrop.flare.color"
  | "backdrop.starfield.density"
  | "backdrop.vignette.intensity"
  | "node.sphere.humDuration"
  | "node.sphere.flowDuration"
  | "node.sphere.glowStrength"
  | "edge.style.preset"
  | "edge.plasma.flowSpeed"
  | "selection.halo.color"
  | "selection.halo.maxRadiusRatio"
  | "selection.glitter.densityScale"
  | "selection.dim.opacity"
  | "bookmark.alert.color"
  | "bookmark.pinned.color"
  | "bookmark.ref.color"
  | "panel.blur.amount"
  | "panel.tile.handleColor"
  | "panel.tile.groupOutlineColor"
  | "inspector.radial.spokeColor"
  | "inspector.radial.haloColor"
  | "typography.font.display"
  | "typography.font.body"
  | "typography.font.mono";

export type PlannedThemeTokenPath =
  | "app.surface"
  | "text.warning"
  | "text.inverse"
  | "accent.secondary"
  | "control.background"
  | "control.border"
  | "control.active"
  | "panel.card.background"
  | "panel.card.border"
  | "motion.reduce"
  | "visualHandle.panel.background"
  | "visualHandle.button.background";

// Existing 16 (pre-v86a)
const EXISTING_CANONICAL_PATHS: readonly ThemeTokenPath[] = [
  "app.background",
  "app.glow",
  "panel.background",
  "panel.border",
  "text.primary",
  "text.muted",
  "accent.primary",
  "graph.node.fill",
  "graph.node.hoverFill",
  "graph.node.selectedFill",
  "graph.node.label",
  "graph.edge.stroke",
  "graph.edge.hoverStroke",
  "graph.edge.selectedStroke",
  "graph.edge.label",
  "effects.glow.intensity",
] as const;

// v86a promoted (24 paths - promoted from PLANNED in v86a)
const V86A_PROMOTED_PATHS: readonly ThemeTokenPath[] = [
  "backdrop.corona.color",
  "backdrop.corona.intensity",
  "backdrop.flare.color",
  "backdrop.starfield.density",
  "backdrop.vignette.intensity",
  "node.sphere.humDuration",
  "node.sphere.flowDuration",
  "node.sphere.glowStrength",
  "edge.style.preset",
  "edge.plasma.flowSpeed",
  "selection.halo.color",
  "selection.halo.maxRadiusRatio",
  "selection.glitter.densityScale",
  "selection.dim.opacity",
  "bookmark.alert.color",
  "bookmark.pinned.color",
  "bookmark.ref.color",
  "panel.blur.amount",
  "panel.tile.handleColor",
  "panel.tile.groupOutlineColor",
  "inspector.radial.spokeColor",
  "inspector.radial.haloColor",
  "typography.font.display",
  "typography.font.body",
  "typography.font.mono",
] as const;

export const CANONICAL_THEME_TOKEN_PATHS: readonly ThemeTokenPath[] = [
  ...EXISTING_CANONICAL_PATHS,
  ...V86A_PROMOTED_PATHS,
] as const;

export const PLANNED_THEME_TOKEN_PATHS: readonly PlannedThemeTokenPath[] = [
  "app.surface",
  "text.warning",
  "text.inverse",
  "accent.secondary",
  "control.background",
  "control.border",
  "control.active",
  "panel.card.background",
  "panel.card.border",
  "motion.reduce",
  "visualHandle.panel.background",
  "visualHandle.button.background",
];

// Promotion log — for audit trail
// Tracks when paths moved from PLANNED to CANONICAL
export const PROMOTION_HISTORY = [
  {
    pass: "v86a",
    promotedAt: "2026-05-08",
    paths: V86A_PROMOTED_PATHS,
    reason: "All six themes populated values; ready for binding.",
  },
] as const;

export type ThemeTokenValue = string | number;

export function resolveThemeTokenPath(tokens: ThemeRuntimeTokens, path: ThemeTokenPath): ThemeTokenValue {
  // v86a: Resolve all canonical token paths including new backdrop/node/edge/selection paths
  switch (path) {
    case "app.background":
      return tokens.app.background;
    case "app.glow":
      return tokens.app.glow;
    case "panel.background":
      return tokens.app.panelBackground;
    case "panel.border":
      return tokens.app.panelBorder;
    case "text.primary":
      return tokens.app.textPrimary;
    case "text.muted":
      return tokens.app.textMuted;
    case "accent.primary":
      return tokens.app.accent;
    case "graph.node.fill":
      return tokens.graph.nodeDefault;
    case "graph.node.hoverFill":
      return tokens.graph.nodeHover;
    case "graph.node.selectedFill":
      return tokens.graph.nodeSelected;
    case "graph.node.label":
      return tokens.graph.nodeLabel;
    case "graph.edge.stroke":
      return tokens.graph.edgeDefault;
    case "graph.edge.hoverStroke":
      return tokens.graph.edgeHover;
    case "graph.edge.selectedStroke":
      return tokens.graph.edgeSelected;
    case "graph.edge.label":
      return tokens.graph.edgeLabel;
    case "effects.glow.intensity":
      return tokens.effects.glowIntensity;
    // NEW v86a paths
    case "backdrop.corona.color":
      return tokens.backdrop?.coronaColor ?? "";
    case "backdrop.corona.intensity":
      return tokens.backdrop?.coronaIntensity ?? 0;
    case "backdrop.flare.color":
      return tokens.backdrop?.flareColor ?? "";
    case "backdrop.starfield.density":
      return tokens.backdrop?.starfieldDensity ?? 0;
    case "backdrop.vignette.intensity":
      return tokens.backdrop?.vignetteIntensity ?? 0;
    case "node.sphere.humDuration":
      return tokens.node?.sphereHumDuration ?? 0;
    case "node.sphere.flowDuration":
      return tokens.node?.sphereFlowDuration ?? 0;
    case "node.sphere.glowStrength":
      return tokens.node?.sphereGlowStrength ?? 0;
    case "edge.style.preset":
      return tokens.edge?.stylePreset ?? "";
    case "edge.plasma.flowSpeed":
      return tokens.edge?.plasmaFlowSpeed ?? 0;
    case "selection.halo.color":
      return tokens.selection?.haloColor ?? "";
    case "selection.halo.maxRadiusRatio":
      return tokens.selection?.haloMaxRadiusRatio ?? 0;
    case "selection.glitter.densityScale":
      return tokens.selection?.glitterDensityScale ?? 0;
    case "selection.dim.opacity":
      return tokens.selection?.dimOpacity ?? 0;
    case "bookmark.alert.color":
      return tokens.bookmark?.alertColor ?? "";
    case "bookmark.pinned.color":
      return tokens.bookmark?.pinnedColor ?? "";
    case "bookmark.ref.color":
      return tokens.bookmark?.refColor ?? "";
    case "panel.blur.amount":
      return tokens.panel?.blurAmount ?? 0;
    case "panel.tile.handleColor":
      return tokens.panel?.tileHandleColor ?? "";
    case "panel.tile.groupOutlineColor":
      return tokens.panel?.tileGroupOutlineColor ?? "";
    case "inspector.radial.spokeColor":
      return tokens.inspector?.radialSpokeColor ?? "";
    case "inspector.radial.haloColor":
      return tokens.inspector?.radialHaloColor ?? "";
    case "typography.font.display":
      return tokens.typography?.fontDisplay ?? "";
    case "typography.font.body":
      return tokens.typography?.fontBody ?? "";
    case "typography.font.mono":
      return tokens.typography?.fontMono ?? "";
    default:
      return "";
  }
}

export function validateThemeTokenPaths(tokens: ThemeRuntimeTokens): ThemeTokenPath[] {
  return CANONICAL_THEME_TOKEN_PATHS.filter((path) => {
    const value = resolveThemeTokenPath(tokens, path);
    return value === undefined || value === null;
  });
}
