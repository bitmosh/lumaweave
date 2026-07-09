// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Graphology Graph Builder
 * Converts normalized LumaWeave nodes/edges into a Graphology graph.
 */

import Graph from "graphology";
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
import { graphVisualTokens } from "../../visual/graphVisualTokens";
import { computeNodeSize, computeAggregateSize } from "../../../physics/gwells/seederHelpers";
import { loadClusterColors, resolveClusterColor } from "../../../themes/clusterColor";
import type { ThemeId } from "../../../control-plane/settings/settings.schema";
import { getThemeRuntimeTokens } from "../../../themes/themeTokens";
import { resolveThemeTokenPath } from "../../../themes/themeTokenPaths";
import { resolveNodeProgramId } from "../../nodePrograms/nodeProgramRegistry";
import { getGlobalOverride } from "../../../themes/themeOverrideStorage";

export interface LayoutSettings {
  nodeSize: number;
  nodeColorScale?: string[]; // legacy fallback
  themeId?: ThemeId;
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
  clusterSuns?: Map<string, string>;
}

/**
 * Build a Graphology graph from normalized LumaWeave nodes and edges.
 */
export function buildGraphologyGraph(
  nodes: LumaWeaveNodeDraft[],
  edges: LumaWeaveEdgeDraft[],
  settings: LayoutSettings,
): GraphBuildResult {
  const graph = new Graph({ multi: true });

  const baseSize = 10;

  // v90b: Resolve node geometry program: theme default → global override wins.
  // Override is read here so rebuilds (nodes/edges change) preserve the user's active preset.
  const themeTokens = getThemeRuntimeTokens(settings.themeId ?? "solar-plasma");
  const themeGeometryDefault = resolveThemeTokenPath(themeTokens, "node.geometry.preset") as string | undefined;
  const geometryOverride = getGlobalOverride("node.geometry.preset");
  const defaultNodeType = resolveNodeProgramId(
    (geometryOverride as string | undefined) ?? themeGeometryDefault
  );

  nodes.forEach((node) => {
    try {
      // Start at origin — seeder will set deterministic positions
      const position = { x: 0, y: 0 };

      // Preserve raw size for downstream aggregation
      const rawSize = (node.raw?.size as number) ?? baseSize;
      const visualSize = computeNodeSize(rawSize);  // Pass C8.3: compute visual size

      graph.addNode(node.id, {
        x: position.x,
        y: position.y,
        label: node.label,
        fullLabel: node.label,
        originalLabel: node.label,
        rawSize: rawSize,
        size: visualSize * settings.nodeSize,
        baseSize: visualSize,
        color: (node.raw?.color as string) ?? graphVisualTokens.nodeColor.default,
        type: defaultNodeType,
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
        weight: 1,
        color: (edge.raw?.color as string) ?? themeTokens.graph.edgeDefault,
        size: (edge.raw?.size as number) ?? 1.5,
        raw: edge.raw,
      });
    } catch (error) {
      console.warn(`Failed to add edge ${edge.id}:`, error);
    }
  });

  // Pass C8.3: Compute aggregate sizes for directories and spines
  // Directories and spines get their size from total descendant content
  graph.forEachNode((nodeId) => {
    const attrs = graph.getNodeAttributes(nodeId);
    const nodeType = attrs.nodeType || attrs.raw?.type;
    
    if (nodeType === "directory" || nodeType === "spine") {
      const aggregateSize = computeAggregateSize(graph, nodeId);
      const visualSize = computeNodeSize(aggregateSize);  // Pass C8.3: compute visual size
      graph.setNodeAttribute(nodeId, "rawSize", aggregateSize);
      graph.setNodeAttribute(nodeId, "size", visualSize * settings.nodeSize);
      graph.setNodeAttribute(nodeId, "baseSize", visualSize);  // Pass C8.3: baseSize is now visual size
    }
  });

  // Degree centrality — boost size of well-connected nodes
  // Pass C8.3: Content-driven sizing now determines node sizes; centrality boost removed
  // to avoid conflicting with the new size-aware layout.
  const centralityScores = degree(graph);

  // Pass C8.3: Skip centrality-based size adjustment - content-driven sizing is now the primary
  // graph.forEachNode((nodeId) => {
  //   const attrs = graph.getNodeAttributes(nodeId);
  //   const nodeType = attrs.nodeType || attrs.raw?.type;
  //   
  //   // Spine nodes: size based on child count (not centrality)
  //   if (nodeType === "spine") {
  //     const childCount = graph.outDegree(nodeId);
  //     const spineSize = BASE_NODE_SIZE * (1 + Math.log2(childCount + 1) * 0.3);
  //     graph.setNodeAttribute(nodeId, "size", spineSize * settings.nodeSize);
  //     graph.setNodeAttribute(nodeId, "baseSize", spineSize);
  //   } else {
  //     // Non-spine nodes: centrality boost
  //     const c = (centralityScores[nodeId] ?? 0) as number;
  //     const normalized = c / maxCentrality;
  //     // Blend: base size + up to 40% boost for most connected (reduced from 80%)
  //     const newSize = BASE_NODE_SIZE * (1 + normalized * 0.4);
  //     graph.setNodeAttribute(nodeId, "size", newSize * settings.nodeSize);
  //     graph.setNodeAttribute(nodeId, "baseSize", newSize);
  //   }
  // });

  // Assign node colors from cluster identity (v103.0.2).
  // Per GRAPH_COLOR_OWNERSHIP.md: cluster color belongs in raw.color (layer 2).
  // The style layer (resetGraphStyles) reads raw.color first — no other color writes needed.
  // Fallback for unclustered nodes: themeTokens.graph.nodeDefault (D3 — theme-derived).
  const clusterPalette = loadClusterColors();
  const clusterColorMode = { kind: "semantic" as const }; // D4: clusterColorMode setting deferred to .0.5
  const nodeColorFallback = themeTokens.graph.nodeDefault;

  graph.forEachNode((nodeId) => {
    const attrs = graph.getNodeAttributes(nodeId);
    const cluster = (attrs.raw as any)?.cluster as string | undefined;
    const clusterHex = resolveClusterColor(cluster, clusterColorMode, clusterPalette);
    const color = clusterHex ?? nodeColorFallback;
    graph.setNodeAttribute(nodeId, "color", color);
    graph.setNodeAttribute(nodeId, "raw", {
      ...(attrs.raw as object ?? {}),
      color,
    });
  });

  // Find the highest-degree node per cluster (the sun)
  const clusterSuns = new Map<string, string>();
  const clusterMaxDegree = new Map<string, number>();

  graph.forEachNode((nodeId, attrs) => {
    const cluster =
      (attrs.raw as any)?.cluster ?? "gray";
    const deg =
      (centralityScores[nodeId] ?? 0) as number;
    if (!clusterSuns.has(cluster) ||
        deg > (clusterMaxDegree.get(cluster) ?? 0)) {
      clusterSuns.set(cluster, nodeId);
      clusterMaxDegree.set(cluster, deg);
    }
  });

  // Tag cluster suns as node attribute
  clusterSuns.forEach((sunNodeId, cluster) => {
    graph.setNodeAttribute(sunNodeId, "isSun", true);
    graph.setNodeAttribute(sunNodeId, "cluster", cluster);
  });

  // Add suns to diagnostics/graph attributes
  graph.setAttribute(
    "clusterSunCount", clusterSuns.size
  );

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

  return {
    graph,
    diagnostics,
    clusterSuns,
  };
}
