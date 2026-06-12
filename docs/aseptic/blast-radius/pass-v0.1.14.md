---
pass: c12b-indexing
version: v0.1.14
project: gwells
date: 2026-06-12
summary: Added source-target interaction indexing and resolved the GWells dense-step performance ceiling.
---

# Blast Radius — C12B Indexing (v0.1.14)

## Files

### Modified
- `src/physics/gwells/engine.ts` — added internal source-well and target-well buckets so interaction evaluation no longer scans all nodes for every interaction.
- `scripts/benchmark-gwells.mjs` — retains coarse timing attribution and now reflects the faster indexed runtime.
- `benchmarks/gwells-latest.json` — regenerated after the indexed benchmark run.
- `docs/aseptic/TECH_DEBT.md` — resolved TD-001 after the benchmark collapse showed the dense-step ceiling was removed.

### Created
- `docs/aseptic/blast-radius/pass-v0.1.14.md` — this pass record.

### Deleted
None.

---

## Public APIs

### Added
None.

### Modified (breaking)
None.

### Modified (non-breaking)
- `GWController.step()` behavior is unchanged at the API level, but its internal work now uses indexed interaction lookup.

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

- Interaction evaluation is now indexed by source well type and target well type rather than scanning every physics node for every interaction.
- Large filesystem-shaped fixtures are now dramatically faster in benchmark runs.
- The benchmark JSON still records timing attribution fields from the prior pass.

---

## Living report updates

### Resolved entries

- TECH_DEBT: TD-001 — GWells dense-step performance ceiling — resolved by source/target indexing and benchmark confirmation.

No new entries this pass.

---

## Adjacent project impact

No cross-pollination file created. This is an internal GWells performance improvement with no new LumaWeave UI/API surface.
