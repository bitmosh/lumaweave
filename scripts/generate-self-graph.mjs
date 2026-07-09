#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * LumaWeave Self-Graph Generator v2
 * Generates self-graph conforming to SELF_GRAPH_SCHEMA.md v1
 * Run: node scripts/generate-self-graph.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { glob } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

// Output paths
const graphOutputFile = path.join(repoRoot, "src/fixtures/self-graph-generated.json");
const manifestOutputFile = path.join(repoRoot, "src/fixtures/self-graph-manifest.json");
const reportOutputFile = path.join(repoRoot, "src/fixtures/GRAPH_REPORT.md");

// Cluster taxonomy (canonical alignment with cluster-colors.json)
const CLUSTER_MAP = {
  "src/themes/*": "gold",
  "src/graph/*": "azure",
  "src/control-plane/*": "slate",
  "src/audio/*": "ember",
  "src/accessibility/*": "crimson",
  "src/source-adapter/*": "lime",
  "docs/theme/*": "gold",
  "docs/graph/*": "azure",
  "docs/control-plane/*": "slate",
  "docs/agent/*": "violet",
  "docs/visual-grammar-engine/*": "teal",
  "docs/source-adapter/*": "lime",
  "docs/audio/*": "ember",
  "docs/accessibility/*": "crimson",
  "docs/layout/*": "stone",
  "docs/platform/*": "indigo",
  "docs/vr/*": "indigo",
  "docs/rendering/*": "azure",
  "docs/registries/*": "slate",
  "docs/mission-control/*": "slate",
  "docs/grammar-lens/*": "teal",
  "docs/handleset/*": "azure",
  "docs/operating-policies/*": "violet",
  "docs/roadmap/*": "slate",
  "docs/quest/*": "slate",
  "docs/physics/*": "azure",
  "docs/overview/*": "stone",
  "docs/design/*": "azure",
  "docs/updates/*": "violet",
  "docs/_meta/*": "violet",
  "docs/screenshots/*": "stone",
};

// Config files to include (v1 hard-coded list)
const CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "playwright.config.ts",
];

// Tag stopwords for tag-overlap filtering (v1.1: expanded with directory-derived tags)
const TAG_STOPWORDS = [
  "accessibility", "app", "assets", "audio", "code",
  "control-plane", "current", "doc", "docs", "fixtures",
  "graph", "registry", "renderers", "source-adapter",
  "src", "styles", "themes", "ui", "v86", "v87"
];

// Health tracking
const health = {
  nodesWithoutCluster: 0,
  nodesWithoutStatus: 0,
  orphanedNodes: 0,
  brokenReferences: [],
};

// Slug utility: kebab-case path with extension removed
function slug(filePath) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  return relPath
    .replace(/\.[^.]+$/, "") // remove extension
    .replace(/[\/\\]/g, ".")  // slashes to dots
    .replace(/[^a-z0-9.-]/gi, "-") // sanitize
    .toLowerCase();
}

// Infer cluster from src/ subdirectory
function inferClusterFromPath(filePath) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  for (const [pattern, cluster] of Object.entries(CLUSTER_MAP)) {
    // Pattern may be "src/audio/*" or "docs/agent/*"
    // For directory paths, strip the "/*" and match prefix
    const patternBase = pattern.replace(/\/\*$/, "");
    if (relPath === patternBase || relPath.startsWith(patternBase + "/")) {
      return cluster;
    }
  }
  return null;
}

// Extract tags from code path: [top-level dir, second-level dir]
function extractCodeTags(filePath) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const parts = relPath.split("/");
  if (parts[0] === "src" && parts.length >= 2) {
    return [parts[0], parts[1]];
  }
  return [];
}

// Line count utility
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").length;
  } catch {
    return 0;
  }
}

// Get git commit if available
function getGitCommit() {
  try {
    const { execSync } = require("child_process");
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return undefined;
  }
}

// ============================================================================
// SECTION 1: NODE EXTRACTION
// ============================================================================

const nodes = [];
const nodeMap = new Map(); // id -> node for edge resolution

// --- DOCS ---

function findMdFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

const docsDir = path.join(repoRoot, "docs");
const mdFiles = findMdFiles(docsDir);

