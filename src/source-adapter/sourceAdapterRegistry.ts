// SPDX-License-Identifier: Apache-2.0
/**
 * Source Adapter Registry
 *
 * A register-based registry of source adapters that translate external data
 * sources into the normalized LumaWeave graph format. Mirrors the
 * physicsDialectRegistry pattern: mutable entries[], Map-based loader
 * dispatch, and subscription notifications.
 *
 * Contract: docs/canonical/SOURCE_ADAPTER.md
 */

import type { LoaderFn, SelfGraphConfig } from "./baseSourceAdapter";
import type { GraphSourceSummary } from "../graph/schema/graph.types";
import { loadSelfGraph } from "../graph/ingest/loadSelfGraph";
import { invokeListFiles } from "../lib/tauri-invoke";
import { loadMarkdownVault } from "./adapters/markdownVaultAdapter";
import { loadCytoscapeJson } from "./adapters/cytoscapeJsonAdapter";
import { loadPackageDependency } from "./adapters/packageDependencyAdapter";
import { loadCsvEdgeList } from "./adapters/csvEdgeListAdapter";
import { loadCerebraSnapshot } from "./adapters/cerebraSnapshotAdapter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SourceAdapterType =
  | "self-graph"
  | "git-codebase"
  | "website-url"
  | "markdown-vault"
  | "cytoscape-json"
  | "openapi-spec"
  | "database-schema"
  | "package-dependency"
  | "cloud-infrastructure"
  | "issue-tracker"
  | "csv-edge-list"
  | "cerebra-snapshot";

export type InputPatternType = "url" | "path" | "manifest" | "schema";

export type AdapterCategory = "file-based" | "directory-based" | "database" | "stream";

export type ConfidenceType = "observed" | "inferred" | "ai-inferred";

export type AdapterStatus = "candidate" | "registered" | "validated" | "accepted" | "active";

export interface InputPattern {
  type: InputPatternType;
  pattern: string;
  examples: string[];
}

export interface TranslationSet {
  nodeMappings: Record<string, string>;
  edgeMappings: Record<string, string>;
  defaultConfidence: ConfidenceType;
}

export interface SafetyLimits {
  maxNodes?: number;
  maxEdges?: number;
  maxDepth?: number;
  maxFileSize?: number;
  timeoutMs?: number;
}

export interface QAReportFormat {
  requiredFields: string[];
}

export interface ScanCandidate {
  adapterId: string;
  score: number;
  scoreLabel: "strong match" | "weak match" | "possible";
  suggestedConfig: Record<string, unknown>;
  reason: string;
}

export type ScanFn = (target: string) => Promise<ScanCandidate | null>;

export interface SourceAdapterEntry {
  adapterId: string;
  adapterType: SourceAdapterType;
  adapterVersion: string;
  category: AdapterCategory;
  formatHint?: string;
  inputPattern: InputPattern;
  translationSet: TranslationSet;
  limits: SafetyLimits;
  qaReportFormat: QAReportFormat;
  status: AdapterStatus;
  contractVersion: string;
  lastUpdated: string;
  coupling?: "external" | "sibling-module";
}

// ---------------------------------------------------------------------------
// Registry internals
// ---------------------------------------------------------------------------

const entries: SourceAdapterEntry[] = [];
const loaderMap = new Map<string, LoaderFn>();
const scanMap = new Map<string, ScanFn>();
const listeners: Array<() => void> = [];

// ---------------------------------------------------------------------------
// Registration API
// ---------------------------------------------------------------------------

export function registerSourceAdapter(entry: SourceAdapterEntry, loader: LoaderFn, scan?: ScanFn): void {
  entries.push(entry);
  loaderMap.set(entry.adapterId, loader);
  if (scan) scanMap.set(entry.adapterId, scan);
  listeners.forEach((l) => l());
}

