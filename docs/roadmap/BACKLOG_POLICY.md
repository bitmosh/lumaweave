---
id: policy.backlog
title: QA Backlog Policy
type: policy
status: accepted
version: v74c
domain: roadmap
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - backlog
  - policy
  - QA
  - roadmap
  - passes
  - accepted
---

# QA Backlog Policy

Current pass: **v74c — Passive Source Adapter Evidence Panel** — ACTIVE

---

## Auto-Management Rules

- A backlog item is promoted during the pass that implements it
- After acceptance it must be marked completed, removed from active candidates, or converted to follow-up subtasks
- Do not let the active backlog become a list of completed work
- Do not invent filler entries to maintain an arbitrary count
- Persist durable items until completed, rejected, or deliberately reordered
- Add new items only when: newly discovered, actionable, not already represented, and annotated with risk/dependency context
- If a new task is a subtask of an existing item, nest it — do not promote it to a top-level item

---

## Completed Passes (v36–v73c)

```
v36–v38   Command Deck + Perspective System read-only foundations
v39–v46   Graph physics, element registry, visual inventory, runtime boundary
v47–v58   Graph runtime/theme mapping/application ladder
v59–v60   Motion Safety / Epilepsy Guard contract + registry
v61–v62   Audio Reactivity Contract + Synthetic Signal Preview
v63–v64   Music Reactive Mapping Contract + Passive Inventory
v65–v66   Audio Source System Contract + Passive Audio Source Registry
v67       Roadmap Realignment
v68       Graph Control Plane Navigation Contract
v70       QA Bundle Validator                               ACCEPTED
v71a      Contract-to-Code Trace Matrix                    ACCEPTED
v71b      Contract Trace Validator                         ACCEPTED
v72a      System Index Registry Contract                   ACCEPTED
v72b      Static System Index Registry (16 entries)        ACCEPTED
v72c      System Index Validator v0                        ACCEPTED
v72d.1    Safe Mount Point Discovery                       ACCEPTED
v72d.2    AppShell / Route Pattern Discovery               ACCEPTED
v72d.3    Passive SystemIndexPanel Mount + Playwright      ACCEPTED
v73a      Human / Evidence / Debug Mode Contract           ACCEPTED
v73b      Mode Metadata Registry                           ACCEPTED
v73c      Mode Registry Validator v0                       ACCEPTED
v74a      Source Adapter OS Foundation Contract           ACCEPTED
v74b      Source Adapter Base Registry + Validator        ACCEPTED
v74c      Passive Source Adapter Evidence Panel           ACTIVE ← current
```

**v69 (Collapsible Evidence Sections)** — PAUSED. Failed due to mass-edit approach. Retry as v69r after v75 arc, using additive overview grid only.

---

## Active Roadmap

```
v75a   Synthetic Data Fixtures v0 — Self-Graph Seed       ← next
v75b   Self-Graph Passive Mount — First Demo Surface
v76    Verified Download Button Boundary Contract
v77a   Theme Workshop Security Model — Docs Pass
v77b   Workshop Security Gate v0 — Schema + Provenance
v69r   v69 Retry — Overview Grid / Summary Cards
v78+   Visual Grammar Engine Bootstrap
```

---

## Current Active Backlog

**Priority 1 — Grammar Lens Contract (urgent insert)**
Write GRAMMAR_LENS_CONTRACT.md and CURSOR_INSPECTOR_CONTRACT.md before extending the overlay further. The overlay is partially live without formal governance. This is a docs-only pass, low risk, one session.

**Priority 2 — Source Adapter OS Foundation (v74a)**
Docs-only contract defining the adapter lifecycle, base schema, safety requirements, and forbidden behavior. Superseded by `docs/_v100-rewrites/SOURCE_ADAPTER.md` (SOURCE_ADAPTER_OS_CONTRACT.md archived v100.0.5).

**Priority 3 — Self-Graph Fixture (v75a/v75b)**
Highest-leverage milestone. LumaWeave visualizing its own architecture. First demo surface. First real product screenshot.

**Priority 4 — Sigma Visual Quality**
The graph still renders in default Sigma colors. The theme contract ladder (v49–v59) is accepted but not yet producing visible custom colors on all surfaces. v59 contracts the implementation; closing this gap makes the first demo moment work.

**Priority 5 — Path Corrections**
Three path references in SOURCE_OF_TRUTH.md and SESSION_AND_STACK.md need updating to match actual file locations. Low risk, one pass.

---

## QA Bundle Validator

Before bumping QA keys or making advisory changes, run:

```bash
node scripts/validate-qa-bundle.mjs
```

Checks:
- Current QA key coherence (QaPanel, contract-registry, qa-registry, BACKLOG_POLICY)
- Advisory section existence for current QA key
- Proposal IDs in contract-registry exist in active advisory
- Advisory has backlog rows
- BACKLOG_POLICY current pass wording coherence

---

## Guardrails

- Do not implement runtime behavior without an explicit contract
- Do not rotate QA key while another agent is mid-pass on QA bundle files
- Do not treat v69 (paused) as a current active pass — it is PAUSED
- Do not promote audio from synthetic to real without explicit ladder pass
- Do not implement cross-layer override cache without formal contract
- Do not implement Grammar Lens batch scope without GLOBAL_ELEMENT_UPDATE_CONTRACT
- QA key increments every accepted pass regardless of whether an in-app QA report was submitted
- Passes without submitted reports use lifecycle state "accepted-unverified" — not a blocker, not a failure
- Do not attempt to backfill QA report submissions for historical accepted-unverified passes
