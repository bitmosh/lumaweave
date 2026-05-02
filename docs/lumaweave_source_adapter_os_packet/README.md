# LumaWeave Source Adapter OS Packet

This packet captures the future **Source Adapter OS** architecture for LumaWeave.

The goal is to let LumaWeave ingest many kinds of relationship-rich sources and normalize them into a common graph format while preserving source evidence, confidence level, safety limits, and adapter-specific QA reports.

## Packet Contents

1. `01_SOURCE_ADAPTER_OS_OVERVIEW.md` — Core architecture and purpose.
2. `02_NORMALIZED_SOURCE_GRAPH_SCHEMA.md` — Common node/edge/evidence model.
3. `03_TRANSLATION_SET_MODEL.md` — How source-specific entities become LumaWeave nodes and edges.
4. `04_SOURCE_ADAPTER_CATALOG.md` — High-value adapters across industries.
5. `05_WEBSITE_URL_ADAPTER_V0.md` — Detailed plan for URL/site graph ingestion.
6. `06_INGESTION_SAFETY_AND_QA.md` — Safety rules, confidence, validation, and QA reports.
7. `07_PHASE_ROADMAP_AND_BACKLOG.md` — Suggested phase sequence and backlog placement.
8. `08_BANDIT_PROMPT_SOURCE_ADAPTER_BACKLOG.md` — Copy/paste prompt for a docs-only backlog pass.

## Strategic Placement

This should remain **backlog architecture** for now. It should not interrupt the current Theme Target Registry / Inspector Overlay lane.

Recommended timing:

```txt
After theme/inspector foundation stabilizes:
Source Adapter OS Backlog Architecture
→ Normalized Source Graph Schema
→ Graphify/JSON Adapter
→ Markdown/Obsidian Adapter
→ Website URL Adapter v0
```

## Core Principle

Anything with entities and relationships can become a LumaWeave graph, but every adapter must produce:

```txt
normalized nodes
normalized edges
source evidence
confidence class
adapter metadata
ingestion QA report
```

Observed relationships must stay distinct from inferred or AI-inferred relationships.
