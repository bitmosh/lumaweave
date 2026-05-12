/**
 * Self-Graph Adapter
 *
 * Adapts LumaSourceGraph fixture to SigmaGraphView format.
 * Transforms LumaGraphNode/LumaGraphEdge to LumaWeaveNodeDraft/LumaWeaveEdgeDraft.
 *
 * Supports both v0 (legacy) and v1 (lumaweave-self-graph/v1) schemas.
 */

import type {
  LumaSourceGraph,
  LumaGraphNodeV0,
  LumaGraphNodeV1,
  LumaGraphEdgeV0,
  LumaGraphEdgeV1,
} from "./types";
import type {
  LumaWeaveEdgeDraft,
  LumaWeaveNodeDraft,
} from "../graph/schema/graph.types";

function clusterToColor(cluster: string | null | undefined): string {
  if (!cluster) return "#6a7485";
  const map: Record<string, string> = {
    azure: "#4fa3e0",
    blue: "#4fa3e0",
    purple: "#a67de8",
    gold: "#e0a84f",
    teal: "#4fd9c8",
    green: "#64d9a4",
    gray: "#6a7485",
    slate: "#6b7280",
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
    // v1 types
    "doc": 10,
    "code": 8,
    "config": 8,
    "fixture": 6,
    "spine": 14,
  };
  return map[type] ?? 8;
}

function edgeTypeToColor(type: string): string {
  const map: Record<string, string> = {
    "contains":   "rgba(79,163,224,0.45)",
    "governs":    "rgba(166,125,232,0.45)",
    "depends_on": "rgba(79,217,200,0.45)",
    "related":    "rgba(100,217,164,0.45)",
    "imports":    "rgba(224,168,79,0.45)",
    // v1 edge types
    "explicit-reference": "rgba(224,168,79,0.55)",
    "wiki-link":          "rgba(166,125,232,0.45)",
    "markdown-link":      "rgba(79,217,200,0.45)",
    "code-import":        "rgba(224,168,79,0.5)",
    "tag-overlap":        "rgba(100,217,164,0.35)",
    "describes":           "rgba(79,163,224,0.4)",
  };
  return map[type] ?? "rgba(100,130,180,0.4)";
}

export function adaptSelfGraphToSigma(graph: LumaSourceGraph): {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
} {
  // Detect schema version
  const isV1 = graph.schemaVersion === "lumaweave-self-graph/v1";

  const nodes: LumaWeaveNodeDraft[] = graph.nodes.map((node) => {
    if (isV1) {
      // v1 schema: node has type, path, cluster, status, tags, size, lastModified, raw
      const v1Node = node as LumaGraphNodeV1;
      return {
        id: v1Node.id,
        label: v1Node.label,
        type: v1Node.type,
        raw: {
          cluster: v1Node.cluster,
          path: v1Node.path,
          status: v1Node.status,
          tags: v1Node.tags,
          color: v1Node.raw?.color ?? clusterToColor(v1Node.cluster),
          size: v1Node.size,
          dimFactor: v1Node.raw?.dimFactor,
          // Preserve backward compatibility fields
          sourceAdapter: "self-graph-v1",
        },
      };
    } else {
      // v0 schema: node has sourceAdapter, metadata
      const v0Node = node as LumaGraphNodeV0;
      return {
        id: v0Node.id,
        label: v0Node.label,
        type: v0Node.type,
        raw: {
          cluster: v0Node.cluster,
          sourceAdapter: v0Node.sourceAdapter,
          color: clusterToColor(v0Node.cluster ?? "gray"),
          size: typeToSize(v0Node.type),
          ...v0Node.metadata,
        },
      };
    }
  });

  const edges: LumaWeaveEdgeDraft[] = graph.edges.map((edge) => {
    if (isV1) {
      // v1 schema: edge has weight, bidirectional, provenance, raw
      const v1Edge = edge as LumaGraphEdgeV1;
      return {
        id: v1Edge.id,
        source: v1Edge.source,
        target: v1Edge.target,
        relationship: v1Edge.type,
        raw: {
          confidence: v1Edge.weight > 0.8 ? "high" : v1Edge.weight > 0.5 ? "medium" : "low",
          weight: v1Edge.weight,
          label: v1Edge.raw?.label,
          color: v1Edge.raw?.color ?? edgeTypeToColor(v1Edge.type),
          size: 1.5,
          provenance: v1Edge.provenance,
          bidirectional: v1Edge.bidirectional,
        },
      };
    } else {
      // v0 schema: edge has confidence, metadata
      const v0Edge = edge as LumaGraphEdgeV0;
      return {
        id: v0Edge.id,
        source: v0Edge.source,
        target: v0Edge.target,
        relationship: v0Edge.type,
        raw: {
          confidence: v0Edge.confidence,
          weight: v0Edge.weight,
          label: v0Edge.label,
          color: edgeTypeToColor(v0Edge.type),
          size: 1.5,
          ...v0Edge.metadata,
        },
      };
    }
  });

  return { nodes, edges };
}
