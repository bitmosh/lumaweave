# Active Handles v0

## Control Surface Contract Registry

A machine-readable control surface contract registry is available at:
- `src/control-plane/contracts/controlSurfaceContract.registry.ts`

This registry contains all active controls with their runtime bindings, QA references, and Playwright coverage. The contract registry does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The contract registry is a machine-readable documentation/scaffold layer for contract validation.

## Legacy Handleset Scaffold

A legacy machine-readable handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry is being phased out in favor of the control surface contract registry. It contains handleset-specific metadata but does not yet drive UI.

## Overview

Handles that visibly affect runtime behavior.

## Appearance

### appearance.theme
- **Handle Path:** appearance.theme
- **Label:** Theme
- **Category:** Appearance
- **Default Value:** "solar-plasma"
- **UI Control Type:** select
- **Source File:** src/control-plane/settings/settings.schema.ts
- **Runtime Target:** src/app/AppShell.tsx top bar theme selector
- **Live Update Behavior:** Yes - theme changes immediately on selection
- **Status:** active
- **Related Playwright Tests:** tests/e2e/theme-selector.spec.ts
- **Related QA Checklist:** theme-mission-control-integrity-v11
- **Notes:** Built-in theme preset selector in top bar (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin). Custom themes not yet supported.

### appearance.glitterEnabled
- **Handle Path:** appearance.glitterEnabled
- **Label:** Enable Glitter
- **Category:** Appearance
- **Default Value:** true
- **UI Control Type:** boolean
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 48-54)
- **Runtime Target:** Semantic visual effects (sparkle, flare, plasma)
- **Live Update Behavior:** Yes - glitter toggles immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/theme-selector.spec.ts
- **Related QA Checklist:** theme-mission-control-integrity-v11
- **Notes:** Also available in top bar for quick access. Controls semantic sparkle, flare, and plasma effects. Not yet fully wired to renderer.

### appearance.reduceMotion
- **Handle Path:** appearance.reduceMotion
- **Label:** Reduce Motion
- **Category:** Appearance
- **Default Value:** false
- **UI Control Type:** boolean
- **Source File:** src/app/AppShell.tsx (lines 107-115) - top bar only, NOT in settings panel
- **Runtime Target:** Animation smoothness
- **Live Update Behavior:** Yes - motion reduction applies immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/theme-selector.spec.ts
- **Related QA Checklist:** theme-mission-control-integrity-v11
- **Notes:** Commented out in settings.registry.ts (lines 55-62) because it's moved to top bar for quick access.

## Theme

### theme.presetDropdown
- **Handle Path:** theme.presetDropdown
- **Label:** Theme Preset Dropdown
- **Category:** Theme
- **Default Value:** "solar-plasma"
- **UI Control Type:** select
- **Source File:** src/app/AppShell.tsx
- **Runtime Target:** Top bar theme selector
- **Live Update Behavior:** Yes - theme changes immediately on selection
- **Status:** active
- **Related Playwright Tests:** tests/e2e/theme-selector.spec.ts
- **Related QA Checklist:** theme-mission-control-integrity-v11
- **Notes:** Duplicate of appearance.theme - same control. Built-in theme preset selector in top bar (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin). Custom themes not yet supported.

## Physics

### physics.nodeSize
- **Handle Path:** physics.nodeSize
- **Label:** Node Size
- **Category:** Physics
- **Default Value:** 1.0
- **UI Control Type:** range (min 0.25, max 4, step 0.05)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 63-71)
- **Runtime Target:** Sigma force layout node size multiplier
- **Live Update Behavior:** No - requires graph rebuild
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** Manual QA accepted (physics controls not yet wired to Sigma)
- **Notes:** Node size multiplier for force layout. Not live-update, requires graph rebuild. Physics controls not yet fully wired to Sigma layout.

### physics.linkDistance
- **Handle Path:** physics.linkDistance
- **Label:** Link Distance
- **Category:** Physics
- **Default Value:** 1.0
- **UI Control Type:** range (min 20, max 500, step 5)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 72-80)
- **Runtime Target:** Sigma force layout link distance
- **Live Update Behavior:** No - requires graph rebuild
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** Manual QA accepted (physics controls not yet wired to Sigma)
- **Notes:** Edge length multiplier for force layout. Not live-update, requires graph rebuild. Physics controls not yet fully wired to Sigma layout.

### physics.repelForce
- **Handle Path:** physics.repelForce
- **Label:** Repel Force
- **Category:** Physics
- **Default Value:** 1.0
- **UI Control Type:** range (min 0, max 500, step 5)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 81-89)
- **Runtime Target:** Sigma force layout repulsion
- **Live Update Behavior:** No - requires graph rebuild
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** Manual QA accepted (physics controls not yet wired to Sigma)
- **Notes:** Repulsion force for force layout. Not live-update, requires graph rebuild. Physics controls not yet fully wired to Sigma layout.

## Labels

