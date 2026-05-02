# Handleset Index v0

## Overview

This document provides an overview and index of all configurable LumaWeave settings, visual tokens, physics controls, theme handles, and renderer bindings.

## Control Surface Contract Registry

A machine-readable control surface contract registry is available at:
- `src/control-plane/contracts/controlSurfaceContract.registry.ts`

This registry contains all active controls with their runtime bindings, QA references, and Playwright coverage. The contract registry does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The contract registry is a machine-readable documentation/scaffold layer for contract validation.

## Legacy Handleset Scaffold

A machine-readable handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry is being phased out in favor of the control surface contract registry. It contains handleset-specific metadata but does not yet drive UI.

## Status Legend

- **active** - Fully wired and tested
- **partial** - Defined but not fully wired or behavior uncertain
- **planned** - Defined in schema/registry but not yet wired
- **internal** - Used internally, not user-configurable
- **experimental**: Handle in early development, unstable

## Documentation Files

- [01_ACTIVE_HANDLES.md](./01_ACTIVE_HANDLES.md) - Handles that visibly affect runtime behavior
- [02_PARTIAL_HANDLES.md](./02_PARTIAL_HANDLES.md) - Handles that are partially wired or uncertain
- [03_PLANNED_HANDLES.md](./03_PLANNED_HANDLES.md) - Handles marked as future work
- [04_BACKEND_FRONTEND_WIRING.md](./04_BACKEND_FRONTEND_WIRING.md) - Data flow from schema to renderer
- [05_RENDERER_BINDINGS.md](./05_RENDERER_BINDINGS.md) - How settings bind to Sigma/graphology
- [06_HANDLES_REQUIRING_QA.md](./06_HANDLES_REQUIRING_QA.md) - Handles missing QA coverage
- [07_THEME_AND_MISSION_CONTROL_HANDLES.md](./07_THEME_AND_MISSION_CONTROL_HANDLES.md) - Theme and Mission Control planned handles

**Important:** The contract registry does not yet drive UI. SettingsPanel still uses `settings.registry.ts`. The contract registry is a machine-readable documentation/scaffold layer for contract validation. No active control should be added without a contract entry.

## Audit Summary

**Total Handles Found:** 39
- **Active:** 15
- **Partial:** 1 (labels.zoomLabelThreshold - now hidden from UI)
- **Planned:** 19 (all hidden from UI until wired)
- **Internal (visual tokens):** 8
- **Internal (state):** 2 (hoveredNodeId, hoveredEdgeId)

**Categories:**
- Appearance: 4 (3 active, 1 internal)
- Physics: 6 (3 active, 3 planned - now hidden)
- Labels: 8 (7 active, 1 planned - now hidden)
- Graph View: 11 (3 active, 5 planned - now hidden, 1 internal state, 2 planned features)
- Evidence: 4 (0 active, 4 planned - not in registry)
- Source Linking: 3 (0 active, 3 planned - not in registry)
- Performance: 4 (0 active, 4 planned - not in registry)
- Developer: 3 (0 active, 3 planned - not in registry)
- Visual Tokens: 8 (all internal)
- Internal State: 2 (hoveredNodeId, hoveredEdgeId)

**Fixes Applied:**
- Removed duplicate hoverLabelColor from graphView category
- Hid all planned settings from settings.registry.ts until wired to renderer
- Added Playwright test for labels.maxEdgeLabelLength
- Added QA checklist for graphView.hoverNodeColor
- v6: Updated important-only edge label mode implementation (degree-based heuristic)
- v6: Updated selected-neighborhood idle behavior (now behaves like off)
- v7: Theme System Phase 1A - theme and glitter controls moved to top bar, removed from Control Plane settings registry

**Edge Hover Parity v0:**
- Added hoveredEdgeId internal state to SigmaGraphView
- Added Sigma enterEdge/leaveEdge event handlers
- Added edgeColorTokens.hovered (#d8b4fe) and edgeSizeTokens.hovered (4)
- Wired edge hover into graphStylePolicy
- Edge hover label behavior deferred as PLAN NEXT to avoid breaking edge label modes
- QA checklist v4 activated with 10 edge hover regression checks

**Label Semantics Consolidation v6:**
- Node Label Mode selected-neighborhood now behaves like off when idle
- Edge Label Mode important-only now shows labels for edges incident to important nodes (degree-based heuristic: degree >= 3 OR top 20 by degree)
- QA checklist v6 activated with 20 checks

## Quick Reference

| Handle Path | Status | Category | UI Control |
|------------|--------|----------|------------|
| appearance.theme | active | Appearance | select (top bar) |
| appearance.glitterEnabled | active | Appearance | boolean (top bar) |
| appearance.reduceMotion | active | Appearance | boolean (top bar) |
| physics.nodeSize | active | Physics | range |
| physics.linkDistance | active | Physics | range |
| physics.repelForce | active | Physics | range |
| labels.nodeLabelMode | active | Labels | select |
| labels.edgeLabelMode | active | Labels | select |
| labels.maxEdgeLabelLength | active | Labels | range |
| labels.showLabelsOnHover | active | Labels | boolean |
| labels.edgeLabelFontSize | active | Labels | range |
| labels.nodeLabelFontSize | active | Labels | range |
| graphView.nodeSelectionStage | active | Graph View | select |
| graphView.hoverNodeColor | active | Graph View | text |

See individual documentation files for complete details.
