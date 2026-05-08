/**
 * LumaWeave Graph Styling Policy v0
 * Decides visual styles based on interaction state
 *
 * Required order:
 * 1. default styles
 * 2. selected/neighborhood styles
 * 3. hover overlay styles
 * 4. dim mode (v86b)
 *
 * Selection must persist.
 * Hover must be temporary.
 * Hover must not erase selection.
 * Background click clears selected state.
 */

import Graph from "graphology";
import {
  type GraphInteractionState,
  type StylePolicyOptions,
  type NeighborhoodDepth,
} from "./graphVisualTypes";
import { type ResolvedGraphVisualTokens } from "./graphVisualTokens";
import { getRelationshipNeighborhood, getNodeNeighborhood } from "../renderers/sigma2d/selectionNeighborhood";
import { applyDimPolicy, type DimMode, type DimPolicyState } from "./dimmingPolicy";

/**
 * Reset all nodes and edges to default styles
 */
function resetGraphStyles(graph: Graph, tokens: ResolvedGraphVisualTokens): void {
  graph.forEachNode((node) => {
    const attrs = graph.getNodeAttributes(node);
    const baseSize =
      typeof attrs.baseSize === "number"
        ? attrs.baseSize
        : typeof attrs.size === "number"
          ? attrs.size
          : 10;

    // Use cluster color from raw if present,
    // fall back to theme default
    const clusterColor =
      (attrs.raw?.color as string) ?? tokens.nodeColor.default;

    graph.setNodeAttribute(node, "color", clusterColor);
    
    // Visual treatment for isolated nodes
    const isIsolated = attrs.isIsolated as boolean;
    if (isIsolated) {
      graph.setNodeAttribute(node, "size", baseSize * 0.75);
    } else {
      graph.setNodeAttribute(node, "size", baseSize);
    }

    // Visual treatment for sun nodes (solar-orbit dialect)
    const isSun = attrs.isSun as boolean;
    if (isSun) {
      // Sun nodes render larger and brighter
      graph.setNodeAttribute(
        node, "size",
        (attrs.baseSize as number) * 1.8
      );
      // Add a subtle border effect via zIndex
      // (Sigma renders larger nodes on top)
    }
  });

  graph.forEachEdge((edge) => {
    const attrs = graph.getEdgeAttributes(edge);
    const rawColor = (attrs.raw as any)?.color;
    graph.setEdgeAttribute(
      edge, "color",
      rawColor ?? tokens.edgeColor.default
    );
    graph.setEdgeAttribute(
      edge, "size",
      tokens.edgeSize.default
    );
  });
}

/**
 * Apply selected node styles with neighborhood depth
 * Mirrors applySelectedEdgeStyles structure for consistency
 */
