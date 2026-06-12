---
title: Aseptic Methodology — LumaWeave/GWells Working Copy
status: bootstrapped
version: v0.1.11z
---

# Aseptic — LumaWeave/GWells Working Files

Aseptic is a methodology for code execution that treats coordination drift as a contamination problem: prevented through continuous discipline at the work boundary, not cleaned up retrospectively after damage accumulates. The core instrument is three accumulating living reports, maintained by each pass, that make the project's known debt and divergence legible at a glance.

> **This is LumaWeave/GWells' working copy of an in-development methodology.** It is not canonical product documentation for LumaWeave or GWells. It is the local operating record for keeping GWells build passes coherent while the methodology is still being adapted from earlier Fossic examples. The conventions here may evolve; updates to methodology itself go in this file tree, not in external docs.

---

## File structure

| File | Purpose |
|---|---|
| `README.md` | This file — entry point and structure map |
| `INTRODUCTION.md` | The why — failure modes, core conviction, the four moves |
| `LIVING_REPORTS.md` | Spec for the three accumulating reports: format, what goes in, resolution |
| `TECH_DEBT.md` | **Living report** — functional but known-bad implementation choices |
| `POLISH_DEBT.md` | **Living report** — correct but imprecise; mechanical to fix |
| `DEVIATION.md` | **Living report** — where implementation diverged from spec or ADR |
| `BLAST_RADIUS.md` | Spec for the per-pass blast-radius artifact |
| `CROSS_POLLINATION.md` | Spec for adjacent-surface notification artifacts |
| `ADR_FORMAT.md` | Agent-friendly ADR template |
| `PASS_REPORTING.md` | Structured pass report format; PASS COMPLETE integration |
| `SUPERVISOR_PROTOCOL.md` | What a supervisor pass does; trigger conditions and process |
| `AGENT_BRIEFING.md` | Copy-pasteable prompt fragment for participating agents |
| `VERSION_CONVENTION.md` | Forward versioning vs. descending-letter cleanup passes |
| `blast-radius/` | One file per completed pass |
| `cross-pollination/` | Per-pass adjacent-surface impact, when impacts exist |

---

## The three living reports at a glance

- **[TECH_DEBT.md](TECH_DEBT.md)** — things that work but have a known cost: architectural shortcuts, deliberate deferrals, implementations that bypass structural principles for pragmatic reasons. Every entry has a trigger condition for when it becomes worth addressing.

- **[POLISH_DEBT.md](POLISH_DEBT.md)** — things that are correct but imprecise: naming inconsistencies, doc gaps, test helper duplication, file organization that grew organically. Mechanical to fix; no design discussion required.

- **[DEVIATION.md](DEVIATION.md)** — information log of where implementation diverged from spec, implementation brief, or ADR. Not a failure log; deviations are often correct responses to discovered constraints. Each entry records what the written guidance said, what happened, why, and whether docs or implementation should catch up.

---

## Blast radius and cross-pollination

Every pass produces a `blast-radius/pass-*.md` record at completion. Passes with meaningful adjacent-surface impact also produce a `cross-pollination/pass-*.md` file. These feed the PASS COMPLETE message and inform supervisor passes.

For GWells, "adjacent" usually means LumaWeave app surfaces, source adapters, future layout-history/control-plane consumers, or future standalone GWells package consumers. If a pass only changes internal docs or implementation with no adjacent action, say that explicitly in the pass report.

---

## Entry points by role

| You are... | Start here |
|---|---|
| An agent starting a new pass | [AGENT_BRIEFING.md](AGENT_BRIEFING.md) |
| A supervisor conducting a review | [SUPERVISOR_PROTOCOL.md](SUPERVISOR_PROTOCOL.md) |
| Authoring a new ADR | [ADR_FORMAT.md](ADR_FORMAT.md) |
| Writing a pass report | [PASS_REPORTING.md](PASS_REPORTING.md) |
| Understanding the methodology | [INTRODUCTION.md](INTRODUCTION.md) |
