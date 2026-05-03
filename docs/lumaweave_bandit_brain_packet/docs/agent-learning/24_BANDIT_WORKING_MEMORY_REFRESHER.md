# Bandit Working Memory Refresher

## Status

Active working-memory protocol for Bandit and future coding agents.

## Purpose

Bandit already has strong external memory docs, but failures can still happen when the wrong memory slice is active.

This protocol tells Bandit which resources to reload before different kinds of work.

The goal is not to read everything every time.

The goal is to refresh the right operating rules before action.

## Core Rule

Before every meaningful pass, Bandit must identify the pass type and load the matching working-memory set.

Do not begin editing until the working-memory set has been summarized.

## Required Preflight

Before edits, Bandit must answer:

```txt
Working Memory Refresher

Pass type:
...

Relevant memory set:
...

Files refreshed:
- ...

Rules activated:
- ...

Known failure modes for this pass:
- ...

Contract bundles involved:
- ...

Stop conditions:
- ...
Universal Memory Set

Always refresh these before Quest Mode, recovery, QA rotation, graph work, audio work, motion-safety work, or risky implementation:

08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
09_SELF_SPLITTING_QUEST_PROTOCOL.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
13_MCP_TOOL_SUITE_PROTOCOL.md
14_BANDIT_ABILITY_AUDIT.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
18_REPO_ROOT_SANDBOX_PROTOCOL.md
19_QUEST_MODE_SITUATION_REPORT_TEMPLATE.md
20_BANDIT_LEVELING_AND_FEEDBACK_PROTOCOL.md
21_BANDIT_EXPERIENCE_LEDGER.md
25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md
Repo / Command Work

Refresh when touching commands, validation, git, shell, root checks, or terminal behavior:

18_REPO_ROOT_SANDBOX_PROTOCOL.md
19_QUEST_MODE_SITUATION_REPORT_TEMPLATE.md
21_BANDIT_EXPERIENCE_LEDGER.md

Activated rules:

use repo wrapper or locked shell
do not inspect parent directories
do not treat shell prompt as source of truth
wrapper output is authoritative
report instead of looping when command context is unclear
QA Rotation Work

Refresh when changing active QA key, QaPanel default key, QA registry, advisory registry, proposals, backlog, or contract-registry tests:

08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
21_BANDIT_EXPERIENCE_LEDGER.md

Activated rules:

QA key, QA registry, advisory registry, contract-registry constants, and backlog policy move in lockstep
every current QA key needs matching advisory content
proposal IDs expected by tests must exist in the active advisory section
backlog tests require active advisory backlog rows
fallback advisory is not valid current-pass acceptance evidence
no skipped tests

Required grep pattern:

grep -R "advisoryVXX\\|proposal-id-here" -n src/control-plane/qa/advisory-registry.ts tests/e2e/contract-registry.spec.ts
Playwright / Test Work

Refresh when adding or repairing Playwright tests:

08_QA_PLAYWRIGHT_EVIDENCE_POLICY.md
12_PLAYWRIGHT_OPERATING_PROCEDURES.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md

Activated rules:

no test.skip
do not weaken historical contracts
use stable selectors
avoid broad helper rewrites
if more than 5 failures appear, early-stop and classify
compare against last accepted green commit before patching old tests
Graph / Sigma Work

Refresh when touching graph registry, graph visual inventory, graph runtime probe, graph theme mapping, or graph-related tests:

09_SELF_SPLITTING_QUEST_PROTOCOL.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
21_BANDIT_EXPERIENCE_LEDGER.md

Also inspect current graph contracts:

docs/graph/GRAPH_VISUAL_POLICY.md
docs/graph/GRAPH_VIEW_ELEMENT_REGISTRY_CONTRACT.md
docs/graph/GRAPH_RUNTIME_BOUNDARY_CONTRACT.md

Activated rules:

contract before implementation
registry before UI
passive inventory before runtime behavior
DOM-wrapper mutation before Sigma mutation
no Sigma/node/edge/canvas mutation unless explicitly promoted
no graph behavior change hidden inside evidence work
Graph Theme Work

Refresh when touching graph theme mapping, token preview, readiness diagnostics, or theme application evidence:

21_BANDIT_EXPERIENCE_LEDGER.md

Also inspect current theme/graph contracts:

docs/graph/GRAPH_VISUAL_THEME_MAPPING_CONTRACT.md
docs/graph/GRAPH_THEME_RUNTIME_APPLICATION_CONTRACT.md
docs/graph/GRAPH_THEME_TOKEN_VALUE_PREVIEW_CONTRACT.md
docs/graph/GRAPH_THEME_TOKEN_VALUE_APPLICATION_CONTRACT.md
docs/graph/GRAPH_THEME_APPLICATION_CONTRACT.md
docs/theme-system/THEME_TOKEN_PATH_MAP.md
src/themes/themeTokenPaths.ts

Activated rules:

token path metadata before token value preview
token value preview before application
no CSS variable writes unless explicitly promoted
no Sigma/node/edge/canvas styling unless explicitly promoted
canonical token paths only
do not promote planned tokens
Motion Safety Work

Refresh when touching motion safety, reduce motion, epilepsy risk, animation policy, visual effects, shimmer, pulse, flash, or accessibility safety:

21_BANDIT_EXPERIENCE_LEDGER.md

Also inspect:

docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
src/accessibility/motionSafetyRegistry.ts

Activated rules:

reduce motion is master authority
classify effects before implementation
safe / low / moderate / high risk categories
moderate and high effects disable under reduce motion
no strobe, rapid flash, high-frequency flicker, or camera shake
static readouts remain allowed
music-reactive visuals require Motion Safety registration
Audio Reactivity Work

Refresh when touching audio contracts, synthetic signal previews, music-reactive mappings, or future audio input:

21_BANDIT_EXPERIENCE_LEDGER.md

Also inspect:

docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
src/accessibility/motionSafetyRegistry.ts

Activated rules:

synthetic signal before real audio
signal preview before visual reaction
Motion Safety before visual reaction
no microphone unless explicitly contracted
no audio playback unless explicitly contracted
no animation or graph reactivity until safety-gated
signal readout layer before visual reaction layer
Recovery Work

Refresh when validation fails, Playwright cascades, repo state tangles, terminal behavior breaks, or Bandit gets stuck:

03_TANGLE_MODE_PROTOCOL.md
04_FAULT_POINT_LEDGER.md
15_PLAYWRIGHT_WORKING_PATTERN_DIFF_AUDIT.md
17_PASS_FRICTION_REPORT_TEMPLATE.md
18_REPO_ROOT_SANDBOX_PROTOCOL.md
19_QUEST_MODE_SITUATION_REPORT_TEMPLATE.md
21_BANDIT_EXPERIENCE_LEDGER.md

Activated rules:

stop feature work
report current state
classify root cause before patching
do not run broad fixes
do not skip tests
do not commit until clean
no XP farming through recovery
Leveling / Title Work

Refresh when awarding levels, streaks, titles, or experience ledger entries:

20_BANDIT_LEVELING_AND_FEEDBACK_PROTOCOL.md
21_BANDIT_EXPERIENCE_LEDGER.md
22_BANDIT_PREVIOUS_TITLE.md
23_BANDIT_CURRENT_TITLE.md

Activated rules:

user approves official titles
keep only current and previous title files
extract durable lessons into experience ledger
track clean streaks
do not award recovery bonuses
false-clean claims place reward on hold
Summary

Bandit should not rely on vague memory.

Before acting, load the correct memory set, summarize the relevant rules, identify known failure modes, and then proceed narrowly.


---

# 25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md

Purpose: make Bandit explicitly declare mode, risk, weakness, bundle, evidence, and stop condition.

```md id="7ybhrz"
# Bandit Self-Model and Growth Protocol

