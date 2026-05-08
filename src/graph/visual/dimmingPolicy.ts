import type Graph from "graphology";
import { bfsFromNode } from "graphology-traversal";

export type DimMode = "off" | "outside-cluster";

export interface DimPolicyState {
  mode: DimMode;
  clusterDepth: number;
  selectedNodeId: string | null;
  dimOpacity: number; // from token selection.dim.opacity (default 0.18)
  transitionMs: number; // 200ms ease-out
}

/**
 * Apply dimming policy to graph
 * 
 * When dimMode is "outside-cluster", dims nodes/edges outside the selected
 * node's BFS neighborhood (cluster depth). Used for visual focus during
 * inspection.
 * 
 * @param graph - Graphology graph instance
 * @param state - Dimming policy state
 */
export function applyDimPolicy(graph: Graph, state: DimPolicyState): void {
  if (state.mode === "off" || !state.selectedNodeId) {
    graph.forEachNode((id) => graph.setNodeAttribute(id, "alpha", 1.0));
    graph.forEachEdge((id) => graph.setEdgeAttribute(id, "alpha", 1.0));
    return;
  }

  const lit = new Set<string>();

  bfsFromNode(graph, state.selectedNodeId, (visitedNode) => {
    lit.add(visitedNode);
    // Stop at cluster depth
  }, { mode: "outbound" });

  graph.forEachNode((nodeId) => {
    graph.setNodeAttribute(nodeId, "alpha", lit.has(nodeId) ? 1.0 : state.dimOpacity);
  });

  graph.forEachEdge((edgeId, _attrs, sourceId, targetId) => {
    graph.setEdgeAttribute(edgeId, "alpha",
      (lit.has(sourceId) && lit.has(targetId)) ? 1.0 : state.dimOpacity);
  });
}