function applySelectedNodeStyles(
  graph: Graph,
  nodeId: string,
  depth: NeighborhoodDepth,
  tokens: ResolvedGraphVisualTokens,
): void {
  const neighborhood = getNodeNeighborhood(graph, nodeId);
  const attrs = graph.getNodeAttributes(nodeId);
  const baseSize =
    typeof attrs.baseSize === "number"
      ? attrs.baseSize
      : typeof attrs.size === "number"
        ? attrs.size
        : 10;

  // Selected node (primary node)
  graph.setNodeAttribute(nodeId, "color", tokens.nodeColor.selected);
  graph.setNodeAttribute(nodeId, "size", baseSize * tokens.nodeSizeMultiplier.selected);

  // Depth 2: direct neighbors (secondary nodes) and primary edges
  if (depth >= 2) {
    neighborhood.directNeighborNodeIds.forEach((neighborId) => {
      if (graph.hasNode(neighborId)) {
        const neighborAttrs = graph.getNodeAttributes(neighborId);
        const neighborBaseSize =
          typeof neighborAttrs.baseSize === "number"
            ? neighborAttrs.baseSize
            : typeof neighborAttrs.size === "number"
              ? neighborAttrs.size
              : 10;

        graph.setNodeAttribute(neighborId, "color", tokens.nodeColor.secondary);
        graph.setNodeAttribute(neighborId, "size", neighborBaseSize * tokens.nodeSizeMultiplier.secondary);
      }
    });

    neighborhood.directEdgeIds.forEach((edgeId) => {
      if (graph.hasEdge(edgeId)) {
        graph.setEdgeAttribute(edgeId, "color", tokens.edgeColor.selected);
        graph.setEdgeAttribute(edgeId, "size", tokens.edgeSize.selected);
      }
    });
  }

  // Depth 3: secondary edges and tertiary nodes (mirrors edge selection tertiary expansion)
  if (depth >= 3) {
    neighborhood.secondaryEdgeIds.forEach((edgeId) => {
      if (graph.hasEdge(edgeId)) {
        graph.setEdgeAttribute(edgeId, "color", tokens.edgeColor.secondary);
        graph.setEdgeAttribute(edgeId, "size", tokens.edgeSize.secondary);
      }
    });

    neighborhood.tertiaryNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const tertiaryAttrs = graph.getNodeAttributes(nodeId);
        const tertiaryBaseSize =
          typeof tertiaryAttrs.baseSize === "number"
            ? tertiaryAttrs.baseSize
            : typeof tertiaryAttrs.size === "number"
              ? tertiaryAttrs.size
              : 10;

        graph.setNodeAttribute(nodeId, "color", tokens.nodeColor.tertiary);
        graph.setNodeAttribute(nodeId, "size", tertiaryBaseSize * tokens.nodeSizeMultiplier.tertiary);
      }
    });
  }

  // Depth 4: quaternary nodes (neighbors of tertiary nodes)
  if (depth >= 4) {
    neighborhood.tertiaryNodeIds.forEach((nId) => {
      graph.forEachNeighbor(nId, (quatNodeId) => {
        if (graph.hasNode(quatNodeId)) {
          graph.setNodeAttribute(quatNodeId, "color", tokens.nodeColor.tertiary);
        }
      });
    });
  }
}

/**
 * Apply selected edge styles with neighborhood depth
 */
function applySelectedEdgeStyles(
  graph: Graph,
  edgeId: string,
  depth: NeighborhoodDepth,
  tokens: ResolvedGraphVisualTokens,
): void {
  const neighborhood = getRelationshipNeighborhood(graph, edgeId);

  // Stage 1: primary edge
  if (graph.hasEdge(edgeId)) {
    graph.setEdgeAttribute(edgeId, "color", tokens.edgeColor.selected);
    graph.setEdgeAttribute(edgeId, "size", tokens.edgeSize.selected);
  }

  // Source and target nodes
  if (neighborhood.sourceId && graph.hasNode(neighborhood.sourceId)) {
    const attrs = graph.getNodeAttributes(neighborhood.sourceId);
    const baseSize =
      typeof attrs.baseSize === "number"
        ? attrs.baseSize
        : typeof attrs.size === "number"
          ? attrs.size
          : 10;

    graph.setNodeAttribute(neighborhood.sourceId, "color", tokens.nodeColor.relationshipEndpoint);
    graph.setNodeAttribute(neighborhood.sourceId, "size", baseSize * tokens.nodeSizeMultiplier.relationshipEndpoint);
  }

  if (neighborhood.targetId && graph.hasNode(neighborhood.targetId)) {
    const attrs = graph.getNodeAttributes(neighborhood.targetId);
    const baseSize =
      typeof attrs.baseSize === "number"
        ? attrs.baseSize
        : typeof attrs.size === "number"
          ? attrs.size
          : 10;

    graph.setNodeAttribute(neighborhood.targetId, "color", tokens.nodeColor.relationshipEndpoint);
    graph.setNodeAttribute(neighborhood.targetId, "size", baseSize * tokens.nodeSizeMultiplier.relationshipEndpoint);
  }

  // Stage 2: secondary edges and nodes
  if (depth >= 2) {
    neighborhood.secondaryEdgeIds.forEach((eId) => {
      if (graph.hasEdge(eId)) {
        graph.setEdgeAttribute(eId, "color", tokens.edgeColor.secondary);
        graph.setEdgeAttribute(eId, "size", tokens.edgeSize.secondary);
      }
    });

    neighborhood.secondaryNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const attrs = graph.getNodeAttributes(nodeId);
        const baseSize =
          typeof attrs.baseSize === "number"
            ? attrs.baseSize
            : typeof attrs.size === "number"
              ? attrs.size
              : 10;

        graph.setNodeAttribute(nodeId, "color", tokens.nodeColor.secondary);
        graph.setNodeAttribute(nodeId, "size", baseSize * tokens.nodeSizeMultiplier.secondary);
      }
    });
  }

  // Stage 3: tertiary edges and nodes
  if (depth >= 3) {
    neighborhood.tertiaryEdgeIds.forEach((eId) => {
      if (graph.hasEdge(eId)) {
        graph.setEdgeAttribute(eId, "color", tokens.edgeColor.tertiary);
        graph.setEdgeAttribute(eId, "size", tokens.edgeSize.tertiary);
      }
    });

    neighborhood.tertiaryNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const attrs = graph.getNodeAttributes(nodeId);
        const baseSize =
          typeof attrs.baseSize === "number"
            ? attrs.baseSize
            : typeof attrs.size === "number"
              ? attrs.size
              : 10;

        graph.setNodeAttribute(nodeId, "color", tokens.nodeColor.tertiary);
        graph.setNodeAttribute(nodeId, "size", baseSize * tokens.nodeSizeMultiplier.tertiary);
      }
    });
  }
}

