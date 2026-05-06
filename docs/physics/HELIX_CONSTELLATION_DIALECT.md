---
id: dialect.physics.helix
title: Helix / DNA Constellation Physics Dialect
type: concept
status: concept
version: v73c
domain: physics
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - system.physics.dialects
  - contract.audio.reactivity
  - contract.motion.safety
tags: [physics, helix, dna, constellation, dialect, brand, audio, layout]
---

# Helix / DNA Constellation Physics Dialect

## Overview

The Helix dialect is the brand physics layout. It mirrors the
visual identity of LumaWeave — the double helix in the logo,
the signature line in the brand mark, the DNA strand in the
splash screen. When users see this layout, they should recognize
it as distinctly LumaWeave.

The helix arranges graph nodes along one or two counter-rotating
helical backbones, with neighborhood clusters branching off the
primary twist as constellation sub-graphs.

---

## Visual Structure

```
Primary helix backbone:
  ━━━●━━━━━●━━━━━●━━━━━●━━━━━●━━━━━●━━━
       ╲         ╲         ╲
        ●─●─●    ●─●       ●─●─●─●
        Cluster  Cluster   Cluster
        (blue)   (purple)  (gold)
```

In 3D / full Panorama Atlas view:
```
Two counter-rotating helices (DNA double helix)
  Primary helix: core/primary nodes (blue cluster)
  Secondary helix: governance/contract nodes (purple cluster)
  Constellation branches: neighborhood clusters orbit off both helices
  Connecting rungs: cross-edges between the two helices
```

---

## Force Layout Parameters

```typescript
interface HelixDialectForceConfig {
  // Primary helix backbone
  helixRadius: number;          // default: 120 — radius of helix curve
  helixPitch: number;           // default: 80 — vertical distance per turn
  helixTurns: number;           // default: 3 — number of full rotations
  helixRotationSpeed: number;   // default: 0 — static unless audio-driven

  // Secondary helix (double helix mode)
  doubleHelixEnabled: boolean;  // default: false (single helix to start)
  helixPhaseOffset: number;     // default: Math.PI — opposite phase

  // Constellation branches
  branchRepel: number;          // default: 200 — branch cluster repulsion
  branchAttract: number;        // default: 80 — pull toward helix backbone
  branchRadius: number;         // default: 60 — max branch spread radius
  branchOrbitSpeed: number;     // default: 0 — static unless audio-driven

  // Global forces
  centerGravity: number;        // default: 0.3 — gentle pull to center
  nodeRepel: number;            // default: 150 — inter-node repulsion
  edgeStrength: number;         // default: 0.6 — edge as spring force
  edgeLength: number;           // default: 60 — target edge length
}
```

---

## Cluster Color Assignment

The helix dialect uses the brand cluster colors to color-code
neighborhoods visually:

```
Blue   (#4fa3e0) → core/primary systems cluster
Purple (#a67de8) → governance/contracts cluster
Gold   (#e0a84f) → active work / current version cluster
Teal   (#4fd9c8) → future/planned cluster
Green  (#64d9a4) → accepted/stable cluster
Gray   (#6a7485) → archive/logs cluster
```

Cluster assignment uses the `cluster` field from each node's
graph metadata (sourced from the doc frontmatter schema).
Nodes without a cluster assignment default to gray.

---

## Audio Routing Map

```
Signal → Target Handle → Effect → Reduced Motion Fallback

bass   → helix.rotation.speed
         Effect: helix backbone slowly rotates on bass hits
         Mapping: bass * 0.02 (radians/frame max)
         Reduced motion: static-highlight (no rotation)
         Epilepsy risk: none

beat   → graph.cluster.*.pulse
         Effect: constellation branches pulse outward on beat
         Mapping: branchRadius * (1 + beat * 0.3) on beat hit,
                  returns to base over 400ms
         Reduced motion: color-shift-only (no size change)
         Epilepsy risk: possible (beat-synced)

treble → graph.edge.*.brightness
         Effect: helix backbone edges brighten on treble
         Mapping: edge opacity = 0.4 + (treble * 0.6)
         Reduced motion: allow (brightness only, no motion)
         Epilepsy risk: none

rms    → helix.scale
         Effect: overall helix breathes with amplitude
         Mapping: helixRadius * (1 + rms * 0.15)
         Reduced motion: disable
         Epilepsy risk: none

tempo  → helix.rotation.speed (baseline)
         Effect: rotation speed baseline set by tempo
         Mapping: tempo / 120 * baseRotationSpeed
         Reduced motion: static-highlight
         Epilepsy risk: none

silence → helix.idle.drift
          Effect: nodes drift slowly when audio is silent
          Mapping: gentle random walk, max 2px/frame
          Reduced motion: static (no drift)
          Epilepsy risk: none
```

---

## Reduced Motion Profile

```
helixRotation:      disable   (no rotation under reduced motion)
branchPulse:        soften    (color shift only, no size change)
edgeBrightness:     allow     (brightness is fine)
helixScale:         disable   (no breathing)
idleDrift:          disable   (no drift)
```

Safe fallback visual (reduced motion):
- Helix is static, beautiful, well-arranged
- Cluster colors still visible
- Edge weights still visible via opacity
- No motion of any kind
- Still clearly recognizable as the helix layout

---

## Node Placement Algorithm

High-level placement logic (for implementation guidance):

```
1. Run community detection on graph (Graphology louvain or similar)
2. Assign community → cluster color mapping
3. Sort communities by node count (largest = primary helix position)
4. Place largest community nodes along helix backbone at intervals
5. Place remaining communities as constellation branches:
   - Each branch has a "spine node" (highest-degree node in community)
   - Spine node attaches to nearest helix backbone node
   - Remaining community nodes orbit the spine node
6. Apply force simulation to refine positions
7. Helix backbone nodes have strong spring force to their helix position
8. Branch nodes have weak spring force to their cluster center
```

---

## Implementation Notes

**Start simple:** Implement single helix first. Double helix is
a later enhancement.

**Performance:** For large graphs (500+ nodes), the helix backbone
should use at most 20–30 primary backbone nodes. Remaining nodes
go into constellation branches. Use level-of-detail to hide branch
detail when zoomed out.

**Transition animation:** When switching to Helix from another
dialect, nodes should animate to their helix positions over 800ms
with an ease-out curve. This is the "DNA assembling" effect.

**Physics stability:** The helix backbone positions should be
treated as strong attractors, not hard constraints. Nodes should
wiggle slightly in their positions — a living structure, not
a rigid skeleton.

**Do not implement** double helix, orbital branch modes, or
audio-reactive rotation until the single static helix is stable
and accepted via Playwright evidence.
