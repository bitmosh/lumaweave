---
id: link.network.layer.4.gaps
title: Layer 4 Overlay Element Gap
type: gap-analysis
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
  - link.network.layer.4
  - graph.view.element.registry.contract
tags:
  - link-network
  - layer-4
  - gap-analysis
  - overlays
  - v86a
  - vP-Registry-Y
---

# Layer 4 Overlay Element Gap

Gap analysis identifying v86b overlay components that exist in the codebase but are not represented in Layer 4 (graphViewElementRegistry.ts). These components are implemented but not cataloged in the graph visual element inventory.

## Coverage Summary

- **Layer 4 elements:** 10
- **Missing overlay elements:** 7
- **Coverage rate:** Overlay elements incomplete

## Missing Overlay Elements (7)

The following v86b overlay components exist as files in the codebase but do not appear in `graphViewElementRegistry.ts`:

| Component | File Path | Purpose | Why Missing |
|-----------|-----------|---------|------------|
| SolarBackdrop | `src/graph/overlay/SolarBackdrop.tsx` | Solar plasma backdrop effect | v86b visual treatment, not yet added to Layer 4 |
| ClickHalo | `src/graph/overlay/ClickHalo.tsx` | Click interaction halo effect | v86b visual treatment, not yet added to Layer 4 |
| GlitterField | `src/graph/overlay/GlitterField.tsx` | Glitter particle field effect | v86b visual treatment, not yet added to Layer 4 |
| FloatingBookmark | `src/graph/overlay/FloatingBookmark.tsx` | Floating bookmark UI component | v86b visual treatment, not yet added to Layer 4 |
| BookmarkLayer | `src/graph/overlay/BookmarkLayer.tsx` | Bookmark layer for graph | v86b visual treatment, not yet added to Layer 4 |
| CameraHUD | `src/graph/overlay/CameraHUD.tsx` | Camera heads-up display | v86b visual treatment, not yet added to Layer 4 |
| Minimap | `src/graph/overlay/Minimap.tsx` | Graph minimap overview | v86b visual treatment, not yet added to Layer 4 |

Note: Minimap is listed as `graph.minimap` in Layer 4 with status `locked`, but the implementation file exists. The registry entry is marked as `locked` (deferred to later phase) while the component file is already present.

## Current Layer 4 Overlay Elements

Layer 4 currently contains only 3 overlay-related elements:

| ID | Title | Status |
|----|-------|--------|
| graph.overlay | Overlay Layer | active |
| graph.hud | Graph HUD | future |
| graph.minimap | Graph Minimap | locked |

## Gap Categories

### v86b Visual Treatment Components (6)
- SolarBackdrop, ClickHalo, GlitterField, FloatingBookmark, BookmarkLayer, CameraHUD

These are v86b deliverables that were implemented but not cataloged in Layer 4. They are part of the visual treatment sub-arc.

### Deferred Component (1)
- Minimap (implementation exists, registry entry marked as `locked`)

The registry entry exists but is marked as `locked` status, indicating the component was intentionally deferred to a later phase despite having an implementation file.

## Recommendations

This gap analysis surfaces the missing Layer 4 entries without proposing fixes. The gaps fall into two categories:

1. **v86b components not cataloged:** SolarBackdrop, ClickHalo, GlitterField, FloatingBookmark, BookmarkLayer, CameraHUD should be added to Layer 4 with appropriate metadata (category: overlay, status: active)
2. **Deferred component status:** Minimap exists in Layer 4 as `locked` but implementation file exists; consider whether status should be updated to `active` or kept as `locked` pending v94

Resolution of these gaps should wait until v86b visual treatment is fully accepted and Layer 4 cataloging is updated to match implementation.
