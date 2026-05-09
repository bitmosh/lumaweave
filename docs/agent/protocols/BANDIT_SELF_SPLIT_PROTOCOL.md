---
id: protocol.bandit.self.split
title: Bandit Self-Split Protocol
type: protocol
status: accepted
domain: agent
subdomain: protocols
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - bandit
  - self-split
  - recovery
  - protocol
  - agent
  - stop-condition
references:
  - protocol.bandit.operating
  - template.quest
last_pass: vP-Forensics-2
---

# Bandit Self-Split Protocol

## Purpose

When Bandit encounters a problem it cannot resolve after three
distinct strategies, it must stop, back out, and report. This
protocol defines exactly what that means and how to execute it.

A truthful stopped report is better than a false clean report.
XP is not awarded for recovery passes. There is no reward for
pushing through uncertainty.

---

## Trigger Condition

Self-split is triggered when ALL of the following are true:

1. The same failure has occurred 3 times
2. Each attempt used a genuinely distinct strategy
3. None of the three strategies resolved the failure
4. The failure is blocking the current pass from completing

If any condition is not met, continue normally. Do not self-split
preemptively.

---

## What Counts as a Distinct Strategy

Strategies must be genuinely different approaches, not the same
fix with minor variations:

**Distinct strategies:**
- Strategy 1: Fix the direct error at its reported location
- Strategy 2: Investigate a different root cause hypothesis
  (e.g. the error is a symptom, not the cause)
- Strategy 3: Isolate the failure with a minimal reproduction
  (e.g. temporarily comment out surrounding code to find the
  exact failure point)

**Not distinct strategies:**
- Trying the same fix twice with a small variation
- Changing a variable name and retrying
- Running the same command with a different flag

---

## Step 1: Back Out All Changes

Before printing the report, restore the last clean git state.

If terminal privileges are active:
```bash
git stash
# or
git checkout -- .
# then verify:
git status --short
```

If terminal is locked, provide the user with exact backout commands
and ask them to run them before proceeding.

The goal: repo must be in a clean, known-good state before the
report is submitted. Do not leave partial work committed.

---

## Step 2: Classify the Failure

Before writing the report, classify the failure using the
Diagnostic Router (`docs/survival-manual/02_DIAGNOSTIC_ROUTER.md`):

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
Unknown
```

This classification goes in the report's "Shared root cause hypothesis"
field and guides the human's response.

---

## Step 3: Print the Self-Split Debug Report

```
BANDIT SELF-SPLIT REPORT
════════════════════════════════════════════════════════════

Pass attempted:    [version / task name]
Quest position:    [which sub-pass in the sequence, e.g. "sub-pass 2 of 4"]
Active QA key:     [current QA key]
Agent:             [Bandit / DeepSeek / other]
Other agent scope: [what the other agent is working on, if applicable]

────────────────────────────────────────────────────────────
FAILURE DESCRIPTION

Exact error or test failure output:
  [paste verbatim]

Failure class (from Diagnostic Router):
  [classification]

────────────────────────────────────────────────────────────
STRATEGIES ATTEMPTED

Strategy 1:
  Hypothesis:   [what you thought the cause was]
  Action taken: [what you changed/tried]
  Result:       [what happened, verbatim if possible]

Strategy 2:
  Hypothesis:   [different root cause]
  Action taken: [what you changed/tried]
  Result:       [what happened]

Strategy 3:
  Hypothesis:   [isolation/reproduction approach]
  Action taken: [what you changed/tried]
  Result:       [what happened]

────────────────────────────────────────────────────────────
CURRENT STATE

Files touched during failed attempts:
  [list every file modified, even if reverted]

Repo state after backout:
  [clean / dirty — paste git status --short]

Uncommitted changes remaining (if any):
  [list or "none"]

────────────────────────────────────────────────────────────
ANALYSIS

Shared root cause hypothesis:
  [best single classification — what is actually broken]

Why the three strategies didn't work:
  [honest assessment — what's still unknown]

────────────────────────────────────────────────────────────
SAFE NEXT OPTIONS FOR HUMAN

Option 1: [specific action the human could take]
Option 2: [alternative approach]
Option 3: [escalation or deferral path]

────────────────────────────────────────────────────────────
RECOMMENDATION

NEEDS HUMAN REVIEW — do not proceed

════════════════════════════════════════════════════════════
```

---

## Step 4: Update the Error Log

After the report is printed, add an entry to
`docs/agent/leveling/BANDIT_ERROR_LOG.md`:

```
[date] [version] SELF-SPLIT — [error-class] — [3 strategies] — [resolution: pending / resolved by human / deferred]
```

---

## Step 5: Wait

Do nothing further until the user responds. Do not:
- Attempt a 4th strategy
- Make "small cleanup" changes while waiting
- Speculate further in chat
- Ask leading questions that push toward a specific fix

If the user provides new information, treat it as a fresh context
load — re-read the relevant source of truth docs before acting.

---

## XP Rules for Self-Split Passes

- Self-split passes earn **+0 XP**
- Recovery passes (fixing a self-split) earn **+0 XP**
- XP farming by self-splitting intentionally is forbidden
- A clean pass after a self-split earns normal XP as usual

The goal is accurate, honest reporting — not XP optimization.

---

## Automatic Self-Split Triggers

In addition to the 3-strategy rule, self-split immediately (no
strategies needed) if:

1. **Playwright cascade** — more than 5 failures appear simultaneously.
   Classify the shared root cause before doing anything.

2. **Scope expansion** — the fix requires touching files outside
   the explicitly defined pass scope.

3. **Forbidden boundary** — the fix would require crossing a
   forbidden boundary (Sigma mutation, audio input, etc.).

4. **Multi-agent collision** — another agent has modified a file
   you need to edit and the changes conflict.

5. **QA key uncertainty** — you cannot determine the correct
   current QA key with confidence.

In all automatic trigger cases: back out, report, wait.

---

## Relationship to Quest Mode

In Quest Mode (multi-sub-pass sequences), a self-split in any
sub-pass stops the entire quest. Do not proceed to the next
sub-pass after a self-split. The quest resumes only after:

1. Human resolves the blocking issue
2. Clean repo state is confirmed
3. Human explicitly authorizes continuing the quest

The quest does not automatically resume. Explicit authorization required.
