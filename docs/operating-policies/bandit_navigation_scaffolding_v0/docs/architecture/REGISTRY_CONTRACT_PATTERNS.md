# Registry Contract Patterns

## Purpose

This document defines canonical shapes for LumaWeave registries so runtime behavior, QA reports, docs, Playwright tests, and localStorage all bind to stable identifiers.

## Identifier Families

Use the right kind of identity for the context:

```txt
IDs      = stable entity identity
Keys     = binding/version context
Handles  = user-facing/runtime control identity
Tokens   = design/style values
States   = finite modes/statuses
```

## QA Checklist Pattern

```ts
{
  qaKey: "v17a",
  featureId: "qa-key-binding-recovery",
  title: "QA Key Binding Recovery",
  status: "active",
  checks: []
}
```

Rules:

- `qaKey` is canonical for the pass.
- `featureId` describes the feature or topic.
- `title` is display text.
- Only one QA checklist should be active.

## QA Check Pattern

```ts
{
  checkId: "dropdown-selected-qa-key",
  title: "Dropdown selected value matches active qaKey",
  expected: "Dropdown selected value is v17a.",
  steps: []
}
```

Rules:

- `checkId` must be stable.
- Titles can change.
- Status and notes should bind to `checkId`, not title.

## Advisory Set Pattern

```ts
{
  advisorySetKey: "v17a",
  questions: [],
  proposalIds: [],
  backlogPolicy: "durable"
}
```

Rules:

- `advisorySetKey` should usually equal `qaKey`.
- Questions rotate by advisory set.
- Proposals and backlog are durable unless explicitly scoped.

## Advisory Question Pattern

```ts
{
  questionId: "v17a-test-skip-policy",
  prompt: "Should skipped Playwright tests block acceptance?",
  context: "Skipped tests can hide regression risk."
}
```

Rules:

- Do not rely on question index.
- Answers should bind to `questionId` and `qaKey`.

## Proposal Pattern

```ts
{
  proposalId: "checklist-identity-validation",
  title: "Checklist Identity Validation",
  risk: "low"
}
```

Rules:

- Proposal decisions persist by `proposalId`.
- Proposals can appear across multiple advisory sets.

## Control Handle Pattern

```ts
{
  handleId: "graph.nodeSize",
  settingsKey: "graph.nodeSize",
  label: "Node Size",
  controlType: "slider"
}
```

Rules:

- Every active user-facing control needs a handle.
- No dead active controls.
- Playwright test IDs should map to handles where possible.

## Theme Token Pattern

```txt
app.background
app.panel.background
app.panel.border
app.text.primary
accent.primary
graph.node.fill
graph.node.selectedFill
graph.edge.stroke
graph.edge.selectedStroke
effects.glow.color
```

Rules:

- Tokens are not controls.
- Tokens are design values consumed by controls, CSS, and renderers.

## Graph State Pattern

```ts
type GraphVisualState =
  | "default"
  | "hovered"
  | "selected"
  | "neighbor"
  | "dimmed"
  | "source"
  | "target";
```

Rules:

- Graph visual states should be explicit.
- Renderer behavior should not fall back to default during transitions.

## LocalStorage Pattern

```txt
lumaweave.qa.activeKey
lumaweave.qa.workingState.v17a
lumaweave.advisory.answers.v17a
lumaweave.advisory.proposalDecisions
lumaweave.advisory.backlogOrder
lumaweave.settings
```

Rules:

- Per-pass state includes `qaKey`.
- Durable state does not include `qaKey` unless migration requires it.
- Persisted state must be defensively parsed and migrated.
