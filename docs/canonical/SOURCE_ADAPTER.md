---
id: domain.source.adapter
title: Source Adapter
cluster: lime
references:
  - system.doc.architecture
  - domain.graph.sigma.rendering
tags:
  - source-adapter
  - canonical
  - v100
status: canonical
include_in_self_graph: true
type: manual
agent_readable: true
last_updated: 2026-05-31
---

# LumaWeave — Source Adapter

How external data becomes a LumaWeave graph. A **source adapter** translates some source (a codebase, a docs vault, a website, an API spec) into the normalized node/edge shape the renderer consumes. Today one adapter is wired end to end (the self-graph fixture); the rest are a catalogued, validated-by-contract roadmap. This doc covers both, clearly separated.

**Supersedes:** `SOURCE_ADAPTER_README.md`, `SOURCE_ADAPTER_CATALOG.md`, `SOURCE_ADAPTER_OS_OVERVIEW.md`, `SOURCE_ADAPTER_OS_CONTRACT.md`, `SOURCE_ADAPTER_ROADMAP.md`, `NORMALIZED_SOURCE_GRAPH_SCHEMA.md`, `TRANSLATION_SET_MODEL.md`, `INGESTION_SAFETY_AND_QA.md`, `WEBSITE_URL_ADAPTER_V0.md`, `SELF_GRAPH_SCHEMA.md`

---

## §1 — What it is

A source adapter takes raw source data and produces normalized nodes and edges with a known shape, which the graph/Sigma layer then renders. The intended end state is an "adapter OS": many adapters (git, markdown vault, website, OpenAPI, database, etc.), each declaring its input patterns, the translation it performs, its safety limits, and the QA report it emits — all governed by a contract and an acceptance lifecycle.

**What actually ships today is one adapter:** the **self-graph**, which renders LumaWeave's own docs/code as a graph from a bundled fixture. Everything else in the registry is a *catalog entry* — a typed declaration of a planned adapter, not a working implementation.

**Mental model:** the registry is a menu of adapters and their declared contracts; the normalizer is the common output shape; an adapter's job is to get from "some source" to "normalized nodes/edges." Right now exactly one menu item is cooked.

---

## §2 — The parts & how they connect

```mermaid
flowchart TD
    subgraph SHIPPED["shipped path (self-graph)"]
        FX["self-graph fixture<br/>(LumaSourceGraph, v0/v1)"] --> AD["adaptSelfGraphToSigma()<br/>self-graph-adapter.ts"]
        AD --> DR["LumaWeaveNodeDraft / EdgeDraft"]
        DR --> RENDER["→ buildGraphologyGraph → Sigma"]
    end
    subgraph REG["catalog + governance"]
        SR["sourceAdapterRegistry.ts<br/>9 adapter entries, typed contracts"]
        VAL["validate-source-adapters.mjs"]
        SR --> VAL
    end
    subgraph BROKEN["live-fetch path (NOT working — see §3)"]
        HOOK["useGraphSourceSummary()"] --> LOAD["loadGraphifySource()<br/>fetch /examples/ai-lab/graphify-out/graph.json"]
        LOAD -.HTML 404.-> ERRSTATE["panel error state"]
    end
    style SHIPPED fill:#1a3025,stroke:#4a8
    style BROKEN fill:#3a1a1a,stroke:#a44
    style REG fill:#2a2440,stroke:#96c
```

**The registry** (`sourceAdapterRegistry.ts`) is a Tier-1 const-array of adapter entries. Each entry declares: `adapterId`, `adapterType`, `adapterVersion`, input patterns (url/path/manifest/schema), a translation set, safety limits, a QA report format, and a `status`. Helpers query by id/type/status/contract-version. It's a typed catalog — declaration, not execution.

**The normalized shape** is `LumaWeaveNodeDraft` / `LumaWeaveEdgeDraft` (in `graph/schema/graph.types`). Every adapter, shipped or future, must emit this. The self-graph adapter (`adaptSelfGraphToSigma`) maps the fixture's `LumaSourceGraph` (supporting both `v0` and `v1` schemas) into it: cluster→color, type→size, edge-type→color, weight→confidence band.

**The summary hook** (`useGraphSourceSummary`) is what `AppShell` calls to load a live source; it delegates to `loadGraphifySource`. (This is the broken path — §3.)

---

## §3 — How to work in it safely

### The shipped reality vs. the catalog

- **One adapter is `registered` and working: `self-graph`.** The other eight entries (git-codebase, website-url, markdown-vault, openapi-spec, database-schema, package-dependency, cloud-infrastructure, issue-tracker) are `candidate` — catalog declarations with no implementation. Do not assume a `candidate` adapter does anything; it's a contract waiting for code.
- **The graph you see by default comes from the self-graph fixture**, adapted by `adaptSelfGraphToSigma`, not from a live fetch.

