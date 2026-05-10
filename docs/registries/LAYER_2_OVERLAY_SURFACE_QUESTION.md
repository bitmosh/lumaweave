---
id: link.network.layer.2.overlay.question
title: Layer 2 Overlay Surface Question
type: decision-point
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - src/control-plane/contracts/controlSurfaceContract.registry.ts
references:
  - link.network.overview
  - link.network.layer.2
  - link.network.layer.4
tags:
  - link-network
  - layer-2
  - decision-point
  - overlays
  - v86a
  - vP-Registry-Y
---

# Layer 2 Overlay Surface Question

Decision point for how v86b overlay components should be represented in Layer 2 (control surface contracts). The current surface enum does not include an "overlay" category, but v86b introduces 7 overlay components that need governance classification.

## Current Surface Enum

Layer 2 contracts currently use a 4-value surface enum:

```typescript
type SurfaceType = "topbar" | "graph" | "missionControl" | "settings";
```

## v86b Overlay Components

The following 7 overlay components were implemented in v86b but do not fit the current surface enum:

| Component | File Path | Primary Location |
|-----------|-----------|------------------|
| SolarBackdrop | `src/graph/overlay/SolarBackdrop.tsx` | Graph viewport backdrop |
| ClickHalo | `src/graph/overlay/ClickHalo.tsx` | Graph viewport overlay |
| GlitterField | `src/graph/overlay/GlitterField.tsx` | Graph viewport overlay |
| FloatingBookmark | `src/graph/overlay/FloatingBookmark.tsx` | Graph viewport overlay |
| BookmarkLayer | `src/graph/overlay/BookmarkLayer.tsx` | Graph viewport overlay |
| CameraHUD | `src/graph/overlay/CameraHUD.tsx` | Graph viewport overlay |
| Minimap | `src/graph/overlay/Minimap.tsx` | Graph viewport overlay |

All 7 components render within the graph viewport but are not graph rendering primitives (nodes/edges/labels). They are visual effects and UI overlays that sit on top of the graph surface.

## Decision Options

### Option A — Extend enum to include "overlay" as a fifth surface

Add `"overlay"` to the surface enum:

```typescript
type SurfaceType = "topbar" | "graph" | "missionControl" | "settings" | "overlay";
```

**Implications:**
- Overlays become a first-class surface category in Layer 2
- Overlay components get explicit contract entries with `surface: "overlay"`
- Consistent with the four-layer architecture (overlays are a distinct visual layer)
- Requires enum extension and contract updates for all 7 components
- Future overlay components (v86b+, v94 minimap) would use the same surface

**Trade-offs:**
- Clean separation of overlay concerns
- Adds a fifth surface category, increasing enum complexity
- May be over-engineering if overlays remain non-user-controllable

### Option B — Accept overlays as non-user-controllable (no Layer 2 contract)

Do not add Layer 2 contracts for overlay components. Treat them as internal rendering effects that are not part of the user-facing control surface.

**Implications:**
- Overlays remain outside the link network governance chain
- No Layer 2 contracts needed for overlay components
- Simpler governance model (fewer contracts)
- Overlays cannot be inspected via the radial inspector "what controls affect this visual element"
- Overlay settings (if any) would need separate governance

**Trade-offs:**
- Reduces link network coverage (overlays excluded from traversal)
- Overlays become "second-class" visual elements
- May be acceptable if overlays are purely decorative or automatically controlled

### Option C — Distribute overlays across existing surfaces by primary location

Assign overlay components to existing surfaces based on their primary location or owner. Most overlays would likely map to `"graph"` surface since they render in the graph viewport.

**Implications:**
- No enum extension needed
- Overlays get Layer 2 contracts with `surface: "graph"`
- Overlays are included in link network governance
- All graph viewport elements (graph primitives + overlays) share the same surface

**Trade-offs:**
- Loses semantic distinction between graph primitives and overlays
- `"graph"` surface becomes overloaded (nodes/edges + visual effects)
- May make it harder to distinguish "core graph" from "graph overlays" in inspection

## Recommendation

This gap analysis surfaces the decision point without recommending one option. The choice depends on:

1. **Whether overlays should be user-controllable:** If overlays will have user-facing controls, they need Layer 2 contracts (favors Option A or C)
2. **Whether overlay governance matters:** If the radial inspector should traverse overlay elements, they need contracts (favors Option A or C)
3. **Enum complexity tolerance:** If adding a fifth surface is acceptable, Option A provides cleanest separation
4. **Future overlay roadmap:** If more overlays are planned (v86b+, v94), Option A scales better

## Decision Required

Operator + Claude should decide which option to pursue before v86b visual treatment is accepted. The decision should be documented in the Phase Y completion report, and the chosen approach should be implemented in Layer 2 contracts accordingly.
