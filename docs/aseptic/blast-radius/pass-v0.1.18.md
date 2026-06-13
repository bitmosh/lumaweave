---
id: pass-v0.1.18
type: blast_radius
version: v0.1.18
project: gwells
status: complete
---

# Pass v0.1.18 — GWells scheduler abstraction

## Files modified
- `src/physics/gwells/types.ts`
- `src/physics/gwells/engine.ts`
- `src/physics/gwells/index.ts`
- `scripts/benchmark-gwells.mjs`
- `scripts/validate-gwells.mjs`
- `benchmarks/gwells-latest.json`
- `docs/canonical/GWELLS_PHYSICS.md`
- `docs/aseptic/TECH_DEBT.md`
- `docs/aseptic/blast-radius/pass-v0.1.18.md`

## Behavior changed
- `GWApplyDialectOptions` accepts an optional `scheduler` for automatic runtime ticks.
- Browser runtimes still default to `requestAnimationFrame` / `cancelAnimationFrame`.
- Headless runtimes without RAF now fall back to a no-op scheduler instead of throwing during `applyDialect()`.
- `GWController.step()` remains the deterministic manual stepping path.
- The benchmark harness now uses an injected scheduler instead of mutating `globalThis.requestAnimationFrame`.

## API changes
- Added `GWFrameHandle`.
- Added `GWScheduler`.
- Added `GWApplyDialectOptions.scheduler`.

## Living report updates
- `TD-002` resolved.
- No new living-report entries this pass.

## Tests
- `npm run typecheck` — passed.
- `npm run physics:gwells` — passed.
- `npm run physics:gwells:bench` — passed; benchmark uses injected scheduler and leaves baseline unchanged.
- Headless Node smoke — passed; `applyDialect()` works without `requestAnimationFrame` and manual `step()` runs.
- `npm run qa:e2e -- tests/e2e/gwells-physics.spec.ts` — 18 passed, 2 skipped.

## Risk
- Medium-low. Runtime scheduling changed internally, but controller lifecycle ownership remains in the engine closure and the browser default behavior is preserved.
