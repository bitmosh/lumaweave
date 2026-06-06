import {
  getSourceAdapterEntryById,
  getSourceAdapterLoader,
} from "../../source-adapter/sourceAdapterRegistry";
import type { GraphSourceSummary } from "../schema/graph.types";
import { buildAdapterConfig } from "./buildAdapterConfig";

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

export async function loadSource(adapterId: string | null): Promise<GraphSourceSummary> {
  if (!adapterId) {
    return errorSummary("", "Unknown", "No active source configured");
  }

  const entry = getSourceAdapterEntryById(adapterId);
  if (!entry) {
    return errorSummary(adapterId, adapterId, `Unknown adapter: ${adapterId}`);
  }

  const loader = getSourceAdapterLoader(adapterId);
  if (!loader) {
    return errorSummary(adapterId, entry.adapterType, `No loader for adapter: ${adapterId}`);
  }

  const config = buildAdapterConfig(adapterId);
  return loader(config);
}
