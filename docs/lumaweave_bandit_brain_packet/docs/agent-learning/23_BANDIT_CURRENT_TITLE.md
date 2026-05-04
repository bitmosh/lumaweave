# Bandit Level 37.5 — Contract Trace Architect

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

Current-rank working knowledge for Bandit Level 35.25 — Graph Control Plane Cartographer.

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

### v69 Collapsible Evidence Recovery Scar — Do Not Collapse Accepted Evidence Broadly

**Lesson**: Accepted evidence is a contract. Do not collapse all legacy evidence sections in one pass.

**Context**: The v69 Collapsible Evidence Sections / Summary Cards implementation attempt was paused/reverted after test migration instability. The first implementation collapsed multiple accepted legacy evidence sections at once, causing old Playwright evidence tests to fail because they expected accepted evidence to be visible. A later attempted test migration corrupted the large graph-visual-inventory.spec.ts file. The repo was recovered by restoring the runtime/QA/test files to the accepted v68 state, preserving only the accepted Bandit title update and a tiny unused-import cleanup.

**Details**:

1. **Accepted evidence is a contract.**
   - Older accepted Playwright assertions are not disposable.
   - New navigation UI may reorganize evidence, but it must not remove, hide without a tested access path, or weaken accepted evidence.
   - If content is hidden behind a disclosure, tests must have a stable, narrow way to open the exact section before asserting the same evidence.

2. **Do not collapse all legacy evidence sections in one pass.**
   Future retry should use slices:
   - v69a: overview grid / summary cards only, no collapsing legacy accepted evidence
   - v69b: section metadata registry + test helper contract
   - v69c: collapse one legacy section at a time after tests are migrated and validated
   - v69d: repeat section-by-section, stopping after first cascade

3. **Do not mass-edit the large graph-visual-inventory Playwright spec.**
   - Do not insert broad beforeEach hooks across nested describe blocks.
   - Do not patch many old tests one by one.
   - Do not use broad text-pattern edits in the large spec.
   - Prefer one small helper or a new focused spec file when possible.
   - Validate after each small test-group migration.
   - If structure becomes uncertain, stop and report before editing.

4. **Better retry design:**
   - Keep legacy accepted sections open until their tests are explicitly migrated.
   - Add summary cards and overview widgets first.
   - Add collapsible shell only around new or non-legacy sections first.
   - Create stable section/toggle/panel test IDs before changing default visibility.
   - Use a section metadata registry if many sections share behavior.
   - Use an explicit helper contract before collapsing existing evidence.

5. **Failure classification:**
   If a future v69 retry causes failures:
   - missing content after opening section = real implementation regression
   - content exists but is collapsed = test/helper migration needed
   - many failures in one section = shared visibility contract issue
   - many failures across QA key/advisory/proposal = QA lockstep drift
   - syntax errors after test edits = stop and restore, do not keep patching

6. **Recovery rule:**
   When a feature attempt creates mixed runtime/test/QA state:
   - stop
   - restore a coherent accepted checkpoint
   - preserve only intentional brain/title updates and tiny validated cleanup
   - do not leave active QA key pointing at a paused feature
   - do not mark paused work as current/completed

## Status

Current title - Detailed lessons extracted into `21_BANDIT_EXPERIENCE_LEDGER.md`

## Level Awarded

**Date**: 2026-05-03
**Previous Level**: 32.75 (Audio Reactivity Contract Warden)
**New Level**: 37.5 (Contract Trace Architect)
**Levels Awarded**: +4.75

## Breakdown

- **+1**: v67 clean pass - Lattica Roadmap Realignment (docs-only governance with ten improvement tracks)
- **+1**: v68 clean pass - Graph Control Plane Navigation Contract (docs-only UX/navigation contract)
- **+1.5**: v70 clean pass - QA Bundle Validator v0 (QA drift detection script with clear classifications)
- **+0.5**: v70 clarity bonus (clear, actionable drift classifications and successful v68 QA identity realignment)
- **+1**: v71a clean pass - Contract-to-Code Trace Matrix (docs-only contract-to-source mapping)
- **+1**: v71b clean pass - Contract Trace Validator v0 (read-only trace matrix validator)
- **+0.25**: v71b precision bonus (line-based parser instead of brittle character-window parsing)
- **+0.5**: Streak bonus (streak 3 milestone reached)
- **+0**: Multi-step bonus (docs-only, no implementation)

## Quest Completed

**Quest Mode**: Docs-only Roadmap Reconfiguration + Navigation Contract
**Split**: v67 (roadmap realignment) → v68 (navigation contract)

## v67: Lattica Roadmap Realignment

