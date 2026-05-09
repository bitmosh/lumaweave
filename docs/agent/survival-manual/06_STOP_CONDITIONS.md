---
id: agent.survival.manual.stop.conditions
title: Stop Conditions
type: manual
status: current
cluster: purple
domain: agent
subdomain: survival-manual
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
last_pass: vP-Forensics-2
references:
  - agent.survival.manual.readme
  - agent.survival.manual.troubleshooting.decision.matrix
  - agent.survival.manual.diagnostic.router
  - agent.survival.manual.failure.report.template
tags: [agent, survival-manual, stop-conditions, safety, scope-guard]
---

# Stop Conditions

Stop and report instead of continuing if any of these occur.

## Validation Stop Conditions

- Typecheck fails after a nontrivial change.
- Playwright fails for app/test reasons.
- Playwright failure is environment-level and requires sudo/system package install.
- New `test.skip` appears.
- Playwright skipped count is greater than expected.

## Identity Stop Conditions

- qaKey surfaces disagree.
- Header/dropdown/report/advisory set are out of sync.
- Stale localStorage overrides active qaKey.
- Report key differs from active checklist key.

## Contract Stop Conditions

- Active control count changes unexpectedly.
- Active control has no runtime binding.
- Control registry coverage decreases.
- Missing docs/test count increases without explanation.

## Scope Stop Conditions

- Fix requires graph renderer changes outside graph task.
- QA task starts requiring theme runtime changes.
- Test cleanup starts adding product features.
- Docs-only pass requires runtime code edits.
- Implementation needs files outside the declared change list.

## Safety Stop Conditions

- Command requires sudo/system package changes.
- Tool needs access outside repo scope.
- Potential secrets/home config access appears.
- Git destructive action would be needed.

## Required Stop Report

```md
# Stop Condition Hit

## Condition

## Evidence

## Why continuing would be unsafe

## Recommended next action
```
