---
id: pass-v0.1.17
type: blast_radius
version: v0.1.17
project: gwells
status: complete
---

# Pass v0.1.17 — GWells benchmark baseline workflow

## Files modified
- `scripts/benchmark-gwells.mjs`
- `benchmarks/gwells-latest.json`
- `benchmarks/gwells-baseline.json`
- `docs/canonical/GWELLS_PHYSICS.md`
- `docs/aseptic/DEVIATION.md`
- `docs/aseptic/blast-radius/pass-v0.1.17.md`

## Behavior changed
- Normal benchmark runs continue to update `benchmarks/gwells-latest.json`.
- `--update-baseline` intentionally refreshes `benchmarks/gwells-baseline.json`.
- No runtime physics behavior changed.

## Living report updates
- `DV-001` resolved.
- No new living-report entries this pass.

## Tests
- `npm run physics:gwells:bench -- --update-baseline` — passed; wrote latest and baseline.
- `npm run physics:gwells:bench` — passed; wrote latest and left baseline unchanged.
- `npm run physics:gwells` — passed.
- `npm run typecheck` — passed.

## Risk
- Low. The change is limited to benchmark output policy and documentation.
