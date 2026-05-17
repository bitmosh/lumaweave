#!/usr/bin/env node
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
  "docs/known-bugs/*": "violet",
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

  if (!cluster) health.nodesWithoutCluster++;
}

// --- CONFIG ---

for (const configName of CONFIG_FILES) {
  const filePath = path.join(repoRoot, configName);
  if (!fs.existsSync(filePath)) continue;

  const relPath = path.relative(repoRoot, filePath).replace(/\\/g, "/");
  const id = slug(filePath);
  const stat = fs.statSync(filePath);

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
}

// Build node map for edge resolution
for (const node of nodes) {
  nodeMap.set(node.id, node);
}

// ============================================================================
// SECTION: SYNTHESIZE DIRECTORY SPINE NODES
// Mirror the full directory hierarchy as spine-type nodes so the renderer
// has a structural backbone to lay out against.
// ============================================================================

// Top-level subsystems that should have spine nodes (not every directory)
const TOP_LEVEL_SUBSYSTEMS = [
  { path: "src/graph", spineId: "spine.graph" },
  { path: "src/themes", spineId: "spine.themes" },
  { path: "src/audio", spineId: "spine.audio" },
  { path: "src/accessibility", spineId: "spine.accessibility" },
  { path: "src/source-adapter", spineId: "spine.source-adapter" },
  { path: "src/control-plane", spineId: "spine.control-plane" },
  { path: "src/physics", spineId: "spine.physics" },
  { path: "docs/graph", spineId: "spine.docs-graph" },
  { path: "docs/control-plane", spineId: "spine.docs-control-plane" },
  { path: "docs/agent", spineId: "spine.docs-agent" },
  { path: "docs/physics", spineId: "spine.docs-physics" },
];

// Materialize spine nodes for top-level subsystems
for (const { path: dirPath, spineId } of TOP_LEVEL_SUBSYSTEMS) {
  // Skip if a node with this id already exists
  if (nodeMap.has(spineId)) continue;

  // Get directory mtime for lastModified
  let mtime;
  try {
    mtime = fs.statSync(path.join(repoRoot, dirPath)).mtime.toISOString();
  } catch {
    mtime = new Date().toISOString();
  }

  const dirNode = {
    id: spineId,
    type: "spine",
    label: path.basename(dirPath),
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

console.log(`✅ Synthesized ${TOP_LEVEL_SUBSYSTEMS.length} spine nodes`);

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
// SECTION 2.1: CONTAINS EDGES (flattened directory parenting)
// ============================================================================
// Every leaf node (doc/code/config/fixture) becomes a direct contains-child
// of its IMMEDIATE directory parent in the synthesized set.
//
// Every directory node becomes a direct contains-child of its CLOSEST SPINE
// ANCESTOR — not the next directory up. This flattens the directory hierarchy
// so the gwells seeder's 2-level model (spine → directory → files) handles
// every node.
//
// Spines remain the roots. Many directories attach directly to each spine.
// File ancestry through directories is preserved in node IDs/labels for
// future visualization enhancements (e.g., recursive seeder).

// Extract spine nodes for path matching
const SPINE_NODES = nodes.filter(n => n.type === "spine");

function findClosestSpineForPath(nodePath) {
  // Match the node's path against each spine's path. Return the spine with
  // the LONGEST matching prefix. Returns null if no spine owns this path.
  let bestSpine = null;
  let bestPrefixLen = 0;
  
  for (const spine of SPINE_NODES) {
    const spinePath = spine.path; // e.g., "src/graph"
    
    // Direct match or prefix match
    if (nodePath === spinePath || nodePath.startsWith(spinePath + "/")) {
      if (spinePath.length > bestPrefixLen) {
        bestSpine = spine;
        bestPrefixLen = spinePath.length;
      }
    }
    
    // Also check if the node is under the same top-level directory as the spine
    // e.g., "docs/_archive" should match "docs/graph" (both under "docs/")
    const spineTopLevel = spinePath.split("/")[0]; // "docs" or "src"
    const nodeTopLevel = nodePath.split("/")[0];
    
    if (spineTopLevel === nodeTopLevel && spineTopLevel) {
      // This node is under the same top-level directory as the spine
      // Use this as a fallback if no direct prefix match was found
      if (!bestSpine || (spinePath.length > bestPrefixLen && nodePath.startsWith(spineTopLevel + "/"))) {
        // Only use this if it's a better match than current best
        // and the node is actually under this top-level directory
        if (!bestSpine || spinePath.length > bestPrefixLen) {
          bestSpine = spine;
          bestPrefixLen = spinePath.length;
        }
      }
    }
  }
  
  return bestSpine;
}

// Pass 1: contains edges from spine → directory (every directory)
for (const node of nodes) {
  if (node.type !== "directory") continue;
  
  const owningSpine = findClosestSpineForPath(node.path);
  if (owningSpine) {
    addEdge(
      owningSpine.id,
      node.id,
      "contains",
      0.5,
      false,
      { source: "spine-flatten", detail: "directory→spine" }
    );
  }
}

// Pass 2: contains edges from directory → leaf (every doc/code/config/fixture)
for (const node of nodes) {
  if (
    node.type !== "doc" &&
    node.type !== "code" &&
    node.type !== "config" &&
    node.type !== "fixture"
  ) continue;
  
  // Find the immediate parent directory node (closest in path)
  const dirPath = path.dirname(node.path);
  const parentId = slug(dirPath);
  
  if (nodeMap.has(parentId)) {
    addEdge(
      parentId,
      node.id,
      "contains",
      0.5,
      false,
      { source: "directory-leaf", detail: "leaf→immediate-directory" }
    );
  } else {
    // Fallback: if the immediate directory wasn't synthesized (e.g., file is
    // at the root of a spine's directory tree), attach directly to the spine.
    const owningSpine = findClosestSpineForPath(node.path);
    if (owningSpine) {
      addEdge(
        owningSpine.id,
        node.id,
        "contains",
        0.5,
        false,
        { source: "spine-direct", detail: "leaf with no synthesized directory parent" }
      );
    }
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
