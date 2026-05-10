---
id: link.network.layer.4
title: Layer 4 — Graph View Element Registry
type: registry
status: current
version: v86a
domain: registries
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/graph/graphViewElementRegistry.ts
references:
  - link.network.overview
  - link.network.layer.3
  - graph.view.element.registry.contract
tags:
  - link-network
  - layer-4
  - graph-elements
  - graph
  - registry
  - v86a
  - vP-Registry-Y
---

# Layer 4 — Graph View Element Registry

Layer 4 of the four-layer link network. A typed/static inventory of graph visual elements and their metadata. This registry describes existing graph elements and future/locked elements, but does not control Sigma rendering or mutate graph behavior. It is read-only and passive metadata for inspection and future tooling.

## Source of Truth

`src/graph/graphViewElementRegistry.ts`

## Schema

```typescript
interface GraphViewElement {
  id: string;                    // Dot-path identifier (e.g., "graph.frame")
  title: string;                 // Human-readable name
  description: string;           // Description of the element
  category: ElementCategory;     // frame | layer | overlay | control
  status: ElementStatus;         // active | future | locked
  evidenceKind: EvidenceKind;    // dom-wrapper | policy-only | future
  testSelector?: string;         // Playwright test selector if applicable
  sigmaBoundary: string;         // Explanation of Sigma boundary
  policyNote: string;           // Policy note about element behavior
}

type ElementCategory = "frame" | "layer" | "overlay" | "control";
type ElementStatus = "active" | "future" | "locked";
type EvidenceKind = "dom-wrapper" | "policy-only" | "future";
```

## Entry Table

| ID | Title | Category | Status | Evidence Kind |
|----|-------|----------|--------|---------------|
| graph.frame | Graph Frame | frame | active | dom-wrapper |
| graph.surface | Graph Surface | frame | active | dom-wrapper |
| graph.nodes | Node Layer | layer | active | dom-wrapper |
| graph.edges | Edge Layer | layer | active | dom-wrapper |
| graph.labels | Label Layer | layer | active | dom-wrapper |
| graph.overlay | Overlay Layer | overlay | active | dom-wrapper |
| graph.hud | Graph HUD | overlay | future | future |
| graph.controls | Graph Controls | control | active | dom-wrapper |
| graph.physics | Graph Physics | control | active | dom-wrapper |
| graph.minimap | Graph Minimap | overlay | locked | future |

## Categories

- **frame:** Container and canvas wrapper elements (2 entries)
- **layer:** Rendering layers for nodes, edges, labels (3 entries)
- **overlay:** Visual overlays for selection, hover, HUD, minimap (3 entries)
- **control:** UI controls for physics and graph manipulation (2 entries)

## Status Values

- **active:** Element exists in current codebase and is observable
- **future:** Element is planned but not yet implemented
- **locked:** Element is planned but implementation is deferred to later phase

## Evidence Kinds

- **dom-wrapper:** Element is a DOM wrapper around Sigma internals (observable via Playwright)
- **policy-only:** Element is policy metadata only (no DOM evidence)
- **future:** Element is not yet implemented (no evidence exists)

## Cross-Reference Pattern

Layer 4 elements serve as the foreign key for Layer 3 mappings. Each Layer 3 mapping's `graphElementId` references a Layer 4 element's `id`.

**Example:**
- Layer 4: `id: "graph.nodes"` (graph element)
- Layer 3: `graphElementId: "graph.nodes"` → `canonicalTokenPath: "graph.node.fill"` (theme token mapping)

## Test Selectors

Elements with `testSelector` fields have Playwright test coverage. Test selectors are comma-separated strings identifying specific UI elements for automated testing.

**Examples:**
- `graph.frame` → `canvas`
- `graph.controls` → `setting-physics-nodeSize, setting-physics-linkDistance, setting-physics-repelForce`

## Sigma Boundary

This registry explicitly does not control Sigma internals. All entries include a `sigmaBoundary` field explaining the boundary:

- **Frame/Surface:** Canvas is a DOM wrapper around Sigma; registry does not control Sigma internals
- **Layers:** Node/edge/label layers are Sigma-managed; registry does not control Sigma rendering
- **Overlays:** Overlay layer is Sigma-managed; HUD and minimap would be separate DOM surfaces
- **Controls:** Controls are DOM-level UI that update props; registry does not control Sigma physics engine

## Coverage Note

This registry currently contains 10 elements covering v50 graph elements. v86b overlay components (SolarBackdrop, ClickHalo, GlitterField, FloatingBookmark, BookmarkLayer, Minimap, CameraHUD) are not yet represented in Layer 4. See B.2 (LAYER_4_OVERLAY_ELEMENT_GAP.md) for detailed gap analysis.

## Boundary Notes

This registry is read-only and passive metadata. It does not:
- Control Sigma or graph rendering
- Mutate graph behavior
- Apply styles or change node/edge visual properties
- Inspect canvas pixel states

The registry describes existing and future graph elements for inspection and future tooling. Runtime graph rendering is controlled by Sigma and visual policy modules.
