# Session Log: Selection State Cleanup v0

## Goal

Fix selection visual reset bugs and create theme planning documentation.

## Manual QA Findings

**Working:**
1. Edge selection works.
2. Node selection works.
3. Selecting edge then node clears edge selection.
4. Selecting node then edge clears node selection.
5. Edge relationship display still works correctly.

**Needs fixing:**
1. Secondary neighbor nodes are too close to default cyan and are hard to distinguish.
2. Node Selection Stage settings update, but feel buggy/funky.
3. Clicking background does not clear edge highlights.
4. Selecting a new node leaves old node-connected edges highlighted.
5. Selection reset logic is not fully clearing previous visual state.
6. Eventually node and edge display depth options should mirror each other (deferred).

## Root Cause Analysis

**Split effects fighting each other:**
- There were two separate useEffects for node selection and edge selection
- Node selection effect depended on [selectedNodeId, nodeSelectionStage]
- Edge selection effect depended on [selectedEdgeId]
- Each effect only reset its own domain (nodes or edges)
- When switching between node and edge, stale styles from the other effect remained
- When changing nodeSelectionStage, old edge highlights from previous node selection persisted

**Background click not clearing edge highlights:**
- Background click did call onClearSelection (line 310-312 in SigmaGraphView)
- AppShell onClearSelection did clear selectedNodeId and selectedEdgeId
- However, the split effects didn't fully reset all styles when selection cleared
- Edge effect only reset edges, not nodes
- Node effect only reset nodes, not edges

**Settings update causing stale styles:**
- When nodeSelectionStage changed, the node effect re-ran
- But it only reset nodes, not edges
- Old direct edge highlights from previous stage remained visible

## Color Adjustment

**Before:**
- secondaryNeighborNode: #7dd3fc (light cyan, too close to default cyan #22d3ee)

**After:**
- secondaryNeighborNode: #3b82f6 (bright blue, more distinct from cyan)
- relationshipEndpointNode: #2563eb (darker blue, kept)
- defaultNode: #22d3ee (cyan, kept)

