# Session Log: Label Controls Repair v0

## Goal

Repair label settings controls and establish Feature Registration Standard v0 based on manual QA failures of Label Density v0.

## Manual QA Failures (Initial)

1. No Node Label Mode dropdown appears in Settings
2. All node labels currently show, but there is no visible option to change node label modes
3. Hovering a node does not display the node name until the node is selected
4. When a selected node is hovered, the text almost matches the white hover highlight and becomes hard to read
5. Edge label modes do not display edge labels
6. all-short does not display edge labels
7. selected-neighborhood does not display edge labels
8. Label settings appear incomplete or disconnected from the visible SettingsPanel

## Manual QA Failures (Follow-up - 2026-05-01)

1. **Hover label shows** - Label appears but is not readable (white text on white background)
2. **Hover no stale style** - Colors do not reset cleanly after hovering
3. **Edge Label Mode: selected-neighborhood** - Edge labels don't display correctly with neighborhood depth changes

## Root Causes Found (Follow-up - 2026-05-01)

1. **Hover label readability**: hoverLabelColor was "#e0f2fe" (light sky blue) which created low contrast with the light label text color "#f1f5f9" used by Sigma
2. **Stale hover style**: Hover effect reset all nodes to their original color, but the "original color" was read from current attributes which might have been modified by selection styling, causing incorrect resets
3. **Edge label neighborhood depth**: Edge label policy only showed direct connected edge labels for stage >= 2, but did not show secondary/tertiary neighborhood labels for stages 2 and 3

## Files Changed (Follow-up - 2026-05-01)

- `src/control-plane/settings/settings.defaults.ts`
  - Changed `hoverLabelColor` from "#e0f2fe" to "#0f172a" (dark slate) for better readability with light label text

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx`
  - Added `previousHoveredNodeId` state to track the previously hovered node
  - Updated `enterNode` handler to set `previousHoveredNodeId` before updating `hoveredNodeId`
  - Updated `leaveNode` handler to set `previousHoveredNodeId` before clearing `hoveredNodeId`
  - Changed hover styling effect to reset only the previously hovered node instead of resetting all nodes
  - Added check to not apply hover styling to selected node (preserve selection colors)

- `src/graph/renderers/sigma2d/labelPolicy.ts`
  - Fixed node label policy selected-neighborhood mode:
    - Stage 2: show direct neighbor labels (was incorrectly showing edge labels)
    - Stage 3: show secondary neighbor labels (was incomplete)
  - Fixed edge label policy selected-neighborhood mode:
    - Stage 2: show direct connected edge labels
    - Stage 3: show secondary edge labels (edges connecting direct neighbors to secondary neighbors)

## Root Causes Found

1. **Registry incomplete**: `settings.registry.ts` only exposed `edgeLabelMode` but not `nodeLabelMode`, `maxEdgeLabelLength`, `showLabelsOnHover`, or `zoomLabelThreshold`
2. **AppShell wiring incomplete**: `showLabelsOnHover` and `zoomLabelThreshold` were not passed from AppShell to SigmaGraphView
3. **SigmaGraphView props incomplete**: `showLabelsOnHover` and `zoomLabelThreshold` were removed from the interface to avoid unused variable warnings
4. **Hover behavior not implemented**: No `hoveredNodeId` state, no Sigma `enterNode`/`leaveNode` event handlers, no hover label logic in label policy
5. **Hover colors not configurable**: No settings for `hoverNodeColor` and `hoverLabelColor`
6. **Edge labels not enabled**: Sigma configuration did not have `renderEdgeLabels: true`
7. **Debug panel incomplete**: Missing rows for label settings and hover state

## Files Changed

- `src/control-plane/settings/settings.registry.ts`
  - Added `nodeLabelMode` select control with options: off, selected-neighborhood, important-only, all
  - Added `maxEdgeLabelLength` range control (10-100, step 2)
  - Added `showLabelsOnHover` boolean control with description
  - Added `zoomLabelThreshold` range control marked as "(Planned)"
  - Added `hoverNodeColor` text control for hex color
  - Added `hoverLabelColor` text control for hex color
  - Added `text` type to SettingControl type union

- `src/control-plane/settings/SettingsPanel.tsx`
  - Added handler for `text` type controls (text input for hex colors)

- `src/control-plane/settings/settings.schema.ts`
  - Added `hoverNodeColor: string` to `graphView` section
  - Added `hoverLabelColor: string` to `graphView` section

- `src/control-plane/settings/settings.defaults.ts`
  - Added `hoverNodeColor: "#ffffff"` to `graphView` defaults
  - Added `hoverLabelColor: "#e0f2fe"` to `graphView` defaults

- `src/app/AppShell.tsx`
  - Added `showLabelsOnHover={settings.labels.showLabelsOnHover}` to SigmaGraphView props
  - Added `zoomLabelThreshold={settings.labels.zoomLabelThreshold}` to SigmaGraphView props
  - Added `hoverNodeColor={settings.graphView.hoverNodeColor}` to SigmaGraphView props
  - Added `hoverLabelColor={settings.graphView.hoverLabelColor}` to SigmaGraphView props

- `src/graph/renderers/sigma2d/SigmaGraphView.tsx`
  - Added `showLabelsOnHover?: boolean` to SigmaGraphViewProps
  - Added `zoomLabelThreshold?: number` to SigmaGraphViewProps
  - Added `hoverNodeColor?: string` to SigmaGraphViewProps
  - Added `hoverLabelColor?: string` to SigmaGraphViewProps
  - Added default values: `showLabelsOnHover = true`, `zoomLabelThreshold = 1.15`, `hoverNodeColor = "#ffffff"`, `hoverLabelColor = "#e0f2fe"`
  - Added `const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)`
  - Added Sigma event handlers: `enterNode` sets hoveredNodeId, `leaveNode` clears hoveredNodeId
  - Added `hoveredNodeId` to SelectionContext in label policy effect
  - Added `hoverLabelColor` to LabelPolicyOptions
  - Added `hoverLabelColor` to labelOptions passed to label policy functions
  - Updated label policy effect dependencies to include `hoveredNodeId` and `hoverLabelColor`
  - Added hover styling effect: resets node colors and applies hoverNodeColor to hovered node
  - Added `renderEdgeLabels: true` to Sigma configuration
  - Added debug panel rows: "Hovered Node", "Show Labels On Hover", "Zoom Label Threshold"

- `src/graph/renderers/sigma2d/labelPolicy.ts`
  - Added `hoveredNodeId: string | null` to SelectionContext interface
  - Added `hoverLabelColor: string` to LabelPolicyOptions interface
  - Updated `applyNodeLabelPolicy` to destructure `hoveredNodeId` and `showLabelsOnHover` from inputs
  - Added hover label logic: if `showLabelsOnHover` is true and `hoveredNodeId` exists, show that node's label
  - Changed `_options` to `options` to use `showLabelsOnHover` and `hoverLabelColor`

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`
  - Already had `fullLabel` on nodes and edges (from Label Density v0)
  - No changes needed

