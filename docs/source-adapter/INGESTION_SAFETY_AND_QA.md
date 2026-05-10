---
id: source.adapter.ingestion.safety.qa
title: Ingestion Safety and QA
type: policy
status: current
cluster: lime
domain: source-adapter
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - source.adapter.os.overview
  - source.adapter.os.contract
  - source.adapter.website.url.v0
  - accessibility.motion.safety.contract
tags: [source-adapter, ingestion, safety, qa, evidence, confidence, validation]
---

# Ingestion Safety and QA

## Summary

Source ingestion can become risky if adapters crawl too broadly, infer too aggressively, or mix observed evidence with AI guesses. LumaWeave should enforce safety limits, source evidence, and ingestion QA reports for every adapter.

## Universal Safety Rules

All adapters should be:

```txt
read-only by default
bounded by size/depth limits
evidence-preserving
confidence-labeled
validated before rendering
reported through Mission Control
```

## Website Safety Rules

```txt
respect robots.txt
same-domain by default
GET/HEAD only
no form submission
no auth/logout/payment paths
max depth
max pages
crawl delay
skip large/binary files
record redirects
```

## Local File Safety Rules

```txt
respect ignore files
skip binary files
max file size
no hidden/secrets by default
no writes
no destructive operations
source paths recorded
```

## AI Inference Safety Rules

```txt
AI cannot create observed edges
AI-inferred edges must be labeled
AI outputs require source excerpts when possible
confidence scores required
AI layer toggleable in renderer
```

## Confidence Separation

Graph filters should support:

```txt
Observed only
Observed + inferred
Observed + inferred + AI-inferred
```

Mission Control should report counts:

```txt
observed edges:
inferred edges:
ai-inferred edges:
```

## Ingestion QA Report Template

```md
# Ingestion QA Report

## Source

- Adapter:
- Input:
- Detected type:
- Detection confidence:

## Scope

- Max files:
- Max pages:
- Max depth:
- Extraction layers:
- Limits hit:

## Output

- Nodes:
- Edges:
- Observed edges:
- Inferred edges:
- AI-inferred edges:

## Evidence

- Edges with evidence:
- Edges missing evidence:
- Source URIs recorded:

## Warnings

- ...

## Errors

- ...

## Validation

- Node IDs unique:
- Edge IDs unique:
- Edge endpoints valid:
- Confidence labels valid:
- Evidence requirements satisfied:

## Decision

ACCEPT / ACCEPT WITH WARNINGS / INCOMPLETE / REJECT
```

## Adapter Validation Rules

A graph should be rejected or marked incomplete if:

```txt
edge endpoints do not exist
observed edges lack evidence
node ids collide
adapter id is missing
confidence labels are invalid
limits were exceeded without warning
AI-inferred edges are mislabeled
```

## Mission Control Integration

Future Mission Control should show:

```txt
Adapter used
Detection confidence
Ingestion plan
Node/edge counts
Confidence breakdown
Skipped sources
Warnings/errors
Validation decision
```

## Stop Conditions

Adapter should stop and report rather than continue if:

```txt
input type is uncertain
source exceeds configured limits
crawler hits forbidden paths
parser throws repeated errors
edge evidence cannot be produced
AI inference is requested before observed layer is stable
```