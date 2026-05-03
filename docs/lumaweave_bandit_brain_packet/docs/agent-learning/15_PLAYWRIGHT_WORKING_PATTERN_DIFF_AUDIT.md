# Playwright Working Pattern Diff Audit

## Status

Durable Bandit operating memory.

This document defines how Bandit should use working Playwright files, accepted green commits, selector contracts, and source diffs to diagnose test cascades.

It is a companion to:

```txt
08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
13_MCP_TOOL_SUITE_PROTOCOL.md
14_BANDIT_ABILITY_AUDIT.md
```

## Purpose

When a new Playwright pass causes old accepted tests to fail, Bandit should not repair each failing test one by one.

A cascade is usually not 48 independent failures.

A cascade is usually one shared contract breaking through many tests.

This manual teaches Bandit to compare:

```txt
last accepted green commit
+ working Playwright files
+ failing Playwright files
+ shared helpers
+ source components
```

to infer the intended contract and find the real root cause.

## Core Rule

Do not patch failing Playwright files individually during a cascade.

Use working tests and the last accepted green commit to infer the intended structure.

```txt
working tests = reference patterns
broken tests = drift candidates
diff = explanation of what changed
fix = restore or extend the proven pattern narrowly
```

## When To Use This Protocol

Use this protocol whenever:

```txt
new tests cause older accepted tests to fail
more than 3 older tests fail unexpectedly
many failures mention the same missing locator
qa-panel or mission-control.panel disappears
old tests worked earlier in the day and now fail
Playwright output shows cascading locator failures
new tests pass alone but old tests fail in full suite
a helper change affects many unrelated files
a current QA identity update breaks historical tests
```

## Last Accepted Green Commit

Before diagnosing, identify the last accepted green commit.

Example:

```txt
38c6279 feat: enable narrow theme mapping override control
```

Do not assume `HEAD` is accepted merely because it is committed.

A committed pass can still be:

```txt
committed but not accepted
```

if full validation failed or was canceled.

## Required Early-Stop Rule

When a cascade starts, do not wait for the whole suite to fail.

Use:

```bash
npm run qa:e2e -- --reporter=line --max-failures=5
```

If package script argument passing fails, use:

```bash
npx playwright test --reporter=line --max-failures=5
```

Stop after the first 5 failures and classify.

## Initial Truth Commands

Run:

```bash
git status --short
git log --oneline -8
npm run typecheck
npm run qa:e2e -- --reporter=line --max-failures=5
```

If the command runs from the wrong directory or git fails with `not a git repository`, stop and fix command context before interpreting test failures.

## Diff Commands Against Last Green

Use the last accepted green commit as the reference.

Replace `LAST_GREEN` with the actual commit hash.

```bash
git diff --name-only LAST_GREEN..HEAD
git diff --stat LAST_GREEN..HEAD
git diff LAST_GREEN..HEAD -- tests/e2e
git diff LAST_GREEN..HEAD -- tests/e2e/helpers
git diff LAST_GREEN..HEAD -- src/control-plane/qa/QaPanel.tsx
git diff LAST_GREEN..HEAD -- src/control-plane/panels/ThemeMappingPanel.tsx
git diff LAST_GREEN..HEAD -- src/themes/themeOverrideStorage.ts
git diff LAST_GREEN..HEAD -- src/main.tsx
```

If the cascade involves another surface, add the relevant source file.

## Working Pattern Audit

Before editing, identify:

```txt
one old passing test
one old failing test
one new test from the current pass
one shared helper involved, if any
one source component providing the missing UI contract
```

Compare:

```txt
page.goto usage
setup/cleanup
localStorage/sessionStorage handling
helper imports
Mission Control opening path
qa-panel locator pattern
data-testid expectations
current QA identity expectations
pinned target assumptions
keyboard state assumptions
parallel execution assumptions
```

## Working Pattern Audit Report

Bandit must report this before patching during a cascade:

```txt
Working Pattern Diff Audit

Last accepted green commit:
Current HEAD:

Working reference test:
- file:
- title:
- selector/setup pattern:

Failing old test:
- file:
- title:
- failing assertion:
- selector/setup pattern:

New current-pass test:
- file:
- title:
- selector/setup pattern:

Shared helper(s):
- file:
- pattern:
- changed since last green? yes/no

Source contract provider:
- file/component:
- expected test id/class/attribute:
- changed since last green? yes/no

Differences found:
- setup differences:
- locator differences:
- storage/state differences:
- helper differences:
- source/runtime differences:

Conclusion:
- likely root cause:
- classification:
- proposed narrow fix:
```

## Selector Contract Map

If many failures mention the same missing locator, build a selector contract map.

Example:

