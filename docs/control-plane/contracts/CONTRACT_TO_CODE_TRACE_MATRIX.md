---
id: matrix.contract.to.code.trace
title: Contract-to-Code Trace Matrix
type: registry
status: accepted
version: v71a
domain: control-plane
subdomain: contracts
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tested_by:
  - tests/e2e/contract-registry.spec.ts
tags:
  - contract
  - code
  - trace
  - matrix
  - traceability
  - accepted
  - v71a
---

# Contract-to-Code Trace Matrix

**Status:** Accepted — v71a (matrix) + v71b (validator)

---

## Purpose

Provide a machine-readable traceability layer that links every accepted contract to:
- The source file(s) that implement it
- The test file(s) that prove it
- The validator script(s) that enforce it
- The QA key that governs it

The matrix ensures no contract is "floating" without evidence, and no source file is untraceable to its governing contract.

---

## Matrix Entry Schema

```typescript
interface TraceMatrixEntry {
  contractId: string;         // dot-path contract ID
  contractDoc: string;        // docs path to contract file
  sourceFiles: string[];      // src/ implementation files
  testFiles: string[];        // tests/e2e/ spec files
  validatorScripts: string[]; // scripts/ validator files
  qaKey: string;              // active QA key at acceptance
  status: 'active' | 'paused' | 'future-docs-only';
}
```

---

## Validator (v71b)

```
scripts/validate-contract-trace.mjs

Checks:
- Every matrix entry references files that exist on disk
- No entry has empty sourceFiles for an 'active' contract
- No entry has empty testFiles for an 'active' contract
- Validator file paths resolve correctly
- QA key format is valid

Exits: 0 = pass, 1 = fail
```

---

## Key Entries (Representative Sample)

```
contract.graph.runtime.boundary
  source: src/graph/graphViewElementRegistry.ts
  tests:  tests/e2e/graph-visual-inventory.spec.ts
  qa:     v45

contract.motion.safety
  source: src/accessibility/motionSafetyRegistry.ts
  tests:  tests/e2e/graph-visual-inventory.spec.ts
  qa:     v59

contract.audio.reactivity
  source: src/audio/syntheticAudioSignal.ts
  tests:  tests/e2e/graph-visual-inventory.spec.ts
  qa:     v61

contract.system.index.registry
  source: src/control-plane/system-index/systemIndexRegistry.ts
  validator: scripts/validate-system-index.mjs
  tests:  tests/e2e/system-index.spec.ts
  qa:     v72a

contract.human.evidence.debug.mode
  source: src/control-plane/modes/controlPlaneModeRegistry.ts
  validator: scripts/validate-control-plane-modes.mjs
  tests:  tests/e2e/system-index.spec.ts
  qa:     v73a
```

---

## Rules

- Every new accepted contract must have a matrix entry
- Entries are updated when source files move or tests are added
- The validator script runs as part of the QA bundle
- `contract-registry.spec.ts` tests that key entries are present and correct
- Matrix entries for future/docs-only contracts have empty sourceFiles (expected)
