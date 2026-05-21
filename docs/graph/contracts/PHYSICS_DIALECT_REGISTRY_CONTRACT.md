---
id: graph.physics.dialect.registry.contract
title: Physics Dialect Registry Contract
type: contract
status: accepted
version: v86e
cluster: slate
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [graph, physics, dialect, registry, contract, v86e]
---

# Physics Dialect Registry Contract

**Version**: v86e  
**Purpose**: Govern the registry of named force-model dialects that drive graph layout.

## Purpose

Declares named physics force models (e.g., gwells, repulsion-spring, hierarchical) with
their parameter schemas and compatible lenses. Separates physics model declaration from
force-engine execution. v86e lands contract + empty registry; v93 implements.

## Allowed Behavior

- Entries registered via `register(entry)` after validation.
- `list()`, `getById()`, `filterByCategory(forceModel)` perform pure lookups.
- `subscribe(listener)` notifies on change.
- Dev probe `window.__lwPhysicsDialectRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not execute force calculations or mutate node positions.
- Must not interact with Sigma, the graph, or any rendering pipeline.
- Must not perform I/O or async operations.

## Schema

```typescript
interface PhysicsDialect {
  id: string;
  label: string;
  forceModel: string;             // e.g. "gwells", "repulsion-spring", "hierarchical"
  paramSchema: Record<string, unknown>;
  compatibleWithLenses: string[]; // ids from lensRegistry
  defaultSettings: Record<string, unknown>;
}
```

## Evidence Required

- `npm run typecheck` passes with registry in place.
- v93: Playwright confirms dialect switching changes physics behavior.

## Forbidden Boundaries

- No force execution in v86e.
- No mutation of node positions or graph state.
- No UI surface in v86e (v93+).

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub at `src/graph/physics/physicsDialectRegistry.ts` with empty registry.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + empty registry stub.
- **v93**: Physics dialects populated; switching implemented.
- **v93+**: Physics dialect selector UI.
