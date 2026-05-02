# Parallel Structure Policy

## Purpose

LumaWeave has many paired systems where two things are mechanically similar but rendered or named differently.

Examples:

- node hover and edge hover
- node labels and edge labels
- node selection depth and edge selection depth
- node font size and edge font size
- node important-only mode and edge important-only mode
- selected-neighborhood behavior for nodes and edges

This policy prevents those systems from drifting apart.

## Core Rule

```txt
If two systems are mechanically equivalent, their code structure should mirror each other.
```

Do not invent a totally separate implementation path for edge behavior if node behavior already has a stable pattern, or vice versa.

## Required Pattern

For every mirrored behavior, identify:

1. state
2. event/input
3. policy decision
4. visual token
5. renderer application
6. debug visibility
7. QA coverage
8. regression contract

Example:

```txt
Node hover:
- hoveredNodeId state
- enterNode / leaveNode events
- graphStylePolicy hover overlay
- node hover token
- Graphology node attrs
- Hovered Node debug row
- QA hover regression check

Edge hover should mirror:
- hoveredEdgeId state
- enterEdge / leaveEdge events
- graphStylePolicy hover overlay
- edge hover token
- Graphology edge attrs
- Hovered Edge debug row
- QA hover regression check
```

## Node/Edge Label Mirroring

Node label flow and edge label flow should use the same conceptual pipeline:

```txt
1. reset labels
2. compute visible IDs
3. restore labels from fullLabel/originalLabel
4. apply truncation/color/size if supported
5. refresh renderer
```

Node labels target node attributes.

Edge labels target edge attributes.

The mechanics should remain parallel.

## Selection Depth Mirroring

Neighborhood Depth must be a shared concept.

Node-selected depth and edge-selected depth may start from different roots, but they must use comparable expansion concepts.

### Node Selection

```txt
Depth 1:
- selected/root node

Depth 2:
- selected/root node
- primary edges
- secondary/direct neighbor nodes

Depth 3:
- selected/root node
- primary edges
- secondary/direct neighbor nodes
- secondary edges
- tertiary nodes
```

### Edge Selection

```txt
Depth 1:
- selected edge
- source/target nodes

Depth 2:
- selected edge
- source/target nodes
- secondary edges
- secondary nodes

Depth 3:
- selected edge
- source/target nodes
- secondary edges
- secondary nodes
- tertiary edges/nodes
```

## Important-Only Mirroring

If important-only exists for nodes, edge important-only should clearly define how it relates.

For example:

```txt
Important nodes:
- nodes selected by explicit importance data, or
- fallback heuristic such as degree/top-N

Important edges:
- edges incident to important nodes, or
- edges with explicit importance score, or
- fallback relationship heuristic
```

Do not leave one mode fully implemented and the mirrored mode empty without documenting it as planned or partial.

## Debug Row Mirroring

If one side has a debug row, the mirrored side should usually have one too.

Examples:

```txt
Hovered Node → Hovered Edge
Selected Node → Selected Edge
Node Label Font Size → Edge Label Font Size
```

## QA Mirroring

Every mirrored feature needs mirrored QA coverage.

Example checklist pair:

```txt
node-hover-regression
edge-hover-regression

node-label-mode-regression
edge-label-mode-regression

node-depth-regression
edge-depth-regression
```

## Stop Conditions

Stop and ask before continuing if:

1. the mirrored system lacks equivalent source data
2. implementing parity would require major renderer changes
3. behavior is not actually mechanically equivalent
4. the existing implementation is unstable or not accepted
5. adding parity would break accepted baseline behavior

## Bandit Report Requirements

When working on a mirrored behavior, report:

1. the source behavior being mirrored
2. the target behavior being implemented
3. files inspected
4. differences that are intentional
5. differences that are temporary/planned
6. validation results
7. QA checklist coverage
