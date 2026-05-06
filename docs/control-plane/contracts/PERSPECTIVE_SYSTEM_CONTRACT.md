---
id: contract.perspective.system
title: Perspective System Contract
type: contract
status: accepted
version: v38
domain: control-plane
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/control-plane/perspectives/perspectiveRegistry.ts
tags: [perspective, system, contract, accepted, v38]
---

# Perspective System Contract

**Status:** Accepted — v38

Defines the governance for LumaWeave's Perspective System — a registry of named workspace perspectives (view configurations) that can be recalled or switched. The system is read-only metadata in v38 — no perspective save/load/switch is implemented without a storage contract.

## Core Rules
- Perspectives are registered in `perspectiveRegistry.ts` as static TypeScript objects
- Each perspective: `{ id, label, description, layout, panels, status }`
- Perspective switching requires a storage contract (not yet contracted)
- Registry is passive/read-only — no runtime save/load behavior
- Playwright proves perspective registry renders correctly

## Forbidden
- Implementing perspective save/load without a storage contract
- Silently switching perspective state
- Auto-applying perspective on launch without explicit user action
