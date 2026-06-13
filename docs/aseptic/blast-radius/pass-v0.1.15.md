---
pass: c12b-benchmark-expansion
version: v0.1.15
project: gwells
date: 2026-06-12
summary: Expanded the GWells benchmark matrix to cover the brief's larger fixture set.
---

# Blast Radius — C12B Benchmark Expansion (v0.1.15)

## Files

### Modified
- `scripts/benchmark-gwells.mjs` — added hierarchy, wide-root, mixed-graph, and larger synthetic benchmark fixtures.
- `benchmarks/gwells-latest.json` — regenerated with the expanded fixture matrix and the new benchmark timings.
- `docs/aseptic/POLISH_DEBT.md` — resolved PD-002 after the benchmark envelope matched the refinement brief more closely.

### Created
- `docs/aseptic/blast-radius/pass-v0.1.15.md` — this pass record.

### Deleted
None.

---

## Public APIs

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

- Benchmark now covers current-like, hierarchy-1000, hierarchy-2000, stress-5000, wide-roots-30, and mixed-graph cases in addition to the original fixtures.
- The benchmark output remains latest-only, but the coverage matrix is now broad enough to compare filesystem, hierarchy, mixed, wide-root, generic, and orphan-heavy shapes.

---

## Living report updates

### Resolved entries

- POLISH_DEBT: PD-002 — benchmark fixture envelope is narrower than the refinement brief.

No new entries this pass.

---

## Adjacent project impact

No cross-pollination file created. This is a benchmark coverage update inside GWells only.
