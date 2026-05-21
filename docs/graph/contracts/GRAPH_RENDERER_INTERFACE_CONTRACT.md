---
id: graph.renderer.interface.contract
title: Graph Renderer Interface Contract
type: contract
status: accepted
version: v86e
cluster: slate
domain: graph
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [graph, renderer, interface, contract, v86e, webgpu, sigma]
---

# Graph Renderer Interface Contract

**Version**: v86e  
**Purpose**: Define the abstract renderer interface that current (Sigma2d) and future
(Sigma WebGPU, Three.js companion) implementations honor.

## Purpose

Establishes a shared interface so that the graph layer can swap rendering backends
without changing consumer code. The current implementation (Sigma2d) satisfies this
interface implicitly; v94 introduces a second implementation (WebGPU).

## Allowed Behavior

- `mount(container, graph)` attaches the renderer to an HTML container.
- `unmount()` detaches and cleans up all renderer resources.
- `refresh()` redraws the graph without changing state.
- `getCamera()` returns the current camera state as a plain object.
- `setCamera(camera)` applies a camera state.
- Implementations may add renderer-specific methods beyond this interface.

## Forbidden Behavior

- `mount` must not be called twice without an intervening `unmount`.
- `getCamera` must not mutate internal state.
- `setCamera` must not perform async operations or schedule deferred work.
- Implementations must not leak event listeners after `unmount`.
- Must not depend on React lifecycle — interface is renderer-agnostic.

## Schema

```typescript
interface RendererCamera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

interface GraphRenderer {
  mount: (container: HTMLElement, graph: any) => void;
  unmount: () => void;
  refresh: () => void;
  getCamera: () => RendererCamera;
  setCamera: (camera: RendererCamera) => void;
}
```

## Evidence Required

- `npm run typecheck` passes with interface in place.
- v94: Second renderer implementation satisfies the interface; Playwright tests confirm
  behavior parity between Sigma2d and the new backend.

## Forbidden Boundaries

- No second renderer implementation in v86e.
- Current Sigma2d implementation need not be refactored to explicitly implement this
  interface in v86e; refactor authorized in v94 WebGPU pass.
- No WebGPU or Three.js imports in v86e.

## Acceptance Criteria

- Contract doc exists at this path.
- TS interface stub at `src/graph/rendering/graphRendererInterface.ts`.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Interface contract + TS stub. Sigma2d satisfies it implicitly.
- **v94**: Sigma2d explicitly implements `GraphRenderer`; WebGPU renderer added.
- **v94+**: Renderer switching mechanism via `graphRendererInterface`.
