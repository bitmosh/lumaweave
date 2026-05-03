# Bandit Experience Ledger

## Status

Active - Growing ledger of reusable lessons extracted from Bandit's successful level-up/title reports and clean Quest Mode passes.

## Purpose

This ledger extracts reusable lessons from successful Bandit passes and level-up records. It avoids accumulating endless standalone title files by distilling key patterns into durable, reusable insights.

**How To Use:**

When a new title is awarded or a clean pass occurs:
1. Extract the reusable lesson (not the full report)
2. Add an entry following the Experience Entry Format
3. Summarize the current title file into this ledger
4. Move current title to previous title
5. Write new current title (pointer to ledger for details)
6. Commit as docs-only

## Experience Entry Format

### YYYY-MM-DD — Short Success Title

**Source Pass / Title:**
...

**What Went Well:**
...

**Reusable Lesson:**
...

**Behavior To Reinforce:**
...

**Evidence Pattern:**
...

**Future Prompt / Protocol Improvement:**
...

**Related Abilities:**
- Quest Splitter
- Evidence Guardian
- Playwright Scout
- Context Oracle
- State Purifier
- Locator Smith
- Contract Sentinel
- Git Checkpoint Keeper
- Blast Radius Reader
- Stop Condition Paladin

**Status:**
Active / Promoted / Superseded

## Success Patterns Learned

### Quest Mode Discipline

**Pattern:** Contract-first implementation ladder
- Define contract before implementation
- Verify gate conditions before runtime changes
- Separate commits for each sub-pass
- Clean validation evidence for each phase

**Evidence:** v55/v56/v57/v58 linear quest showed clean separation between governance (contract) and implementation.

### Graph/Sigma Boundary Discipline

**Pattern:** Treat Sigma as black box
- No Sigma/renderer mutation until explicitly promoted
- No node/edge/canvas styling until explicitly promoted
- DOM-wrapper-only mutations as intermediate step
- Playwright evidence for all boundary assertions

**Evidence:** v56 DOM-only wrapper theme application succeeded without touching Sigma internals.

### No Skipped Tests as Acceptance Gate

**Pattern:** Zero skips requirement
- grep for test.skip before acceptance
- Treat skipped tests as acceptance failure
- Fix or remove skips before claiming clean pass

**Evidence:** v56/v58 passes verified with zero skips.

### Contract Before Implementation

**Pattern:** Governance-first approach
- Write contract defining allowed/forbidden boundaries
- Get contract accepted before any runtime code
- Reference contract in implementation comments
- Use Playwright to verify contract adherence

**Evidence:** v55 contract accepted before v56 implementation.

### Repo-Root Wrapper Requirement

**Pattern:** Absolute path confinement
- All commands must run from /home/boop/Projects/lumaweave
- Verify pwd and git root before each command
- Fail loudly if root verification fails
- Use wrapper script for all git/npm/grep/find commands

**Evidence:** Sandbox protocol violations led to wrapper requirement.

### Stable Playwright Test ID Discipline

**Pattern:** Consistent data-testid naming
- Use descriptive, stable test IDs
- Avoid dynamic or generated IDs
- Reference test IDs in Playwright assertions
- Keep IDs stable across refactors

**Evidence:** v56/v58 tests use stable data-testid patterns.

### DOM-Wrapper-Only Mutation Ladder

**Pattern:** Incremental mutation permission
- Start with DOM-wrapper changes (data attributes)
- Progress to CSS variables (if governance permits)
- Progress to token values (if governance permits)
- Never jump directly to Sigma/renderer mutation

**Evidence:** v56 DOM-only wrapper theme application as first permitted graph theme mutation.

### Read-Only/Passive Inventory Before Runtime Application

**Pattern:** Observation before mutation
- Build read-only registries first
- Add passive inspection UI
- Verify surface understanding
- Then consider runtime application

**Evidence:** v46-v50 inventory/probe/mapping modes before v56 application.

### Token Path Metadata Before Token Value Application

**Pattern:** Canonical vocabulary first
- Define canonical theme token paths
- Build mapping registry
- Display metadata as readout
- Then consider value resolution/application

**Evidence:** v50 theme mapping registry before v54 token value preview.

## Current Experience Entries

### 2026-05-03 — Epilepsy Guard Warden (v59/v60)