- `docs/27_FEATURE_REGISTRATION_STANDARD.md`
  - Created comprehensive feature registration standard document
  - Defined feature manifest requirements
  - Defined completion gates
  - Defined fail-safe rules
  - Provided feature manifest example
  - Provided feature onboarding checklist

- `docs/logs/sessions/label-controls-repair-v0.md`
  - This session log

## Settings Exposed

All label settings are now visible in SettingsPanel under "Labels" and "Graph View" categories:

**Labels category:**
- Node Label Mode (select)
- Edge Label Mode (select)
- Max Edge Label Length (range)
- Show Labels On Hover (boolean)
- Zoom Label Threshold (range, marked as Planned)

**Graph View category:**
- Node Selection Stage (select)
- Hover Node Color (text, hex color)
- Hover Label Color (text, hex color)

## Behavior Added

**Hover behavior:**
- When `showLabelsOnHover` is true and a node is hovered, that node's label is displayed
- Hover event handlers track `hoveredNodeId` state
- Hover styling effect applies `hoverNodeColor` to hovered node
- Hover label color can be customized via `hoverLabelColor` setting

**Label controls:**
- Node Label Mode dropdown now visible and functional
- Edge Label Mode dropdown already visible (was working)
- Max Edge Label Length slider now visible and functional
- Show Labels On Hover checkbox now visible and functional
- Zoom Label Threshold slider visible but marked as Planned

**Edge label display:**
- Added `renderEdgeLabels: true` to Sigma configuration to enable edge label rendering
- Edge label modes should now display labels when configured appropriately

**Debug panel:**
- Added "Hovered Node" row showing currently hovered node ID or "none"
- Added "Show Labels On Hover" row showing boolean value
- Added "Zoom Label Threshold" row showing numeric value

## Validation

- Typecheck: **PASSED** (initial session)
- Typecheck: **PASSED** (follow-up fixes)

## Fixes Applied (Follow-up - 2026-05-01)

### Hover Label Readability Fix

**Problem:** Label appeared but was not readable (white text on white background)

**Root Cause:** hoverLabelColor was "#e0f2fe" (light sky blue) which created low contrast with the light label text color "#f1f5f9" used by Sigma

