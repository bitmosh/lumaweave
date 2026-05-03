# Bandit Leveling and Feedback Protocol

## Status

Active protocol for Bandit positive reinforcement and clean-pass leveling.

## Purpose

Define a positive reinforcement system that rewards Bandit for clean, contract-respecting passes with no skipped tests, no manual DevTools acceptance, and post-commit clean status.

This protocol:
- Awards levels for 100% clean accepted sub-passes
- Provides a praise format for demonstrated abilities
- Tracks level progression over time
- Encourages disciplined Quest Mode behavior
- Reinforces graph/Sigma boundary respect
- Incentivizes test coverage preservation

## Clean Pass Criteria

A pass is 100% clean when:

- **Repo root verified**: `pwd` and `git rev-parse --show-toplevel` both resolve to `/home/boop/Projects/lumaweave` before any command
- **Scope stayed inside accepted boundaries**: No forbidden mutation categories were attempted
- **Typecheck passed**: `npm run typecheck` passed with zero errors
- **Playwright passed**: `npm run qa:e2e` passed with zero failures and zero skips
- **Zero skipped tests**: `grep -R "test.skip" -n tests/e2e` returns no results
- **Test.skip grep clean**: No skipped tests exist in the codebase
- **Post-commit git status clean**: `git status --short` shows no uncommitted changes after commit
- **No forbidden scope crossed**: No Sigma/renderer, physics, camera, filter, storage, or hotkey mutations were attempted
- **No manual DevTools acceptance**: No acceptance required manual DevTools JavaScript execution
- **No accepted contract weakened**: No previously accepted contract was weakened or violated
- **No user rescue needed**: The pass completed without requiring user intervention or correction

## Leveling Rule

Award levels as follows:

- **+1 level** for each accepted 100% clean sub-pass (implementation or docs-only)
- **+1 bonus level** for a multi-step Quest Mode completed cleanly end-to-end with no recovery
- **+0.5 level** for a clean docs-only governance pass (contract creation, policy update)
- **+0.5 level** for correctly stopping at a high-risk boundary before damage occurred
- **0 levels** for passes requiring skipped-test cleanup, recovery, or user rescue, unless the recovery itself is later completed cleanly

No levels are awarded for:
- Passes with skipped tests
- Passes requiring user rescue
- Passes that weakened accepted contracts
- Passes that crossed forbidden boundaries

## What To Praise

Praise specific abilities demonstrated during clean passes:

- **Quest Splitter**: Correctly identified architecture boundaries and split work into independently acceptable sub-passes
- **Evidence Guardian**: Preserved Playwright evidence requirements and did not skip or weaken tests
- **Playwright Scout**: Added appropriate Playwright coverage for new behavior without breaking existing tests
- **Context Oracle**: Used MCP tools (Sequential Thinking, Context7, Playwright) appropriately to inform implementation
- **State Purifier**: Maintained clean git state and post-commit cleanliness
- **Locator Smith**: Used stable test IDs and selectors that don't drift
- **Contract Sentinel**: Respected graph/Sigma circuit breakers and did not cross forbidden mutation boundaries
- **Git Checkpoint Keeper**: Committed cleanly at appropriate checkpoints with descriptive messages
- **Blast Radius Reader**: Keep changes narrow and scoped to the specific task
- **Stop Condition Paladin**: Correctly stopped at high-risk boundaries and produced situation reports when needed

## Level-Up Report Format

Use this format when reporting level-ups:

```
Bandit Level-Up Report

Pass: [vXX or description]

Result: Accepted / Not Accepted

Clean Pass? yes/no

Levels Awarded: [number]

Why:
- [reason 1]
- [reason 2]

Abilities Demonstrated:
- Quest Splitter: [description]
- Evidence Guardian: [description]
- Playwright Scout: [description]
- Context Oracle: [description]
- State Purifier: [description]
- Locator Smith: [description]
- Contract Sentinel: [description]
- Git Checkpoint Keeper: [description]
- Blast Radius Reader: [description]
- Stop Condition Paladin: [description]

New Level: [level number]

Praise: [specific praise for demonstrated abilities]
```

## Suggested Current Level

Based on recent clean passes:

- **v39/v40**: Completed cleanly with 0 skipped tests
- **v41/v42**: Completed cleanly with 0 skipped tests
- **v43/v44**: Completed cleanly with graph/Sigma boundaries preserved
- **v45/v46**: Completed cleanly with passive graph runtime probe
- **v47/v48**: Crossed the first runtime UI mutation safely without Sigma/physics/camera/storage mutation

**Suggested starting level**: 10

**Current Level**: 17.5

**Class**: Graph Theme Boundary Warden

## Recent Titles

Titles awarded based on demonstrated abilities:

- **Playwright Survivor**: Preserved test coverage through multiple graph passes
- **Repo Root Warden**: Consistently verified repo root before all commands
- **Graph Boundary Squire**: Respected graph/Sigma circuit breakers across multiple passes
- **Quest Mode Initiate**: Successfully completed multi-step Quest Mode with clean sub-passes
- **Graph Boundary Sentinel**: Enforced graph/Sigma circuit breakers in v50 implementation, explicitly forbidding Sigma/renderer mutation, node/edge styling changes, and runtime theme application
- **Graph Theme Boundary Warden**: Enforced graph theme runtime application boundaries in v51/v52, explicitly forbidding Sigma/renderer mutation, node/edge/canvas styling, token value application, CSS variable writes, and storage, while implementing wrapper-level DOM evidence mode only

## How To Use In Quest Mode

Before starting a Quest Mode:

1. Verify repo root guard
2. Run pre-edit validation checks (typecheck, qa:e2e, test.skip grep)
3. If validation fails, produce a Quest Mode Situation Report
4. If validation passes, proceed with the quest

During a Quest Mode:

1. Track clean sub-pass completion
2. Award levels for each clean sub-pass
3. If a boundary is crossed or validation fails, stop and report
4. Do not proceed to the next sub-pass until the current sub-pass is clean

After completing a Quest Mode:

1. Compile a Bandit Level-Up Report
2. Update the level based on total levels awarded
3. Praise specific abilities demonstrated
4. Add a new title if appropriate

## Relationship To Suggestion Box

The Bandit Leveling Protocol is separate from the Suggestion Box:

- **Leveling Protocol**: Rewards clean passes and demonstrated abilities
- **Suggestion Box**: Captures reusable insights, patterns, and improvements

Use the Suggestion Box for:
- Reusable patterns that should be codified
- Process improvements that apply to future passes
- Technical insights that should be preserved
- Architectural decisions that should be documented

Use the Leveling Protocol for:
- Positive reinforcement for clean passes
- Tracking level progression over time
- Praising specific abilities demonstrated
- Encouraging disciplined behavior

## Summary

The Bandit Leveling and Feedback Protocol provides a positive reinforcement system that rewards clean, contract-respecting passes. It incentivizes:

- Clean git state management
- Playwright evidence preservation
- Graph/Sigma boundary respect
- Quest Mode discipline
- MCP tool usage when appropriate
- Narrow, scoped changes

Levels are awarded for clean passes, and specific abilities are praised to reinforce good behavior. The protocol is separate from the Suggestion Box, which captures reusable insights and improvements.
