---
id: theme.typography.registry.contract
title: Typography Registry Contract
type: contract
status: accepted
version: v86e
cluster: violet
domain: theme
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
tags: [theme, typography, registry, contract, v86e]
---

# Typography Registry Contract

**Version**: v86e  
**Purpose**: Govern the mapping of semantic typography roles to font families.

## Purpose

Maps semantic roles (display, body, mono) to font families and fallback stacks.
Consumers read from this registry rather than hardcoding font family strings.
v86e seeds three entries; font loading is deferred to v87.

## Allowed Behavior

- Entries may be registered via `register(entry)` after validation.
- `list()` returns a stable copy of all registered entries.
- `getById(id)` and `filterByCategory(role)` perform pure lookups.
- `subscribe(listener)` notifies on change.
- Three seed entries ship with v86e: `display`, `body`, `mono`.
- Dev probe `window.__lwTypographyRegistry` may be exposed in DEV/PLAYWRIGHT mode.

## Forbidden Behavior

- Must not load fonts or inject `<link>` / `@font-face` rules.
- Must not write CSS variables or modify the DOM.
- Must not perform I/O or async operations.

## Schema

```typescript
interface TypographyEntry {
  role: string;           // e.g. "display", "body", "mono"
  fontFamily: string;     // e.g. "Space Grotesk"
  fallbackStack: string;  // full CSS font-family value with fallbacks
  axisIds?: string[];     // optional refs to fontAxisRegistry entries
}
```

## Seed Entries (v86e)

| role    | fontFamily     | fallbackStack                                    |
|---------|---------------|--------------------------------------------------|
| display | Space Grotesk  | "Space Grotesk", system-ui, sans-serif           |
| body    | IBM Plex Sans  | "IBM Plex Sans", system-ui, sans-serif           |
| mono    | IBM Plex Mono  | "IBM Plex Mono", ui-monospace, monospace         |

## Evidence Required

- `npm run typecheck` passes.
- v87: Playwright confirms registry returns 3+ seed entries and font loads correctly.

## Forbidden Boundaries

- No font loading in v86e.
- No CSS variable writes from registry.
- No UI surface for font roles in v86e (v87+).

## Acceptance Criteria

- Contract doc exists at this path.
- TS stub at `src/themes/typographyRegistry.ts` with 3 seed entries.
- `npm run typecheck` passes.

## Future Implementation Ladder

- **v86e**: Contract + stub with 3 seed entries (no font loading).
- **v87**: Font loading wired; `@font-face` injection authorized by separate contract.
- **v87+**: Typography consumers read from registry.