### Known bug — the JSON-404 paperweight

`loadGraphifySource` fetches `/examples/ai-lab/graphify-out/graph.json` — a hardcoded path pointing at an **external project's** output (`/home/boop/Projects/ai-lab/graphify-out`) that the app does not serve. The fetch returns the SPA's HTML 404 page; `.json()` then throws, and the Graph Sources panel shows an error state. This is the visible JSON-404 paperweight. The self-graph still renders (different path, from the fixture), so the app works — but the live-source panel is broken until the loader points at a real served artifact (or is replaced by a proper adapter-driven load). Must be fixed before public launch; logged as a paperweight.

### Invariants

- **Every adapter emits the normalized draft shape.** Don't let an adapter leak its source-specific shape downstream; normalize at the adapter boundary.
- **Adapters declare safety limits and a QA report** in their registry entry — the governance model expects ingestion to be bounded and auditable, not unbounded.
- **The self-graph adapter handles both schema versions** (`v0` and `lumaweave-self-graph/v1`) — preserve that dual support, or migrate the fixture, but don't half-break one path.

### Frontend connection

- `AppShell` chooses between the fixture path and the live-summary path; the Graph Sources panel/tile (`SourceAdapterPanel.tsx`, `GraphSourcesTileContent.tsx`) surface source state.
- Normalized drafts flow into `buildGraphologyGraph` (see the Graph/Sigma/Rendering doc) — the adapter layer's output is that function's input.

---

## §4 — How to extend it

**Add an adapter (catalog entry):** add a typed entry to `sourceAdapterRegistry.ts` — id, type, version, input patterns, translation set, safety limits, QA report format, `status: "candidate"`. `validate-source-adapters.mjs` enforces the entry shape. This declares the adapter; it does not implement it.

**Implement an adapter:** write the translation (raw source → `LumaWeaveNodeDraft`/`EdgeDraft`), following the self-graph adapter as the reference implementation. Walk the status lifecycle as the implementation matures: `candidate → registered → validated → accepted → active`. Each step is a gate, not an informal label — promote only when the prior stage's evidence exists (validator passing, QA report emitting, etc.).

**Fix the live load path:** point `loadGraphifySource` at an artifact the app actually serves, or replace it with a registry-driven adapter load. Until then, treat the live-source panel as a known-broken surface.

## §5 — How it's designed to grow (the adapter OS vision)

This is where most of the design intent lives — the shipped slice is deliberately small.

- **Many sources, one shape.** The ambition is a library of adapters (codebase, markdown vault, website crawl, OpenAPI, DB schema, package deps, cloud infra, issue tracker) that all normalize to the same node/edge draft, so any source becomes a LumaWeave graph. The registry already enumerates these as candidates with their declared contracts.
- **Translation sets** describe how a source's native concepts map to nodes, edges, and clusters — the per-adapter heart, declared in the registry entry and (eventually) implemented per adapter.
- **Ingestion safety + QA as first-class.** Every adapter declares safety limits (size/count bounds) and a QA report format, so ingestion is bounded and auditable. Confidence typing (`observed` / `inferred` / `ai-inferred`) lets the graph distinguish hard structure from inferred relationships.
- **The acceptance lifecycle** (`candidate→registered→validated→accepted→active`) is the growth path each adapter walks — the same contract→registry→validator→evidence→promotion ladder used elsewhere in LumaWeave, applied to data sources.
- **Schema versioning** is already real: the self-graph fixture supports `v0` and `v1`, with `v1` carrying richer typing (edge weight, provenance, bidirectional, tags). New source schemas extend this rather than replacing it.

The git-codebase adapter is the most likely next implementation (it's the dogfooding use case — visualize the codebase you're working in), followed by markdown-vault (the Obsidian-style audience).

## §6 — Where it lives in code

Under `src/source-adapter/` and `src/graph/` unless noted.

- **Registry + governance:** `sourceAdapterRegistry.ts` (the 9-entry catalog + query helpers), `validate-source-adapters.mjs`
- **Shipped adapter:** `self-graph-adapter.ts` (`adaptSelfGraphToSigma`, v0/v1), fixture generated by `generate-self-graph.mjs` → `self-graph-generated.json` (+ `self-graph-manifest.json`)
- **Live load path (broken):** `loadGraphifySource.ts`, `useGraphSourceSummary.ts`
- **Normalizer + shape:** `normalizeGraphifyGraph.ts`, `graph/schema/graph.types.ts` (`LumaWeaveNodeDraft`/`EdgeDraft`, `GraphSourceSummary`)
- **Source types:** `source-adapter/types.ts` (`LumaSourceGraph`, v0/v1 node/edge types)
- **UI:** `SourceAdapterPanel.tsx`, `SourceAdapterTileContent.tsx`, `GraphSourcesTileContent.tsx`

