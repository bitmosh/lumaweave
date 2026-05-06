---
id: contract.universal.audio.handle.routing
title: Universal Audio Handle Routing
type: contract
status: accepted
version: v73c
domain: audio
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.audio.reactivity
  - contract.music.reactive.mapping
  - contract.audio.source.system
  - contract.motion.safety
related:
  - system.physics.dialects
  - architecture.rendering.layers
  - vge.signal.loom
tags: [audio, reactivity, handles, signal-loom, universal, routing, physics, grammar]
---

# Universal Audio Handle Routing

## Principle

Audio reactivity in LumaWeave is not a special feature attached
to specific elements. It is a **universal routing layer** — any
grammar handle in any rendering layer can subscribe to any audio
signal channel.

The handle doesn't need to know it's audio-reactive. It consumes
a normalized value (0–1 or BPM range) from the Signal Loom,
applies it to its parameter, and the Motion Safety gate decides
whether to allow, soften, or block the output.

---

## Signal Channels

All channels provided by the Audio Reactivity system (v61):

```
rms     → root mean square amplitude       0.0 – 1.0
bass    → low-frequency energy             0.0 – 1.0
mid     → mid-frequency energy             0.0 – 1.0
treble  → high-frequency energy            0.0 – 1.0
beat    → beat detection confidence        0.0 – 1.0
tempo   → beats per minute                 60 – 200
silence → silence detection confidence     0.0 – 1.0
```

In current implementation: all channels use synthetic signals
(deterministic, safe, no real audio). Real audio promotion
requires an explicit future contract per audio source type.

---

## Subscribable Handle Categories

Any handle in these categories can subscribe to audio signals:

### Graph Handles
```
graph.node.*.glow          → intensity, radius, color shift
graph.node.*.scale         → size multiplier
graph.node.*.brightness    → opacity, color brightness
graph.node.*.halo          → halo radius, halo opacity
graph.edge.*.brightness    → edge opacity, color brightness
graph.edge.*.width         → edge stroke width
graph.edge.*.trace         → animated trace effect (gated)
graph.cluster.*.aura       → cluster aura radius, opacity
graph.cluster.*.gravity    → cluster gravity strength
```

### Physics Handles
```
physics.helix.rotationSpeed     → helix rotation rate
physics.helix.scale             → overall helix size
physics.constellation.drift     → node drift speed
physics.galaxy.orbitSpeed       → orbital velocity multiplier
physics.galaxy.gravityPulse     → gravity well strength pulse
physics.global.centerGravity    → overall center attraction
physics.global.nodeRepel        → inter-node repulsion
```

### Environment Handles (future — 3D/VR layer)
```
environment.fog.density         → atmospheric fog depth
environment.ambient.intensity   → ambient light level
environment.bloom.strength      → post-processing bloom
environment.particle.density    → particle system density
```

### UI Handles
```
ui.tile.*.glow             → tile border glow
ui.statusBar.pulse         → status bar pulse on events
ui.nodeInspector.highlight → inspector panel accent color pulse
```

---

## Subscription Model

A handle subscription maps one signal channel to one handle
parameter, with an optional mapping function:

```typescript
interface AudioHandleSubscription {
  handlePath: string;          // e.g. "graph.node.*.glow"
  channel: AudioChannel;       // e.g. "bass"
  parameter: string;           // e.g. "intensity"
  mappingFn: MappingFunction;  // how to translate 0-1 to param range
  motionSafetyClass: MotionSafetyClass;  // required
  reducedMotionBehavior: ReducedMotionBehavior;  // required
  epilepsyRisk: EpilepsyRisk;  // required
}

type MappingFunction =
  | { type: "linear"; min: number; max: number }
  | { type: "exponential"; min: number; max: number; exponent: number }
  | { type: "threshold"; threshold: number; below: number; above: number }
  | { type: "custom"; fn: (value: number) => number }
```

### Example Subscriptions

```typescript
// Bass drives node glow intensity
{
  handlePath: "graph.node.*.glow",
  channel: "bass",
  parameter: "intensity",
  mappingFn: { type: "linear", min: 0.0, max: 0.8 },
  motionSafetyClass: "low",
  reducedMotionBehavior: "soften",  // glow at 0.2 max under reduced motion
  epilepsyRisk: "none"
}

// Beat drives helix rotation
{
  handlePath: "physics.helix.rotationSpeed",
  channel: "beat",
  parameter: "speed",
  mappingFn: { type: "threshold", threshold: 0.7, below: 0, above: 0.02 },
  motionSafetyClass: "moderate",
  reducedMotionBehavior: "disable",  // no rotation under reduced motion
  epilepsyRisk: "possible"
}

// Silence drives idle drift
{
  handlePath: "physics.constellation.drift",
  channel: "silence",
  parameter: "speed",
  mappingFn: { type: "linear", min: 0.0, max: 0.5 },
  motionSafetyClass: "low",
  reducedMotionBehavior: "disable",
  epilepsyRisk: "none"
}
```

---

## Physics Dialect Audio Bundles

Physics Dialects include a pre-defined set of audio subscriptions
as part of their configuration. When a dialect is selected, its
audio bundle is activated — the Signal Loom wires up all the
subscriptions in the bundle simultaneously.

Users can modify a dialect's audio bundle via the Signal Patch Bay
tile (Signal Lens). Changes can be saved as a custom dialect
variant or as a workspace-level override.

---

## Rendering Layer Behavior

Audio subscriptions are **layer-agnostic** by handle path, but
**layer-specific** in their implementation:

```
Subscription: graph.node.*.glow subscribes to bass channel

2D layer active:
  → DOM overlay glow effect on node containers
  → CSS box-shadow or SVG filter, constrained to DOM elements
  → NOT applied to Sigma canvas nodes directly

3D layer active (future):
  → mesh emission intensity on Three.js node objects
  → resolved by 3D layer's handle resolver

Flat layer active (future):
  → SVG stroke-width or filter on SVG node elements
```

The subscription itself doesn't change. The active layer's
handle resolver interprets it appropriately.

---

## Motion Safety Gate — Hard Rule

**Every audio-reactive handle effect, without exception, must
pass through the Motion Safety gate before applying.**

The gate checks:
1. Effect's `motionSafetyClass` (safe/low/moderate/high)
2. User's reduce-motion preference
3. Effect's `epilepsyRisk` (none/possible/high)

Gate decisions:
```
safe + any reduce-motion:           allow
low + reduce-motion disabled:       allow
low + reduce-motion enabled:        soften (per reducedMotionBehavior)
moderate + reduce-motion disabled:  allow
moderate + reduce-motion enabled:   soften or disable
high + any condition:               require explicit user opt-in
epilepsyRisk: possible + reduce-motion: soften
epilepsyRisk: high + any:           block unless explicit opt-in
```

No workarounds. No "this seems safe." The gate is the authority.

---

## Current Implementation State

- Audio signal channels: synthetic only (v62, accepted)
- Music reactive mapping registry: passive/read-only (v64, accepted)
- Audio source registry: passive/read-only (v66, accepted)
- Universal handle subscription routing: **not yet implemented**
- Signal Patch Bay UI: **not yet implemented**
- Physics dialect audio bundles: **docs-only** (this document + dialect docs)

Implementation of universal routing requires:
1. Signal Loom router implementation (vSignal-3 in VGE roadmap)
2. Handle resolver per rendering layer
3. Physics Dialect audio bundle loader
4. Motion Safety gate integrated into routing path

Earliest implementation: v78+ after VGE bootstrap begins.
