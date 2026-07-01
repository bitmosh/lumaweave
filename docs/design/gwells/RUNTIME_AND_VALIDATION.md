---
id: design.gwells.runtime-validation
title: GWells Runtime and Validation
type: design
status: concept
domain: physics
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - domain.physics.gwells
  - design.gwells.profiles-controls
  - design.gwells.layouts
tags: [gwells, runtime, validation, benchmarks]
---

# GWells Runtime and Validation

This document consolidates runtime-safety and validation requirements. Current lifecycle behavior is identified separately from future requirements.

## Implemented runtime contract

`applyDialect()` returns a controller with:

- `pause()`, `resume()`, and `stop()`.
- Manual `step()`.
- Injectable scheduling for headless control.
- Runtime-state inspection.
- Debug and error callbacks.
- Live seed, well, and interaction overrides.
- Pin application.
- Cache rebuild diagnostics.

The renderer must stop an old controller before replacing it during a dialect change.

## Runtime invariants

- At most one scheduled loop per controller.
- Pause does not integrate physics.
- Resume does not create duplicate loops.
- Stop is terminal for that controller.
- Manual steps remain deterministic under a test scheduler.
- Non-finite force, velocity, or position values never propagate into Graphology.
- Applying seed parameters rebuilds seed-derived ideal distances.
- Changing overrides does not silently clear pins.
- Unknown registry references fail clearly.

## Future runtime work

- Explicit timestep handling instead of display-refresh-dependent integration.
- Convergence/settled detection with documented thresholds.
- Reheat semantics.
- Spatial acceleration only after benchmark evidence justifies it.
- Full 3D force integration.
- Profile-apply diagnostics and undo/reset boundaries.
- Public registration only after lifecycle and validation rules are stable.

## Validation layers

### Static registry validation

Check required files, helper exports, entry shape, status vocabulary, one default dialect, cross-references, and standalone import discipline.

### Deterministic headless tests

Use injected/manual scheduling for:

- Pause/resume/stop transitions.
- Duplicate-loop prevention.
- Dialect replacement.
- Cache rebuilds.
- Pin preservation.
- Override resolution.
- NaN/Infinity guards.

### Seeder matrix

Minimum graph cases:

- Empty and singleton.
- Simple tree.
- Wide-root hierarchy.
- Deep hierarchy.
- Generic no-spine graph.
- Disconnected/orphan-heavy graph.
- Knowledge-vault shape.
- Imported-position graph.
- Large synthetic graph.

Each case checks finite coverage, determinism, bounds, branch decisions, and pin behavior.

### Legacy compatibility

Radial-backbone and parallel-spines remain protected throughout profile work. Compare structural outcomes and invariants rather than pixel-perfect coordinates unless exact geometry is part of the contract.

### Benchmarks

Track:

- Seed time.
- Step time and timing buckets.
- Node/edge/interaction counts.
- Pair-distance cache size.
- Moved-node count and velocity summaries.
- Position bounds.

The committed baseline changes only through an intentional review. Visual improvements must not hide major step-time regressions.

### Browser integration

Targeted Playwright tests prove the bridge between settings, Sigma, controller lifecycle, pins, and visible graph behavior. Browser tests complement rather than replace headless engine tests.

## Failure severity

- **Blocker:** invalid coordinates, broken legacy dialect, duplicate loop, crash, or corrupted pins.
- **High:** severe layout collapse, stale cache, incorrect lifecycle state, or large benchmark regression.
- **Medium:** poor recommendation, confusing diagnostics, or isolated visual instability.
- **Low:** copy, presentation, or non-blocking tuning polish.

## Release gate for profile work

Profile architecture is ready to promote only when:

1. Legacy dialect behavior remains available.
2. Profile resolution is deterministic and explainable.
3. Invalid entries fail validation.
4. Apply/reset semantics preserve documented state.
5. Universal Balanced works on no-spine and disconnected fixtures.
6. Benchmarks and targeted browser tests pass.
