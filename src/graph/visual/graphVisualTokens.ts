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
} as const;

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
} as const;

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
} as const;

/**
 * Edge label text colors
 */
export const edgeLabelColorTokens = {
  /** Default edge label text color */
  default: "#94a3b8",

  /** Selected edge label text color */
  selected: "#cbd5e1",
} as const;

/**
 * Label font sizes
 */
export const labelFontSizeTokens = {
  /** Default node label font size */
  node: 13,

  /** Default edge label font size */
  edge: 13,
} as const;

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
} as const;

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
} as const;

/**
 * Label truncation
 */
export const labelTruncationTokens = {
  /** Default max edge label length for truncation */
  maxEdgeLabelLength: 48,

  /** Multiplier for all-medium mode (maxEdgeLabelLength * 2) */
  allMediumMultiplier: 2,
} as const;

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
} as const;

/**
 * Complete visual tokens object
 */
export const graphVisualTokens = {
  nodeColor: nodeColorTokens,
  edgeColor: edgeColorTokens,
  nodeLabelColor: nodeLabelColorTokens,
  edgeLabelColor: edgeLabelColorTokens,
  labelFontSize: labelFontSizeTokens,
  nodeSizeMultiplier: nodeSizeMultipliers,
  edgeSize: edgeSizeTokens,
  labelTruncation: labelTruncationTokens,
  sigmaConfig: sigmaConfigTokens,
} as const;

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
};
