---
title: Deviations — LumaWeave/GWells Living Report
report_type: deviation
status: active
---

# Deviations — LumaWeave/GWells

Where implementation diverged from written implementation briefs, specs, or ADRs. This is an information log, not a failure log. Deviations are often correct responses to discovered constraints; record them so future passes do not re-discover the gap.

---

---
id: DV-001
type: deviation
status: open
pass_opened: v0.1.11z
pass_resolved:
severity: LOW
---

### DV-001 — Benchmark output writes latest metrics but not a committed baseline

**Spec said:** The GWells v0.1.5 refinement brief describes a benchmark-first pass with baseline/latest JSON output so future performance passes can compare against a stable reference.

**Implementation did:** The current harness writes `benchmarks/gwells-latest.json` and prints a readable summary, but it does not yet create or maintain `benchmarks/gwells-baseline.json`.

**Why:** C12A was kept minimal: establish deterministic controller stepping, run representative fixtures, and capture current metrics without prematurely blessing one local machine's timings as a baseline.

**Status:** OPEN — implementation or docs should catch up. Either add an intentional baseline workflow or adjust the brief/current-state docs to say latest-only is the C12A artifact and baseline selection happens in C12B.

**Adjacent impact:** Low for app runtime. Medium for future performance work, because regressions cannot be judged mechanically until a baseline policy exists.
