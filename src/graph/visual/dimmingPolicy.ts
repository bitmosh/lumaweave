// SPDX-License-Identifier: Apache-2.0
import type Graph from "graphology";
import { bfsFromNode } from "graphology-traversal";

export type DimMode = "off" | "outside-cluster" | "outside-pinned";

export interface DimPolicyState {
  mode: DimMode;
  clusterDepth: number;
  selectedNodeId: string | null;
  dimOpacity: number; // from token selection.dim.opacity (default 0.18)
  pinnedDimOpacity?: number; // C9.2: opacity for outside-pinned mode (default 0.45)
  transitionMs: number; // 200ms ease-out
}

/**
 * Apply dimming policy to graph
 * 
 * When dimMode is "outside-cluster", dims nodes/edges outside the selected
 * node's BFS neighborhood (cluster depth). Used for visual focus during
 * inspection.
 * 
 * When dimMode is "outside-pinned" (Pass C9.2), dims nodes/edges that are
 * not in the pinned set. Pinned nodes render at full alpha; everything
 * else dims to pinnedDimOpacity (default 0.45). The pinned set is sourced
 * from the graph-level __gwellsPinnedSet attribute maintained by
 * gwells controller.applyPins.
 * 
 * @param graph - Graphology graph instance
 * @param state - Dimming policy state
 */
export function applyDimPolicy(graph: Graph, state: DimPolicyState): void {
  // Reset path (existing)
  if (state.mode === "off") {
    graph.forEachNode((id) => graph.setNodeAttribute(id, "alpha", 1.0));
    graph.forEachEdge((id) => graph.setEdgeAttribute(id, "alpha", 1.0));
    return;
  }

  // C9.2: outside-pinned mode — pinned nodes bright, others dimmed.
  // Pinned set is sourced from the graph-level __gwellsPinnedSet
  // attribute (maintained by gwells controller.applyPins). If the
  // attribute doesn't exist yet (e.g., before first applyDialect),
  // treat as empty set — everything dims uniformly.
  if (state.mode === "outside-pinned") {
    const pinnedSet: Set<string> = graph.hasAttribute("__gwellsPinnedSet")
      ? graph.getAttribute("__gwellsPinnedSet") as Set<string>
      : new Set<string>();
    const dim = state.pinnedDimOpacity ?? 0.45;
    graph.forEachNode((id) => {
      graph.setNodeAttribute(id, "alpha", pinnedSet.has(id) ? 1.0 : dim);
    });
    graph.forEachEdge((id, _attrs, src, tgt) => {
      // Edges between two pinned nodes stay bright; everything else dims
      const bothPinned = pinnedSet.has(src) && pinnedSet.has(tgt);
      graph.setEdgeAttribute(id, "alpha", bothPinned ? 1.0 : dim);
    });
    return;
  }

  // Existing outside-cluster path
  if (!state.selectedNodeId) {
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
