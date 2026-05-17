---
id: graph.self.schema.v1
title: Self-Graph Schema v1
type: contract
status: current
cluster: slate
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-11
last_pass: vP-Self-Graph-Regen
references:
  - graph.normalized.source.schema
  - graph.source.adapter.os.overview
  - registries.link.network.overview
tags: [graph, schema, self-graph, contract, v1]
---

# Self-Graph Schema v1

## Purpose

Defines the structure of LumaWeave's self-graph data file
(`src/fixtures/self-graph-generated.json`). The self-graph is
the dogfood instance of the platform visualizing its own
codebase. This document is the binding contract between the
generator (`scripts/generate-self-graph.mjs`) and the consumer
(`src/fixtures/self-graph-adapter.ts`).

Versioning policy: any breaking change to this schema requires
bumping `schemaVersion` and providing a migration. Additive
changes (new optional fields) are backward-compatible and do
not bump the version.

This schema is also the prototype for the broader source
adapter contract (`NORMALIZED_SOURCE_GRAPH_SCHEMA.md`).
Universal adapters in future arcs will produce output
conforming to a generalized version of this shape.

## Top-level structure

```json
{
  "schemaVersion": "lumaweave-self-graph/v1",
  "metadata": { ... },
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

## Metadata block

```typescript
type SelfGraphMetadata = {
  schemaVersion: "lumaweave-self-graph/v1";
  generatedAt: string;        // ISO 8601 timestamp
  generator: string;          // e.g., "generate-self-graph@v2"
  sourceCommit?: string;      // git SHA if available, omit if not
  sourceTree: string;         // root path the generator scanned, e.g., "./"
  stats: {
    nodeCount: number;
    edgeCount: number;
    nodesByType: {
      doc: number;
      code: number;
      config: number;
      fixture: number;
      spine: number;
      directory: number;
    };
    edgesByType: Record<EdgeType, number>;
  };
};
```

## Node shape

Every node, regardless of type, has these required fields:

```typescript
type SelfGraphNodeBase = {
  // Identity
  id: string;                 // unique stable identifier
  type: NodeType;             // "doc" | "code" | "config" | "fixture" | "spine"
  
  // Display
  label: string;              // short display name (e.g., file basename)
  fullLabel: string;          // longer descriptive name (e.g., frontmatter title)
  
  // Source location (for IDE-open later)
  path: string;               // repo-relative path
  
  // Classification (drives visual treatment)
  cluster: string | null;     // 10-color taxonomy: azure | slate | gold | etc.
  status: string | null;      // current | accepted | complete | concept | archived
  
  // Tags from frontmatter (or derived for code)
  tags: string[];
  
  // Computed measures
  size: number;               // line count for docs, file size in lines for code
  
  // Metadata
  lastModified: string;       // ISO 8601 date
  
  // Visual hints (downstream consumer reads these for rendering)
  raw: {
    color?: string;           // explicit color override (hex)
    dimFactor?: number;       // 0..1, multiplier on default opacity
    icon?: string;            // future use
  };
};

