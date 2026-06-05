import { getSourceAdapterEntryById } from "../../source-adapter/sourceAdapterRegistry";
import type {
  GraphSourceSummary,
  RawGraphArtifact,
} from "../schema/graph.types";
import { normalizeGraphifyGraph } from "../normalize/normalizeGraphifyGraph";

// Self-graph adapter fixture path (Tier 0: live path is Tier 1)
const SELF_GRAPH_PUBLIC_BASE = "/examples/ai-lab/graphify-out";

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

function errorSummary(
  adapterId: string,
  label: string,
  message: string,
): GraphSourceSummary {
  return {
    sourceId: adapterId,
    label,
    sourcePath: "",
    publicBaseUrl: "",
    status: "error",
    graphPresent: false,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 0,
    edgeCount: 0,
    normalizedNodeCount: 0,
    normalizedEdgeCount: 0,
    warnings: [],
    error: message,
  };
}

async function loadSelfGraph(_inputPath: string): Promise<GraphSourceSummary> {
  const baseUrl = SELF_GRAPH_PUBLIC_BASE;
  const summary: GraphSourceSummary = {
    sourceId: "self-graph-yaml-frontmatter",
    label: "Self Graph",
    sourcePath: baseUrl,
    publicBaseUrl: baseUrl,
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
    const graphResponse = await fetch(`${baseUrl}/graph.json`);
    if (!graphResponse.ok) {
      throw new Error(`Failed to load graph.json: ${graphResponse.status}`);
    }
    const rawGraph = (await graphResponse.json()) as RawGraphArtifact;
    summary.graphPresent = true;
    summary.rawGraph = rawGraph;
    summary.nodeCount = extractNodeCount(rawGraph);
    summary.edgeCount = extractEdgeCount(rawGraph);

    const normalizationResult = normalizeGraphifyGraph(rawGraph);
    summary.normalizedNodeCount = normalizationResult.nodes.length;
    summary.normalizedEdgeCount = normalizationResult.edges.length;
    summary.warnings = normalizationResult.warnings;
    summary.normalizedNodes = normalizationResult.nodes;
    summary.normalizedEdges = normalizationResult.edges;

    try {
      const manifestResponse = await fetch(`${baseUrl}/manifest.json`);
      if (manifestResponse.ok) {
        summary.rawManifest = (await manifestResponse.json()) as RawGraphArtifact;
        summary.manifestPresent = true;
      }
    } catch {
      summary.manifestPresent = false;
    }

    try {
      const reportResponse = await fetch(`${baseUrl}/GRAPH_REPORT.md`);
      if (reportResponse.ok) {
        summary.rawReportText = await reportResponse.text();
        summary.reportPresent = true;
      }
    } catch {
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

export async function loadSource(
  adapterId: string | null,
  inputPath: string,
): Promise<GraphSourceSummary> {
  if (!adapterId) {
    return errorSummary("", "Unknown", "No active source configured");
  }

  const entry = getSourceAdapterEntryById(adapterId);
  if (!entry) {
    return errorSummary(adapterId, adapterId, `Unknown adapter: ${adapterId}`);
  }

  if (entry.status !== "registered") {
    return errorSummary(
      adapterId,
      entry.adapterType,
      `Adapter "${adapterId}" is not yet implemented`,
    );
  }

  // Route to the registered adapter's loader
  if (adapterId === "self-graph-yaml-frontmatter") {
    return loadSelfGraph(inputPath);
  }

  // Fallback for any future registered adapter without a loader yet
  return errorSummary(adapterId, entry.adapterType, `No loader for adapter: ${adapterId}`);
}
