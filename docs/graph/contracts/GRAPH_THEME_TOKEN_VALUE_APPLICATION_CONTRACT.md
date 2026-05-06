---
id: contract.graph.theme.token.value.application.standalone
title: Graph Theme Token Value Application Contract
type: contract
status: accepted
version: v57
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.graph.theme.application
governs:
  - src/themes/themeTokenPaths.ts
  - src/themes/applyTheme.ts
tags: [graph, theme, token, value, application, contract, accepted, v57]
---

# Graph Theme Token Value Application Contract

**Status:** Accepted — v57

See `GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md` — this contract is part of the v51–v58 theme application ladder. Defines the governance for applying actual token values (colors, sizes, opacities) from theme presets to graph visual elements via the canonical token path registry.

## Core Rules
- Token values resolved from active theme preset via `themeTokenPaths.ts`
- Values validated against canonical token type before application
- Applied to DOM via CSS custom properties
- Invalid token paths rejected — do not silently fail
- Playwright proves token values change when preset changes

## Forbidden
- Applying unvalidated token values to any surface
- Promoting planned token paths without an explicit pass
- Raw CSS string injection outside the token system
- Writing token values directly to Sigma