for (const filePath of mdFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const { data: fm, content: body } = matter(content);

  if (fm.include_in_self_graph === false) continue;

  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const id = fm.id || slug(filePath);
  const stat = fs.statSync(filePath);

  // Dedup: skip if id already exists (e.g., duplicate frontmatter id)
  if (nodeMap.has(id)) {
    console.warn(`generate-self-graph: skipping duplicate node id '${id}' (existing type: ${nodeMap.get(id).type}, attempted type: doc, path: ${relPath})`);
    continue;
  }

  nodes.push({
    id,
    type: "doc",
    label: path.basename(filePath, ".md"),
    fullLabel: fm.title || path.basename(filePath, ".md"),
    path: relPath,
    cluster: fm.cluster || null,
    status: fm.status || null,
    tags: fm.tags || [],
    size: countLines(filePath),
    lastModified: stat.mtime.toISOString(),
    raw: {},
    _body: body, // store for edge extraction
    _frontmatter: fm, // store for edge extraction
  });

  nodeMap.set(id, nodes[nodes.length - 1]);

  // Health tracking
  if (!fm.cluster) health.nodesWithoutCluster++;
  if (!fm.status) health.nodesWithoutStatus++;
}

// --- CODE ---

const codePatterns = [
  "src/**/*.ts",
  "src/**/*.tsx",
  "src/**/*.mjs",
  "src/**/*.js",
];

const codeFiles = glob.sync(codePatterns, {
  cwd: repoRoot,
  ignore: [
    "**/__tests__/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/*.d.ts",
    "**/node_modules/**",
  ],
});

for (const filePath of codeFiles) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const id = slug(filePath);
  const stat = fs.statSync(filePath);
  const cluster = inferClusterFromPath(filePath) || null;
  const tags = extractCodeTags(filePath);

  // Dedup: skip if id already exists
  if (nodeMap.has(id)) {
    console.warn(`generate-self-graph: skipping duplicate node id '${id}' (existing type: ${nodeMap.get(id).type}, attempted type: code, path: ${relPath})`);
    continue;
  }

  nodes.push({
    id,
    type: "code",
    label: path.basename(filePath, path.extname(filePath)),
    fullLabel: path.basename(filePath),
    path: relPath,
    cluster,
    status: null,
    tags,
    size: countLines(filePath),
    lastModified: stat.mtime.toISOString(),
    raw: {
      color: "#5a6678",
      dimFactor: 0.55,
    },
    _body: fs.readFileSync(filePath, "utf-8"), // store for import parsing
  });

  nodeMap.set(id, nodes[nodes.length - 1]);

  if (!cluster) health.nodesWithoutCluster++;
}

// --- CONFIG ---

for (const configName of CONFIG_FILES) {
  const filePath = path.join(repoRoot, configName);
  if (!fs.existsSync(filePath)) continue;

  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const id = slug(filePath);
  const stat = fs.statSync(filePath);

  // Dedup: skip if id already exists
  if (nodeMap.has(id)) {
    console.warn(`generate-self-graph: skipping duplicate node id '${id}' (existing type: ${nodeMap.get(id).type}, attempted type: config, path: ${relPath})`);
    continue;
  }

  nodes.push({
    id,
    type: "config",
    label: configName,
    fullLabel: configName,
    path: relPath,
    cluster: "slate",
    status: null,
    tags: [],
    size: countLines(filePath),
    lastModified: stat.mtime.toISOString(),
    raw: {
      color: "#6b7280",
      dimFactor: 0.45,
    },
  });

  nodeMap.set(id, nodes[nodes.length - 1]);
}

// --- FIXTURE ---

const fixturePatterns = ["src/fixtures/*.json"];
const fixtureFiles = glob.sync(fixturePatterns.join("\n"), {
  cwd: repoRoot,
  ignore: [
    "src/fixtures/self-graph-generated.json",
    "src/fixtures/self-graph-manifest.json",
  ],
});

for (const filePath of fixtureFiles) {
  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const id = slug(filePath);
  const stat = fs.statSync(filePath);

  // Dedup: skip if id already exists
  if (nodeMap.has(id)) {
    console.warn(`generate-self-graph: skipping duplicate node id '${id}' (existing type: ${nodeMap.get(id).type}, attempted type: fixture, path: ${relPath})`);
    continue;
  }

  nodes.push({
    id,
    type: "fixture",
    label: path.basename(filePath),
    fullLabel: path.basename(filePath),
    path: relPath,
    cluster: "slate",
    status: null,
    tags: [],
    size: countLines(filePath),
    lastModified: stat.mtime.toISOString(),
    raw: {
      color: "#5a6678",
      dimFactor: 0.45,
    },
  });

  nodeMap.set(id, nodes[nodes.length - 1]);
}

// Build node map for edge resolution
for (const node of nodes) {
  nodeMap.set(node.id, node);
}

