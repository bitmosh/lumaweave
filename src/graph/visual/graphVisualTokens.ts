// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Graph Visual Tokens v0
 * Centralized visual value definitions for graph rendering
 *
 * Tokens define values.
 * Policies define decisions.
 * Renderer applies decisions.
 * Settings modify tokens/policy inputs.
 */

/**
 * Node fill colors
 */
export const nodeColorTokens = {
  /** Default node fill color */
  default: "#22d3ee",

  /** Selected node fill color */
  selected: "#fbbf24",

  /** Hovered node fill color (override from settings) */
  hover: "#ffffff",

  /** Edge endpoint node fill color (when edge selected) */
  relationshipEndpoint: "#2563eb",

  /** Secondary neighbor node fill color */
  secondary: "#3b82f6",

  /** Tertiary neighbor node fill color */
  tertiary: "#60a5fa",
};

/**
 * Edge stroke colors
 */
export const edgeColorTokens = {
  /** Default edge stroke color */
  default: "rgba(100,130,180,0.5)",

  /** Selected/primary edge stroke color */
  selected: "#a855f7",

  /** Hovered edge stroke color */
  hovered: "#d8b4fe",

  /** Secondary edge stroke color */
  secondary: "#c4b5fd",

  /** Tertiary edge stroke color */
  tertiary: "#ddd6fe",
};

/**
 * Node label text colors
 */
export const nodeLabelColorTokens = {
  /** Default node label text color (fallback) */
  default: "#f1f5f9",

  /** Hovered node label text color (dark for white hover background) */
  hover: "#0f172a",

  /** Selected node label text color */
  selected: "#f1f5f9",
};

/**
 * Edge label text colors
 */
export const edgeLabelColorTokens = {
  /** Default edge label text color */
  default: "#94a3b8",

  /** Selected edge label text color */
  selected: "#cbd5e1",
};

/**
 * Label font sizes
 */
export const labelFontSizeTokens = {
  /** Default node label font size */
  node: 13,

  /** Default edge label font size */
  edge: 13,
};

/**
 * Node size multipliers
 */
export const nodeSizeMultipliers = {
  /** Default node size multiplier */
  default: 1.0,

  /** Selected node size multiplier */
  selected: 1.6,

  /** Relationship endpoint node size multiplier */
  relationshipEndpoint: 1.6,

  /** Secondary neighbor node size multiplier */
  secondary: 1.3,

  /** Tertiary neighbor node size multiplier */
  tertiary: 1.2,
};

/**
 * Edge size values
 */
export const edgeSizeTokens = {
  /** Default edge stroke width */
  default: 3,

  /** Selected/primary edge stroke width */
  selected: 6,

  /** Hovered edge stroke width */
  hovered: 4,

  /** Secondary edge stroke width */
  secondary: 4,

  /** Tertiary edge stroke width */
  tertiary: 3,
};

/**
 * Label truncation
 */
export const labelTruncationTokens = {
  /** Default max edge label length for truncation */
  maxEdgeLabelLength: 48,

  /** Multiplier for all-medium mode (maxEdgeLabelLength * 2) */
  allMediumMultiplier: 2,
};

/**
 * Sigma configuration tokens
 */
export const sigmaConfigTokens = {
  /** Node label render threshold */
  labelRenderedSizeThreshold: 6,

  /** Label font family */
  labelFont: "sans-serif",

  /** Edge label font family */
  edgeLabelFont: "sans-serif",
};

/**
 * Complete visual tokens object
 */
export const graphVisualTokens: ResolvedGraphVisualTokens = {
  nodeColor: nodeColorTokens,
  edgeColor: edgeColorTokens,
  nodeLabelColor: nodeLabelColorTokens,
  edgeLabelColor: edgeLabelColorTokens,
  labelFontSize: labelFontSizeTokens,
  nodeSizeMultiplier: nodeSizeMultipliers,
  edgeSize: edgeSizeTokens,
  labelTruncation: labelTruncationTokens,
  sigmaConfig: sigmaConfigTokens,
  nodeColorScale: [
    "#7B2FFF",
    "#4FACFF",
    "#00D4FF",
    "#CC2EFA",
    "#FFB347",
    "#FF6B1A",
  ],
  edgeColorScale: [
    "rgba(75,100,180,0.2)",
    "rgba(204,46,250,0.3)",
    "rgba(255,215,0,0.35)",
    "rgba(255,140,0,0.45)",
    "rgba(255,107,26,0.55)",
    "rgba(255,69,0,0.7)",
  ],
};

/**
 * Mutable type for resolved graph visual tokens (allows string values instead of literal types)
 */
export type ResolvedGraphVisualTokens = {
  nodeColor: {
    default: string;
    selected: string;
    hover: string;
    relationshipEndpoint: string;
    secondary: string;
    tertiary: string;
  };
  edgeColor: {
    default: string;
    selected: string;
    hovered: string;
    secondary: string;
    tertiary: string;
  };
  nodeLabelColor: {
    default: string;
    hover: string;
    selected: string;
  };
  edgeLabelColor: {
    default: string;
    selected: string;
  };
  labelFontSize: {
    node: number;
    edge: number;
  };
  nodeSizeMultiplier: {
    default: number;
    selected: number;
    relationshipEndpoint: number;
    secondary: number;
    tertiary: number;
  };
  edgeSize: {
    default: number;
    selected: number;
    hovered: number;
    secondary: number;
    tertiary: number;
  };
  labelTruncation: {
    maxEdgeLabelLength: number;
    allMediumMultiplier: number;
  };
  sigmaConfig: {
    labelRenderedSizeThreshold: number;
    labelFont: string;
    edgeLabelFont: string;
  };
  nodeColorScale: string[];
  edgeColorScale: string[];
};
