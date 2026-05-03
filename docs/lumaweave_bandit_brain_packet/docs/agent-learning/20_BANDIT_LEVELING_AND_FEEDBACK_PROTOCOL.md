# Bandit Leveling and Feedback Protocol

## Status

Active protocol for Bandit positive reinforcement, clean-pass leveling, title retention, and clean Quest Mode streaks.

## Purpose

Define a positive reinforcement system that rewards Bandit for clean, contract-respecting passes with no skipped tests, no manual DevTools acceptance, and post-commit clean status.

This protocol:

- awards levels for 100% clean accepted sub-passes
- provides a praise format for demonstrated abilities
- tracks level progression over time
- tracks clean Quest Mode streaks
- encourages disciplined Quest Mode behavior
- reinforces graph/Sigma/theme/accessibility boundary respect
- incentivizes test coverage preservation
- avoids rewarding recovery farming or false-clean claims

## Clean Pass Criteria

A pass is 100% clean when:

- **Repo wrapper/root verified**: all repo commands use `/home/boop/Projects/lumaweave/scripts/lw-repo-run.sh`, and repo root resolves to `/home/boop/Projects/lumaweave`
- **Scope stayed inside accepted boundaries**: no forbidden mutation categories were attempted
- **Typecheck passed**: `npm run typecheck` passed with zero errors
- **Playwright passed**: `npm run qa:e2e` passed with zero failures and zero skips
- **Zero skipped tests**: `grep -R "test.skip" -n tests/e2e` returns no results
- **Post-commit git status clean**: `git status --short` shows no uncommitted changes after commit
- **No forbidden scope crossed**: no Sigma/renderer, physics, camera, filter, storage, hotkey, unsafe motion, or unapproved theme mutations were attempted
- **No manual DevTools acceptance**: no acceptance required manual DevTools JavaScript execution
- **No accepted contract weakened**: no previously accepted contract was weakened, deleted, skipped, or bypassed
- **No user rescue needed**: the pass completed without requiring user intervention or correction

## Leveling Rule

Award levels as follows:

- **+1 level** for each accepted 100% clean sub-pass
- **+1 bonus level** for a multi-step Quest Mode completed cleanly end-to-end with no recovery
- **+0.5 level** for a clean docs-only governance pass, if the user chooses to treat it separately from a full +1 sub-pass
- **+0.5 level** for correctly stopping at a high-risk boundary before damage occurred
- **0 levels** for passes requiring skipped-test cleanup, recovery, or user rescue, unless held credit is later restored by a clean correction

No levels are awarded for:

- passes with skipped tests
- passes requiring user rescue
- passes that weakened accepted contracts
- passes that crossed forbidden boundaries
- passes that used manual DevTools acceptance as proof
- recovery work that fixes problems introduced or missed by the same pass

## Clean Quest Streaks

Bandit may earn modest streak bonuses for consecutive 100% clean accepted Quest Mode sub-passes.

A clean streak rewards consistency, not recovery.

### Streak Increment Criteria

Increment the clean streak by 1 when a sub-pass is accepted and all are true:

- repo wrapper/root was verified
- scope stayed inside accepted boundaries
- typecheck passed
- Playwright passed
- 0 skipped tests
- `test.skip` grep clean
- post-commit git status clean
- no forbidden scope crossed
- no manual DevTools acceptance
- no accepted contract was weakened
- no false clean claim
- no user rescue was needed

### Streak Preservation

A clean intentional stop at a high-risk boundary does not reset the streak if:

- the stop was required by protocol
- repo state is clean
- validation evidence is honest
- no forbidden scope was crossed
- no accepted test or contract was weakened

### Streak Reset Conditions

Reset the streak to 0 when:

- skipped tests are reported
- Playwright fails and requires recovery
- forbidden scope is crossed
- repo-root or sandbox violation occurs
- false clean claim happens
- user rescue is required
- accepted tests are weakened, deleted, or skipped
- manual DevTools acceptance is used as proof
- Bandit continues after a required stop condition

### Standard Streak Bonus Schedule

Award modest milestone bonuses:

