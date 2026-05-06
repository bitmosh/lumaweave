---
id: contract.audio.reactivity
title: Audio Reactivity Contract
type: contract
status: accepted
version: v61
domain: audio
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.motion.safety
governs:
  - src/audio/syntheticAudioSignal.ts
tags: [audio, reactivity, synthetic, signal, contract, accepted, v61]
---

# Audio Reactivity Contract

**Status:** Accepted — v61

---

## Purpose

Define the Audio Reactivity system that converts audio-derived signals into normalized, safety-gated visual intent. This is a contract-only pass — no visual reactivity is implemented here. v62 implements the Synthetic Audio Signal Preview.

---

## Signal Channels

```typescript
interface AudioSignal {
  rms: number;     // 0–1   root mean square amplitude
  bass: number;    // 0–1   low-frequency energy
  mid: number;     // 0–1   mid-frequency energy
  treble: number;  // 0–1   high-frequency energy
  beat: number;    // 0–1   beat detection confidence
  silence: number; // 0–1   silence detection confidence
  tempo: number;   // 60–200 BPM
}
```

All channels are normalized and clamped. Values are deterministic for synthetic signals.

---

## Signal Flow Architecture

```
Signal source (synthetic or future real)
→ normalization (clamp to defined range)
→ audio-reactive mapping registry (future v63)
→ motion safety gate (required before any visual output)
→ visual target adapter (future v65+)
→ visual behavior (future v65+)
```

For v61/v62: only source + normalization exist. No mapping, no gate runtime, no visual output.

---

## Synthetic Signal Presets (v62)

```
silence              All channels 0, tempo 60
lantern-pulse-demo   Low rms, moderate bass, slow tempo
plasma-loom-demo     Moderate rms, balanced channels, medium tempo
constellation-demo   High rms, strong bass, fast tempo
```

All values are static and deterministic — safe for Playwright testing.

---

## Real Audio Source Boundary

Forbidden until a separate explicit contract:
```
Microphone permission requests
Web Audio API usage
Audio file input/upload/drag-drop
Audio file analysis or decoding
Audio playback
Real-time audio processing
Beat detection algorithms
Frequency analysis algorithms
```

---

## Ladder

```
v59  Motion Safety Contract          ← prerequisite
v61  Audio Reactivity Contract       ← this
v62  Synthetic Audio Signal Preview
v63  Music Reactive Mapping Contract
v64  Passive Music Reactive Mapping Inventory
v65  Audio Source System Contract
v66  Passive Audio Source Registry
v67+ Real audio promotion (separate contract per source type)
```
