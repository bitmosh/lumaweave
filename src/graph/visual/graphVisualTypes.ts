// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Graph Visual Types v0
 * Type definitions for graph visual policy system
 */

/**
 * Neighborhood depth for selection
 * Controls how much neighborhood context appears when selecting a node or edge
 */
export type NeighborhoodDepth = 1 | 2 | 3;

/**
 * Node label visibility mode
 */
export type NodeLabelMode =
  | "off"
  | "selected-neighborhood"
  | "important-only"
  | "all";

/**
 * Edge label visibility mode
 */
export type EdgeLabelMode =
  | "off"
  | "selected-neighborhood"
  | "important-only"
  | "all-short"
  | "all-medium";

/**
 * Graph interaction state
 * Captures the current selection and hover state of the graph
 */
export interface GraphInteractionState {
  /** Currently selected node ID */
  selectedNodeId: string | null;

  /** Currently selected edge ID */
  selectedEdgeId: string | null;

  /** Currently hovered node ID */
  hoveredNodeId: string | null;

  /** Currently hovered edge ID (planned, not implemented in v0) */
  hoveredEdgeId: string | null;

  /** Neighborhood depth for selection */
  neighborhoodDepth: NeighborhoodDepth;
}

/**
 * Node visual style
 * Represents the visual attributes to apply to a node
 */
export interface NodeVisualStyle {
  /** Node fill color */
  color: string;

  /** Node size */
  size: number;

  /** Node label text (empty string to hide) */
  label: string;

  /** Node label text color (optional, for stateful label color) */
  labelColor?: string;
}

/**
 * Edge visual style
 * Represents the visual attributes to apply to an edge
 */
export interface EdgeVisualStyle {
  /** Edge stroke color */
  color: string;

  /** Edge stroke width */
  size: number;

  /** Edge label text (empty string to hide) */
  label: string;
}

/**
 * Graph visual decision
 * Represents the complete visual policy decision for the graph
 */
export interface GraphVisualDecision {
  /** Map of node ID to visual style */
  nodeStyles: Map<string, NodeVisualStyle>;

  /** Map of edge ID to visual style */
  edgeStyles: Map<string, EdgeVisualStyle>;
}

/**
 * Label policy options
 * Configuration options for label visibility policy
 */
export interface LabelPolicyOptions {
  /** Maximum edge label length before truncation */
  maxEdgeLabelLength: number;

  /** Show labels on hover */
  showLabelsOnHover: boolean;

  /** Hover label color (not wired in v0, kept for future) */
  hoverLabelColor: string;
}

/**
 * Style policy options
 * Configuration options for style policy
 */
export interface StylePolicyOptions {
  /** Hover node color override */
  hoverNodeColor: string;

  /** Edge label font size */
  edgeLabelFontSize: number;

  /** Pass C9.2: pinned highlight mode active */
  pinnedHighlightActive?: boolean;
}
