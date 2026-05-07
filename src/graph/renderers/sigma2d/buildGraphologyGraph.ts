/**
 * LumaWeave Graphology Graph Builder
 * Converts normalized LumaWeave nodes/edges into a Graphology graph.
 */

import Graph from "graphology";
import noverlap from "graphology-layout-noverlap";
import louvain from "graphology-communities-louvain";
import { degree } from "graphology-metrics/centrality";
import {
  connectedComponents,
  countConnectedComponents,
  largestConnectedComponent,
} from "graphology-components";
import type {
  LumaWeaveEdgeDraft,
  LumaWeaveNodeDraft,
} from "../../schema/graph.types";

export interface LayoutSettings {
  nodeSize: number;
  linkDistance: number;
  repelForce: number;
  centerForce: number;
  physicsDialect: "default" | "helix";
  nodeColorScale?: string[]; // theme-driven
}

/**
 * Generate a sunflower/golden-angle position for a node.
 * This spreads nodes evenly in a spiral pattern.
 */
function getSunflowerPosition(
  index: number,
  layoutScale: number,
): { x: number; y: number } {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const radius = Math.sqrt(index + 1) * layoutScale;
  const angle = index * goldenAngle;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Group nodes by their cluster attribute.
 * Returns clusters sorted by size (largest first).
 */
function groupByCluster(
  nodes: LumaWeaveNodeDraft[]
): Map<string, LumaWeaveNodeDraft[]> {
  const clusters = new Map<string, LumaWeaveNodeDraft[]>();
  nodes.forEach((node) => {
    const cluster = (node.raw?.cluster as string) ?? "gray";
    if (!clusters.has(cluster)) clusters.set(cluster, []);
    clusters.get(cluster)!.push(node);
  });
  // Sort by size descending — largest cluster = backbone
  return new Map(
    [...clusters.entries()].sort((a, b) => b[1].length - a[1].length)
  );
}

/**
 * Map Louvain community numbers to brand cluster colors.
 * Community 0 → blue, 1 → purple, 2 → gold, 3 → teal, 4 → green, 5+ → gray
 */
function mapCommunityToCluster(community: number): string {
  const clusterMap: Record<number, string> = {
    0: "blue",
    1: "purple",
    2: "gold",
    3: "teal",
    4: "green",
  };
  return clusterMap[community] ?? "gray";
}

/**
 * Run Louvain community detection and assign clusters to nodes
 * that don't already have a cluster assigned.
 */
function assignLouvainCommunities(
  nodes: LumaWeaveNodeDraft[],
  graph: Graph
): void {
  // Run Louvain on the graph - assigns community as node attribute
  louvain.assign(graph);

  // Assign cluster to nodes that don't have one
  nodes.forEach((node) => {
    if (!node.raw?.cluster) {
      const community = graph.getNodeAttribute(node.id, "community") as number;
      const clusterColor = mapCommunityToCluster(community);
      node.raw = { ...node.raw, cluster: clusterColor };
    }
  });

  console.log("Louvain communities assigned", {
    totalNodes: nodes.length,
  });
}

/**
 * Get helix position for a node on the backbone.
 * Arranges nodes along a 3D-projected helix spiral.
 */
function getHelixPosition(
  index: number,
  total: number,
  helixRadius: number,
  helixPitch: number,
  helixTurns: number,
): { x: number; y: number } {
  const t = (index / Math.max(total - 1, 1)) * helixTurns * 2 * Math.PI;
  return {
    x: Math.cos(t) * helixRadius,
    y: (t / (2 * Math.PI)) * helixPitch - (helixTurns * helixPitch) / 2,
  };
}

/**
 * Get constellation branch position.
 * Spreads branch nodes in a small cluster around
 * their nearest backbone node position.
 */
function getBranchPosition(
  index: number,
  total: number,
  anchorX: number,
  anchorY: number,
  branchRadius: number,
): { x: number; y: number } {
  const angle = (index / Math.max(total, 1)) * 2 * Math.PI;
  const r = branchRadius * (0.4 + 0.6 * (index / Math.max(total, 1)));
  return {
    x: anchorX + Math.cos(angle) * r,
    y: anchorY + Math.sin(angle) * r,
  };
}

/**
 * Apply helix layout to graph.
 * Places largest cluster along helix backbone,
 * remaining clusters as constellation branches.
 */
function applyHelixLayout(
  nodes: LumaWeaveNodeDraft[],
  graph: Graph,
): void {
  const helixRadius = 120;
  const helixPitch = 80;
  const helixTurns = 3;
  const branchRadius = 60;

  const clusters = groupByCluster(nodes);
  const clusterEntries = [...clusters.entries()];

  // Largest cluster = backbone helix
  const [backboneCluster, backboneNodes] = clusterEntries[0] ?? [];
  const backbonePositions: { x: number; y: number }[] = [];

  // Place backbone nodes along helix
  if (backboneNodes) {
    backboneNodes.forEach((node, i) => {
      const pos = getHelixPosition(
        i, backboneNodes.length,
        helixRadius, helixPitch, helixTurns
      );
      backbonePositions.push(pos);
      graph.setNodeAttribute(node.id, "x", pos.x);
      graph.setNodeAttribute(node.id, "y", pos.y);
    });
  }

  // Remaining clusters = constellation branches
  clusterEntries.slice(1).forEach(([, branchNodes], clusterIdx) => {
    // Find nearest backbone position for this branch
    const anchorIdx = Math.floor(
      (clusterIdx / (clusterEntries.length - 1)) *
      Math.max(backbonePositions.length - 1, 0)
    );
    const anchor = backbonePositions[anchorIdx] ?? { x: 0, y: 0 };

    // Spread branch nodes around anchor
    branchNodes.forEach((node, i) => {
      const pos = getBranchPosition(
        i, branchNodes.length,
        anchor.x, anchor.y, branchRadius
      );
      graph.setNodeAttribute(node.id, "x", pos.x);
      graph.setNodeAttribute(node.id, "y", pos.y);
    });
  });

  console.log("Helix layout applied", {
    backboneCluster,
    backboneSize: backboneNodes?.length ?? 0,
    branchClusters: clusterEntries.length - 1,
  });
}

export interface GraphBuildResult {
  graph: Graph;
  diagnostics: {
    order: number;
    size: number;
    uniqueX: number;
    uniqueY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    sample: Array<{ id: string; x: number; y: number; label: string }>;
    componentCount: number;
    isolatedNodeCount: number;
    largestComponentSize: number;
  };
}

/**
 * Build a Graphology graph from normalized LumaWeave nodes and edges.
 */
export function buildGraphologyGraph(
  nodes: LumaWeaveNodeDraft[],
  edges: LumaWeaveEdgeDraft[],
  settings: LayoutSettings,
): GraphBuildResult {
  console.log("Building Graphology graph", {
    inputNodes: nodes.length,
    inputEdges: edges.length,
  });

  const graph = new Graph();

  const layoutScale =
    18 + settings.linkDistance * 0.2 + settings.repelForce * 0.08;

  const baseSize = 10;

  nodes.forEach((node, index) => {
    try {
      const position = getSunflowerPosition(index, layoutScale);

      graph.addNode(node.id, {
        x: position.x,
        y: position.y,
        label: node.label,
        fullLabel: node.label,
        originalLabel: node.label,
        size: ((node.raw?.size as number) ?? baseSize) * settings.nodeSize,
        baseSize: (node.raw?.size as number) ?? baseSize,
        color: (node.raw?.color as string) ?? "#22d3ee",
        nodeType: node.type || "unknown",
        raw: node.raw,
      });
    } catch (error) {
      console.warn(`Failed to add node ${node.id}:`, error);
    }
  });

  edges.forEach((edge) => {
    try {
      const relationshipLabel = edge.relationship || "related";
      graph.addEdgeWithKey(edge.id, edge.source, edge.target, {
        id: edge.id,
        relationship: relationshipLabel,
        label: relationshipLabel,
        fullLabel: relationshipLabel,
        originalLabel: relationshipLabel,
        color: (edge.raw?.color as string) ?? "rgba(100,130,180,0.55)",
        size: (edge.raw?.size as number) ?? 1.5,
        raw: edge.raw,
      });
    } catch (error) {
      console.warn(`Failed to add edge ${edge.id}:`, error);
    }
  });

  // Degree centrality — boost size of well-connected nodes
  const centralityScores = degree(graph);
  const maxCentrality = Math.max(
    1,
    ...Object.values(centralityScores)
  );

  graph.forEachNode((nodeId) => {
    const attrs = graph.getNodeAttributes(nodeId);
    const baseSz = (attrs.baseSize as number) ?? 8;
    const c = (centralityScores[nodeId] ?? 0) as number;
    const normalized = c / maxCentrality;
    // Blend: base size + up to 80% boost for most connected
    const newSize = baseSz * (1 + normalized * 0.8);
    graph.setNodeAttribute(
      nodeId, "size", newSize * settings.nodeSize
    );
    graph.setNodeAttribute(nodeId, "baseSize", newSize);
  });

  // Apply theme-driven color scale by centrality rank
  if (settings.nodeColorScale &&
      settings.nodeColorScale.length > 0) {
    const scale = settings.nodeColorScale;
    const scaleLen = scale.length;

    // Sort nodes by centrality score
    const sortedNodes = graph.nodes().sort((a, b) => {
      const ca = (centralityScores[a] ?? 0) as number;
      const cb = (centralityScores[b] ?? 0) as number;
      return ca - cb; // ascending: low → high
    });

    sortedNodes.forEach((nodeId, rank) => {
      const scaleIndex = Math.min(
        Math.floor(
          (rank / Math.max(sortedNodes.length - 1, 1))
          * scaleLen
        ),
        scaleLen - 1
      );
      const color = scale[scaleIndex];
      graph.setNodeAttribute(nodeId, "color", color);
      // Update raw.color so resetGraphStyles preserves it
      const attrs = graph.getNodeAttributes(nodeId);
      graph.setNodeAttribute(nodeId, "raw", {
        ...(attrs.raw as object ?? {}),
        color,
      });
    });
  }

  // Apply dialect-specific layout seeding
  if (settings.physicsDialect === "helix") {
    // Run Louvain community detection before helix layout
    // to assign clusters to nodes that don't have them
    assignLouvainCommunities(nodes, graph);
    applyHelixLayout(nodes, graph);
  }

  // Apply ForceAtlas2 force simulation
  // Moved to SigmaGraphView.tsx as continuous supervisor
  // Initial sunflower positions seed the layout

  // Anti-collision pass — nudges nodes apart
  // after FA2 settles the layout
  noverlap.assign(graph, {
    maxIterations: 50,
    settings: {
      ratio: 1.2,
      margin: 2,
      speed: 3,
      gridSize: 25,
      expansion: 1.5,
    },
  });

  // Connected components analysis
  const componentCount = countConnectedComponents(graph);
  const components = connectedComponents(graph);
  const largestComponent = largestConnectedComponent(graph);
  const largestComponentSet = new Set(largestComponent);

  // Tag each node with component attributes
  components.forEach((component, index) => {
    const isIsolated = component.length === 1;
    const isLargest = component.every(id => largestComponentSet.has(id));
    component.forEach(nodeId => {
      graph.setNodeAttribute(nodeId, "componentIndex", index);
      graph.setNodeAttribute(nodeId, "isIsolated", isIsolated);
      graph.setNodeAttribute(nodeId, "isInLargestComponent", isLargest);
    });
  });

  // Add graph-level attributes for diagnostics
  graph.setAttribute("componentCount", componentCount);
  graph.setAttribute(
    "isolatedNodeCount",
    components.filter(c => c.length === 1).length
  );
  graph.setAttribute(
    "largestComponentSize",
    largestComponent.length
  );

  const nodePositions = graph.nodes().map((id) => {
    const attrs = graph.getNodeAttributes(id);

    return {
      id,
      x: Number(attrs.x),
      y: Number(attrs.y),
      label: String(attrs.label ?? id),
    };
  });

  const xValues = nodePositions.map((node) => node.x);
  const yValues = nodePositions.map((node) => node.y);

  const diagnostics = {
    order: graph.order,
    size: graph.size,
    uniqueX: new Set(xValues).size,
    uniqueY: new Set(yValues).size,
    minX: xValues.length ? Math.min(...xValues) : 0,
    maxX: xValues.length ? Math.max(...xValues) : 0,
    minY: yValues.length ? Math.min(...yValues) : 0,
    maxY: yValues.length ? Math.max(...yValues) : 0,
    sample: nodePositions.slice(0, 10),
    componentCount,
    isolatedNodeCount: components.filter(c => c.length === 1).length,
    largestComponentSize: largestComponent.length,
  };

  console.log("Graphology layout diagnostics", diagnostics);

  console.log("Graphology output", {
    order: graph.order,
    size: graph.size,
    sampleNodes: graph.nodes().slice(0, 5).map((id) => ({
      id,
      attrs: graph.getNodeAttributes(id),
    })),
  });

  return {
    graph,
    diagnostics,
  };
}