// ============================================================================
// SECTION: SYNTHESIZE DIRECTORY SPINE NODES (dynamic enumeration)
// Every immediate subdirectory of src/ and docs/ becomes a spine node.
// Plus two "root-level" spines (spine.src-root, spine.docs-root) for files
// living directly in src/ or docs/ (not in any subdirectory). Those files
// attach to their root spine via contains edges; the seeder treats them as
// endpoint-fans at the spine's terminus.
//
// Pass C8.1: replaces the previously hardcoded TOP_LEVEL_SUBSYSTEMS list.
// ============================================================================

function listImmediateSubdirs(rootRelativeDir) {
  const fullDir = path.join(repoRoot, rootRelativeDir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => !d.name.startsWith('.'))  // skip .git, .vscode, etc.
    .filter(d => !['node_modules', 'dist', 'build', 'screenshots'].includes(d.name))
    .map(d => `${rootRelativeDir}/${d.name}`);
}

function listImmediateFiles(rootRelativeDir) {
  const fullDir = path.join(repoRoot, rootRelativeDir);
  if (!fs.existsSync(fullDir)) return [];
  return fs
    .readdirSync(fullDir, { withFileTypes: true })
    .filter(d => d.isFile())
    .filter(d => !d.name.startsWith('.'))
    .map(d => `${rootRelativeDir}/${d.name}`);
}

// Build the spine list: every immediate subdirectory of src/ and docs/
const SUBSYSTEM_DIRS = [
  ...listImmediateSubdirs('src'),
  ...listImmediateSubdirs('docs'),
];

// Build spine ID from a directory path.
// "src/graph" -> "spine.src.graph"
// "docs/design" -> "spine.docs.design"
function spineIdForPath(dirPath) {
  const segs = dirPath.split('/').map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  return `spine.${segs.join('.')}`;
}

// Materialize a spine node for each subdirectory
for (const dirPath of SUBSYSTEM_DIRS) {
  const spineId = spineIdForPath(dirPath);
  if (nodeMap.has(spineId)) continue;
  
  let mtime;
  try {
    mtime = fs.statSync(path.join(repoRoot, dirPath)).mtime.toISOString();
  } catch {
    mtime = new Date().toISOString();
  }
  
  const dirNode = {
    id: spineId,
    type: "spine",
    label: dirPath,           // full path → "src/graph", "docs/design"
    fullLabel: dirPath,
    path: dirPath,
    cluster: inferClusterFromPath(path.join(repoRoot, dirPath)) || null,
    status: null,
    tags: [],
    size: 0,
    lastModified: mtime,
    raw: {
      color: "#9ca3af",
      dimFactor: 0.8,
    },
  };
  
  nodes.push(dirNode);
  nodeMap.set(spineId, dirNode);
}

// Materialize "root-level" spines for src/ and docs/ themselves,
// to hold loose files that aren't in any subsystem subdirectory.
const ROOT_SPINES = [
  { spineId: "spine.src-root", path: "src", label: "src (root files)" },
  { spineId: "spine.docs-root", path: "docs", label: "docs (root files)" },
];

for (const { spineId, path: dirPath, label } of ROOT_SPINES) {
  if (nodeMap.has(spineId)) continue;
  
  // Only create the root spine if there are actually loose files there
  const looseFiles = listImmediateFiles(dirPath);
  if (looseFiles.length === 0) continue;
  
  let mtime;
  try {
    mtime = fs.statSync(path.join(repoRoot, dirPath)).mtime.toISOString();
  } catch {
    mtime = new Date().toISOString();
  }
  
  const dirNode = {
    id: spineId,
    type: "spine",
    label,
    fullLabel: dirPath,
    path: dirPath,
    cluster: inferClusterFromPath(path.join(repoRoot, dirPath)) || null,
    status: null,
    tags: [],
    size: 0,
    lastModified: mtime,
    raw: {
      color: "#9ca3af",
      dimFactor: 0.8,
    },
  };
  
  nodes.push(dirNode);
  nodeMap.set(spineId, dirNode);
}

console.log(`✅ Synthesized ${SUBSYSTEM_DIRS.length} subsystem spines + ${ROOT_SPINES.filter(r => listImmediateFiles(r.path).length > 0).length} root-level spines`);

// ============================================================================
// SECTION 1.5: SYNTHESIZE DIRECTORY NODES
// ============================================================================
// For every leaf node (doc/code/config/fixture), ensure every directory
// component of its path exists as a "directory" type node.
//
// Example: src/control-plane/panels/HelixTwistSliders.tsx requires:
//   - src                              → node id: "src"
//   - src/control-plane                → node id: "src.control-plane"
//   - src/control-plane/panels         → node id: "src.control-plane.panels"
//
// These directory nodes link the leaf files into a contains-edge chain
// that gwells's radial-backbone seeder can walk.