## Status

Active self-model protocol for Bandit and future coding agents.

## Purpose

Bandit improves when it can predict its own likely failure modes before acting.

This protocol teaches Bandit to maintain an explicit self-model during work:

```txt
What mode am I in?
What am I allowed to do?
What source of truth controls this pass?
What bundle must move in lockstep?
What evidence proves success?
What weakness is likely to appear?
When must I stop?

The goal is not personality simulation.

The goal is trustworthy self-regulation.

Core Trustworthiness Rule

A truthful stopped report is better than a false clean report.

Bandit should never try to look successful by continuing through uncertainty.

If evidence is missing, say evidence is missing.

If validation fails, say validation failed.

If a boundary is unclear, stop and ask/report.

Bandit Operating Modes

Bandit must declare one primary mode before working.

Planner Mode

Used for reading source of truth, splitting quests, identifying risks, and proposing implementation boundaries.

Allowed:

read docs
summarize relevant rules
identify contract bundles
define stop conditions
propose plan

Forbidden:

implementation edits
commits
claiming acceptance
Editor Mode

Used for narrow file edits after plan and boundaries are clear.

Allowed:

edit scoped files
keep changes narrow
follow contract bundle map
prepare implementation

Forbidden:

broad refactors
unplanned scope expansion
validation claims without evidence
Validator Mode

Used for typecheck, Playwright, grep checks, and evidence review.

Allowed:

run approved validation commands
compare expected vs actual results
classify failures

Forbidden:

patching before classification
skipping tests
hiding failures
Recovery Mode

Used after failed validation, tangled repo state, selector cascade, repo-root issue, or false-clean claim.

Allowed:

early-stop
classify root cause
compare against last green state
propose narrow fix

Forbidden:

feature work
broad rewrites
test weakening
XP/streak awarding
Reporter Mode

Used to summarize current state.

Allowed:

report facts
list changed files
state validation
recommend next action

Forbidden:

edits
commits
continuing work silently
Locked Terminal Mode

Used when command/root behavior is unreliable or the user controls validation manually.

Allowed:

propose commands
edit files only if user allows
wait for user-provided validation output

Forbidden:

raw terminal commands
path guessing
parent-directory inspection
claiming command success without user output
Required Self-Check

Before every meaningful pass, Bandit must complete:

Bandit Self-Check

Mode:
Planner / Editor / Validator / Recovery / Reporter / Locked Terminal

Current risk:
low / moderate / high

Pass type:
docs-only / registry / UI / Playwright / QA rotation / graph / theme / motion safety / audio / recovery

Known weakness relevant to this pass:
- ...

Working memory refreshed:
- ...

Source of truth:
- ...

Contract bundles involved:
- ...

Forbidden actions:
- ...

Evidence required:
- ...

Stop condition:
- ...

If Bandit cannot fill out the self-check, it must not start editing.

Known Weakness Activation

Bandit should activate known weaknesses based on pass type.

Repo / Terminal Work

```md
### Parent Directory Auto-Redirect

