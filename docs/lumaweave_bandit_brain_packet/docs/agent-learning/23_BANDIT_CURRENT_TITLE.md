# Bandit Level 26.75 — Epilepsy Guard Warden

Bandit Self-Patch Protocol

New lessons do not automatically overwrite old rules.

Bandit must classify whether the new lesson:
1. reinforces an existing rule
2. narrows an existing rule
3. supersedes an old rule
4. conflicts with an old rule
5. is only situational and should stay in the current title skill bank

## Self-Patch Protocol

Bandit may discover new operating lessons that refine, narrow, or conflict with older paradigms.

Do not silently overwrite old memory.

When a new lesson appears, classify it before updating memory.

### Patch Classification

Classify every new lesson as one of:

- **Reinforces Existing Rule**: The new lesson supports an existing protocol.
- **Narrows Existing Rule**: The new lesson adds a condition or boundary to an existing protocol.
- **Supersedes Existing Rule**: The new lesson replaces an older rule that is now unsafe, stale, or incomplete.
- **Conflicts With Existing Rule**: The new lesson contradicts an older rule and requires user review.
- **Situational Skill**: The lesson applies only to the current title/rank context and should stay in the current Active Skill Bank for now.

### Memory Patch Targets

Use the narrowest durable target:

- `23_BANDIT_CURRENT_TITLE.md`
  - current-rank skill bank
  - fresh lessons
  - active scars
  - situational operating notes

- `21_BANDIT_EXPERIENCE_LEDGER.md`
  - durable success patterns
  - lessons that survived at least one clean validation cycle
  - distilled title/rank lessons

- `16_SELF_IMPROVEMENT_SUGGESTION_BOX.md`
  - recurring failures
  - unresolved weakness patterns
  - improvement proposals

- `24_BANDIT_WORKING_MEMORY_REFRESHER.md`
  - changes to what Bandit must load before certain pass types

- `25_BANDIT_SELF_MODEL_AND_GROWTH_PROTOCOL.md`
  - changes to modes, stop conditions, known weaknesses, or contract bundles

- Dedicated protocol docs
  - only for stable rules that should apply across all future work

### Conflict Handling

If a new lesson conflicts with an older paradigm:

1. Do not overwrite the old rule immediately.
2. Record the conflict in the current title Active Skill Bank.
3. Name both rules:
   - old rule
   - new lesson
4. Explain why they conflict.
5. Propose a resolution:
   - keep old rule
   - narrow old rule
   - supersede old rule
   - require user decision
6. Ask the user before changing durable protocol docs.

### Supersession Format

Use this format when a lesson supersedes older guidance:

```txt
Memory Self-Patch

New lesson:
...

Old paradigm affected:
...

Patch classification:
Reinforces / Narrows / Supersedes / Conflicts / Situational

Reason:
...

Updated rule:
...

Files to update:
...

User approval required?
yes/no

Current Example

Old paradigm:

Use the repo wrapper to make commands safe.

New lesson:

When Bandit is in Locked Terminal Mode, no commands are allowed at all, including wrapper commands.

Patch classification:

Narrows Existing Rule

Resolved rule:

Normal command mode may use the repo wrapper.
Locked Terminal Mode forbids all terminal commands. The user runs validation manually.
Rule

A self-patch is successful only if it makes future behavior simpler, safer, and less ambiguous.

Do not create more protocol complexity unless the new rule prevents a repeated failure.


## What this solves

This would have helped with the wrapper confusion:

```txt
Old rule: Use wrapper.
New rule: Terminal revoked means no commands.
Resolution: wrapper is allowed only outside Locked Terminal Mode.

And with the advisory issue:

Old assumption: switching QA key updates checklist/debug.
New lesson: advisory content must also bind to selected QA key.
Resolution: QA identity bundle includes advisory render binding, not only registry existence.

## Active Skill Bank

Current-rank working knowledge for Bandit Level 26.75 — Epilepsy Guard Warden.

### QA Advisory Binding: Registry Definitions Are Source Of Truth

**Lesson**: Advisory registry definitions are the source of truth. The selected QA key must control advisory identity.

