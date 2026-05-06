---
id: dialect.physics.constellation
title: Constellation Mode Physics Dialect
type: concept
status: concept
version: v73c
domain: physics
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - system.physics.dialects
  - contract.audio.reactivity
  - contract.motion.safety
tags: [physics, constellation, starfield, dialect, audio, layout]
---

# Constellation Mode Physics Dialect

## Overview

Constellation mode spreads nodes to maximum spacing, presenting
the graph as a star field. The graph's overall shape — the
topology — becomes visible at a glance. Individual edges appear
as faint connectors between stars, visible on hover or zoom.

Best for: large graphs where you want to understand the broad
structure before diving into detail. Peaceful, spacious, good
for exploration and orientation.

---

## Visual Structure

```
  ·  ·    ·       ·  ·
     ·       ·
·        ●─────●      ·
     ·  /       \  ·
        ●    ●         ·
  ·        ·
·    ·          ●─●    ·
```

Nodes as bright points of light against a dark field.
Edges as faint lines, visible but not dominant.
Cluster neighborhoods as loose regional groupings.

---

## Force Layout Parameters

```typescript
interface ConstellationDialectForceConfig {
  nodeRepel: number;       // default: 600 — very high repulsion
  centerGravity: number;   // default: 0.05 — very weak center pull
  edgeStrength: number;    // default: 0.1 — very weak edge springs
  edgeLength: number;      // default: 200 — long target edge length
  clusterGravity: number;  // default: 0.15 — gentle cluster cohesion
  boundaryRepel: number;   // default: 300 — keep nodes in viewport
  damping: number;         // default: 0.9 — gentle settling
}
```

---

## Audio Routing Map

```
bass    → clusterGravity
          Effect: bass hits gently pull nodes toward cluster centers
          (stars drift inward briefly, then release)
          Mapping: clusterGravity + (bass * 0.3), decays over 800ms
          Reduced motion: disable (no movement)

treble  → graph.node.*.brightness
          Effect: nodes twinkle with treble energy
          Mapping: node opacity = 0.6 + (treble * 0.4)
          Reduced motion: allow (brightness only)

beat    → graph.edge.*.highlight
          Effect: one edge per beat does a brief "shooting star"
          trace from source to target node
          Reduced motion: color-shift-only (no animation)
          Epilepsy risk: possible

silence → idle.parallax.drift
          Effect: nodes drift very slowly when silent
          (breathing, living star field)
          Speed: max 0.5px/frame
          Reduced motion: disable
```

## Reduced Motion Profile

```
clusterPull:    disable  (no movement on bass)
nodeTwinkle:    allow    (brightness only, no motion)
shootingStar:   disable  (no animation)
parallaxDrift:  disable  (no drift)
```

Safe fallback: beautiful static star field. Node sizes encode
degree (larger = more connections). Edge weights visible via
opacity. Cluster regions subtly color-coded.
