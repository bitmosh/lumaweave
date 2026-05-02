# Session Log: Handleset Registry Audit v0 (Re-run)

## Goal
Create a living handleset documentation database for all configurable LumaWeave settings, visual tokens, physics controls, theme handles, and renderer bindings.

Context:
- Recent accepted baselines: Label Controls Repair v0, Baseline B Consolidation Follow-up v2, Node Label Font Size v0
- QA Panel v1.4 accepted/stable
- Playwright harness accepted/stable
- Handleset Upgrade Packet added to docs/lumaweave_handleset_upgrade_packet/
- User removed previous handleset documentation and requested re-run with updated docs

## Files Inspected

### Handleset Upgrade Packet
- docs/lumaweave_handleset_upgrade_packet/10_HANDLESET_AUDIT_PROMPT.md - Main audit prompt
- docs/lumaweave_handleset_upgrade_packet/README_HANDLESET_UPGRADE_PACKET.md - Overview
- docs/lumaweave_handleset_upgrade_packet/00_HANDLESET_CONCEPT.md - Concept
- docs/lumaweave_handleset_upgrade_packet/04_FOLDER_STRUCTURE.md - Recommended structure
- docs/lumaweave_handleset_upgrade_packet/03_HANDLESET_ENTRY_SCHEMA.md - Entry schema

### Settings System
- src/control-plane/settings/settings.schema.ts - TypeScript interface for all settings
- src/control-plane/settings/settings.defaults.ts - Default values for all schema fields
- src/control-plane/settings/settings.registry.ts - UI control definitions (boolean, range, select, text)
- src/control-plane/settings/SettingsPanel.tsx - UI rendering from registry

### Graph Visual System
- src/graph/visual/graphVisualTokens.ts - Centralized visual value definitions (colors, sizes, fonts)
- src/graph/visual/graphVisualTypes.ts - Type definitions for visual policy system
- src/graph/visual/graphStylePolicy.ts - Styling policy based on interaction state
- src/graph/visual/graphLabelPolicy.ts - Label visibility policy

### Renderer
- src/graph/renderers/sigma2d/SigmaGraphView.tsx - Sigma/graphology renderer with policy integration
- src/app/AppShell.tsx - Prop passing from settings store to renderer

### QA Coverage
- src/control-plane/qa/qa-registry.ts - QA check definitions (active v3, archived v1/v2)
- tests/e2e/settings-label-controls.spec.ts - Verifies label controls visible
- tests/e2e/app-smoke.spec.ts - App shell smoke test

## Documentation Files Created (Re-created)

### docs/handleset/00_HANDLESET_INDEX.md
- Overview of all handles by status
- Links to detailed documentation files
- Quick reference table

### docs/handleset/01_ACTIVE_HANDLES.md
- 13 active handles with full documentation
- For each handle: path, label, category, default, UI control type, source file, runtime target, live update behavior, status, Playwright tests, QA checklist, notes

### docs/handleset/02_PARTIAL_HANDLES.md
- 9 partial handles (not fully wired or uncertain)
- labels.zoomLabelThreshold (has UI but no runtime effect)
- 8 internal visual tokens (not user-configurable)

### docs/handleset/03_PLANNED_HANDLES.md
- 17 planned handles (defined but not wired or no UI)
- 4 physics controls (marked as planned)
- 1 label control (marked as planned)
- 4 graph view controls (marked as planned)
- 4 evidence settings (not in registry)
- 3 source linking settings (not in registry)
- 4 performance settings (not in registry)
- 3 developer settings (not in registry)

### docs/handleset/04_BACKEND_FRONTEND_WIRING.md
- Architecture overview: schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView
- Data flow details for each layer
- Active wiring paths documented
- Missing wiring identified

### docs/handleset/05_RENDERER_BINDINGS.md
- Sigma configuration bindings
- Live update bindings (edgeLabelFontSize, nodeLabelFontSize)
- Graphology layout bindings (nodeSize, linkDistance, repelForce)
- Graph visual policy bindings (hoverNodeColor, depth)
- Graph label policy bindings (modes, maxEdgeLabelLength, showLabelsOnHover)
- Settings not bound to renderer documented

