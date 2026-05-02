# Graph Visual Policy v0

## Overview

This document describes the Graph Visual Policy v0 system for LumaWeave, which standardizes label visibility and styling logic for graph rendering.

## Graph State Preservation

**Goal:** Settings changes should not reset graph visual/interaction state.

When users change settings (node size, link distance, repel force), the graph should preserve:
- Selected node/edge styling (color, size)
- Selected neighborhood visual state
- Camera position and zoom
- Label mode settings
- Theme styling

**Implementation:**
- Theme colors and label policy are applied before Sigma initialization (in main rebuild effect)
- Selection styling policy is also applied before Sigma initialization (v16c fix)
- This eliminates timing gaps where graph renders without proper styling
- Camera is preserved via `hasInitialCameraResetRef` (only reset once on initial load)

**Root Cause (Fixed in v16c):**
- Sigma instance recreation on slider changes caused visual state reset
- Selection styling was applied in separate useEffect after Sigma render
- This created a timing gap where graph rendered without selection styling

**Fix:**
- Apply `applyGraphStylePolicy()` immediately after `buildGraphologyGraph()` but before Sigma initialization
- This ensures selection styling is present when Sigma first renders the graph
- Visual state now persists during slider changes without requiring hover to restore

## Core Contract

**Tokens define values.**
**Policies define decisions.**
**Renderer applies decisions.**
**Settings modify tokens/policy inputs.**
**QA verifies behavior.**

## Token Model

Tokens are centralized visual value definitions in `src/graph/visual/graphVisualTokens.ts`:

### Node Fill Colors
- `default`: "#22d3ee" - Default node fill
- `selected`: "#fbbf24" - Selected node fill
- `hover`: "#ffffff" - Hovered node fill (override from settings)
- `relationshipEndpoint`: "#2563eb" - Edge endpoint node fill
- `secondary`: "#3b82f6" - Secondary neighbor node fill
- `tertiary`: "#60a5fa" - Tertiary neighbor node fill

### Edge Stroke Colors
- `default`: "#64748b" - Default edge stroke
- `selected`: "#a855f7" - Selected/primary edge stroke
- `secondary`: "#c4b5fd" - Secondary edge stroke
- `tertiary`: "#ddd6fe" - Tertiary edge stroke

