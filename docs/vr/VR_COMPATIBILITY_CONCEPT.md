---
id: vr.compatibility.concept
title: VR Compatibility Concept
type: concept
status: concept
cluster: indigo
domain: vr
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - platform.vision
  - layout.lens.navigation
  - rendering.layer.architecture
  - vr.agent.familiar.system
tags: [vr, compatibility, panorama-atlas, walk-around, immersive, future, concept]
---

# VR Compatibility Concept

## Vision

LumaWeave's graph is not just viewed — it is inhabited. In VR
mode, the user walks inside their architecture. Nodes become
spatial objects you can approach and examine. Edges are visible
connections in 3D space. The physics dialect determines the
shape of the world around you.

This is not a feature. It is the logical endpoint of everything
LumaWeave is building toward — the most immersive possible
relationship between a developer and their system's architecture.

**Status: Future concept. No implementation without explicit
architectural design, performance analysis, and user authorization.**

---

## VR as a Rendering Layer

VR mode sits above the 3D rendering layer in the layer hierarchy:

```
Flat / Minimal (2D DOM, no Sigma)
    ↑
Sigma 2D (current active — WebGL 2D)
    ↑
Hyper 3D (future — Three.js 3D graph)
    ↑
VR Walk-Around (future — WebXR / native VR atop 3D layer)
```

The VR layer is not a separate application. It is a mode of
the 3D rendering layer where the camera becomes first-person
and the interaction model changes from mouse/keyboard to
VR controllers or hand tracking.

---

## The Walk-Around Experience

In VR, the Atlas lens becomes a physical space:

```
User stands at the center of their graph world
  → Nodes float around them as 3D objects
  → Helix physics: the helix stretches above and below
  → Galaxy physics: solar system clusters at varying distances
  → Constellation physics: stars spread across the void

Movement:
  → Physical movement (room-scale VR)
  → Teleport to a node (point and select)
  → Grab and reposition nodes (direct manipulation)
  → Zoom out to see the whole graph from above
  → Zoom in to see node details up close

Interaction:
  → Approach a node → details materialize around it
  → Pinch an edge → trace its path through the graph
  → Voice command → "take me to the authentication system"
  → Hand gesture → expand a cluster, collapse a branch
```

---

## Lens Spaces in VR

Each lens becomes a distinct physical space the user moves between:

```
Overview  → Entrance hall / lobby
            System health displayed as wall-mounted readouts
            Portal doorways to other spaces

Atlas     → The graph world itself
            Walk among the nodes
            Physics dialect shapes the environment

Evidence  → Library / archive
            Contracts appear as glowing manuscripts
            Test files as evidence dossiers on shelves

Signal    → Control room / signal studio
            Signal Loom routing as physical patch cables
            Audio waveforms visible in 3D space

Workshop  → Atelier / creative studio
            Theme tools on workbenches
            Artwork samples on display walls
            Familiar agents work alongside you here

Mission   → Command center / bridge
            Agent familiars gather here to report
            QA checklist as a physical briefing board
            History slider as a physical timeline on the floor
```

Moving between VR spaces = switching lenses. Each space is
spatially distinct but shares the same underlying data.

---

## Physics Dialects in VR

Each physics dialect creates a different VR world:

**Helix:** The double helix spirals through vertical space. The
user stands at the center and looks up and down the helix.
Constellation branches spread horizontally at each turn.

**Constellation:** The user floats in a dark void surrounded by
stars. Nodes are at varying distances. Walking toward a node
reveals its connections. The sense of scale is vast.

**Galaxy:** Multiple solar systems visible at different distances.
The user can jump between galaxies (cluster switching). Within
a galaxy, orbit paths are visible as faint rings.

---

## Performance Considerations

VR requires consistent 90fps+ at high resolution. This is
significantly more demanding than desktop 2D rendering.

Key performance requirements for VR:
- Graph simplification for large graphs (level-of-detail)
- Physics simulation must be decoupled from render frame rate
- Node/edge count limits per VR quality preset
- Async data loading for node details
- Frustum culling — only render what's in view

These requirements mean VR will support smaller graphs (< 200
nodes) at high quality, and larger graphs (200–1000 nodes) with
aggressive LOD. Graphs over 1000 nodes need hierarchical
navigation — you navigate between cluster-level views, not
all nodes simultaneously.

---

## Technology Approach (Concept)

```
WebXR API  → browser-based VR (Quest browser, desktop VR)
Three.js   → 3D rendering engine (same as Hyper 3D layer)
Rapier     → physics simulation (Rust/WASM, fast)
Hand tracking → WebXR hand input API
Controllers → WebXR gamepad API
Teleport   → ray-cast locomotion (safest for all users)
```

Alternative: native Tauri app with direct VR SDK integration
(more performance, more complexity). Decision deferred until
WebXR performance is assessed.

---

## Accessibility in VR

VR introduces unique accessibility challenges:

- Motion sickness: all teleport, no smooth locomotion by default
- Seated mode: full experience from seated position
- Controller alternative: head-gaze + dwell for hands-free operation
- Comfort breaks: automatic comfort reminder after 30 minutes
- Reduced VR mode: flat panels in VR space (no 3D graph, just UI)

Motion Safety gate applies in VR — no high-frequency visual
effects, no strobing, no rapid environment changes.

---

## No Implementation Without

1. Hyper 3D layer implemented and stable
2. WebXR performance assessment on target hardware
3. VR_COMPATIBILITY_CONCEPT promoted to full contract
4. VR navigation contract (locomotion, interaction model)
5. VR accessibility contract
6. Motion Safety gate extended to VR-specific effects
7. User authorization to begin VR work