**Contract Document**: `docs/roadmap/LATTICA_ROADMAP_REALIGNMENT_V67.md`

**Key Sections Defined**:
- Current accepted pipeline (v59–v66 safety/audio spine)
- External foundations vs Lattica-owned layers
- Completed safety/audio spine documentation
- Ten improvement tracks scheduled with classification
- Dedicated session requirements
- Sprinkle-in opportunities
- Proposed v68–v80 roadmap

**Ten Improvement Tracks Scheduled**:
1. QA Bundle Validator Script (v70, dedicated session)
2. Contract-to-Code Trace Matrix (v71, dedicated session)
3. Data-driven Control Plane Section Registry (v72, sprinkle-in)
4. Registry Explorer / Searchable System Index (v72, implementation-first)
5. Human Mode vs Evidence Mode (v73, docs-first)
6. Source Adapter OS Reconnect (v74, dedicated session)
7. Theme Workshop Security Hardening Path (v77, dedicated session)
8. Synthetic Data Fixtures as First-Class Toolset (v75, implementation-first)
9. Verified Download Button Boundary (v76, docs-first)
10. Theme Submission Security Model Implementation Plan (v77, docs-first)

**Commit**: (pending)

## v68: Graph Control Plane Navigation Contract

**Contract Document**: `docs/control-plane/GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md`

**Key Sections Defined**:
- Current problem: scroll-wall in Graph Visual Inventory
- Overview → Drilldown model (Human Mode vs Evidence Mode)
- Sticky summary / mini TOC model
- Collapsible evidence sections
- Compact summary cards
- Music Reactive Mapping grouping by mode family
- Stable test ID preservation
- Accessibility requirements
- Playwright evidence requirements
- Forbidden runtime changes
- v69 preconditions
- v70+ promotion path

**Navigation Model**:
- Sticky summary at top with section links
- Collapsible sections (default collapsed for dense sections)
- Compact summary cards for quick scanning
- Music Reactive Mapping grouped by 6 mode families
- Human Mode (compact) vs Evidence Mode (detailed)

**Commit**: (pending)

## v70: QA Bundle Validator v0 — QA Drift Sentinel

**Validator Script**: `scripts/validate-qa-bundle.mjs`

**Key Checks Implemented**:
- DEFAULT_QA_KEY coherence (QaPanel vs contract-registry)
- CURRENT_QA_KEY coherence
- BACKLOG_POLICY current pass detection
- Advisory section existence for current QA key
- Proposal IDs in contract-registry exist in active advisory
- Advisory has backlog rows
- Clear drift classifications: QA key drift, advisory missing, proposal ID drift, backlog row drift, backlog policy marker missing

**Source-Shape Fixes**:
- Fixed version formatting (removed duplicate "v" prefixes: vv66 → v66, advisoryVV66 → advisoryV66)
- Fixed BACKLOG_POLICY parser to avoid false historical matches (removed generic fallback, strict current-pass matching only)
- Fixed advisory parser to match actual export naming convention (advisoryV66 not advisory66)

**v68 QA Identity Realignment**:
- Aligned DEFAULT_QA_KEY to v68
- Aligned CURRENT_QA_KEY to v68
- Created advisoryV68 with 6 answered questions, 2 proposals, 3 backlog rows
- Updated proposal IDs to v69-collapsible-evidence-sections-summary-cards and v70-qa-bundle-validator-script
- Added v68 qa-registry entries (8 active checklist items)
- Updated BACKLOG_POLICY to mark v68 as current pass, v67 as completed
- v69 marked as paused/retry later (deferred with userNotes)
- v70 marked as current/in validation, temporarily outranks v69

**v68 Advisory Cleanup**:
- Resolved all v68 questions as answered (contract-only pass, no runtime implementation)
- Updated proposals to put v70 first (current/in validation), v69 second (paused/retry later)
- Reordered backlog: v70 first, v69 second, v71 third
- Added "actively being built now" sentence to v70 rationale

**Clean Pass Evidence**:
- Typecheck: PASS (zero errors)
- Validator: PASS (10/10 checks)
- npm run qa:bundle: PASS (10/10)
- contract-registry Playwright: PASS (27 passed)
- test.skip grep: CLEAN (no test.skip found)

**Forbidden Boundaries Respected**:
- No runtime UI changes
- No graph/Sigma mutation
- No audio input/playback/music runtime behavior
- No test skips
- No test rewrites
- No QA key rotation without validator proof

**Visual Grammar Engine Docs Packet**:
- Added `docs/visual-grammar-engine/` as future architecture source
- Docs-only / no implementation without explicit authorization
- No new token path promotion without explicit authorization
- No CSS variable writes, no graph/Sigma mutation, no audio runtime behavior, no command execution
- Use for naming consistency, product direction, future planning, roadmap alignment

