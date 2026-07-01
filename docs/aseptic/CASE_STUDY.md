---
id: methodology.aseptic.case-study
title: Aseptic Change-Control Case Study
type: case-study
status: complete
domain: process
cluster: slate
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
tags: [change-control, blast-radius, verification]
---

# Aseptic Change-Control Case Study

The Aseptic documents introduced a useful discipline: make the expected blast radius explicit before changing a dense subsystem, then reconcile evidence and debt afterward. This page preserves that method without retaining a report per pass.

## Method

1. State the intended files and behavioral boundary.
2. Identify coupled registries, settings migrations, runtime consumers, tests, docs, and generated artifacts.
3. Record invariants that must not change.
4. Make one reviewable change.
5. Run targeted checks before broad checks.
6. Compare the actual touched surface with the predicted blast radius.
7. Classify leftovers as defect, technical debt, polish debt, or future scope.
8. Update living architecture/status documents only when the underlying fact changed.

## GWells example

The GWells polish work used this approach effectively:

- Structural classification was added before changing legacy well assignment.
- Legacy radial and parallel behavior remained explicit invariants.
- Runtime lifecycle changes added scheduler-driven/headless evidence before UI expansion.
- Performance work began with benchmark fixtures and timing buckets.
- Interaction indexing followed measured pair-scanning cost.
- Documentation distinguished the current dialect engine from the future profile architecture.

The main correction learned from the pass reports is that blast-radius documents should be temporary evidence, not permanent public architecture. Their durable value is the method and the verified design decisions.

## Practical template

```txt
Change:
Intended files:
Runtime consumers:
Persistent state/migrations:
Generated artifacts:
Invariants:
Targeted validation:
Broad validation:
Observed deviation:
Remaining risk:
```
