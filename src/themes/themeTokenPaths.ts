import type { ThemeRuntimeTokens } from "./theme.types";

export type ThemeTokenPath =
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
  | "effects.glow.intensity";

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

export const CANONICAL_THEME_TOKEN_PATHS: readonly ThemeTokenPath[] = [
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
];

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

export type ThemeTokenValue = string | number;

export function resolveThemeTokenPath(tokens: ThemeRuntimeTokens, path: ThemeTokenPath): ThemeTokenValue {
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
  }

  const exhaustiveCheck: never = path;
  return exhaustiveCheck;
}

export function validateThemeTokenPaths(tokens: ThemeRuntimeTokens): ThemeTokenPath[] {
  return CANONICAL_THEME_TOKEN_PATHS.filter((path) => {
    const value = resolveThemeTokenPath(tokens, path);
    return value === undefined || value === null;
  });
}