**Details**:
- `getAdvisoryForQaKey(activeQaKey)` or equivalent should provide the advisory definition for the selected QA key
- Local state/localStorage may preserve mutable user fields only (question userResponse, question status, proposal userDecision, proposal userNotes, compatible backlog order)
- localStorage must not replace registry definitions or advisory identity
- Registry fields that must not be replaced by localStorage: question prompt, question context, proposal title, proposal summary, proposal rationale, backlog title, backlog whyItMatters, advisory section identity
- If advisoryV48 exists and prompt exists but UI does not render it after switch, classify as runtime advisory binding/refresh drift

**Preferred runtime model**:
```
selected QA key
→ getAdvisoryForQaKey(selectedQaKey)
→ base advisory definition
→ merge persisted mutable user fields only
→ render advisory content
```

### QA Advisory Lockstep

**Lesson**: Active QA key, qa-registry, advisory-registry, contract-registry constants, and backlog policy move together.

**Details**:
- When bumping vXX, always update: BACKLOG_POLICY current/completed pass, QaPanel default key, qa-registry active checks, advisory-registry advisoryVXX section (with proposals and backlog), advisory lookup function, contract-registry CURRENT_QA_KEY, and contract-registry proposal IDs
- Do not update proposal IDs in tests unless the active advisory section contains those exact IDs
- Fallback advisory is not valid acceptance evidence for current Quest Mode
- Backlog tests require backlog rows
- Run grep check before Playwright: `grep -R "advisoryVXX\\|proposal-id" -n src/control-plane/qa/advisory-registry.ts tests/e2e/contract-registry.spec.ts`

### Locked Terminal Mode

**Lesson**: No commands means no commands. The user runs validation manually.

**Details**:
- In Locked Terminal Mode, Bandit must not run any terminal commands, including wrapper commands
- User runs validation and git commands manually
- Bandit edits explicitly assigned files only and reports changes
- If evidence is needed, ask user for output
- If Bandit detects /home/boop/Projects, it must ask user to redirect manually: `cd /home/boop/Projects/lumaweave || exit 1`

### Parent Directory Escape

**Lesson**: /home/boop/Projects is not the repo. Valid repo is /home/boop/Projects/lumaweave.

**Details**:
- Commands run from /home/boop/Projects are invalid for LumaWeave and will often fail with "fatal: not a git repository"
- Do not inspect parent directories
- Do not diagnose sibling folders
- Do not run git status, find, grep, ls from /home/boop/Projects
- In Locked Terminal Mode, Bandit must ask user to redirect manually instead of running commands

### Audio Reactivity Safety Ladder

**Lesson**: Motion Safety before music-reactive visuals. Synthetic signal before real audio.

**Details**:
- Motion Safety/Epilepsy Guard before music-reactive visuals
- Synthetic signal preview before real audio
- Signal preview before visual reaction
- No audio playback, microphone, animation, graph/Sigma reactivity, or node/edge/canvas styling until explicitly promoted
- Contract-first approach: define safety boundaries before implementation

## Status

Current title - Detailed lessons extracted into `21_BANDIT_EXPERIENCE_LEDGER.md`

## Level Awarded

**Date**: 2026-05-03
**Previous Level**: 23.5 (Graph Theme Application Warden)
**New Level**: 26.75 (Epilepsy Guard Warden)
**Levels Awarded**: +3.25

## Breakdown

- **+1**: v59 clean pass - Motion Safety/Epilepsy Guard Contract (docs-only governance)
- **+1**: v60 clean pass - Reduced Motion Guard Registry (static/read-only registry with passive UI)
- **+1**: Clean multi-step Quest Mode bonus
- **+0.25**: Clean streak bonus (streak 2)

## Quest Completed

**Quest Mode**: Self-Splitting Quest with strict motion safety and epilepsy prevention boundaries
**Split**: v59 (contract) → v60 (static/read-only registry with passive UI)

## v59: Motion Safety/Epilepsy Guard Contract

**Contract Document**: `docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md`

**Key Sections Defined**:
- Motion safety model and definitions
- Epilepsy risk model (none/possible/high)
- Reduced motion authority (master safety switch)
- Visual effect risk categories (safe/low/moderate/high)
- Forbidden categories (strobe, rapid flashing, camera shake, audio reactivity, graph/Sigma mutation)
- Safety gate model
- Relationships to music-reactive, graph visual, theme, and Command Deck systems
- v60 preconditions (registry must be static/read-only)
- v61+ promotion path (requires advisory approval and safety gate implementation)
- Stop conditions for reduce motion and epilepsy risk
- Acceptance criteria

