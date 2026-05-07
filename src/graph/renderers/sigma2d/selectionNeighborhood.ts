/**
 * LumaWeave Selection Neighborhood Helpers
 * Functions for computing relationship neighborhoods in Graphology graphs
 */

import Graph from "graphology";
import { bfsFromNode } from "graphology-traversal";

/**
 * Get the source and target node IDs for an edge
 */
export function getEdgeEndpointNodeIds(
  graph: Graph,
  edgeId: string,
): { source: string; target: string } | null {
  if (!graph.hasEdge(edgeId)) {
    return null;
  }

  const extremities = graph.extremities(edgeId);
  return {
    source: extremities[0],
    target: extremities[1],
  };
}

/**
 * Get all edge IDs connected to a node
 */
export function getConnectedEdgeIds(graph: Graph, nodeId: string): string[] {
  if (!graph.hasNode(nodeId)) {
    return [];
  }

  return graph.edges(nodeId);
}

/**
 * Get the opposite node ID for an edge given one endpoint
 */
export function getOppositeNodeId(
  graph: Graph,
  edgeId: string,
  nodeId: string,
): string | null {
  if (!graph.hasEdge(edgeId)) {
    return null;
  }

  const extremities = graph.extremities(edgeId);
  if (extremities[0] === nodeId) {
    return extremities[1];
  }
  if (extremities[1] === nodeId) {
    return extremities[0];
  }

  return null;
}

/**
 * Get the relationship neighborhood for a selected edge
 * Returns:
 * - sourceId, targetId: the endpoint nodes
 * - secondaryEdgeIds: edges connected to source or target (excluding the selected edge)
 * - secondaryNodeIds: nodes connected through those secondary edges
 * - tertiaryEdgeIds: edges connected to secondary nodes (excluding primary and secondary edges) - for stage 3
 * - tertiaryNodeIds: nodes connected through tertiary edges - for stage 3
 */
export function getRelationshipNeighborhood(
  graph: Graph,
  edgeId: string,
): {
  sourceId: string | null;
  targetId: string | null;
  secondaryEdgeIds: string[];
  secondaryNodeIds: string[];
  tertiaryEdgeIds: string[];
  tertiaryNodeIds: string[];
} {
  const endpoints = getEdgeEndpointNodeIds(graph, edgeId);
  if (!endpoints) {
    return {
      sourceId: null,
      targetId: null,
      secondaryEdgeIds: [],
      secondaryNodeIds: [],
      tertiaryEdgeIds: [],
      tertiaryNodeIds: [],
    };
  }

  const { source, target } = endpoints;
  const secondaryEdgeIds = new Set<string>();
  const secondaryNodeIds = new Set<string>();
  const tertiaryEdgeIds = new Set<string>();
  const tertiaryNodeIds = new Set<string>();

  // Get edges connected to source node
  const sourceEdges = getConnectedEdgeIds(graph, source);
  sourceEdges.forEach((e) => {
    if (e !== edgeId) {
      secondaryEdgeIds.add(e);
      const opposite = getOppositeNodeId(graph, e, source);
      if (opposite) {
        secondaryNodeIds.add(opposite);
      }
    }
  });

  // Get edges connected to target node
  const targetEdges = getConnectedEdgeIds(graph, target);
  targetEdges.forEach((e) => {
    if (e !== edgeId) {
      secondaryEdgeIds.add(e);
      const opposite = getOppositeNodeId(graph, e, target);
      if (opposite) {
        secondaryNodeIds.add(opposite);
      }
    }
  });

  // Remove the source and target nodes from secondary nodes
  secondaryNodeIds.delete(source);
  secondaryNodeIds.delete(target);

  // Stage 3: compute tertiary edges (edges connected to secondary nodes, excluding primary and secondary)
  secondaryNodeIds.forEach((secondaryNodeId) => {
    if (graph.hasNode(secondaryNodeId)) {
      const tertiaryEdges = getConnectedEdgeIds(graph, secondaryNodeId);
      tertiaryEdges.forEach((e) => {
        // Exclude primary edge and edges that connect back to source or target
        if (e !== edgeId) {
          const extremities = graph.extremities(e);
          const connectsToPrimary = extremities.includes(source) || extremities.includes(target);
          if (!connectsToPrimary) {
            tertiaryEdgeIds.add(e);
            const opposite = getOppositeNodeId(graph, e, secondaryNodeId);
            if (opposite && !secondaryNodeIds.has(opposite) && opposite !== source && opposite !== target) {
              tertiaryNodeIds.add(opposite);
            }
          }
        }
      });
    }
  });

  return {
    sourceId: source,
    targetId: target,
    secondaryEdgeIds: Array.from(secondaryEdgeIds),
    secondaryNodeIds: Array.from(secondaryNodeIds),
    tertiaryEdgeIds: Array.from(tertiaryEdgeIds),
    tertiaryNodeIds: Array.from(tertiaryNodeIds),
  };
}

/**
 * Get the node neighborhood for a selected node using BFS traversal
 * Returns:
 * - directEdgeIds: edges directly connected to the node (primary edges)
 * - directNeighborNodeIds: nodes directly connected through those edges (secondary nodes)
 * - secondaryEdgeIds: edges connected to direct neighbors, excluding direct edges (secondary edges for depth 3)
 * - tertiaryNodeIds: nodes connected through secondary edges, excluding selected and direct neighbors (ternary nodes for depth 3)
 */
export function getNodeNeighborhood(
  graph: Graph,
  nodeId: string,
): {
  directEdgeIds: string[];
  directNeighborNodeIds: string[];
  secondaryEdgeIds: string[];
  tertiaryNodeIds: string[];
} {
  if (!graph.hasNode(nodeId)) {
    return {
      directEdgeIds: [],
      directNeighborNodeIds: [],
      secondaryEdgeIds: [],
      tertiaryNodeIds: [],
    };
  }

  const directEdgeIds = new Set<string>();
  const directNeighborNodeIds = new Set<string>();
  const secondaryEdgeIds = new Set<string>();
  const tertiaryNodeIds = new Set<string>();

  // BFS to find neighbors at different depths
  bfsFromNode(graph, nodeId, (visitedNode, _attr, d) => {
    if (visitedNode === nodeId) return;
    
    if (d === 1) {
      directNeighborNodeIds.add(visitedNode);
      // find edges between nodeId and visitedNode
      graph.forEachEdge(nodeId, (edgeId, _attrs, src, tgt) => {
        if (src === visitedNode || tgt === visitedNode) {
          directEdgeIds.add(edgeId);
        }
      });
    } else if (d === 2) {
      // Find edges connecting depth 1 nodes to depth 2 nodes
      graph.forEachEdge(visitedNode, (edgeId, _attrs, src, tgt) => {
        if (directNeighborNodeIds.has(src) || directNeighborNodeIds.has(tgt) || src === nodeId || tgt === nodeId) {
          secondaryEdgeIds.add(edgeId);
        }
      });
    } else if (d === 3) {
      // Add depth 3 nodes as tertiary
      tertiaryNodeIds.add(visitedNode);
    }
    // Stop at depth 3
    if (d >= 3) return true;
  }, { mode: "outbound" });

  return {
    directEdgeIds: [...directEdgeIds],
    directNeighborNodeIds: [...directNeighborNodeIds],
    secondaryEdgeIds: [...secondaryEdgeIds],
    tertiaryNodeIds: [...tertiaryNodeIds],
  };
}
