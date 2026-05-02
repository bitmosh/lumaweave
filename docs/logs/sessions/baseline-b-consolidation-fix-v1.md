# Session Log: Baseline B Consolidation Fix v1

## Goal
Fix two failures from Baseline B Consolidation Follow-up v0 manual QA:
1. Inspector auto-open on node/edge selection
2. Node selection Neighborhood Depth 3 parity with edge selection depth

Context:
- Baseline B Consolidation Follow-up v0 manual QA result: DO NOT ACCEPT (8 pass, 2 fail)
- Failed checks: inspector-opens-on-node-selection, inspector-opens-on-edge-selection
- Additional note: Node selection Depth 3 behaves like Depth 2 (missing secondary edges and ternary nodes)

## Files Changed

### Part A - Inspector Auto-Open Fix
- src/control-plane/panels/CollapsiblePanel.tsx
  - Added controlled mode support with `expanded` and `onExpandedChange` props
  - Preserves uncontrolled mode for existing uses (Renderer Debug)
  - Uses controlled state if `expanded` prop is provided, otherwise uses internal state

- src/app/AppShell.tsx
  - Added `inspectorExpanded` state to control Inspector panel collapse
  - Removed `hasSelectedFirstElement` state (no longer needed with controlled mode)
  - Updated `onSelectNode` to set `inspectorExpanded` to true
  - Updated `onSelectEdge` to set `inspectorExpanded` to true
  - Updated Inspector CollapsiblePanel to use controlled mode (`expanded={inspectorExpanded}`, `onExpandedChange={setInspectorExpanded}`)
  - Renderer Debug remains uncontrolled with `defaultExpanded={false}`

### Part B - Node Selection Depth 3 Fix
- src/graph/renderers/sigma2d/selectionNeighborhood.ts
  - Updated `getNodeNeighborhood` to return depth 3 expansion data
  - Added `secondaryEdgeIds` and `tertiaryNodeIds` to return type
  - Implemented depth 3 logic mirroring `getRelationshipNeighborhood` structure
  - Secondary edges: edges connected to direct neighbors, excluding direct edges
  - Tertiary nodes: nodes connected through secondary edges, excluding selected and direct neighbors
  - Added comments to make node/edge depth mirroring obvious

- src/graph/visual/graphStylePolicy.ts
  - Updated `applySelectedNodeStyles` to use new depth 3 structure
  - Depth 3 now highlights secondary edges and tertiary nodes
  - Mirrors `applySelectedEdgeStyles` structure for consistency
  - Added comments explaining mirrored structure

### Part C - Progressive Depth Slider Bookmark
- docs/33_GRAPH_VISUAL_POLICY_V0.md
  - Added "Planned: Progressive Neighborhood Depth Slider / Gradient Traversal" section
  - Marked as later phase requiring stable integer depth first
  - Documented requirements and implementation notes

### Part D - QA Checklist v2 Activation
- src/control-plane/qa/qa-registry.ts
  - Added 10 new checks for baseline-b-consolidation-followup-v0 v2 (active: true)
  - Archived 10 checks for baseline-b-consolidation-followup-v0 v1 (active: false, archived: true)
  - New v2 checks focus on actual failures and depth fix:
    - inspector-starts-collapsed
    - debug-starts-collapsed
    - inspector-opens-on-node-selection
    - inspector-opens-on-edge-selection
    - debug-manual-only
    - node-depth-1
    - node-depth-2
    - node-depth-3
    - edge-depth-regression
    - background-clear-regression

- src/control-plane/qa/QaPanel.tsx
  - Changed default `activeQaVersion` from 1 to 2

### Part E - Node Label Font Size Note
- docs/33_GRAPH_VISUAL_POLICY_V0.md
  - Updated "Node Label Font Size (token defined, UI not wired)" to include "PLAN NEXT"

## What Changed

### Part A - Inspector Auto-Open Behavior
1. Inspector panel starts collapsed on app launch (controlled state initialized to false)
2. Renderer Debug panel starts collapsed on app launch (uncontrolled with defaultExpanded={false})
3. Selecting a node opens Inspector (sets inspectorExpanded to true)
4. Selecting an edge opens Inspector (sets inspectorExpanded to true)
5. Renderer Debug does not auto-open on selection (no controlled state)
6. Renderer Debug remains manual-only (toggle only)
7. Inspector can still be manually collapsed (controlled state allows toggle)
8. Inspector content updates correctly for selected node/edge (unchanged)

### Part B - Node Selection Depth 3 Behavior
1. Node selection Depth 1: selected node only (unchanged)
2. Node selection Depth 2: selected node + primary edges + secondary nodes (unchanged)
3. Node selection Depth 3: adds secondary edges + tertiary nodes (NEW - mirrors edge selection)
4. Edge selection depth behavior preserved (no regression)
5. Node/edge depth structure now mirrors each other with consistent naming

## Validation Results

- Part A typecheck: PASSED
- Part A qa:e2e: PASSED (7 tests)
- Part B typecheck: PASSED
- Part B qa:e2e: PASSED (7 tests)
- Final typecheck: PASSED
- Final qa:e2e: PASSED (7 tests)

## What Accepted Behavior Was Preserved

From Label Controls Repair v0 (ACCEPTED):
- Node Label Mode dropdown visible
- Edge Label Mode dropdown visible
- Node Label Mode: off/all/selected-neighborhood works
- Hover labels show and are readable
- Hover leaves no stale style
- Edge Label Mode: off/all-short/selected-neighborhood works
- Node selection works
- Edge selection works
- Background clears selection
- Label settings do not break selection

## Known Limitations

1. Manual QA required to verify inspector auto-open behavior in browser
2. Manual QA required to verify node selection Depth 3 adds secondary edges and ternary nodes
3. Manual QA required to verify edge selection depth did not regress
4. No UI to view archived checklists or their historical submissions (future enhancement if needed)

## Issues Fixed Now
1. Inspector auto-open on node/edge selection (controlled mode implementation)
2. Node selection Depth 3 missing secondary edges and ternary nodes (mirrored structure implementation)

## Issues Planned Next
1. Manual QA pass using in-app Baseline B Consolidation Follow-up v2 checklist
2. Node Label Font Size UI (documented as PLAN NEXT)

## Issues Documented Only
1. Progressive Neighborhood Depth Slider / Gradient Traversal (bookmarked for later phase)

## Decision
ACCEPT WITH MANUAL QA REQUIRED

Rationale:
- All automated validation passed (typecheck, qa:e2e)
- Inspector auto-open fix is minimal and low-risk (controlled mode pattern)
- Node depth 3 fix mirrors existing edge selection structure
- No forbidden features implemented (Solar Plasma, 3D, force physics, theme editor, etc.)
- Old accepted Label Controls Repair v0 behavior preserved
- However, visual behavior changes require manual browser verification
- Depth 3 expansion requires manual verification of secondary edges and ternary nodes

## Next Step
Manual QA pass using the in-app Baseline B Consolidation Follow-up v2 checklist
