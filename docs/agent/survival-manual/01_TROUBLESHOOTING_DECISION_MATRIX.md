---
id: agent.survival.manual.troubleshooting.decision.matrix
title: Troubleshooting Decision Matrix
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
  - agent.survival.manual.diagnostic.router
  - agent.survival.manual.tool.use.triggers
  - agent.survival.manual.debugging.lenses
  - agent.survival.manual.failure.report.template
  - agent.survival.manual.stop.conditions
  - agent.survival.manual.operating.loop
tags:
  - agent
  - survival-manual
  - troubleshooting
  - classification
  - failure-types
---

# Troubleshooting Decision Matrix

Before patching, classify the failure.

Do not treat every error as “fix code.” Most failures fall into repeatable buckets. Correct classification usually reveals the correct next action.

## Core Rule

```txt
Do not patch until the failure is classified.
Do not classify from vibes.
Find the broken signal boundary.
```

Trace every issue as:

```txt
input signal → transformation point → expected output signal → observed output signal
```

## 1. Environment Prerequisite Failure

Signals:

- browser executable missing
- dependency not installed
- command not found
- port/dev server unavailable
- permission/system package issue

Examples:

```txt
browserType.launch: Executable doesn't exist
please run npx playwright install
dev server not running
missing npm package
```

Action:

- Do not call the app unstable.
- Repair safe local prerequisite if allowed.
- Rerun validation once.
- Ask before sudo/system-level changes.

Safe examples:

```bash
npx playwright install chromium
npm install
```

Ask first:

```bash
sudo npx playwright install-deps chromium
```

## 2. Dependency / API Uncertainty

Signals:

- unfamiliar library error
- uncertainty about Playwright/React/Vite/Tauri/Sigma/Graphology/Tailwind API
- guessing at usage patterns
- brittle implementation due to unclear external behavior

Action:

- Use Context7 before patching.
- Treat Context7 as library truth, not project truth.
- If library docs conflict with project code or accepted QA, stop and report the conflict.

## 3. Selector / Test Harness Mismatch

Signals:

- Playwright timeout on selector
- `selectOption` fails
- strict-mode violation
- element exists visually but test cannot find it
- UI changed from native select to custom button/grid

Action:

- Inspect UI with Playwright MCP.
- Prefer stable `data-testid` for contract controls.
- Do not skip the test.
- Update selector to match real UI.
- Add missing stable test ID if the control is active.

## 4. Identity / Binding Drift

Signals:

- header says one key, dropdown says another
- report key differs from active checklist
- advisory questions from old version
- stale localStorage overrides active state

Action:

- Identify canonical key.
- Trace all identity surfaces.
- Make surfaces derive from one active object/key.
- Add debug diagnostics.
- Add Playwright test for binding.

Surfaces:

```txt
header
dropdown
active registry object
report key
advisory set key
history
copy output
localStorage
```

## 5. State Persistence / Reset Bug

Signals:

- field should reset but persists
- decision should persist but resets
- backlog order lost
- old answers appear in a new report

Action:

Classify state before patching:

```txt
per-pass
per-report
per-session
durable
stateless
```

Rules:

- Persist durable state by stable ID.
- Reset per-pass state after submit.
- Never reset durable proposal decisions or backlog order accidentally.

## 6. Runtime Lifecycle / Behavior Regression

Signals:

- app opens then blanks
- graph resets
- hover required to restore state
- theme flashes default
- console errors

Action:

- Reproduce.
- Inspect console.
- Find lifecycle boundary.
- Patch smallest timing/order issue.
- Add test for “graph remains visible” or “no console errors.”

Common graph lifecycle boundary:

```txt
React state update → Graphology rebuild → style policy apply → Sigma render → refresh
```

## 7. Obsolete Test / Spec Debt

Signals:

- tests target old qaKeys
- old checklist names
- old advisory questions
- old UI layout no longer current

Action:

Classify each old test:

```txt
obsolete-delete
obsolete-replace
still-valid-update
historical-only
```

Rules:

- Delete or replace obsolete tests.
- Do not leave `test.skip` as a parking lot.
- Acceptance target: 0 skipped tests unless explicitly approved by the user.

## 8. Contract Registry Drift

Signals:

- active control missing registry entry
- control lacks runtime binding
- control lacks docs or Playwright coverage
- debug summary counts are stale

Action:

- Audit contract registry.
- Preserve active control count unless intentionally changing it.
- Surface missing coverage in debug diagnostics.
- Add contract/docs/test mapping or explicit TODO.

## 9. Docs / Source-of-Truth Drift

Signals:

- docs mention old qaKey/checklist
- multiple docs claim different current baseline
- old session log treated as current truth
- generated proposal repeated forever

Action:

- Prefer accepted QA + current registry + active source-of-truth docs.
- Mark old docs historical/superseded.
- Update concise source-of-truth docs.
- Do not create giant duplicate docs.

## 10. Scope Creep / Architecture Boundary Issue

Signals:

- fixing QA touches graph renderer
- styling task touches persistence
- test cleanup adds new features
- docs pass changes runtime behavior

Action:

- Pause.
- Report why new file/system is needed.
- Ask user before expanding scope.
- Park unrelated discoveries in future work.
