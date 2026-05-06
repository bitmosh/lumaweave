---
id: contract.graph.view.element.registry
title: Graph View Element Registry Contract
type: contract
status: accepted
version: v40
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/graph/graphViewElementRegistry.ts
  - src/control-plane/graph/GraphVisualInventoryPanel.tsx
tags: [graph, view, element, registry, contract, accepted, v40]
---

# Graph View Element Registry Contract

**Status:** Accepted — v40

Defines the canonical registry of graph view elements (nodes, edges, labels, overlays) that LumaWeave owns and can safely describe. The registry is read-only and passive — it documents the graph's visual elements without mutating Sigma.

## Core Rules
- Registry entries are static TypeScript objects — no runtime mutation
- Each entry documents: id, label, category, status, evidence path
- Registry does not drive Sigma directly — it is a metadata layer
- `GraphVisualInventoryPanel.tsx` reads from this registry for the evidence display
- All entries have `data-testid` attributes for Playwright coverage

## Forbidden
- Mutating Sigma from registry entries
- Adding controls that change graph behavior
- Storing runtime state in the registry
