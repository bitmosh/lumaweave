---
id: audio.source.system.contract
title: Audio Source System Contract
type: contract
status: accepted
version: v65
cluster: ember
domain: audio
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - audio.reactivity.contract
  - audio.music.reactive.mapping.contract
  - audio.universal.handle.routing
  - accessibility.motion.safety.contract
tags: [audio, source-system, contract, v65, permission, privacy, security]
---

# Audio Source System Contract

**Status:** Accepted — v65

---

## Purpose

Define the audio source architecture: the types of audio sources LumaWeave may eventually support, their permission models, privacy risks, and security constraints. v65 is the contract. v66 implements the passive read-only Audio Source Registry.

---

## Source Types

```
synthetic          Deterministic static signal — no permissions required
                   Status: active (v62)

local-file-metadata Audio file on local filesystem — metadata only (duration, format)
                   Permission: file picker (user action)
                   Privacy risk: low
                   Status: planned (v67)

local-file-decoded  Audio file on local filesystem — decoded signal
                   Permission: file picker + Web Audio API
                   Privacy risk: low-medium
                   Status: planned (v68)

microphone         Real-time audio via browser Web Audio API
                   Permission: explicit browser microphone permission
                   Privacy risk: high
                   Status: planned (v69+, requires explicit opt-in)

system-audio       OS audio output capture
                   Permission: OS-level permissions
                   Privacy risk: high
                   Status: future, governance required

streaming          Remote audio over network
                   Permission: network access
                   Privacy risk: high
                   Status: future, strong governance required

external-adapter   Third-party adapter
                   Permission: adapter-defined
                   Privacy risk: adapter-defined
                   Status: future, adapter contract required
```

---

## Registry Schema (v66)

```typescript
interface AudioSource {
  id: string;
  type: AudioSourceType;
  title: string;
  description: string;
  status: 'active' | 'planned' | 'forbidden';
  permissionRequired: string;
  privacyRisk: 'none' | 'low' | 'medium' | 'high';
  playback: boolean;          // always false in v65/v66
  decoding: boolean;          // always false in v65/v66
  visualOutputStatus: 'deferred'; // always deferred
}
```

7 seed entries in v66: one per source type above.

---

## Forbidden in v65/v66

```
Microphone permission requests
Web Audio API input usage
Audio file upload or decoding
Audio playback
Real-time signal processing
Any visual reactivity from audio sources
Graph/Sigma mutation
```

Each new source type requires its own governance pass before implementation.

---

## Promotion Path

```
v65  Audio Source System Contract (this)
v66  Passive Audio Source Registry (read-only, 7 sources)
v67  Local File Metadata Preview (file picker, metadata only)
v68  Local File Decoded Signal (Web Audio decodeAudioData)
v69  Microphone Input (explicit permission, safety gate required)
v70+ System audio / streaming / external adapter (strong governance)
```
