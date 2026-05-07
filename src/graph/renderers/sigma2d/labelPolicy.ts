/**
 * LumaWeave Label Policy Helpers
 * Functions for controlling node and edge label visibility and truncation
 */

import Graph from "graphology";

export interface SelectionContext {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  neighborhoodDepth: number;
  hoveredNodeId: string | null;
}

export interface LabelPolicyOptions {
  maxEdgeLabelLength: number;
  showLabelsOnHover: boolean;
  hoverLabelColor: string;
}

export type NodeLabelMode = "off" | "selected-neighborhood" | "important-only" | "all";
export type EdgeLabelMode = "off" | "selected-neighborhood" | "important-only" | "all-short" | "all-medium";

/**
 * Get the stored label from attributes, avoiding reliance on the "label" field
 * which may have been reset by the label policy.
 * This prevents reading empty strings after labels have been cleared.
 */
function getStoredLabel(attrs: any): string {
  return String(attrs.fullLabel ?? attrs.originalLabel ?? "");
}

/**
 * Truncate a label to a maximum length with ellipsis
 */
export function truncateLabel(label: string, maxLength: number): string {
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
 */
function getImportantNodeIds(graph: Graph, threshold: number = 3): Set<string> {
  const importantNodes = new Set<string>();
  const nodeDegrees: Array<{ nodeId: string; degree: number }> = [];

  graph.forEachNode((nodeId) => {
    const degree = getNodeDegree(graph, nodeId);
    nodeDegrees.push({ nodeId, degree });
  });

  // Sort by degree descending
  nodeDegrees.sort((a, b) => b.degree - a.degree);

  // Add nodes meeting threshold or top 20
  for (let i = 0; i < nodeDegrees.length; i++) {
    const { nodeId, degree } = nodeDegrees[i];
    if (degree >= threshold || i < 20) {
      importantNodes.add(nodeId);
    }
  }

  return importantNodes;
}

/**
 * Apply node label policy to graph
 */
export function applyNodeLabelPolicy(
  graph: Graph,
  selectionContext: SelectionContext,
  options: LabelPolicyOptions,
  mode: NodeLabelMode,
): void {
  const depth = Math.floor(selectionContext.neighborhoodDepth || 2) as 1 | 2 | 3;
  const { selectedNodeId, selectedEdgeId, hoveredNodeId } = selectionContext;
  const { showLabelsOnHover } = options;

  // Reset all node labels to empty
  graph.forEachNode((nodeId) => {
    graph.setNodeAttribute(nodeId, "label", "");
  });

  // If showLabelsOnHover is true and a node is hovered, show that node's label
  if (showLabelsOnHover && hoveredNodeId && graph.hasNode(hoveredNodeId)) {
    const attrs = graph.getNodeAttributes(hoveredNodeId);
    const label = getStoredLabel(attrs);
    graph.setNodeAttribute(hoveredNodeId, "label", label);
  }

  if (mode === "off") {
    return;
  }

  if (mode === "all") {
    graph.forEachNode((nodeId) => {
      const attrs = graph.getNodeAttributes(nodeId);
      const label = getStoredLabel(attrs);
      graph.setNodeAttribute(nodeId, "label", label);
    });
    return;
  }

  if (mode === "important-only") {
    const importantNodeIds = getImportantNodeIds(graph);
    importantNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const attrs = graph.getNodeAttributes(nodeId);
        const label = getStoredLabel(attrs);
        graph.setNodeAttribute(nodeId, "label", label);
      }
    });
    return;
  }

  if (mode === "selected-neighborhood") {
    const importantNodeIds = getImportantNodeIds(graph);

    // If edge selected, show source and target labels
    if (selectedEdgeId) {
      if (graph.hasEdge(selectedEdgeId)) {
        const extremities = graph.extremities(selectedEdgeId);
        extremities.forEach((nodeId) => {
          if (graph.hasNode(nodeId)) {
            const attrs = graph.getNodeAttributes(nodeId);
            const label = getStoredLabel(attrs);
            graph.setNodeAttribute(nodeId, "label", label);
          }
        });
      }
      return;
    }

    // If node selected, show selected node label (all stages)
    if (selectedNodeId && graph.hasNode(selectedNodeId)) {
      const attrs = graph.getNodeAttributes(selectedNodeId);
      const label = getStoredLabel(attrs);
      graph.setNodeAttribute(selectedNodeId, "label", label);

      // Stage 2: show direct neighbor labels
      if (depth >= 2) {
        graph.edges(selectedNodeId).forEach((edgeId) => {
          const extremities = graph.extremities(edgeId);
          extremities.forEach((nodeId) => {
            if (nodeId !== selectedNodeId && graph.hasNode(nodeId)) {
              const neighborAttrs = graph.getNodeAttributes(nodeId);
              const neighborLabel = getStoredLabel(neighborAttrs);
              graph.setNodeAttribute(nodeId, "label", neighborLabel);
            }
          });
        });
      }

      // Stage 3: show secondary neighbor labels
      if (depth >= 3) {
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
                  graph.setNodeAttribute(nodeId, "label", label);
                }
              });
            });
          }
        });
      }
      return;
    }

    // If no selection, show important/core labels only
    importantNodeIds.forEach((nodeId) => {
      if (graph.hasNode(nodeId)) {
        const attrs = graph.getNodeAttributes(nodeId);
        const label = getStoredLabel(attrs);
        graph.setNodeAttribute(nodeId, "label", label);
      }
    });
  }
}

