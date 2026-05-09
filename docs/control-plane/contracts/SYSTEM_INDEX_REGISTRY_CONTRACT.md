---
id: contract.system.index.registry
title: System Index Registry Contract
type: contract
status: accepted
version: v72a
domain: control-plane
subdomain: contracts
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/control-plane/system-index/systemIndexRegistry.ts
  - src/control-plane/system-index/SystemIndexPanel.tsx
  - scripts/validate-system-index.mjs
tested_by:
  - tests/e2e/system-index.spec.ts
tags:
  - system
  - index
  - registry
  - contract
  - accepted
  - v72a
---

# System Index Registry Contract

**Status:** Accepted — v72a

---

## Purpose

Define a canonical registry of all LumaWeave/Lattica control-plane systems with their status, lifecycle, boundaries, and evidence surfaces. The System Index is LumaWeave's self-referential governance layer — the platform tracking its own systems.

---

## Entry Schema (16 fields)

```typescript
interface SystemIndexEntry {
  id: string;              // stable dot-path: "system.index.registry"
  title: string;
  category: SystemCategory;
  kind: SystemKind;
  status: SystemStatus;    // current | future-docs-only | paused | archived
  lifecycle: Lifecycle;    // accepted | pending | concept | deprecated
  totalEntries?: number;
  futureDocsOnly?: number;
  forbiddenBoundaries?: number;
  source?: string;         // src file path
  tests?: string;          // test file path
  validator?: string;      // validator script path
  qaKey?: string;          // active QA key
  description: string;
  relationships?: SystemRelationship[];
  notes?: string;
}
```

---

## 10 Categories

```
QA / Governance          Graph / Sigma Boundary
Theme / Token System     Motion Safety
Audio / Signal Systems   Source Adapter / Future Architecture
Visual Grammar / Custom  Arena / Simulation Future
Evidence / Traceability  Developer Tooling
```

---

## 10 Kinds

```
contract    registry    validator    policy     protocol
panel       fixture     concept      adapter    tool
```

---

## 8 Lifecycle Statuses

```
accepted    pending    paused     concept
deprecated  planned    docs-only  archived
```

---

## Initial Seeded Entries (v72b — 16 entries)

```
system.index.registry
contract.graph.runtime.boundary
contract.first.graph.mutation
registry.graph.view.element
contract.graph.visual.theme.mapping
contract.graph.theme.application
contract.graph.theme.runtime.application
contract.graph.theme.token.value.preview
contract.graph.theme.token.value.application
contract.motion.safety
registry.motion.safety
contract.audio.reactivity
signal.synthetic.audio
contract.music.reactive.mapping
registry.music.reactive.mapping
registry.audio.source
```

---

## Validators

```
scripts/validate-system-index.mjs    → validates registry against contract
scripts/validate-control-plane-modes.mjs → validates mode registry (v73c)
```

Both use case-insensitive matching for string fields and substring matching for prose fields.

---

## Forbidden

- Mutating system index entries at runtime
- Adding entries that aren't accepted contracts/registries/validators
- Panel controls that edit the registry (read-only only)
- Removing entries without archiving them first
