#!/usr/bin/env node
/**
 * LumaWeave Self-Graph Generator
 * Reads docs/ YAML frontmatter and generates
 * src/fixtures/self-graph-generated.json
 * Run: node scripts/generate-self-graph.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);
const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const outputFile = path.join(
  repoRoot,
  "src/fixtures/self-graph-generated.json"
);

// Brand cluster colors
const CLUSTER_COLORS = {
  blue:   "#4fa3e0",
  purple: "#a67de8",
  gold:   "#e0a84f",
  teal:   "#4fd9c8",
  green:  "#64d9a4",
  gray:   "#6a7485",
};

// Node type → base size
const TYPE_SIZES = {
  "docs.contract":  14,
  "docs.policy":    12,
  "docs.manual":    10,
  "docs.registry":  10,
  "docs.roadmap":   10,
  "docs.folder":    12,
  "docs.file":       8,
  "code.system":    18,
  "code.file":       8,
  "code.test":       6,
  "code.script":     6,
};

function clusterColor(cluster) {
  return CLUSTER_COLORS[cluster] ?? "#6a7485";
}

function typeSize(type) {
  return TYPE_SIZES[type] ?? 8;
}

// Recursively find all .md files
function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

const mdFiles = findMdFiles(docsDir);
const nodes = [];
const edges = [];
const foldersSeen = new Set();

// Code spine nodes
const CODE_SPINES = [
  { id: "code.system.core",           label: "core",           cluster: "blue",   path: "src/app" },
  { id: "code.system.graph",          label: "graph",          cluster: "blue",   path: "src/graph" },
  { id: "code.system.theme",          label: "theme",          cluster: "gold",   path: "src/themes" },
  { id: "code.system.audio",          label: "audio",          cluster: "green",  path: "src/audio" },
  { id: "code.system.accessibility",  label: "accessibility",  cluster: "green",  path: "src/accessibility" },
  { id: "code.system.source-adapter", label: "source-adapter", cluster: "green",  path: "src/source-adapter" },
  { id: "code.system.control-plane",  label: "control-plane",  cluster: "purple", path: "src/control-plane" },
  { id: "code.system.modes",          label: "modes",          cluster: "teal",   path: "src/control-plane/modes" },
];

for (const spine of CODE_SPINES) {
  nodes.push({
    id: spine.id,
    label: spine.label,
    type: "code.system",
    cluster: spine.cluster,
    sourceAdapter: "yaml-frontmatter-parser",
    metadata: {
      path: spine.path,
    },
  });
}

const DOMAIN_TO_SPINE = {
  "graph":          "code.system.graph",
  "theme":          "code.system.theme",
  "audio":          "code.system.audio",
  "accessibility":  "code.system.accessibility",
  "source-adapter": "code.system.source-adapter",
  "control-plane":  "code.system.control-plane",
};

// Process each markdown file
for (const filePath of mdFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data: fm } = matter(content);

  if (!fm.include_in_self_graph) continue;
  if (!fm.id || !fm.domain) continue;

  const cluster = fm.cluster ?? "gray";
  const domain = fm.domain;
  const nodeType = `docs.${fm.type ?? "file"}`;
  const relPath = path.relative(repoRoot, filePath)
    .replace(/\\/g, "/");

  // Ensure folder node
  const folderId = `docs.folder.${domain}`;
  if (!foldersSeen.has(folderId)) {
    foldersSeen.add(folderId);
    nodes.push({
      id: folderId,
      label: domain,
      type: "docs.folder",
      cluster,
      sourceAdapter: "yaml-frontmatter-parser",
      metadata: {
        path: `docs/${domain}`,
      },
    });
  }

  // Doc file node
  const nodeId = `docs.file.${fm.id}`;
  nodes.push({
    id: nodeId,
    label: fm.title ?? fm.id,
    type: nodeType,
    cluster,
    sourceAdapter: "yaml-frontmatter-parser",
    metadata: {
      path: relPath,
      status: fm.status,
      domain,
      tags: fm.tags ?? [],
    },
  });

  // contains edge: folder → file
  edges.push({
    id: `edge.contains.${nodeId}`,
    source: folderId,
    target: nodeId,
    type: "contains",
    confidence: "observed",
    metadata: {},
  });

  // governs edge: contract/policy → code spine
  if (
    (fm.type === "contract" || fm.type === "policy") &&
    DOMAIN_TO_SPINE[domain]
  ) {
    edges.push({
      id: `edge.governs.${nodeId}`,
      source: nodeId,
      target: DOMAIN_TO_SPINE[domain],
      type: "governs",
      confidence: "observed",
      metadata: {},
    });
  }
}

// Output
// Deduplicate nodes by ID (keep first occurrence)
const seenNodeIds = new Set();
const deduplicatedNodes = nodes.filter(node => {
  if (seenNodeIds.has(node.id)) {
    console.warn(`[DEDUP] Skipping duplicate node: ${node.id}`);
    return false;
  }
  seenNodeIds.add(node.id);
  return true;
});

// Deduplicate edges by ID
const seenEdgeIds = new Set();
const deduplicatedEdges = edges.filter(edge => {
  if (seenEdgeIds.has(edge.id)) {
    return false;
  }
  seenEdgeIds.add(edge.id);
  return true;
});

// Filter edges whose source/target no longer exist
const validNodeIds = new Set(deduplicatedNodes.map(n => n.id));
const validEdges = deduplicatedEdges.filter(edge =>
  validNodeIds.has(edge.source) &&
  validNodeIds.has(edge.target)
);

const graph = {
  nodes: deduplicatedNodes,
  edges: validEdges,
  metadata: {
    adapterId: "yaml-frontmatter-parser",
    createdAt: new Date().toISOString(),
    inputSummary: `${deduplicatedNodes.length} nodes from docs/ YAML frontmatter`,
    nodeCount: deduplicatedNodes.length,
    edgeCount: validEdges.length,
    warnings: [],
  },
};

fs.writeFileSync(outputFile, JSON.stringify(graph, null, 2));
console.log(
  `✅ Self-graph generated: ${deduplicatedNodes.length} nodes, ` +
  `${validEdges.length} edges → ${outputFile}`
);
