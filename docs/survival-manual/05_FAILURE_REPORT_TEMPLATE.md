---
id: manual.failure.report.template
title: Failure Report Template
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [failure, report, template, survival]
---

# Failure Report Template

Use this template whenever a pass fails, a cascade appears, or a stop condition is hit.

---

## Standard Failure Report

```
FAILURE REPORT
══════════════════════════════════════════════════

Pass:          [version / task name]
Agent:         [Bandit / DeepSeek / other]
Active QA key: [current key]

──────────────────────────────────────────────────
FAILURE

Symptom:
  [what visibly went wrong]

Exact error or test output:
  [paste verbatim]

Classification (from Diagnostic Router):
  [Environment / Selector / Identity / Persistence / Runtime /
   Obsolete / Scope / Dependency / Contract / Docs / Multi-Agent / Unknown]

──────────────────────────────────────────────────
INVESTIGATION

Input signal:
Transformation point:
Expected output:
Observed output:
Tool used:

──────────────────────────────────────────────────
FIX ATTEMPTED

Hypothesis:
Action taken:
Result:

──────────────────────────────────────────────────
CURRENT STATE

Files changed (if any):
Repo state: [clean / dirty]
Recommendation: [CONTINUE / STOP — NEEDS HUMAN / SELF-SPLIT]

══════════════════════════════════════════════════
```

---

## Cascade Report (5+ failures)

```
CASCADE REPORT
══════════════════════════════════════════════════

Pass:      [version / task name]
Failures:  [exact count]

Shared root cause hypothesis:
  [what one thing broke all of these]

Files inspected:
  [helpers / registries / imports / data sources checked]

Recommendation: STOP — fix shared root before any individual patch

══════════════════════════════════════════════════
```

---

## Rule

A truthful stopped report is better than a false clean report.
