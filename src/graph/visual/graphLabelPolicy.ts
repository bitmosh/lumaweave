// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Graph Label Visibility Policy v0
 * Decides which node and edge labels should be visible based on interaction state
 *
 * Rules:
 * 1. Node and edge label behavior must both use the same Neighborhood Depth.
 * 2. Node Label Mode and Edge Label Mode should not invent independent depth logic.
 * 3. selected-neighborhood means "follow Neighborhood Depth."
 * 4. Hover can temporarily show labels, but selected labels should persist without hover.
 * 5. all-short/all-medium should still work for edges.
 * 6. off should hide labels except explicit hover if Show Labels On Hover is enabled.
 */

// v0 heuristic constants for important-only label mode
// These can be refined with explicit importance data or UI controls in future versions
const IMPORTANT_NODE_TOP_N = 20; // Top N nodes by degree are considered important
const IMPORTANT_NODE_MIN_DEGREE = 3; // Minimum degree threshold for small graphs

import Graph from "graphology";
import {
  type GraphInteractionState,
  type LabelPolicyOptions,
  type NodeLabelMode,
  type EdgeLabelMode,
} from "./graphVisualTypes";
import { getRelationshipNeighborhood } from "../renderers/sigma2d/selectionNeighborhood";

/**
 * Get the stored label from attributes, avoiding reliance on the "label" field
 * which may have been reset by the label policy.
 */
function getStoredLabel(attrs: any): string {
  return String(attrs.fullLabel ?? attrs.originalLabel ?? "");
}

/**
 * Truncate a label to a maximum length with ellipsis
 */
function truncateLabel(label: string, maxLength: number): string {
  if (!label) return "";
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength) + "...";
}

/**
 * Get the degree of a node (number of connected edges)
 */
function getNodeDegree(graph: Graph, nodeId: string): number {
  return graph.degree(nodeId);
}

/**
 * Get high-degree nodes (top N or threshold)
 * v0 heuristic: Prefer top N by degree, use degree threshold as fallback for very small graphs
 */
function getImportantNodeIds(graph: Graph): Set<string> {
  const importantNodes = new Set<string>();
  const nodeDegrees: Array<{ nodeId: string; degree: number }> = [];

  graph.forEachNode((nodeId) => {
    const degree = getNodeDegree(graph, nodeId);
    nodeDegrees.push({ nodeId, degree });
  });

  // Sort by degree descending
  nodeDegrees.sort((a, b) => b.degree - a.degree);

  // For small graphs (fewer than TOP_N nodes), use degree threshold
  // For larger graphs, use top N by degree
  if (nodeDegrees.length < IMPORTANT_NODE_TOP_N) {
    // Small graph: use degree threshold
    for (let i = 0; i < nodeDegrees.length; i++) {
      const { nodeId, degree } = nodeDegrees[i];
      if (degree >= IMPORTANT_NODE_MIN_DEGREE) {
        importantNodes.add(nodeId);
      }
    }
  } else {
    // Larger graph: use top N by degree
    for (let i = 0; i < IMPORTANT_NODE_TOP_N; i++) {
      const { nodeId } = nodeDegrees[i];
      importantNodes.add(nodeId);
    }
  }

  return importantNodes;
}

/**
 * Apply node label visibility policy
 * Returns a Map of node ID to label text (empty string = hidden)
 */
