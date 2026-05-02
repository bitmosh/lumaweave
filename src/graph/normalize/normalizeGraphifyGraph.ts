/**
 * LumaWeave Graphify Graph Normalizer
 * Converts raw Graphify graph artifacts into clean internal LumaWeave graph model
 */

import type {
  RawGraphArtifact,
  LumaWeaveNodeDraft,
  LumaWeaveEdgeDraft,
} from "../schema/graph.types";

export type NormalizationResult = {
  nodes: LumaWeaveNodeDraft[];
  edges: LumaWeaveEdgeDraft[];
  warnings: string[];
};

/**
 * Extract nodes from various raw graph shapes
 */
function extractRawNodes(graph: RawGraphArtifact): unknown[] {
  // Try graph.nodes first (Graphify schema)
  const graphObj = graph.graph as unknown;
  if (graphObj && typeof graphObj === "object") {
    const graphNodes = (graphObj as Record<string, unknown>).nodes;
    if (Array.isArray(graphNodes)) return graphNodes;
  }

  // Fallback to top-level nodes
  const nodes = graph.nodes as unknown;
  if (Array.isArray(nodes)) return nodes;

  const elements = graph.elements as unknown;
  if (elements && typeof elements === "object") {
    const elementNodes = (elements as Record<string, unknown>).nodes;
    if (Array.isArray(elementNodes)) return elementNodes;
  }

  return [];
}

/**
 * Extract edges from various raw graph shapes
 */
function extractRawEdges(graph: RawGraphArtifact): unknown[] {
  // Try graph.links first (Graphify schema)
  const graphObj = graph.graph as unknown;
  if (graphObj && typeof graphObj === "object") {
    const graphLinks = (graphObj as Record<string, unknown>).links;
    if (Array.isArray(graphLinks)) return graphLinks;
  }

  // Fallback to top-level edges/links
  const edges = graph.edges as unknown;
  if (Array.isArray(edges)) return edges;

  const links = graph.links as unknown;
  if (Array.isArray(links)) return links;

  const elements = graph.elements as unknown;
  if (elements && typeof elements === "object") {
    const elementEdges = (elements as Record<string, unknown>).edges;
    if (Array.isArray(elementEdges)) return elementEdges;
  }

  return [];
}

/**
 * Generate stable node ID from raw node data
 */
function generateNodeId(rawNode: Record<string, unknown>, index: number): string {
  // Priority: id, norm_label, label, index-based
  if (rawNode.id && typeof rawNode.id === "string") {
    return rawNode.id;
  }
  if (rawNode.id && typeof rawNode.id === "number") {
    return String(rawNode.id);
  }
  if (rawNode.norm_label && typeof rawNode.norm_label === "string") {
    return rawNode.norm_label;
  }
  if (rawNode.label && typeof rawNode.label === "string") {
    return rawNode.label;
  }
  // Fallback to index-based ID
  return `node-${index}`;
}

/**
 * Extract readable label from raw node
 */
function extractNodeLabel(rawNode: Record<string, unknown>): string {
  // Priority: label, norm_label, id, fallback
  if (rawNode.label && typeof rawNode.label === "string") {
    return rawNode.label;
  }
  if (rawNode.norm_label && typeof rawNode.norm_label === "string") {
    return rawNode.norm_label;
  }
  if (rawNode.id) {
    return String(rawNode.id);
  }
  return "unnamed";
}

/**
 * Extract best-effort type from raw node
 */
function extractNodeType(rawNode: Record<string, unknown>): string | undefined {
  // Priority: file_type, type, infer from label/source_file
  if (rawNode.file_type && typeof rawNode.file_type === "string") {
    return rawNode.file_type;
  }
  if (rawNode.type && typeof rawNode.type === "string") {
    return rawNode.type;
  }
  // Try to infer from source_file extension
  if (rawNode.source_file && typeof rawNode.source_file === "string") {
    const ext = rawNode.source_file.split(".").pop();
    if (ext) return ext.toUpperCase();
  }
  return undefined;
}

/**
 * Extract source ID from raw edge with various field names
 */
function extractSourceId(rawEdge: Record<string, unknown>): string | null {
  // Priority: source, _src, from, source_id, data.source
  const source = rawEdge.source;
  if (source && (typeof source === "string" || typeof source === "number")) {
    return String(source);
  }

  const src = rawEdge._src;
  if (src && (typeof src === "string" || typeof src === "number")) {
    return String(src);
  }

  const from = rawEdge.from;
  if (from && (typeof from === "string" || typeof from === "number")) {
    return String(from);
  }

  const sourceId = rawEdge.source_id;
  if (sourceId && (typeof sourceId === "string" || typeof sourceId === "number")) {
    return String(sourceId);
  }

  const data = rawEdge.data;
  if (data && typeof data === "object") {
    const dataSource = (data as Record<string, unknown>).source;
    if (dataSource && (typeof dataSource === "string" || typeof dataSource === "number")) {
      return String(dataSource);
    }
  }

  return null;
}

/**
 * Extract target ID from raw edge with various field names
 */
