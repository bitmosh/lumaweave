---
id: contract.graph.theme.token.value.preview.standalone
title: Graph Theme Token Value Preview Contract
type: contract
status: accepted
version: v53
domain: graph
subdomain: contracts
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.visual.theme.mapping
tags:
  - graph
  - theme
  - token
  - preview
  - contract
  - accepted
  - v53
---

# Graph Theme Token Value Preview Contract

**Status:** Accepted — v53

Defines the readiness diagnostic layer — a passive preview surface showing which token paths have values in the active theme, which are missing, and which are planned. Provides evidence the token system is correctly wired before application is activated.

## Core Rules
- Preview is entirely read-only — no token values are applied to the graph
- Displays: token path, current resolved value, status (active/planned/missing)
- Rendered in `GraphVisualInventoryPanel.tsx` as evidence rows with `data-testid` attributes
- Does not write CSS variables or affect Sigma in any way
- Playwright proves preview rows render correctly and completely

## Forbidden
- Writing CSS variables from this preview
- Applying token values to any rendering surface
- Using preview as primary evidence that tokens are "working" — application contract required for that