export function applyNodeLabelVisibility(
  graph: Graph,
  state: GraphInteractionState,
  options: LabelPolicyOptions,
  mode: NodeLabelMode,
): Map<string, string> {
  const labelMap = new Map<string, string>();
  const { selectedNodeId, selectedEdgeId, hoveredNodeId, neighborhoodDepth } = state;
  const { showLabelsOnHover } = options;

  // Initialize all labels as empty (hidden)
  graph.forEachNode((nodeId) => {
    labelMap.set(nodeId, "");
  });

  // If showLabelsOnHover is true and a node is hovered, show that node's label temporarily
  if (showLabelsOnHover && hoveredNodeId && graph.hasNode(hoveredNodeId)) {
    const attrs = graph.getNodeAttributes(hoveredNodeId);
    const label = getStoredLabel(attrs);
    labelMap.set(hoveredNodeId, label);
  }

  if (mode === "off") {
    return labelMap;
  }

  if (mode === "all") {
    graph.forEachNode((nodeId) => {
      const attrs = graph.getNodeAttributes(nodeId);
      const label = getStoredLabel(attrs);
      labelMap.set(nodeId, label);
    });
    return labelMap;
  }

  if (mode === "important-only") {
    const importantNodeIds = getImportantNodeIds(graph);
    importantNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const attrs = graph.getNodeAttributes(nodeId);
        const label = getStoredLabel(attrs);
        labelMap.set(nodeId, label);
      }
    });
    return labelMap;
  }

  if (mode === "selected-neighborhood") {
    // If edge selected, show source and target labels
    if (selectedEdgeId) {
      const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);

      // Depth 1: label source and target nodes
      if (neighborhood.sourceId && graph.hasNode(neighborhood.sourceId)) {
        const attrs = graph.getNodeAttributes(neighborhood.sourceId);
        const label = getStoredLabel(attrs);
        labelMap.set(neighborhood.sourceId, label);
      }
      if (neighborhood.targetId && graph.hasNode(neighborhood.targetId)) {
        const attrs = graph.getNodeAttributes(neighborhood.targetId);
        const label = getStoredLabel(attrs);
        labelMap.set(neighborhood.targetId, label);
      }

      // Depth 2: also label secondary node IDs
      if (neighborhoodDepth >= 2) {
        neighborhood.secondaryNodeIds.forEach((nodeId) => {
          if (graph.hasNode(nodeId)) {
            const attrs = graph.getNodeAttributes(nodeId);
            const label = getStoredLabel(attrs);
            labelMap.set(nodeId, label);
          }
        });
      }

      // Depth 3: also label tertiary node IDs
      if (neighborhoodDepth >= 3) {
        neighborhood.tertiaryNodeIds.forEach((nodeId) => {
          if (graph.hasNode(nodeId)) {
            const attrs = graph.getNodeAttributes(nodeId);
            const label = getStoredLabel(attrs);
            labelMap.set(nodeId, label);
          }
        });
      }

      return labelMap;
    }

    // If node selected, show selected node label (all depths)
    if (selectedNodeId && graph.hasNode(selectedNodeId)) {
      const attrs = graph.getNodeAttributes(selectedNodeId);
      const label = getStoredLabel(attrs);
      labelMap.set(selectedNodeId, label);

      // Depth 2: show direct neighbor labels
      if (neighborhoodDepth >= 2) {
        graph.edges(selectedNodeId).forEach((edgeId) => {
          const extremities = graph.extremities(edgeId);
          extremities.forEach((nodeId) => {
            if (nodeId !== selectedNodeId && graph.hasNode(nodeId)) {
              const neighborAttrs = graph.getNodeAttributes(nodeId);
              const neighborLabel = getStoredLabel(neighborAttrs);
              labelMap.set(nodeId, neighborLabel);
            }
          });
        });
      }

      // Depth 3: show secondary neighbor labels
      if (neighborhoodDepth >= 3) {
        const directNeighbors = new Set<string>();
        graph.edges(selectedNodeId).forEach((edgeId) => {
          const extremities = graph.extremities(edgeId);
          extremities.forEach((nodeId) => {
            if (nodeId !== selectedNodeId) {
              directNeighbors.add(nodeId);
            }
          });
        });

        directNeighbors.forEach((neighborId) => {
          if (graph.hasNode(neighborId)) {
            graph.edges(neighborId).forEach((edgeId) => {
              const extremities = graph.extremities(edgeId);
              extremities.forEach((nodeId) => {
                // Show secondary neighbors (not selected node, not direct neighbors)
                if (nodeId !== selectedNodeId && !directNeighbors.has(nodeId) && graph.hasNode(nodeId)) {
                  const attrs = graph.getNodeAttributes(nodeId);
                  const label = getStoredLabel(attrs);
                  labelMap.set(nodeId, label);
                }
              });
            });
          }
        });
      }
      return labelMap;
    }
  }

  return labelMap;
}

/**
 * Apply edge label visibility policy
 * Returns a Map of edge ID to label text (empty string = hidden)
 */
