---
id: contract.human.evidence.debug.mode
title: Human / Evidence / Debug Mode Contract
type: contract
status: accepted
version: v73a
domain: control-plane
subdomain: contracts
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/control-plane/modes/controlPlaneModeRegistry.ts
  - scripts/validate-control-plane-modes.mjs
tested_by:
  - tests/e2e/system-index.spec.ts
tags: [human, evidence, debug, mode, contract, accepted, v73a]
---

# Human / Evidence / Debug Mode Contract

**Status:** Accepted — v73a

---

## Purpose

Define three distinct viewing modes for the LumaWeave control plane that present the same data with different levels of detail and audience-appropriate framing. This enables the UI to serve both overview-oriented users (Human Mode) and deep-evidence users (Evidence Mode) without hiding or weakening any evidence.

---

## Three Modes

### Human Mode
```
Purpose:    Overview-first, summary cards, readable labels
Audience:   New users, non-technical stakeholders, demos
Evidence:   Summary only — full evidence reachable but not default-visible
Summarization: allowed
Legacy collapsing: NOT allowed (must not collapse accepted evidence)
requiresTestedHelpers: true
allowsLegacyCollapsing: false
```

### Evidence Mode (default + QA recommended)
```
Purpose:    Full contract/evidence view, validation-ready
Audience:   Developers, QA, agents, governance review
Evidence:   Full evidence panels, all detail visible by default
requiresFullEvidence: true
allowsSummarization: false
forbiddenBoundaryVisibility: always
```

### Debug Mode
```
Purpose:    Raw IDs, lifecycle states, validator output, diagnostic data
Audience:   Bandit, implementation agents, debugging sessions
Evidence:   Everything Evidence Mode shows, plus raw IDs and registry internals
intendedForInternalUse: true
includesDiagnosticData: true
```

---

## Core Invariants

- Evidence Mode is the **default** mode and the **QA-recommended** mode
- No mode may hide accepted evidence — Human Mode summarizes, does not hide
- Forbidden boundary visibility is always `"always"` in Evidence Mode
- No mode toggle is implemented without a runtime mode toggle contract (future)
- The mode registry is validated by `scripts/validate-control-plane-modes.mjs` (v73c)

---

## Relationship to v68/v69

v68 defined the navigation model (overview → drilldown). v73a provides the governance for HOW overview and drilldown modes work. The Human Mode IS the overview from v68. The Evidence Mode IS the drilldown. v69r retry must use Human Mode for the summary card layer.

---

## v69 Retry Notes (v69r)

```
v69 FAILED: mass-edit of all evidence sections simultaneously
v69r APPROACH:
  - Additive only — add Human Mode summary grid on top
  - Do not collapse existing Evidence Mode sections
  - One section at a time
  - Stop condition per section
  - Mode-aware from the start using this contract
```

---

## Forbidden in v73a (Contract Only)

```
No runtime mode toggle implementation
No UI implementation
No evidence hiding in any mode
No GraphVisualInventoryPanel changes
No QA key rotation
No graph/Sigma mutation
No audio input/playback/reactivity
```