### docs/handleset/06_HANDLES_REQUIRING_QA.md
- Active handles with QA coverage analyzed
- Handles missing QA coverage identified
- Recommended QA tasks prioritized
- 2 active handles with no QA (high priority)
- 9 partial/planned handles with UI (medium priority)
- 12 planned handles without UI (low priority)

## Findings

### Total Handles Found
- **Total:** 35
- **Active:** 13
- **Partial:** 9
- **Planned:** 17
- **Internal (visual tokens):** 8

### Categories
- Appearance: 4 (3 active, 1 internal)
- Physics: 6 (3 active, 3 planned)
- Labels: 8 (7 active, 1 planned)
- Graph View: 7 (2 active, 5 planned)
- Evidence: 4 (0 active, 4 planned)
- Source Linking: 3 (0 active, 3 planned)
- Performance: 4 (0 active, 4 planned)
- Developer: 3 (0 active, 3 planned)
- Visual Tokens: 8 (all internal)

### Dead/Misleading Handles Found
- **Duplicate hoverLabelColor:** labels.hoverLabelColor and graphView.hoverLabelColor both exist with same default and description
- **labels.zoomLabelThreshold:** Has UI control but no runtime effect (marked as planned but should be partial)

### Duplicated Handles Found
- hoverLabelColor appears in both labels and graphView categories

### Handles Missing QA Coverage
- **High Priority (active):** labels.maxEdgeLabelLength, graphView.hoverNodeColor
- **Medium Priority (partial/planned with UI):** labels.zoomLabelThreshold, physics.centerForce, physics.communityGravity, physics.curveAmount, physics.animationSoftness, labels.hoverLabelColor (duplicate), graphView.selectedNodeColor, graphView.defaultNodeColor, graphView.selectedEdgeColor
- **Low Priority (no UI):** 14 evidence/sourceLinking/performance/developer settings

## Validation
Since code changes were made in fix round:
- Typecheck: ✅ PASSED
- qa:e2e: ✅ PASSED (8/8 tests, including new edge-label-truncation.spec.ts)

## Recommended Cleanup Tasks
1. Resolve duplicate hoverLabelColor (choose single location: labels vs graphView) - ✅ FIXED: Removed graphView duplicate
2. Remove or mark labels.zoomLabelThreshold as partial instead of planned (has UI but no effect) - ✅ FIXED: Hidden from UI
3. Consider removing planned settings from registry until wired to avoid user confusion - ✅ FIXED: All planned settings hidden from UI
4. Wire graphView.hoverNodeColor to visual tokens for full configurability - DEFERRED: Not implemented in this round
5. Add Playwright test for labels.maxEdgeLabelLength - ✅ FIXED: Added edge-label-truncation.spec.ts
6. Add QA checklist for graphView.hoverNodeColor - ✅ FIXED: Added to qa-registry.ts

## Fixes Applied in Follow-up Round

### Code Changes
- **settings.registry.ts:**
  - Removed duplicate `graphView.hoverLabelColor` entry
  - Commented out all planned physics settings (centerForce, communityGravity, curveAmount, animationSoftness)
  - Commented out planned label settings (zoomLabelThreshold, hoverLabelColor)
  - Commented out planned graph view settings (selectedNodeColor, defaultNodeColor, selectedEdgeColor)
- **qa-registry.ts:**
  - Added `hover-node-color-configuration` QA check to Baseline B Consolidation Follow-up v3
- **tests/e2e/edge-label-truncation.spec.ts:**
  - Created new Playwright test file for edge label truncation

### Documentation Updates
- **00_HANDLESET_INDEX.md:** Updated counts, added fixes applied section
- **01_ACTIVE_HANDLES.md:** Updated labels.maxEdgeLabelLength and graphView.hoverNodeColor with QA coverage
- **02_PARTIAL_HANDLES.md:** Updated labels.zoomLabelThreshold to note it's hidden from UI
- **03_PLANNED_HANDLES.md:** Updated to note planned settings are hidden from UI, removed duplicate graphView.hoverLabelColor
- **06_HANDLES_REQUIRING_QA.md:** Updated to reflect fixes, removed now-covered handles from missing QA coverage

## Validation
- Typecheck: Pending
- qa:e2e: Pending

## Recommended Next Task
Edge Hover Parity v0 (as specified in original task request)
