# Session Log: Edge Selection Node Label Depth Parity v0

## Goal
When Node Label Mode is selected-neighborhood and an EDGE is selected:
- Depth 1: label selected edge source and target nodes.
- Depth 2: also label secondaryNodeIds.
- Depth 3: also label tertiaryNodeIds.

## Context
Baseline B Consolidation Follow-up v4 is ACCEPTED. Edge hover works, but edge selection node labels were missing for deeper node layers (secondary/tertiary nodes).

## Root Cause Analysis

### Edge Selection Node Label Policy
**File:** src/graph/visual/graphLabelPolicy.ts
**Lines 126-138:** Edge selection only showed source and target node labels, then returned early. The function did not consider `neighborhoodDepth` for edge selection, unlike node selection which has full depth behavior (lines 142-189).

### Why Depth Highlighting Worked But Labels Didn't
The styling policy (graphStylePolicy.ts) uses `getRelationshipNeighborhood` for depth highlighting, which correctly exposes secondaryNodeIds and tertiaryNodeIds. The label policy (graphLabelPolicy.ts) did not use this function for edge selection, so secondary/tertiary node labels were never shown.

### Node Selection Had Depth Behavior
Node selection already had full depth behavior:
- Depth 1: selected node label
- Depth 2: direct neighbor labels
- Depth 3: secondary neighbor labels

This pattern needed to be mirrored for edge selection.

## Files Changed

### src/graph/visual/graphLabelPolicy.ts
**Line 21:** Added import for `getRelationshipNeighborhood`
```typescript
import { getRelationshipNeighborhood } from "../renderers/sigma2d/selectionNeighborhood";
```

**Lines 124-166:** Replaced edge selection node label logic to use `getRelationshipNeighborhood` and respect `neighborhoodDepth`:
```typescript
if (mode === "selected-neighborhood") {
  const importantNodeIds = getImportantNodeIds(graph);

  // If edge selected, show source and target labels
  if (selectedEdgeId) {
    const neighborhood = getRelationshipNeighborhood(graph, selectedEdgeId);

    // Depth 1: label source and target nodes
    if (neighborhood.sourceId && graph.hasNode(neighborhood.sourceId)) {
      const attrs = graph.getNodeAttributes(neighborhood.sourceId);
      const label = getStoredLabel(attrs);
      labelMap.set(neighborhood.sourceId, label);
    }
    if (neighborhood.targetId && graph.hasNode(neighborhood.targetId)) {
      const attrs = graph.getNodeAttributes(neighborhood.targetId);
      const label = getStoredLabel(attrs);
      labelMap.set(neighborhood.targetId, label);
    }

    // Depth 2: also label secondary node IDs
    if (neighborhoodDepth >= 2) {
      neighborhood.secondaryNodeIds.forEach((nodeId) => {
        if (graph.hasNode(nodeId)) {
          const attrs = graph.getNodeAttributes(nodeId);
          const label = getStoredLabel(attrs);
          labelMap.set(nodeId, label);
        }
      });
    }

    // Depth 3: also label tertiary node IDs
    if (neighborhoodDepth >= 3) {
      neighborhood.tertiaryNodeIds.forEach((nodeId) => {
        if (graph.hasNode(nodeId)) {
          const attrs = graph.getNodeAttributes(nodeId);
          const label = getStoredLabel(attrs);
          labelMap.set(nodeId, label);
        }
      });
    }

    return labelMap;
  }
```

### src/control-plane/qa/qa-registry.ts
**Lines 4-170:** Added v5 checklist with 10 focused checks for edge selection node label depth parity
**Lines 172-345:** Archived v4 checks (active: false, archived: true)
**Lines 1116-1145:** Removed duplicate `qaRegistry` export that was causing TypeScript errors

### src/control-plane/qa/QaPanel.tsx
**Line 8:** Updated default qaVersion from 4 to 5

## Edge-Selection Node Label Depth Behavior Implemented
- **Depth 1:** Labels source and target nodes of selected edge
- **Depth 2:** Also labels secondaryNodeIds (nodes connected to source/target)
- **Depth 3:** Also labels tertiaryNodeIds (nodes connected to secondary nodes)
- Uses `getRelationshipNeighborhood` for consistency with depth highlighting
- Uses `getStoredLabel` to restore labels from fullLabel/originalLabel (not mutable label after reset)
- Does not force all node labels visible
- Does not break Node Label Mode all/off
- Does not break Show Labels On Hover
- Does not break selected node label behavior
- Does not break selected edge label behavior

## QA Checklist v5 Activation
- **Active featureId:** baseline-b-consolidation-followup-v0
- **Active qaVersion:** 5
- **Feature name:** Baseline B Consolidation Follow-up v5
- **v4 checks:** Archived (active: false, archived: true)
- **v5 checks (10):**
  1. edge-depth-1-node-labels
  2. edge-depth-2-secondary-node-labels
  3. edge-depth-3-tertiary-node-labels
  4. edge-label-mode-regression
  5. node-label-mode-regression
  6. node-selection-label-regression
  7. hover-regression
  8. selection-regression
  9. background-clear-regression
  10. depth-highlight-regression
- **Old checklists preserved:** v3, v2, v1, Label Controls Repair v0

## Validation Results

### Typecheck
✅ PASSED (npm run typecheck)

### qa:e2e
✅ PASSED (8/8 tests)
- app-smoke.spec.ts: PASSED
- edge-label-truncation.spec.ts: PASSED
- settings-label-controls.spec.ts: PASSED
- qa-panel.spec.ts: PASSED
- qa-navigation.spec.ts: PASSED
- qa-refresh.spec.ts: PASSED
- qa-submit.spec.ts: PASSED
- viewport-stability.spec.ts: PASSED

## Manual QA Instructions
To run the v5 in-app checklist for edge selection node label depth parity:

1. Open the LumaWeave app
2. Navigate to the QA Panel in the right dock
3. Confirm the active checklist is "Baseline B Consolidation Follow-up v5"
4. Run through the 10 checks:
   - edge-depth-1-node-labels: Set Node Label Mode to selected-neighborhood, Depth 1, select edge, confirm source/target labels visible
   - edge-depth-2-secondary-node-labels: Set Depth 2, select edge, confirm secondary node labels visible
   - edge-depth-3-tertiary-node-labels: Set Depth 3, select edge, confirm tertiary node labels visible
   - edge-label-mode-regression: Test off/all-short/selected-neighborhood
   - node-label-mode-regression: Test off/all/selected-neighborhood
   - node-selection-label-regression: Select node, test Depth 1/2/3
   - hover-regression: Test node and edge hover
   - selection-regression: Test node and edge selection persistence
   - background-clear-regression: Test background click clears selection
   - depth-highlight-regression: Test node and edge depth highlighting
5. Submit the report when all checks pass

## Known Limitations
- Edge hover label behavior remains deferred (as per original task scope)
- No UI control for edge hover color (uses hardcoded token value)
- No Playwright test for edge selection node label depth (could be added in future)

## Acceptance Recommendation
ACCEPT - Edge selection node label depth parity is complete. The implementation uses the shared `getRelationshipNeighborhood` function for consistency with depth highlighting, respects neighborhoodDepth for edge selection, and all regression tests pass. The QA panel defaults to v5 and all Playwright tests pass.
