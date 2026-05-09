---
id: vge.dialect.and.safety
title: Visual Grammar Engine — Visual Dialect Presets & Safety/Schema Governance
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
  - vge.signal.loom
  - vge.grammar.handle.and.lens
  - vge.asset.and.tokens
  - motion.safety.contract
  - audio.source.system.contract
  - theme.token.compatibility
  - graph.runtime.boundary.contract
tags:
  - vge
  - dialect
  - safety
  - schema
  - governance
  - future
  - docs-only
---

# Visual Grammar Engine — Visual Dialect Presets & Safety/Schema Governance

> **Status:** Future architecture / docs-only. No runtime implementation authorized.

## v86a Status Note

The safety governance principles in this doc align with shipping v86a contracts:

- **Motion safety** — [Motion Safety Contract](motion.safety.contract) is already enforced for current visual effects. VGE dialect presets must declare reduced-motion fallbacks consistent with this contract.
- **Audio safety** — [Audio Source System Contract](audio.source.system.contract) governs all audio input boundaries. VGE dialect presets cannot bypass these boundaries.
- **Graph runtime boundary** — [Graph Runtime Boundary Contract](graph.runtime.boundary.contract) gates all Sigma mutation. VGE dialect presets cannot mutate Sigma directly; they route through this contract.
- **Theme token governance** — [Theme Token Compatibility](theme.token.compatibility) governs all token references. VGE dialect presets cannot create parallel token systems.

VGE dialect implementation is gated on the Source Adapter OS Reconnect Contract (v74) and Synthetic Data Fixtures v0 (v75). See [VGE Roadmap](vge.roadmap).

---

## Visual Dialect Preset Files

### File Format

```
.lwgrammar.yaml  or  .lwdialect.yaml
```

Umbrella term: **Visual Grammar Protocol**

### Terminal Command Direction

```bash
lumaweave grammar list-handles
lumaweave grammar validate ./dialects/diff-pulse.lwgrammar.yaml
lumaweave grammar preview ./dialects/diff-pulse.lwgrammar.yaml --fixture ./fixtures/self-graph.json
lumaweave grammar explain ./dialects/song-library-constellation.lwgrammar.yaml
lumaweave grammar compile ./dialects/qa-sentinel.lwgrammar.yaml
```

Initial implementation: validation only. Runtime application comes later.

### File Shape

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

### Song Library Screensaver Example

```yaml
name: Song Library Living Constellation
source:
  type: media.currentTrackMetadata
  permissions:
    audioCapture: false
    playback: false
    metadataOnly: true

dialect:
  layout: orbital-constellation
  theme: aurora-shell

signals:
  energyPulse:
    from: track.energy
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

safety:
  reducedMotion:
    graph.node.halo: static-highlight
    graph.cluster.aura: color-shift-only
  maxPulseHz: 1
  noStrobe: true
```

### Preset Folder Structure

```
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
```

### Import Rules

Allowed:

```yaml
imports:
  - preset: base.diff-pulse
  - handles: graph-basic
  - safety: reduced-motion-defaults
```

Forbidden:

```yaml
imports:
  - https://random-site/script.js   # never
```

### Initial Scope

First version: terminal-validation only.

- Parse YAML, validate schema, validate known handles/target selectors/safety transforms
- Report unsupported runtime features
- No live application, no graph/Sigma mutation, no audio input/playback

---

## Safety & Schema Governance

### Core Invariant

Users can author visual grammar. Users cannot bypass safety, evidence, permissions, or runtime contracts.

### Schema Pipeline

```
YAML text
→ parse
→ schema validate
→ known handle validate
→ known source/target validate
→ capability validate
→ motion safety validate
→ audio safety validate
→ graph/Sigma contract validate
→ preview diff
→ preview layer
→ save only if allowed
```

### Forbidden Initially

- Raw JavaScript, shell commands, remote imports, arbitrary CSS
- Arbitrary CSS variable writes, executable assets, theme-defined commands
- Microphone, audio playback, audio file decoding, Web Audio input
- Uncontracted graph/Sigma mutation
- High-frequency flash/strobe, camera shake, risky pulse without safety gate
- Test weakening, fallback advisory acceptance

### Allowed Initially

- Schema-valid grammar files, static handle references
- Terminal validation, read-only handle documentation
- Preview-only overrides (later)
- Reduced-motion-safe transforms
- Metadata-only source references, synthetic signal fixtures

### Safety Gate Checklist

Every visual grammar route must answer:

```
What source event triggers this?
What signal/envelope is emitted?
What target selector is affected?
What handles are used?
What properties are mapped?
What is the reduced-motion fallback?
What forbidden capabilities are requested?
What contract authorizes this runtime behavior?
```

### Reduced Motion

Reduced Motion is master authority per [Motion Safety Contract](motion.safety.contract). Grammar presets must provide or inherit reduced-motion fallback behavior for any effect with motion, pulse, shimmer, glow transition, or intensity envelope.

Allowed fallbacks: `static-highlight` · `color-shift-only` · `badge-only` · `disable-pulse` · `outline-only`

### Permission Boundaries

Grammar files may declare requested capabilities, but capability validation must reject unsupported or uncontracted requests.

```yaml
permissions:
  audioCapture: false
  playback: false
  metadataOnly: true
```

### Preview vs Runtime

Initial grammar validation: terminal/read-only.
Future preview: reversible.
Runtime graph/Sigma or audio-reactive behavior: explicit promotion contracts only.

### Trust Model

Imported grammar/assets are not trusted by default.

Lifecycle: `candidate → quarantined → validated → accepted → active → deprecated/rejected`

---

*Frontmatter normalized v86a. Body content preserved as design-locked architecture. Connections added to motion safety, audio source, graph runtime boundary, and theme token compatibility contracts.*