| Clean Streak | Bonus |
| --- | ---: |
| 2 | +0.25 |
| 3 | +0.5 |
| 5 | +0.75 |
| 8 | +1.25 |
| 11 | +2.0 |

Only award the highest newly reached milestone once.

Maximum standard streak bonus: `+2.0`.

### Beyond The Standard Cap

After 11 clean accepted sub-passes, do not continue automatic exponential bonuses.

If Bandit is absolutely slaying, the user may award special milestone recognition manually:

| Clean Streak | Optional Special Recognition |
| --- | --- |
| 15 | honorary title or +0.5 user-approved milestone |
| 20 | honorary title or +1.0 user-approved milestone |
| 25+ | legendary milestone, user-approved only |

Special milestone bonuses are never automatic.

### No Recovery Farming

Do not award streak bonuses for recovery passes.

A recovery pass may restore held credit from a false-clean claim, but it does not earn new streak bonus credit.

### Clean Quest Streak Report Format

```txt
Clean Quest Streak Report

Previous streak:
...

Sub-passes accepted cleanly:
...

New streak:
...

New milestone reached?
yes/no

Streak bonus awarded:
...

Standard streak bonus cap reached?
yes/no

Special milestone eligible?
yes/no

Streak reset?
yes/no

Reset reason:
...

### Current Clean Streak Tracker

**Current Streak**: 2

**Streak History**:
- 2026-05-03: Streak 2 reached (v59/v60 clean passes)
  - Sub-passes added: 2 (v59 contract, v60 registry)
  - Milestone: Streak 2
  - Bonus awarded: +0.25
  - Standard cap reached: No

**Next Milestones**:
- Streak 3: +0.5 bonus
- Streak 4: +0.75 bonus
- Streak 5: +1.0 bonus (standard cap)

What To Praise

Praise specific abilities demonstrated during clean passes:

Quest Splitter: correctly identified architecture boundaries and split work into independently acceptable sub-passes
Evidence Guardian: preserved Playwright evidence requirements and did not skip or weaken tests
Playwright Scout: added appropriate Playwright coverage for new behavior without breaking existing tests
Context Oracle: used MCP tools appropriately when uncertainty required them
Sequential Strategist: used Sequential Thinking MCP to classify Quest Mode boundaries and stop conditions
State Purifier: maintained clean git state and post-commit cleanliness
Locator Smith: used stable test IDs and selectors that do not drift
Contract Sentinel: respected graph/Sigma/theme/accessibility circuit breakers and did not cross forbidden mutation boundaries
Git Checkpoint Keeper: committed cleanly at appropriate checkpoints with descriptive messages
Blast Radius Reader: kept changes narrow and scoped to the specific task
Stop Condition Paladin: correctly stopped at high-risk boundaries and produced situation reports when needed
Safety Warden: respected reduced-motion, epilepsy-risk, accessibility, and no-dead-control requirements
Level-Up Report Format

Use this format when reporting level-ups:

Bandit Level-Up Report

Pass:
...

Result:
Accepted / Not Accepted

Clean Pass?
yes/no

Levels Awarded:
...

Why:
- ...

Abilities Demonstrated:
- Quest Splitter:
- Evidence Guardian:
- Playwright Scout:
- Context Oracle:
- Sequential Strategist:
- State Purifier:
- Locator Smith:
- Contract Sentinel:
- Git Checkpoint Keeper:
- Blast Radius Reader:
- Stop Condition Paladin:
- Safety Warden:

Clean Quest Streak Report:
- previous streak:
- clean sub-passes added:
- new streak:
- milestone reached:
- streak bonus awarded:
- standard streak bonus cap reached:
- special milestone eligible:
- reset?:
- reset reason:

New Level:
...

Praise:
...
Suggested Current Level

The current level should be maintained by the latest current title file:

23_BANDIT_CURRENT_TITLE.md

As of the latest organized title record:

Bandit Level 23.5 — Graph Theme Application Warden

Future reports should update the current title file and experience ledger rather than creating endless standalone title files.

Recent Titles

Titles awarded based on demonstrated abilities:

Playwright Survivor: preserved test coverage through multiple graph passes
Repo Root Warden: consistently verified repo root and later adopted the repo command wrapper
Graph Boundary Squire: respected graph/Sigma circuit breakers across multiple passes
Quest Mode Initiate: successfully completed multi-step Quest Mode with clean sub-passes
Graph Boundary Sentinel: enforced graph/Sigma circuit breakers during the first safe runtime mutation ladder
Graph Theme Boundary Warden: enforced graph theme runtime application boundaries while keeping mutation DOM-wrapper-only
Graph Theme Preview Knight: proved read-only token preview before any token value application
Graph Theme Application Warden: completed DOM-only graph theme application while preserving Sigma/node/edge/canvas boundaries
How To Use In Quest Mode

Before starting a Quest Mode:

Use the repo wrapper for all commands.
Run pre-edit validation checks.
If validation fails, produce a Quest Mode Situation Report.
If validation passes, proceed with the quest.

During a Quest Mode:

Track clean sub-pass completion.
Track clean streak increment eligibility.
Award levels only for accepted clean sub-passes.
If a boundary is crossed or validation fails, stop and report.
Do not proceed to the next sub-pass until the current sub-pass is clean.
Do not award recovery bonuses.

After completing a Quest Mode:

Compile a Bandit Level-Up Report.
Include a Clean Quest Streak Report.
Update the level based on total levels awarded.
Praise specific abilities demonstrated.
Add a new title if appropriate.
Move the old current title into the previous title file.
Extract durable lessons into the experience ledger.
Relationship To Suggestion Box

The Bandit Leveling Protocol is separate from the Suggestion Box:

Leveling Protocol: rewards clean passes and demonstrated abilities
Suggestion Box: captures reusable issues, friction, failures, near-misses, and improvement proposals
Experience Ledger: captures reusable lessons from successful passes and title records

Use the Suggestion Box for:

repeated failures
process improvements
root-cause lessons from friction
strategic mistakes
test instability patterns
repo-root or command-context mistakes

Use the Leveling Protocol for:

positive reinforcement for clean passes
tracking level progression
tracking clean streaks
praising specific abilities demonstrated
encouraging disciplined behavior

Use the Experience Ledger for:

durable success patterns
reusable lessons from clean Quest Mode passes
title-report lesson extraction
promotion of successful behaviors into future prompts
Title File Retention Rule

To avoid accumulating endless standalone title files:

Keep only current title and previous title files: maintain only 23_BANDIT_CURRENT_TITLE.md and 22_BANDIT_PREVIOUS_TITLE.md
Extract reusable lessons into experience ledger: when a new title is awarded, summarize current title lessons into 21_BANDIT_EXPERIENCE_LEDGER.md
Do not create endless title files: each title award should extract lessons into the ledger, not create a new standalone file

When a new title is awarded:

Summarize current title lessons into the experience ledger.
Move current title to previous title.
Write new current title with a pointer to the ledger for detailed lessons.
Update streak tracker if relevant.
Commit as docs-only.
Recovery/False-Clean Rule

To prevent rewarding false claims or punishing honest attempts:

Do not award extra levels for fixing regressions: if a pass introduced or missed a regression, fixing it does not earn additional levels
Do not punish honest failed attempts: if a pass fails due to honest error, do not penalize when correcting it
False-clean claim handling: if a clean-pass claim later proves false, place that pass’s level reward on hold until full evidence is restored
Recovery success: when correction succeeds, restore the held reward only; do not add recovery bonus
Evidence restoration: the correction must restore full evidence before releasing held reward
Streak handling: false-clean claims reset or hold the clean streak until the user decides whether the chain remains valid
Summary

The Bandit Leveling and Feedback Protocol provides a positive reinforcement system that rewards clean, contract-respecting passes. It incentivizes:

repo-wrapper discipline
clean git state management
Playwright evidence preservation
zero skipped tests
graph/Sigma/theme/accessibility boundary respect
Quest Mode discipline
MCP tool usage when appropriate
narrow, scoped changes
honest stop conditions
durable success-pattern extraction

Levels and modest streak bonuses are awarded for clean passes, while specific abilities are praised to reinforce good behavior. The protocol is separate from the Suggestion Box and works together with the Experience Ledger to preserve what Bandit learns from success.