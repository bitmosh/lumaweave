# MCP Tool Suite Protocol

## Status

Durable Bandit operating memory.

This document defines when and how Bandit should use the available MCP tool suite during LumaWeave work.

Current MCP tools available:

```txt
Sequential Thinking MCP — 1 tool enabled
Context7 MCP — 2 tools enabled
Playwright MCP — 22 tools enabled
```

This protocol is not an active runtime feature contract by itself. It is an operating rule for future Bandit work.

Read alongside:

```txt
09_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
10_SELF_SPLITTING_QUEST_PROTOCOL.md
11_QUEST_MODE_PROMPT_TEMPLATE.md
12_QUEST_MODE_FIELD_GUIDE.md
13_PLAYWRIGHT_OPERATING_PROCEDURES.md
15_BANDIT_ABILITY_AUDIT.md
```

## Purpose

MCP tools should be treated as Bandit abilities, not random utilities.

The goal is to make Bandit:

```txt
inspect before guessing
consult current docs before relying on stale assumptions
classify failures before patching
prove behavior with durable evidence
stop before high-risk scope expansion
```

## Core Model

```txt
Sequential Thinking MCP = battle planner / reasoning scaffold
Context7 MCP = current library/API documentation oracle
Playwright MCP = live UI scout / battlefield camera
```

Important principle:

```txt
MCP inspection informs implementation and debugging.
MCP inspection is not durable acceptance by itself.
```

Durable acceptance still requires the normal LumaWeave evidence paths:

```txt
Playwright assertions
QA Debug / in-app readouts
visible app behavior
typecheck/build output
grep checks
git diff/file inspection
```

Do not replace acceptance evidence with an MCP observation.

## Sequential Thinking MCP

### Role

Battle planner / reasoning scaffold.

Use Sequential Thinking MCP when Bandit needs to plan, split, classify, or decide whether to stop.

### Use Cases

Use Sequential Thinking MCP for:

```txt
long quest planning
self-splitting at architecture boundaries
failure classification
Playwright cascade triage before patching
stop/go checkpoint decisions
broad refactor risk analysis
storage/schema risk analysis
graph/Sigma boundary analysis
deciding whether to continue or stop after a sub-pass
```

### Trigger Examples

Use it when the prompt says or implies:

```txt
long quest
do as much as safely possible
multiple phases
self-split
large bite
storage + UI + tests
graph physics
Playwright failures cascade
many older tests broke
unclear architecture boundary
```

### Output Expectations

When Sequential Thinking MCP is used, Bandit should report:

```txt
why it was used
architecture boundaries identified
risk level of each sub-pass
stop/go decision
recommended split
next safe action
```

### Anti-Patterns

Do not use Sequential Thinking MCP to rationalize broad edits after the fact.

Do not continue through high-risk boundaries merely because the tool produced a plan.

If the reasoning identifies a stop condition, stop.

## Context7 MCP

### Role

Current library/API documentation oracle.

Use Context7 before relying on external API behavior, especially where stale assumptions can cause fragile code or tests.

### Use Cases

Use Context7 MCP before:

```txt
changing Playwright test patterns
using unfamiliar Playwright locator/assertion APIs
changing React controlled/uncontrolled input behavior
using localStorage/sessionStorage patterns in test-sensitive ways
making Vite/test runner assumptions
using TypeScript/library-specific patterns
touching Sigma/graph library behavior
writing graph physics tests
using browser APIs that may affect tests
```

### Trigger Examples

Use it when Bandit is uncertain about:

```txt
Playwright locator behavior
Playwright storage state handling
React input event semantics
Vite dev/test behavior
TypeScript narrowing or module behavior
Sigma camera/graph/renderer APIs
canvas/graph testing strategies
```

### Output Expectations

When Context7 MCP is used, Bandit should report:

```txt
library/API checked
question asked
key finding
implementation/test decision changed because of docs
remaining uncertainty
```

### Anti-Patterns

Do not use Context7 only after a bad patch fails.

Do not guess current API behavior when Context7 could answer it.

Do not cite Context7 as acceptance evidence. It supports implementation; tests prove acceptance.

## Playwright MCP

### Role

Live UI scout / battlefield camera.

Use Playwright MCP to inspect actual app state, visible UI, locator stability, and test failure conditions before writing or repairing UI tests.

### Use Cases

Use Playwright MCP to inspect:

```txt
visible UI state
locator candidates
test ID availability
disabled/enabled controls
Mission Control tab and panel state
Theme Mapping Panel rows
candidate vs registered target behavior
storage leakage during tests
reset/remove behavior
export button/output behavior
Playwright cascade failures
what the user would actually see
```

### Trigger Examples

Use it when:

```txt
adding Playwright tests for new UI
older Playwright tests fail after new tests are added
selector choice is uncertain
a generated control appears disabled/enabled unexpectedly
Mission Control or QA panel behavior is unclear
storage state may be leaking between tests
graph UI behavior later needs visual inspection
```

