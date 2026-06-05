import { getSourceAdapterEntryById } from "../../source-adapter/sourceAdapterRegistry";
import type { GraphSourceSummary } from "../schema/graph.types";
import { adaptSelfGraphToSigma } from "../../fixtures/self-graph-adapter";
import type { LumaSourceGraph } from "../../fixtures/types";
import { invoke } from "../../lib/tauri-invoke";

// Module-level lazy cache for the project root (D6 — one Tauri invoke per session).
let cachedProjectRoot: string | null = null;
async function getProjectRoot(): Promise<string> {
  if (cachedProjectRoot === null) {
    cachedProjectRoot = await invoke<string>("get_project_root");
  }
  return cachedProjectRoot;
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

// Convention: self-graph generator writes output to this path relative to project root.
const SELF_GRAPH_FIXTURE_PATH = "src/fixtures/self-graph-generated.json";

async function loadSelfGraph(_inputPath: string): Promise<GraphSourceSummary> {
  // _inputPath is reserved for future user-configurable paths (Tier 2+).
  // Tier 1 reads from the generator's known output location.
  const summary: GraphSourceSummary = {
    sourceId: "self-graph-yaml-frontmatter",
    label: "Self Graph",
    sourcePath: "",
    publicBaseUrl: "",
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
    const root = await getProjectRoot();
    const jsonStr = await invoke<string>("read_file", { path: SELF_GRAPH_FIXTURE_PATH });
    const raw = JSON.parse(jsonStr) as LumaSourceGraph;

    summary.sourcePath = `${root}/${SELF_GRAPH_FIXTURE_PATH}`;
    summary.graphPresent = true;
    summary.nodeCount = raw.nodes.length;
    summary.edgeCount = raw.edges.length;

    const adapted = adaptSelfGraphToSigma(raw);
    summary.normalizedNodeCount = adapted.nodes.length;
    summary.normalizedEdgeCount = adapted.edges.length;
    summary.normalizedNodes = adapted.nodes;
    summary.normalizedEdges = adapted.edges;
    summary.warnings = [];
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
