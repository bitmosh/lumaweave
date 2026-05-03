# Playwright Operating Procedures Manual

## Status

Durable Bandit operating guidance.

This document defines how Bandit should add, diagnose, and repair Playwright tests in LumaWeave without destabilizing accepted behavior contracts.

It is not an active feature contract by itself. It should be read alongside:

```txt
docs/LUMAWEAVE_PLAYWRIGHT_TESTING_GUIDE.md
docs/control-plane/qa/BACKLOG_POLICY.md
docs/mission-control/QA_ADVISORY_PROTOCOL.md
docs/lumaweave_bandit_brain_packet/docs/agent-learning/08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
docs/lumaweave_bandit_brain_packet/docs/agent-learning/09_SELF_SPLITTING_QUEST_PROTOCOL.md
```

## Purpose

LumaWeave uses Playwright as a primary acceptance evidence path. Accepted QA reports are contracts. Once behavior is accepted, later test additions must not casually disturb older accepted tests.

New tests should prove new behavior without weakening or destabilizing older behavior.

This manual exists because adding new Playwright tests can produce disruption waves when tests share app state, browser storage, QA identity assumptions, global helpers, brittle selectors, or evolving Mission Control surfaces.

## Core Rule

Adding tests for a new pass must not silently break old accepted contracts.

If older tests fail after adding new tests, Bandit must classify the failure before patching.

Do not skip, weaken, or rewrite old tests just to make the suite green.

## Accepted Evidence Paths

Preferred evidence:

```txt
Playwright assertions
QA Debug / in-app readouts
visible app behavior
typecheck/build output
git diff/file inspection
```

Discouraged or forbidden evidence:

```txt
manual DevTools JavaScript
manual JS object-array inspection
"trust me from code inspection"
requiring the user to manually call window probes
skipped tests
weakening tests to match broken behavior
```

Playwright may use browser evaluation internally for controlled setup/cleanup when needed, but acceptance must be based on visible behavior, assertions, and explicit test evidence, not manual console instructions.

## Why New Tests Can Break Old Tests

Playwright tests are separate on paper, but they often share assumptions.

Common shared surfaces:

```txt
localStorage/sessionStorage
pinned inspector entity state
Mission Control tab state
QA identity/current checklist key
advisory/proposal/backlog registry helpers
browser keyboard state
DOM structure
test IDs
route setup
global fixtures
shared helper functions
parallel browser contexts
```

A new test range such as tests 92-97 can break older tests 35-62 if the new tests modify any shared assumption.

This is usually not random. It is usually one of:

```txt
state leakage
current QA identity drift
centralized contract-registry helper drift
brittle selectors
parallel storage collision
old tests using "latest/current" instead of version-scoped expectations
agent over-repairing shared helpers
```

## Failure Classification Before Repair

When older tests fail after a new Playwright addition, classify each failure before editing.

Use this taxonomy:

### 1. Real Regression

The application behavior accepted by an earlier pass actually broke.

Signals:

```txt
old test fails when run alone
visible behavior is missing
old accepted control no longer works
old contract text/state disappeared
```

Action:

```txt
fix runtime behavior or revert the offending change
do not weaken the old test
```

### 2. State Leakage

New tests leave app/browser state behind and older tests inherit it.

Signals:

```txt
old test passes alone
new test passes alone
old + new fail together
failures depend on test order
localStorage/sessionStorage/pinned target state persists
```

Action:

```txt
add isolated setup/cleanup
clear localStorage/sessionStorage when appropriate
reset pinned inspector/theme override state
prefer stable app reset helpers
avoid making whole suite serial unless isolation is impractical
```

### 3. Current QA Identity Drift

Older tests assert a current QA key/checklist/advisory that intentionally moved to a newer pass.

Signals:

```txt
failure is exact text for current qaKey
old feature behavior still works
current checklist/advisory changed from v32 to v33/v34/etc.
```

Action:

```txt
separate historical contract assertions from current-pass identity assertions
update only the current-pass expectation path
do not erase historical contract coverage
```

### 4. Centralized Registry Helper Drift

Shared helper data changed and rippled into old assertions.

Signals:

```txt
many contract-registry tests fail at once
failures reference expected checklist/advisory counts
one shared "latest key" helper impacts many versions
```

Action:

```txt
make tests version-scoped
avoid one mutable "current latest" expectation for historical contracts
update shared helpers only with explicit intent
```

### 5. Brittle Selector Drift

New UI elements shift positions or text, causing old tests to click/read the wrong thing.

Signals:

```txt
nth() selectors fail
role selectors match multiple elements
text selectors become ambiguous
new reset/export button changes button index
```

Action:

```txt
add stable data-testid values
prefer getByTestId for evolving UI surfaces
avoid nth-child and broad text selectors for critical controls
```

### 6. Parallel Test Collision

Parallel tests share storage or persistent context.

Signals:

```txt
failures vary between runs
storage-mutating tests collide
tests pass serially but fail in parallel
```

Action:

```txt
isolate browser contexts
clear storage before each relevant test
scope serial mode only to the minimal group if unavoidable
```

### 7. Over-Repair / Test Weakening

The agent modifies old tests or helpers too broadly to satisfy new behavior.

Signals:

```txt
old expected text removed without justification
assertions become weaker
test.skip appears
new broad helper hides missing behavior
```

Action:

```txt
stop and report
restore accepted contract intent
repair underlying cause
do not skip or weaken
```

## Regression Containment Procedure

When new tests appear to break older tests, use this exact process.

### Step 1 — Capture the Failure

Run the full command first:

```bash
npm run qa:e2e
```

Record:

```txt
failed test names
first failing assertion per test
file and line
screenshots/traces if generated
whether failures are old tests, new tests, or both
```

### Step 2 — Run Old Failures Alone

