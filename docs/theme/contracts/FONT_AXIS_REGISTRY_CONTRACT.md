---
id: theme.font.axis.registry.contract
title: Font Axis Registry Contract
type: contract
status: accepted
version: v86e
cluster: violet
domain: theme
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [theme, typography, font-axis, registry, contract, v86e]
---

# Font Axis Registry Contract

**Version**: v86e  
**Purpose**: Govern the registry of variable font axes available for the typography playground.

## Purpose

Declares variable font axes so that typography consumers can enumerate axis ranges,
defaults, and steps without hardcoding per-font knowledge. The registry is populated
in v87 when font loading is implemented; v86e lands the contract and empty stub only.

## Allowed Behavior

- Entries may be registered via `register(entry)` after validation.
- `list()` returns a stable copy of all registered axes.
- `getById(id)` performs a simple equality lookup by `id`.
- `filterByCategory(fontFamily)` returns all axes for a given font family.
- `subscribe(listener)` notifies listeners synchronously when entries change.
- Dev probe `window.__lwFontAxisRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not load fonts or trigger any font-loading side effects.
- Must not modify the DOM, CSS variables, or any global state outside the registry.
- Must not perform I/O, network requests, or async operations.
- Must not expose mutable references to the internal entries array.

## Schema

```typescript
interface FontAxisEntry {
  id: string;           // e.g. "space-grotesk-wght"
  fontFamily: string;   // e.g. "Space Grotesk"
  axis: string;         // CSS variation axis tag (e.g. "wght", "opsz")
  axisName: string;     // Human-readable name (e.g. "Weight")
  min: number;
  max: number;
  default: number;
  step?: number;
}
```

## Evidence Required

- `npm run typecheck` passes with registry in place.
- v87: Playwright test confirms `list()` returns seed axes after font-loading pass.

## Forbidden Boundaries

- No font loading in v86e.
- No CSS variable writes.
- No UI surface for axes in v86e (v87+).

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub exists at `src/themes/fontAxisRegistry.ts` with empty registry.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + empty registry stub.
- **v87**: Populate with Space Grotesk, IBM Plex Sans, IBM Plex Mono axes.
- **v87+**: Typography playground UI consumes registry.
