# Renderer Bindings v0

## TypeScript Handleset Scaffold

A machine-readable TypeScript handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry contains all handles with their runtime bindings to the renderer. The TypeScript scaffold does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The handleset registry is a machine-readable documentation/scaffold layer for now.

## Overview

How settings bind to Sigma/graphology renderer.

## Sigma Configuration (SigmaGraphView.tsx)

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`

### Direct Sigma Config Bindings

```typescript
const sigma = new Sigma(graph, containerRef.current, {
  // Label settings
  renderLabels: true,
  labelFont: graphVisualTokens.sigmaConfig.labelFont,           // "sans-serif" (token)
  labelSize: nodeLabelFontSize,                                 // from prop (labels.nodeLabelFontSize)
  labelColor: { attribute: "labelColor", color: graphVisualTokens.nodeLabelColor.default },
  labelRenderedSizeThreshold: graphVisualTokens.sigmaConfig.labelRenderedSizeThreshold,

  // Edge label settings
  renderEdgeLabels: true,
  edgeLabelFont: graphVisualTokens.sigmaConfig.edgeLabelFont,   // "sans-serif" (token)
  edgeLabelSize: edgeLabelFontSize,                              // from prop (labels.edgeLabelFontSize)
  edgeLabelColor: { color: graphVisualTokens.edgeLabelColor.default },

  // Color settings (from tokens)
  defaultNodeColor: graphVisualTokens.nodeColor.default,          // "#22d3ee"
  defaultEdgeColor: graphVisualTokens.edgeColor.default,          // "#64748b"
  defaultEdgeType: "line",

  // Event settings
  enableEdgeEvents: true,
});
```

### Live Update Bindings

```typescript
// Edge label font size live update
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;
  console.log("[EDGE LABEL SIZE] Updating to:", edgeLabelFontSize);
  sigma.setSetting("edgeLabelSize", edgeLabelFontSize);
  sigma.refresh();
  console.log("[EDGE LABEL SIZE] Updated and refreshed");
}, [edgeLabelFontSize]);

// Node label font size live update
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;
  console.log("[NODE LABEL SIZE] Updating to:", nodeLabelFontSize);
  sigma.setSetting("labelSize", nodeLabelFontSize);
  sigma.refresh();
  console.log("[NODE LABEL SIZE] Updated and refreshed");
}, [nodeLabelFontSize]);
```

**Sigma Settings Used:**
- `labelSize` - node label font size (live update)
- `edgeLabelSize` - edge label font size (live update)

## Graphology Layout Bindings

**File:** `src/graph/renderers/sigma2d/buildGraphologyGraph.ts`

```typescript
export function buildGraphologyGraph(
  nodes: LumaWeaveNodeDraft[],
  edges: LumaWeaveEdgeDraft[],
  settings: LayoutSettings  // { nodeSize, linkDistance, repelForce }
): { graph: Graph, diagnostics: Diagnostics } {
  const graph = new Graph();

  // Add nodes with baseSize from settings
  nodes.forEach((node) => {
    graph.addNode(node.id, {
      x: node.x,
      y: node.y,
      size: node.size * settings.nodeSize,  // physics.nodeSize multiplier
      baseSize: node.size,                  // preserved for style policy
      label: node.label,
      fullLabel: node.label,                 // preserved for label policy
      // ...
    });
  });

  // Add edges
  edges.forEach((edge) => {
    graph.addEdge(edge.id, edge.source, edge.target, {
      // edge attributes
    });
  });

  // Force layout configuration
  const layoutSettings = {
    nodeSize: settings.nodeSize,
    linkDistance: settings.linkDistance,
    repelForce: settings.repelForce,
  };

  // Apply force layout
  forceAtlas2.assign(graph, {
    iterations: 10,
    settings: {
      gravity: 1,
      scalingRatio: 10,
      strongGravityMode: false,
      // Settings from props:
      nodeSize: settings.nodeSize,
      linkDistance: settings.linkDistance,
      repelForce: settings.repelForce,
    },
  });

  return { graph, diagnostics };
}
```

**Settings Used:**
- `nodeSize` - multiplier for node base size
- `linkDistance` - force layout link distance
- `repelForce` - force layout repulsion

**Note:** Other physics settings (centerForce, communityGravity, curveAmount, animationSoftness) are not used by the force layout.

## Graph Visual Policy Bindings

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx` (styling effect)

```typescript
// Style policy application
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  const graph = sigma.getGraph();

  const interactionState: GraphInteractionState = {
    selectedNodeId,
    selectedEdgeId,
    hoveredNodeId,
    hoveredEdgeId: null,  // Not implemented in v0
    neighborhoodDepth: nodeSelectionStage,
  };

  const styleOptions: StylePolicyOptions = {
    hoverNodeColor,  // from prop (graphView.hoverNodeColor)
    edgeLabelFontSize,  // from prop (labels.edgeLabelFontSize)
  };

  // Apply complete styling policy (reset + selection + hover)
  applyGraphStylePolicy(graph, interactionState, styleOptions);

  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, nodeSelectionStage, hoveredNodeId, hoverNodeColor, edgeLabelFontSize]);
```

**File:** `src/graph/visual/graphStylePolicy.ts`