```txt
Selector Contract Map

qa-panel:
- expected provider:
- expected selector:
- old working tests using it:
- failing tests using it:
- current source provides it? yes/no
- changed since last green? yes/no
- likely fix:

mission-control.panel:
- expected provider:
- expected selector:
- old working tests using it:
- failing tests using it:
- current source provides it? yes/no
- changed since last green? yes/no
- likely fix:

theme-mapping-panel:
- expected provider:
- expected selector:
- old working tests using it:
- failing tests using it:
- current source provides it? yes/no
- changed since last green? yes/no
- likely fix:
```

## Common Cascade Signatures

### Missing `qa-panel`

Symptoms:

```txt
getByTestId("qa-panel").nth(1) not found
locator("[data-testid='qa-panel'].lw-panel") not found
Mission Control tabs not visible
Advisory tab not visible
QA notes tests fail
```

Likely shared causes:

```txt
Mission Control no longer renders
QaPanel root lost data-testid="qa-panel"
QaPanel root lost lw-panel class expected by old tests
app boot failed before QA panel mounted
test helper assumes duplicate qa-panel instances and nth(1) changed
current route/layout no longer opens Mission Control by default
```

Do not patch all tests.

Inspect:

```txt
src/control-plane/qa/QaPanel.tsx
src/main.tsx
app shell/root component
tests/e2e/helpers/qa.ts
```

Compare against last green.

### Missing `mission-control.panel`

Symptoms:

```txt
[data-lw-theme-target="mission-control.panel"] not found
mission-control.panel hover times out
registered target cannot be pinned
ghost overlay missing mission-control.panel
```

Likely shared causes:

```txt
Mission Control panel is not mounted
theme target attribute was removed or moved
registered target changed ID/name
app boot failed before Mission Control mounted
layout condition hides panel
```

Inspect:

```txt
src/control-plane/qa/QaPanel.tsx
theme target registration/inventory
ThemeTargetInspectorOverlay
ThemeMappingPanel only if it changes panel rendering
```

### Many Old Tests Fail But App Smoke Passes

Likely causes:

```txt
Mission Control subtree regression
current QA identity drift
selector drift
shared helper issue
state leakage
```

Do not assume app is fine just because smoke passes.

### New Tests Pass Alone, Old Tests Fail Together

Likely causes:

```txt
state leakage
parallel collision
localStorage/sessionStorage residue
pinned target state
Mission Control tab state
```

Fix setup/cleanup, not old contracts.

### Old Tests Fail Alone After New Commit

Likely causes:

```txt
real regression
source contract broken
selector contract broken
current QA identity assertion moved
```

Compare old source/test to last green.

## Classification Rules

Use one primary classification.

```txt
app boot/runtime crash
real regression
state leakage
current QA identity drift
centralized registry/helper drift
brittle selector drift
parallel collision
wrong working directory / command context issue
over-repair/test weakening risk
unknown
```

If the root cause is unknown after first 5 failures and diff audit, stop and report.

## When To Fix App vs Tests

### Fix the app/source if:

```txt
old accepted tests fail alone
accepted selector contract disappeared
accepted data-testid/class/attribute was removed unintentionally
Mission Control no longer renders
runtime code throws during startup
accepted behavior visibly regressed
```

### Fix the tests if:

```txt
old test asserts current QA identity instead of historical behavior
old selector is brittle and stable test ID preserves same behavior
new test setup leaks state into old tests
new test uses wrong setup path
shared helper is provably outdated
```

### Do Not Fix By:

```txt
test.skip
weakening accepted assertions
deleting old tests
changing old expected behavior without contract reason
serializing the whole suite unless proven unavoidable
rewriting broad helpers without classification
```

## Pattern Library Strategy

Bandit should treat working tests as a pattern library.

Examples of patterns to extract:

```txt
how app is opened
how Mission Control is located
how Advisory tab is opened
how UI Inspector is enabled
how pin hotkey is triggered
how storage is reset
how localStorage is inspected
how generated Theme Mapping rows are found
```

Use working patterns to design new tests.

Do not invent new setup paths when a stable helper already exists.

## Helper Audit Strategy

If many tests fail through the same helper, inspect the helper and its callers.

Example:

```txt
tests/e2e/helpers/qa.ts
```

Questions:

```txt
Did the helper change since last green?
Does the helper assume nth(1)?
Does the app still render duplicate qa-panel nodes?
Do working tests bypass the helper?
Do failing tests all use the helper?
Should the helper be made more robust without weakening behavior?
```

A helper fix is allowed only when the helper is truly stale or brittle and the fix preserves accepted behavior.

## Storage and State Audit

When storage features are involved, inspect state assumptions.

Check:

```txt
localStorage
sessionStorage
theme override storage key
pinned inspector state
Mission Control tab state
QA notes state
```

Storage-mutating tests should clean up after themselves.

Suggested test setup pattern:

```txt
clear relevant localStorage/sessionStorage before storage tests
reset theme overrides after storage tests
do not leave override values that affect app rendering
avoid shared storage state between parallel tests
```