/**
 * Apply edge label policy to graph
 */
export function applyEdgeLabelPolicy(
  graph: Graph,
  selectionContext: SelectionContext,
  options: LabelPolicyOptions,
  mode: EdgeLabelMode,
): void {
  const depth = Math.floor(selectionContext.neighborhoodDepth || 2) as 1 | 2 | 3;
  const { selectedNodeId, selectedEdgeId } = selectionContext;
  const { maxEdgeLabelLength } = options;

  // Reset all edge labels to empty
  graph.forEachEdge((edgeId) => {
    graph.setEdgeAttribute(edgeId, "label", "");
  });

  if (mode === "off") {
    return;
  }

  if (mode === "all-short") {
    graph.forEachEdge((edgeId) => {
      const attrs = graph.getEdgeAttributes(edgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
      graph.setEdgeAttribute(edgeId, "label", truncated);
    });
    return;
  }

  if (mode === "all-medium") {
    graph.forEachEdge((edgeId) => {
      const attrs = graph.getEdgeAttributes(edgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength * 2);
      graph.setEdgeAttribute(edgeId, "label", truncated);
    });
    return;
  }

  if (mode === "important-only") {
    // For now, hide labels unless selected (no confidence/weight data yet)
    // Future: show labels for edges with high confidence/weight
    return;
  }

  if (mode === "selected-neighborhood") {
    // If edge selected, show selected edge label
    if (selectedEdgeId && graph.hasEdge(selectedEdgeId)) {
      const attrs = graph.getEdgeAttributes(selectedEdgeId);
      const fullLabel = getStoredLabel(attrs);
      const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
      graph.setEdgeAttribute(selectedEdgeId, "label", truncated);

      // Stage 2: show secondary edge labels
      if (depth >= 2) {
        // Get relationship neighborhood for secondary edges
        // For now, we'll show all edges connected to source/target except the primary edge
        // This is a simplification - full implementation would use getRelationshipNeighborhood
        const extremities = graph.extremities(selectedEdgeId);
        extremities.forEach((nodeId) => {
          graph.edges(nodeId).forEach((edgeId) => {
            if (edgeId !== selectedEdgeId && graph.hasEdge(edgeId)) {
              const edgeAttrs = graph.getEdgeAttributes(edgeId);
              const fullLabel = getStoredLabel(edgeAttrs);
              const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
              graph.setEdgeAttribute(edgeId, "label", truncated);
            }
          });
        });
      }

      // Stage 3: show tertiary edge labels
      if (depth >= 3) {
        // Show edges connected to secondary nodes (excluding primary and secondary)
        // This would use getRelationshipNeighborhood with tertiary edges
        // For v0, we keep it simple and show all connected edges at stage 2+
      }
    }

    // If node selected and stage >= 2, show direct connected edge labels
    if (selectedNodeId && depth >= 2 && graph.hasNode(selectedNodeId)) {
      graph.edges(selectedNodeId).forEach((edgeId) => {
        if (graph.hasEdge(edgeId)) {
          const edgeAttrs = graph.getEdgeAttributes(edgeId);
          const fullLabel = getStoredLabel(edgeAttrs);
          const truncated = truncateLabel(fullLabel, maxEdgeLabelLength);
          graph.setEdgeAttribute(edgeId, "label", truncated);
        }
      });
    }

    // If node selected and stage >= 3, show secondary edge labels
    if (selectedNodeId && depth >= 3 && graph.hasNode(selectedNodeId)) {
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
              graph.setEdgeAttribute(edgeId, "label", truncated);
            }
          });
        }
      });
    }
  }
}
