---
id: motion.animation.primitive.registry.contract
title: Animation Primitive Registry Contract
type: contract
status: accepted
version: v86e
cluster: violet
domain: motion
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [motion, animation, easing, registry, contract, v86e]
---

# Animation Primitive Registry Contract

**Version**: v86e  
**Purpose**: Govern the registry of reusable named animation and easing primitives.

## Purpose

Declares named animation primitives (easing curves, spring configs, keyframe sequences)
that motion consumers reference by id rather than hardcoding values. Separates primitive
declaration from animation execution. v86e lands contract + empty registry; v92/v93
implements.

## Allowed Behavior

- Entries registered via `register(entry)` after validation.
- `list()`, `getById()`, `filterByCategory(kind)` perform pure lookups.
- `subscribe(listener)` notifies on change.
- Dev probe `window.__lwAnimationPrimitiveRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not execute animations or trigger any visual motion.
- Must not interact with the DOM, CSS, or rendering pipeline.
- Must not perform I/O or async operations.
- Must not apply or schedule animation frames.

## Schema

```typescript
interface AnimationPrimitive {
  id: string;
  label: string;
  kind: "easing" | "spring" | "keyframe";
  config: Record<string, unknown>;  // kind-specific configuration
}
```

## Evidence Required

- `npm run typecheck` passes with registry in place.
- v92/v93: Playwright confirms animation primitives are consumed by motion consumers.

## Forbidden Boundaries

- No animation execution in v86e.
- No DOM or CSS writes.
- No UI surface in v86e (v92+).
- Consumers must respect Motion Safety registry; not enforced here.

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub at `src/motion/animationPrimitiveRegistry.ts` with empty registry.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + empty registry stub.
- **v92**: Seed primitives populated; motion consumers reference by id.
- **v93**: Animation primitive viewer UI surface.
