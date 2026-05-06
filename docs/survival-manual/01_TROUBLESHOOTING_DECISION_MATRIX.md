---
id: manual.troubleshooting.matrix
title: Troubleshooting Decision Matrix
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [troubleshooting, decision, matrix, failures, survival]
---

# Troubleshooting Decision Matrix

Use this matrix before touching any failing code. Classify first, patch second.

---

## Failure Type → First Response

| Symptom | Classification | First Response |
|---------|---------------|----------------|
| Missing executable, browser, port, package | Environment Prerequisite | Repair prerequisite. Do not edit app code. |
| Playwright selector timeout, element not found | Selector / Test Harness Mismatch | Inspect with Playwright. Prefer `data-testid`. |
| Header/dropdown/report/advisory key mismatch | Identity / Key Drift | Trace canonical key through registry → UI → report → advisory. |
| State resets or persists incorrectly | Persistence / Reset Bug | Classify state as durable/per-pass/per-session/stateless before patching. |
| Browser visual error, graph disappears, console error | Runtime Lifecycle / Regression | Reproduce with Playwright. Inspect console. Patch smallest ordering issue. |
| Tests targeting old QA keys or old advisory content | Obsolete Test / Spec Debt | Delete or replace. Do not skip. |
| Fix requires files outside intended scope | Scope Creep / Architecture Boundary | Pause and report before expanding scope. |
| External library API behaving unexpectedly | Dependency / API Uncertainty | Use Context7 before patching. |
| Contract registry entry missing or stale | Contract Registry Drift | Trace from contract doc → registry → validator → test. |
| Doc path doesn't match source file | Docs / Source-of-Truth Drift | Update the doc path. Do not change source to match stale docs. |
| Two agents modifying the same file | Multi-Agent Collision | Stop. Report both agents' states. Human resolves. |

---

## Five+ Failures Simultaneously

This is a cascade. Do not patch individually.

```
1. Stop immediately
2. Classify the shared root cause (one broken shared thing causes cascades)
3. Inspect: helpers / data source / contract drift / import issue
4. Fix the shared root
5. Re-run full suite
```

A cascade is not 5 separate problems. Find the one.

---

## The Three-Strategy Rule

If the same failure occurs after 3 genuinely distinct strategies:

```
1. Back out all changes (git stash or git checkout -- .)
2. Stop the current pass
3. Print a self-split debug report
4. Wait for human input
```

Do not attempt a 4th strategy.

---

## Required Report Fields (Every Failure)

```
Input signal:
Transformation point:
Expected output:
Observed output:
Classification:
Tool used to investigate:
Smallest safe fix identified:
Proof after fix:
```

---

## Non-Negotiable Rules

- Do not patch from vibes
- Do not skip tests to make the suite green
- Do not call the app unstable when the environment is missing a prerequisite
- Do not expand scope without reporting why
- Do not continue past the 3-strategy limit
