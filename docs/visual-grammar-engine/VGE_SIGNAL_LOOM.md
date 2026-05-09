---
id: vge.signal.loom
title: Visual Grammar Engine — Signal Loom Routing Model
type: concept
status: concept
version: v86a
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - vge.overview.and.terms
  - vge.grammar.handle.and.lens
  - vge.dialect.and.safety
  - audio.reactivity.contract
  - music.reactive.mapping.contract
  - audio.source.system.contract
  - motion.safety.contract
tags:
  - vge
  - signal-loom
  - routing
  - signals
  - future
  - docs-only
---

# Visual Grammar Engine — Signal Loom Routing Model

> **Status:** Future architecture / docs-only. No runtime implementation authorized.

## v86a Status Note

Signal Loom adjacent contracts already exist in v86a:

- **Audio reactivity** — [Audio Reactivity Contract](audio.reactivity.contract) and [Audio Source System Contract](audio.source.system.contract) define the boundaries for audio input. Signal Loom routes events through these contracts; it does not bypass them.
- **Music reactivity** — [Music Reactive Mapping Contract](music.reactive.mapping.contract) is the registry contract for music-driven visual mappings. Signal Loom routes can target music handles defined here.
- **Motion safety** — [Motion Safety Contract](motion.safety.contract) governs the reduced-motion fallback transforms used by every Signal Loom route. Routes must declare their reduced-motion safety transform.

Signal Loom implementation is gated on the Source Adapter OS Reconnect Contract (v74) and Synthetic Data Fixtures v0 (v75). See [VGE Roadmap](vge.roadmap).

---

## Purpose

Signal Loom is the routing subsystem inside the Visual Grammar Engine. It maps source events, data changes, synthetic audio-like signals, timing patterns, envelopes, visual handles, target selectors, and safety transforms into custom visual reactivity protocols.

**Analog:** a modular synthesizer patch bay — but for data events and visual handles instead of audio.

---

## Core Routing Shape

```
Source/Event → Signal/Envelope → Mapping → Target Handle → Safety Transform
```

Example:

```
diff.detected → doublePulse → saturation/radius → graph.node.glow → reducedMotion.staticHighlight
```

---

## Visual Patch Bay (example routing table)

```
Source/Event         Signal/Envelope       Mapping             Target Handle              Safety Transform
diff.detected     →  doublePulse        →  saturation/radius → graph.node.glow         → reducedMotion.staticHighlight
test.failed       →  slowWarningRing    →  border/intensity  → panel.boundarySeal      → reducedMotion.badgeOnly
track.playing     →  tempoPulse         →  aura/opacity      → music.cluster           → reducedMotion.colorShiftOnly
```

Cable metaphor:

```
[Diff Events]    ─ cable ─ [Double Pulse Envelope] ─ cable ─ [Changed Node Glow]
[Test Failures]  ─ cable ─ [Warning ADSR]          ─ cable ─ [Boundary Seal]
[Current Track]  ─ cable ─ [Tempo Signal]          ─ cable ─ [Song Graph Aura]
```

---

## Signal Sources

```
workspace.diff.detected     file.saved           test.failed
test.passed                 sourceAdapter.imported
graph.node.created          graph.edge.created   cluster.expanded
qa.bundle.changed           agent.patch.proposed agent.patch.accepted
risk.increased              media.currentTrackMetadata
```

Real audio input, playback, decoding, microphone, and Web Audio remain locked until explicit future contracts. The boundary is governed by [Audio Source System Contract](audio.source.system.contract).

---

## Signal Types

```
signal.envelope.adsr           signal.rhythm.pulse
signal.rhythm.doublePulse      signal.rhythm.heartbeat
signal.frequency.lowBand       signal.frequency.midBand
signal.frequency.highBand      signal.amplitude.synthetic
signal.tempo.bpm               signal.silence.detected
```

---

## Target Handles

```
graph.node.glow       graph.node.halo       graph.node.scale
graph.edge.trace      graph.edge.brightness
graph.cluster.aura    panel.boundary.seal   panel.status.badge
atlas.constellation.twinkle                debug.signal.readout
```

---

## Target Selectors

```
graph.nodes.changed        graph.nodes.failedTests
graph.edges.new            graph.cluster.activeWork
workspace.currentFile      qa.currentBundle
sourceAdapter.latestImport music.node.currentTrack
music.cluster.relatedArtists
```

---

## Safety Transforms

```
reducedMotion.staticHighlight
reducedMotion.colorShiftOnly
reducedMotion.disablePulse
reducedMotion.badgeOnly
```

Every Signal Loom route must declare a safety transform per [Motion Safety Contract](motion.safety.contract). Routes without a declared safety transform are rejected.

---

## Example Visual Grammar Route (YAML)

```yaml
routes:
  - id: diff-to-changed-node-glow
    when:
      source: workspace.diff.detected
      changedFiles: ">= 1"
    signal: diffPulse
    target:
      selector: graph.nodes.changed
    handles:
      - graph.node.glow
      - graph.edge.trace
    map:
      intensity: "changedFiles / 12"
      saturation: "+20%"
      radius: "+8%"
    safety:
      reducedMotion: static-highlight
      maxPulseHz: 1
```

---

## Screensaver / Live Desktop Vision

Future use case — song library constellation screensaver:

```
nodes = artists/albums/tracks/playlists
edges = genre, playlist co-occurrence, listening history
source = currently playing track metadata (metadata-only until audio contracted)
signal = track tempo/energy/metadata-derived features
dialect = orbital constellation or bloom nebula
output = graph pulses around current track and related clusters
```

---

## Initial Safety Position

Signal Loom must not initially:

- Play audio, capture audio, decode audio files
- Mutate Sigma directly
- Add high-frequency motion
- Execute commands
- Import remote code

---

## Product Copy

> Write the rhythm of your data.
> Route events into light, motion, focus, and form.
> Design how your system breathes.

---

*Frontmatter normalized v86a. Body content preserved as design-locked architecture. Connections added to current shipping audio/motion contracts.*