export function subscribeSourceAdapters(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getSourceAdapterLoader(id: string): LoaderFn | undefined {
  return loaderMap.get(id);
}

// ---------------------------------------------------------------------------
// Query API (same signatures as before, now read from mutable entries[])
// ---------------------------------------------------------------------------

export function getAllSourceAdapterEntries(): readonly SourceAdapterEntry[] {
  return entries;
}

export function getSourceAdapterEntryById(adapterId: string): SourceAdapterEntry | undefined {
  return entries.find((entry) => entry.adapterId === adapterId);
}

export function getSourceAdapterEntriesByType(adapterType: SourceAdapterType): SourceAdapterEntry[] {
  return entries.filter((entry) => entry.adapterType === adapterType);
}

export function getSourceAdapterEntriesByStatus(status: AdapterStatus): SourceAdapterEntry[] {
  return entries.filter((entry) => entry.status === status);
}

export function getSourceAdapterEntriesByContractVersion(contractVersion: string): SourceAdapterEntry[] {
  return entries.filter((entry) => entry.contractVersion === contractVersion);
}

export function getSourceAdapterEntriesByCategory(category: AdapterCategory): SourceAdapterEntry[] {
  return entries.filter((entry) => entry.category === category);
}

// ---------------------------------------------------------------------------
// Scan API (SA-015)
// ---------------------------------------------------------------------------

// Browser-safe path helpers (no Node.js path module in the webview).
function pathBasename(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i >= 0 ? p.slice(i + 1) : p;
}

function pathDirname(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i > 0 ? p.slice(0, i) : (i === 0 ? "/" : ".");
}

/**
 * Runs all registered scan() functions concurrently against `target`.
 * Returns all non-null candidates sorted by score descending.
 */
export async function scanTarget(target: string): Promise<ScanCandidate[]> {
  const fns = Array.from(scanMap.entries());
  const settled = await Promise.allSettled(fns.map(([, fn]) => fn(target)));
  return settled
    .flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []))
    .sort((a, b) => b.score - a.score);
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

