---
id: layout.cockpit.overview
title: Cockpit Layout Overview
type: manual
status: accepted
version: v73c
domain: layout
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/app/AppShell.tsx
  - src/control-plane/panels/DockLayout.tsx
tags: [layout, cockpit, overview, rails, viewport, topbar, accepted]
---

# Cockpit Layout Overview

---

## Current AppShell Implementation

```
src/app/AppShell.tsx

Current structure:
  Left panel:   Settings panel, QA panel
  Right panel:  Inspector panel
  Center:       SigmaGraphView
  Top:          Title, theme selector, glitter toggle, reduce motion toggle
  No documented layout zones
  No layout preset system
  CollapsiblePanel component exists (src/control-plane/panels/CollapsiblePanel.tsx)
```

---

## Intended Layout Model

```
+------------------------------------------------------------------+
| Top Bar                                                          |
| [LumaWeave] [Project] [Theme ▼] [Layout ▼] [Renderer ▼] [Lens] |
+------------------------------------------------------------------+
| Left Rail    | Main Viewport              | Right Rail          |
|--------------|----------------------------|---------------------|
| Sources      |                            | Control Plane       |
| QA/Mission   |   Graph Renderer           | Inspector           |
| Actions      |   (Sigma / 3D / Flat)      | Renderer Debug      |
|              |                            |                     |
|              |   Physics overlay          |                     |
|              |   Ghost overlay layer      |                     |
|--------------|----------------------------|---------------------|
```

This is the target architecture. Current AppShell is an earlier approximation.

---

## Layout Zones

### Top Bar
```
LumaWeave title + Observatory branding
Active project selector (future)
Theme preset dropdown (IMPLEMENTED)
Layout preset dropdown (planned)
Renderer selector (planned — 2D / 3D / Flat)
Lens selector (planned — Overview / Atlas / Evidence / Signal / Workshop / Mission)
Future: save / export / import controls
```

### Left Rail (default: 250px)
```
Graph Sources (partial)
QA / Mission Control (IMPLEMENTED — QaPanel)
Project/session actions (planned)
```

### Right Rail (default: 300px)
```
Control Plane settings (IMPLEMENTED — SettingsPanel)
Inspector — selected node/edge details (IMPLEMENTED — InspectorPanel)
Renderer Debug (planned)
```

### Main Viewport
```
Graph renderer — Sigma 2D (IMPLEMENTED — SigmaGraphView)
Physics overlay layer (planned)
Ghost overlay layer (partial — ThemeTargetInspectorOverlay)
Floating labels/tooltips (planned)
```

---

## Layout Presets

```
Default       Left 250px, right 300px, both visible
Focus Mode    Left collapsed, right collapsed — full-screen graph
Debug Mode    Left 300px, right 400px, both expanded
Inspector     Left collapsed, right 400px — focus on inspection
QA Mode       Left 300px, right collapsed — focus on QA
```

---

## Tile Workspace (New Architecture)

The Tile Workspace System supersedes the fixed rail model. See:
```
docs/layout/TILE_WORKSPACE_SYSTEM.md
docs/layout/LENS_NAVIGATION_MODEL.md
```

The current AppShell is Phase 1 (fixed layout). The tile workspace is Phase 5+.
Current implementation is correct and stable — do not migrate to tiles without explicit contract.

---

## Implementation Guardrails

- Do not implement resizable/draggable panels without explicit layout contract
- Do not implement floating panels without explicit contract
- Do not add persistence for panel sizes without a storage contract
- Collapsible panels (Phase 2) are the next safe step after v69r
