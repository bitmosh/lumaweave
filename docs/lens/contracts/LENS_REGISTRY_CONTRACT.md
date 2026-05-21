---
id: graph.lens.registry.contract
title: Lens Registry Contract
type: contract
status: accepted
version: v86e
cluster: slate
domain: lens
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [graph, lens, layout, registry, contract, v86e]
---

# Lens Registry Contract

**Version**: v86e  
**Purpose**: Govern the registry of graph viewing lens presets (layout + rendering modes).

## Purpose

Declares named lens presets that combine a layout function signature, suggested Sigma
settings, and compatible physics dialects. Consumers switch lenses to change how the
graph is laid out and rendered. v86e lands contract + empty registry; v93 implements.

## Allowed Behavior

- Entries registered via `register(entry)` after validation.
- `list()`, `getById()`, `filterByCategory(compatibleDialect)` perform pure lookups.
- `subscribe(listener)` notifies on change.
- Dev probe `window.__lwLensRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not call layout functions or modify graph positions.
- Must not mutate Sigma state, camera, or renderer.
- Must not perform I/O or async operations.

## Schema

```typescript
interface LensEntry {
  id: string;
  label: string;
  layoutFn: string;               // name reference to a layout function (not the fn itself)
  suggestedSettings: Record<string, unknown>;
  compatibleDialects: string[];   // ids from physicsDialectRegistry
}
```

## Evidence Required

- `npm run typecheck` passes with registry in place.
- v93: Playwright confirms lens switching changes graph layout.

## Forbidden Boundaries

- No layout execution in v86e.
- No Sigma or graph mutations in v86e.
- No UI surface for lens selection in v86e (v93+).

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub at `src/lens/lensRegistry.ts` with empty registry.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + empty registry stub.
- **v93**: Lens presets populated; layout switching implemented.
- **v93+**: Lens selector UI surface.
