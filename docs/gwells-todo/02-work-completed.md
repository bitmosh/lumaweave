# 02 - Work Completed So Far

Date: 2026-06-15

This summarizes the GWells work covered in the recent pass sequence as remembered from the current context and local repository inspection.

## Investigation and Alignment

Completed:

- Cross-referenced active GWells source files against `docs/prototypes/gwells-refine`.
- Established that the current code path was a v0.1 polish track, not full v0.2 profile architecture.
- Identified the intended near-term priority order from `AGENTS.md` and prototype docs.
- Confirmed that GWells should remain standalone/extractable and should not import React, Sigma, app-specific UI, or source-adapter code into the core module.
- Confirmed that event sourcing is future layout-history/control-plane work, not a current physics-core dependency.

## Structural Resolver and Classification

Completed:

- Added or validated source-agnostic structural analysis via `structuralResolver.ts`.
- Moved well assignment away from being purely string-literal filesystem matching.
- Preserved legacy file/doc/code/config/fixture classification while giving the engine more topology-aware fallback roles.
- Added structural roles such as root, spine, container, leaf, orphan, hub, bridge, and unknown.

Remaining limitation:

- The resolver exists, but the seeders still primarily express containment hierarchy as spine/directory/file layouts. True source-agnostic profile behavior is not implemented yet.

## Runtime Lifecycle

Completed:

- Added `GWRuntimeState`.
- Added `GWDebugEvent`.
- Added `onDebug` option for lifecycle/cache diagnostics.
- Added `getRuntimeState()`.
- Added explicit `pause()`, `resume()`, `stop()`, and `step()` to the controller.
- Added injectable scheduler support for headless/manual stepping.
- Hardened stop/pause/resume behavior so loops can be controlled and tested.
- Added dialect-swap teardown coverage so changing dialects stops the old controller before applying the new one.

Impact:

- GWells is more extractable and testable outside the browser.
- Headless validation and deterministic stepping are now practical.

## Performance

Completed:

- Ran benchmark-first investigation.
- Found the main performance cliff in interaction scanning.
- Added interaction indexing so each node only checks relevant interaction sets instead of repeatedly scanning every interaction pairing.
- Expanded benchmark coverage across graph shapes and sizes.
- Kept a benchmark latest/baseline artifact path.

Impact:

- Large graph stepping is substantially less wasteful than before.
- The benchmark harness can catch major regressions.

## Seed and Layout Polish

Completed:

- Added or retained hub-ring behavior for many top-level roots.
- Added fallback placement for unseeded nodes.
- Added dynamic orbit sizing and phyllotaxis-style file placement.
- Added content-size-aware node sizing for directories/spines/files.
- Added helix twist as a per-well-type seed parameter record.
- Added per-dialect helix twist persistence in settings.

Current issue:

- The hub-ring behavior solves one class of root crowding but currently over-dominates the active self-graph because it sees 46 root spines. The result is a huge ring instead of a readable two-domain self-graph.

## UI Integration

Completed:

- Exposed current dialect selection in settings.
- Added helix twist sliders for spine, directory, and file.
- Stored helix twist overrides per dialect under `settings.physics.seedParamOverrides`.
- Passed active dialect seed overrides from `AppShell` to `SigmaGraphView`.
- Wired seed parameter changes to `controller.applyConfigOverride({ seedParams })` without recreating Sigma.
- Preserved pin handling across dialect lifecycle.

Current limitation:

- UI does not expose the main backend tuning capabilities yet: well overrides, interaction overrides, engine config, custom dialects, profile composition, or advanced raw controls.

## Docs and Reporting

Completed:

- Refreshed canonical GWells physics documentation to include runtime state, debug events, `onDebug`, `getRuntimeState()`, and `GWController.step()`.
- Resolved relevant Aseptic living-doc entries from the prior pass where docs matched current implementation.
- Created Aseptic methodology docs under `docs/aseptic` in a prior pass and committed them with `.gitignore` coverage.
- Posted Discord changelog messages through the bumper process for relevant committed passes.

## Testing and Validation

Previously run and passing during the recent arc:

- `npm run typecheck`
- `npm run physics:gwells`
- `npm run physics:gwells:bench`
- GWells headless smoke checks
- `npm run qa:e2e -- tests/e2e/gwells-physics.spec.ts`

Known caveat:

- This document creation pass did not rerun tests. It is documentation only.

## Recent Closeout Commit Remembered

Latest remembered GWells closeout commit:

```txt
c2eafbd feat(gwells): close lifecycle and headless polish
```

There have also been changelog posts after folded GWells commits around v0.1.18. The exact latest git log could not be rechecked in this sandbox session because some broader repo commands hit a bubblewrap loopback error.
