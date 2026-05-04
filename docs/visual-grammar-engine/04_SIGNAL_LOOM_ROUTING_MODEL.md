# 04 — Signal Loom Routing Model

## Purpose

Signal Loom is the routing subsystem inside the Visual Grammar Engine.

It maps source events, data changes, synthetic audio-like signals, timing patterns, envelopes, visual handles, target selectors, and safety transforms into custom visual reactivity protocols.

## Core Routing Shape

```txt
Source/Event → Signal/Envelope → Mapping → Target Handle → Safety Transform
```

Example:

```txt
diff.detected → doublePulse → saturation/radius → graph.node.glow → reducedMotion.staticHighlight
```

## Analog Synth Patch Bay Metaphor

Signal Loom should eventually have a visual routing table similar to an analog synthesizer or modular patch bay.

Example patch table:

```txt
Source/Event       Signal/Envelope       Mapping             Target Handle          Safety Transform
------------------------------------------------------------------------------------------------------
diff.detected  →   doublePulse       →   saturation/radius → graph.node.glow    → reducedMotion.staticHighlight
test.failed    →   slowWarningRing   →   border/intensity  → panel.boundarySeal → reducedMotion.badgeOnly
track.playing  →   tempoPulse        →   aura/opacity      → music.cluster      → reducedMotion.colorShiftOnly
```

Visual patch-bay metaphor:

```txt
[Diff Events]     ─ cable ─ [Double Pulse Envelope] ─ cable ─ [Changed Node Glow]
[Test Failures]   ─ cable ─ [Warning ADSR]          ─ cable ─ [Boundary Seal]
[Current Track]   ─ cable ─ [Tempo Signal]          ─ cable ─ [Song Graph Aura]
```

## Signal Sources

Initial/future source categories:

```txt
workspace.diff.detected
file.saved
test.failed
test.passed
sourceAdapter.imported
graph.node.created
graph.edge.created
cluster.expanded
qa.bundle.changed
agent.patch.proposed
agent.patch.accepted
risk.increased
media.currentTrackMetadata
```

Real audio input, playback, decoding, microphone, and Web Audio remain locked until explicit future contracts.

## Signal Types

```txt
signal.envelope.adsr
signal.rhythm.pulse
signal.rhythm.doublePulse
signal.rhythm.heartbeat
signal.frequency.lowBand
signal.frequency.midBand
signal.frequency.highBand
signal.amplitude.synthetic
signal.tempo.bpm
signal.silence.detected
```

## Target Handles

```txt
graph.node.glow
graph.node.halo
graph.node.scale
graph.edge.trace
graph.edge.brightness
graph.cluster.aura
panel.boundary.seal
panel.status.badge
atlas.constellation.twinkle
debug.signal.readout
```

## Target Selectors

```txt
graph.nodes.changed
graph.nodes.failedTests
graph.edges.new
graph.cluster.activeWork
workspace.currentFile
qa.currentBundle
sourceAdapter.latestImport
music.node.currentTrack
music.cluster.relatedArtists
```

## Safety Transforms

```txt
reducedMotion.staticHighlight
reducedMotion.colorShiftOnly
reducedMotion.disablePulse
reducedMotion.badgeOnly
```

## Example Visual Grammar Route

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

## Screensaver / Live Desktop Application

A future Signal Loom use case:

```txt
Song library graph screensaver:
- nodes = artists/albums/tracks/playlists
- edges = genre, playlist co-occurrence, listening history
- source = currently playing track metadata
- signal = track tempo / energy / metadata-derived features
- visual dialect = orbital constellation or bloom nebula
- output = graph pulses around current track and related clusters
```

This should remain metadata-first until audio input/playback/analysis are separately contracted.

## Initial Safety Position

Signal Loom can start with terminal validation and passive previews.

It must not initially:

- Play audio.
- Capture audio.
- Decode audio files.
- Mutate Sigma directly.
- Add high-frequency motion.
- Execute commands.
- Import remote code.

## Product Copy

```txt
Write the rhythm of your data.
Route events into light, motion, focus, and form.
Design how your system breathes.
```
