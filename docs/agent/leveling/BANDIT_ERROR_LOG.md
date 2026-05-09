---
id: log.bandit.error
title: Bandit Error Log
type: log
status: current
domain: agent
subdomain: leveling
cluster: violet
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - error
  - log
  - bandit
  - agent
  - self-split
  - recovery
  - operational
last_pass: vP-Forensics-2
---

# Bandit Error Log

Structured record of every self-split, recovery, and unresolved blocker.
Updated by the agent immediately after any self-split or recovery event.

**Format:**
```
[date] · [version] · [error-class] · [strategies: N] · [resolution]
  Details: [brief description of what failed and why]
```

**Error classes** (from Diagnostic Router):
```
Environment Prerequisite
Dependency / API Uncertainty
Selector / Test Harness Mismatch
Identity / Binding Drift
State Persistence / Reset Bug
Runtime Lifecycle / Behavior Regression
Obsolete Test / Spec Debt
Contract Registry Drift
Docs / Source-of-Truth Drift
Scope Creep / Architecture Boundary Issue
Multi-Agent Collision
Playwright Cascade
Unknown
```

**Resolution types:**
```
pending           — waiting for human input
resolved-human    — human provided fix or direction
resolved-agent    — agent resolved on retry after human input
deferred          — acknowledged, not blocking current work
escalated         — requires architectural decision
```

---

## Error Log

2026-05-06 · repair-pass-v75b · Runtime Lifecycle / Regression · strategies: 1 · resolved-agent
  Failure: 8 pre-existing Playwright failures from v75a (command-deck: 1, graph-visual-inventory: 2,
  graph-visual-state-stability: 3, theme-target-inspector: 2)
  Attempted: 1) Updated testid selectors from graph-viewport to self-graph-fixture-loaded in 4 test files
  2) Updated GRAPH_VIEWPORT_SELECTOR in ThemeTargetInspectorOverlay.tsx
  3) Added mode-aware assertions for physics tests to handle static fixture
  Root cause: v75a changed graph-viewport testid to self-graph-fixture-loaded, tests not updated
  Human action: Authorized fix - testid updates + overlay selector fix + mode-aware assertions

2026-05-07 · yaml-graph-parser · Runtime Lifecycle · strategies: 1 · resolved-agent
  Failure: YAML parser wired at module load caused DOM detachment cascade across all Playwright tests
  Attempted: 1) Module-level constant fix to prevent re-renders (failed - parser threw at module load)
  2) Reverted to static fixture to restore stability
  Root cause: Vite glob import.meta.glob() + gray-matter parsing at module initialization caused full component remount on every render
  Human action: Authorized revert to static fixture, preserve parser file for future debugging
  Fix needed: lazy load parser, Web Worker, or Vite virtual module approach
  XP: +0.0 (self-split recovery — no XP)
  Clean streak: RESETS to 0

2026-05-06 · v75a · Runtime Lifecycle / Regression · strategies: 0 · deferred
  Failure: 8 pre-existing Playwright failures (command-deck: 1, graph-visual-inventory: 2,
  graph-visual-state-stability: 3, theme-target-inspector: 2)
  Attempted: none - inherited technical debt from before v75a
  Root cause: tests failing on canvas visibility, slider state changes, and inspector panel positioning
  Human action: defer to dedicated test repair pass post-v75b - do not touch in v75a

2026-05-06 · v74c · Obsolete Test / Spec Debt · strategies: 0 · deferred
  Failure: 6 pre-existing unconditional skips in contract-registry.spec.ts (lines 235, 251, 334, 349, 364, 526)
  Attempted: none - inherited technical debt from before v74c
  Root cause: tests for proposal decisions, proposal notes, backlog reorder, and v48 persistence are unconditionally skipped
  Human action: defer to post-v75b test cleanup pass - do not touch in v74c

---

## Pattern Detection Rule

If the same error class appears **3 or more times**, promote it to a
**Boss Fight** in `docs/agent/protocols/BANDIT_PROTOCOL.md`.

A Boss Fight is a recurring structural problem that needs a systematic
counter, not just repeated individual fixes.

Current Boss Fights (from BANDIT_PROTOCOL.md):
- QA Bundle Drift → Counter: QA Bundle Validator (v70, accepted)
- Evidence Scroll-Wall → Counter: v69 retry (pending)
- Real Audio Jump → Counter: explicit future contracts only
- Theme Workshop Supply Chain → Counter: security pipeline (v77)
- Cross-Layer Override Drift → Counter: CROSS_LAYER_OVERRIDE_CACHE_CONTRACT
- Multi-Agent QA Key Collision → Counter: MULTI_AGENT_POLICY.md

---

## Error Log Entry Instructions

### When to add an entry

Add an entry when:
- A self-split is triggered (3 strategies exhausted)
- A recovery pass is needed (fixing Bandit's own mistake)
- A Playwright cascade occurs (5+ simultaneous failures)
- A multi-agent collision is detected
- Any pass ends with DO NOT ACCEPT

### How to fill the entry

```
[date] · [version] · [error-class] · strategies: [N] · [resolution]
  Failure: [exact error or failure description in one sentence]
  Attempted: [brief description of each strategy]
  Root cause: [what was actually wrong, if known]
  Human action: [what the human did or decided]
```

### Example entries

```
2026-05-06 · v73c · Selector / Test Harness Mismatch · strategies: 2 · resolved-human
  Failure: system-index.spec.ts failing on data-testid="system-index-panel-shell"
  Attempted: 1) updated testid in spec 2) checked component mount location
  Root cause: duplicate testid conflict with old panel ID from v72d
  Human action: confirmed correct testid, cleared stale test state

2026-05-06 · v74b · Playwright Cascade · strategies: 1 · deferred
  Failure: 8 tests failing after source adapter registry added
  Attempted: 1) classified as shared import path issue
  Root cause: barrel export missing from src/source-adapter/index.ts
  Human action: identified missing export, authorized fix in next pass
```
