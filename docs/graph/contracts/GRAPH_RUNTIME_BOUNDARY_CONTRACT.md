---
id: contract.graph.runtime.boundary
title: Graph Runtime Boundary Contract
type: contract
status: accepted
version: v45
domain: graph
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [graph, sigma, runtime, boundary, mutation, contract, accepted]
---

# Graph Runtime Boundary Contract

**Status:** Accepted — v45
**Type:** Docs-only governance before any runtime graph/Sigma mutation

---

## Purpose

Define the first permitted runtime graph mutation boundary. Establishes what constitutes runtime graph mutation, what passive observation is allowed, and what remains forbidden until explicitly promoted via a new contract.

---

## Zone Model

```
Zone 1 — Passive Observation (v46)
  Read-only probes observing app-visible graph state without mutation.
  Safe to implement.

Zone 2 — Contract Definition (v45 — this contract)
  Docs-only governance. No implementation.

Zone 3 — Mutation Execution (v47+)
  Forbidden until explicitly promoted by a new contract.
```

---

## Definitions

**Runtime Graph Mutation:** Any change that alters Sigma renderer behavior, graph physics, layout, camera, filtering, node/edge rendering, or graph interaction behavior.

**Passive Graph Probe:** A non-mutating readout that observes app-visible graph container/evidence state without changing graph/Sigma behavior.

---

## Mutation Categories

### Passive Observation — Allowed in v46
- Reporting graph frame mounted status
- Reporting graph surface evidence selector presence
- Reporting registry entry counts
- Reporting runtime mutation status as locked/deferred
- Must be clearly labeled passive/read-only

### Theme Mapping — Forbidden until v47+ with explicit contract
- Node/edge color mapping via theme system
- Background color mapping
- Label styling changes

### Control Surface — Forbidden until v47+ with explicit contract
- Physics sliders, camera controls, filter toggles, layout controls

### Physics Change — Forbidden until v47+ with explicit contract
- Node size, link distance, repel force, gravity parameters

### Sigma Internals — Permanently forbidden without explicit promotion contract
- Direct Sigma renderer API calls
- Canvas mutation
- WebGL shader modifications

---

## Forbidden Boundaries (Absolute)

```
No Sigma/renderer mutation
No physics parameter changes
No camera/filter behavior changes
No node/edge/canvas styling
No storage/persistence for graph state
No new hotkeys/listeners
No command execution
No skipped tests
No manual DevTools steps as acceptance evidence
```

---

## Promotion Path

```
v45  Contract Definition (this doc)
  ↓
v46  Passive Graph Runtime Probe
  ↓
v47+ First Promoted Runtime Mutation (requires new explicit contract)
```

Each step requires: contract accepted → implementation → Playwright evidence → acceptance.

---

## Relationship to Other Contracts

- Builds on: Graph View Element Registry Contract (v40)
- Followed by: First Graph Runtime Mutation Contract (v47)
- Governs: All future Sigma/graph mutation work
- Does not affect: Theme token governance (separate ladder)
