---
id: source.adapter.os.overview
title: Source Adapter OS Overview
type: concept
status: current
cluster: lime
domain: source-adapter
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - source.adapter.os.contract
  - source.adapter.os.normalized.source.graph.schema
  - source.adapter.translation.set.model
  - source.adapter.catalog
  - source.adapter.website.url.v0
  - source.adapter.ingestion.safety.qa
  - source.adapter.roadmap
tags: [source-adapter, overview, ingestion, normalization, evidence, confidence]
---

# Source Adapter OS Overview

## Summary

The **Source Adapter OS** is a future ingestion and conversion layer for LumaWeave. It allows different source types—codebases, websites, Markdown vaults, API specs, databases, cloud infrastructure, issue trackers, document corpora, and more—to be translated into a shared LumaWeave graph format.

This would evolve LumaWeave from a code architecture viewer into a general relationship cartography platform.

## Core Pipeline

```txt
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

## Why This Matters

Different industries produce different relationship-rich artifacts:

- websites have pages, links, topics, and assets
- codebases have files, symbols, imports, tests, and ownership
- databases have tables, columns, keys, indexes, and lineage
- cloud infrastructure has services, networks, secrets, roles, and dependencies
- legal corpora have clauses, obligations, references, and risks
- research corpora have papers, citations, claims, methods, and entities

The Source Adapter OS lets all of these become inspectable, visual, explorable graphs.

## Key Design Rule

Do **not** build one giant universal parser.

Build small adapters that all output the same normalized graph model.

Each adapter should define:

```txt
accepted input types
detection rules
source-specific extraction logic
translation set
safety limits
validation rules
QA report format
```

## Adapter Responsibilities

Each adapter answers:

```txt
What are the nodes?
What are the edges?
What is the evidence for each edge?
Is each edge observed, inferred, or AI-inferred?
What limits were applied?
What was skipped?
What warnings should Mission Control surface?
```

## Confidence Layers

LumaWeave should preserve confidence classes:

```txt
observed      = directly present in source
inferred      = deterministic/local inference from observed facts
ai-inferred   = model-generated or semantic inference
```

Examples:

```txt
Observed: Page A links to Page B.
Observed: File A imports File B.
Observed: Table orders has a foreign key to customers.

Inferred: Pages A and B share repeated keywords.
Inferred: Files A and B often change together.

AI-inferred: A model says Page A and Page B cover the same concept.
```

Observed facts must never be mixed with AI inference without labels.

## Source Detection

The ingestion system should classify input before extraction.

Example detection rules:

```txt
https://...                         → website adapter
folder with package.json            → codebase/package adapter
folder with .obsidian or many .md    → Markdown/Obsidian adapter
openapi.yaml / swagger.json          → OpenAPI adapter
schema.sql / prisma.schema           → database adapter
docker-compose.yml / *.tf / k8s yaml → cloud infra adapter
package-lock.json / Cargo.lock       → package dependency adapter
```

Detection should produce:

```ts
type SourceDetectionResult = {
  adapterId: string;
  confidence: number;
  reason: string;
};
```

## Ingestion Plans

Before ingestion, each adapter should produce an ingestion plan.

```ts
type IngestionPlan = {
  adapterId: string;
  inputSummary: string;
  detectedType: string;
  estimatedScope: {
    maxFiles?: number;
    maxPages?: number;
    maxDepth?: number;
  };
  extractionLayers: Array<"observed" | "inferred" | "ai-inferred">;
  risks: string[];
  limits: Record<string, unknown>;
};
```

Mission Control can later display this plan before running large or risky ingestion.

## Non-Goals For Initial Work

Do not implement all adapters at once.
Do not add AI inference before observed extraction is trustworthy.
Do not allow website crawlers to run unbounded.
Do not mutate source systems.
Do not generate arbitrary runtime code.
Do not mix source evidence with hallucinated relationships.

## First Safe Implementation Path

Recommended first implementation sequence:

```txt
Source Adapter OS Backlog Architecture
→ Normalized Source Graph Schema
→ Local JSON / Graphify Adapter
→ Markdown/Obsidian Adapter
→ Website URL Adapter v0
```

The first adapter should be boring and safe. The second or third can be magical.