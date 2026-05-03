# Quest Mode Field Guide

## Why Quest Mode Exists

Some LumaWeave tasks are too large for a tiny one-file pass but too risky to perform as one blended patch. Quest Mode allows ambitious progress while preserving safe checkpoints.

Use Quest Mode when a task is:

- coherent but multi-step
- likely to touch docs + QA + tests + runtime
- built on accepted contracts
- capable of being split into independently acceptable slices

Do not use Quest Mode for chaotic bundles involving unrelated feature families.

## Good Quest Candidates

```txt
one feature family
+ accepted contract
+ clear sub-pass boundaries
+ clear evidence path
+ reversible changes
```

Examples:

```txt
Theme override storage arc:
v34a storage foundation
v34b one enabled control
v34c export/save
```

```txt
Command Deck arc:
v35 contract
v36 read-only shell
v36b one wired command proof
```

```txt
Perspective System arc:
v37 contract
v38 no-op runtime selector
v38b one safe read-only perspective proof
```

```txt
IDE Live Workspace Bridge future arc:
v41 contract
v42 passive event ingestion
v43 live activity panel
```

## Bad Quest Candidates

Avoid bundled quests like:

```txt
storage + graph renderer + new hotkeys + animations + schema + docs
```

or:

```txt
Theme Mapping controls + Sigma node styling + source adapter ingestion + preset marketplace
```

These cross too many feature families and should be split manually.

## Risk Levels

### Low Risk

Usually safe for longer quest mode.

```txt
docs-only contract
QA/advisory/backlog identity update
read-only UI shell
test-only coverage expansion
small helper module with no runtime mutation
```

### Moderate Risk

Allowed in Quest Mode with strong checkpoints.

```txt
one runtime panel feature
one enabled control with real behavior
local-only storage behind accepted contract
new registry data model
read-only adapter/event display
```

### High Risk

Stop before this unless explicitly promoted.

```txt
schema migration
multi-scope persistence
preset import/apply
Sigma renderer mutation
graph visual mapping
new hotkey framework
bidirectional IDE control
cloud/sync behavior
token promotion
large architecture rewrite
```

## Critical Boundaries

These are the boundaries that most often require a stop or split:

```txt
read-only → editable
editable → persistent
persistent → schema/migration
single scope → multiple scopes
local override → preset save/export
passive display → write-back control
DOM UI → graph/Sigma runtime
contract text → runtime guarantee
```

## What Good Bandit Behavior Looks Like

Good:

```txt
I completed v34a, validated it, committed it, and stopped before v34b for review.
```

Good:

```txt
I split v34c into v34c1 export-only and v34c2 named preset save because preset schema became broad.
```

Good:

```txt
I stopped because enabling this control would require target-scoped storage, which is outside the current accepted contract.
```

Bad:

```txt
I enabled all controls, added localStorage, created preset save, touched Sigma, and updated docs in one patch.
```

Bad:

```txt
Tests were failing so I skipped them.
```

Bad:

```txt
This control is visible but not wired yet.
```

## Recommended Prompt Language

Use phrases like:

```txt
You may attempt the whole arc, but each sub-pass is a hard checkpoint.
```

```txt
Do not blend scopes.
```

```txt
Stop before crossing into storage/schema/graph/Sigma/token-promotion/new-hotkey territory unless that boundary is explicitly part of the current sub-pass.
```

```txt
If the next step becomes high-risk, return a continuation prompt instead of continuing.
```

```txt
Each enabled control must have real behavior and Playwright proof.
```

## Acceptance Checklist

Before accepting any Quest Mode sub-pass, confirm:

```txt
- changed files match scope
- typecheck passed
- Playwright passed if runtime/QA/tests touched
- no skipped tests
- no banned hotkey active-source/current-QA references
- no DevTools manual probe wording regression
- QA identity/advisory/backlog current if touched
- no dead active controls
- no unapproved storage/schema mutation
- no graph/Sigma drift
- commit or clean ready-to-commit checkpoint exists
```

## Summary

Quest Mode should make Bandit more powerful, not less safe.

The goal is not to avoid large work. The goal is to make large work behave like a sequence of accepted contracts.