type NodeType = "doc" | "code" | "config" | "fixture" | "spine" | "directory";
```

### Identity strategy

- **Primary key:** `frontmatter.id` if present
- **Fallback:** `slug(path)` — kebab-cased path with extension removed
- **Code files:** `slug(path)` always (code files don't have frontmatter)

Examples:
- `docs/agent/protocols/BANDIT_PROTOCOL.md` with `id: agent.protocols.bandit` →
  node id `agent.protocols.bandit`
- `src/themes/themeTokens.ts` →
  node id `src.themes.theme-tokens`
- `src/graph/renderers/sigma2d/NodeSphereProgram.ts` →
  node id `src.graph.renderers.sigma2d.node-sphere-program`

### Node type semantics

- **`doc`** — Markdown documentation file in `docs/`
- **`code`** — TypeScript/JavaScript source file (`.ts`, `.tsx`, `.mjs`, `.js`) in `src/`
- **`config`** — Configuration files (`.json`, `.yaml`, `.toml`) at significant points (root `package.json`, `tsconfig.json`, etc.). Excludes auto-generated configs.
- **`fixture`** — Test data, sample inputs, generated outputs in `src/fixtures/`
- **`spine`** — Synthetic node representing a code subsystem (e.g., "graph", "themes", "control-plane"). Aggregates code files. Promoted from current 8-spine handling.
- **`directory`** — Synthetic node representing a directory in the file tree.
  Created by the generator for every unique directory path encountered when
  scanning docs/, src/, and tests/. Used by physics engines (gwells) to anchor
  files perpendicular to their parent spine. No frontmatter, no body — pure
  structural intermediary.

### Visual treatment by node type

Code nodes are **distinguishable but not prominent** at default zoom:

```typescript
// Recommended visual hints in generator output:
"raw": {
  "color": "#5a6678",     // cool gray
  "dimFactor": 0.55       // ~55% opacity by default
}
```

Doc nodes use cluster-derived colors (no `raw.color` override, downstream
resolves from cluster). Spine nodes get a distinctive treatment:

```typescript
// Spine nodes:
"raw": {
  "color": "#9ca3af",     // neutral spine gray
  "dimFactor": 0.8        // more visible than code, less than docs
}
```

These are *recommendations* the generator emits. The downstream rendering
layer is free to override for specific visual modes (e.g., "code emphasis"
toggle, future v86c+).

## Edge shape

```typescript
type SelfGraphEdge = {
  // Identity
  id: string;                 // unique edge id: "edge-{sourceId}-{targetId}-{type}"
  
  // Connection
  source: string;             // source node id
  target: string;             // target node id
  
  // Classification
  type: EdgeType;
  
  // Strength
  weight: number;             // 0..1, drives visual width + layout attraction
  
  // Direction (most edges are directional; some are inherently bidirectional)
  bidirectional: boolean;     // default false
  
  // Provenance (essential for debugging + future filtering UI)
  provenance: {
    source: ProvenanceSource;
    detail?: string;          // e.g., "shared tags: v86, registry"
  };
  
  // Display (optional)
  raw?: {
    label?: string;
    color?: string;
  };
};

type EdgeType =
  | "explicit-reference"      // from frontmatter `references:`
  | "wiki-link"               // from `[[xxx]]` in markdown body
  | "markdown-link"           // from `[text](path.md)`
  | "code-import"             // from `import X from "..."`
  | "tag-overlap"             // shared tags (≥2 tag threshold)
  | "contains"                // folder → file (parent → child)
  | "governs"                 // contract/policy → governed subsystem
  | "describes";              // doc → code (heuristic: doc mentions code path)

type ProvenanceSource =
  | "frontmatter"
  | "body-parse"
  | "ast-parse"
  | "directory-walk"
  | "heuristic";
```

### Edge type semantics + weight defaults

| Type | Weight default | Description |
|------|----------------|-------------|
| `explicit-reference` | 1.0 | Frontmatter `references:` field. Highest signal. |
| `code-import` | 0.85 | TypeScript/JS import statement. Architectural backbone. |
| `wiki-link` | 0.7 | `[[xxx]]` in markdown body. Author-curated. |
| `markdown-link` | 0.65 | `[text](path.md)` in markdown. Author-curated. |
| `contains` | 0.5 | Folder → file. Structural, low semantic value. |
| `describes` | 0.6 | Doc mentions code path in body. Heuristic. |
| `governs` | 0.7 | Contract/policy spine relationship. Existing behavior. |
| `tag-overlap` | 0.0-0.6 | Computed: `min(0.6, sharedTagCount / 4)` |

### Tag-overlap threshold

Two nodes share an implicit `tag-overlap` edge if **both** conditions:
- They share ≥2 tags
- At least one of the shared tags is "narrow" (not a stopword tag)

**Stopword list (v1.1):**
```
["accessibility", "app", "assets", "audio", "code",
 "control-plane", "current", "doc", "docs", "fixtures",
 "graph", "registry", "renderers", "source-adapter",
 "src", "styles", "themes", "ui", "v86", "v87"]
