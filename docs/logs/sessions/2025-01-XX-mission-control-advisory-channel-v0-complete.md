# Session Log: Mission Control Proposal Channel v0

## Goal
Implement a structured "Bandit Questions & Proposals" advisory channel within Mission Control / QA workflows.

## Files Changed
- `src/control-plane/qa/qa.types.ts` - Added Bandit advisory types (BanditQuestion, BanditProposal, BanditBacklogIdea, BanditAdvisorySection)
- `src/control-plane/qa/qa.store.ts` - Extended QA store with advisory state (advisoryByChecklist, setAdvisorySection, getAdvisorySection)
- `src/control-plane/qa/advisory-registry.ts` - Created new file with default advisory content for v13
- `src/control-plane/qa/QaPanel.tsx` - Added Advisory tab, advisory state, and UI rendering
- `src/control-plane/qa/qa-registry.ts` - Added v13 checklist with 30 checks for advisory channel
- `tests/e2e/contract-registry.spec.ts` - Added Playwright tests for advisory features
- `docs/handleset/01_ACTIVE_HANDLES.md` - Added Mission Control section with advisory controls
- `docs/handleset/06_HANDLES_REQUIRING_QA.md` - Updated with advisory coverage

## What Changed

### Slice 1: Validation Catch-Up / Previous Pass Verification
- Ran `npm run typecheck` - passed
- Ran `npm run qa:e2e` - passed
- Confirmed v12 checklist exists and is default
- Confirmed contract summary visible in Mission Control Debug tab

### Slice 2: Design Data Model for Bandit Questions / Proposals
- Added BanditQuestion type with fields: id, prompt, context, responseType, userResponse, status
- Added BanditProposal type with fields: id, title, summary, rationale, risk, recommendedNextAction, userDecision, userNotes
- Added BanditBacklogIdea type with fields: rank, title, whyItMatters, suggestedFutureBite, risk, status
- Added BanditAdvisorySection container type
- Extended QA store with advisory state management

### Slice 3: QA Registry Support for Larger Checklists
- Verified existing QA navigation handles arbitrary checklist lengths
- Confirmed no hardcoded limits on checklist item count
- Current implementation supports up to 30 items without UI degradation

### Slice 4: Mission Control Advisory Tab or Section
- Added "advisory" to PanelView type
- Added Advisory tab button to QaPanel with test ID qa-tab-advisory
- Added advisory view section with placeholder content
- Tab switches to Advisory view when clicked

### Slice 5: Seed v0 Advisory Content
- Created advisory-registry.ts with defaultAdvisoryV13
- Added 10 Bandit questions with prompts, context, and status selectors
- Added 10 Bandit proposals with title, summary, rationale, risk, decision selector, and notes field
- Added 10 Bandit backlog items with rank, title, whyItMatters, suggestedFutureBite, risk, status
- Integrated advisory content into QaPanel state

### Slice 6: QA Submission Output Includes Advisory Responses
- Updated generateMarkdownReport to accept advisory parameter
- Added Bandit Questions section to markdown output with status and user response
- Added Bandit Proposals section to markdown output with decision and user notes
- Added Bandit Backlog Top 10 section to markdown output with status
- Updated copyQaReport and submitQaReport to pass advisory content

### Slice 7: v13 QA Checklist Activation
- Created v13 checklist with 30 checks in qa-registry.ts
- Included checks for previous contract preservation (theme, glitter, reduce motion, tabs, contract summary, etc.)
- Included checks for advisory channel features (tab visibility, questions, proposals, backlog, submission output)
- Updated QaPanel default to mission-control-advisory-channel with v13

### Slice 8: Playwright Coverage
- Added test: Advisory tab is visible
- Added test: Bandit Questions render in Advisory tab
- Added test: Question status can be changed
- Added test: Bandit Proposals render in Advisory tab
- Added test: Proposal decision can be changed
- Added test: Proposal notes field accepts input
- Added test: Bandit Backlog Top 10 renders
- Added test: v13 is default active checklist

### Slice 9: Documentation
- Updated docs/handleset/01_ACTIVE_HANDLES.md with Mission Control section
- Added qa.advisoryTab entry with tab button details
- Added qa.banditQuestionStatus entry with selector details
- Added qa.banditProposalDecision entry with selector details
- Added qa.banditProposalNotes entry with textarea details
- Updated docs/handleset/06_HANDLES_REQUIRING_QA.md with advisory coverage
- Updated summary to reflect 18 active handles (up from 13)

## Validation
- `npm run typecheck` - passed
- `npm run qa:e2e` - passed (32/32 tests)
- Fixed v13 default active checklist test to switch to Debug tab first
- Advisory tab visible and clickable
- Advisory content renders correctly with 10 questions, 10 proposals, 10 backlog items
- Status and decision selectors work
- Notes field accepts input
- Advisory sections appear in QA submission markdown
- v13 is default active checklist

## Issues
- Initial Playwright test failure for v13 default active checklist - fixed by switching to Debug tab before checking for checklist key

## Decision
Mission Control Advisory Channel v0 is complete with all slices implemented and validated.

## Next Step
None - Mission Control Proposal Channel v0 implementation complete.
