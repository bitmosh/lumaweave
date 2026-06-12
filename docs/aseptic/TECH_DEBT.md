---
title: Technical Debt — LumaWeave/GWells Living Report
report_type: tech_debt
status: active
---

# Technical Debt — LumaWeave/GWells

Functional but known-bad implementation choices, deliberate deferrals, and architectural shortcuts with known cost. Entries stay here until resolved; resolved entries are preserved for history.

---

---
id: TD-001
type: tech_debt
status: resolved
pass_opened: v0.1.11z
pass_resolved: v0.1.14
severity: HIGH
---

### ~~TD-001 — GWells dense-step performance ceiling~~

> **Resolved in v0.1.14** — commit pending. Source-well / target-well indexing removed the all-node interaction scan, and the latest benchmark run brought the 1800-node filesystem fixture down to roughly 1.07 ms average step time with 1.57 ms p95.

<details>
<summary>Original entry (preserved for history)</summary>

**What it is:** The current benchmark harness confirms the engine can run larger fixtures, but dense filesystem-shaped graphs still have a high per-step cost at the 1800-node scale.

**Why it was necessary:** The current pass intentionally created a benchmark-first measurement baseline before doing any spatial-index or force-loop rewrite. That keeps performance work evidence-led.

**Known cost:** Large LumaWeave graphs may not be interactive at current settings. The latest local run measured roughly 213 ms average step time and 237 ms p95 for the 1800-node filesystem fixture, while 500-node generic graphs stayed under 2 ms p95.

**Trigger:** Address before claiming large-graph interactive readiness, before enabling default GWells use on 1000+ node app graphs, or when a source adapter produces filesystem-shaped graphs near this size.

**Evidence:** `scripts/benchmark-gwells.mjs`; `benchmarks/gwells-latest.json`; latest run of `npm run physics:gwells:bench`.

</details>

---

---
id: TD-002
type: tech_debt
status: open
pass_opened: v0.1.11z
pass_resolved:
severity: MEDIUM
---

### TD-002 — Scheduler remains browser-shaped

**What it is:** `GWController.step()` now provides deterministic manual stepping, but the automatic loop still relies on the existing browser `requestAnimationFrame` path instead of a fully injected scheduler.

**Why it was necessary:** The minimal C12A benchmark needed one synchronous step hook without broad lifecycle architecture changes. That preserved the existing runtime path and avoided pulling app concerns into GWells core.

**Known cost:** Headless consumers and deterministic tests can use `step()`, but lifecycle behavior still has browser assumptions around auto-running controllers.

**Trigger:** Revisit when GWells needs server/headless layout operation, deterministic lifecycle tests beyond the benchmark harness, or a public standalone package contract that cannot assume `requestAnimationFrame`.

**Evidence:** `src/physics/gwells/engine.ts` lifecycle loop and `GWController.step()` implementation; C14/C12A current-state discussion.