### labels.nodeLabelMode
- **Handle Path:** labels.nodeLabelMode
- **Label:** Node Label Mode
- **Category:** Labels
- **Default Value:** "all"
- **UI Control Type:** select
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 130-141)
- **Runtime Target:** Node label visibility policy
- **Live Update Behavior:** Yes - labels update immediately on mode change
- **Status:** active
- **Related Playwright Tests:** tests/e2e/settings-label-controls.spec.ts (verifies control visible)
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Options: off, selected-neighborhood, important-only, all. Uses applyNodeLabelPolicy from graphLabelPolicy.ts. selected-neighborhood behaves like off when no node or edge is selected (idle state shows no labels), but shows labels based on selection and depth when a node or edge is selected. important-only shows labels for high-degree nodes (degree-based heuristic: degree >= 3 OR top 20 by degree).

### labels.edgeLabelMode
- **Handle Path:** labels.edgeLabelMode
- **Label:** Edge Label Mode
- **Category:** Labels
- **Default Value:** "all-short"
- **UI Control Type:** select
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 142-154)
- **Runtime Target:** Edge label visibility policy
- **Live Update Behavior:** Yes - labels update immediately on mode change
- **Status:** active
- **Related Playwright Tests:** tests/e2e/settings-label-controls.spec.ts (verifies control visible)
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Options: off, selected-neighborhood, important-only, all-short, all-medium. Uses applyEdgeLabelPolicy from graphLabelPolicy.ts. important-only shows labels for edges incident to important nodes (degree-based heuristic: degree >= 3 OR top 20 by degree). selected-neighborhood shows labels based on selection and depth.

### labels.maxEdgeLabelLength
- **Handle Path:** labels.maxEdgeLabelLength
- **Label:** Max Edge Label Length
- **Category:** Labels
- **Default Value:** 20
- **UI Control Type:** range (min 10, max 100, step 1)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 155-163)
- **Runtime Target:** Edge label truncation length
- **Live Update Behavior:** Yes - labels truncate immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/edge-label-truncation.spec.ts
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Used by label policy to truncate edge labels. all-medium mode uses maxEdgeLabelLength * 2. Playwright test added in Handleset Registry Audit fix round.

### labels.showLabelsOnHover
- **Handle Path:** labels.showLabelsOnHover
- **Label:** Show Labels On Hover
- **Category:** Labels
- **Default Value:** false
- **UI Control Type:** boolean
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 164-170)
- **Runtime Target:** Hover label visibility
- **Live Update Behavior:** Yes - hover behavior updates immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/settings-label-controls.spec.ts
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** When enabled, hovering a node shows its label even if node label mode is off.

### labels.edgeLabelFontSize
- **Handle Path:** labels.edgeLabelFontSize
- **Label:** Edge Label Font Size
- **Category:** Labels
- **Default Value:** 10
- **UI Control Type:** range (min 8, max 24, step 1)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 181-190)
- **Runtime Target:** Sigma edge label size
- **Live Update Behavior:** Yes - uses sigma.setSetting("edgeLabelSize", value) + sigma.refresh()
- **Status:** active
- **Related Playwright Tests:** tests/e2e/settings-label-controls.spec.ts (verifies control visible)
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Live update effect in SigmaGraphView.tsx (lines 332-341). Sigma setting: edgeLabelSize.

### labels.nodeLabelFontSize
- **Handle Path:** labels.nodeLabelFontSize
- **Label:** Node Label Font Size
- **Category:** Labels
- **Default Value:** 12
- **UI Control Type:** range (min 8, max 28, step 1)
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 191-200)
- **Runtime Target:** Sigma node label size
- **Live Update Behavior:** Yes - uses sigma.setSetting("labelSize", value) + sigma.refresh()
- **Status:** active
- **Related Playwright Tests:** tests/e2e/settings-label-controls.spec.ts (verifies control visible)
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Live update effect in SigmaGraphView.tsx (lines 343-352). Sigma setting: labelSize. Added in Node Label Font Size v0.

## Graph View

### graphView.nodeSelectionStage
- **Handle Path:** graphView.nodeSelectionStage
- **Label:** Neighborhood Depth
- **Category:** Graph View
- **Default Value:** 1
- **UI Control Type:** select
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 208-219)
- **Runtime Target:** Neighborhood depth for selection (1, 2, 3)
- **Live Update Behavior:** Yes - depth changes immediately affect highlights
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Controls how much neighborhood context appears when selecting a node or edge. Depth 1 = selected only, Depth 2 = direct neighbors, Depth 3 = secondary neighbors.

### graphView.hoverNodeColor
- **Handle Path:** graphView.hoverNodeColor
- **Label:** Hover Node Color
- **Category:** Graph View
- **Default Value:** "#c4b5fd"
- **UI Control Type:** text
- **Source File:** src/control-plane/settings/settings.registry.ts (lines 220-226)
- **Runtime Target:** Node hover highlight color
- **Live Update Behavior:** Yes - hover color updates immediately
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** baseline-b-consolidation-followup-v4 (manual QA accepted)
- **Notes:** Passed to SigmaGraphView as prop. Used by graphStylePolicy.ts applyHoverStyles function. QA checklist added in Handleset Registry Audit fix round.

