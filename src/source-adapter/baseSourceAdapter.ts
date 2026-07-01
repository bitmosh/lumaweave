/**
 * Source Adapter SDK — Base Types
 * SDK_SPEC.md v0.1 §3–§4
 *
 * BaseSourceAdapter interface, AdapterFamily, AdapterCapabilities,
 * LoaderFn, and the discriminated AdapterConfig union.
 */

import type { GraphSourceSummary } from "../graph/schema/graph.types";

// Adapter family — which structural family this adapter belongs to
export type AdapterFamily = "directory" | "single-file" | "dsl" | "api";

// Adapter capabilities — what the adapter can and cannot do
export interface AdapterCapabilities {
  supportsLiveRefresh: boolean;   // can react to file-system changes
  requiresUserPath: boolean;      // needs user to configure a root path in settings
  requiresNetwork: boolean;       // needs outbound HTTP access
  supportsFiltering: boolean;     // supports excludePatterns / includeGlob configuration
  maxRecommendedNodes: number;    // soft performance ceiling; adapter warns if exceeded
}

// Per-adapter config shapes — discriminated by adapterId literal

export interface SelfGraphConfig {
  adapterId: "self-graph-yaml-frontmatter";
  // No user-configurable fields; path is hardcoded in the loader
}

export interface MarkdownVaultConfig {
  adapterId: "markdown-vault";
  vaultRoot: string;
  excludePatterns?: string[]; // prefixes to skip (default: [".obsidian", ".git"])
  maxNodes?: number;          // override registry limit (default: 2000)
}

export interface CytoscapeJsonConfig {
  adapterId: "cytoscape-json";
  filePath: string;
}

export interface PackageDependencyConfig {
  adapterId: "package-dependency";
  projectPath: string;
  manifestType: "package.json" | "pyproject.toml";
}

export interface CsvEdgeListConfig {
  adapterId: "csv-edge-list";
  filePath: string;
  hasHeader?: boolean;   // default true
  delimiter?: string;    // default ","
  sourceColumn?: string; // default "source"
  targetColumn?: string; // default "target"
  labelColumn?: string;  // optional
}

export interface CerebraSnapshotConfig {
  adapterId: "cerebra-snapshot";
  filePath: string;
}

// Discriminated union of all adapter configs — keyed by adapterId literal
export type AdapterConfig =
  | SelfGraphConfig
  | MarkdownVaultConfig
  | CytoscapeJsonConfig
  | PackageDependencyConfig
  | CsvEdgeListConfig
  | CerebraSnapshotConfig;

// Loader function — every adapter registers one of these
export type LoaderFn = (config: AdapterConfig) => Promise<GraphSourceSummary>;

// Base source adapter interface — every concrete adapter must satisfy this
export interface BaseSourceAdapter {
  readonly adapterId: string;
  readonly adapterType: string;
  readonly adapterVersion: string;
  readonly family: AdapterFamily;
  readonly capabilities: AdapterCapabilities;
  load(config: AdapterConfig): Promise<GraphSourceSummary>;
}
