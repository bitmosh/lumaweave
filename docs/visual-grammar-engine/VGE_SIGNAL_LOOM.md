---
id: vge.PLACEHOLDER
title: Visual Grammar Engine — PLACEHOLDER
type: concept
status: concept
version: v73c
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [vge, visual-grammar-engine, concept, future, docs-only]
---
# Visual Grammar Engine — Signal Loom Routing Model

> Status: Future architecture / docs-only. No runtime implementation authorized.

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

Real audio input, playback, decoding, microphone, and Web Audio remain locked until explicit future contracts.

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
