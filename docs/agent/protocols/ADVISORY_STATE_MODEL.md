---
id: protocol.advisory.state.model
title: Advisory State Model
type: protocol
status: accepted
domain: agent
subdomain: protocols
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
tags:
  - advisory
  - state
  - model
  - protocol
  - QA
references:
  - protocol.qa.key.lifecycle
  - protocol.pass.transition
last_pass: vP-Forensics-2
---

# Advisory State Model

Defines which Mission Control advisory state resets per QA report and which state persists across QA keys.

---

## Core Rule

```
Questions rotate by qaKey.
Proposal decisions and backlog order persist by durable IDs.
```

---

## Per-Pass State (Resets After Submit)

```
checklist statuses
checklist notes
Bandit Question answer text
Bandit Question status
temporary proposal notes (if report-specific)
current working report fields
```

Storage keys should include the current qaKey:
```
lumaweave.qa.workingState.v74a
lumaweave.advisory.answers.v74a
```

---

## Durable State (Persists Across Submit and QA Key Changes)

```
proposal decisions
backlog order
roadmap acceptance decisions
user settings
theme preset
```

Storage keys should NOT include a per-pass QA key:
```
lumaweave.advisory.proposalDecisions
lumaweave.advisory.backlogOrder
lumaweave.settings
```

---

## Advisory Questions

Each advisory question must have a stable `questionId`:

```typescript
{
  questionId: "v74a-source-adapter-safety",
  prompt: "Should the Source Adapter OS have a local-only restriction by default?",
  context: "Local-first is the core architecture principle."
}
```

Question answers are per-pass and reset after submit.

---

## Proposals

Each proposal must have a durable `proposalId`:

```typescript
{
  proposalId: "source-adapter-foundation-contract",
  title: "Source Adapter OS Foundation Contract"
}
```

Proposal decisions persist globally unless explicitly reset by user.

---

## Backlog

Each backlog item must have a stable `backlogItemId` (usually matching `proposalId`).
Backlog order persists globally unless explicitly reset.

---

## Submit Behavior

**On successful submit — reset:**
```
checklist working statuses
checklist working notes
current advisory question answers and statuses
report-specific proposal notes
```

**On successful submit — preserve:**
```
proposal decisions
backlog order
accepted roadmap decisions
```

**On blocked submit — preserve everything:**
Do not reset fields. Do not create a report. Do not update history.

---

## Fallback Advisory Rule

Fallback advisory content is NOT valid current-pass evidence.

If the active advisory section is missing for the current QA key,
that is a QA bundle drift error. Fix the bundle. Do not treat the
fallback as if it represents current work.