```typescript
export function applyGraphStylePolicy(
  graph: Graph,
  state: GraphInteractionState,
  options: StylePolicyOptions
): void {
  const { selectedNodeId, selectedEdgeId, hoveredNodeId, neighborhoodDepth } = state;
  const { hoverNodeColor } = options;

  // 1. Reset all styles to default (uses graphVisualTokens)
  resetGraphStyles(graph);

  // 2. Apply selected/neighborhood styles (uses graphVisualTokens)
  if (selectedEdgeId) {
    applySelectedEdgeStyles(graph, selectedEdgeId, neighborhoodDepth);
  } else if (selectedNodeId) {
    applySelectedNodeStyles(graph, selectedNodeId, neighborhoodDepth);
  }

  // 3. Apply hover overlay styles (uses hoverNodeColor from options)
  if (hoveredNodeId) {
    applyHoverStyles(graph, state, options);
  } else {
    clearHoverStyles(graph);
  }
}
```

**Visual Tokens Used:**
- `graphVisualTokens.nodeColor.default` - default node fill
- `graphVisualTokens.nodeColor.selected` - selected node fill
- `graphVisualTokens.nodeColor.hover` - hover node fill (can be overridden by hoverNodeColor)
- `graphVisualTokens.nodeColor.relationshipEndpoint` - edge endpoint node fill
- `graphVisualTokens.nodeColor.secondary` - secondary neighbor node fill
- `graphVisualTokens.nodeColor.tertiary` - tertiary neighbor node fill
- `graphVisualTokens.edgeColor.default` - default edge stroke
- `graphVisualTokens.edgeColor.selected` - selected edge stroke
- `graphVisualTokens.edgeColor.secondary` - secondary edge stroke
- `graphVisualTokens.edgeColor.tertiary` - tertiary edge stroke
- `graphVisualTokens.nodeSizeMultiplier.*` - node size multipliers
- `graphVisualTokens.edgeSize.*` - edge stroke widths

## Graph Label Policy Bindings

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx` (label policy effect)

```typescript
// Label policy effect
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  const graph = sigma.getGraph();

  const selectionContext: SelectionContext = {
    selectedNodeId,
    selectedEdgeId,
    nodeSelectionStage,
    hoveredNodeId,
  };

  const labelOptions: LegacyLabelPolicyOptions = {
    maxEdgeLabelLength,  // from prop (labels.maxEdgeLabelLength)
    showLabelsOnHover,   // from prop (labels.showLabelsOnHover)
    hoverLabelColor: "#0f172a",  // Not used in v0, kept for API compatibility
  };

  applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
  applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);

  sigma.refresh();
}, [selectedNodeId, selectedEdgeId, nodeSelectionStage, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, hoveredNodeId]);
```

**File:** `src/graph/visual/applyGraphLabelPolicyToGraphology.ts`

```typescript
export function applyNodeLabelPolicy(
  graph: Graph,
  selectionContext: SelectionContext,
  options: LegacyLabelPolicyOptions,
  mode: NodeLabelMode
): void {
  const { showLabelsOnHover } = options;
  const { selectedNodeId, selectedEdgeId, hoveredNodeId, neighborhoodDepth } = selectionContext;

  // Initialize all labels as empty (hidden)
  graph.forEachNode((nodeId) => {
    graph.setNodeAttribute(nodeId, "label", "");
  });

  // Hover labels
  if (showLabelsOnHover && hoveredNodeId) {
    graph.setNodeAttribute(hoveredNodeId, "label", getStoredLabel(attrs));
  }

  // Mode-based visibility
  if (mode === "off") return;
  if (mode === "all") show all labels;
  if (mode === "important-only") show high-degree node labels;
  if (mode === "selected-neighborhood") show selected/neighborhood labels based on depth;
}
```

**Settings Used:**
- `nodeLabelMode` - controls label visibility mode
- `edgeLabelMode` - controls edge label visibility mode
- `maxEdgeLabelLength` - truncates edge labels
- `showLabelsOnHover` - enables hover labels

## Summary of Bindings

### Settings with Live Update
- `labels.edgeLabelFontSize` → `sigma.setSetting("edgeLabelSize", value)` → immediate refresh
- `labels.nodeLabelFontSize` → `sigma.setSetting("labelSize", value)` → immediate refresh

### Settings with Policy-Based Update
- `labels.nodeLabelMode` → applyNodeLabelPolicy → sigma.refresh()
- `labels.edgeLabelMode` → applyEdgeLabelPolicy → sigma.refresh()
- `labels.maxEdgeLabelLength` → applyEdgeLabelPolicy (truncation) → sigma.refresh()
- `labels.showLabelsOnHover` → applyNodeLabelPolicy (hover logic) → sigma.refresh()
- `graphView.nodeSelectionStage` → applyGraphStylePolicy + label policies → sigma.refresh()
- `graphView.hoverNodeColor` → applyGraphStylePolicy (hover styles) → sigma.refresh()

### Settings with Graphology Layout Update
- `physics.nodeSize` → buildGraphologyGraph (node size multiplier)
- `physics.linkDistance` → forceAtlas2 layout settings
- `physics.repelForce` → forceAtlas2 layout settings

### Settings Not Bound to Renderer
- `appearance.theme` - used by AppShell UI, not Sigma
- `appearance.glitterEnabled` - used by AppShell UI, not Sigma
- `appearance.reduceMotion` - used by AppShell UI, not Sigma
- `physics.centerForce` - defined but not used
- `physics.communityGravity` - defined but not used
- `physics.curveAmount` - defined but not used
- `physics.animationSoftness` - defined but not used
- `labels.zoomLabelThreshold` - defined but not used
- `labels.hoverLabelColor` - defined but not used
- `graphView.hoverLabelColor` - duplicate, not used
- `graphView.selectedNodeColor` - defined but not used (uses token)
- `graphView.defaultNodeColor` - defined but not used (uses token)
- `graphView.selectedEdgeColor` - defined but not used (uses token)
- All evidence, sourceLinking, performance, developer settings - not used
