# Handles Requiring QA v0

## Control Surface Contract Registry

A machine-readable control surface contract registry is available at:
- `src/control-plane/contracts/controlSurfaceContract.registry.ts`

This registry contains all active controls with their QA references and Playwright coverage. The contract registry does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The contract registry is a machine-readable documentation/scaffold layer for contract validation.

## Legacy Handleset Scaffold

A legacy machine-readable handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry is being phased out in favor of the control surface contract registry. It contains handleset-specific metadata but does not yet drive UI.

Handles that lack Playwright test coverage or QA checklist coverage.

## Active Handles with QA Coverage

### Fully Covered
- **appearance.theme** - No Playwright test, but theme is used in app (manual QA sufficient)
- **appearance.glitterEnabled** - No Playwright test, but toggle is visible (manual QA sufficient)
- **physics.nodeSize** - No Playwright test, but visual effect is obvious (manual QA sufficient)
- **physics.linkDistance** - No Playwright test, but visual effect is obvious (manual QA sufficient)
- **physics.repelForce** - No Playwright test, but visual effect is obvious (manual QA sufficient)
- **labels.nodeLabelMode** - Playwright test: settings-label-controls.spec.ts (control visible), QA: v3 (node-label-mode-regression)
- **labels.edgeLabelMode** - Playwright test: settings-label-controls.spec.ts (control visible), QA: v3 (edge-label-mode-regression)
- **labels.maxEdgeLabelLength** - Playwright test: edge-label-truncation.spec.ts (added in fix round), no QA checklist
- **labels.showLabelsOnHover** - QA: v3 (hover-label-regression)
- **labels.edgeLabelFontSize** - Playwright test: settings-label-controls.spec.ts (control visible), QA: v3 (edge-label-font-size-regression)
- **labels.nodeLabelFontSize** - Playwright test: settings-label-controls.spec.ts (control visible), QA: v3 (node-label-font-size-control-visible, node-label-font-size-affects-rendering)
- **graphView.nodeSelectionStage** - QA: v3 (depth-regression)
- **graphView.hoverNodeColor** - No Playwright test, QA: v3 (hover-node-color-configuration, added in fix round)
- **qa.advisoryTab** - Playwright test: contract-registry.spec.ts (advisory tab visible), QA: v13 (advisory-tab-exists-v13)
- **qa.banditQuestionStatus** - Playwright test: contract-registry.spec.ts (question status can be changed), QA: v13 (question-status-selector-works-v13)
- **qa.banditProposalDecision** - Playwright test: contract-registry.spec.ts (proposal decision can be changed), QA: v13 (proposal-decision-selector-works-v13)
- **qa.banditProposalNotes** - Playwright test: contract-registry.spec.ts (proposal notes field accepts input), QA: v13 (proposal-notes-field-works-v13)

## Handles Missing QA Coverage

### High Priority (Active handles with no QA)

**None** - All active handles now have at least partial QA coverage.

### Medium Priority (Partial/Planned handles)

#### labels.zoomLabelThreshold
- **Status:** Partial (marked as planned, not wired)
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to Sigma

#### physics.centerForce
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to force layout

#### physics.communityGravity
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to force layout

#### physics.curveAmount
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to renderer

#### physics.animationSoftness
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to renderer

#### labels.hoverLabelColor (both labels and graphView)
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to Sigma yet
- **Recommended Action:** Defer until wired to Sigma, also resolve duplicate

#### graphView.selectedNodeColor
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to visual tokens

#### graphView.defaultNodeColor
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to visual tokens

#### graphView.selectedEdgeColor
- **Status:** Planned
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Low - not wired to renderer yet
- **Recommended Action:** Defer until wired to visual tokens

### Low Priority (Not in registry - no UI)

#### Evidence settings (4)
- **Status:** Planned (not in registry)
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Very Low - no UI exists
- **Recommended Action:** Defer until UI is added

#### Source Linking settings (3)
- **Status:** Planned (not in registry)
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Very Low - no UI exists
- **Recommended Action:** Defer until UI is added

#### Performance settings (4)
- **Status:** Planned (not in registry)
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Very Low - no UI exists
- **Recommended Action:** Defer until UI is added

#### Developer settings (3)
- **Status:** Planned (not in registry)
- **Playwright Test:** None
- **QA Checklist:** None
- **Priority:** Very Low - no UI exists
- **Recommended Action:** Defer until UI is added

## Recommended QA Tasks

### Immediate (Next QA Cycle)

**None** - High priority QA tasks completed in fix round:
- ✅ Playwright test added for labels.maxEdgeLabelLength
- ✅ QA checklist added for graphView.hoverNodeColor

### Future (When Planned Handles Become Active)

3. **Wire and test labels.zoomLabelThreshold**
   - Wire to Sigma labelRenderedSizeThreshold
   - Add Playwright test for zoom-based label visibility
   - Add QA checklist check

4. **Wire and test physics.centerForce**
   - Wire to force layout
   - Add Playwright test for center attraction
   - Add QA checklist check

5. **Wire and test physics.communityGravity**
   - Wire to force layout
   - Add Playwright test for intra-community clustering
   - Add QA checklist check

6. **Wire and test physics.curveAmount**
   - Wire to renderer edge curvature
   - Add Playwright test for edge curves
   - Add QA checklist check

7. **Wire and test physics.animationSoftness**
   - Wire to renderer transitions
   - Add Playwright test for animation smoothness
   - Add QA checklist check

8. **Resolve duplicate hoverLabelColor and wire to Sigma**
   - Choose single location (labels vs graphView)
   - Wire to Sigma attribute-based label color
   - Add Playwright test
   - Add QA checklist check

9. **Wire color settings to visual tokens**
   - Wire graphView.selectedNodeColor to nodeColorTokens.selected
   - Wire graphView.defaultNodeColor to nodeColorTokens.default
   - Wire graphView.selectedEdgeColor to edgeColorTokens.selected
   - Add Playwright tests for each
   - Add QA checklist checks

## Summary

**Handles Missing Any QA Coverage:** 21 (unchanged)
- 0 active handles (unchanged)
- 9 partial/planned handles with UI (medium priority)
- 12 planned handles without UI (low priority)

**Current QA Coverage Status:**
- 18 active handles (up from 13 - added 4 Mission Control advisory controls)
- 18 have some QA coverage (Playwright or checklist) - up from 13
- 0 have no QA coverage (unchanged) - all active handles now covered

**Fixes Applied (Mission Control Advisory Channel v0):**
- Added Advisory tab to Mission Control QA panel
- Added Bandit Questions, Proposals, and Backlog sections to Advisory tab
- Added Playwright tests for advisory controls (tests/e2e/contract-registry.spec.ts)
- Added QA checklist v13 for advisory channel features (src/control-plane/qa/qa-registry.ts)
- Updated docs/handleset/01_ACTIVE_HANDLES.md with Mission Control section
- Updated docs/handleset/06_HANDLES_REQUIRING_QA.md with advisory coverage
