# Bandit Prompt — Source Adapter OS Backlog Architecture

Use this prompt when ready to capture Source Adapter OS inside the LumaWeave repo.

```md
# Source Adapter OS Backlog Architecture

Current state:
- Do not implement source ingestion yet.
- This is a docs/backlog architecture pass only.
- Current active work remains Theme Target / Inspector / Theme Mapping unless user explicitly reprioritizes.

## Mission

Capture the future Source Adapter OS architecture for LumaWeave.

Goal:
Define how LumaWeave can ingest many source types and normalize them into a common graph format with evidence, confidence, translation sets, safety limits, and ingestion QA reports.

## Do Not Implement

Do not add runtime ingestion.
Do not add website crawler.
Do not add network requests.
Do not add UI.
Do not change renderer.
Do not add AI extraction.
Do not modify current graph schema unless explicitly requested.
Do not create giant docs.

## Create Docs

Create:

```txt
docs/source-adapters/SOURCE_ADAPTER_OS.md
docs/source-adapters/NORMALIZED_SOURCE_GRAPH_SCHEMA.md
docs/source-adapters/TRANSLATION_SET_MODEL.md
docs/source-adapters/SOURCE_ADAPTER_CATALOG.md
docs/source-adapters/WEBSITE_URL_ADAPTER_V0.md
docs/source-adapters/INGESTION_SAFETY_AND_QA.md
docs/source-adapters/SOURCE_ADAPTER_ROADMAP.md
```

Update:

```txt
docs/DOCS_INDEX.md
```

## Required Concepts

Document:

- source detection
- adapter selection
- ingestion plan
- raw extraction
- translation sets
- normalized nodes/edges
- source evidence
- confidence: observed / inferred / ai-inferred
- ingestion QA report
- safety limits
- adapter roadmap

## Recommended Adapter Catalog

Include at least:

- codebase / Git
- website URL
- Markdown / Obsidian
- OpenAPI
- database schema
- package dependencies
- cloud infrastructure
- issue tracker
- PDF/document corpus
- game/worldbuilding
- cybersecurity
- legal/compliance

## Guardrails

- observed edges require evidence
- AI-inferred edges must be labeled
- website crawling must be bounded
- local file ingestion must be read-only
- adapters output normalized graph shape
- each adapter gets its own QA report

## Final Report

Return:

# Source Adapter OS Backlog Complete

## Acceptance Recommendation
ACCEPT / INCOMPLETE / DO NOT ACCEPT

## Created / Updated

## Core Architecture

## Adapter Catalog Summary

## Safety / QA Model

## Recommended Future Phases

## Validation

## Recommended Next qaKey
```
