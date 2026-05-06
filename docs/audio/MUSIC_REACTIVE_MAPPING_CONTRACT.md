---
id: contract.music.reactive.mapping
title: Music Reactive Mapping Contract
type: contract
status: accepted
version: v63
domain: audio
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - contract.audio.reactivity
  - contract.motion.safety
governs:
  - src/audio/musicReactiveMappingRegistry.ts
tags: [music, reactive, mapping, contract, accepted, v63]
---

# Music Reactive Mapping Contract

**Status:** Accepted — v63

---

## Purpose

Define the registry that maps normalized audio signal channels to potential graph visual targets. The mapping registry is passive and read-only in v63/v64 — it documents potential relationships without executing any visual behavior.

---

## Mapping Schema

```typescript
interface MusicReactiveMapping {
  id: string;
  label: string;
  channel: AudioChannel;          // which signal channel drives this
  targetHandle: string;           // e.g. "graph.node.glow"
  motionSafetyClass: RiskLevel;  // must match motionSafetyRegistry entry
  reducedMotionBehavior: string;  // allow | soften | disable
  epilepsyRisk: string;           // none | possible | high
  status: 'active' | 'planned' | 'forbidden';
  visualOutputStatus: 'deferred'; // always "deferred" until v65+
}
```

---

## Key Rules

- All mappings reference Motion Safety registry entries — no unclassified effects
- `visualOutputStatus` is always `"deferred"` — no visual behavior executes from this registry
- Mappings with `status: "forbidden"` document why the effect is blocked
- Registry is read-only TypeScript — no runtime mutation
- Playwright proves all mapping rows render in the evidence panel

---

## Motion Safety Gate Requirement

Hard rule: No music-reactive visual feature may ship unless registered in `motionSafetyRegistry.ts`.

Mappings with:
- `epilepsyRisk: "possible"` → must be softened under reduce motion
- `epilepsyRisk: "high"` → forbidden until safety gate is implemented, disable always
- `motionSafetyClass: "moderate"` → disabled under reduce motion
- `motionSafetyClass: "high"` → requires explicit user opt-in

---

## Forbidden in v63/v64

```
Visual reactivity execution of any kind
Graph/Sigma mutation from mappings
Node/edge/canvas styling from mappings
Audio input (microphone, file, Web Audio)
CSS variable writes from mappings
Animation or pulse effects
```

v65+ (Audio Source System) enables source types. Visual reactivity requires a separate contract after v65.
