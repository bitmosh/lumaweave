# Session Log: Label Density v0

## Goal

Make node and edge labels readable by controlling when labels appear based on label modes and selection state.

## Files Changed

- `src/graph/renderers/sigma2d/labelPolicy.ts` - Created helper module for label visibility policy
- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` - Preserved fullLabel on nodes and edges
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Added label props and label policy effect
- `src/app/AppShell.tsx` - Wired label settings to SigmaGraphView

## What Changed

### labelPolicy.ts

**Created new helper module with:**

- `truncateLabel(label, maxLength)` - Truncates label with ellipsis
- `applyNodeLabelPolicy(graph, selectionContext, options, mode)` - Applies node label visibility based on mode
- `applyEdgeLabelPolicy(graph, selectionContext, options, mode)` - Applies edge label visibility based on mode

**Node label modes:**
- `off` - all node labels hidden
- `all` - all node labels visible
- `selected-neighborhood` - labels based on selection state
- `important-only` - labels for high-degree nodes (degree >= 3 or top 20)

**Edge label modes:**
- `off` - all edge labels hidden
- `selected-neighborhood` - labels based on selection state
- `important-only` - labels for high confidence/weight (fallback: hide unless selected)
- `all-short` - all labels truncated to maxEdgeLabelLength
- `all-medium` - all labels truncated to maxEdgeLabelLength * 2

**Node label behavior (selected-neighborhood):**
- If edge selected: show source and target labels
- If node selected: show selected node label, direct neighbor labels if stage 3
- If no selection: show important/core labels only

**Edge label behavior (selected-neighborhood):**
- If edge selected: show selected edge label
- If node selected and stage >= 2: show direct connected edge labels
- If no selection: hide edge labels

### buildGraphologyGraph.ts

**Preserved original labels:**
- Added `fullLabel` attribute to nodes (stores original label)
- Added `fullLabel` attribute to edges (stores original relationship label)
- Rendered label can be full, truncated, or empty based on policy

### SigmaGraphView.tsx

**Added props:**
- `nodeLabelMode?: NodeLabelMode`
- `edgeLabelMode?: EdgeLabelMode`
- `maxEdgeLabelLength?: number`

**Added label policy effect:**
- Separate effect from selection styling
- Depends on: `selectedNodeId`, `selectedEdgeId`, `nodeSelectionStage`, `nodeLabelMode`, `edgeLabelMode`, `maxEdgeLabelLength`
- Calls `applyNodeLabelPolicy` and `applyEdgeLabelPolicy`
- Refreshes Sigma after applying policy

**Debug panel:**
- Added "Node Label Mode" row
- Added "Edge Label Mode" row
- Added "Max Edge Label Length" row

**Planned features (not implemented):**
- showLabelsOnHover - documented as planned
- zoomLabelThreshold - documented as planned

### AppShell.tsx

**Wired label settings:**
- `nodeLabelMode={settings.labels.nodeLabelMode}`
- `edgeLabelMode={settings.labels.edgeLabelMode}`
- `maxEdgeLabelLength={settings.labels.maxEdgeLabelLength}`

## Validation

- Typecheck passed: `npm run typecheck` succeeded

## Expected Behavior

**Node labels:**
- `off` mode: all node labels hidden
- `all` mode: all node labels visible
- `selected-neighborhood` mode: labels based on selection
- `important-only` mode: high-degree node labels (degree >= 3 or top 20)

**Edge labels:**
- `off` mode: all edge labels hidden
- `selected-neighborhood` mode: labels based on selection
- `important-only` mode: high confidence/weight (fallback: hide unless selected)
- `all-short` mode: all labels truncated to maxEdgeLabelLength (48)
- `all-medium` mode: all labels truncated to maxEdgeLabelLength * 2 (96)

**Label state reset:**
- Labels are reset/recomputed each time selection or label settings change
- No stale label state

**Settings UI:**
- Node Label Mode control (should work)
- Edge Label Mode control (should work)
- Max Edge Label Length control (should work)
- Show Labels On Hover (exists in settings, not wired to renderer - planned)
- Zoom Label Threshold (exists in settings, not wired to renderer - planned)

**Integration:**
- Changing label modes should not break selection highlights
- Background click should still clear selection highlights
- Label policy runs separately from selection styling

## Known Limitations

1. `showLabelsOnHover` and `zoomLabelThreshold` exist in settings schema but are not wired to the renderer yet - marked as planned features
2. `important-only` edge mode currently hides all labels unless selected (no confidence/weight data yet)
3. No zoom-based label hiding yet (zoomLabelThreshold not implemented)
4. No hover-based label showing yet (showLabelsOnHover not implemented)

## Next Step

Manual QA verification at `http://localhost:1420`:
- Node labels can be turned off
- Edge labels can be turned off
- All node labels mode works
- Selected-neighborhood node labels work
- Selected-neighborhood edge labels work
- All-short edge labels work
- Changing settings does not break selection highlights
- Background click still clears selection highlights

After QA verification, proceed to next milestone in roadmap.

## Roadmap

After Label Density v0:
1. Node/Edge Type Color v0
2. Relationship Legend v0
3. Solar Plasma Visual Grammar v0
4. Force Layout v1
