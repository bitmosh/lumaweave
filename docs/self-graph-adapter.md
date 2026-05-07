/**
 * Self-Graph Adapter
 *
 * Adapts LumaSourceGraph fixture to SigmaGraphView format.
 * Transforms LumaGraphNode/LumaGraphEdge to LumaWeaveNodeDraft/LumaWeaveEdgeDraft.
 */

import type {
  LumaSourceGraph,
} from "./types";
import type {
  LumaWeaveEdgeDraft,
  LumaWeaveNodeDraft,
} from "../graph/schema/graph.types";

function clusterToColor(cluster: string): string {
  const map: Record<string, string> = {
    blue: "#4fa3e0",
    purple: "#a67de8",
    gold: "#e0a84f",
    teal: "#4fd9c8",
    green: "#64d9a4",
    gray: "#6a7485",
  };
  return map[cluster] ?? "#6a7485";
}

function typeToSize(type: string): number {
  const map: Record<string, number> = {
    "code.system": 18,
    "docs.folder": 12,
    "code.file": 8,
    "docs.file": 8,
    "code.test": 6,
    "code.script": 6,
  };
  return map[type] ?? 8;
}

export function adaptSelfGraphToSigma(graph: LumaSourceGraph): {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
} {
  const nodes: LumaWeaveNodeDraft[] = graph.nodes.map((node) => ({
    id: node.id,
    label: node.label,
    type: node.type,
    raw: {
      cluster: node.cluster,
      sourceAdapter: node.sourceAdapter,
      color: clusterToColor(node.cluster ?? "gray"),
      size: typeToSize(node.type),
      ...node.metadata,
    },
  }));

  const edges: LumaWeaveEdgeDraft[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    relationship: edge.type,
    raw: {
      confidence: edge.confidence,
      weight: edge.weight,
      label: edge.label,
      ...edge.metadata,
    },
  }));

  return { nodes, edges };
}