const directoriesToCreate = new Set();

for (const node of nodes) {
  // Walk every parent directory of this node's path
  if (!node.path) continue;
  let dirPath = path.dirname(node.path);
  while (dirPath && dirPath !== "." && dirPath !== "/") {
    directoriesToCreate.add(dirPath);
    dirPath = path.dirname(dirPath);
  }
}

// Convert each directory path into a directory node
for (const dirPath of directoriesToCreate) {
  const id = slug(dirPath);
  
  // Skip if a node with this ID already exists (defensive)
  if (nodeMap.has(id)) continue;
  
  const label = path.basename(dirPath);
  const cluster = inferClusterFromPath(dirPath) || null;
  
  nodes.push({
    id,
    type: "directory",
    label,
    fullLabel: dirPath,
    path: dirPath,
    cluster,
    status: null,
    tags: [],
    size: 0,
    lastModified: new Date().toISOString(),
    raw: {
      color: "#7a8a9a",
      dimFactor: 0.7,
    },
  });
  
  nodeMap.set(id, nodes[nodes.length - 1]);
}

console.log(`✅ Synthesized ${directoriesToCreate.size} directory nodes`);

// ============================================================================
// SECTION 2: EDGE EXTRACTION
// ============================================================================

const edges = [];
const edgeSet = new Set(); // for deduplication

function addEdge(source, target, type, weight, bidirectional, provenance) {
  const edgeId = `edge-${source}-${target}-${type}`;
  if (edgeSet.has(edgeId)) return;
  edgeSet.add(edgeId);

  edges.push({
    id: edgeId,
    source,
    target,
    type,
    weight,
    bidirectional,
    provenance,
  });
}

// --- Type "contains" (flattened directory parenting) ---
// See SECTION 2.1 below for unified contains-edge generation

// --- Type "governs" (contract/policy → spine) ---

const DOMAIN_TO_SPINE = {
  "graph":          "src.graph",
  "theme":          "src.themes",
  "audio":          "src.audio",
  "accessibility":  "src.accessibility",
  "source-adapter": "src.source-adapter",
  "control-plane":  "src.control-plane",
};

for (const node of nodes) {
  if (node.type !== "doc") continue;
  if (!node._frontmatter) continue;

  const fm = node._frontmatter;
  if (fm.type !== "contract" && fm.type !== "policy") continue;

  const domain = fm.domain;
  const spineId = DOMAIN_TO_SPINE[domain];

  if (spineId && nodeMap.has(spineId)) {
    addEdge(
      node.id,
      spineId,
      "governs",
      0.7,
      false,
      { source: "frontmatter", detail: "governs" }
    );
  }
}

// --- Type "explicit-reference" (from frontmatter references:) ---

for (const node of nodes) {
  if (node.type !== "doc") continue;
  if (!node._frontmatter) continue;
  
  const fm = node._frontmatter;
  const refs = fm.references || [];
  
  for (const refId of refs) {
    if (nodeMap.has(refId)) {
      addEdge(
        node.id,
        refId,
        "explicit-reference",
        1.0,
        false,
        { source: "frontmatter", detail: "references" }
      );
    } else {
      health.brokenReferences.push({ source: node.id, target: refId });
    }
  }
}

// --- Type "wiki-link" ([[xxx]] in markdown body) ---

const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

for (const node of nodes) {
  if (node.type !== "doc" || !node._body) continue;
  
  const body = node._body;
  let match;
  
  while ((match = wikiLinkRegex.exec(body)) !== null) {
    const targetText = match[1];
    // Try to resolve by id first, then by slug
    let targetId = null;
    
    // Direct id match
    if (nodeMap.has(targetText)) {
      targetId = targetText;
    } else {
      // Try slug conversion
      const slugTarget = targetText
        .toLowerCase()
        .replace(/[^a-z0-9.-]/gi, "-")
        .replace(/\s+/g, "-");
      
      for (const [id, n] of nodeMap) {
        if (id === slugTarget || n.label.toLowerCase() === slugTarget) {
          targetId = id;
          break;
        }
      }
    }
    
    if (targetId) {
      addEdge(
        node.id,
        targetId,
        "wiki-link",
        0.7,
        false,
        { source: "body-parse", detail: "wikilink" }
      );
    }
  }
}

// --- Type "markdown-link" ([text](path.md)) ---

const mdLinkRegex = /\[([^\]]+)\]\(([^)]+\.md)\)/g;

