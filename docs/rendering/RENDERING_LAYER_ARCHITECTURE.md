---
id: architecture.rendering.layers
title: Rendering Layer Architecture
type: contract
status: accepted
version: v73c
domain: rendering
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.graph.runtime.boundary
  - contract.graph.theme.application
related:
  - contract.cross.layer.override.cache
  - contract.sigma.2d.layer
  - concept.hyper.3d.layer
  - policy.grammar.lens.current.state
tags: [rendering, layers, 2d, 3d, flat, architecture, sigma, cross-layer]
---

# Rendering Layer Architecture

## Purpose

LumaWeave supports multiple rendering layers. Each layer presents
the same underlying graph data through a different visual and
interaction paradigm. This document defines the layer model,
layer switching behavior, and the rules governing how theme and
grammar handle changes propagate across layers.

---

## The Three Rendering Layers

### Layer 1 — Sigma 2D (Current Active Layer)

The current production rendering layer.

```
Technology:  Sigma (WebGL 2D graph renderer) + Graphology data model
Status:      Active / Accepted
Contract:    docs/rendering/SIGMA_2D_LAYER_CONTRACT.md
```

Properties:
- Force-directed layout with configurable physics
- Node and edge rendering via Sigma WebGL pipeline
- Label rendering via Sigma canvas layer
- Physics dialects (Helix, Constellation, Galaxy) run here
- Audio reactivity connects to Sigma physics parameters via Signal Loom
- Theme tokens applied via DOM-wrapper layer (v56 accepted)
- Direct Sigma API calls forbidden without explicit contract

### Layer 2 — Hyper 3D (Future / Docs-Only)

A future immersive 3D rendering layer.

```
Technology:  Three.js or equivalent WebGL 3D engine (TBD)
Status:      Concept / Docs-Only
Contract:    docs/rendering/HYPER_3D_LAYER_CONCEPT.md
```

Properties (planned):
- Full 3D spatial graph layout with depth and perspective
- Panorama Atlas immersive view mode lives here
- Node shapes become 3D objects (spheres, hexagons, custom mesh)
- Edge rendering as 3D connectors (ropes, vines, energy beams)
- Physics dialects adapted for 3D space
- VR compatibility layer sits above this layer
- No implementation without explicit contract

### Layer 3 — Flat / Minimal (Future)

A lightweight rendering layer without Sigma dependency.

```
Technology:  Pure DOM / SVG / Canvas 2D (TBD)
Status:      Concept / Docs-Only
```

Properties (planned):
- No Sigma WebGL dependency — maximum compatibility
- Clean, information-dense, documentation-reader aesthetic
- Best for low-power devices or accessibility-first contexts
- All elements are DOM — simplest Grammar Lens behavior
- No implementation without explicit contract

---

## Layer Switching Model

Only one rendering layer is active at a time. The active layer
receives all live renders, physics updates, audio reactivity
outputs, and Grammar Lens edits.

Layer switching is a user action, not an automatic event.

```
User selects layer via Atlas lens layer selector
  → current layer suspends (state preserved)
  → pending override cache flushes to new layer
    → token path validation
    → handle resolver for target layer
    → Motion Safety gate
    → apply or soften/block
  → new layer activates
  → graph re-renders in new layer context
```

Layer state (camera position, zoom, selected nodes, physics
configuration) is preserved per-layer and restored on switch.

---

## Cross-Layer Theme and Handle Consistency

Themes preserve identity across rendering layers via **canonical
token paths**. The token path is the bridge.

```
Token path: graph.node.fill = #4fa3e0

2D Sigma layer:    Sigma node fill color = #4fa3e0
3D layer:          Node mesh material base color = #4fa3e0
Flat layer:        SVG circle fill = #4fa3e0
```

The rendering layer's **handle resolver** translates the canonical
token value into the layer-appropriate visual property. The token
path itself never changes. The interpretation changes per layer.

This means:
- Selecting a theme preset updates all layers simultaneously
- Grammar Lens edits in one layer generate pending cache entries
  for inactive layers (see CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md)
- Physics dialect physics parameters are layer-specific but audio
  routing is layer-agnostic (same signal channels, layer-specific targets)

---

## Handle Resolution Per Layer

Each layer has its own **handle resolver** — a function that maps
a canonical grammar handle + token value to a layer-specific
visual property.

```
Handle: graph.node.fill
Value:  #4fa3e0

2D resolver:  → sigma.setNodeAttribute(id, 'color', '#4fa3e0')
3D resolver:  → mesh.material.color.set('#4fa3e0')
Flat resolver: → svgElement.setAttribute('fill', '#4fa3e0')
```

Handle resolvers are layer-internal. They do not cross layer
boundaries. The Grammar Lens calls the active layer's resolver
only. Inactive layers receive token path + value via the pending
override cache, then run their own resolver on layer switch.

---

## Audio Reactivity Across Layers

Audio signal channels (rms, bass, mid, treble, beat, tempo) from
the Signal Loom are layer-agnostic. Any handle in any layer can
subscribe to any signal channel.

The subscription is to the **handle path**, not to a
layer-specific property. On layer switch, the active layer's
subscriptions activate and the previous layer's subscriptions
suspend.

```
Audio subscription: graph.node.glow subscribes to bass channel

2D active:   Sigma node glow effect responds to bass
             (glow = DOM overlay, not Sigma canvas)
3D active:   Node mesh emission intensity responds to bass
Flat active: SVG node stroke-width responds to bass

All pass through Motion Safety gate regardless of layer.
```

---

## Physics Dialect Portability

Physics dialects (Helix, Constellation, Galaxy) define force
layout parameters that are native to the 2D Sigma layer.

For future 3D layer compatibility:
- Each dialect should define 3D equivalents of its parameters
- The helix in 3D becomes a true 3D double helix, not a flat spiral
- Galaxy orbital mechanics translate naturally to 3D space
- Constellation star-field layout extends to full 3D sphere

The physics dialect system should be designed for portability from
the start. Layer-specific parameters are prefixed:
```
helix.2d.rotationSpeed
helix.3d.helixPitch
helix.flat.spreadAngle
```

---

## Forbidden Boundaries

**All layers:**
- No direct Sigma API access from non-2D layers
- No cross-layer CSS variable writes
- No layer switching that bypasses the pending override cache flush
- No Motion Safety gate bypass on layer switch

**2D layer:**
- No Sigma node/edge/canvas mutation without explicit contract
- No camera manipulation without explicit contract

**3D layer (future):**
- No implementation without HYPER_3D_LAYER_CONCEPT.md being
  promoted to a full contract via explicit user authorization

**VR layer (future):**
- No implementation without VR_COMPATIBILITY_CONCEPT.md being
  promoted to a full contract via explicit user authorization

---

## Relationship to Existing Contracts

| System | Existing Contract | Status |
|--------|------------------|--------|
| Sigma 2D Boundary | GRAPH_RUNTIME_BOUNDARY_CONTRACT.md (v45) | Accepted |
| DOM Wrapper Theme | GRAPH_THEME_APPLICATION_CONTRACT.md (v55) | Accepted |
| Readiness Diagnostic | GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md (v57) | Accepted |
| Cross-Layer Cache | CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md | New — needed |
| 3D Layer | HYPER_3D_LAYER_CONCEPT.md | New — concept |
