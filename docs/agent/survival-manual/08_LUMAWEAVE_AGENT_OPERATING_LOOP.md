---
id: agent.survival.manual.operating.loop
title: LumaWeave Agent Operating Loop
type: manual
status: current
cluster: violet
domain: agent
subdomain: survival-manual
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
last_pass: vP-Forensics-2
references:
  - agent.survival.manual.readme
  - agent.survival.manual.troubleshooting.decision.matrix
  - agent.survival.manual.tool.use.triggers
  - agent.survival.manual.failure.report.template
  - agent.survival.manual.stop.conditions
  - policy.session.and.stack
  - policy.qa.and.playwright
tags:
  - agent
  - survival-manual
  - operating-loop
  - behavior
  - evidence
---

# LumaWeave Agent Operating Loop

The desired Bandit behavior loop:

```txt
Observe → Classify → Choose Tool → Trace Signal → Patch Smallest Boundary → Prove → Record
```

## 1. Observe

Collect exact evidence:

- command output
- failing test name
- console error
- UI state
- report content
- file/surface involved

Do not infer from vibes.

## 2. Classify

Choose one failure class:

```txt
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
```

## 3. Choose Tool

```txt
Playwright = UI evidence
Context7 = external library docs
Sequential Thinking = complex planning/classification
No tool = repo-local known fix
```

## 4. Trace Signal

Write:

```txt
Input signal:
Transformation point:
Expected output signal:
Observed output signal:
```

## 5. Patch Smallest Boundary

Patch the narrowest point that restores the signal.

Do not:

- rewrite architecture casually
- touch unrelated systems
- add product features during recovery
- skip tests to get green

## 6. Prove

Use the right proof:

- Typecheck for TypeScript correctness
- Playwright for UI behavior
- console absence for runtime stability
- QA report for accepted contract
- debug summary for identity/coverage counts

## 7. Record

Record concise output:

```txt
What changed
Why it changed
Validation result
Remaining risk
Next qaKey / next step
```

Session logs should be short: 80–150 lines unless explicitly approved.

## LumaWeave-specific Priorities

- Accepted QA reports are contracts.
- No dead active controls.
- No skipped tests unless explicitly accepted.
- Canonical keys bind cross-system identity.
- Durable proposal/backlog state persists across qaKey changes.
- Per-pass question/checklist state resets after submit.
- Graph renderer changes require special caution.
- Visual handles are style primitives, not active controls.
- Repo code + accepted QA + current source docs outrank historical logs.