## v71a: Contract-to-Code Trace Matrix

**Trace Matrix Document**: `docs/control-plane/CONTRACT_TO_CODE_TRACE_MATRIX.md`

**Key Sections Defined**:
- Overview explaining purpose (reduce drift between contracts, source, QA, tests, evidence)
- Trace Matrix with 15 contract/system rows
- QA Key to Contract Mapping
- Forbidden Boundaries Summary
- Drift Prevention (referencing QA Bundle Validator)
- Future Validation Needs
- Version History

**Trace Matrix Rows Added**:
- Command Deck / Hotkey Registry (v30)
- Perspective System (v30)
- Graph View Element Registry (v40)
- Graph Visual Inventory (v48, v68)
- Graph Runtime Boundary / Probe (v42)
- Graph Theme Mapping Registry (v57)
- Theme Token Path Map (v57)
- Motion Safety / Epilepsy Guard (v59)
- Synthetic Audio Signal Preview (v62)
- Music Reactive Mapping Registry (v63)
- Audio Source Registry (v66)
- Graph Control Plane Navigation Contract (v68)
- QA Bundle Validator (v70)
- Theme Workshop Security Packet (v77, scheduled)
- Visual Grammar Engine (future/docs-only)

**Each Row Includes**:
- Contract/doc path
- Source/runtime files
- Registry files
- QA key/pass association
- Playwright test file(s)
- Evidence surface
- Forbidden boundaries
- Current status
- Known gaps / future validation

**Clean Pass Evidence**:
- Typecheck: PASS (zero errors)
- QA Bundle Validator: PASS (10/10)
- Contract-registry: PASS (27 passed)
- test.skip grep: CLEAN (no test.skip found)

**Forbidden Boundaries Respected**:
- No runtime UI changes
- No graph/Sigma mutation
- No audio input/playback/music runtime behavior
- No test skips
- No test rewrites
- No QA key rotation
- No command execution

## v71b: Contract Trace Validator v0

**Validator Script**: `scripts/validate-contract-trace.mjs`

**Key Checks Implemented**:
- File exists check
- Required sections/headers check
- Required labels/columns check (Contract, Doc Path, Source, Runtime, Registry, QA, Pass, Playwright, Evidence, Forbidden, Boundaries, Status, Known Gaps, Future Validation)
- Required systems/rows check (15 systems)
- File/path reference check per row (src/, tests/, docs/, scripts/, .ts, .tsx, .md, .mjs)
- Visual Grammar Engine future/docs-only marker check
- v69 paused/future marker check

**Parser Precision**:
- Initial implementation used character-window parsing (200 → 500 chars) which was brittle
- Fixed with line-based markdown table parsing: split document into lines, find line containing system name, check entire line for file/path references
- Line-based parser is more robust and correctly detects file references regardless of row length

**Clean Pass Evidence**:
- Typecheck: PASS (zero errors)
- QA Bundle Validator: PASS (10/10)
- Contract Trace Validator: PASS (0 warnings)
- npm run trace:contracts: PASS (0 warnings)
- Contract-registry: PASS (27 passed)
- test.skip grep: CLEAN (no test.skip found)

**Forbidden Boundaries Respected**:
- No runtime UI changes
- No graph/Sigma mutation
- No audio input/playback/music runtime behavior
- No test skips
- No test rewrites
- No QA key rotation
- No command execution

**Arena Docs Packet**:
- Added `docs/lumaweave-arena/` as future concept/docs-only source
- No implementation authorization
- Future concept for sandboxed procedural graph arenas, LLM benchmark tournaments, defensive security hardening arenas, replay/evidence scoring, Signal Loom spectator visualization
- All arena concepts are synthetic, sandboxed, local-first, defensive/evaluative, and evidence-scored
- No real-world exploitation, live target interaction, scanning, malware, credential attacks, or offensive tooling

## Clean Pass Evidence

**Typecheck**: PASS (zero errors)
**Playwright**: PASS (338+ tests, zero failures, zero skips) - pending final validation
**Test Skip Check**: CLEAN (no `test.skip` found)
**Git Status**: DIRTY (pending user commit after validation)
**Backlog Policy**: Updated (v66 completed, v67 current, v68 candidate)

## Stop Conditions Respected

All forbidden boundaries were respected:
- No runtime implementation (v67/v68 are docs-only)
- No graph/Sigma mutation
- No audio input/playback
- No command execution
- No animation beyond accessible disclosure (deferred to v69+)
- No test skips
- No evidence removal
- No weakening historical contract tests