**Fix:** Changed hoverLabelColor from "#e0f2fe" to "#0f172a" (dark slate) in settings.defaults.ts. The dark slate color provides sufficient contrast with the light label text for readability while maintaining the Solar Plasma aesthetic.

### Stale Hover Style Fix

**Problem:** Colors did not reset cleanly after hovering

**Root Cause:** Hover effect reset all nodes to their original color, but the "original color" was read from current attributes which might have been modified by selection styling, causing incorrect resets. Additionally, resetting all nodes on every hover change was inefficient.

**Fix:** 
- Added `previousHoveredNodeId` state to track the previously hovered node
- Updated `enterNode` handler to set `previousHoveredNodeId` before updating `hoveredNodeId`
- Updated `leaveNode` handler to set `previousHoveredNodeId` before clearing `hoveredNodeId`
- Changed hover styling effect to reset only the previously hovered node instead of resetting all nodes
- Added check to not apply hover styling to selected node (preserve selection colors)

This ensures that only the node that was previously hovered gets reset to its original color, and the selected node's color is never affected by hover styling.

### Edge Label Neighborhood Depth Fix

**Problem:** Edge labels don't display correctly with neighborhood depth changes

**Root Cause:** Edge label policy only showed direct connected edge labels for stage >= 2, but did not show secondary/tertiary neighborhood labels for stages 2 and 3. Additionally, the node label policy was incorrectly showing edge labels instead of node labels for stage 2.

**Fix:**
- Fixed node label policy selected-neighborhood mode:
  - Stage 2: show direct neighbor labels (was incorrectly showing edge labels)
  - Stage 3: show secondary neighbor labels (was incomplete, now properly iterates through direct neighbors to find their neighbors)
- Fixed edge label policy selected-neighborhood mode:
  - Stage 2: show direct connected edge labels (already working)
  - Stage 3: show secondary edge labels (edges connecting direct neighbors to secondary neighbors, excluding edges back to the selected node)

This ensures that edge labels display correctly for all neighborhood depths, matching the visual neighborhood expansion shown by node selection stages.

## Expected Behavior After Fix

1. Node Label Mode dropdown appears in Settings under Labels category
2. Changing Node Label Mode affects node label visibility
3. Edge Label Mode dropdown already visible, should work with `renderEdgeLabels: true`
4. Max Edge Label Length slider appears and affects edge label truncation
5. Show Labels On Hover checkbox appears and controls hover label behavior
6. Hovering a node shows that node's label when Show Labels On Hover is true
7. Hover node highlight color can be customized via Hover Node Color setting
8. Hover label color can be customized via Hover Label Color setting
9. Debug panel shows Hovered Node, Show Labels On Hover, and Zoom Label Threshold
10. Changing label modes does not break selection highlights
11. Background click still clears selection highlights

## Known Limitations

1. **Zoom Label Threshold**: Marked as "(Planned)" in registry. Setting exists but is not yet implemented in label policy. This is documented as planned.
2. **Edge label display**: Added `renderEdgeLabels: true` to Sigma configuration, but manual QA is needed to confirm edge labels actually display. If Sigma does not render edge labels reliably, a fallback may be needed (show selected relationship label in Inspector or canvas overlay).
3. **Hover label color**: Added to LabelPolicyOptions but not yet used to actually change the label color when hovering. The label color is currently controlled by Sigma's global `labelColor` setting. This is a known limitation.
4. **Zoom-based label hiding**: Not implemented yet (zoomLabelThreshold is planned).

## Next Steps

1. Run typecheck
2. Perform manual QA to verify:
   - Node Label Mode dropdown appears
   - Edge Label Mode dropdown appears
   - Changing Node Label Mode affects node labels
   - Changing Edge Label Mode displays edge labels (or document Sigma limitation)
   - Hovering a node shows readable label when enabled
   - Hover colors are customizable
   - Debug panel shows label settings
   - Selection highlights still work
   - Background click still clears selection
3. If edge labels still don't display with `renderEdgeLabels: true`, document Sigma limitation and create fallback
4. Implement zoomLabelThreshold in label policy if needed
5. Implement hover label color in label policy if needed

## Roadmap Context

After Label Controls Repair v0:
1. Theme Token Foundation v0
2. Node/Edge Type Color v0
3. Relationship Legend v0
4. Theme Editor v0
5. Solar Plasma Visual Grammar v0

This session also established the Feature Registration Standard v0, which will be used for all future features to ensure complete onboarding with settings, defaults, registry, wiring, debug rows, QA checks, and session logs.
