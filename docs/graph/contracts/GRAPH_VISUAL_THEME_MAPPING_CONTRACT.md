---
id: contract.graph.visual.theme.mapping
title: Graph Visual Theme Mapping Contract
type: contract
status: accepted
version: v49
domain: graph
subdomain: contracts
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.first.runtime.mutation
governs:
  - src/graph/graphVisualThemeMappingRegistry.ts
tags:
  - graph
  - theme
  - mapping
  - contract
  - accepted
  - v49
---

# Graph Visual Theme Mapping Contract

**Status:** Accepted — v49

Defines the registry that maps graph visual elements to theme token paths. The mapping registry documents which theme tokens apply to which graph elements, establishing the data layer for future theme application without executing any Sigma mutation.

## Core Rules
- Mapping registry is static and read-only
- Each entry: `{ elementId, tokenPath, description, status }`
- Token paths reference canonical paths from `themeTokenPaths.ts`
- No Sigma mutation occurs in this pass — metadata only
- Registry used by `GraphVisualInventoryPanel.tsx` for evidence display

## Forbidden
- Applying token values to Sigma directly
- Writing CSS variables from mapping entries
- Mutating graph appearance without a token value application contract
