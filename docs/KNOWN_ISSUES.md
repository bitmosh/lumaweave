---
id: system.lumaweave.known-issues
title: LumaWeave Known Issues
type: issue-register
status: current
domain: overview
cluster: crimson
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - system.lumaweave.current-status
  - system.lumaweave.roadmap
tags: [issues, tests, release]
---

# LumaWeave Known Issues

Only issues with current code, test, or CI evidence are listed here. Historical bug reports were retired when their original paths or symptoms no longer matched the implementation.

## Release and test automation

### End-to-end tests are not in CI

GitHub Actions runs CSS linting and TypeScript typechecking, not Playwright. Earlier attempts encountered Vite/preview cold-start and shard timeout behavior and were reverted.

Evidence: `.github/workflows/ci.yml`.

### Some Playwright coverage remains quarantined

The suite contains explicit `test.fixme`/`test.skip` coverage, including camera persistence, Sigma source-change identity, settings resize, some selection/apply cases, engine rotation integration, and two GWells drag cases. These should be treated as test debt, not passing coverage.

Evidence: `tests/e2e/`.

## GWells

### Default drag drift-back remains quarantined

The C9.0 test for a dragged unpinned node drifting back toward its seed is marked `test.fixme` because it has been timing-sensitive under suite load.

Evidence: `tests/e2e/gwells-physics.spec.ts`.

### Ctrl-drag NaN regression test remains quarantined

Permanent finite-value guards exist, but the C9.5 browser regression case is still marked `test.fixme`.

Evidence: `tests/e2e/gwells-physics.spec.ts`.

## Test harness

### Contract-registry previous-check timeout

The `qa-check-previous` path has a recorded timeout under the full contract-registry workload. Reproduce before changing product code; the likely boundary is helper/test orchestration.

Evidence: `tests/e2e/contract-registry.spec.ts` and `docs/agent/KNOWN_SHARP_EDGES.md`.

### Edge-plasma overlay timing coverage is skipped

One plasma-overlay test is skipped because its after-render/edge-availability setup is timing-sensitive. The custom edge program itself is active; the skipped test concerns overlay timing evidence.

Evidence: `tests/e2e/edge-plasma-overlay.spec.ts`.

## Documentation and dependency hygiene

- Canonical documents still need ongoing code reconciliation as architecture changes.
- Three.js, React Three Fiber, and Drei are installed but unused by runtime source.
- Theme token governance has validation helpers and tests but is not asserted during application boot.

These are explicit cleanup items, not shipped 3D or boot-governance features.