---

## Self-Graph Schema Reference

Verbatim schema contract between `generate-self-graph.mjs` (producer) and `self-graph-adapter.ts` (consumer). Supersedes `docs/graph/contracts/SELF_GRAPH_SCHEMA.md` (archived v100.0.9b).

**Versioning policy:** breaking change = bump `schemaVersion`; additive optional fields = backward-compatible, no version bump.

### Top-level structure

```json
{
  "schemaVersion": "lumaweave-self-graph/v1",
  "metadata": { },
  "nodes": [ ],
  "edges": [ ]
}
```

### Metadata block

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

### Node shape

```typescript
type SelfGraphNodeBase = {
  id: string;                 // unique stable identifier
  type: NodeType;
  label: string;              // short display name (file basename)
  fullLabel: string;          // longer descriptive name (frontmatter title)
  path: string;               // repo-relative path
  cluster: string | null;     // 10-color taxonomy: azure | slate | gold | etc.
  status: string | null;      // current | accepted | complete | concept | archived
  tags: string[];
  size: number;               // line count
  lastModified: string;       // ISO 8601 date
  raw: {
    color?: string;           // explicit color override (hex)
    dimFactor?: number;       // 0..1, multiplier on default opacity
    icon?: string;            // future use
  };
};

type NodeType = "doc" | "code" | "config" | "fixture" | "spine" | "directory";
```

**Identity strategy:** `frontmatter.id` if present; fallback `slug(path)`. Code files always use `slug(path)`.

**Visual treatment by type:**
- Doc nodes: cluster-derived color (no `raw.color` override)
- Code nodes: `raw.color: "#5a6678"`, `raw.dimFactor: 0.55`
- Spine nodes: `raw.color: "#9ca3af"`, `raw.dimFactor: 0.8`
- These are generator recommendations; the render layer may override.

### Edge shape

```typescript
type SelfGraphEdge = {
  id: string;                 // "edge-{sourceId}-{targetId}-{type}"
  source: string;
  target: string;
  type: EdgeType;
  weight: number;             // 0..1
  bidirectional: boolean;     // default false
  provenance: {
    source: ProvenanceSource;
    detail?: string;
  };
  raw?: { label?: string; color?: string; };
};

type EdgeType =
  | "explicit-reference"      // frontmatter references:
  | "wiki-link"               // [[xxx]] in body
  | "markdown-link"           // [text](path.md)
  | "code-import"             // import X from "..."
  | "tag-overlap"             // shared tags (≥2 threshold)
  | "contains"                // folder → file
  | "governs"                 // contract/policy → subsystem
  | "describes";              // doc → code (heuristic)

type ProvenanceSource =
  | "frontmatter" | "body-parse" | "ast-parse" | "directory-walk"
  | "heuristic" | "directory-hierarchy" | "spine-to-top-directory"
  | "directory-leaf" | "spine-direct-leaf" | "spine-fallback";
```

### Edge weight defaults

| Type | Weight | Notes |
|------|--------|-------|
| `explicit-reference` | 1.0 | Highest signal |
| `code-import` | 0.85 | Architectural backbone |
| `wiki-link` | 0.7 | Author-curated |
| `markdown-link` | 0.65 | Author-curated |
| `governs` | 0.7 | Contract/policy relationship |
| `describes` | 0.6 | Heuristic |
| `contains` | 0.5 | Structural, low semantic value |
| `tag-overlap` | 0.0–0.6 | `min(0.6, sharedTagCount / 4)` |

### Tag-overlap policy

Two nodes share a `tag-overlap` edge if they share ≥2 tags and at least one is "narrow" (not a stopword).

**Stopword list (v1.1):** `["accessibility", "app", "assets", "audio", "code", "control-plane", "current", "doc", "docs", "fixtures", "graph", "registry", "renderers", "source-adapter", "src", "styles", "themes", "ui", "v86", "v87"]`

**Per-node cap:** 5 tag-overlap edges max per node (highest-weight kept).

### Manifest + report companions

Generator writes sibling `manifest.json` and `GRAPH_REPORT.md`. The manifest carries health stats (nodes without cluster, orphaned nodes, broken references). The report is human-readable; both are for inspection only, not runtime consumption.

### Backward compatibility (v0 → v1)

Existing `id`, `label`, `cluster`, `tags` fields preserved. New required fields added in v1: `type`, `path`, `status`, `lastModified`, `size`, `raw`. New edge types are additive. Generator writes v1 from scratch; no legacy migration needed.
