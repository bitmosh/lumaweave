---
id: system.lumaweave.roadmap
title: LumaWeave Roadmap
type: roadmap
status: current
domain: overview
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - system.lumaweave.current-status
  - domain.physics.gwells
  - domain.source.adapter
  - domain.deferred.post.v1.vision
tags: [roadmap, release, gwells, adapters]
---

# LumaWeave Roadmap

This roadmap describes direction, not shipped capability. [Current Status](CURRENT_STATUS.md) is the authority for what works today.

## Current objective: a credible pre-1.0 release

The immediate work is consolidation and release confidence:

1. Keep public documentation aligned with code.
2. Finish source-adapter onboarding, validation, and error-state UX.
3. Establish a reliable end-to-end CI strategy instead of relying only on local Playwright runs.
4. Complete dependency, security, cold-install, and release-build checks.
5. Polish GWells without replacing its current public dialect path.

## Near term

### Source adapters

- Finish the current adapter UX pass: pre-load validation, actionable errors, clear registered-versus-candidate presentation, and first-run guidance.
- Exercise registered adapters against representative real inputs in addition to fixtures.
- Add adapters incrementally. A catalog entry is not promoted until it has a loader, configuration UI, bounded input behavior, and test evidence.
- Highest-value future sources are codebase structure, OpenAPI, database schemas, and website maps.

### GWells v0.1.x

- Preserve radial-backbone and parallel-spines behavior.
- Improve seed coherence for larger, disconnected, and non-filesystem-shaped graphs.
- Expose a small macro-control surface over existing seed, well, and interaction overrides.
- Add clearer settle/runtime diagnostics and retain deterministic benchmark coverage.
- Keep the core extractable and preserve `applyDialect()`.

### Release engineering

- Decide how Playwright should run in CI without repeating the previous cold-start timeout failure.
- Verify a clean clone, generated self-graph, browser development build, Tauri development build, and distributable Tauri build.
- Audit direct dependencies, especially packages currently installed as future seams but unused at runtime.
- Add documentation link checking and code-reference checking to CI.

## Post-1.0 candidates

These are intentionally not release promises:

- Three.js / React Three Fiber rendering and later VR interaction.
- A GWells profile layer with graph analysis, layout recommendations, universal layouts, and advanced tuning.
- Saved workspace layouts and navigation lenses.
- Event-backed layout/override history as a control-plane consumer.
- Deeper source provenance, cross-file relationships, and inference-assisted graph analysis.

## Sequencing rules

- Build measured user value before broad abstractions.
- Add new behavior beside legacy behavior; do not delete compatibility paths first.
- Treat motion safety, source bounds, and filesystem boundaries as release invariants.
- Promote Planned to Partial or Implemented only with a runtime path and evidence.
