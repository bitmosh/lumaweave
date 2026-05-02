# Visual Tokens vs Graph Visual Types

## Visual Tokens

Visual tokens answer:

```txt
What should this thing look like?
```

Examples:

- node default fill
- node selected fill
- node hover fill
- edge default stroke
- edge selected stroke
- node label default text color
- node label hover text color
- edge label font size
- node size multiplier
- edge size multiplier

Typical file:

```txt
src/graph/visual/graphVisualTokens.ts
```

## Graph Visual Types

Graph visual types answer:

```txt
What states, modes, and decisions are allowed?
```

Examples:

```ts
NeighborhoodDepth = 1 | 2 | 3

GraphInteractionState {
  selectedNodeId
  selectedEdgeId
  hoveredNodeId
  neighborhoodDepth
  nodeLabelMode
  edgeLabelMode
}
```

Typical file:

```txt
src/graph/visual/graphVisualTypes.ts
```

## How They Work Together

```txt
settings / selection state
        ↓
graphVisualTypes define allowed state shape
        ↓
graphStylePolicy / graphLabelPolicy make decisions
        ↓
graphVisualTokens provide actual visual values
        ↓
SigmaGraphView applies decisions to Graphology/Sigma
```

## Separation Rule

Tokens should remain mostly plain data.

Types define contracts.

Policies connect them.

Renderer applies them.
