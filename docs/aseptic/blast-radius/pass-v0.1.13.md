---
pass: c12b-attribution
version: v0.1.13
project: gwells
date: 2026-06-12
summary: Added coarse benchmark timing attribution for GWells physics steps.
---

# Blast Radius — C12B Attribution (v0.1.13)

## Files

### Modified
- `src/physics/gwells/types.ts` — added optional `GWStepTimings` attribution on `GWStepResult`.
- `src/physics/gwells/index.ts` — exported `GWStepTimings` type.
- `src/physics/gwells/engine.ts` — records coarse per-step timing buckets for reset, seed lookup, interaction forces, auxiliary forces, integration, and total time.
- `scripts/benchmark-gwells.mjs` — aggregates timing buckets and prints force/integration averages in the benchmark table.
- `benchmarks/gwells-latest.json` — regenerated with timing attribution fields.

### Created
- `docs/aseptic/blast-radius/pass-v0.1.13.md` — this pass record.

### Deleted
None.

---

## Public APIs

### Added
- `GWStepTimings` — optional benchmark/debug timing attribution object.
- `GWStepResult.timings` — optional per-step timing data returned by `GWController.step()`.

### Modified (breaking)
None.

### Modified (non-breaking)
- `GWController.step()` still returns the previous fields and now includes optional `timings`.

### Removed
None.

---

## Schema changes

None.

---

## Configuration changes

None.

---

## Dependency changes

None.

---

## Behavior changes

- Manual benchmark steps now expose coarse timing attribution.
- Automatic runtime behavior is unchanged.
- Latest benchmark output now records `physicsStepTimingSampleCount` and `physicsStepTimingAverageMs`.

---

## Living report updates

No new entries this pass. No entries resolved.

Existing TD-001 remains open; this pass narrows the performance investigation to interaction-force traversal as the dominant bucket.

---

## Adjacent project impact

No cross-pollination file created. This is additive benchmark/debug data and does not require adjacent LumaWeave app changes.
