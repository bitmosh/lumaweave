import type { SelfGraphConfig } from "../../source-adapter/baseSourceAdapter";
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

// Convention: self-graph generator writes output to this path relative to project root.
const SELF_GRAPH_FIXTURE_PATH = "src/fixtures/self-graph-generated.json";

export async function loadSelfGraph(_config: SelfGraphConfig): Promise<GraphSourceSummary> {
  // _config has no user-configurable fields; the generator output path is internal.
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
