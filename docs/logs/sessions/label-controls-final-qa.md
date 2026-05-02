# Session Log: Label Controls Final Manual QA

## Goal
Run final manual QA against the "Label Controls Repair v0" checklist to verify label controls are working correctly for Baseline B acceptance.

## Context
This is task A3 in the Phase A — Stabilize Baseline B work order.

## QA Checklist: Label Controls Repair v0

### 1. App reachable
**Status:** Requires manual verification
**Expected:** LumaWeave loads at http://localhost:1420 and graph source panel renders.
**Steps:**
- Open http://localhost:1420
- Confirm app shell appears
- Confirm graph source sidebar appears

### 2. Node Label Mode dropdown visible
**Status:** Code verified as present
**Expected:** Node Label Mode dropdown is visible under Labels.
**Verification:**
- settings.registry.ts contains Node Label Mode control with category "Labels"
- Options: off, selected-neighborhood, important-only, all
- Path: labels.nodeLabelMode
**Manual QA needed:** Confirm dropdown appears in SettingsPanel under Labels section.

### 3. Edge Label Mode dropdown visible
**Status:** Code verified as present
**Expected:** Edge Label Mode dropdown is visible under Labels.
**Verification:**
- settings.registry.ts contains Edge Label Mode control with category "Labels"
- Options: off, selected-neighborhood, important-only, all-short, all-medium
- Path: labels.edgeLabelMode
**Manual QA needed:** Confirm dropdown appears in SettingsPanel under Labels section.

### 4. Node Label Mode: off
**Status:** Code verified as implemented
**Expected:** Setting Node Label Mode to off hides normal node labels except hover labels when hover is enabled.
**Verification:**
- labelPolicy.ts applyNodeLabelPolicy has "off" mode
- When mode === "off", function returns early after resetting all labels
- Hover labels still show if showLabelsOnHover is true (lines 93-97)
**Manual QA needed:**
- Set Node Label Mode to off
- Observe graph labels (should be hidden except hover)
- Enable Show Labels On Hover
- Hover a node
- Confirm label appears on hover

### 5. Node Label Mode: all
**Status:** Code verified as implemented
**Expected:** Setting Node Label Mode to all displays node labels.
**Verification:**
- labelPolicy.ts applyNodeLabelPolicy has "all" mode
- When mode === "all", sets all node labels to getStoredLabel (lines 103-109)
**Manual QA needed:**
- Set Node Label Mode to all
- Observe graph labels (should all be visible)

### 6. Node Label Mode: selected-neighborhood
**Status:** Code verified as implemented
**Expected:** selected-neighborhood displays selected node/neighborhood labels according to selection stage.
**Verification:**
- labelPolicy.ts applyNodeLabelPolicy has "selected-neighborhood" mode (lines 124-172)
- If edge selected: shows source and target labels
- If node selected: shows selected node label
- If node selected and stage >= 3: shows direct neighbor labels
- If no selection: shows important/core labels only
**Manual QA needed:**
- Set Node Label Mode to selected-neighborhood
- Select a node
- Change Neighborhood Depth to 3
- Observe selected/neighborhood labels

### 7. Hover label shows
**Status:** Code verified as implemented
**Expected:** Hovering an unselected node shows a readable node label when Show Labels On Hover is enabled.
**Verification:**
- labelPolicy.ts applyNodeLabelPolicy checks showLabelsOnHover and hoveredNodeId (lines 93-97)
- Sets hovered node label to getStoredLabel
**Manual QA needed:**
- Enable Show Labels On Hover
- Set Node Label Mode to off
- Hover an unselected node
- Confirm label appears and is readable

### 8. Hover no stale style
**Status:** Code verified as implemented
**Expected:** Hovering and leaving nodes does not leave stale white/highlighted nodes.
**Verification:**
- SigmaGraphView.tsx has hover styling effect (lines 431-452)
- Effect resets all nodes to default colors first (lines 438-444)
- Then applies hover styling only to hoveredNodeId (lines 447-449)
- Runs on hoveredNodeId and selectedNodeId changes
**Manual QA needed:**
- Hover several nodes
- Move cursor away
- Confirm colors reset cleanly

### 9. Edge Label Mode: off
**Status:** Code verified as implemented
**Expected:** Setting Edge Label Mode to off hides edge labels.
**Verification:**
- labelPolicy.ts applyEdgeLabelPolicy has "off" mode (lines 192-194)
- When mode === "off", function returns early after resetting all labels
**Manual QA needed:**
- Set Edge Label Mode to off
- Observe graph (edge labels should be hidden)

### 10. Edge Label Mode: all-short
**Status:** Code verified as implemented
**Expected:** Setting Edge Label Mode to all-short displays short relationship labels on edges.
**Verification:**
- labelPolicy.ts applyEdgeLabelPolicy has "all-short" mode (lines 196-203)
- Truncates all edge labels to maxEdgeLabelLength
**Manual QA needed:**
- Set Edge Label Mode to all-short
- Observe relationship labels

