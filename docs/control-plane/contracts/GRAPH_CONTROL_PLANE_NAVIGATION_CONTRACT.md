---
id: contract.graph.control.plane.navigation
title: Graph Control Plane Navigation Contract
type: contract
status: accepted
version: v68
domain: control-plane
subdomain: contracts
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - graph
  - control-plane
  - navigation
  - contract
  - accepted
  - v68
---

# Graph Control Plane Navigation Contract

**Status:** Accepted — v68

---

## Purpose

Define UX/navigation improvements for the Graph Visual Inventory and Command Deck without weakening evidence. The Graph Visual Inventory was becoming a scroll-wall. This contract defines an overview → drilldown navigation model that preserves all evidence content while making the control panel more navigable.

---

## Non-Goals (Evidence Must Be Preserved)

```
Do NOT remove any evidence content
Do NOT weaken historical contract tests
Do NOT add runtime behavior (graph/Sigma mutation, audio, animation)
Do NOT change read-only boundaries of existing registries
Do NOT break stable data-testid values without migration plan
```

---

## Overview → Drilldown Model

```
Overview Mode (Human Mode):
  Compact summary cards for each section
  High-level metadata only
  Quick navigation between sections
  Collapsible by default

Evidence Mode (Drilldown):
  Full evidence content
  Detailed metadata
  All current test data
  Expandable on demand
```

---

## Key Rules

- Summary cards may not hide evidence — they compress it
- Every section must be reachable from the overview
- All existing `data-testid` attributes preserved
- QA evidence must be accessible in Evidence Mode
- Human Mode and Evidence Mode defined by contract (v73a)

---

## Relationship to v69 and v73

v68 defines the navigation model. v69 (paused) attempted collapse of evidence sections — this conflicted with the non-goals above and was paused. v73a formally defines the Human/Evidence/Debug Mode system that provides the correct architecture for v68's intent.

v69r retry must use the additive overview grid approach (add summary layer on top) rather than collapsing existing evidence.
