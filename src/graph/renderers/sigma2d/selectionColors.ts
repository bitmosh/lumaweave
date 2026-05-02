/**
 * LumaWeave Selection Visual Grammar
 * Centralized color constants for node/edge selection highlighting
 *
 * This file now re-exports values from graphVisualTokens for consistency.
 * The graph visual policy system is the source of truth for visual values.
 */

import { graphVisualTokens } from "../../visual/graphVisualTokens";

export const selectionColors = {
  defaultNode: graphVisualTokens.nodeColor.default,
  defaultEdge: graphVisualTokens.edgeColor.default,
  selectedNode: graphVisualTokens.nodeColor.selected,
  primaryEdge: graphVisualTokens.edgeColor.selected,
  secondaryEdge: graphVisualTokens.edgeColor.secondary,
  relationshipEndpointNode: graphVisualTokens.nodeColor.relationshipEndpoint,
  secondaryNeighborNode: graphVisualTokens.nodeColor.secondary,
} as const;