**Result:**
- Endpoint nodes = darker blue (#2563eb)
- Secondary neighbor nodes = brighter blue (#3b82f6)
- Default nodes = cyan (#22d3ee)
- These are now visually distinct.

## Files Changed

- `src/graph/renderers/sigma2d/selectionColors.ts` - Updated secondaryNeighborNode to #3b82f6
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Refactored selection styling into single effect with helper functions
- `docs/26_THEME_ENGINE_AND_STYLE_CUSTOMIZATION.md` - Created theme planning documentation

## What Changed

### selectionColors.ts

**Updated color:**
- secondaryNeighborNode: #7dd3fc → #3b82f6

### SigmaGraphView

**Added state:**
- activeSelectionMode: "none" | "node-stage-1" | "node-stage-2" | "node-stage-3" | "edge-relationship"

**Added helper functions:**
- resetGraphStyles(graph) - Resets all nodes to defaultNode/baseSize and all edges to defaultEdge/size 3
- applySelectedEdgeStyles(graph, edgeId) - Applies edge selection and neighborhood highlighting
- applySelectedNodeStyles(graph, nodeId, stage) - Applies node selection with staged highlighting

**Refactored selection logic:**
- Removed split useEffects for node and edge selection
- Created single selection styling useEffect dependent on [selectedNodeId, selectedEdgeId, nodeSelectionStage]
- Effect always calls resetGraphStyles first
- Effect resets neighborhood info states before applying selection
- Effect uses if/else for mutually exclusive selection (edge or node)
- Effect updates activeSelectionMode state
- Effect calls sigma.refresh() once at the end

**Debug panel:**
- Added "Active Selection Mode" row showing activeSelectionMode

## Fix Details

### Reset Graph Styles

```typescript
function resetGraphStyles(graph: any) {
  graph.forEachNode((node: string) => {
    const attrs = graph.getNodeAttributes(node);
    const baseSize = typeof attrs.baseSize === "number" ? attrs.baseSize : typeof attrs.size === "number" ? attrs.size : 10;
    graph.setNodeAttribute(node, "color", selectionColors.defaultNode);
    graph.setNodeAttribute(node, "size", baseSize);
    graph.setNodeAttribute(node, "baseSize", baseSize);
  });

  graph.forEachEdge((edgeId: string) => {
    graph.setEdgeAttribute(edgeId, "color", selectionColors.defaultEdge);
    graph.setEdgeAttribute(edgeId, "size", 3);
  });
}
```

This ensures every node and edge is reset to default before applying any selection.

### Single Selection Effect

```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  const graph = sigma.getGraph();

  // Reset all styles to default first
  resetGraphStyles(graph);

  // Reset neighborhood info states
  setNeighborhoodInfo({ sourceId: null, targetId: null, secondaryEdgeCount: 0, secondaryNodeCount: 0 });
  setNodeNeighborhoodInfo({ directEdgeCount: 0, directNeighborCount: 0 });

  // Apply selection styling (mutually exclusive)
  if (selectedEdgeId) {
    applySelectedEdgeStyles(graph, selectedEdgeId);
    setActiveSelectionMode("edge-relationship");
  } else if (selectedNodeId) {
    applySelectedNodeStyles(graph, selectedNodeId, nodeSelectionStage);
    const modeMap: Record<1 | 2 | 3, "node-stage-1" | "node-stage-2" | "node-stage-3"> = {
      1: "node-stage-1",
      2: "node-stage-2",
      3: "node-stage-3",
    };
    setActiveSelectionMode(modeMap[nodeSelectionStage]);
  } else {
    setActiveSelectionMode("none");
  }

  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, nodeSelectionStage]);
```

This single effect:
- Always resets the entire graph before applying selection
- Always resets neighborhood info states
- Applies either edge or node selection (mutually exclusive)
- Updates active selection mode
- Refreshes once at the end

### Background Click

Background click already called onClearSelection (line 310-312):
```typescript
sigma.on("clickStage", () => {
  onClearSelectionRef.current();
});
```

AppShell onClearSelection clears selectedNodeId and selectedEdgeId. With the single selection effect, this now properly resets all graph styles.

## Validation

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420

## Expected Behavior After Fix

**Secondary neighbor color:**
- Secondary neighbor nodes are now bright blue (#3b82f6), distinct from default cyan (#22d3ee)

**Background click:**
- Clicking background calls onClearSelection
- AppShell clears selectedNodeId and selectedEdgeId
- Single selection effect resets all graph styles
- All nodes return to default cyan
- All edges return to default slate
- Inspector returns to graph summary
- Debug panel shows "none" for selection mode

**Selecting a new node:**
- Old node-connected edges are cleared by resetGraphStyles
- New node selection applies only its own stage
- No stale edge highlights remain

**Changing node selection stage:**
- resetGraphStyles clears all styles
- applySelectedNodeStyles applies new stage
- Old edge/node highlights do not persist

**Active selection mode:**
- Debug panel shows current active mode
- none, node-stage-1, node-stage-2, node-stage-3, or edge-relationship
- Updates immediately when selection changes

## Known Limitations

1. Node and edge display depth options do not mirror each other (deferred per user request)
2. Theme editor not implemented yet (only planning doc created)
3. Color picker not implemented yet
4. Animated/effect theme tokens not implemented yet

## Next Step

Manual QA verification:
- Background click clears all highlights
- Selecting a new node clears old node edge highlights
- Changing node selection stage restyles current node cleanly
- Secondary neighbor nodes are visually distinct from default cyan
- Active selection mode shows correctly in debug panel

After QA verification, proceed to:
- Label Density v0
- Node/Edge Type Color v0
- Relationship Legend v0
- Solar Plasma Visual Grammar v0
- Force Layout v1

## Roadmap

After Selection State Cleanup v0:
1. Label Density v0
2. Node/Edge Type Color v0
3. Relationship Legend v0
4. Solar Plasma Visual Grammar v0
5. Force Layout v1

Theme Engine (planned):
- Phase T0: Document theme token structure (DONE)
- Phase T1: Centralize selection colors into theme tokens
- Phase T2: App shell colors from theme tokens
- Phase T3: Node/edge relationship colors from theme tokens
- Phase T4: Theme editor panel
- Phase T5: Import/export custom themes
- Phase T6: Animated/effect theme tokens
