---
id: handleset.future.visual.taxonomy
title: Future Visual Handles Taxonomy
type: manual
status: concept
version: v73c
domain: handleset
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - handleset
  - visual
  - handles
  - taxonomy
  - future
  - concept
  - VGE
references:
  - vge.grammar.handle.and.lens
---

# Future Visual Handles Taxonomy

**Status:** Future concept — no implementation authorized without explicit contracts

This taxonomy describes the full universe of grammar handles that LumaWeave may eventually support. These overlap with the VGE Grammar Handle system in `docs/visual-grammar-engine/VGE_GRAMMAR_HANDLE_AND_LENS.md`.

---

## 1. Node Visual Handles

```
graph.node.fill              Base node color
graph.node.hoverFill         Hover state color
graph.node.selectedFill      Selected state color
graph.node.size              Node radius multiplier
graph.node.glow              Glow effect (requires Motion Safety gate)
graph.node.halo              Halo ring (requires Motion Safety gate)
graph.node.border            Node border/stroke
graph.node.borderWidth       Border width
graph.node.shape             Node shape (circle | hexagon | diamond — future)
graph.node.opacity           Overall opacity
graph.node.label.color       Label color
graph.node.label.size        Label font size
graph.node.label.visibility  always | hover | zoom-gated
```

---

## 2. Edge Visual Handles

```
graph.edge.color             Edge stroke color
graph.edge.hoverColor        Hover state color
graph.edge.selectedColor     Selected state color
graph.edge.width             Edge stroke width
graph.edge.opacity           Overall opacity
graph.edge.style             solid | dashed | dotted (future)
graph.edge.curvature         Straight | curved (future)
graph.edge.brightness        Reactive brightness (audio-reactive)
graph.edge.trace             Animated trace effect (gated — Motion Safety)
graph.edge.label.visibility  hidden | hover | always
```

---

## 3. Cluster / Neighborhood Handles

```
graph.cluster.*.fill         Cluster background fill (future)
graph.cluster.*.aura         Cluster aura/glow radius
graph.cluster.*.gravity      Cluster gravity strength
graph.cluster.*.boundary     Cluster boundary line
graph.cluster.*.label        Cluster label rendering
```

---

## 4. Physics Handles

```
physics.helix.rotationSpeed  Helix backbone rotation rate
physics.helix.scale          Overall helix size
physics.helix.pitch          Vertical spacing between turns
physics.constellation.drift  Idle drift speed
physics.galaxy.orbitSpeed    Orbital velocity multiplier
physics.galaxy.gravityPulse  Gravity well pulse strength
physics.global.centerGravity Center-of-mass pull
physics.global.nodeRepel     Inter-node repulsion strength
```

---

## 5. Environment / Atmosphere Handles (3D/VR)

```
environment.fog.density      Atmospheric fog depth
environment.ambient.intensity Ambient light level
environment.bloom.strength   Post-processing bloom (gated)
environment.background.color Sky/background color
environment.particle.density Particle system density
```

---

## 6. UI Shell Handles

```
ui.tile.*.glow               Tile border glow on events
ui.statusBar.pulse           Status bar pulse on events
ui.nodeInspector.highlight   Inspector panel accent pulse
ui.topBar.accent             Top bar accent color
```

---

## Implementation Rules

1. Each handle must be registered in `motionSafetyRegistry.ts` before any visual effect ships
2. Handles with `glow`, `pulse`, `trace`, `aura` require Motion Safety classification
3. Handle paths are stable — once assigned, do not rename without a migration pass
4. The Grammar Lens overlay exposes handles via `data-lw-handle="[handle.path]"` attributes
5. Audio reactivity subscriptions reference handle paths, not layer-specific properties

See `docs/audio/UNIVERSAL_AUDIO_HANDLE_ROUTING.md` for audio subscription model.
See `docs/visual-grammar-engine/VGE_GRAMMAR_HANDLE_AND_LENS.md` for the VGE grammar handle contract.