**Source Pass / Title:**
v59: Motion Safety/Epilepsy Guard Contract (docs-only governance)
v60: Reduced Motion Guard Registry (static/read-only registry with passive UI)

**What Went Well:**
- Clean self-splitting quest with strict safety boundaries
- Contract-first approach for v59 defining motion safety and epilepsy risk models
- Static/read-only registry for v60 with no runtime effect execution
- Passive UI with Playwright evidence proving no active controls
- All forbidden categories respected (animation, audio, music reactivity, graph/Sigma mutation)
- Risk classification system (safe/low/moderate/high) with epilepsy risk (none/possible/high)
- Reduce motion authority recognized as master safety switch
- Clean streak reached 2 and earned +0.25 streak bonus
- All Playwright tests passing (268 total, 11 new v60 tests)
- Zero skipped tests
- Typecheck passing

**Reusable Lesson:**
Safety lane must precede music-reactive visuals. Establish motion safety governance before any audio-reactive or dynamic visual effects. Classify visual effects by risk and epilepsy risk before implementing them. Build static/read-only registries before animation runtime. High-risk effects require explicit opt-in or remain forbidden. Reduce motion is the master safety authority that overrides visual preferences.

**Behavior To Reinforce:**
- Always write motion safety contract before any animation/audio-reactive implementation
- Classify effects by risk before runtime application
- Build static/read-only registries before active enforcement
- Use Playwright to prove passive nature by asserting absence of active controls
- Maintain zero skipped tests as acceptance gate
- Use repo-root wrapper for all git/npm/grep/find commands
- Keep separate commits for contract and implementation

**Evidence Pattern:**
- Typecheck: PASS (zero errors)
- Playwright: PASS (268 tests, zero failures, zero skips)
- Test Skip Check: CLEAN (no test.skip found)
- Git Status: CLEAN (post-commit)
- No animation/audio/music reactivity shipped
- No graph/Sigma mutation shipped
- No active controls shipped

**Future Prompt / Protocol Improvement:**
- Consider adding automated safety gate checks for forbidden categories
- Standardize motion safety contract sections for future accessibility work
- Consider adding epilepsy risk classification to general UI component guidelines

**Related Abilities:**
- Quest Splitter
- Contract Sentinel
- Evidence Guardian
- Playwright Scout
- Stop Condition Paladin
- Safety Lane Architect
- Classification Authority

**Status:**
Active

### 2026-05-03 — Graph Theme Application Warden (v55/v56/v57/v58)

**Source Pass / Title:**
v55: Graph Theme Application Contract (docs-only governance)
v56: Graph Shell Theme Evidence Application (DOM-only wrapper implementation)
v57: Graph Theme Token Value Application Contract (docs-only governance)
v58: Graph Theme Application Readiness Diagnostic (diagnostic inspection)

**What Went Well:**
- Clean linear quest with strict gate conditions
- Contract-first approach for v55 and v57
- DOM-only wrapper implementation for v56
- Diagnostic inspection for v58 without runtime changes
- All Playwright tests passing (256 total, 18 new v58 tests)
- Zero skipped tests
- Typecheck passing
- All forbidden boundaries respected (Sigma, node/edge, CSS variables, storage, commands)

**Reusable Lesson:**
Contract-first governance with incremental permission ladder works reliably. Define what is allowed/forbidden in a contract document before any runtime implementation. Use Playwright evidence to verify boundary adherence at each step. Treat Sigma/renderer as black box until explicitly promoted.

**Behavior To Reinforce:**
- Always write contract before implementation for graph/Sigma/theme work
- Use grep for test.skip before claiming clean pass
- Verify all forbidden boundaries with Playwright assertions
- Keep separate commits for contract and implementation
- Use absolute path wrapper for all repo commands

**Evidence Pattern:**
- Typecheck: PASS (zero errors)
- Playwright: PASS (256 tests, zero failures, zero skips)
- Test Skip Check: CLEAN (no test.skip found)
- Banned Hotkeys Check: CLEAN (no banned hotkeys found)
- Git Status: CLEAN (post-commit)

**Future Prompt / Protocol Improvement:**
- Consider adding automated test.skip check to pre-commit hooks
- Consider adding banned hotkey check to pre-commit hooks
- Standardize contract document sections for future passes

**Related Abilities:**
- Quest Splitter
- Contract Sentinel
- Evidence Guardian
- Playwright Scout
- Stop Condition Paladin
- Git Checkpoint Keeper

