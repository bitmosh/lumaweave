---
id: template.quest
title: Quest Mode Situation Report Template
type: protocol
status: accepted
version: v73c
domain: quest
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
related:
  - protocol.bandit.self.split
  - protocol.bandit.operating
tags: [quest, template, situation-report, agent, stop-condition]
---

# Quest Mode Situation Report Template

## Use When

- Bandit is stuck or uncertain
- Repo-root drift may have occurred
- Docs cleanup and runtime work are mixed in the same pass
- Playwright cascades appear
- Validation uncertainty exists
- Working tree contains multiple unrelated scopes
- User wants a clean checkpoint
- Any pass touching QA bundle, brain docs, or multi-agent scope

---

## Report Format

```
Quest Mode Situation Report
═══════════════════════════════════════════════════════════

Agent:
  [Bandit / DeepSeek / other]

Mode:
  Locked Terminal / Planner / Editor / Validator / Recovery / Reporter

Terminal Privileges:
  Granted / Revoked

Multi-Agent Context:
  Other agent active: yes / no
  Other agent scope:  [what they're working on, or "unknown — ask user"]
  Scope collision risk: none / possible / confirmed

Repo Context:
  - user-provided repo root:
  - user-provided git status:
  - commands run by agent: yes / no

───────────────────────────────────────────────────────────
QUEST SCOPE

Target versions:
  [e.g. v74a]

Intended scope:
  [files / systems in scope]

Forbidden scope:
  [files / systems explicitly out of scope]

───────────────────────────────────────────────────────────
CURRENT STATE

Files Changed:
  - docs:
  - runtime:
  - tests:
  - generated/new files:

Validation State:
  - typecheck:
  - targeted Playwright:
  - full Playwright:
  - test.skip grep:
  - git status:

───────────────────────────────────────────────────────────
FAILURE / BLOCKER (if applicable)

Exact failing test or command:

Failure class (from Diagnostic Router):

Strategies attempted:
  1.
  2.
  3.

Self-split triggered: yes / no
  (if yes: see BANDIT_SELF_SPLIT_PROTOCOL.md)

Likely shared root cause:

Not-yet-proven assumptions:

───────────────────────────────────────────────────────────
QA / ADVISORY LOCKSTEP

Active key:
qa-registry:
advisory-registry:
proposal IDs:
backlog rows:
contract-registry constants:

───────────────────────────────────────────────────────────
SAFE NEXT OPTIONS

1.
2.
3.

───────────────────────────────────────────────────────────
RECOMMENDATION

ACCEPT / DO NOT ACCEPT / PENDING USER VALIDATION / SELF-SPLIT

───────────────────────────────────────────────────────────
CHANGELOG ENTRY (fill if ACCEPT)

Format: [date] [version] [pass-type] ACCEPTED — [one-line summary] — [Playwright count] — [agent]

Entry:

───────────────────────────────────────────────────────────
ERROR LOG ENTRY (fill if recovery, self-split, or DO NOT ACCEPT)

Format: [date] [version] [error-class] [strategies: N] [resolution: pending / human / deferred]

Entry:

═══════════════════════════════════════════════════════════
```

---

## After Completing This Report

**If ACCEPT:**
1. Copy the Changelog Entry to `docs/agent/leveling/BANDIT_CHANGELOG.md`
2. Award XP per leveling protocol
3. Update `23_BANDIT_CURRENT_TITLE.md` if level changed

**If DO NOT ACCEPT or SELF-SPLIT:**
1. Copy the Error Log Entry to `docs/agent/leveling/BANDIT_ERROR_LOG.md`
2. Do not award XP
3. Wait for user direction before continuing

**If PENDING USER VALIDATION:**
Provide the user with the exact validation commands to run.
Do not proceed until the user confirms the result.

---

## Rule

A truthful stopped report is better than a false clean report.