function extractTargetId(rawEdge: Record<string, unknown>): string | null {
  // Priority: target, _tgt, to, target_id, data.target
  const target = rawEdge.target;
  if (target && (typeof target === "string" || typeof target === "number")) {
    return String(target);
  }

  const tgt = rawEdge._tgt;
  if (tgt && (typeof tgt === "string" || typeof tgt === "number")) {
    return String(tgt);
  }

  const to = rawEdge.to;
  if (to && (typeof to === "string" || typeof to === "number")) {
    return String(to);
  }

  const targetId = rawEdge.target_id;
  if (targetId && (typeof targetId === "string" || typeof targetId === "number")) {
    return String(targetId);
  }

  const data = rawEdge.data;
  if (data && typeof data === "object") {
    const dataTarget = (data as Record<string, unknown>).target;
    if (dataTarget && (typeof dataTarget === "string" || typeof dataTarget === "number")) {
      return String(dataTarget);
    }
  }

  return null;
}

/**
 * Generate stable edge ID
 */
function generateEdgeId(
  rawEdge: Record<string, unknown>,
  index: number,
  source: string,
  target: string
): string {
  // Try existing id first
  if (rawEdge.id && typeof rawEdge.id === "string") {
    return rawEdge.id;
  }
  if (rawEdge.id && typeof rawEdge.id === "number") {
    return `edge-${rawEdge.id}`;
  }
  // Generate stable id from source, relationship, target, index
  const relationship = extractRelationship(rawEdge) || "related";
  return `${source}--${relationship}--${target}--${index}`;
}

/**
 * Extract best-effort relationship from raw edge
 */
function extractRelationship(rawEdge: Record<string, unknown>): string | undefined {
  // Priority: relation, relationship, type
  if (rawEdge.relation && typeof rawEdge.relation === "string") {
    return rawEdge.relation;
  }
  if (rawEdge.relationship && typeof rawEdge.relationship === "string") {
    return rawEdge.relationship;
  }
  if (rawEdge.type && typeof rawEdge.type === "string") {
    return rawEdge.type;
  }
  return undefined;
}

/**
 * Normalize raw Graphify graph into LumaWeave model
 */
export function normalizeGraphifyGraph(
  rawGraph: RawGraphArtifact
): NormalizationResult {
  const warnings: string[] = [];
  const nodes: LumaWeaveNodeDraft[] = [];
  const edges: LumaWeaveEdgeDraft[] = [];

  const rawNodes = extractRawNodes(rawGraph);
  const rawEdges = extractRawEdges(rawGraph);

  // Debug: log schema detection
  console.log("Detected Graphify schema", {
    nodePath: "graph.nodes",
    edgePath: "graph.links",
    rawNodeCount: rawNodes.length,
    rawEdgeCount: rawEdges.length,
  });

  if (rawNodes.length === 0) {
    warnings.push("No nodes found in raw graph");
  }

  if (rawEdges.length === 0) {
    warnings.push("No edges found in raw graph");
  }

  // Track node IDs for duplicate detection
  const nodeIdSet = new Set<string>();

  // Normalize nodes
  rawNodes.forEach((rawNode, index) => {
    if (typeof rawNode !== "object" || rawNode === null) {
      warnings.push(`Node at index ${index} is not an object, skipping`);
      return;
    }

    const nodeRecord = rawNode as Record<string, unknown>;
    const id = generateNodeId(nodeRecord, index);

    if (nodeIdSet.has(id)) {
      warnings.push(`Duplicate node ID encountered: ${id}`);
    }
    nodeIdSet.add(id);

    nodes.push({
      id,
      label: extractNodeLabel(nodeRecord),
      type: extractNodeType(nodeRecord),
      raw: nodeRecord,
    });
  });

  // Normalize edges
  rawEdges.forEach((rawEdge, index) => {
    if (typeof rawEdge !== "object" || rawEdge === null) {
      warnings.push(`Edge at index ${index} is not an object, skipping`);
      return;
    }

    const edgeRecord = rawEdge as Record<string, unknown>;
    const source = extractSourceId(edgeRecord);
    const target = extractTargetId(edgeRecord);

    if (!source) {
      warnings.push(`Edge at index ${index} is missing source, skipping`);
      return;
    }

    if (!target) {
      warnings.push(`Edge at index ${index} is missing target, skipping`);
      return;
    }

    const id = generateEdgeId(edgeRecord, index, source, target);

    edges.push({
      id,
      source,
      target,
      relationship: extractRelationship(edgeRecord),
      raw: edgeRecord,
    });
  });

  // Check for edges referencing non-existent nodes
  edges.forEach((edge) => {
    if (!nodeIdSet.has(edge.source)) {
      warnings.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
    }
    if (!nodeIdSet.has(edge.target)) {
      warnings.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
    }
  });

  // Debug: log normalization results
  console.log("Detected Graphify schema", {
    nodePath: "graph.nodes",
    edgePath: "graph.links",
    rawNodeCount: rawNodes.length,
    rawEdgeCount: rawEdges.length,
    normalizedNodeCount: nodes.length,
    normalizedEdgeCount: edges.length,
  });

  return { nodes, edges, warnings };
}