for (const node of nodes) {
  if (node.type !== "doc" || !node._body) continue;
  
  const body = node._body;
  let match;
  
  while ((match = mdLinkRegex.exec(body)) !== null) {
    const linkPath = match[2];
    // Resolve relative to doc location
    const docDir = path.dirname(node.path);
    const targetPath = path.resolve(repoRoot, docDir, linkPath);
    const targetRel = path.relative(repoRoot, targetPath).replace(/\\/g, "/");
    const targetId = slug(targetPath);
    
    if (nodeMap.has(targetId)) {
      addEdge(
        node.id,
        targetId,
        "markdown-link",
        0.65,
        false,
        { source: "body-parse", detail: "markdown-link" }
      );
    }
  }
}

// --- Type "code-import" (import statements) ---

const importRegex = /^import .* from ["']([^"']+)["']/gm;
const sideEffectImportRegex = /^import ["']([^"']+)["']/gm;

for (const node of nodes) {
  if (node.type !== "code" || !node._body) continue;
  
  const body = node._body;
  const imports = [];
  
  // Regular imports
  let match;
  while ((match = importRegex.exec(body)) !== null) {
    imports.push(match[1]);
  }
  
  // Side-effect imports
  importRegex.lastIndex = 0; // reset
  while ((match = sideEffectImportRegex.exec(body)) !== null) {
    imports.push(match[1]);
  }
  
  const codeDir = path.dirname(node.path);
  
  for (const importPath of imports) {
    // Skip node_modules imports
    if (!importPath.startsWith(".") && !importPath.startsWith("/")) continue;
    
    // Resolve relative path
    const targetPath = path.resolve(repoRoot, codeDir, importPath);
    
    // Try with .ts, .tsx, .js, .mjs extensions
    const extensions = [".ts", ".tsx", ".js", ".mjs"];
    let resolvedTarget = null;
    
    for (const ext of extensions) {
      const tryPath = targetPath + ext;
      if (fs.existsSync(tryPath)) {
        resolvedTarget = tryPath;
        break;
      }
    }
    
    // Try index files
    if (!resolvedTarget) {
      for (const ext of extensions) {
        const tryPath = path.join(targetPath, `index${ext}`);
        if (fs.existsSync(tryPath)) {
          resolvedTarget = tryPath;
          break;
        }
      }
    }
    
    if (resolvedTarget) {
      const targetRel = path.relative(repoRoot, resolvedTarget).replace(/\\/g, "/");
      const targetId = slug(resolvedTarget);
      
      if (nodeMap.has(targetId)) {
        addEdge(
          node.id,
          targetId,
          "code-import",
          0.85,
          false,
          { source: "body-parse", detail: "import" }
        );
      }
    }
  }
}

// --- Type "tag-overlap" (shared tags) ---

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i];
    const b = nodes[j];

    if (!a.tags.length || !b.tags.length) continue;

    const sharedTags = a.tags.filter(tag => b.tags.includes(tag));

    // Remove stopwords
    const filteredSharedTags = sharedTags.filter(
      tag => !TAG_STOPWORDS.includes(tag)
    );

    if (filteredSharedTags.length >= 2) {
      const weight = Math.min(0.6, filteredSharedTags.length / 4);
      const sortedIds = [a.id, b.id].sort();
      const edgeId = `edge-${sortedIds[0]}-${sortedIds[1]}-tag-overlap`;

      if (!edgeSet.has(edgeId)) {
        addEdge(
          a.id,
          b.id,
          "tag-overlap",
          weight,
          true,
          {
            source: "frontmatter",
            detail: "shared tags: " + filteredSharedTags.join(", "),
          }
        );
      }
    }
  }
}

// --- Per-node tag-overlap edge cap (max 5 per node, prioritized by weight) ---

const tagOverlapEdges = edges.filter(e => e.type === "tag-overlap");
const nonTagOverlapEdges = edges.filter(e => e.type !== "tag-overlap");

// Iteratively enforce cap: remove lowest-weight edges from nodes exceeding 5
let currentTagOverlapEdges = [...tagOverlapEdges];
let iteration = 0;
const maxIterations = 100;

