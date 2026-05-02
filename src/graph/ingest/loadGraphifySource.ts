/**
 * LumaWeave Graphify Source Loader
 * Loads Graphify artifact directory and extracts basic stats
 */

import type {
  GraphSourceSummary,
  RawGraphArtifact,
} from "../schema/graph.types";
import { normalizeGraphifyGraph } from "../normalize/normalizeGraphifyGraph";

const publicBaseUrl = "/examples/ai-lab/graphify-out";

/**
 * Safely extract node count from various Graphify graph shapes
 */
function extractNodeCount(graph: RawGraphArtifact): number {
  const nodes = graph.nodes as unknown;
  if (Array.isArray(nodes)) return nodes.length;

  const elements = graph.elements as unknown;
  if (elements && typeof elements === "object") {
    const elementNodes = (elements as Record<string, unknown>).nodes;
    if (Array.isArray(elementNodes)) return elementNodes.length;
  }

  return 0;
}

/**
 * Safely extract edge count from various Graphify graph shapes
 */
function extractEdgeCount(graph: RawGraphArtifact): number {
  const edges = graph.edges as unknown;
  if (Array.isArray(edges)) return edges.length;

  const links = graph.links as unknown;
  if (Array.isArray(links)) return links.length;

  const elements = graph.elements as unknown;
  if (elements && typeof elements === "object") {
    const elementEdges = (elements as Record<string, unknown>).edges;
    if (Array.isArray(elementEdges)) return elementEdges.length;
  }

  return 0;
}

/**
 * Load Graphify source artifacts and return summary
 */
export async function loadGraphifySource(): Promise<GraphSourceSummary> {
  const summary: GraphSourceSummary = {
    sourceId: "ai-lab",
    label: "AI Lab",
    sourcePath: "/home/boop/Projects/ai-lab/graphify-out",
    publicBaseUrl,
    status: "loading",
    graphPresent: false,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 0,
    edgeCount: 0,
    normalizedNodeCount: 0,
    normalizedEdgeCount: 0,
    warnings: [],
  };

  try {
    // Load graph.json (required)
    const graphResponse = await fetch(`${publicBaseUrl}/graph.json`);
    if (!graphResponse.ok) {
      throw new Error(`Failed to load graph.json: ${graphResponse.status}`);
    }

    const rawGraph = (await graphResponse.json()) as RawGraphArtifact;
    summary.graphPresent = true;
    summary.rawGraph = rawGraph;
    summary.nodeCount = extractNodeCount(rawGraph);
    summary.edgeCount = extractEdgeCount(rawGraph);

    // Normalize the graph
    const normalizationResult = normalizeGraphifyGraph(rawGraph);
    summary.normalizedNodeCount = normalizationResult.nodes.length;
    summary.normalizedEdgeCount = normalizationResult.edges.length;
    summary.warnings = normalizationResult.warnings;
    summary.normalizedNodes = normalizationResult.nodes;
    summary.normalizedEdges = normalizationResult.edges;

    // Load manifest.json (optional)
    try {
      const manifestResponse = await fetch(`${publicBaseUrl}/manifest.json`);
      if (manifestResponse.ok) {
        summary.rawManifest = (await manifestResponse.json()) as RawGraphArtifact;
        summary.manifestPresent = true;
      }
    } catch {
      // manifest.json is optional, ignore errors
      summary.manifestPresent = false;
    }

    // Load GRAPH_REPORT.md (optional)
    try {
      const reportResponse = await fetch(`${publicBaseUrl}/GRAPH_REPORT.md`);
      if (reportResponse.ok) {
        summary.rawReportText = await reportResponse.text();
        summary.reportPresent = true;
      }
    } catch {
      // GRAPH_REPORT.md is optional, ignore errors
      summary.reportPresent = false;
    }

    summary.status = "loaded";
  } catch (error) {
    summary.status = "error";
    summary.error =
      error instanceof Error ? error.message : "Unknown error occurred";
  }

  return summary;
}