### hoveredEdgeId (internal state)
- **Handle Path:** hoveredEdgeId (internal visual state)
- **Label:** Hovered Edge ID
- **Category:** Graph View
- **Default Value:** null
- **UI Control Type:** None (internal state)
- **Source File:** src/graph/renderers/sigma2d/SigmaGraphView.tsx (line 120)
- **Runtime Target:** Edge hover highlight styling and label visibility
- **Live Update Behavior:** Yes - edge highlights and labels on hover, clears on leave
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Internal state tracked in SigmaGraphView. Sigma enterEdge/leaveEdge events set/clear this state. graphStylePolicy.ts applyHoverStyles uses edgeColorTokens.hovered (#d8b4fe) and edgeSizeTokens.hovered (4). Edge hover label parity implemented in v7: when Show Labels On Hover is enabled and an edge is hovered, the edge label appears temporarily.

### hoveredNodeId (internal state)
- **Handle Path:** hoveredNodeId (internal visual state)
- **Label:** Hovered Node ID
- **Category:** Graph View
- **Default Value:** null
- **UI Control Type:** None (internal state)
- **Source File:** src/graph/renderers/sigma2d/SigmaGraphView.tsx (line 119)
- **Runtime Target:** Node hover highlight and label styling
- **Live Update Behavior:** Yes - node highlights and labels on hover, clears on leave
- **Status:** active
- **Related Playwright Tests:** None
- **Related QA Checklist:** baseline-b-consolidation-followup-v7
- **Notes:** Internal state tracked in SigmaGraphView. Sigma enterNode/leaveNode events set/clear this state. Used by graphLabelPolicy.ts for hover labels (if Show Labels On Hover enabled) and graphStylePolicy.ts for hover highlight color.

## Mission Control

### qa.advisoryTab
- **Handle Path:** qa.advisoryTab
- **Label:** Advisory Tab
- **Category:** Mission Control
- **Default Value:** N/A (tab view)
- **UI Control Type:** tab button
- **Source File:** src/control-plane/qa/QaPanel.tsx (lines 434-444)
- **Runtime Target:** Mission Control QA panel
- **Live Update Behavior:** Yes - tab switches immediately on click
- **Status:** active
- **Related Playwright Tests:** tests/e2e/contract-registry.spec.ts (advisory tab tests)
- **Related QA Checklist:** mission-control-advisory-channel-v13
- **Notes:** Displays Bandit Questions, Bandit Proposals, and Bandit Top 10 Backlog. Advisory content is loaded from src/control-plane/qa/advisory-registry.ts. Proposals are advisory only and do not trigger implementation.

### qa.banditQuestionStatus
- **Handle Path:** qa.banditQuestionStatus
- **Label:** Question Status Selector
- **Category:** Mission Control
- **Default Value:** "unanswered"
- **UI Control Type:** select
- **Source File:** src/control-plane/qa/QaPanel.tsx (lines 869-883)
- **Runtime Target:** Advisory tab Bandit Questions
- **Live Update Behavior:** Yes - status updates immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/contract-registry.spec.ts (question status test)
- **Related QA Checklist:** mission-control-advisory-channel-v13
- **Notes:** Options: unanswered, answered, deferred, dismissed. Status is included in QA submission output.

### qa.banditProposalDecision
- **Handle Path:** qa.banditProposalDecision
- **Label:** Proposal Decision Selector
- **Category:** Mission Control
- **Default Value:** "unreviewed"
- **UI Control Type:** select
- **Source File:** src/control-plane/qa/QaPanel.tsx (lines 921-936)
- **Runtime Target:** Advisory tab Bandit Proposals
- **Live Update Behavior:** Yes - decision updates immediately
- **Status:** active
- **Related Playwright Tests:** tests/e2e/contract-registry.spec.ts (proposal decision test)
- **Related QA Checklist:** mission-control-advisory-channel-v13
- **Notes:** Options: unreviewed, accept-for-future, defer, reject, needs-more-detail. Decision is included in QA submission output.

### qa.banditProposalNotes
- **Handle Path:** qa.banditProposalNotes
- **Label:** Proposal Notes Field
- **Category:** Mission Control
- **Default Value:** ""
- **UI Control Type:** textarea
- **Source File:** src/control-plane/qa/QaPanel.tsx (lines 938-949)
- **Runtime Target:** Advisory tab Bandit Proposals
- **Live Update Behavior:** Yes - notes save immediately on change
- **Status:** active
- **Related Playwright Tests:** tests/e2e/contract-registry.spec.ts (proposal notes test)
- **Related QA Checklist:** mission-control-advisory-channel-v13
- **Notes:** Free-form notes field for proposal feedback. Notes are included in QA submission output.
