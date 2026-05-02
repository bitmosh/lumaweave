# Cockpit Layout Overview

## Overview

The cockpit layout defines the structure of the LumaWeave application interface, organizing panels and controls into logical zones for efficient graph exploration and analysis.

## Current Implementation

The current AppShell (`src/app/AppShell.tsx`) has:
- Left panel: Settings panel, QA panel
- Right panel: Inspector panel
- Center: SigmaGraphView
- CollapsiblePanel component exists
- No documented layout zones
- No top bar theme controls
- No layout preset system

## Intended Layout

```
+-----------------------------------------------------------+
| Top Bar                                                  |
| [LumaWeave] [Project] [Theme ▼] [Layout ▼] [Renderer ▼] |
+-----------------------------------------------------------+
| Left Rail | Main Viewport | Right Rail                 |
|-----------|---------------|----------------------------|
| Sources   |               | Control Plane             |
| QA/Mission|   Graph       | Inspector                  |
| Actions   |               | Renderer Debug             |
|-----------|---------------|----------------------------|
```

## Layout Zones

### Top Bar
- LumaWeave Observatory title
- Active project selector
- Theme preset dropdown
- Layout preset dropdown
- Renderer selector
- Future save/export/import controls

### Left Rail
- Graph Sources
- QA / Mission Control / future Agent Chat
- Project/session actions

### Right Rail
- Control Plane settings
- Inspector
- Renderer Debug

### Main Viewport
- Graph renderer
- Overlays
- Future floating labels/tooltips

## Layout Presets

### Default
- Left rail: 250px
- Right rail: 300px
- Both rails visible

### Focus Mode
- Left rail: collapsed
- Right rail: collapsed
- Full-screen graph

### Debug Mode
- Left rail: 300px
- Right rail: 400px
- Both rails expanded

### Inspector Mode
- Left rail: collapsed
- Right rail: 400px
- Focus on inspection

### QA Mode
- Left rail: 300px
- Right rail: collapsed
- Focus on QA

## Future Features

### Resizable Panels
- Drag handle between rails and viewport
- Resize left rail
- Resize right rail
- Minimum/maximum width constraints
- Persist panel sizes

### Draggable Panels
- Drag panels to different zones
- Drag panels to floating
- Drag panels to dock
- Panel snap zones

### Floating Panels
- Detach panels from rails
- Float over viewport
- Re-dock to rails
- Minimize/restore

## Responsive Behavior

### Desktop (>= 1200px)
- Full layout
- Both rails visible
- All controls visible

### Tablet (768px - 1199px)
- Left rail collapsible
- Right rail collapsible
- Some controls in overflow menu

### Mobile (< 768px)
- Left rail hidden by default
- Right rail hidden by default
- Most controls in overflow menu
- Drawer for panels

## Panel States

### Expanded
- Panel fully visible
- Full content accessible

### Collapsed
- Panel collapsed to icon bar
- Content hidden
- Quick expand on hover/click

### Hidden
- Panel completely hidden
- No icon bar
- Toggle button to show

### Floating
- Panel detached from rail
- Floating over viewport
- Draggable

## Layout Persistence

### Local Storage
- Panel states (expanded/collapsed/hidden)
- Panel sizes (resizable panels)
- Panel positions (draggable panels)
- Active layout preset

### User Preferences
- Remember last layout state
- Remember panel sizes
- Remember panel positions
- Remember active preset

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Do not implement resizable/draggable panels yet
- Do not implement floating panels yet
