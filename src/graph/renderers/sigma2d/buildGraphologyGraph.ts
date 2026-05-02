/**
 * LumaWeave Graphology Graph Builder
 * Converts normalized LumaWeave nodes/edges into a Graphology graph.
 */

import Graph from "graphology";
import type {
  LumaWeaveEdgeDraft,
  LumaWeaveNodeDraft,
} from "../../schema/graph.types";

export interface LayoutSettings {
  nodeSize: number;
  linkDistance: number;
  repelForce: number;
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
  const size = baseSize * settings.nodeSize;

  nodes.forEach((node, index) => {
    const position = getSunflowerPosition(index, layoutScale);

    graph.addNode(node.id, {
      x: position.x,
      y: position.y,
      label: node.label,
      fullLabel: node.label,
      originalLabel: node.label,
      size,
      baseSize: size,
      color: "#22d3ee",
      nodeType: node.type || "unknown",
      raw: node.raw,
    });
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
        color: "#64748b",
        size: 3,
        raw: edge.raw,
      });
    } catch (error) {
      console.warn(`Failed to add edge ${edge.id}:`, error);
    }
  });

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
