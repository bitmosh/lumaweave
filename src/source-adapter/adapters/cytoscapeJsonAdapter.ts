// SPDX-License-Identifier: Apache-2.0
/**
 * Cytoscape JSON Adapter — Cytoscape.js JSON export to LumaWeave graph.
 * v109.2: both nested {nodes,edges} and flat [{group,data}] forms, dedup, orphan skip.
 * Locked decisions: D1–D10 per BANDIT_v109_2_cytoscape_json.md
 */

import { SingleFileAdapter } from "../singleFileAdapter";
import type { AdapterCapabilities, AdapterConfig, CytoscapeJsonConfig } from "../baseSourceAdapter";
import type { GraphSourceSummary, LumaWeaveEdgeDraft, LumaWeaveNodeDraft } from "../../graph/schema/graph.types";
import "./CytoscapeJsonConfigForm"; // registers the config form as side effect

const MAX_NODES = 2000;

function makeErrorSummary(error: string, filePath?: string): GraphSourceSummary {
  return {
    sourceId: "cytoscape-json",
    label: filePath ? `Cytoscape JSON: ${filePath}` : "Cytoscape JSON",
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

// D10: normalize both nested {nodes,edges} and flat [{group,data}] forms
function normalizeElements(
  elements: unknown,
  warnings: string[],
): { nodeItems: any[]; edgeItems: any[] } {
  if (Array.isArray(elements)) {
    const nodeItems: any[] = [];
    const edgeItems: any[] = [];
    for (const item of elements) {
      if (!item || typeof item !== "object") continue;
      const group = (item as any).group;
      if (group === "nodes") nodeItems.push(item);
      else if (group === "edges") edgeItems.push(item);
      else {
        warnings.push(`Flat-form element missing/unknown group field; treating as node`);
        nodeItems.push(item);
      }
    }
    return { nodeItems, edgeItems };
  }
  if (typeof elements === "object" && elements !== null) {
    const obj = elements as any;
    return {
      nodeItems: Array.isArray(obj.nodes) ? obj.nodes : [],
      edgeItems: Array.isArray(obj.edges) ? obj.edges : [],
    };
  }
  warnings.push("elements field must be object or array");
  return { nodeItems: [], edgeItems: [] };
}

class CytoscapeJsonAdapter extends SingleFileAdapter {
  readonly adapterId = "cytoscape-json";
  readonly adapterType = "cytoscape-json";
  readonly adapterVersion = "0.1.0";
  readonly capabilities: AdapterCapabilities = {
    supportsLiveRefresh: false,
    requiresUserPath: true,
    requiresNetwork: false,
    supportsFiltering: false,
    maxRecommendedNodes: MAX_NODES,
  };

  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "cytoscape-json") {
      return makeErrorSummary("Adapter dispatch mismatch");
    }
    const cfg = config as CytoscapeJsonConfig;
    if (!cfg.filePath?.trim()) {
      return makeErrorSummary("File path not configured");
    }

    const warnings: string[] = [];

    // D8: audible-ignore maxNodes config override
    if ((cfg as any).maxNodes && (cfg as any).maxNodes !== MAX_NODES) {
      warnings.push(`maxNodes config override not honored in v1.0; using default ${MAX_NODES}.`);
    }

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

    // Format-identification gate
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return makeErrorSummary("Root must be a JSON object", cfg.filePath);
    }

    const p = parsed as any;

    // D6: detect and reject Cytoscape Desktop format
    if (
      p.format_version !== undefined ||
      (typeof p.generated_by === "string" && p.generated_by.includes("cytoscape-"))
    ) {
      return makeErrorSummary(
        "Cytoscape Desktop format detected; this adapter supports Cytoscape.js JSON (js.cytoscape.org). Re-export via Cytoscape.js.",
        cfg.filePath,
      );
    }

    // D9: strict elements key required
    if (p.elements === undefined) {
      const hasTopLevelNodes = Array.isArray(p.nodes) || Array.isArray(p.edges);
      return makeErrorSummary(
        hasTopLevelNodes
          ? 'Your file uses { "nodes": [...], "edges": [...] } without an "elements" wrapper. ' +
            'Use "Different adapter" to find a compatible format, or wrap your data: ' +
            '{ "elements": { "nodes": [...], "edges": [...] } }'
          : 'Missing required "elements" key — not a Cytoscape.js JSON file. ' +
            'Expected: { "elements": { "nodes": [...], "edges": [...] } }. ' +
            'Use "Different adapter" if your file uses a different graph format.',
        cfg.filePath,
      );
    }

    const { nodeItems, edgeItems } = normalizeElements(p.elements, warnings);

    // Build nodes with deduplication
    const seenIds = new Set<string>();
    const nodes: LumaWeaveNodeDraft[] = [];
    for (const item of nodeItems.slice(0, MAX_NODES)) {
      const data = item.data ?? {};
      const id = data.id;
      if (typeof id !== "string" || !id) {
        warnings.push(`Node missing or invalid id; skipped`);
        continue;
      }
      if (seenIds.has(id)) {
        warnings.push(`Duplicate node id "${id}"; keeping first occurrence`);
        continue;
      }
      seenIds.add(id);
      const { id: _id, label, name, ...rest } = data;
      nodes.push({
        id,
        label: typeof label === "string" ? label : (typeof name === "string" ? name : id),
        type: "node",
        raw: {
          kind: "node",
          sourceAdapter: "cytoscape-json",
          cytoscapeData: rest,
          ...(item.position ? { position: item.position } : {}),
          ...(typeof item.classes === "string" ? { classes: item.classes } : {}),
        },
      });
    }

    if (nodeItems.length > MAX_NODES) {
      warnings.push(
        `File contains ${nodeItems.length} nodes; first ${MAX_NODES} kept, ${nodeItems.length - MAX_NODES} discarded.`,
      );
    }

    // Build edges, skipping orphans
    const edges: LumaWeaveEdgeDraft[] = [];
    for (const item of edgeItems) {
      const data = item.data ?? {};
      const id = data.id;
      const source = data.source;
      const target = data.target;
      if (typeof id !== "string" || !id) {
        warnings.push(`Edge missing or invalid id; skipped`);
        continue;
      }
      if (typeof source !== "string" || typeof target !== "string") {
        warnings.push(`Edge "${id}" missing source or target; skipped`);
        continue;
      }
      if (!seenIds.has(source) || !seenIds.has(target)) {
        warnings.push(`Edge "${id}" references missing node; skipped`);
        continue;
      }
      const { id: _id, source: _s, target: _t, label, ...rest } = data;
      edges.push({
        id,
        source,
        target,
        relationship: typeof label === "string" ? label : undefined,
        raw: {
          sourceAdapter: "cytoscape-json",
          cytoscapeData: rest,
        },
      });
    }

    return {
      status: "loaded",
      sourceId: "cytoscape-json",
      sourcePath: cfg.filePath,
      label: `Cytoscape JSON: ${cfg.filePath}`,
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

const adapterInstance = new CytoscapeJsonAdapter();
export const loadCytoscapeJson = (config: AdapterConfig) => adapterInstance.load(config);
