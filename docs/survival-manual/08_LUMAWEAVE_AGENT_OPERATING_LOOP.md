---
id: manual.agent.operating.loop
title: LumaWeave Agent Operating Loop
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [agent, operating, loop, behavior, survival]
---

# LumaWeave Agent Operating Loop

The complete behavior loop for any agent working on LumaWeave.

---

## Full Loop

```
SESSION START
  │
  ├─ Read brain docs (23_BANDIT_CURRENT_TITLE.md first)
  ├─ Read Tier 0: SESSION_AND_STACK → SOURCE_OF_TRUTH → QA_AND_PLAYWRIGHT
  ├─ Ask user for git status --short and git log --oneline -12
  ├─ Confirm current QA key from qa-registry.ts
  ├─ Confirm no other agent has conflicting scope
  └─ State self-check (mode / risk / pass type / forbidden / stop condition)
  │
  PASS PLANNING
  │
  ├─ Identify exact files in scope
  ├─ Identify exact forbidden files/systems
  ├─ Identify evidence required (typecheck / Playwright / both)
  ├─ Identify QA lockstep requirement (yes/no)
  └─ Announce scope to user before starting
  │
  PASS EXECUTION
  │
  ├─ Edit only files in announced scope
  ├─ After each meaningful change: typecheck
  ├─ If a file outside scope becomes necessary: PAUSE AND REPORT
  ├─ If a forbidden boundary is approached: STOP
  └─ If something unexpected appears in git diff: PAUSE AND REPORT
  │
  VALIDATION
  │
  ├─ npm run typecheck → must pass with 0 errors
  ├─ npm run qa:e2e → must pass, 0 skipped
  ├─ grep -R "test.skip" tests/e2e → must be clean
  ├─ git status --short → confirm expected changed files only
  └─ Forbidden boundary check (Sigma / audio / command / storage)
  │
  FAILURE HANDLING (if validation fails)
  │
  ├─ Classify failure (Diagnostic Router)
  ├─ Strategy 1: direct fix
  ├─ Strategy 2: different root cause hypothesis
  ├─ Strategy 3: isolation / minimal reproduction
  ├─ If all 3 fail → SELF-SPLIT (back out, debug report, wait)
  └─ If cascade (5+) → classify shared root before any patching
  │
  ACCEPTANCE
  │
  ├─ Print acceptance report (validation results + forbidden boundary check)
  ├─ Add changelog entry to docs/agent/leveling/BANDIT_CHANGELOG.md
  ├─ Update brain docs if a durable lesson was learned
  └─ Award XP per leveling protocol
  │
  SESSION END
  │
  ├─ Confirm git status is clean or expected
  └─ Note any pending items for next session
```

---

## Loop Invariants (Never Violated)

These are true at every point in the loop:

```
No test is ever skipped
No forbidden boundary is ever crossed without a contract
No pass is accepted without validation evidence
No scope is expanded without user confirmation
Three strategies maximum before self-split
A truthful stopped report beats a false clean report
```

---

## Nested Loop: Self-Split Recovery

When a self-split occurs, the loop becomes:

```
SELF-SPLIT
  │
  ├─ Back out all changes (git stash or git checkout -- .)
  ├─ Confirm clean repo state with user
  ├─ Print self-split debug report
  ├─ Add error log entry to docs/agent/leveling/BANDIT_ERROR_LOG.md
  └─ WAIT — do not continue until human responds
  │
  HUMAN RESPONSE
  │
  ├─ If human provides new information → fresh context load
  ├─ Re-read relevant source-of-truth docs
  ├─ Start fresh with new approach
  └─ Re-enter Pass Execution stage of the main loop
```

---

## Multi-Agent Variant

When another agent is active, add these steps to Session Start:

```
  ├─ Ask user: what is the other agent's current scope?
  ├─ Confirm no overlap with your scope
  ├─ Announce your scope to user
  └─ Do not start until user confirms scope isolation
```

And add this check before QA key rotation:

```
  └─ Confirm other agent is not currently touching QA bundle files
```
