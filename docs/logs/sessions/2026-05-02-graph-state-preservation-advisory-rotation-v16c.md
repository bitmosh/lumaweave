# Session Log: Graph State Preservation + Advisory Rotation v16c

## Goal
Fix graph visual state reset during settings changes and implement per-checklist advisory questions.

## Files Changed

### src/graph/renderers/sigma2d/SigmaGraphView.tsx
- Added selection styling policy application before Sigma initialization (lines 241-256)
- This preserves selected node/edge visual state during Sigma recreation on slider changes
- Root cause was selection styling applied in separate useEffect after Sigma render, causing timing gap

### src/control-plane/qa/advisory-registry.ts
- Added advisoryV16c with v16c-specific Bandit Questions (lines 275-343)
- Added getAdvisoryForChecklist() function for per-checklist advisory lookup (lines 345-359)
- v16c questions focus on graph state preservation and advisory rotation

### src/control-plane/qa/QaPanel.tsx
- Updated to use getAdvisoryForChecklist() instead of hardcoded defaultAdvisoryV13 (line 6, line 67)
- Added comprehensive comments documenting advisory reset vs preserve behavior (lines 335-348)

### src/control-plane/qa/qa-registry.ts
- Added v16c QA checklist with 18 checks (lines 4544-4581)
- Checks cover graph state preservation, advisory rotation, and existing v15 behavior stability

### tests/e2e/graph-visual-state-stability.spec.ts
- Added test: node label mode persists after slider change (lines 110-127)
- Added test: no console errors during slider changes (lines 129-155)

### tests/e2e/contract-registry.spec.ts
- Added test: v16c advisory questions are specific to current pass (lines 548-568)
- Added test: v16c is default active checklist (lines 570-580)

## What Changed

### Graph State Preservation
- **Root Cause:** Sigma instance recreation on slider changes (nodeSize, linkDistance, repelForce) caused visual state reset. Selection styling was applied in a separate useEffect after Sigma render, creating a timing gap where graph rendered without selection styling.
- **Fix:** Apply selection styling policy (applyGraphStylePolicy) immediately after graph build but before Sigma initialization, similar to theme colors and label policy. This eliminates the timing gap and preserves visual state during Sigma recreation.
- **Result:** Selected node/edge styling now persists during slider changes. Camera already preserved via hasInitialCameraResetRef.

### Advisory Question Rotation
- **Root Cause:** Bandit Questions were static v13 questions hardcoded in QaPanel, becoming stale across passes.
- **Fix:** Created per-checklist advisory registry. Added getAdvisoryForChecklist() function that returns appropriate advisory based on featureId and qaVersion. v16c has its own advisory questions relevant to graph state preservation and advisory rotation.
- **Result:** Each QA checklist can now define its own advisory questions. v16c questions are specific to current pass. Old v13 questions remain historical and do not auto-appear in new checklists.

### Advisory Reset Behavior
- **Confirmed:** Current behavior is correct and documented with comments.
- **Reset after submit:** checklist statuses, checklist notes, Bandit Question answers (userResponse), question status (status), proposal notes (userNotes)
- **Preserve after submit:** backlog order, proposal decisions (userDecision), proposal statuses

## Validation
- Typecheck: PASSED
- Playwright: PASSED (60 tests including new v16c tests)
- Git status: Shows modified files

## Issues
None encountered.

## Decision
- Graph state preservation implemented via early policy application before Sigma init
- Advisory rotation implemented via per-checklist registry lookup
- Both changes are minimal and targeted, following existing patterns

## Next Step
Manual verification of graph state preservation during slider changes and advisory question rotation.
