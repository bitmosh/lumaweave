// SPDX-License-Identifier: Apache-2.0
/**
 * Cerebra Snapshot Adapter — cerebra/v1 JSON to LumaWeave graph.
 * Reads the snapshot written by cerebra's export_graph() to {vault}/.cerebra/graph.json.
 * Both "spine" and "memory_record" node types map to the same LumaWeave node shape for now.
 */

import { SingleFileAdapter } from "../singleFileAdapter";
import type { AdapterCapabilities, AdapterConfig, CerebraSnapshotConfig } from "../baseSourceAdapter";
import type { GraphSourceSummary, LumaWeaveEdgeDraft, LumaWeaveNodeDraft } from "../../graph/schema/graph.types";
import "./CerebraSnapshotConfigForm";

const MAX_NODES = 2000;

function makeErrorSummary(error: string, filePath?: string): GraphSourceSummary {
  return {
    sourceId: "cerebra-snapshot",
    label: filePath ? `Cerebra Snapshot: ${filePath}` : "Cerebra Snapshot",
    sourcePath: filePath ?? "",
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
    error,
  };
}

class CerebraSnapshotAdapter extends SingleFileAdapter {
  readonly adapterId = "cerebra-snapshot";
  readonly adapterType = "cerebra-snapshot";
  readonly adapterVersion = "0.1.0";
  readonly capabilities: AdapterCapabilities = {
    supportsLiveRefresh: false,
    requiresUserPath: true,
    requiresNetwork: false,
    supportsFiltering: false,
    maxRecommendedNodes: MAX_NODES,
  };

  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "cerebra-snapshot") {
      return makeErrorSummary("Adapter dispatch mismatch");
    }
    const cfg = config as CerebraSnapshotConfig;
    if (!cfg.filePath?.trim()) {
      return makeErrorSummary("File path not configured");
    }

    const warnings: string[] = [];

    let raw: string;
    try {
      raw = await this.readUserFile(cfg.filePath);
    } catch (err) {
      return makeErrorSummary(`Cannot read file: ${err}`, cfg.filePath);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return makeErrorSummary(`Invalid JSON: ${err}`, cfg.filePath);
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return makeErrorSummary("Root must be a JSON object", cfg.filePath);
    }

    const p = parsed as any;

    if (p.schemaVersion !== "cerebra/v1") {
      return makeErrorSummary(
        `Unsupported schema version: ${p.schemaVersion ?? "missing"}. Expected "cerebra/v1".`,
        cfg.filePath,
      );
    }

    if (!Array.isArray(p.nodes) || !Array.isArray(p.edges)) {
      return makeErrorSummary("Missing required nodes or edges arrays", cfg.filePath);
    }

    const seenIds = new Set<string>();
    const nodes: LumaWeaveNodeDraft[] = [];

    for (const node of (p.nodes as any[]).slice(0, MAX_NODES)) {
      const id = node.id;
      if (typeof id !== "string" || !id) {
        warnings.push("Node missing id; skipped");
        continue;
      }
      if (seenIds.has(id)) {
        warnings.push(`Duplicate node id "${id}"; keeping first occurrence`);
        continue;
      }
      seenIds.add(id);
      nodes.push({
        id,
        label: typeof node.label === "string" ? node.label : id,
        type: typeof node.type === "string" ? node.type : "node",
        raw: {
          sourceAdapter: "cerebra-snapshot",
          fullLabel: node.fullLabel,
          cluster: node.cluster,
          status: node.status,
          tags: node.tags,
          size: node.size,
          path: node.path,
          lastModified: node.lastModified,
          cerebraData: node.raw ?? {},
        },
      });
    }

    if ((p.nodes as any[]).length > MAX_NODES) {
      warnings.push(
        `File contains ${(p.nodes as any[]).length} nodes; first ${MAX_NODES} kept, ${(p.nodes as any[]).length - MAX_NODES} discarded.`,
      );
    }

    const edges: LumaWeaveEdgeDraft[] = [];

    for (const edge of p.edges as any[]) {
      const { id, source, target } = edge;
      if (typeof id !== "string" || !id) {
        warnings.push("Edge missing id; skipped");
        continue;
      }
      if (typeof source !== "string" || typeof target !== "string") {
        warnings.push(`Edge "${id}" missing source or target; skipped`);
        continue;
      }
      if (!seenIds.has(source) || !seenIds.has(target)) {
        continue; // orphan from node cap or bad data
      }
      edges.push({
        id,
        source,
        target,
        relationship: typeof edge.type === "string" ? edge.type : undefined,
        raw: {
          sourceAdapter: "cerebra-snapshot",
          edgeType: edge.type,
          weight: edge.weight,
          bidirectional: edge.bidirectional,
          provenance: edge.provenance,
        },
      });
    }

    const vaultPath = p.metadata?.vaultPath;
    const vaultName = typeof vaultPath === "string"
      ? (vaultPath.split("/").pop() ?? vaultPath)
      : null;
    const label = vaultName
      ? `Cerebra: ${vaultName}`
      : `Cerebra Snapshot: ${cfg.filePath}`;

    return {
      status: "loaded",
      sourceId: "cerebra-snapshot",
      sourcePath: cfg.filePath,
      label,
      publicBaseUrl: "",
      graphPresent: true,
      manifestPresent: false,
      reportPresent: false,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      normalizedNodeCount: nodes.length,
      normalizedEdgeCount: edges.length,
      normalizedNodes: nodes,
      normalizedEdges: edges,
      warnings,
    };
  }
}

const adapterInstance = new CerebraSnapshotAdapter();
export const loadCerebraSnapshot = (config: AdapterConfig) => adapterInstance.load(config);
