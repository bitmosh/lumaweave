# Session Log: Sigma Layout Runtime Debug + Fix

## Goal

Debug the collapsed/stacked Sigma graph by adding runtime logs and a visible debug panel to diagnose where the collapse happens in the render pipeline.

## Observed Problem

LumaWeave correctly reports 233 nodes and 313 edges with 0 warnings, but the rendered Sigma graph appears collapsed/stacked. It mostly shows `index()` with the rest of the labels stacked in one line/area. Changing physics settings resets the graph back to the `index()` view. Node size/link distance/repel force do not visibly produce a stable spread layout. Dragging appears to move the whole graph/camera, not individual nodes.

## Files Changed

- `src/app/AppShell.tsx` - Added runtime console logs before rendering SigmaGraphView
- `src/graph/renderers/sigma2d/SigmaGraphView.tsx` - Added input logs, debug state, and visible debug panel
- `src/graph/renderers/sigma2d/buildGraphologyGraph.ts` - Added coordinate diagnostics, changed return type to include diagnostics

## Debug Logs Added

### AppShell (before SigmaGraphView render)

```typescript
console.log("AppShell Sigma props", {
  normalizedNodes: summary.normalizedNodes.length,
  normalizedEdges: summary.normalizedEdges.length,
  nodeSize: settings.physics.nodeSize,
  linkDistance: settings.physics.linkDistance,
  repelForce: settings.physics.repelForce,
});
```

### SigmaGraphView (at component top)

```typescript
console.log("SigmaGraphView input", {
  nodes: nodes.length,
  edges: edges.length,
  nodeSize,
  linkDistance,
  repelForce,
});
```

### buildGraphologyGraph (after adding all nodes)

```typescript
const nodePositions = graph.nodes().map((id) => {
  const attrs = graph.getNodeAttributes(id);
  return { id, x: attrs.x, y: attrs.y, label: attrs.label };
});

console.log("Graphology layout diagnostics", {
  order: graph.order,
  size: graph.size,
  uniqueX: new Set(nodePositions.map((n) => n.x)).size,
  uniqueY: new Set(nodePositions.map((n) => n.y)).size,
  minX: Math.min(...nodePositions.map((n) => Number(n.x))),
  maxX: Math.max(...nodePositions.map((n) => Number(n.x))),
  minY: Math.min(...nodePositions.map((n) => Number(n.y))),
  maxY: Math.max(...nodePositions.map((n) => Number(n.y))),
  sample: nodePositions.slice(0, 10),
});
```

## Visible Debug Panel Added

A debug panel now appears in the top-left of the graph viewport showing:
- Sigma Input Nodes
- Sigma Input Edges
- Graphology Order
- Graphology Size
- Unique X
- Unique Y
- Min X
- Max X
- Min Y
- Max Y
- Node Size
- Link Distance
- Repel Force

## Return Type Change

`buildGraphologyGraph` now returns `GraphBuildResult` instead of just `Graph`:

```typescript
export interface GraphBuildResult {
  graph: Graph;
  diagnostics: {
    order: number;
    size: number;
    uniqueX: number;
    uniqueY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    sample: Array<{ id: string; x: number; y: number; label: string }>;
  };
}
```

## Validation Run

- Typecheck passed: `npm run typecheck` succeeded
- Dev server running on port 1420

## Next Steps (Browser Verification Needed)

The debug infrastructure is now in place. The user should check the browser console and debug panel to determine where the collapse happens:

1. **Check AppShell logs**: Confirm 233 nodes are passed to SigmaGraphView
2. **Check SigmaGraphView logs**: Confirm 233 nodes are received
3. **Check debug panel**: Confirm Graphology order is 233
4. **Check debug panel**: Confirm uniqueX and uniqueY are much greater than 1
5. **Check debug panel**: Confirm min/max x/y show a reasonable spread

## Potential Issues to Investigate

Based on the debug output, the next fixes may include:

- If Graphology has only 1 node: Inspect duplicate node IDs, log duplicate count, make node IDs unique with safe suffix
- If Graphology has 233 nodes but x/y are all 0, NaN, undefined, or identical: Fix coordinate assignment in buildGraphologyGraph
- If Graphology has 233 nodes with distinct x/y but Sigma still looks stacked: Inspect Sigma settings/camera behavior, remove or disable animatedReset, only fit camera once after initial graph creation
- If settings changes reset the graph to initial `index()` state: Inspect useGraphSourceSummary, ensure hook is not reloading/resetting summary on every settings change, ensure summary.normalizedNodes is not briefly becoming empty or stale

## Known Limitations

- No fixes applied yet - only diagnostic infrastructure added
- Camera reset behavior not yet modified
- Duplicate node ID handling not yet added
- Coordinate assignment not yet modified (sunflower layout still in place)

## Stop Conditions

The task is complete only when:
- Visible graph displays far more than one stacked node
- Debug panel confirms 233 Sigma input nodes
- Debug panel confirms Graphology order 233
- Debug panel confirms x/y positions are distinct
- Changing node size affects visible node size without collapsing back to index()
- Changing link distance/repel force changes spread without collapsing back to index()
