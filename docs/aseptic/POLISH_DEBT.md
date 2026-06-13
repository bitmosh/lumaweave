---
title: Polish Debt — LumaWeave/GWells Living Report
report_type: polish_debt
status: active
---

# Polish Debt — LumaWeave/GWells

Correct but imprecise items: stale docs, naming mismatches, fixture gaps, and small inconsistencies that can confuse future work. These should be mechanical to fix.

---

---
id: PD-001
type: polish_debt
status: resolved
pass_opened: v0.1.11z
pass_resolved: v0.1.16
---

### ~~PD-001 — Canonical GWells docs need lifecycle API refresh~~

**What it is:** The canonical GWells physics docs had lagged the runtime lifecycle surface, benchmark hook, and controller debug API.

**Where:** `docs/canonical/GWELLS_PHYSICS.md` and any GWells current-state docs that describe the controller API.

> **Resolved in v0.1.16** — canonical docs now explicitly cover `GWRuntimeState`, `GWDebugEvent`, `onDebug`, `getRuntimeState()`, `GWController.step()`, and the current UI-safe tuning surfaces. GWells core remains standalone and does not import app/UI concerns.

---

---
id: PD-002
type: polish_debt
status: resolved
pass_opened: v0.1.11z
pass_resolved: v0.1.15
---

### ~~PD-002 — Benchmark fixture envelope is narrower than the refinement brief~~

> **Resolved in v0.1.15** — committed as `ea6152d`. The benchmark matrix now includes current-like, hierarchy-1000, hierarchy-2000, stress-5000, wide-roots-30, mixed-graph, generic-no-spine, and orphan-heavy fixtures in addition to the original filesystem cases.

<details>
<summary>Original entry (preserved for history)</summary>

**What it is:** The benchmark harness exists and writes latest metrics, but the fixture set is still a pragmatic subset rather than the full size/style matrix described by the refinement docs.

**Where:** `scripts/benchmark-gwells.mjs`; generated `benchmarks/gwells-latest.json`; `docs/prototypes/gwells-refine/GWELLS_V0_1_5_POLISH_TO_SHIP_IMPLEMENTATION_BRIEF.md` C12A/C12B language.

**Fix:** Add named fixture coverage for the remaining useful graph shapes and sizes before treating benchmark output as release-grade acceptance data. Keep small deterministic fixtures for fast local runs and separate heavier fixtures if runtime becomes a problem.

</details>
