---
id: graph.edge.style.registry.contract
title: Edge Style Registry Contract
type: contract
status: accepted
version: v86e
cluster: slate
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [graph, edge, style, registry, contract, v86e]
---

# Edge Style Registry Contract

**Version**: v86e  
**Purpose**: Govern the registry of edge rendering style presets for graph visualization.

## Purpose

Declares named edge style presets (plasma, wire, ribbon) that graph renderers may apply.
Separates style declaration from rendering implementation. v86e lands contract + empty
registry; v91 implements edge plasma rendering.

## Allowed Behavior

- Entries registered via `register(entry)` after validation.
- `list()`, `getById()`, `filterByCategory(mode)` perform pure lookups.
- `subscribe(listener)` notifies on change.
- Dev probe `window.__lwEdgeStyleRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not mutate graph edges, Sigma state, or any rendering pipeline.
- Must not perform I/O or async operations.
- Must not write CSS variables or DOM.

## Schema

```typescript
interface EdgeStyleEntry {
  id: string;
  label: string;
  mode: "plasma" | "wire" | "ribbon";
  config: Record<string, unknown>;  // mode-specific configuration
}
```

## Evidence Required

- `npm run typecheck` passes with registry in place.
- v91: Playwright confirms edge style presets render correctly.

## Forbidden Boundaries

- No Sigma or graph mutations in v86e.
- No rendering implementation in v86e (v91+).
- No UI surface for edge styles in v86e.

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub at `src/graph/edges/edgeStyleRegistry.ts` with empty registry.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + empty registry stub.
- **v91**: Edge plasma rendering; seed style entries populated.
- **v91+**: Edge style selector UI surface.