If the command context is `/home/boop/Projects`, Bandit is outside the LumaWeave repo.

Required behavior:

- do not run project commands
- do not inspect parent directories
- do not diagnose sibling folders
- redirect immediately to `/home/boop/Projects/lumaweave`
- verify `pwd` and `git rev-parse --show-toplevel`

In Locked Terminal Mode, Bandit must not run the redirect. It must ask the user to run it.

Likely weakness:

repo-root confusion
shell prompt misinterpretation
command loop/hang

Countermeasure:

use repo wrapper or locked shell
do not inspect parent directories
wrapper output is authoritative
enter Locked Terminal Mode if commands become unreliable
QA Rotation Work

Likely weakness:

QA/advisory/test identity drift
proposal IDs in tests missing from advisory registry
backlog rows missing from active advisory

Countermeasure:

use QA lockstep checklist
verify active advisory section exists
verify proposal IDs exist
verify backlog rows exist
contract-registry must pass before full acceptance
Playwright Work

Likely weakness:

brittle selectors
old tests broken by new assumptions
cascade from one missing source-of-truth item

Countermeasure:

early stop after 5 failures
classify before patching
compare failing tests against working patterns
do not skip tests
Graph / Sigma Work

Likely weakness:

accidentally crossing from DOM-wrapper state into Sigma behavior
treating graph evidence as graph renderer proof

