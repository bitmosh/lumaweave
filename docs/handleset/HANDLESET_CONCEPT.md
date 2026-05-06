---
id: handleset.concept
title: Handleset Concept
type: manual
status: accepted
version: v73c
domain: handleset
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/control-plane/handles/handleset.registry.ts
  - src/control-plane/contracts/controlSurfaceContract.registry.ts
tags: [handleset, concept, controls, handles, active, planned, accepted]
---

# Handleset Concept

---

## What a Handle Is

A **handle** is a stable, addressable identifier for a control or UI interaction in LumaWeave. It connects:
- A user-visible control or UI action
- The settings key that persists its state
- The runtime target it affects
- The QA coverage that proves it works

Handles are how the system tracks "every control has a known state, a known target, and a known proof."

---

## Handle Path Format

```
{category}.{name}
appearance.theme
appearance.reduceMotion
appearance.glitterEnabled
graph.labelMode
graph.edgeLabelMode
layout.leftRailMode
missionControl.enabled
physics.nodeSize
```

---

## Handle Status Values

```
active    Control is wired and functional in current build
partial   Control exists but is not fully wired (some behavior missing)
planned   Documented but not yet implemented
future    Far future — no implementation planned yet
```

---

## Registry Files

**Control Surface Contract Registry** (new canonical location):
```
src/control-plane/contracts/controlSurfaceContract.registry.ts
```
Full TypeScript typed entries with runtime bindings, QA references, and Playwright coverage.

**Legacy Handleset Registry** (being phased out):
```
src/control-plane/handles/handleset.registry.ts
```
Being superseded by the control surface contract registry.

---

## Handle Documentation Files

```
ACTIVE_HANDLES.md           Controls that visibly affect runtime behavior
PARTIAL_HANDLES.md          Controls that exist but have gaps
PLANNED_HANDLES.md          Controls documented but not implemented
FUTURE_VISUAL_HANDLES.md    Future handle taxonomy for visual effects
```

---

## No Dead Controls Rule

Every active-appearing control in the UI must:
1. Have a wired action (not be a no-op)
2. Have a registered handle in the control surface contract registry
3. Have Playwright coverage proving it works
4. Have a stable `data-testid` attribute for test targeting

Placeholder controls must be visually distinct (disabled, grayed, "coming soon" badge).
