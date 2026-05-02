# Recommended Handleset Architecture

## Layered Model

```txt
1. Design Tokens
2. Semantic Graph Tokens
3. Settings Handles
4. Policy Inputs
5. Renderer Bindings
6. QA/Test Coverage Map
```

## 1. Design Tokens

Raw paint buckets:

```ts
colors: {
  cyan400: "#22d3ee",
  amber400: "#fbbf24",
  slate100: "#f1f5f9",
  slate900: "#0f172a",
}
```

## 2. Semantic Graph Tokens

Meaningful graph-specific values:

```ts
graph: {
  node: {
    fill: {
      default: colors.cyan400,
      selected: colors.amber400,
      hovered: colors.amber400,
      secondary: "#3b82f6",
      tertiary: "#8b5cf6",
    },
  },
  edge: {
    stroke: {
      default: "#64748b",
      selected: "#a855f7",
      secondary: "#c4b5fd",
      tertiary: "#ddd6fe",
    },
  },
  label: {
    node: {
      defaultText: colors.slate100,
      hoverText: colors.slate900,
      fontSize: 13,
    },
    edge: {
      defaultText: "#cbd5e1",
      fontSize: 13,
    },
  },
}
```

## 3. Settings Handles

User-facing configurable paths:

```txt
labels.nodeLabelFontSize
labels.edgeLabelFontSize
graphView.hoverNodeColor
graphView.selectedNodeColor
physics.linkDistance
appearance.theme
```

## 4. Policy Inputs

State/mode values that drive visual decisions:

```txt
selectedNodeId
selectedEdgeId
hoveredNodeId
neighborhoodDepth
nodeLabelMode
edgeLabelMode
showLabelsOnHover
```

## 5. Renderer Bindings

Mapping from handles/tokens to runtime APIs:

```txt
labels.edgeLabelFontSize
→ Sigma setting: edgeLabelSize
→ update method: sigma.setSetting("edgeLabelSize", value)

labels.nodeLabelFontSize
→ Sigma setting: labelSize
→ update method: sigma.setSetting("labelSize", value)

graphView.hoverNodeColor
→ Graphology node attr: color
→ applied in graphStylePolicy
```

## 6. QA/Test Coverage Map

Each handle should eventually know how it is verified:

```txt
labels.edgeLabelFontSize
QA checklist: baseline-b-consolidation-followup-v3
Playwright: settings-label-controls.spec.ts
Manual QA: visual edge label size check
```
