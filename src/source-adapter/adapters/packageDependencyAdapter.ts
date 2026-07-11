// SPDX-License-Identifier: Apache-2.0
/**
 * Package Dependency Adapter — package.json dependency tree to LumaWeave graph.
 * v109.3: npm/yarn/pnpm package.json only; pyproject.toml deferred (errors gracefully).
 */

import { SingleFileAdapter } from "../singleFileAdapter";
import type { AdapterCapabilities, AdapterConfig, PackageDependencyConfig } from "../baseSourceAdapter";
import type { GraphSourceSummary, LumaWeaveEdgeDraft, LumaWeaveNodeDraft } from "../../graph/schema/graph.types";
import "./PackageDependencyConfigForm"; // registers the config form as side effect

const MAX_NODES = 500;

function makeErrorSummary(error: string, sourcePath?: string): GraphSourceSummary {
  return {
    sourceId: "package-dependency",
    label: sourcePath ? `Package: ${sourcePath}` : "Package Dependency",
    sourcePath: sourcePath ?? "",
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

class PackageDependencyAdapter extends SingleFileAdapter {
  readonly adapterId = "package-dependency";
  readonly adapterType = "package-dependency";
  readonly adapterVersion = "0.1.0";
  readonly capabilities: AdapterCapabilities = {
    supportsLiveRefresh: false,
    requiresUserPath: true,
    requiresNetwork: false,
    supportsFiltering: false,
    maxRecommendedNodes: MAX_NODES,
  };

  async load(config: AdapterConfig): Promise<GraphSourceSummary> {
    if (config.adapterId !== "package-dependency") {
      return makeErrorSummary("Adapter dispatch mismatch");
    }
    const cfg = config as PackageDependencyConfig;

    if (!cfg.projectPath?.trim()) {
      return makeErrorSummary("Project path not configured");
    }

    const manifestType = cfg.manifestType ?? "package.json";
    if (manifestType !== "package.json") {
      return makeErrorSummary(
        `${manifestType} not yet supported; only package.json is implemented in v1.0`,
        cfg.projectPath,
      );
    }

    const filePath = `${cfg.projectPath.replace(/\/$/, "")}/${manifestType}`;
    const warnings: string[] = [];

    let raw: string;
    try {
      raw = await this.readUserFile(filePath);
    } catch (err) {
      return makeErrorSummary(`Cannot read file: ${err}`, filePath);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return makeErrorSummary(`Invalid JSON: ${err}`, filePath);
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return makeErrorSummary("Manifest must be a JSON object", filePath);
    }

    const manifest = parsed as Record<string, unknown>;

    // Shape check — at least one recognized npm-manifest field must be present
    const hasRecognizedFields =
      "name" in manifest ||
      "version" in manifest ||
      "dependencies" in manifest ||
      "devDependencies" in manifest ||
      "peerDependencies" in manifest;

    if (!hasRecognizedFields) {
      return makeErrorSummary("File does not appear to be a package.json manifest", filePath);
    }

    // Workspace detection — warn-and-continue (traversal deferred to v2)
    if ("workspaces" in manifest && manifest.workspaces) {
      const ws = manifest.workspaces;
      const wsCount = Array.isArray(ws) ? ws.length : Object.keys(ws as object).length;
      warnings.push(
        `Workspaces detected (${wsCount} entries); sub-package traversal not supported in v1.0. Showing root-level dependencies only.`,
      );
    }

    // Root node — name-only id, fallback to "package" with warning
    const manifestName = typeof manifest.name === "string" ? manifest.name : null;
    if (!manifestName) {
      warnings.push('No "name" field in manifest; using "package" as root node id.');
    }
    const rootId = manifestName ?? "package";

    const nodes: LumaWeaveNodeDraft[] = [];
    const edges: LumaWeaveEdgeDraft[] = [];
    const seenPackageIds = new Set<string>([rootId]);

    nodes.push({
      id: rootId,
      label: rootId,
      type: "node",
      raw: {
        kind: "project",
        sourceAdapter: "package-dependency",
        version: typeof manifest.version === "string" ? manifest.version : "",
        description: typeof manifest.description === "string" ? manifest.description : "",
      },
    });

    // Process buckets in order: production → dev → peer
    // Nodes deduplicated by name (first occurrence wins); edges are NOT deduplicated
    // (react in both dependencies + peerDependencies → one node, two edges)
    const buckets = [
      { key: "dependencies", depType: "production" as const, relationship: "depends-on" },
      { key: "devDependencies", depType: "development" as const, relationship: "depends-on-dev" },
      { key: "peerDependencies", depType: "peer" as const, relationship: "depends-on-peer" },
    ];

    for (const { key, depType, relationship } of buckets) {
      const bucket = manifest[key];
      if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) continue;

      for (const [pkgName, versionConstraint] of Object.entries(bucket as Record<string, unknown>)) {
        if (typeof pkgName !== "string" || !pkgName) continue;

        // Create package node on first occurrence only
        if (!seenPackageIds.has(pkgName)) {
          if (nodes.length >= MAX_NODES) {
            warnings.push(`Node limit (${MAX_NODES}) reached; remaining packages omitted.`);
            break;
          }
          seenPackageIds.add(pkgName);
          nodes.push({
            id: pkgName,
            label: pkgName,
            type: "node",
            raw: {
              kind: "package",
              sourceAdapter: "package-dependency",
              version: typeof versionConstraint === "string" ? versionConstraint : "",
              dependencyType: depType,
            },
          });
        }

        // Always emit edge — dual relationship (e.g. prod + peer) is intentional
        edges.push({
          id: `${rootId}→${pkgName}:${relationship}`,
          source: rootId,
          target: pkgName,
          relationship,
          raw: {
            sourceAdapter: "package-dependency",
            dependencyType: depType,
          },
        });
      }
    }

    return {
      status: "loaded",
      sourceId: "package-dependency",
      sourcePath: filePath,
      label: `Package: ${rootId}`,
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

const adapterInstance = new PackageDependencyAdapter();
export const loadPackageDependency = (config: AdapterConfig) => adapterInstance.load(config);