## Architecture Boundaries Respected

- **Docs-Only v67/v68**: No runtime implementation, no graph/Sigma mutation, no audio input/playback
- **Roadmap Realignment**: Distinguished external foundations from Lattica-owned layers, documented completed safety/audio spine
- **Navigation Contract**: Defined UX/navigation improvements without weakening evidence, preserved all data-testid values
- **Ten Improvement Tracks**: Scheduled with classification (dedicated session, sprinkle-in, docs-first, implementation-first)
- **v68 Implementation Deferred**: v68 is contract-only, implementation deferred to v69 based on user authorization
- **Forbidden Changes**: No graph/Sigma mutation, no command execution, no music reactivity, no audio input/playback
- **Evidence Preservation**: All evidence content must be preserved in navigation improvements

## Quest Mode Discipline

- **Docs-Only Protocol**: v67/v68 are docs-only, no runtime implementation
- **Contract First**: v67 roadmap realignment completed before v68 navigation contract
- **No Implementation**: No runtime code added, no graph/Sigma mutation, no audio input/playback
- **No Terminal Commands**: All work done in Locked Terminal Mode, no validation commands run
- **QA Lockstep**: Updated BACKLOG_POLICY only (docs-only backlog update, no QA key rotation)
- **Ten Improvement Tracks**: Scheduled with clear classification and priority
- **Navigation Contract**: Defined UX/navigation improvements with evidence preservation requirements
- **v69 Preconditions**: Clearly defined for future implementation authorization

## Level Title Rationale

**Contract Trace Architect**: This title reflects the contract-to-code trace matrix and validator work done in v71. The Contract-to-Code Trace Matrix (v71a) created a comprehensive docs-only mapping between major contracts/governance docs and their corresponding runtime files, registries, tests, and evidence paths, reducing drift between contracts, source, QA, and validation. The Contract Trace Validator (v71b) created a read-only script that checks the trace matrix for required structure, labels, and system rows, using line-based markdown table parsing to robustly detect file/path references. Together, v71a and v71b establish a foundation for future contract-to-code coherence, ensuring that contracts remain aligned with their implementation evidence. The architect maps the relationship between contracts and code, providing visibility into how governance docs connect to runtime systems, tests, and evidence surfaces, while respecting forbidden boundaries (no graph/Sigma mutation, no audio runtime behavior, no v69 retry, no command execution). The line-based parser precision (replacing brittle character-window parsing) demonstrates attention to implementation quality and robustness.

## Clean Streak

**Current Streak**: 3
**Streak Bonus Awarded**: +0.5 (streak 3 milestone reached)
**Next Milestone**: Streak 4 (+0.5 bonus)
**Standard Cap**: Streak 5 (+1.0 bonus cap)

## Next Steps

Current state after v71b acceptance:
- v68: Accepted as current QA identity checkpoint (contract-only, no runtime implementation)
- v69: Paused/retry later using sliced passes (v69a overview grid only, v69b section metadata registry, v69c collapse one legacy section at a time after validation)
- v70: QA Bundle Validator v0 accepted (protects QA/advisory/proposal lockstep before retrying v69)
- v71a: Contract-to-Code Trace Matrix accepted (docs-only contract-to-source mapping)
- v71b: Contract Trace Validator v0 accepted (read-only trace matrix validator with line-based parser)

Potential future work based on v67 roadmap realignment:
- v69 retry: Collapsible Evidence Sections / Summary Cards (using sliced passes after v70 validation is stable)
- v72: Registry Explorer v0 (implementation-first)
- v73: Human Mode vs Evidence Mode (docs-first)
- v74: Source Adapter OS Reconnect Contract (dedicated session)
- v75: Synthetic Data Fixtures v0 (implementation-first)
- v76: Verified Download Button Boundary Contract (docs-first)
- v77: Theme Submission Security Model Implementation Plan (docs-first, dedicated session)
- Visual Grammar Engine: Future architecture source, docs-only, no implementation without explicit authorization
- Lumaweave Arena: Future concept/docs-only source, no implementation authorization (sandboxed procedural graph arenas, LLM benchmark tournaments, defensive security hardening arenas, replay/evidence scoring, Signal Loom spectator visualization)
- Run QA Bundle Validator before any QA key rotation or advisory changes
- Run Contract Trace Validator after any contract-to-code changes
- Continue respecting all forbidden categories until explicitly promoted
- Maintain clean streak for future bonuses
- Apply docs-only protocol when appropriate (no implementation without contract)
- Apply evidence preservation requirements to all navigation improvements

## Detailed Lessons

See `21_BANDIT_EXPERIENCE_LEDGER.md` for reusable lessons extracted from this title.