function adapterErrorSummary(adapterId: string, label: string, message: string): GraphSourceSummary {
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

const candidateNoOpLoader: LoaderFn = async (config) => {
  const entry = getSourceAdapterEntryById(config.adapterId);
  return adapterErrorSummary(
    config.adapterId,
    entry?.adapterType ?? config.adapterId,
    "Adapter not yet implemented",
  );
};

// ---------------------------------------------------------------------------
// Registration calls — self-graph gets real loader; 8 candidates get no-op
// ---------------------------------------------------------------------------

registerSourceAdapter(
  {
    adapterId: "self-graph-yaml-frontmatter",
    adapterType: "self-graph",
    adapterVersion: "0.1.0",
    category: "directory-based",
    formatHint: "Reads YAML frontmatter from **/*.md files in the LumaWeave docs tree. No configuration required.",
    inputPattern: {
      type: "path",
      pattern: "**/*.md",
      examples: ["docs/overview/DOCS_INDEX.md", "docs/agent/KNOWN_SHARP_EDGES.md"],
    },
    translationSet: {
      nodeMappings: {
        "markdown-file": "doc.contract",
        "yaml-frontmatter": "doc.metadata",
      },
      edgeMappings: {
        "depends_on": "governs",
        "implements": "implements",
        "tested_by": "tested_by",
      },
      defaultConfidence: "observed",
    },
    limits: {
      maxNodes: 500,
      maxEdges: 2000,
      maxDepth: 3,
      maxFileSize: 10485760,
      timeoutMs: 30000,
    },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  (config) => loadSelfGraph(config as SelfGraphConfig),
);

registerSourceAdapter(
  {
    adapterId: "git-codebase",
    adapterType: "git-codebase",
    adapterVersion: "0.1.0",
    category: "directory-based",
    inputPattern: {
      type: "path",
      pattern: ".git",
      examples: ["/home/user/project/.git"],
    },
    translationSet: {
      nodeMappings: { "file": "code.file", "function": "code.function", "class": "code.symbol", "commit": "code.commit" },
      edgeMappings: { "import": "imports", "call": "calls", "define": "defines", "export": "exports" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 10000, maxEdges: 50000, maxDepth: 5, maxFileSize: 104857600, timeoutMs: 60000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "website-url",
    adapterType: "website-url",
    adapterVersion: "0.1.0",
    category: "stream",
    inputPattern: {
      type: "url",
      pattern: "^https?://",
      examples: ["https://example.com", "https://docs.example.com/api"],
    },
    translationSet: {
      nodeMappings: { "html-page": "website.page", "heading": "website.heading", "link": "website.asset" },
      edgeMappings: { "href": "links_to", "canonical": "canonicalizes_to" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 1000, maxEdges: 5000, maxDepth: 3, maxFileSize: 5242880, timeoutMs: 30000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "markdown-vault",
    adapterType: "markdown-vault",
    adapterVersion: "0.1.0",
    category: "directory-based",
    formatHint: "Reads **/*.md files in a directory, following wiki-links as edges. Set the vault root path.",
    inputPattern: {
      type: "path",
      pattern: "**/*.md",
      examples: ["vault/Note.md", "docs/README.md"],
    },
    translationSet: {
      nodeMappings: { "note": "markdown.note", "heading": "markdown.heading", "tag": "markdown.tag" },
      edgeMappings: { "wiki-link": "links_to", "tag": "tagged_as", "mention": "mentions" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 2000, maxEdges: 10000, maxDepth: 4, maxFileSize: 52428800, timeoutMs: 45000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-06-06T00:00:00Z",
    coupling: "external",
  },
  loadMarkdownVault,
  async (target) => {
    try {
      const files = await invokeListFiles(target, ["md"], [], 2);
      if (files.length === 0) return null;
      const count = files.length;
      return {
        adapterId: "markdown-vault",
        score: 0.6,
        scoreLabel: "weak match",
        suggestedConfig: { adapterId: "markdown-vault", vaultRoot: target },
        reason: `Found ${count > 20 ? "20+" : count} .md file${count !== 1 ? "s" : ""} in directory`,
      };
    } catch {
      return null;
    }
  },
);

registerSourceAdapter(
  {
    adapterId: "cytoscape-json",
    adapterType: "cytoscape-json",
    adapterVersion: "0.1.0",
    category: "file-based",
    formatHint: '{ "elements": { "nodes": [{"data":{"id":"a"}}], "edges": [{"data":{"id":"e1","source":"a","target":"b"}}] } }',
    inputPattern: {
      type: "path",
      pattern: "**/*.json",
      examples: ["exports/graph.json", "data/network.json"],
    },
    translationSet: {
      nodeMappings: { "node": "graph.node" },
      edgeMappings: { "edge": "graph.edge" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 2000, maxEdges: 10000, maxDepth: 1, maxFileSize: 52428800, timeoutMs: 30000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-06-08T00:00:00Z",
    coupling: "external",
  },
  loadCytoscapeJson,
  async (target) => {
    if (!target.endsWith(".json")) return null;
    return {
      adapterId: "cytoscape-json",
      score: 0.45,
      scoreLabel: "possible",
      suggestedConfig: { adapterId: "cytoscape-json", filePath: target },
      reason: "File has .json extension — may be Cytoscape.js format",
    };
  },
);

registerSourceAdapter(
  {
    adapterId: "openapi-spec",
    adapterType: "openapi-spec",
    adapterVersion: "0.1.0",
    category: "file-based",
    inputPattern: {
      type: "schema",
      pattern: "**/*.{json,yaml,yml}",
      examples: ["openapi.json", "api-spec.yaml"],
    },
    translationSet: {
      nodeMappings: { "endpoint": "api.endpoint", "schema": "api.schema", "method": "api.method" },
      edgeMappings: { "response-schema": "returns_schema", "request-schema": "uses_schema", "security": "requires_auth" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 500, maxEdges: 2000, maxDepth: 3, maxFileSize: 1048576, timeoutMs: 15000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "database-schema",
    adapterType: "database-schema",
    adapterVersion: "0.1.0",
    category: "file-based",
    inputPattern: {
      type: "schema",
      pattern: "**/*.{sql,prisma}",
      examples: ["schema.sql", "schema.prisma"],
    },
    translationSet: {
      nodeMappings: { "table": "db.table", "column": "db.column", "index": "db.index", "constraint": "db.constraint" },
      edgeMappings: { "foreign-key": "foreign_key_to", "index": "indexed_by" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 1000, maxEdges: 5000, maxDepth: 3, maxFileSize: 10485760, timeoutMs: 30000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "package-dependency",
    adapterType: "package-dependency",
    adapterVersion: "0.1.0",
    category: "file-based",
    formatHint: "Reads package.json, Cargo.toml, pyproject.toml, or go.mod. Set the project root path.",
    inputPattern: {
      type: "manifest",
      pattern: "**/{package.json,Cargo.toml,pyproject.toml,go.mod}",
      examples: ["package.json", "Cargo.toml"],
    },
    translationSet: {
      nodeMappings: { "package": "code.package", "version": "code.version", "license": "code.license" },
      edgeMappings: { "dependency": "depends_on", "dev-dependency": "dev_depends_on", "peer-dependency": "transitive_depends_on" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 500, maxEdges: 2000, maxDepth: 5, maxFileSize: 1048576, timeoutMs: 15000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-06-08T00:00:00Z",
    coupling: "external",
  },
  loadPackageDependency,
  async (target) => {
    const b = pathBasename(target);
    if (b !== "package.json") return null;
    return {
      adapterId: "package-dependency",
      score: 0.95,
      scoreLabel: "strong match",
      suggestedConfig: {
        adapterId: "package-dependency",
        projectPath: pathDirname(target),
        manifestType: "package.json",
      },
      reason: "package.json manifest detected",
    };
  },
);

registerSourceAdapter(
  {
    adapterId: "csv-edge-list",
    adapterType: "csv-edge-list",
    adapterVersion: "0.1.0",
    category: "file-based",
    formatHint: "CSV with columns: source, target (required); label (optional). First row is header by default.",
    inputPattern: {
      type: "path",
      pattern: "**/*.csv",
      examples: ["edges.csv", "graph-export.csv"],
    },
    translationSet: {
      nodeMappings: { "node": "code.entity" },
      edgeMappings: { "edge": "relates_to" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 500, maxEdges: 2000, maxDepth: 1, maxFileSize: 10485760, timeoutMs: 15000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-06-08T00:00:00Z",
    coupling: "external",
  },
  loadCsvEdgeList,
  async (target) => {
    if (!target.endsWith(".csv")) return null;
    return {
      adapterId: "csv-edge-list",
      score: 0.9,
      scoreLabel: "strong match",
      suggestedConfig: { adapterId: "csv-edge-list", filePath: target },
      reason: "File has .csv extension",
    };
  },
);

registerSourceAdapter(
  {
    adapterId: "cloud-infrastructure",
    adapterType: "cloud-infrastructure",
    adapterVersion: "0.1.0",
    category: "file-based",
    inputPattern: {
      type: "manifest",
      pattern: "**/*.{tf,yaml,yml}",
      examples: ["main.tf", "infrastructure.yaml"],
    },
    translationSet: {
      nodeMappings: { "service": "infra.service", "container": "infra.container", "bucket": "infra.storage", "role": "infra.role" },
      edgeMappings: { "depends": "depends_on", "connects": "connects_to", "assumes": "assumes_role" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 2000, maxEdges: 10000, maxDepth: 4, maxFileSize: 5242880, timeoutMs: 45000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "issue-tracker",
    adapterType: "issue-tracker",
    adapterVersion: "0.1.0",
    category: "stream",
    inputPattern: {
      type: "url",
      pattern: "^https?://(github|linear|jira)\\.",
      examples: ["https://github.com/org/repo/issues", "https://linear.app/team/issues"],
    },
    translationSet: {
      nodeMappings: { "issue": "issue.tracker.issue", "epic": "issue.tracker.epic", "milestone": "issue.tracker.milestone", "owner": "issue.tracker.owner" },
      edgeMappings: { "blocks": "blocks", "duplicate": "duplicates", "assignee": "assigned_to" },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 1000, maxEdges: 5000, maxDepth: 3, maxFileSize: 1048576, timeoutMs: 30000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "candidate",
    contractVersion: "v74a",
    lastUpdated: "2026-05-06T00:00:00Z",
    coupling: "external",
  },
  candidateNoOpLoader,
);

registerSourceAdapter(
  {
    adapterId: "cerebra-snapshot",
    adapterType: "cerebra-snapshot",
    adapterVersion: "0.1.0",
    category: "file-based",
    formatHint: "Reads a Cerebra .cerebra/graph.json snapshot. Set the absolute path to the snapshot file.",
    inputPattern: {
      type: "path",
      pattern: "**/.cerebra/graph.json",
      examples: ["~/.cerebra/graph.json", "/home/user/vault/.cerebra/graph.json"],
    },
    translationSet: {
      nodeMappings: { "spine": "cerebra.source", "memory_record": "cerebra.record" },
      edgeMappings: {
        "contains": "contains",
        "describes": "describes",
        "sku-proximity": "sku_proximity",
        "sku-exact": "sku_exact",
      },
      defaultConfidence: "observed",
    },
    limits: { maxNodes: 2000, maxEdges: 20000, maxDepth: 1, maxFileSize: 52428800, timeoutMs: 30000 },
    qaReportFormat: { requiredFields: ["adapterId", "sourceDescription", "counts", "limits", "safety"] },
    status: "registered",
    contractVersion: "v74a",
    lastUpdated: "2026-06-17T00:00:00Z",
    coupling: "external",
  },
  loadCerebraSnapshot,
  async (target) => {
    const isCerebraPath = target.includes("/.cerebra/graph.json") || target.endsWith(".cerebra/graph.json");
    const isPossible = !isCerebraPath && pathBasename(target) === "graph.json" && target.includes("/.cerebra/");
    if (!isCerebraPath && !isPossible) return null;
    return {
      adapterId: "cerebra-snapshot",
      score: isCerebraPath ? 0.95 : 0.5,
      scoreLabel: isCerebraPath ? "strong match" : "possible",
      suggestedConfig: { adapterId: "cerebra-snapshot", filePath: target },
      reason: isCerebraPath
        ? "Path matches Cerebra snapshot pattern (.cerebra/graph.json)"
        : "Filename is graph.json inside a .cerebra directory",
    };
  },
);
