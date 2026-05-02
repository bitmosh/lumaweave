# Source Adapter OS Phase Roadmap and Backlog

## Summary

This document places Source Adapter OS into future LumaWeave phases without interrupting the current Theme Target / Inspector / Theme Mapping track.

## Current Track Context

Current/forthcoming theme-system sequence:

```txt
v19 — Theme Token Path Map
v20 — Theme Target Registry + Read-Only Inspector Overlay
v20a/v21 — Inspector Overlay Hardening
v22 — Theme Mapping Panel v0
v23 — Theme Override Storage + Save Preset
```

Source Adapter OS should begin after the current inspector/theme mapping foundation is stable, unless explicitly prioritized earlier.

## Proposed Source Adapter Phases

### v24 — Source Adapter OS Backlog Architecture

Docs-only or low-risk architecture pass.

Deliver:

```txt
Source Adapter OS overview
Normalized Source Graph Schema
Translation Set model
Adapter catalog
Safety / QA expectations
```

### v25 — Normalized Source Graph Schema v0

Implementation foundation.

Deliver:

```txt
source graph types
node/edge/evidence types
confidence labels
validation helpers
ingestion QA report shape
```

### v26 — Local JSON / Graphify Adapter v0

Safe first adapter.

Deliver:

```txt
read local graph JSON
normalize to LumaGraphNode/LumaGraphEdge
validate graph
produce ingestion report
render through existing graph viewer
```

### v27 — Markdown / Obsidian Adapter v0

Local-first knowledge graph adapter.

Deliver:

```txt
read markdown files
extract wikilinks/markdown links/headings/tags
produce observed note graph
respect ignore/size limits
```

### v28 — Website URL Adapter v0

First wow-factor adapter.

Deliver:

```txt
single URL input
same-domain page/link extraction
depth 0–1
observed-only link graph
bounded crawl policy
Mission Control ingestion report
```

### v29 — Website Crawl + Sitemap

Expanded web graph capability.

Deliver:

```txt
sitemap.xml support
depth 2 crawl
canonical URL handling
heading/topic extraction without AI
SEO/info architecture view
```

### v30 — AI-Assisted Topic Extraction

Optional semantic layer.

Deliver:

```txt
AI-inferred topic nodes
semantic similarity edges
confidence labels
source excerpts
filter toggles for inferred/AI layers
```

## Backlog Items

Recommended backlog candidates:

```txt
1. Source Adapter OS architecture
2. Normalized Source Graph Schema
3. Local Graphify/JSON Adapter
4. Markdown/Obsidian Adapter
5. Website URL Adapter v0
6. Website sitemap/depth crawler
7. OpenAPI Adapter
8. Database Schema Adapter
9. Package Dependency Adapter
10. Ingestion QA Report UI
```

## Strategic Guardrail

Do not implement many adapters at once.

Each adapter should be its own vertical slice:

```txt
detection
→ extraction
→ translation
→ normalized graph
→ validation report
→ renderer proof
```

## First Large Implementation Recommendation

When ready, the first implementation should be:

```txt
Normalized Source Graph Schema + Local JSON/Graphify Adapter
```

This is lower risk than web crawling and proves the adapter OS shape.

The first impressive external adapter should be:

```txt
Website URL Adapter v0
```

But only after schema and validation exist.
