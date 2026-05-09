---
id: contract.graph.theme.application
title: Graph Theme Application Contract
type: contract
status: accepted
version: v55
domain: graph
subdomain: contracts
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.visual.theme.mapping
governs:
  - src/graph/graphVisualThemeMappingRegistry.ts
  - src/themes/applyTheme.ts
tags:
  - graph
  - theme
  - application
  - contract
  - accepted
  - v55
---

# Graph Theme Application Contract

**Status:** Accepted — v55

Defines how theme presets are applied to graph visual elements via a DOM-wrapper layer. Theme application operates at the DOM/CSS level above Sigma — it does not call Sigma APIs directly. This is the contracted boundary for LumaWeave's current theme → graph system.

## Core Rules
- Theme application via CSS variables on DOM wrapper elements (not Sigma API)
- Token paths from `themeTokenPaths.ts` are the canonical source
- `applyTheme.ts` applies token values to DOM elements
- Sigma picks up styles via CSS cascade where it reads DOM-level colors
- No direct `sigma.setSetting()` or Sigma API calls in this pass

## Promotion Path
```
v49  Theme Mapping Registry (metadata only)
  ↓
v51  Graph Theme Runtime Application Contract
  ↓
v53  Graph Theme Token Value Preview Contract
  ↓
v55  Graph Theme Application Contract (this — DOM wrapper)
  ↓
v57  Graph Theme Token Value Application Contract
  ↓
v58  Graph Theme Token Value Preview Contract (readiness diagnostic)
```

## Forbidden
- Direct Sigma API calls for styling
- Bypassing token path registry for color values
- Applying arbitrary CSS to Sigma canvas
