# Self-Splitting Quest Protocol

## Status

Durable Bandit operating protocol.

This protocol is intended for long LumaWeave implementation or documentation quests where the requested work may cross multiple architecture boundaries. It allows Bandit to operate for longer arcs while preserving evidence-driven checkpoints, accepted QA contracts, and safe stop behavior.

## Purpose

LumaWeave benefits from ambitious, multi-step development arcs, but large blended changes can create unsafe blast radius. The Self-Splitting Quest Protocol lets Bandit receive a broad mission, split it into independently acceptable sub-passes, execute only safe slices, and stop with a useful report before crossing a critical risk boundary.

Core idea:

```txt
long quest
→ inspect
→ split by architecture boundary
→ execute safe sub-pass
→ validate
→ checkpoint/commit
→ continue only if safe
→ stop and report when risk rises
```

## Operating Principle

Bandit may work on long quests only when it treats each sub-pass as independently acceptable.

Each sub-pass must have:

- one clear goal
- explicit allowed scope
- explicit forbidden scope
- evidence requirements
- QA identity if QA changes
- Playwright/typecheck validation when runtime/QA/tests are touched
- clean checkpoint before the next sub-pass

Do not blend sub-passes.

## Quest Modes

### Mode 1 — Single Bite

Use for narrow tasks.

```txt
Do exactly one scoped pass.
Validate.
Report.
Stop.
```

### Mode 2 — Linear Quest

Use when the user or prompt already defines the sub-passes.

```txt
Execute sub-pass A.
Validate.
Report/commit.
Only then execute sub-pass B.
```

### Mode 3 — Self-Splitting Quest

Use when the user gives a broad goal but not a safe split.

```txt
Inspect the goal.
Identify architecture boundaries.
Create an internal split plan.
Execute the first safe sub-pass.
Continue only if explicitly allowed and validation stays clean.
Stop before high-risk or ambiguous boundaries.
```

### Mode 4 — Survey Only

Use when implementation risk is unclear.

```txt
Inspect.
Split.
Recommend.
Do not edit.
```

## Architecture Boundaries That Require Splitting

Split the quest whenever work crosses any of these boundaries:

```txt
docs/contract → runtime behavior
runtime display → enabled control
enabled control → storage
storage → schema/migration
single-scope behavior → multi-scope behavior
local override → preset save/export
DOM UI → graph/Sigma renderer
passive display → write-back action
QA identity → accepted evidence
existing token use → token promotion
existing hotkey behavior → new hotkey system
read-only data → mutation/persistence
local-only behavior → sync/cloud behavior
one feature family → another feature family
```

Crossing a boundary does not mean the task is forbidden. It means the quest must be split and the boundary must be accepted deliberately.

## Mandatory Preflight

Before editing during any quest mode, run or inspect:

```bash
git status --short
git log --oneline -5
```

If the working tree is dirty, stop and classify the dirt before editing.

## Per-Sub-Pass Validation

After each implemented sub-pass, run:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
grep -R "Run window.__lwRunThemeTargetProbe() from devtools\|triggered from DevTools\|can be triggered from DevTools" -n src docs tests || true
git diff --name-only
git status --short
```

For docs-only passes where runtime/QA/tests are untouched, typecheck/Playwright may be omitted only if the prompt explicitly permits it. If QA or tests are touched, Playwright is required.

## Hotkey Report Format

Report hotkey grep as:

```txt
Banned hotkey check:
- active runtime/source/tests/current QA: clean
- historical/policy references: allowed
```

If banned hotkey names appear in active source/tests/current QA wording, stop or clean them before acceptance.

## Mandatory Stop Conditions

Stop and report instead of continuing if:

- the next step requires storage/schema beyond accepted contract
- graph/Sigma renderer changes appear necessary
- planned tokens need promotion
- tests would need to be weakened or skipped
- active controls would be dead/unwired
- broad architecture rewrite is required
- implementation scope crosses into a new feature family
- QA identity/advisory/backlog cannot be made current
- validation fails outside the scoped files
- typecheck failures point outside the sub-pass scope
- Playwright failures require unrelated changes
- local-first behavior would require cloud/sync assumptions
- the implementation depends on guessing hidden architecture

## Checkpoint Requirements

Before starting the next sub-pass, the current sub-pass must have:

```txt
- clear acceptance report
- validation evidence
- git diff/file list reviewed
- no skipped tests
- QA identity/advisory/backlog current if touched
- no dead active controls
- no unresolved stop condition
- clean commit or explicit ready-to-commit state
```

## Stop Report Format

When stopping at a checkpoint, return:

```txt
STOPPED AT CHECKPOINT

Completed sub-pass:
Files changed:
Behavior implemented:
Validation:
Acceptance recommendation:

Reason for stop:
Risk boundary encountered:
Recommended next split:
Suggested next prompt:
```

## Completion Report Format

For a completed quest, return:

```txt
Quest Complete
Acceptance Recommendation: ACCEPT / DO NOT ACCEPT

Sub-pass reports:
- sub-pass id
- files changed
- behavior
- validation
- commit/hash if committed

Overall:
- final git status
- final git log --oneline -5
- stopped/deferred scope
- follow-up recommendation
```

## LumaWeave-Specific Guardrails

Always preserve these project rules:

- Evidence before acceptance.
- Accepted QA reports are contracts.
- No manual DevTools JavaScript acceptance path.
- No skipped tests.
- No weakened tests.
- No dead active controls.
- No storage/schema changes without explicit contract.
- No new free-floating hotkeys before Command Deck / Hotkey Registry.
- No graph/Sigma renderer mutation during DOM Theme Target or Theme Mapping work.
- Planned tokens remain dormant until promoted through full governance.
- Source adapters and future IDE integrations must remain modular; no source-specific hacks in core graph renderer.

## Summary

The Self-Splitting Quest Protocol gives Bandit permission to be ambitious without becoming chaotic.

Best pattern:

```txt
big destination
+ small independently acceptable slices
+ hard stop gates
+ validation after every slice
+ commit/checkpoint before continuing
```