**Commit**: `9cf28a4`

## v60: Reduced Motion Guard Registry

**Implementation**: `src/accessibility/motionSafetyRegistry.ts` and `src/control-plane/graph/GraphVisualInventoryPanel.tsx`

**Registry Features**:
- Static, typed registry with 8 classified effects
- Risk classification: safe (3), low (3), moderate (2), high (0)
- Reduced-motion behavior: allow, soften, disable
- Epilepsy risk classification: none, possible, high
- Explicit opt-in requirements for moderate-risk effects
- Query functions: getAll, getById, getByRisk, getByEpilepsyRisk, requiresOptIn

**Passive UI Features**:
- Read-only inventory display in Graph Visual Inventory Panel
- Registry entry counts by risk level
- Explicit opt-in count display
- Passive nature notice (no animation, no audio input, no music reactivity, no graph/Sigma mutation, no active controls)

**Playwright Tests**: `tests/e2e/graph-visual-inventory.spec.ts`

**Test Coverage** (11 tests):
- Section/title/description visibility
- Registry entries count (8)
- Risk category counts (safe 3, low 3, moderate 2, high 0)
- Opt-in count (2)
- Passive nature notice verification
- Existing systems still work (inventory/probe/detail mode/theme mapping/evidence/application/diagnostic)
- No animation/audio/graph mutation controls active

**Commit**: `21bc219`

## Clean Pass Evidence

**Typecheck**: PASS (zero errors)
**Playwright**: PASS (268 tests, zero failures, zero skips)
**Test Skip Check**: CLEAN (no `test.skip` found)
**Git Status**: CLEAN (post-commit)
**Backlog Policy**: Updated (v59 completed, v60 completed)

## Stop Conditions Respected

All forbidden boundaries were respected:
- No animation added
- No audio input added
- No music-reactive visuals added
- No graph/Sigma mutation added
- No node/edge/canvas styling added
- No CSS variables written
- No theme preset mutation
- No storage/persistence
- No hotkeys/listeners
- No command execution

## Architecture Boundaries Respected

- **Safety Lane Precedence**: Motion safety governance established before any music-reactive visuals
- **Reduce Motion Authority**: Recognized as master safety switch
- **Static/Read-Only Registry**: No runtime effect execution in v60
- **Classification Before Implementation**: Effects classified by risk before any runtime application
- **Passive UI Only**: No active controls, no effect execution
- **Playwright Evidence**: All boundary assertions verified via Playwright

## Quest Mode Discipline

- **Self-Splitting Quest Protocol**: Followed strictly
- **Contract First**: v59 contract completed before v60 implementation
- **Gate Conditions**: All v60 preconditions verified (static/read-only, no animation/audio/graph mutation)
- **Playwright Evidence**: Full test coverage for both contract and implementation
- **No DevTools Steps**: All acceptance criteria verified via Playwright
- **Clean Commits**: Separate commits for v59 and v60
- **Clean Streak**: Reached streak 2 and earned +0.25 streak bonus

## Level Title Rationale

**Epilepsy Guard Warden**: This title reflects the guardian role played in establishing motion safety and epilepsy prevention governance. The contract (v59) and registry (v60) define strict boundaries for visual effects, classify effects by risk and epilepsy risk, and establish reduce motion as the master safety authority. The warden protects users from harmful visual effects (strobe, flashing, camera shake, audio reactivity) while enabling a structured path for safe visual effects through classification and explicit opt-in requirements.

## Clean Streak

**Current Streak**: 2
**Streak Bonus Awarded**: +0.25
**Next Milestone**: Streak 3 (+0.5 bonus)
**Standard Cap**: Streak 5 (+1.0 bonus cap)

## Next Steps

Potential future work in this area:
- v61+: Implement safety gate for runtime effect enforcement (if governance permits)
- v61+: Add reduce motion preference integration with theme system (if governance permits)
- v61+: Implement explicit opt-in UI for moderate-risk effects (if governance permits)
- Continue respecting all forbidden categories until explicitly promoted
- Maintain clean streak for future bonuses

## Detailed Lessons

See `21_BANDIT_EXPERIENCE_LEDGER.md` for reusable lessons extracted from this title.
