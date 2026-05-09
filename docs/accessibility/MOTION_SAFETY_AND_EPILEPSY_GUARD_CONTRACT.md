---
id: contract.motion.safety
title: Motion Safety and Epilepsy Guard Contract
type: contract
status: accepted
version: v59
domain: accessibility
cluster: crimson
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/accessibility/motionSafetyRegistry.ts
tags:
  - motion
  - safety
  - epilepsy
  - guard
  - accessibility
  - contract
  - accepted
  - v59
---

# Motion Safety and Epilepsy Guard Contract

**Status:** Accepted — v59
**Authority:** Master safety authority over all visual reactivity and animation

---

## Purpose

Define the Motion Safety system that classifies, gates, softens, or disables animation and reactive visual effects based on reduce-motion preference and epilepsy risk policy. Every audio-reactive, physics-reactive, or animated visual effect must pass through this system before it can be shipped.

---

## Risk Classification

```
safe      No motion risk. Allowed under all conditions.
          Example: static readouts, slow color transitions (>2 seconds)
          Reduced motion behavior: allow
          Epilepsy risk: none

low       Minor motion risk. Allowed by default, softened under reduce motion.
          Example: slow border glow (>1 second), gentle breathing animation (>3s)
          Reduced motion behavior: soften (disable animation, keep static state)
          Epilepsy risk: possible

moderate  Significant motion risk. Disabled by default under reduce motion.
          Example: pulse effects, node bounce on event
          Reduced motion behavior: disable
          Epilepsy risk: possible

high      Severe motion or epilepsy risk. Requires explicit user opt-in.
          Example: beat-synced flicker, rapid color changes, camera shake
          Reduced motion behavior: disable
          Epilepsy risk: high
```

---

## Reduced Motion Authority

Reduce motion preference is the **master authority** over all visual reactivity.

When reduce motion is enabled:
```
safe effects      → allow
low effects       → soften (static state, no animation)
moderate effects  → disable completely
high effects      → disable completely
```

No effect may bypass reduce motion for aesthetic reasons. No exceptions.

---

## Epilepsy Risk — Forbidden Absolutely

The following are forbidden regardless of reduce motion setting or user opt-in:
```
Strobe effects (rapid on/off flashing)
Rapid flashing at >3 Hz
Camera shake
Full-screen pulse
Rapid contrast inversion
Beat-synced high-frequency flicker
```

---

## Motion Safety Gate

Every audio-reactive or animated effect must pass through the gate:

```
1. Check effect's risk classification in motionSafetyRegistry.ts
2. Check user's reduce-motion preference
3. Check epilepsy risk classification
4. Gate decision:
     reduce-motion + disable behavior → block
     reduce-motion + soften behavior  → apply softened version
     epilepsy risk high + no opt-in   → block
     otherwise                        → allow
```

No visual reactivity may execute without this check.

---

## Registry Structure

```typescript
// src/accessibility/motionSafetyRegistry.ts
interface MotionSafetyEntry {
  effectId: string;
  description: string;
  riskLevel: 'safe' | 'low' | 'moderate' | 'high';
  reducedMotionBehavior: 'allow' | 'soften' | 'disable';
  epilepsyRisk: 'none' | 'possible' | 'high';
  requiresOptIn: boolean;
  status: 'active' | 'planned' | 'forbidden';
}
```

---

## Relationship to Audio Reactivity

Every audio-reactive handle mapping must have a registered Motion Safety entry. No audio-reactive visual effect ships without:
1. A Motion Safety entry for the effect
2. A reduced-motion behavior defined
3. An epilepsy risk classification

See `docs/audio/AUDIO_REACTIVITY_CONTRACT.md` for the audio side of this relationship.

---

## Forbidden in v59/v60

```
Actual animation or audio input
Music-reactive visuals
Graph/Sigma mutation
Node/edge/canvas styling
CSS variable writes
Theme preset mutation
Storage/persistence of motion settings (beyond theme store)
Any runtime motion effect
```

v59 is the contract. v60 is the static registry. Runtime effects require v61+.
