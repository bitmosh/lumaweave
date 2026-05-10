---
id: link.network.layer.3
title: Layer 3 — Graph Visual Theme Mapping Registry
type: registry
status: current
version: v86a
domain: registries
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/graph/graphVisualThemeMappingRegistry.ts
references:
  - link.network.overview
  - link.network.layer.2
  - link.network.layer.4
  - graph.visual.theme.mapping.contract
  - theme.token.path.map
tags:
  - link-network
  - layer-3
  - theme-mapping
  - graph
  - registry
  - v86a
  - vP-Registry-Y
---

# Layer 3 — Graph Visual Theme Mapping Registry

Layer 3 of the four-layer link network. Maps graph visual elements to their canonical theme token paths. This registry defines the governance relationship between graph rendering elements and the theme tokens they should consume. It is metadata only and does not apply styles to Sigma or mutate graph renderer behavior.

## Source of Truth

`src/graph/graphVisualThemeMappingRegistry.ts`

## Schema

```typescript
interface GraphVisualThemeMapping {
  graphElementId: string;           // Layer 4 element ID (e.g., "graph.frame")
  visualRole: string;               // Description of the visual role
  canonicalTokenPath: string;      // Canonical theme token path (e.g., "panel.border")
  tokenSource: string;             // Documentation source for token path
  status: "active" | "planned" | "deferred";
  boundaryNote: string;            // Explanation of governance-only nature
}
```

## Entry Table

| Graph Element ID | Visual Role | Canonical Token Path | Status | Token Source |
|------------------|-------------|----------------------|--------|-------------|
| graph.frame | Container frame/border for graph viewport | panel.border | active | THEME_TOKEN_PATH_MAP.md |
| graph.frame | Container background for graph viewport | panel.background | active | THEME_TOKEN_PATH_MAP.md |
| graph.surface | Graph background surface | app.background | active | THEME_TOKEN_PATH_MAP.md |
| graph.nodes | Node fill color | graph.node.fill | active | THEME_TOKEN_PATH_MAP.md |
| graph.nodes | Node border color | graph.node.border | active | THEME_TOKEN_PATH_MAP.md |
| graph.nodes | Node label color | graph.node.label.color | active | THEME_TOKEN_PATH_MAP.md |
| graph.edges | Edge color | graph.edge.color | active | THEME_TOKEN_PATH_MAP.md |
| graph.edges | Edge label color | graph.edge.label.color | active | THEME_TOKEN_PATH_MAP.md |
| graph.labels | Label font size | graph.label.fontSize | active | THEME_TOKEN_PATH_MAP.md |
| graph.labels | Label font family | graph.label.fontFamily | active | THEME_TOKEN_PATH_MAP.md |
| graph.overlay | Overlay background | graph.overlay.background | active | THEME_TOKEN_PATH_MAP.md |
| graph.overlay | Overlay border | graph.overlay.border | active | THEME_TOKEN_PATH_MAP.md |
| graph.highlight | Highlight color | graph.highlight.color | active | THEME_TOKEN_PATH_MAP.md |
| graph.selection | Selection color | graph.selection.color | active | THEME_TOKEN_PATH_MAP.md |

## Graph Element Categories

- **graph.frame:** Graph container and canvas wrapper
- **graph.surface:** Visible graph rendering surface
- **graph.nodes:** Node layer (fill, border, labels)
- **graph.edges:** Edge layer (color, labels)
- **graph.labels:** Label layer (font size, family)
- **graph.overlay:** Overlay components (background, border)
- **graph.highlight:** Highlight states
- **graph.selection:** Selection states

## Cross-Reference Pattern

Layer 3 mappings connect Layer 4 graph elements to theme token paths. Each mapping's `graphElementId` references a Layer 4 element's `id`, and `canonicalTokenPath` references a token from the theme system.

**Example:**
- Layer 4: `id: "graph.nodes"` (graph element)
- Layer 3: `graphElementId: "graph.nodes"` → `canonicalTokenPath: "graph.node.fill"` (theme token)

## Token Source

All current mappings reference `THEME_TOKEN_PATH_MAP.md` as the documentation source for canonical token paths. This file defines the stable token path namespace that theme implementations must follow.

## Status Values

- **active:** Mapping is defined and represents current governance intent
- **planned:** Mapping is documented but not yet implemented in runtime
- **deferred:** Mapping is intentionally deferred to later phase

## Coverage Note

This registry currently contains 14 mappings covering v50 graph elements. v86a added 24 canonical tokens (40 total) but Layer 3 has not been updated to include the new token mappings. See B.1 (LAYER_3_TOKEN_COVERAGE_GAP.md) for detailed gap analysis.

## Boundary Notes

This registry is governance metadata only. It does not:
- Apply styles to Sigma canvas
- Mutate graph renderer behavior
- Change node/edge visual properties at runtime
- Control Sigma internals

The registry describes intended relationships for inspection and future tooling. Runtime theme application occurs in separate visual policy modules.
