---
id: source.adapter.readme
title: LumaWeave Source Adapter Cluster
type: readme
status: current
cluster: lime
domain: source-adapter
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - source.adapter.os.overview
  - source.adapter.os.contract
  - source.adapter.normalized.source.graph.schema
  - source.adapter.translation.set.model
  - source.adapter.catalog
  - source.adapter.website.url.v0
  - source.adapter.ingestion.safety.qa
  - source.adapter.roadmap
tags: [source-adapter, readme, cluster-index]
---

# LumaWeave Source Adapter Cluster

This cluster captures the **Source Adapter OS** architecture for LumaWeave.

The goal is to let LumaWeave ingest many kinds of relationship-rich sources and normalize them into a common graph format while preserving source evidence, confidence level, safety limits, and adapter-specific QA reports.

## Cluster Contents

1. `SOURCE_ADAPTER_OS_OVERVIEW.md` — Core architecture and purpose.
2. `NORMALIZED_SOURCE_GRAPH_SCHEMA.md` — Common node/edge/evidence model.
3. `TRANSLATION_SET_MODEL.md` — How source-specific entities become LumaWeave nodes and edges.
4. `SOURCE_ADAPTER_CATALOG.md` — High-value adapters across industries.
5. `WEBSITE_URL_ADAPTER_V0.md` — Detailed plan for URL/site graph ingestion.
6. `INGESTION_SAFETY_AND_QA.md` — Safety rules, confidence, validation, and QA reports.
7. `SOURCE_ADAPTER_OS_CONTRACT.md` — v74a foundation contract for adapter lifecycle.
8. `SOURCE_ADAPTER_ROADMAP.md` — Phase sequence from v74a onward.

## Strategic Placement

This is **backlog architecture** for the post-v86 horizon. Implementation
sequence is governed by `SOURCE_ADAPTER_OS_CONTRACT.md` and the
acceptance gates per `SOURCE_ADAPTER_ROADMAP.md`.

Recommended timing:

```txt
After v86 sub-arc completes:
Source Adapter OS Foundation (v74a — accepted)
→ Base Registry + Validator (v74b)
→ Normalized Graph Schema implementation
→ Graphify/JSON Adapter (boring, safe first)
→ Markdown/Obsidian Adapter
→ Website URL Adapter v0
```

## Core Principle

Anything with entities and relationships can become a LumaWeave graph,
but every adapter must produce:

```txt
normalized nodes
normalized edges
source evidence
confidence class
adapter metadata
ingestion QA report
```

Observed relationships must stay distinct from inferred or AI-inferred
relationships.
```
