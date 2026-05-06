---
id: system.source.adapter.os
title: Source Adapter OS Overview
type: manual
status: accepted
version: v73c
domain: source-adapter
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
related:
  - schema.source.graph.normalized
  - model.translation.set
  - catalog.source.adapters
tags: [source-adapter, OS, overview, ingestion, pipeline, accepted]
---

# Source Adapter OS Overview

**Status:** Docs-only architecture. No runtime ingestion implemented.
**Next implementation pass:** v74a (Foundation Contract) → v74b (Base Registry + Validator)

---

## Summary

The Source Adapter OS is a future ingestion and conversion layer for LumaWeave. It allows different source types — codebases, websites, Markdown vaults, API specs, databases, cloud infrastructure, issue trackers, document corpora — to be translated into a shared LumaWeave graph format.

This evolves LumaWeave from a code architecture viewer into a general relationship cartography platform.

---

## Core Pipeline

```
Input
→ Source detection
→ Adapter selection
→ Ingestion plan
→ Raw extraction
→ Translation set
→ Evidence model
→ Normalized graph
→ Validation / QA report
→ LumaWeave renderer
```

---

## Why This Matters

Different data shapes become different graph types:
```
codebases          → files, symbols, imports, tests, ownership
websites           → pages, links, topics, assets
databases          → tables, columns, keys, indexes, lineage
cloud infra        → services, networks, secrets, roles, dependencies
legal corpora      → clauses, obligations, references, risks
research corpora   → papers, citations, claims, methods, entities
```

All of these can become inspectable, visual, explorable graphs.

---

## Key Design Rule

Do NOT build one giant universal parser. Build small adapters that all output the same normalized graph model.

Each adapter defines:
```
accepted input types
detection rules
source-specific extraction logic
translation set
safety limits
validation rules
QA report format
```

---

## Adapter Responsibilities

Each adapter answers:
```
What are the nodes?
What are the edges?
What is the evidence for each edge?
Is each edge observed, inferred, or AI-inferred?
What limits were applied?
What was skipped?
What warnings should Mission Control surface?
```

---

## Confidence Layers

```
observed      directly present in source
              → Page A links to Page B. File A imports File B.

inferred      deterministic/local inference from observed facts
              → Pages share repeated keywords. Files often change together.

ai-inferred   model-generated or semantic inference
              → A model says two pages cover the same concept.
```

Observed facts must never be mixed with AI inference without visible labels.

---

## Safety Requirements

```
Local-first operation — no unapproved network transmission
No secret/token leakage
User-controlled workspace scope
No parent-directory wandering
No auto-execution of project commands
Audit logs for all source ingestion
Read-only source access
```

---

## Source Detection

The ingestion system classifies input before extraction:
```
file extension      → code, markdown, JSON, YAML, CSV
URL pattern         → website, API endpoint, documentation
manifest presence   → package.json, Cargo.toml, pyproject.toml
directory structure → monorepo, flat, docs-only
schema file         → OpenAPI, GraphQL, database schema
```

---

## Relationship to Self-Graph Fixture

The self-graph fixture (v75a) is the first real use of Source Adapter OS patterns — LumaWeave ingesting its own docs structure via YAML frontmatter to build the graph. This is the simplest possible adapter and the best first test.

The self-graph fixture validates the normalized schema before any external adapters are built.