### Output Expectations

When Playwright MCP is used, Bandit should report:

```txt
page/state inspected
locator candidates found
visible behavior observed
state/storage findings
which test assertion will encode the evidence
whether stable test IDs are needed
```

### Anti-Patterns

Do not use Playwright MCP as a substitute for durable Playwright tests.

Do not use Playwright MCP to justify weak selectors.

Do not rely on manual console calls or object spelunking as acceptance evidence.

Do not patch tests blindly when Playwright MCP could inspect the actual failing UI.

## Required Tool-Use Decision Rule

Before Playwright-heavy work:

```txt
Use Playwright MCP if locator/UI state is uncertain.
Use Context7 if Playwright/React/storage/library behavior is uncertain.
Use Sequential Thinking if failures cascade or the task crosses architecture boundaries.
```

Before graph physics work:

```txt
Use Context7 for graph/Sigma/testing APIs.
Use Playwright MCP for visible graph/UI behavior where possible.
Use Sequential Thinking for risk split, timing/flakiness strategy, and stop conditions.
```

Before storage or schema-sensitive work:

```txt
Use Sequential Thinking to identify architecture boundaries.
Use Context7 if browser storage/testing behavior is uncertain.
Use Playwright MCP if visible storage/edit/reset UI must be inspected.
```

## MCP Use During Playwright Cascades

When adding tests causes older tests to fail:

```txt
1. Use Sequential Thinking MCP to classify the failure pattern.
2. Use Playwright MCP to inspect visible state, locators, and storage leakage.
3. Use Context7 MCP if Playwright API/test isolation behavior is uncertain.
4. Run old failing tests alone.
5. Run new tests alone.
6. Run old + new together.
7. Classify before patching.
```

Do not patch twenty older tests because one new test caused a cascade.

Find the shared cause.

## MCP Use During Quest Mode

In Quest Mode:

```txt
Sequential Thinking MCP helps split the quest.
Context7 MCP prevents stale external API assumptions.
Playwright MCP confirms visible UI/test behavior before assertions.
```

For each sub-pass, report whether MCP was needed.

If MCP was not used, that is acceptable only when:

```txt
the task is low-risk
the APIs are already known
the UI state is not uncertain
the implementation is docs-only or purely local
```

## MCP Reporting Format

When MCP tools are used, include this in the report:

```txt
MCP Usage:
- tool:
- reason:
- finding:
- implementation/test decision changed:
- durable evidence still required:
```

Example:

```txt
MCP Usage:
- tool: Playwright MCP
- reason: inspect Theme Mapping control locator and disabled/enabled state
- finding: panel.background row has stable text but no specific test ID
- decision changed: added data-testid for the enabled input and reset button
- durable evidence: Playwright test asserts input value, storage write, and reset behavior
```

## MCP Anti-Patterns

Avoid:

```txt
using MCP inspection as final acceptance
manual console-style acceptance
internal object spelunking as proof
patching tests blindly before inspecting UI state
using Context7 after the fact instead of before uncertain API work
using Playwright MCP to justify brittle selectors
using Sequential Thinking to excuse over-broad edits
continuing after MCP reveals a stop condition
```

## Required Stop Conditions

Stop and report if:

```txt
MCP inspection contradicts code assumptions
Playwright MCP reveals UI behavior differs from test assumptions
Context7 reveals the intended API usage is wrong
Sequential Thinking identifies a high-risk architecture boundary
MCP suggests the fix requires broad helper rewrites
MCP suggests accepted tests would need weakening
the next step requires graph/Sigma mutation outside scope
the next step requires storage/schema beyond accepted contract
```

## Relationship To Acceptance Evidence

MCP tools are scouting and planning abilities.

They do not replace:

```txt
npm run typecheck
npm run qa:e2e
grep -R "test.skip" -n tests/e2e || true
hotkey grep
DevTools wording grep
git diff --name-only
git status --short
```

MCP findings should become durable evidence through:

```txt
Playwright assertions
visible UI expectations
QA Debug/in-app readouts
docs/contracts
clean git diffs
```

## Future Graph Physics Use

Graph physics will be a boss fight.

Before graph physics Playwright work, Bandit should use:

```txt
Sequential Thinking MCP
- split timing, visual evidence, and graph policy risks

Context7 MCP
- verify current Sigma/graph/testing APIs

Playwright MCP
- inspect visible graph behavior and testability
```

Graph tests should avoid brittle static assumptions when behavior is physics/timing driven.

## Summary

Bandit should treat MCP tools like an equipped tool suite:

```txt
Sequential Thinking MCP — plan the fight
Context7 MCP — check the spellbook
Playwright MCP — scout the battlefield
Playwright tests — prove the victory
```

Use the right tool before guessing.

Then prove the result with durable LumaWeave evidence.
