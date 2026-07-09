// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Graph Label Policy Adapter v0
 * Adapts graphLabelPolicy to Graphology/Sigma renderer
 *
 * This adapter bridges the API difference between:
 * - Old labelPolicy: Mutates graph directly (graph.setNodeAttribute)
 * - New graphLabelPolicy: Returns Map<string, string> (empty string = hidden)
 *
 * The adapter converts the Map-based policy output to direct graph mutations
 * while preserving all existing label behavior.
 */

import Graph from "graphology";
import {
  applyNodeLabelVisibility,
  applyEdgeLabelVisibility,
} from "./graphLabelPolicy";
import {
  type GraphInteractionState,
  type LabelPolicyOptions,
} from "./graphVisualTypes";

/**
 * Legacy selection context from SigmaGraphView
 * Matches the old labelPolicy API
 */
export interface SelectionContext {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  neighborhoodDepth: number;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;
}

/**
 * Legacy label policy options from SigmaGraphView
 * Matches the old labelPolicy API
 */
export interface LegacyLabelPolicyOptions {
  maxEdgeLabelLength: number;
  showLabelsOnHover: boolean;
  hoverLabelColor: string; // Not used in v0, kept for API compatibility
}

export type NodeLabelMode = "off" | "selected-neighborhood" | "important-only" | "all";
export type EdgeLabelMode = "off" | "selected-neighborhood" | "important-only" | "all-short" | "all-medium";

/**
 * Convert legacy SelectionContext to GraphInteractionState
 * Maps nodeSelectionStage (1|2|3) to neighborhoodDepth (1|2|3)
 */
function convertSelectionContextToInteractionState(
  selectionContext: SelectionContext,
): GraphInteractionState {
  return {
    selectedNodeId: selectionContext.selectedNodeId,
    selectedEdgeId: selectionContext.selectedEdgeId,
    hoveredNodeId: selectionContext.hoveredNodeId,
    hoveredEdgeId: selectionContext.hoveredEdgeId,
    neighborhoodDepth: Math.floor(selectionContext.neighborhoodDepth ?? 2) as 1 | 2 | 3,
  };
}

/**
 * Convert legacy LabelPolicyOptions to LabelPolicyOptions
 * Drops hoverLabelColor (not used in v0)
 */
function convertLegacyOptionsToOptions(
  legacyOptions: LegacyLabelPolicyOptions,
): LabelPolicyOptions {
  return {
    maxEdgeLabelLength: legacyOptions.maxEdgeLabelLength,
    showLabelsOnHover: legacyOptions.showLabelsOnHover,
    hoverLabelColor: legacyOptions.hoverLabelColor, // Kept for future use
  };
}

/**
 * Apply node label policy to Graphology graph
 *
 * This adapter:
 * 1. Converts legacy SelectionContext to GraphInteractionState
 * 2. Converts legacy LabelPolicyOptions to LabelPolicyOptions
 * 3. Calls applyNodeLabelVisibility (returns Map)
 * 4. Applies the Map to the graph (direct mutations)
 *
 * Preserves all existing behavior:
 * - Node Label Mode: off/all/important-only/selected-neighborhood
 * - Show Labels On Hover
 * - Neighborhood Depth (via nodeSelectionStage)
 */
export function applyNodeLabelPolicy(
  graph: Graph,
  selectionContext: SelectionContext,
  legacyOptions: LegacyLabelPolicyOptions,
  mode: NodeLabelMode,
): void {
  // Convert to policy types
  const interactionState = convertSelectionContextToInteractionState(selectionContext);
  const options = convertLegacyOptionsToOptions(legacyOptions);

  // Call the new policy (returns Map)
  const labelMap = applyNodeLabelVisibility(graph, interactionState, options, mode);

  // Apply the Map to the graph (direct mutations)
  labelMap.forEach((label, nodeId) => {
    if (graph.hasNode(nodeId)) {
      graph.setNodeAttribute(nodeId, "label", label);
    }
  });
}

/**
 * Apply edge label policy to Graphology graph
 *
 * This adapter:
 * 1. Converts legacy SelectionContext to GraphInteractionState
 * 2. Converts legacy LabelPolicyOptions to LabelPolicyOptions
 * 3. Calls applyEdgeLabelVisibility (returns Map)
 * 4. Applies the Map to the graph (direct mutations)
 *
 * Preserves all existing behavior:
 * - Edge Label Mode: off/all-short/all-medium/selected-neighborhood
 * - Max Edge Label Length
 * - Neighborhood Depth (via nodeSelectionStage)
 */
export function applyEdgeLabelPolicy(
  graph: Graph,
  selectionContext: SelectionContext,
  legacyOptions: LegacyLabelPolicyOptions,
  mode: EdgeLabelMode,
): void {
  // Convert to policy types
  const interactionState = convertSelectionContextToInteractionState(selectionContext);
  const options = convertLegacyOptionsToOptions(legacyOptions);

  // Call the new policy (returns Map)
  const labelMap = applyEdgeLabelVisibility(graph, interactionState, options, mode);

  // Apply the Map to the graph (direct mutations)
  labelMap.forEach((label, edgeId) => {
    if (graph.hasEdge(edgeId)) {
      graph.setEdgeAttribute(edgeId, "label", label);
    }
  });
}