### Label Text Colors
- Node labels: `default` (#f1f5f9), `hover` (#0f172a), `selected` (#f1f5f9)
- Edge labels: `default` (#94a3b8), `selected` (#cbd5e1)

### Label Font Sizes
- Node: 13px (configurable via settings, maps to Sigma `labelSize`)
- Edge: 13px (configurable via settings, maps to Sigma `edgeLabelSize`)

### Node Size Multipliers
- Default: 1.0
- Selected: 1.6
- Relationship endpoint: 1.6
- Secondary: 1.3
- Tertiary: 1.2

### Edge Size Values
- Default: 3
- Selected: 6
- Secondary: 4
- Tertiary: 3

## State Model

Interaction state is defined in `src/graph/visual/graphVisualTypes.ts`:

```typescript
interface GraphInteractionState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null; // Planned, not implemented in v0
  neighborhoodDepth: 1 | 2 | 3;
}
```

## Depth Model

Neighborhood depth controls how much context appears when selecting a node or edge:

- **Depth 1**: Selected node/edge only
- **Depth 2**: Selected + direct neighbors/connected edges
- **Depth 3**: Selected + direct + secondary neighbors/edges

## Label Visibility Rules

Defined in `src/graph/visual/graphLabelPolicy.ts`:

### Node Label Modes
- `off`: Hide all node labels
- `selected-neighborhood`: Show labels based on selection and depth
- `important-only`: Show labels for high-degree nodes
- `all`: Show all node labels

### Edge Label Modes
- `off`: Hide all edge labels
- `selected-neighborhood`: Show labels based on selection and depth
- `important-only`: Show labels for edges incident to important nodes (refined v0 heuristic: top 20 by degree for larger graphs, degree >= 3 for small graphs)
- `all-short`: Show all edge labels truncated to maxEdgeLabelLength
- `all-medium`: Show all edge labels truncated to maxEdgeLabelLength * 2

### Rules
1. Node and edge label behavior must both use the same Neighborhood Depth.
2. Node Label Mode and Edge Label Mode should not invent independent depth logic.
3. `selected-neighborhood` means "follow Neighborhood Depth."
4. Hover can temporarily show labels, but selected labels should persist without hover.
5. `all-short`/`all-medium` should still work for edges.
6. `off` should hide labels except explicit hover if Show Labels On Hover is enabled.
7. Edge hover labels now have parity with node hover labels (when Show Labels On Hover is enabled, hovering an edge shows its label temporarily).

## Selected vs Hover Rules

Defined in `src/graph/visual/graphStylePolicy.ts`:

### Required Order
1. Default styles (reset all to default)
2. Selected/neighborhood styles (apply based on selection and depth)
3. Hover overlay styles (temporary, does not erase selection)

### Behavior
- Selection must persist.
- Hover must be temporary.
- Hover must not erase selection.
- Background click clears selected state.

## Active vs Planned Controls

### Active Controls
- Node Label Mode
- Edge Label Mode
- Max Edge Label Length
- Show Labels On Hover
- Edge Label Font Size
- Node Label Font Size (maps to Sigma `labelSize`, live update via `sigma.setSetting`)
- Neighborhood Depth
- Hover Node Color (if runtime-wired)

### Planned Controls
- Zoom Label Threshold
- Hover Label Color (not wired to Sigma per-node label color)
- Node Label Color (token defined, UI not wired)
- Edge Label Color (token defined, UI not wired)
- Default Node Color (token defined, UI not wired)
- Selected Node Color (token defined, UI not wired)
- Selected Edge Color (token defined, UI not wired)
- Edge hover (planned parity work)
- Center Force
- Community Gravity
- Edge Curve
- Animation Softness

## Known Sigma Limitations

### Label Color
- Sigma supports attribute-based label color via `{ attribute: "labelColor", color: "#f1f5f9" }`
- Per-node label color works for stateful hover (dark on white hover background)
- Per-edge label color is global-only for v0
- Hover label color control is not wired to Sigma's per-node attribute system

### Edge Hover
- Edge hover is not implemented in v0
- `hoveredEdgeId` exists in type model for future-proofing
- Edge hover parity is planned for follow-up

## Future Theme Customization Plan

Once the policy system is fully wired (Part F), a full theme customization menu can:

1. Edit tokens instead of reaching into SigmaGraphView directly
2. Provide a unified UI for color customization
3. Support theme presets
4. Enable user-defined themes

The policy system provides the contract: the theme editor modifies tokens, policies read tokens, renderer applies decisions.

## Deferred Work

### Part F: Wire SigmaGraphView to Policies (v0.1 Progress)

**Status**: Partially completed

**Completed in v0.1:**
- Slice 1: Token imports only - Replaced hardcoded values with graphVisualTokens references in:
  - `selectionColors.ts` - Now re-exports from graphVisualTokens
  - `SigmaGraphView.tsx` - Sigma config uses graphVisualTokens for colors, sizes, fonts
  - `SigmaGraphView.tsx` - Hover label color uses graphVisualTokens.nodeLabelColor.hover
  - `SigmaGraphView.tsx` - Default edge size uses graphVisualTokens.edgeSize.default

- Slice 3: Style policy wiring - Replaced helper functions with policy call:
  - Removed `resetGraphStyles()` helper (replaced by policy)
  - Removed `applySelectedEdgeStyles()` helper (replaced by policy)
  - Removed `applySelectedNodeStyles()` helper (replaced by policy)
  - Wired `applyGraphStylePolicy()` from graphStylePolicy.ts
  - Removed unused `selectionColors` import from SigmaGraphView
  - Removed unused `hoverLabelColor` prop from SigmaGraphView and AppShell

**Stopped in v0.1:**
- Slice 2: Label policy wiring - STOPPED due to API difference
  - Old labelPolicy functions mutate graph directly
  - New graphLabelPolicy functions return Maps instead of mutating
  - Would require adapter to convert Map to graph.setNodeAttribute/setEdgeAttribute
  - Current labelPolicy already works, less urgent to replace
  - Deferred to follow-up session when API alignment can be addressed

**Validation Results:**
- Typecheck: PASSED
- Playwright E2E: PASSED (7 tests)

## Files Created

- `src/graph/visual/graphVisualTokens.ts` - Token definitions
- `src/graph/visual/graphVisualTypes.ts` - Type definitions
- `src/graph/visual/graphLabelPolicy.ts` - Label visibility policy
- `src/graph/visual/graphStylePolicy.ts` - Styling policy
- `docs/logs/sessions/graph-visual-policy-audit-table.md` - Audit table

## Files Modified

- `src/control-plane/settings/settings.schema.ts` - Added Planned color fields
- `src/control-plane/settings/settings.defaults.ts` - Added defaults for Planned fields
- `src/control-plane/settings/settings.registry.ts` - Added Planned controls with (Planned) labels

## Validation Status

- Typecheck: PASSED
- Playwright E2E: PASSED (7 tests)

## Next Steps

1. Complete Part F: Wire SigmaGraphView to policies (focused follow-up session)
2. Implement edge hover parity
3. Build full theme customization menu

## Planned: Progressive Neighborhood Depth Slider / Gradient Traversal

**Status:** Later phase - requires stable integer depth first

**Concept:**
A future depth control may use decimal increments, such as 1.0 → 3.0, where the graph progressively reveals deeper node paths and blends colors along a depth gradient.

**Requirements:**
- Stable integer depth (1, 2, 3) must be proven first
- Gradient token system for smooth color transitions
- Likely Theme/Visual phase work
- Not part of Baseline B stabilization

**Implementation notes:**
- Would extend NeighborhoodDepth type from `1 | 2 | 3` to `number` (e.g., 1.0, 1.5, 2.0, 2.5, 3.0)
- Requires updating depth expansion logic to support fractional steps
- Color interpolation between depth tiers (selected → secondary → tertiary)
- Consider performance impact of continuous depth updates
