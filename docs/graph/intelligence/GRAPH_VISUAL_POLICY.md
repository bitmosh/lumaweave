---
id: policy.graph.visual
title: Graph Visual Policy
type: policy
status: accepted
version: v73c
domain: graph
subdomain: intelligence
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - contract.graph.runtime.boundary
  - contract.graph.view.element.registry
governs:
  - src/graph/visual/graphStylePolicy.ts
  - src/graph/visual/graphLabelPolicy.ts
  - src/graph/visual/graphVisualTokens.ts
tags:
  - graph
  - visual
  - policy
  - nodes
  - edges
  - labels
  - accepted
---

# Graph Visual Policy

**Status:** Accepted — current policy for all graph visual decisions

---

## Purpose

Govern all decisions about how graph nodes, edges, labels, and overlays are visually rendered. Ensures that visual changes follow the token system and do not bypass the contracted theme application ladder.

---

## Node Visual Rules

```
Node shape:     Sigma default (circle) until custom renderer contracted
Node size:      Derived from node weight attribute (if present), else uniform
Node color:     From active theme preset via token path graph.node.fill
                Falls back to Sigma default if token not resolved
Node label:     Truncated at 32 chars by labelPolicy.ts
                Visibility: show on hover or when zoom > threshold
Border:         Not implemented — requires explicit contract
Glow/halo:      Not implemented — requires Motion Safety gate + contract
```

---

## Edge Visual Rules

```
Edge style:     Sigma default (straight line)
Edge color:     From active theme preset via token path graph.edge.color
                Falls back to Sigma default if token not resolved
Edge width:     Uniform (1px) unless weight attribute present
Edge label:     Hidden by default — future contract required
Curved edges:   Not contracted — Sigma straight only for now
```

---

## Label Policy

```
Governed by: src/graph/visual/graphLabelPolicy.ts
Truncation:  32 characters max + ellipsis
Rendering:   Sigma canvas label layer
Font:        Sigma default
Visibility:  Zoom-gated (hide below threshold to prevent clutter)
Color:       From theme token graph.label.color if resolved
```

---

## Forbidden Without Contract

```
Custom WebGL node renderer
Custom node shapes (hexagon, sphere simulation)
Animated node effects (glow, pulse, shimmer)
Per-node color overrides from source data (requires source adapter contract)
Edge curvature or tapered edges
Node clustering visual (aggregate nodes)
Canvas post-processing (bloom, fog, depth)
Audio-reactive node/edge styling
Direct Sigma.setSetting() calls for visual properties
  (EXCEPTION: v59 contract authorizes setSetting for defaultNodeColor,
   defaultEdgeColor, labelColor, edgeLabelColor on theme change)
```

---

## Accepted Token Paths for Graph Visuals

```
graph.node.fill           → node background color
graph.node.hoverFill      → node color on hover
graph.node.selectedFill   → node color when selected
graph.edge.color          → edge stroke color
graph.edge.hoverColor     → edge color on hover
graph.label.color         → node label color
graph.background          → graph canvas background
```

See `docs/theme/THEME_TOKEN_PATH_MAP.md` for full canonical token list.

---

## Promotion Path for Custom Visuals

```
1. Write visual contract (docs-only, define allowed behavior)
2. Register new token paths if needed (token promotion pass)
3. Implement custom renderer or style (with Playwright evidence)
4. Prove: no Sigma boundary violations, no forbidden effects
5. Accept
```

Do not implement custom node shapes, glow effects, or audio-reactive styling without going through this promotion path.