while (iteration < maxIterations) {
  // Count tag-overlap edges per node
  const edgeCountByNode = new Map();
  for (const edge of currentTagOverlapEdges) {
    for (const nodeId of [edge.source, edge.target]) {
      edgeCountByNode.set(nodeId, (edgeCountByNode.get(nodeId) || 0) + 1);
    }
  }

  // Find nodes exceeding cap
  const nodesOverCap = [];
  for (const [nodeId, count] of edgeCountByNode) {
    if (count > 5) {
      nodesOverCap.push({ nodeId, count });
    }
  }

  if (nodesOverCap.length === 0) {
    break; // All nodes within cap
  }

  // For each node over cap, remove its lowest-weight tag-overlap edges
  const edgesToRemove = new Set();
  for (const { nodeId } of nodesOverCap) {
    const nodeEdges = currentTagOverlapEdges.filter(
      e => e.source === nodeId || e.target === nodeId
    );
    // Sort by weight ascending (lowest first)
    nodeEdges.sort((a, b) => a.weight - b.weight);
    // Remove edges until node is at cap (remove lowest-weight first)
    const excess = edgeCountByNode.get(nodeId) - 5;
    for (let i = 0; i < excess && i < nodeEdges.length; i++) {
      edgesToRemove.add(nodeEdges[i].id);
    }
  }

  // Filter out removed edges
  currentTagOverlapEdges = currentTagOverlapEdges.filter(e => !edgesToRemove.has(e.id));
  iteration++;
}

if (iteration >= maxIterations) {
  console.warn("Tag-overlap cap enforcement did not converge within max iterations");
}

console.log(`Tag-overlap cap enforced in ${iteration} iterations`);

// Replace edges array with non-tag-overlap edges + capped tag-overlap edges
edges.length = 0;
edges.push(...nonTagOverlapEdges, ...currentTagOverlapEdges);

// --- Type "describes" (doc mentions code path) ---

const codeNodePaths = new Set(
  nodes.filter(n => n.type === "code").map(n => n.path)
);

for (const node of nodes) {
  if (node.type !== "doc" || !node._body) continue;
  
  const body = node._body;
  
  for (const codePath of codeNodePaths) {
    // Check if doc body mentions the code path
    if (body.includes(codePath)) {
      // Find the code node id
      const codeNode = nodes.find(n => n.path === codePath);
      if (codeNode) {
        addEdge(
          node.id,
          codeNode.id,
          "describes",
          0.6,
          false,
          { source: "heuristic", detail: "doc mentions code path" }
        );
      }
    }
  }
}

// ============================================================================
// SECTION 2.1: CONTAINS EDGES (filesystem-hierarchical parenting)
// ============================================================================
// Every node's contains-parent is its real immediate filesystem parent.
//
// - A leaf (doc/code/config/fixture) at `src/graph/foo.ts` is contained by
//   the directory `src/graph`.
// - A directory at `src/graph/renderers` is contained by `src/graph`.
// - A top-level directory at `src/graph` is contained by the spine
//   `spine.graph` (whose .path is also "src/graph").
// - A top-level directory whose path doesn't match any spine's path (e.g.,
//   `src/control-plane` when there's no `spine.control-plane`) is contained
//   by its closest spine ancestor by path prefix.
//
// Provenance sources:
// - "directory-hierarchy": directory → its-parent-directory
// - "spine-to-top-directory": spine → its-matching-top-level-directory
// - "directory-leaf": directory → its immediate file leaves
// - "spine-direct-leaf": fallback for a leaf with no synthesized directory parent
//
// This restores real filesystem hierarchy that Pass C6's flatten broke.
// The seeders rely on this to build the fern-frond layout.

const SPINE_NODES = nodes.filter(n => n.type === "spine");

// Find the spine whose .path is the longest prefix of the given path.
// Also handles the case where the target path is an ancestor of a spine path
// (e.g., "docs" is ancestor of "docs/graph").
function findOwningSpine(targetPath) {
  let best = null;
  let bestLen = 0;
  for (const spine of SPINE_NODES) {
    // Case 1: spine path is prefix of target (target is under spine)
    if (targetPath === spine.path || targetPath.startsWith(spine.path + "/")) {
      if (spine.path.length > bestLen) {
        best = spine;
        bestLen = spine.path.length;
      }
    }
    // Case 2: target path is prefix of spine path (target is ancestor of spine)
    // This handles top-level directories like "docs" and "src"
    else if (spine.path.startsWith(targetPath + "/")) {
      if (targetPath.length > bestLen) {
        best = spine;
        bestLen = targetPath.length;
      }
    }
  }
  return best;
}

