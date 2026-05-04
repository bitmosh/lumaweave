# 07 — Visual Dialect Preset Files

## Purpose

Visual Dialect Preset files define reusable, schema-governed visual grammar for data/world rendering.

Possible file extensions:

```txt
.lwgrammar.yaml
.lwdialect.yaml
```

Recommended umbrella term:

```txt
Visual Grammar Protocol
```

## Terminal Command Direction

Possible terminal namespace:

```bash
lumaweave grammar list-handles
lumaweave grammar validate ./dialects/diff-pulse.lwgrammar.yaml
lumaweave grammar preview ./dialects/diff-pulse.lwgrammar.yaml --fixture ./fixtures/self-graph.json
lumaweave grammar explain ./dialects/song-library-constellation.lwgrammar.yaml
lumaweave grammar compile ./dialects/qa-sentinel.lwgrammar.yaml
```

Initial implementation should validate only. Runtime application comes later.

## File Shape

```yaml
name: Diff Work Pulse
kind: VisualGrammarProtocol
version: 1

source:
  adapter: repo.diff

dialect:
  layout: constellation-mesh
  physics: soft-cluster-gravity
  theme: obsidian-console

signals:
  diffPulse:
    engine: signal-loom
    envelope:
      attackMs: 80
      decayMs: 420
      releaseMs: 900
    rhythm:
      pattern: double-pulse
      rate: 2x

routes:
  - when:
      changedFiles: ">= 1"
    target:
      selector: graph.nodes.changed
    handles:
      - graph.node.glow
      - graph.edge.trace
    signal: diffPulse
    map:
      intensity: "changedFiles / 12"
      saturation: "+20%"

safety:
  reducedMotion:
    graph.node.glow: static-highlight
    graph.edge.trace: color-shift-only
  noStrobe: true
  maxPulseHz: 1
```

## Song Library Example

```yaml
name: Song Library Living Constellation
id: song-library-living-constellation
version: 1

source:
  type: media.currentTrackMetadata
  permissions:
    audioCapture: false
    playback: false
    metadataOnly: true

dialect:
  layout: orbital-constellation
  physics: soft-gravity-clusters
  theme: aurora-shell

signals:
  energyPulse:
    from: track.energy
    envelope:
      attackMs: 120
      releaseMs: 1800
    rhythm:
      bpm: track.tempo
      subdivision: 2

routes:
  - when:
      currentTrack.exists: true
    target:
      selector: graph.node.currentTrack
    handles:
      - graph.node.halo
      - graph.node.glow
    signal: energyPulse
    map:
      intensity: track.energy
      color: genre.palette.primary

  - when:
      relatedArtists.count: "> 0"
    target:
      selector: graph.cluster.relatedArtists
    handles:
      - graph.cluster.aura
    signal: energyPulse
    map:
      opacity: 0.35
      radius: "+12%"

safety:
  reducedMotion:
    graph.node.halo: static-highlight
    graph.cluster.aura: color-shift-only
  maxPulseHz: 1
  noStrobe: true
```

## Preset Folder Concept

```txt
/lumaweave-grammar/
  presets/
    ambient-system-breath.lwgrammar.yaml
    diff-pulse.lwgrammar.yaml
    test-failure-warning-ring.lwgrammar.yaml
    music-library-orbit-pulse.lwgrammar.yaml
  handles/
    AUDIO_REACTIVITY_HANDLES.md
    VISUAL_REACTIVITY_HANDLES.md
    TARGET_SELECTORS.md
    SAFETY_TRANSFORMS.md
  examples/
    repo-diff-protocol.lwgrammar.yaml
    song-library-screensaver.lwgrammar.yaml
    qa-sentinel-protocol.lwgrammar.yaml
```

## Import Rules

Allowed imports should be controlled:

```yaml
imports:
  - preset: base.diff-pulse
  - handles: graph-basic
  - safety: reduced-motion-defaults
```

Forbidden:

```yaml
imports:
  - https://random-site/script.js
```

## Initial Scope

First version should be terminal-validation only:

- Parse YAML.
- Validate schema.
- Validate known handles.
- Validate known target selectors.
- Validate safety transforms.
- Report unsupported runtime features.
- No live application.
- No graph/Sigma mutation.
- No audio input/playback.