## Current QA vs Historical Contract Audit

When QA identity moves from one pass to another:

```txt
v34a → v34b → v34c1
```

only current-pass identity tests should change.

Historical behavior tests should keep proving the old accepted behavior.

If an old test fails only because it expects the old current key, classify as:

```txt
current QA identity drift
```

Fix only the current-pass assertion path.

Do not erase old contract coverage.

## MCP Use

During a working-pattern diff audit:

### Sequential Thinking MCP

Use for:

```txt
classifying the cascade
deciding whether failures share one root cause
choosing stop/go
```

### Playwright MCP

Use for:

```txt
inspecting whether qa-panel exists
inspecting whether mission-control.panel exists
checking visible app state
checking runtime error/blank screen symptoms
checking locator candidates
```

### Context7 MCP

Use for:

```txt
uncertain Playwright locator behavior
localStorage/sessionStorage behavior
React controlled input behavior
test isolation behavior
```

MCP inspection is not acceptance evidence.

MCP inspection guides the fix. Playwright tests prove the fix.

## Early-Stop Recovery Flow

Use this sequence:

```txt
1. Run max-failures=5.
2. Record first failures.
3. Inspect screenshot/error-context.
4. Use Playwright MCP to inspect visible app state.
5. Diff against last accepted green commit.
6. Build selector contract map.
7. Compare working test vs failing test vs new test.
8. Classify root cause.
9. Apply one narrow fix.
10. Re-run targeted tests.
11. Re-run full validation.
```

## Targeted Test Re-Runs

After diagnosis, run progressively.

```bash
npx playwright test tests/e2e/app-smoke.spec.ts --reporter=line
npx playwright test tests/e2e/theme-override-storage.spec.ts --reporter=line
npx playwright test tests/e2e/contract-registry.spec.ts --reporter=line --max-failures=5
npx playwright test tests/e2e/theme-target-inspector.spec.ts --reporter=line --max-failures=5
```

Then:

```bash
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
grep -R -E "Ctrl\+Alt\+T|ctrl\+alt\+t|Alt\+F8|alt\+f8" -n src tests docs || true
grep -R "Run window.__lwRunThemeTargetProbe() from devtools\|triggered from DevTools\|can be triggered from DevTools" -n src docs tests || true
git diff --name-only
git status --short
```

## Stop Conditions

Stop and report if:

```txt
the first 5 failures do not share a classifiable pattern
git commands are running outside the repo
the app does not boot and the runtime cause is unclear
more than one unrelated root cause appears
fix requires weakening accepted tests
fix requires broad helper rewrite
fix requires graph/Sigma changes
fix requires changing accepted QA contracts
fix requires storage/schema semantics change
fix requires reverting an accepted commit
```

## Reporting Template

```txt
Playwright Working Pattern Diff Audit Complete

Starting State:
- current HEAD:
- last accepted green commit:
- working tree:
- typecheck:

Early-Stop Result:
- command:
- first 5 failures:

Selector Contract Map:
- qa-panel:
- mission-control.panel:
- theme-mapping-panel:

Pattern Comparison:
- working reference test:
- failing old test:
- new current-pass test:
- helper differences:
- storage/state differences:
- source differences:

MCP Usage:
- Sequential Thinking:
- Playwright MCP:
- Context7:

Classification:
- primary root cause:
- supporting evidence:
- why this is not many independent failures:

Fix Applied:
- files changed:
- why this is the smallest safe fix:

Validation:
- app smoke:
- new tests alone:
- old tests alone:
- old + new:
- typecheck:
- full Playwright:
- grep checks:
- git status:

Acceptance Recommendation:
ACCEPT / DO NOT ACCEPT

If stopped:
- reason:
- risk boundary:
- suggested next prompt:
```

## Bandit Prompt Add-On

Use this block in future Playwright cascade prompts:

```txt
Working Pattern Diff Audit Rule:

Before patching any failing Playwright test, compare it against known working Playwright patterns and the last accepted green commit.

Do not repair failing Playwright files individually.

If many old tests fail on the same missing locator:
- identify the shared selector contract
- inspect the source component that should provide it
- compare current source to last accepted green commit
- restore the contract unless there is an explicitly accepted contract change

Only edit old tests if:
- the app contract intentionally changed
- the old test asserted current-pass identity rather than historical behavior
- the old selector was provably brittle and the replacement preserves the same behavior

Report the working pattern comparison before patching.
```

## Summary

Playwright cascades are usually architecture signals.

Bandit should not treat them as a pile of individual failures.

A strong Bandit asks:

```txt
What used to work?
What changed?
Which shared selector/helper/source contract broke?
Which one fix restores the accepted pattern?
```

Then Bandit applies the smallest safe fix and proves it with full evidence.