Run the specific failing old test file or test title.

Examples:

```bash
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line
npx playwright test tests/e2e/theme-target-inspector.spec.ts --reporter=line
```

If the old test fails alone, suspect real regression, stale assertion, or selector drift.

If it passes alone, suspect state leakage or order/parallel collision.

### Step 3 — Run New Tests Alone

Run the new test file or new test titles.

Example:

```bash
npx playwright test tests/e2e/theme-override-storage.spec.ts --reporter=line
```

If new tests fail alone, fix the new tests or new behavior first.

### Step 4 — Run Old + New Together

Run the old failing file and new file together.

Example:

```bash
npx playwright test tests/e2e/contract-registry.spec.ts tests/e2e/theme-override-storage.spec.ts --reporter=line
```

Interpretation:

```txt
old passes alone + new passes alone + old/new fail together = state leakage or shared fixture collision
old fails alone = regression, stale expectation, or brittle selector
many unrelated old tests fail = shared helper or current QA identity drift
```

### Step 5 — Classify Before Editing

For every failure, report:

```txt
test name:
failure:
classification:
supporting evidence:
proposed fix:
files likely touched:
risk:
```

Do not patch before classification when older accepted tests are involved.

### Step 6 — Apply Narrow Fix

Fix the root cause narrowly.

Preferred fixes:

```txt
add setup/cleanup
add stable test IDs
split current-pass identity tests from historical contract tests
make helper version-scoped
restore accepted behavior
```

Avoid:

```txt
skipping tests
weakening assertions
broad helper rewrites
changing old expected behavior without contract reason
```

### Step 7 — Validate

After runtime/QA/test changes, run:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
grep -R "Run window.__lwRunThemeTargetProbe() from devtools\|triggered from DevTools\|can be triggered from DevTools" -n src docs tests || true
git diff --name-only
git status --short
```

Report hotkeys as:

```txt
Banned hotkey check:
- active runtime/source/tests/current QA: clean
- historical/policy references: allowed
```

## Test Design Rules

### Rule 1 — Version-Scope Contract Assertions

Historical contracts should assert their own accepted behavior, not mutable latest-pass state.

Bad:

```txt
old v31 test expects current QA key
```

Good:

```txt
v31 behavior test proves visual handles cite canonical token paths
current-pass test separately proves active key is v34b
```

### Rule 2 — Keep Current-Pass Identity Tests Isolated

Only one small set of tests should assert the current active QA key/checklist/advisory/backlog.

Older feature tests should not fail merely because active identity moved from v34a to v34b.

### Rule 3 — Use Stable Test IDs for Evolving UI

Prefer:

```txt
data-testid="theme-mapping-panel-background-override-input"
data-testid="theme-mapping-panel-background-reset"
data-testid="qa-current-checklist-key"
```

Avoid:

```txt
nth button
third row
first matching visible text
broad role selector with ambiguous name
```

### Rule 4 — Reset Shared State Explicitly

Storage-mutating tests must reset relevant storage.

Potential shared state:

```txt
localStorage
sessionStorage
theme overrides
pinned inspector target
Mission Control open tab
QA debug expanded state
```

### Rule 5 — Test New Behavior Without Mutating Old Contracts

When adding tests for v34c, do not edit v34a/v34b tests unless the failure is classified and the fix is targeted.

### Rule 6 — Avoid Hidden Manual Acceptance Paths

It is acceptable for tests to use setup helpers. It is not acceptable for user acceptance to require manual DevTools calls.

Do not document acceptance as:

```txt
open console and call window.__...
```

## Standard Failure Report Template

Use this when older tests fail.

```txt
Playwright Regression Classification Report

New pass:
Changed files:

Full command:
Result:

Failed old tests:
1.
- test:
- file/line:
- assertion:
- classification:
- evidence:
- proposed fix:

Failed new tests:
1.
- test:
- file/line:
- assertion:
- classification:
- evidence:
- proposed fix:

Isolation runs:
- old failing test alone:
- new tests alone:
- old + new together:

Likely root cause:
- state leakage / current QA identity drift / shared helper drift / brittle selector / real regression / other

Files proposed for fix:

Forbidden changes avoided:
- no test.skip
- no weakened historical contract
- no manual DevTools acceptance
- no broad helper rewrite unless justified

Validation after fix:
...
```

## Bandit Stop Conditions

Stop and report instead of repairing blindly if:

```txt
more than 3 older accepted tests fail unexpectedly
failures span multiple unrelated files
fix appears to require weakening accepted tests
fix requires rewriting shared registry helpers broadly
fix requires changing accepted QA reports
storage/schema behavior changes unexpectedly
graph/Sigma renderer changes appear necessary
new tests only pass by serializing the whole suite
the root cause is not classifiable
```

## Bandit Prompt Add-On

Use this block in future Playwright-heavy prompts.

```txt
Playwright Regression Containment Rule:

When adding or changing Playwright tests, do not modify older accepted tests or shared helpers until failures are classified.

If older tests fail after adding new tests:
1. Re-run the older failing test/file alone.
2. Re-run the new tests alone.
3. Re-run old + new together.
4. If old passes alone but fails with new, suspect state leakage.
5. If old fails alone after code changes, suspect regression, stale assertion, or brittle selector.
6. If failure is current QA identity text only, update only the current-pass assertion path.
7. If failure is selector drift, prefer stable test IDs over weaker assertions.
8. Stop before weakening any accepted contract expectation.

Report classification before broad repair.
```

## Summary

Older Playwright tests should behave like accepted contracts, but they can only stay stable if the suite separates:

```txt
historical behavior contracts
current-pass QA identity
shared browser/app state
storage-mutating tests
evolving UI selectors
```

New tests should extend evidence coverage without creating disruption waves.

When waves happen, classify before patching.