/**
 * Apply hover overlay styles
 * Hover is temporary and should not erase selection
 */
function applyHoverStyles(
  graph: Graph,
  state: GraphInteractionState,
  options: StylePolicyOptions,
  tokens: ResolvedGraphVisualTokens,
): void {
  const { hoveredNodeId, selectedNodeId, hoveredEdgeId, selectedEdgeId } = state;
  const { hoverNodeColor } = options;

  // Node hover: Only apply hover if node is not selected
  if (hoveredNodeId && hoveredNodeId !== selectedNodeId && graph.hasNode(hoveredNodeId)) {
    graph.setNodeAttribute(hoveredNodeId, "color", hoverNodeColor);
    // Stateful label color for hover (dark text on white hover background)
    graph.setNodeAttribute(hoveredNodeId, "labelColor", tokens.nodeLabelColor.hover);
  }

  // Edge hover: Only apply hover if edge is not selected
  if (hoveredEdgeId && hoveredEdgeId !== selectedEdgeId && graph.hasEdge(hoveredEdgeId)) {
    graph.setEdgeAttribute(hoveredEdgeId, "color", tokens.edgeColor.hovered);
    graph.setEdgeAttribute(hoveredEdgeId, "size", tokens.edgeSize.hovered);
  }
}

/**
 * Clear hover styles from all nodes
 */
function clearHoverStyles(graph: Graph): void {
  graph.forEachNode((nodeId) => {
    graph.setNodeAttribute(nodeId, "labelColor", undefined);
  });
}

/**
 * Apply complete styling policy
 * Returns void (styles are applied directly to graph)
 */
export function applyGraphStylePolicy(
  graph: Graph,
  state: GraphInteractionState,
  options: StylePolicyOptions,
  tokens: ResolvedGraphVisualTokens,
  dimMode?: DimMode,
  dimOpacity?: number,
): void {
  const { selectedNodeId, selectedEdgeId, hoveredNodeId, hoveredEdgeId, neighborhoodDepth } = state;

  // 1. Reset all styles to default
  resetGraphStyles(graph, tokens);

  // 2. Apply selected/neighborhood styles
  if (selectedEdgeId) {
    applySelectedEdgeStyles(graph, selectedEdgeId, neighborhoodDepth, tokens);
  } else if (selectedNodeId) {
    applySelectedNodeStyles(graph, selectedNodeId, neighborhoodDepth, tokens);
  }

  // 3. Apply hover overlay styles (temporary, does not erase selection)
  if (hoveredNodeId || hoveredEdgeId) {
    applyHoverStyles(graph, state, options, tokens);
  } else {
    clearHoverStyles(graph);
  }

  // 4. Apply dim mode (v86b)
  if (dimMode && dimMode !== "off" && dimOpacity !== undefined) {
    const dimState: DimPolicyState = {
      mode: dimMode,
      clusterDepth: neighborhoodDepth ?? 2,
      selectedNodeId: selectedNodeId ?? selectedEdgeId ? null : null, // dim mode only works with node selection
      dimOpacity,
      transitionMs: 200,
    };
    applyDimPolicy(graph, dimState);
  }
}