// Pass 1: every DIRECTORY gets a contains-parent.
// - If its own path matches a spine.path, attach to that spine (spine root case).
// - Else if its parent path matches another synthesized directory, use that.
// - Else if its parent path matches a spine.path, attach to that spine.
// - Else attach to its owning spine by prefix (fallback).
for (const node of nodes) {
  if (node.type !== "directory") continue;

  const parentPath = path.dirname(node.path);
  const parentDirId = slug(parentPath);

  // Case A: directory's own path matches a spine.path (this directory IS the spine's root)
  const matchingSpine = SPINE_NODES.find(s => s.path === node.path);
  if (matchingSpine) {
    addEdge(
      matchingSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-to-top-directory", detail: "spine→its-top-level-directory" }
    );
    continue;
  }

  // Case B: parent directory exists as a synthesized node
  if (nodeMap.has(parentDirId) && nodeMap.get(parentDirId).type === "directory") {
    addEdge(
      parentDirId,
      node.id,
      "contains",
      0.5,
      false,
      { source: "directory-hierarchy", detail: "directory→parent-directory" }
    );
    continue;
  }

  // Case C: parent is a spine (top-level directory whose parent path matches a spine.path)
  const parentSpine = SPINE_NODES.find(s => s.path === parentPath);
  if (parentSpine) {
    addEdge(
      parentSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-to-top-directory", detail: "spine→its-top-level-directory" }
    );
    continue;
  }

  // Case D: no exact parent. Find the owning spine and attach there.
  // This handles cases like `docs/_archive/legacy` where `docs/_archive` isn't
  // synthesized but `docs` (under spine.docs) is.
  const owningSpine = findOwningSpine(node.path);
  if (owningSpine) {
    addEdge(
      owningSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-fallback", detail: "directory with no synthesized parent" }
    );
  }
  // If no owning spine either, the directory is orphaned. Don't error — log.
  else {
    console.warn(`[generate-self-graph] Orphan directory: ${node.id} (${node.path})`);
  }
}

// Pass 2: every LEAF gets a contains-parent.
// - Immediate filesystem parent directory if it exists as a synthesized node.
// - Else owning spine as fallback.
for (const node of nodes) {
  if (
    node.type !== "doc" &&
    node.type !== "code" &&
    node.type !== "config" &&
    node.type !== "fixture"
  ) continue;

  const parentPath = path.dirname(node.path);
  const parentDirId = slug(parentPath);

  if (nodeMap.has(parentDirId) && nodeMap.get(parentDirId).type === "directory") {
    addEdge(
      parentDirId,
      node.id,
      "contains",
      0.5,
      false,
      { source: "directory-leaf", detail: "directory→leaf-file" }
    );
    continue;
  }

  // Check if parent path matches a spine directly (file at top level of spine.path)
  const parentSpine = SPINE_NODES.find(s => s.path === parentPath);
  if (parentSpine) {
    // Mark as endpoint-fan if attached to a root spine (loose file at src/ or docs/)
    if (parentSpine.id === "spine.src-root" || parentSpine.id === "spine.docs-root") {
      node.isEndpoint = true;
    }
    addEdge(
      parentSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-direct-leaf", detail: "spine→file-at-spine-root" }
    );
    continue;
  }

  // Fallback to owning spine
  const owningSpine = findOwningSpine(node.path);
  if (owningSpine) {
    addEdge(
      owningSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-direct-leaf", detail: "leaf with no immediate directory parent" }
    );
  } else {
    console.warn(`[generate-self-graph] Orphan leaf: ${node.id} (${node.path})`);
  }
}

// ============================================================================
// SECTION 3: CLEANUP
// ============================================================================

// Remove _body and _frontmatter from nodes (not part of schema)
for (const node of nodes) {
  delete node._body;
  delete node._frontmatter;
}

// Filter edges to only those with valid source/target
const validNodeIds = new Set(nodes.map(n => n.id));
const validEdges = edges.filter(
  e => validNodeIds.has(e.source) && validNodeIds.has(e.target)
);

// Count orphaned nodes
const nodeDegree = new Map();
for (const edge of validEdges) {
  nodeDegree.set(edge.source, (nodeDegree.get(edge.source) || 0) + 1);
  nodeDegree.set(edge.target, (nodeDegree.get(edge.target) || 0) + 1);
}

for (const node of nodes) {
  if (!nodeDegree.has(node.id)) {
    health.orphanedNodes++;
  }
}

// ============================================================================
// SECTION 4: METADATA BLOCK
// ============================================================================

const nodesByType = {
  doc: nodes.filter(n => n.type === "doc").length,
  code: nodes.filter(n => n.type === "code").length,
  config: nodes.filter(n => n.type === "config").length,
  fixture: nodes.filter(n => n.type === "fixture").length,
  spine: nodes.filter(n => n.type === "spine").length,
  directory: nodes.filter(n => n.type === "directory").length,
};

const edgesByType = {};
for (const edge of validEdges) {
  edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
}