```

**Note:** Directory-derived tags (src, control-plane, graph, etc.) are added to nodes for filter UI purposes but do not represent semantic similarity. They are stopworded for tag-overlap edge generation to prevent directory siblings from being treated as semantically related.

**Per-node cap:** Each node may have at most 5 tag-overlap edges. When a node exceeds this cap, edges are kept in descending order by weight (highest-weight edges are prioritized). This prevents densely-tagged nodes from creating excessive tag-overlap noise.

Tag-overlap edges weighted at 0..0.6 max so they don't dominate the layout.

### Edge ID format

```
edge-{sourceId}-{targetId}-{type}
```

Examples:
- `edge-agent.protocols.bandit-agent.brain.bandit-current-title-explicit-reference`
- `edge-src.themes.theme-tokens-src.themes.token-primitives-code-import`

This is verbose but deterministic and self-documenting.

## Visual layer contracts

The schema produces *data*. Visual rendering reads:

| Field | Used by |
|-------|---------|
| `node.cluster` | `graphVisualThemeMappingRegistry` for color resolution |
| `node.raw.color` | Direct color override, bypasses cluster mapping |
| `node.raw.dimFactor` | Opacity multiplier in `graphStylePolicy` |
| `node.type` | Future filter UI ("show only docs", "show only code") |
| `node.status` | Future "show archived" toggle, health rollups |
| `node.tags` | Future tag filter UI |
| `edge.type` | Edge color/style mapping (`graphVisualThemeMappingRegistry`) |
| `edge.weight` | Layout attraction force, render thickness |

## Manifest companion

The generator writes a sibling file: `manifest.json`

```typescript
type SelfGraphManifest = {
  schemaVersion: "lumaweave-self-graph/v1";
  graphFile: string;          // "self-graph-generated.json"
  reportFile: string;         // "GRAPH_REPORT.md"
  generatedAt: string;
  sourceCommit?: string;
  health: {
    nodesWithoutCluster: number;
    nodesWithoutStatus: number;
    orphanedNodes: number;    // nodes with degree 0
    brokenReferences: number; // frontmatter refs to nonexistent ids
  };
};
```

## Report companion

The generator writes a sibling file: `GRAPH_REPORT.md`

Human-readable summary. Recommended sections:
- Header (generated at, source commit, schema version)
- Summary stats (totals, breakdowns by type/cluster)
- Top 10 nodes by in-degree
- Top 10 nodes by out-degree
- Orphans list (nodes with no edges)
- Broken reference list (frontmatter references that target missing IDs)
- Cluster health table

The report is for humans inspecting graph quality, not for runtime
consumption.

## Backward compatibility

v0 (current) → v1 (this spec):
- Existing `id`, `label`, `cluster`, `tags` fields preserved
- New required fields: `type`, `path`, `status`, `lastModified`, `size`, `raw`
- New optional fields: all metadata extensions
- Existing `contains` and `governs` edge types preserved (no removal)
- New edge types are additive

Migration: generator writes v1 from scratch. No legacy data to migrate.

## Validation

A consumer of this schema may validate via:
1. JSON schema check (future: `self-graph-schema.json`)
2. Runtime adapter type-check (`self-graph-adapter.ts`)
3. Manifest stats sanity (`nodeCount === nodes.length`)

The adapter MUST handle missing optional fields gracefully (default to
sensible values, do not throw).

## What's deferred to v2+

- **AST-based code parsing.** v1 uses regex for imports. v2 might use TypeScript Compiler API for type-aware edges.
- **Semantic embeddings.** v1 has no vector representation. v3 may add.
- **Block-level granularity.** v1 nodes are file-level. v3+ may add section/block nodes.
- **Git history overlay.** v1 has no temporal layer. v4 may add commit-derived edges.
- **External adapter normalization.** v1 is self-graph specific. v5 generalizes for arbitrary sources.

---

*This document is the contract. Generator and consumer both implement
against it. Disagreements between code and this document are resolved
by amending this document explicitly (with versioning) rather than by
silent drift.*