export function applyEdgeLabelVisibility(
  graph: Graph,
  state: GraphInteractionState,
  options: LabelPolicyOptions,
  mode: EdgeLabelMode,
): Map<string, string> {
  const labelMap = new Map<string, string>();
  const { selectedNodeId, selectedEdgeId, hoveredEdgeId, neighborhoodDepth } = state;
  const { maxEdgeLabelLength, showLabelsOnHover } = options;

  // Initialize all labels as empty (hidden)
  graph.forEachEdge((edgeId) => {
    labelMap.set(edgeId, "");
  });

  // If showLabelsOnHover is true and an edge is hovered, show that edge's label temporarily
  if (showLabelsOnHover && hoveredEdgeId && graph.hasEdge(hoveredEdgeId)) {
    const attrs = graph.getEdgeAttributes(hoveredEdgeId);
    const fullLabel = getStoredLabel(attrs);
    const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
    labelMap.set(hoveredEdgeId, truncated);
  }

  if (mode === "off") {
    return labelMap;
  }

  if (mode === "all-short") {
    graph.forEachEdge((edgeId) => {
      const attrs = graph.getEdgeAttributes(edgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
      labelMap.set(edgeId, truncated);
    });
    return labelMap;
  }

  if (mode === "all-medium") {
    graph.forEachEdge((edgeId) => {
      const attrs = graph.getEdgeAttributes(edgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength * 2);
      labelMap.set(edgeId, truncated);
    });
    return labelMap;
  }

  if (mode === "important-only") {
    // v0 heuristic: important nodes are top 20 by degree (for larger graphs) or degree >= 3 (for small graphs)
    // important-only shows labels for edges incident to those important nodes
    // This is a conservative heuristic that can be refined with explicit importance data later
    // Future: Could use edge confidence_score, weight, or node importance from graph artifacts
    const importantNodeIds = getImportantNodeIds(graph);
    const importantEdgeIds = new Set<string>();

    // Collect edges incident to important nodes
    importantNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        graph.edges(nodeId).forEach((edgeId) => {
          importantEdgeIds.add(edgeId);
        });
      }
    });

    // Show labels for important edges (truncated)
    importantEdgeIds.forEach((edgeId) => {
      if (graph.hasEdge(edgeId)) {
        const attrs = graph.getEdgeAttributes(edgeId);
        const fullLabel = getStoredLabel(attrs);
        const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
        labelMap.set(edgeId, truncated);
      }
    });

    return labelMap;
  }

  if (mode === "selected-neighborhood") {
    // If edge selected, show selected edge label
    if (selectedEdgeId && graph.hasEdge(selectedEdgeId)) {
      const attrs = graph.getEdgeAttributes(selectedEdgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
      labelMap.set(selectedEdgeId, truncated);

      // Depth 2: show secondary edge labels
      if (neighborhoodDepth >= 2) {
        // Show all edges connected to source/target except the primary edge
        const extremities = graph.extremities(selectedEdgeId);
        extremities.forEach((nodeId) => {
          graph.edges(nodeId).forEach((edgeId) => {
            if (edgeId !== selectedEdgeId && graph.hasEdge(edgeId)) {
              const edgeAttrs = graph.getEdgeAttributes(edgeId);
              const fullLabel = getStoredLabel(edgeAttrs);
              const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
              labelMap.set(edgeId, truncated);
            }
          });
        });
      }

      // Depth 3: show tertiary edge labels
      if (neighborhoodDepth >= 3) {
        // Show edges connected to secondary nodes (excluding primary and secondary)
        // For v0, this is simplified - full implementation would use getRelationshipNeighborhood
      }
    }

    // If node selected and depth >= 2, show direct connected edge labels
    if (selectedNodeId && neighborhoodDepth >= 2 && graph.hasNode(selectedNodeId)) {
      graph.edges(selectedNodeId).forEach((edgeId) => {
        if (graph.hasEdge(edgeId)) {
          const edgeAttrs = graph.getEdgeAttributes(edgeId);
          const fullLabel = getStoredLabel(edgeAttrs);
          const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
          labelMap.set(edgeId, truncated);
        }
      });
    }

    // If node selected and depth >= 3, show secondary edge labels
    if (selectedNodeId && neighborhoodDepth >= 3 && graph.hasNode(selectedNodeId)) {
      const directNeighbors = new Set<string>();
      graph.edges(selectedNodeId).forEach((edgeId) => {
        const extremities = graph.extremities(edgeId);
        extremities.forEach((nodeId) => {
          if (nodeId !== selectedNodeId) {
            directNeighbors.add(nodeId);
          }
        });
      });

      directNeighbors.forEach((neighborId) => {
        if (graph.hasNode(neighborId)) {
          graph.edges(neighborId).forEach((edgeId) => {
            const extremities = graph.extremities(edgeId);
            // Only show edges that connect to secondary neighbors (not back to selected node)
            if (extremities.includes(selectedNodeId)) {
              return;
            }
            if (graph.hasEdge(edgeId)) {
              const edgeAttrs = graph.getEdgeAttributes(edgeId);
              const fullLabel = getStoredLabel(edgeAttrs);
              const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
              labelMap.set(edgeId, truncated);
            }
          });
        }
      });
    }
  }

  return labelMap;
}