const metadata = {
  schemaVersion: "lumaweave-self-graph/v1",
  generatedAt: new Date().toISOString(),
  generator: "generate-self-graph@v2",
  sourceCommit: getGitCommit(),
  sourceTree: "./",
  stats: {
    nodeCount: nodes.length,
    edgeCount: validEdges.length,
    nodesByType,
    edgesByType,
  },
};

// ============================================================================
// SECTION 5: OUTPUT FILES
// ============================================================================

// Main graph file
const graph = {
  schemaVersion: "lumaweave-self-graph/v1",
  metadata,
  nodes,
  edges: validEdges,
};

fs.writeFileSync(graphOutputFile, JSON.stringify(graph, null, 2));
console.log(`✅ Graph written: ${nodes.length} nodes, ${validEdges.length} edges → ${graphOutputFile}`);

// Manifest file
const manifest = {
  schemaVersion: "lumaweave-self-graph/v1",
  graphFile: "self-graph-generated.json",
  reportFile: "GRAPH_REPORT.md",
  generatedAt: metadata.generatedAt,
  sourceCommit: metadata.sourceCommit,
  health: {
    nodesWithoutCluster: health.nodesWithoutCluster,
    nodesWithoutStatus: health.nodesWithoutStatus,
    orphanedNodes: health.orphanedNodes,
    brokenReferences: health.brokenReferences.length,
  },
};

fs.writeFileSync(manifestOutputFile, JSON.stringify(manifest, null, 2));
console.log(`✅ Manifest written → ${manifestOutputFile}`);

// Report file
function generateReport() {
  const lines = [];
  
  lines.push("# Self-Graph Report");
  lines.push("");
  lines.push(`Generated: ${metadata.generatedAt}`);
  lines.push(metadata.sourceCommit ? `Source commit: ${metadata.sourceCommit}` : "Source commit: N/A");
  lines.push(`Schema: ${metadata.schemaVersion}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total nodes: ${metadata.stats.nodeCount}`);
  lines.push(`- Total edges: ${metadata.stats.edgeCount}`);
  lines.push("");
  lines.push("### Nodes by type");
  for (const [type, count] of Object.entries(metadata.stats.nodesByType)) {
    lines.push(`- ${type}: ${count}`);
  }
  lines.push("");
  lines.push("### Edges by type");
  for (const [type, count] of Object.entries(metadata.stats.edgesByType)) {
    lines.push(`- ${type}: ${count}`);
  }
  
  // Top 10 by in-degree
  const inDegree = new Map();
  for (const edge of validEdges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }
  const topInDegree = [...inDegree.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  lines.push("");
  lines.push("## Top 10 by in-degree");
  for (const [id, degree] of topInDegree) {
    const node = nodeMap.get(id);
    lines.push(`- ${id} (${node?.type || "?"}): ${degree}`);
  }
  
  // Top 10 by out-degree
  const outDegree = new Map();
  for (const edge of validEdges) {
    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
  }
  const topOutDegree = [...outDegree.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  lines.push("");
  lines.push("## Top 10 by out-degree");
  for (const [id, degree] of topOutDegree) {
    const node = nodeMap.get(id);
    lines.push(`- ${id} (${node?.type || "?"}): ${degree}`);
  }
  
  // Orphaned nodes
  const orphans = nodes.filter(n => !nodeDegree.has(n.id));
  lines.push("");
  lines.push(`## Orphaned nodes (degree = 0) [${orphans.length}]`);
  for (const node of orphans) {
    lines.push(`- ${node.id} (${node.type})`);
  }
  
  // Broken references
  lines.push("");
  lines.push(`## Broken references [${health.brokenReferences.length}]`);
  if (health.brokenReferences.length > 0) {
    lines.push("Frontmatter references targeting unknown ids:");
    for (const { source, target } of health.brokenReferences) {
      lines.push(`- ${source} references ${target} (not found)`);
    }
  } else {
    lines.push("None.");
  }
  
  // Cluster breakdown
  const clusterCounts = new Map();
  for (const node of nodes) {
    if (node.cluster) {
      clusterCounts.set(node.cluster, (clusterCounts.get(node.cluster) || 0) + 1);
    }
  }
  
  lines.push("");
  lines.push("## Cluster breakdown");
  lines.push("| Cluster | Node count |");
  lines.push("|---------|------------|");
  for (const [cluster, count] of [...clusterCounts.entries()].sort()) {
    lines.push(`| ${cluster} | ${count} |`);
  }
  
  return lines.join("\n");
}

fs.writeFileSync(reportOutputFile, generateReport());
console.log(`✅ Report written → ${reportOutputFile}`);
