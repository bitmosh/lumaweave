# Session Log: Edge Selection v0

## Goal

Allow users to click a rendered edge/relationship line and inspect the relationship in the right-side InspectorPanel.

## Files Changed

- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` - Changed to use `addEdgeWithKey` for proper edge key matching, added edge label attribute, increased default edge size to 3, added baseSize to nodes
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Added selectedEdgeId prop, onSelectEdge callback, edge click handler, edge styling useEffect, updated debug panel to show selected edge, added DebugRow component, fixed node styling to use baseSize
- `src/app/AppShell.tsx` - Added selectedEdgeId state, derived selectedEdge/selectedEdgeSource/selectedEdgeTarget, updated selection behavior to clear opposite type on selection, passed edge data to InspectorPanel
- `src/control-plane/panels/InspectorPanel.tsx` - Added edge selection mode with "Selected Relationship" UI, MetadataRow and RawPreview helper components, displays edge details with amber styling

## What Changed

### buildGraphologyGraph

**Edge key handling:**
- Changed from `graph.addEdge(...)` to `graph.addEdgeWithKey(edge.id, ...)` to ensure Graphology edge keys match normalized edge IDs
- This is critical for Sigma clickEdge events to return the correct edge ID

**Edge attributes:**
- Added `label: edge.relationship || "related"` for edge labels
- Increased default edge size from 2 to 3 for better hitbox visibility
- Added `baseSize: size` to nodes to prevent size drift during selection

### SigmaGraphView

**Edge selection props:**
- Added `selectedEdgeId?: string | null` prop
- Added `onSelectEdge?: (edgeId: string) => void` callback

**Callback refs:**
- Added refs for onSelectNode, onSelectEdge, onClearSelection to avoid stale closure issues in event handlers
- useEffect keeps refs synced with latest props

**Edge click handler:**
- Added `sigma.on("clickEdge", ({ edge }) => { ... })` handler
- Logs clicked edge key and attributes for debugging
- Calls onSelectEdgeRef.current?.(edge)

**Edge styling:**
- Added separate useEffect watching selectedEdgeId
- Resets all edges to default color (#6478b) and size (3)
- If selectedEdgeId exists and graph.hasEdge(selectedEdgeId), sets:
  - color: #fbbf24 (amber-400)
  - size: 6
- Calls sigma.refresh() to apply visual changes

**Node styling improvements:**
- Added baseSize tracking to nodes in buildGraphologyGraph
- Node selection useEffect now uses baseSize to prevent size drift on repeated selections
- Checks graph.hasNode(selectedNodeId) before applying styling

**Debug panel:**
- Added DebugRow helper component for cleaner code
- Added "Selected Node" and "Selected Edge" rows to debug panel
- Shows "none" when no selection

### AppShell

**Edge selection state:**
- Added `selectedEdgeId` state alongside `selectedNodeId`
- Selection behavior:
  - Selecting node clears selectedEdgeId
  - Selecting edge clears selectedNodeId
  - Clicking background clears both

**Edge lookup:**
- Derived `selectedEdge` from selectedEdgeId and summary.normalizedEdges
- Derived `selectedEdgeSource` from selectedEdge.source and summary.normalizedNodes
- Derived `selectedEdgeTarget` from selectedEdge.target and summary.normalizedNodes

**Props passing:**
- Updated SigmaGraphView props to include selectedEdgeId and onSelectEdge
- Updated selection handlers to implement mutual exclusion behavior
- Passed selectedEdge, selectedEdgeSource, selectedEdgeTarget to InspectorPanel

### InspectorPanel

**Helper components:**
- Added MetadataRow component for consistent label/value display with null/undefined filtering
- Added RawPreview component for truncated JSON preview with truncation notice

**Edge selection mode:**
- Added selectedEdge, selectedEdgeSource, selectedEdgeTarget props
- Three-state rendering:
  - No selection: graph summary (cyan border)
  - Selected node: node details (cyan border)
  - Selected edge: relationship details (amber border)

**Edge details display:**
- Shows "Selected Relationship" header with amber styling
- Displays:
  - Edge ID
  - Relationship type
  - Source ID and source label
  - Target ID and target label
  - Confidence / confidence_score (if present)
  - Source file (if present)
  - Source location (if present)
  - Raw metadata preview (truncated to 1200 chars)

## Validation

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420

## Expected Behavior

- Clicking an edge logs the clicked edge key/attributes in console
- Inspector displays selected relationship details with amber border
- Selected edge visually highlights (amber color, 6x size)
- Clicking background clears both node and edge selection
- Node selection still works (clears edge selection)
- Settings panel still works

## Terminology

- Code uses "Edge" consistently
- UI displays "Relationship" for user-facing text
- Edge = link = connection line = relationship between two nodes
- Raw Graphify "links" are preserved as raw data

## Known Limitations

- Edge hitboxes may still be thin in Sigma (default size 3, selected size 6)
- If edge click is difficult, could consider:
  - Showing edge details when clicking edge label if available
  - Increasing edge size temporarily to 4

## Decision

- Used addEdgeWithKey to ensure edge keys match normalized edge IDs
- Mutual exclusion between node and edge selection (selecting one clears the other)
- Amber styling (#fbbf24) for selected edges to match selected nodes
- Debug panel shows both selected node and selected edge for diagnostics
- Helper components (MetadataRow, RawPreview, DebugRow) for cleaner code

## Next Step

Manual QA verification:
- Click edge → relationship inspector appears
- Selected edge highlights amber and larger
- Click node → node inspector appears (edge cleared)
- Click background → inspector resets to graph summary
- Console logs clicked edge key/attributes
- Settings panel still works

## Roadmap

After Edge Selection v0:
1. Label Density v0
2. Node/Edge Type Color v0
3. Relationship Legend v0
4. Solar Plasma Visual Grammar v0
5. Force Layout v1
