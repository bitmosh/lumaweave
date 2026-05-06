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