**Status:**
Active

### 2026-04-XX — Graph Theme Preview Knight (v52/v53/v54)

**Source Pass / Title:**
v52: Graph Theme Evidence Wrapper Mode (read-only DOM attributes)
v53: Graph Theme Token Value Preview Contract (docs-only governance)
v54: Graph Theme Token Value Preview (read-only value display)

**What Went Well:**
- Contract-first approach: v53 contract defined token path metadata vs token value preview distinction
- Read-only preview implementation: v54 displayed "metadata only (value preview deferred)" status
- All forbidden boundaries respected (Sigma mutation, node/edge styling, CSS writes, storage, hotkeys)
- Zero skipped tests in both v53 (208 passed) and v54 (219 passed, 11 new tests)
- Playwright tests proved read-only behavior with no apply/edit/save controls
- Clean Quest Mode split with separate commits for contract and implementation

**Reusable Lesson:**
Token path metadata vs token value preview distinction is a critical boundary. Display metadata as readout before resolving actual values. Implement read-only preview modes before any application modes. Use Playwright evidence to prove read-only nature by asserting absence of apply/edit/save controls.

**Behavior To Reinforce:**
- Define token path vs token value boundaries in contract before implementation
- Display metadata as readout before resolving values
- Use Playwright to assert absence of mutation controls in read-only modes
- Maintain zero skipped tests as acceptance gate
- Keep separate commits for contract and implementation

**Evidence Pattern:**
- v53: Typecheck 0 errors, Playwright 208 passed, 0 failures, 0 skips
- v54: Typecheck 0 errors, Playwright 219 passed (11 new tests), 0 failures, 0 skips
- No skipped tests: confirmed via grep
- Post-commit git status: clean

**Future Prompt / Protocol Improvement:**
- Standardize read-only mode patterns with explicit absence-of-controls assertions
- Consider adding automated checks for forbidden control presence

**Related Abilities:**
- Contract Sentinel
- Evidence Guardian
- Playwright Scout
- Quest Splitter
- Context Oracle

**Status:**
Promoted (lessons absorbed into broader patterns)

### 2026-04-XX — Graph Theme Boundary Warden (v46-v50)

**Source Pass / Title:**
v46: Graph Runtime Probe (passive readout)
v48: Graph Evidence Detail Mode (UI mode toggle)
v50: Graph Visual Theme Mapping Inventory (passive registry)

**What Went Well:**
- Passive observation before any mutation
- Read-only inventory building
- Stable test ID discipline
- Evidence detail mode for inspection

**Reusable Lesson:**
Passive observation phase is essential before any mutation. Build comprehensive inventories and registries as read-only inspection tools. Use stable test IDs for reliable Playwright evidence.

**Behavior To Reinforce:**
- Build passive/probe modes before active modes
- Use stable data-testid naming
- Add detail modes for inspection

**Evidence Pattern:**
- Typecheck: PASS
- Playwright: PASS
- No skipped tests

**Future Prompt / Protocol Improvement:**
- Consider standardizing inventory registry patterns

**Related Abilities:**
- Evidence Guardian
- Playwright Scout
- Locator Smith

**Status:**
Promoted (lessons absorbed into broader patterns)

## Promotion Rule

When a new title is awarded:
1. Summarize current title lessons into this experience ledger
2. Move current title (23_BANDIT_CURRENT_TITLE.md) to previous title (22_BANDIT_PREVIOUS_TITLE.md)
3. Write new current title (23_BANDIT_CURRENT_TITLE.md) with pointer to ledger for detailed lessons
4. Commit as docs-only

Do not create endless standalone title files. Extract reusable lessons into this ledger.

## Summary

This ledger captures the evolution of Bandit's successful patterns across graph/Sigma/theme work, Quest Mode discipline, and boundary enforcement. The key recurring themes are:

1. **Contract-first governance**: Define before implement
2. **Observation-before-mutation**: Read-only before active
3. **Incremental permission ladder**: DOM wrapper → CSS variables → token values → Sigma
4. **Playwright evidence discipline**: Stable IDs, zero skips, full coverage
5. **Boundary enforcement**: Treat Sigma as black box until explicitly promoted
6. **Clean pass criteria**: Typecheck + Playwright + zero skips + clean git status

These patterns have proven reliable across multiple passes and should be reinforced in future work.
