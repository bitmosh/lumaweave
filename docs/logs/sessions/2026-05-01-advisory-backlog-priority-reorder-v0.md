# Session Log: Advisory Backlog Priority Reorder v0

## Goal
Implement Advisory Backlog Priority Reorder v0 feature to allow users to reorder the Bandit Top 10 Backlog by desired priority using Move Up / Move Down buttons.

## Files Changed

- `src/control-plane/qa/advisory-registry.ts` - Updated backlog order to match desired priority
- `src/control-plane/qa/QaPanel.tsx` - Added reorder state, Move Up/Down buttons, localStorage persistence
- `src/control-plane/qa/qa-registry.ts` - Added v14 QA checklist with 16 checks
- `tests/e2e/contract-registry.spec.ts` - Added 4 Playwright tests for reorder functionality

## What Changed

### Advisory Registry
- Reordered backlog array to match desired priority order:
  1. Graph Inspector v0
  2. Experimental Mode Gate
  3. QA Contract Ledger v0
  4. Handleset Drift Checker
  5. Source Link Readiness Audit
  6. Theme Token Coverage Test
  7. Mission Control Report Export
  8. Graph Search / Filter v0
  9. Label Preset System
  10. Layout Lens Presets

### QaPanel
- Added localStorage persistence for backlog order on component mount
- Added `moveBacklogItemUp` and `moveBacklogItemDown` functions
- Added Move Up (↑) and Move Down (↓) buttons to each backlog item
- Updated backlog description to indicate reordering capability
- Updated default active checklist from v13 to v14
- Updated localStorage persistence to clear v11/v13 selections

### QA Registry
- Added v14 checklist with 16 checks covering:
  - v14 is default active checklist
  - Advisory tab exists
  - Bandit Top 10 Backlog visible
  - Backlog items show rank numbers
  - Initial backlog order matches requested order
  - User can move item up/down
  - Rank numbers update after reorder
  - Reorder persists through tab switching
  - Reordered backlog appears in submitted QA report
  - Reordered backlog appears in Copy Last Submission
  - Reorder does not accept/reject proposals
  - Reorder does not trigger implementation
  - No reorder controls are dead
  - Typecheck passes
  - Playwright passes

### Playwright Tests
- Added test: v14 is default active checklist
- Added test: advisory backlog reorder moves item up
- Added test: advisory backlog reorder moves item down
- Added test: advisory backlog reorder persists through tab switching

## Validation

### Typecheck
PASSED - No TypeScript errors

### Playwright E2E
PENDING - To be run

## Known Limitations
- Reorder is v0 and uses Move Up/Down buttons rather than drag-and-drop
- Reorder only applies to Bandit Top 10 Backlog, not to other QA elements
- Reorder does not trigger implementation - backlog items remain proposals/candidates

## Decision
ACCEPT - Implementation complete, awaiting Playwright validation

## Next Step
Run Playwright E2E validation and generate final report