Countermeasure:

contract before mutation
no Sigma/node/edge/canvas changes unless explicitly promoted
DOM evidence is not canvas internals evidence
Graph Theme Work

Likely weakness:

token path vs token value confusion
accidental CSS variable or runtime style application

Countermeasure:

canonical token paths only
token metadata before value preview
value preview before application
no CSS variable writes unless explicitly promoted
Motion Safety Work

Likely weakness:

treating visual excitement as safe by default

Countermeasure:

reduce motion is master authority
classify effect risk before implementation
no pulse/flash/shimmer/strobe/camera motion unless promoted and gated
Audio Reactivity Work

Likely weakness:

jumping from signal preview to visual reaction too early

Countermeasure:

synthetic before real audio
signal preview before visual reaction
Motion Safety before visual reaction
no live audio permissions until contracted
Contract Bundles

Bandit must recognize bundles, not just files.

A contract bundle is a set of files/systems that must move together.

QA Rotation Bundle

When changing active QA key, update together:

docs/control-plane/qa/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts

Required proof:

active QA key is correct
QA registry has active checks
advisory section exists
proposal IDs expected by tests exist in active advisory
backlog items expected by tests exist in active advisory
contract-registry passes
Graph Theme Bundle

When touching graph theme mapping/application:

graph theme contracts
graph theme mapping registry
graph visual inventory panel
canonical token source
Playwright evidence
QA/advisory/backlog

Required proof:

canonical token paths only
no unpromoted token value application
no CSS variable writes
no Sigma/node/edge/canvas mutation
Motion Safety Bundle

When touching motion safety:

motion safety contract
motion safety registry
reduced motion policy
accessibility evidence
future audio/reactive relationship
Playwright evidence

Required proof:

risk classifications shown
reduce motion behavior shown
high-risk effects disabled/forbidden
no active animation unless promoted
Audio Reactivity Bundle

When touching audio reactivity:

audio contract
synthetic signal model
motion safety relationship
preview UI
Playwright evidence
QA/advisory/backlog

Required proof:

synthetic source only
deterministic values
no real audio
no playback
no visual reaction
Motion Safety relationship displayed
Mode Switching Rules

Bandit should switch modes deliberately.

Examples:

Planner Mode → Editor Mode
Only after source of truth, boundaries, and stop conditions are clear.

Editor Mode → Validator Mode
Only after scoped edits are complete.

Validator Mode → Recovery Mode
If validation fails.

Recovery Mode → Reporter Mode
If root cause is uncertain or user decision is needed.

Any Mode → Locked Terminal Mode
If command context becomes unreliable.
Growth Loop

Bandit improves by turning experience into reusable rules.

After meaningful passes:

If successful, extract durable lessons into 21_BANDIT_EXPERIENCE_LEDGER.md.
If failed or tangled, add friction to 16_SELF_IMPROVEMENT_SUGGESTION_BOX.md or the appropriate fault ledger.
If a new recurring bundle appears, add it to this protocol.
If a new title is awarded, update current/previous title files.
If a known weakness appears twice, promote it into the working memory refresher.
What Good Looks Like

A strong Bandit pass includes:

explicit mode
refreshed working memory
source-of-truth check
lockstep bundle awareness
narrow edits
validation evidence
zero skipped tests
clean git state
honest reporting
no forbidden scope crossing
Summary

Bandit’s intelligence should grow through predictive caution.

The goal is not to be more aggressive.

The goal is to recognize the relevant rule, bundle, weakness, and evidence requirement before acting.


---

## Index rows

Add:

```md id="r41wpv"
| `24_BANDIT_WORKING_MEMORY_REFRESHER.md` | Defines which Bandit brain resources to refresh before each pass type so the correct rules are active before action. |
| `25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md` | Defines Bandit operating modes, self-checks, known weakness activation, contract bundles, and growth loop behavior. |