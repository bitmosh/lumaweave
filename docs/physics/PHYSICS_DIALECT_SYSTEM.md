---
id: system.physics.dialects
title: Physics Dialect System
type: policy
status: accepted
version: v86b
domain: physics
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-15
references:
   - contract.graph.runtime.boundary
   - contract.audio.reactivity
   - contract.motion.safety
related:
  - dialect.physics.helix
  - dialect.physics.constellation
  - dialect.physics.galaxy
  - physics.gwells.contract
tags: [physics, dialects, layout, audio, helix, constellation, galaxy, signal-loom]
---

# Physics Dialect System

> **Status (v86b):** The Physics Dialect concept survives and is now
> implemented via the **gwells** engine. The bundle-physics-with-audio
> framing described below remains the architecture intent. Specific
> dialect implementations referenced in this doc (helix, constellation,
> galaxy) are treated as *future gwells dialects*; the v0 gwells dialect
> is `gwells.dialect.horizontal-linear` (a directory-backbone layout,
> not described in this doc). The FA2/Louvain-based helix implementation
> that briefly ran in code has been retired.
>
> See `docs/physics/GRAVITY_WELL_SYSTEM_CONTRACT.md` for the current
> physics architecture.

## Concept

A **Physics Dialect** is a named, bundled configuration that sets
both the force layout parameters AND the audio signal routing for
a graph view simultaneously. Selecting a dialect changes how the
graph is arranged spatially AND how it responds to audio signals.

Physics dialects are first-class presets in the Signal Loom — not
just physics settings, not just audio settings, but both together
as a coherent experience.

---

## Why Bundle Physics and Audio Together

A Constellation layout feels wrong with the same audio routing as
a Galaxy layout. A helix that pulses on beat feels different from
one that breathes on RMS amplitude. The physics and the audio
reactivity are part of the same visual dialect — they should be
selected together, not separately.

```
User selects "Galaxy" dialect:
  → force layout switches to orbital cluster model
  → audio routing switches to orbital pulse model
  → Motion Safety gate validates the combined effect
  → both activate simultaneously
```

---

## Dialect Selection Model

Dialects are selected via the Atlas lens physics controls.
Switching a dialect:

1. Suspends current force simulation
2. Applies new force layout parameters
3. Rewires Signal Loom audio routing to dialect's audio map
4. All audio-reactive effects pass through Motion Safety gate
5. Resumes force simulation with new parameters
6. Graph animates to new layout (transition speed: user-configurable)

Switching a dialect does NOT:
- Change the active theme preset
- Change the active rendering layer
- Change node/edge data or graph structure
- Persist without explicit save action

---

## Current Dialects

### Helix / DNA (Brand Dialect)
```
docs/physics/HELIX_CONSTELLATION_DIALECT.md
Status: concept → implement first (it's the brand shape)
```

Primary twist backbone with neighborhood constellation branches.
This is the brand physics layout — the logo made interactive.
Color-coded neighborhoods correspond to the brand cluster colors:
Blue = core/primary, Purple = governance, Gold = active work,
Teal = future/planned.

### Constellation
```
docs/physics/CONSTELLATION_MODE_DIALECT.md
Status: concept
```

Very low gravity, high repel. Nodes spread to maximum spacing
as star fields. Peaceful, spacious, good for large graphs where
you want to see the overall shape without detail.

### Galaxy
```
docs/physics/GALAXY_MODE_DIALECT.md
Status: concept — high implementation complexity
```

Hard gravity lock per neighborhood cluster. Nodes orbit a central
gravity anchor (highest-weight node in each cluster). Orbit radius
= node weight. Orbit speed = edge confidence score. Requires stable
per-cluster gravity wells and inter-cluster repulsion walls.
Do not implement without explicit runtime contract.

---

## Future Dialects (Backlog)

```
River Timeline     → nodes flow left-to-right by timestamp
                     good for history slider / event replay view

Cathedral Stack    → hierarchical top-down layout
                     good for dependency trees / file structure

Neural Bloom       → semantic cluster layout with radial expansion
                     good for knowledge graphs / Obsidian vaults

Loom Flow          → dependency pipeline left-to-right
                     good for CI/CD, build chains, data pipelines

Orbital System     → hub-and-spoke with orbit rings
                     good for service maps, APIs
```

Each future dialect requires its own doc before implementation.

---

## Audio Routing Architecture

All Physics Dialects use the same signal channels from the
Audio Reactivity system:

```
Signal channels available:
  rms     → overall amplitude (0–1)
  bass    → low-frequency energy (0–1)
  mid     → mid-frequency energy (0–1)
  treble  → high-frequency energy (0–1)
  beat    → beat detection confidence (0–1)
  tempo   → beats per minute (60–200)
  silence → silence detection (0–1)
```

Each dialect defines its own **audio routing map** — which signal
channel drives which physics or visual parameter. The routing map
is part of the dialect's configuration file.

All mapped effects pass through the Motion Safety gate before
application. Dialects must define reduced-motion fallbacks for
every audio-reactive effect.

---

## Universal Audio Handle Subscription

Audio reactivity is not limited to physics parameters. Any grammar
handle in any rendering layer can subscribe to any audio signal
channel. This means:

```
Helix dialect audio routing:
  bass → helix.rotation.speed          (physics parameter)
  beat → graph.cluster.*.pulse         (grammar handle — visual)
  treble → graph.edge.*.brightness     (grammar handle — visual)
  rms → environment.ambient.intensity  (grammar handle — atmosphere)
```

The physics parameters go through the force simulation.
The grammar handles go through the Grammar Lens / Signal Loom
routing to the active rendering layer.

See `docs/audio/UNIVERSAL_AUDIO_HANDLE_ROUTING.md` for the full
handle subscription model.

---

## Motion Safety Requirements

Every Physics Dialect must:

1. Define a `reducedMotionProfile` specifying behavior for each
   audio-reactive effect under reduced motion preference:
   ```
   allow    → effect runs normally
   soften   → effect runs at reduced intensity
   disable  → effect is completely disabled
   static   → effect is replaced by a static visual cue
   ```

2. Define an `epilepsyRisk` classification for effects involving:
   - Rapid node movement (> 2Hz visual frequency)
   - Flashing or strobing effects
   - Beat-synced rapid color changes

3. Implement a `safeFallback` mode that activates under reduced
   motion or high epilepsy risk conditions. The fallback should
   still be beautiful — it should feel like a calm version of
   the dialect, not a broken one.

---

## Implementation Order

```
1. Helix — implement first (brand shape, highest value, medium complexity)
2. Constellation — implement second (simplest force model)
3. Galaxy — implement last (highest complexity, requires orbital mechanics)
4. Future dialects — one at a time, each with its own contract
```

Do not implement Galaxy mode without explicit runtime contract.
The orbital gravity well model requires careful force simulation
work and must be tested for performance on large graphs.
