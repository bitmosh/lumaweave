---
id: contract.graph.first.runtime.mutation
title: First Graph Runtime Mutation Contract
type: contract
status: accepted
version: v47
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.graph.runtime.boundary
tags: [graph, runtime, mutation, contract, accepted, v47]
---

# First Graph Runtime Mutation Contract

**Status:** Accepted — v47
**Type:** Docs-only governance defining the first promoted mutation category

---

## Purpose

Define the first permitted runtime graph mutation category: **Graph Evidence Detail Mode** — a non-persistent UI mode that switches displayed evidence text between Summary and Detailed views. Affects only DOM-visible text in the control-plane graph evidence UI. Does not affect Sigma renderer, graph data, physics, camera, filters, or layout.

---

## Allowed in v48

```
Local React state: useState<"summary" | "detailed">
Visible label/status change between Summary/Detailed modes
Expanded metadata text in detailed mode
Active controls that visibly change displayed evidence
DOM-level text visibility changes only
```

Implementation location: `src/control-plane/graph/GraphVisualInventoryPanel.tsx`

---

## Forbidden in v48 and Beyond (Requires New Contract)

```
Sigma instance access or API calls
Renderer settings changes
Graph physics parameter changes
Graph data model mutation
Node/edge style changes
Camera/filter behavior changes
Storage/persistence
Hotkey/listener addition
Command execution
Dead/no-op controls
```

---

## Promotion Path

```
v47  This contract (docs-only)
  ↓
v48  Graph Evidence Detail Mode (local state only)
  ↓
v49+ Theme Mapping ladder (requires new contract per step)
```
