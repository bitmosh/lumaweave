# Advisory State Model

## Purpose

This document defines which Mission Control advisory state resets per QA report and which state persists across QA keys.

## Core Rule

```txt
Questions rotate by qaKey.
Proposal decisions and backlog order persist by durable IDs.
```

## Per-Pass State

These reset after submit:

- checklist statuses
- checklist notes
- Bandit Question answer text
- Bandit Question status
- temporary proposal notes if report-specific
- current working report fields

These should usually include the current `qaKey` in their storage key.

Example:

```txt
lumaweave.qa.workingState.v17a
lumaweave.advisory.answers.v17a
```

## Durable State

These persist across submit and across QA key changes:

- proposal decisions
- backlog order
- roadmap acceptance decisions
- user settings
- theme preset

These should not include a per-pass QA key unless versioned migration is necessary.

Example:

```txt
lumaweave.advisory.proposalDecisions
lumaweave.advisory.backlogOrder
lumaweave.settings
```

## Advisory Questions

Each advisory question should have a stable `questionId`.

```ts
{
  questionId: "v17a-test-skip-policy",
  prompt: "Should skipped Playwright tests block acceptance?",
  context: "Skipped tests can hide regression risk."
}
```

Question answers are per-pass and should reset after submit.

## Proposals

Each proposal should have a durable `proposalId`.

```ts
{
  proposalId: "checklist-identity-validation",
  title: "Checklist Identity Validation"
}
```

Proposal decisions persist globally unless the user explicitly resets them.

## Backlog

Each backlog item should have a stable `backlogItemId`, often matching its `proposalId`.

Backlog order persists globally unless explicitly reset.

## Submit Behavior

On successful submit:

Reset:

- checklist working statuses
- checklist working notes
- current advisory question answers
- current advisory question statuses
- report-specific proposal notes

Preserve:

- proposal decisions
- backlog order
- accepted roadmap decisions

On blocked submit:

Preserve everything. Do not reset fields. Do not create a report. Do not update history.