### 11. Edge Label Mode: selected-neighborhood
**Status:** Code verified as implemented
**Expected:** selected-neighborhood displays labels for selected/connected relationships.
**Verification:**
- labelPolicy.ts applyEdgeLabelPolicy has "selected-neighborhood" mode (lines 222-242)
- If edge selected: shows selected edge label truncated
- If node selected and stage >= 2: shows direct connected edge labels truncated
**Manual QA needed:**
- Set Edge Label Mode to selected-neighborhood
- Select an edge
- Select a node
- Observe selected/connected relationship labels

### 12. Selection: node
**Status:** Code verified as implemented
**Expected:** Clicking a node selects it and inspector updates.
**Verification:**
- AppShell.tsx passes onSelectNode handler to SigmaGraphView
- onSelectNode sets selectedNodeId and clears selectedEdgeId
- InspectorPanel receives selectedNode prop
**Manual QA needed:**
- Click a node
- Confirm highlight and inspector node mode

### 13. Selection: edge
**Status:** Code verified as implemented
**Expected:** Clicking an edge selects it and inspector updates.
**Verification:**
- AppShell.tsx passes onSelectEdge handler to SigmaGraphView
- onSelectEdge sets selectedEdgeId and clears selectedNodeId
- InspectorPanel receives selectedEdge prop
**Manual QA needed:**
- Click an edge
- Confirm highlight and inspector relationship mode

### 14. Background clears selection
**Status:** Code verified as implemented
**Expected:** Clicking graph background clears selected node/edge and highlights.
**Verification:**
- AppShell.tsx passes onClearSelection handler to SigmaGraphView
- onClearSelection sets both selectedNodeId and selectedEdgeId to null
**Manual QA needed:**
- Select a node or edge
- Click background
- Confirm selection clears

### 15. Label settings do not break selection
**Status:** Code verified as implemented
**Expected:** Changing label settings does not break selection colors or selection reset.
**Verification:**
- SigmaGraphView.tsx has separate effects for:
  - Selection styling (lines 364-402)
  - Label policy (lines 405-428)
  - Hover styling (lines 431-452)
- Selection styling resets graph and applies selection colors
- Label policy only affects label visibility, not colors
**Manual QA needed:**
- Select a node
- Change Node Label Mode
- Select an edge
- Change Edge Label Mode
- Click background
- Confirm styling remains clean

## Settings Registry Review

### Active Label Controls
- Node Label Mode (select) - ACTIVE
- Edge Label Mode (select) - ACTIVE
- Max Edge Label Length (range) - ACTIVE
- Show Labels On Hover (boolean) - ACTIVE
- Neighborhood Depth (select) - ACTIVE
- Hover Node Color (text) - ACTIVE

### Planned Controls (Clearly Marked)
- Zoom Label Threshold (Planned) - label includes "(Planned)"
- Hover Label Color (Planned) - label includes "(Planned)"

### Empty Categories
- Accessibility category is now empty (Reduce Motion moved to top bar)
- This is acceptable for v0

## Known Issues

None identified from code review. All label controls appear to be implemented correctly.

## Manual QA Instructions

Run the app at http://localhost:1420 and perform the following:

1. **App reachable**
   - Open http://localhost:1420
   - Confirm app shell appears
   - Confirm graph source sidebar appears

2. **Dropdowns visible**
   - Open Control Plane settings
   - Find Labels section
   - Confirm Node Label Mode dropdown appears
   - Confirm Edge Label Mode dropdown appears

3. **Node Label Mode: off**
   - Set Node Label Mode to off
   - Observe graph labels (should be hidden)
   - Enable Show Labels On Hover
   - Hover a node
   - Confirm label appears on hover

4. **Node Label Mode: all**
   - Set Node Label Mode to all
   - Observe graph labels (should all be visible)

5. **Node Label Mode: selected-neighborhood**
   - Set Node Label Mode to selected-neighborhood
   - Select a node
   - Change Neighborhood Depth to 3
   - Observe selected/neighborhood labels

6. **Hover label shows**
   - Enable Show Labels On Hover
   - Set Node Label Mode to off
   - Hover an unselected node
   - Confirm label appears and is readable

7. **Hover no stale style**
   - Hover several nodes
   - Move cursor away
   - Confirm colors reset cleanly

8. **Edge Label Mode: off**
   - Set Edge Label Mode to off
   - Observe graph (edge labels should be hidden)

9. **Edge Label Mode: all-short**
   - Set Edge Label Mode to all-short
   - Observe relationship labels

10. **Edge Label Mode: selected-neighborhood**
    - Set Edge Label Mode to selected-neighborhood
    - Select an edge
    - Select a node
    - Observe selected/connected relationship labels

11. **Selection: node**
    - Click a node
    - Confirm highlight and inspector node mode

12. **Selection: edge**
    - Click an edge
    - Confirm highlight and inspector relationship mode

13. **Background clears selection**
    - Select a node or edge
    - Click background
    - Confirm selection clears

14. **Label settings do not break selection**
    - Select a node
    - Change Node Label Mode
    - Select an edge
    - Change Edge Label Mode
    - Click background
    - Confirm styling remains clean

## Next Steps

After manual QA is complete:
1. Record results in QA Panel
2. If all required checks pass, proceed to A4 (Edge Hover Label Parity v0)
3. If any check fails, fix the issue and re-test
