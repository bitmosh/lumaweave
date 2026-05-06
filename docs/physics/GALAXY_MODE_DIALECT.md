---
id: dialect.physics.galaxy
title: Galaxy Mode Physics Dialect
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
tags: [physics, galaxy, orbital, cluster, dialect, audio, layout, complex]
---

# Galaxy Mode Physics Dialect

## Overview

Galaxy mode is the most spectacular and most complex physics
dialect. Each neighborhood cluster becomes an isolated "solar
system" — an anchor node (the highest-weight node) at the center,
with other cluster nodes orbiting it based on their individual
weights and edge relationships.

**Implementation complexity: HIGH.** Do not implement without an
explicit runtime contract. The orbital mechanics require custom
D3-force forces and careful performance work.

---

## Visual Structure

```
      Inter-cluster space (repulsion wall)
        │
        ▼
  ·  ·  │  ·  ·  ·
  ──────●──────         ← cluster A (blue)
    ◉→  │  ←◉           nodes orbiting anchor
  ──────│──────
        │              ← repulsion wall
  ──────│──────
    ◉→  │  ←◉           ← cluster B (purple)
  ──────●──────
        │
  ·  ·  │  ·  ·  ·
```

In practice, clusters appear as self-contained orbital systems
separated by clear empty space. Inter-cluster edges appear as
faint arcs crossing the repulsion boundaries — visible but
clearly "long-distance" connections.

---

## Physics Model

### Cluster Isolation

Each neighborhood cluster (from community detection) gets:
- A **gravity anchor** (highest-weight/degree node in cluster)
- A **gravity well** (strong attractive force toward the anchor)
- A **repulsion wall** (inter-cluster repulsion preventing
  cluster overlap)

```typescript
interface GalaxyCluster {
  id: string;
  anchorNodeId: string;        // highest-weight node
  memberNodeIds: string[];
  gravityStrength: number;     // pull toward anchor (per cluster)
  repulsionRadius: number;     // inter-cluster exclusion zone
  orbitSpeedBase: number;      // baseline orbital speed
}
```

### Orbital Mechanics

Within each cluster:
- Orbit radius = node weight (normalized 0–1, mapped to px range)
- Orbit speed = edge confidence score to anchor node
- Orbit direction: counterclockwise by default, clockwise for
  nodes with negative-sentiment edges (future: sentiment edges)
- Nodes maintain approximately circular orbits with slight
  elliptical variation driven by inter-node forces

```
orbit_radius(node) = MIN_RADIUS + (node.weight * (MAX_RADIUS - MIN_RADIUS))
orbit_speed(node)  = BASE_SPEED * edge_confidence(node, anchor)
```

### Implementation Approach

Use D3-force with custom forces:
```javascript
// Custom galaxy force
function galaxyForce(alpha) {
  for (const cluster of clusters) {
    const anchor = nodeMap.get(cluster.anchorNodeId);
    for (const nodeId of cluster.memberNodeIds) {
      const node = nodeMap.get(nodeId);
      // Orbital attraction toward anchor position + orbit offset
      const targetAngle = node.orbitAngle + (node.orbitSpeed * alpha);
      const targetX = anchor.x + Math.cos(targetAngle) * node.orbitRadius;
      const targetY = anchor.y + Math.sin(targetAngle) * node.orbitRadius;
      node.vx += (targetX - node.x) * alpha * cluster.gravityStrength;
      node.vy += (targetY - node.y) * alpha * cluster.gravityStrength;
      node.orbitAngle = targetAngle;
    }
  }
}
```

---

## Force Layout Parameters

```typescript
interface GalaxyDialectForceConfig {
  // Per-cluster
  clusterGravityStrength: number;  // default: 0.8 — strong pull to anchor
  clusterRepulsionRadius: number;  // default: 250 — inter-cluster exclusion
  clusterRepulsionStrength: number; // default: 2.0 — hard inter-cluster wall

  // Orbital
  minOrbitRadius: number;          // default: 40
  maxOrbitRadius: number;          // default: 160
  baseOrbitSpeed: number;          // default: 0.003 (radians/frame)
  orbitDamping: number;            // default: 0.95

  // Global
  centerGravity: number;           // default: 0.05 — very gentle
  interClusterEdgeLength: number;  // default: 400 — long inter-cluster edges
}
```

---

## Audio Routing Map

```
bass    → baseOrbitSpeed (all clusters)
          Effect: all clusters speed up their orbits on bass
          Mapping: orbitSpeed = baseOrbitSpeed * (1 + bass * 2.0)
          Reduced motion: static-highlight (no speed change)
          Epilepsy risk: possible (rapid node movement)

beat    → clusterGravityStrength (pulse)
          Effect: gravity pulses tighter on beat, releases after
          On beat: gravityStrength * 1.5, decay over 300ms
          Reduced motion: color-shift-only
          Epilepsy risk: possible

rms     → graph.edge.inter-cluster.opacity
          Effect: faint gravitational lensing arcs between clusters
          glow with overall amplitude
          Mapping: interCluster edge opacity = 0.05 + (rms * 0.25)
          Reduced motion: allow (opacity only, no motion)

treble  → graph.node.anchor.corona
          Effect: gravity anchor nodes pulse a corona/halo on treble
          Mapping: corona radius = baseCorona + (treble * 20px)
          Reduced motion: static-highlight (static corona)
          Epilepsy risk: none

silence → orbit.coast
          Effect: when silent, orbits coast at minimum speed
          No effect changes — just sustain current state
          Reduced motion: n/a (no change)
```

---

## Reduced Motion Profile

```
orbitSpeedChange:   disable  (no speed variation)
gravityPulse:       soften   (color-shift-only on beat)
lensing:            allow    (opacity only, no motion)
anchorCorona:       soften   (static corona, no pulse)
```

**Safe fallback (reduced motion):**
Nodes are positioned in orbital rings around cluster anchors
but do not move. The layout is static and beautiful — concentric
rings of nodes around central anchors, clearly showing cluster
structure and hierarchy. Inter-cluster edges as faint arcs.
The static galaxy is immediately readable as "solar systems."

---

## Performance Considerations

Galaxy mode is expensive for large graphs:
- Community detection: O(n log n) — run once on graph load
- Orbital force simulation: O(n) per tick — manageable
- Inter-cluster repulsion walls: O(k²) where k = cluster count
  — needs Barnes-Hut approximation for k > 20

Performance thresholds:
- Graphs < 200 nodes: full simulation, all effects
- Graphs 200–500 nodes: reduce orbit update frequency to 2x/frame
- Graphs > 500 nodes: static orbital rings (no live simulation)
  with audio-reactive glow only

---

## Implementation Prerequisites

Before Galaxy mode can be implemented:

1. Physics Dialect System contract accepted
2. Community detection running reliably (Graphology louvain)
3. Node weight metadata available in graph (from frontmatter schema)
4. Edge confidence scores available in graph
5. Custom D3-force implementation tested on test fixtures
6. Motion Safety gate running per-effect
7. Performance tested on 100/200/500 node fixtures

**Do not implement until all prerequisites are met.**
This is a vGrammar-9 level feature — it requires the full
governance stack to be solid first.
