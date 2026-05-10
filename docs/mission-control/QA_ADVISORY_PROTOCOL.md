---
id: mission.control.qa.advisory.protocol
title: QA Advisory Protocol
type: protocol
status: accepted
version: v73c
cluster: slate
domain: mission-control
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - mission.control.overview
  - agent.protocols.advisory.state.model
  - agent.protocols.qa.key.lifecycle
tags: [QA, advisory, protocol, questions, proposals, backlog]
---

# QA Advisory Protocol

---

## Canonical QA Key Tags

Each QA set has a unique canonical `qaKey` binding all identity surfaces:

```
v74      major key (new topic / new arc)
v74a     sub-pass within v74 arc (continuation / repair)
v74b     sub-pass within v74 arc
v75      next major key (new arc)
```

Sub-pass keys: same major topic, continuation or repair.
Major keys: new product topic, new primary QA focus.

---

## Required Identity Surfaces — All Must Agree

```
QA dropdown selected value
Header badge
Active checklist object
Submitted report "Checklist Key"
Submitted report "Advisory Set Key"
Copy Last Submission output
QA history entry
Debug diagnostics
Advisory question set
```

If any disagree, the pass is not acceptable. Identity drift is a hard blocker.

---

## Advisory Content Structure

Per-checklist advisory sections include:

```
Questions:   Bandit Questions with prompt, context, response fields
Proposals:   Proposed next actions with risk assessment + decision tracking
Backlog:     Prioritized future work items with reorder capability
```

---

## Advisory Question Rules

```typescript
{
  questionId: "v74a-source-adapter-safety-gate",
  prompt: "Should the Source Adapter OS have a local-only restriction by default?",
  context: "Local-first is the core architecture principle."
}
```

- `questionId` must be stable — used as the localStorage key
- Questions rotate by `qaKey` — old questions are hidden when new key is active
- Answers are per-pass (reset after submit)
- Stale questions are hidden when a new `qaKey` becomes active

---

## Proposal Rules

```typescript
{
  proposalId: "grammar-lens-contract-urgent",
  title: "Grammar Lens Contract — Urgent Insert",
  summary: "Write formal governance before overlay is extended further",
  risk: "low",
  recommendedAction: "docs-only pass, one session"
}
```

- `proposalId` must be stable and durable
- Proposal decisions (`userDecision`) persist across QA key changes
- Do not erase durable proposal state when `qaKey` changes
- Do not use empty proposals/backlog to avoid test failures

---

## Backlog Rules

- Each backlog item has a stable `backlogItemId` (usually matches `proposalId`)
- Backlog order persists globally unless explicitly reset
- Active backlog = items that still require action
- Do not let the backlog become a list of completed work
- Completed items are marked done or removed — not left in active backlog

---

## Fallback Advisory Rule

Fallback advisory content is NOT valid current-pass evidence.

If the advisory section is missing for the current QA key, that is a QA bundle drift error. Fix the bundle. Do not use fallback as if it represents current work.

---

## Stale localStorage Rule

Stale localStorage keys for old QA passes are ignored when a new `qaKey` is active. Version comparison uses numeric `qaVersion`, not string comparison. Do not let old localStorage state contaminate a new pass.

---

## Submit Behavior

**Reset after submit:**
```
Checklist statuses
Checklist notes
Question answer text (userResponse)
Question status
Temporary proposal notes (if report-specific)
```

**Preserve after submit:**
```
Proposal decisions (userDecision)
Backlog order
Accepted roadmap decisions
```

**On blocked submit (validation failed):**
Preserve everything. Do not create a report. Do not update history.
