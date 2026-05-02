# Top Bar Control Plan

## Overview

The top bar contains global controls for project, theme, layout, and renderer selection. It provides quick access to high-level configuration options.

## Top Bar Structure

```
+-----------------------------------------------------------+
| [LumaWeave Observatory] [Project ▼] [Theme ▼] [Layout ▼] [Renderer ▼] [Save] [Export] [Import] |
+-----------------------------------------------------------+
```

## Controls

### LumaWeave Observatory Title
- **Type:** Static text
- **Purpose:** Application branding
- **Location:** Left side
- **Status:** Active

### Active Project Selector
- **Type:** Select dropdown
- **Purpose:** Switch between projects
- **Location:** Left side (after title)
- **Status:** Planned
- **Options:** List of available projects
- **Behavior:** Loads selected project graph

### Theme Preset Dropdown
- **Type:** Select dropdown
- **Purpose:** Switch between theme presets
- **Location:** Right side
- **Status:** Planned
- **Options:** Built-in presets + custom presets
- **Behavior:** Applies selected theme immediately
- **Related:** Theme system

### Layout Preset Dropdown
- **Type:** Select dropdown
- **Purpose:** Switch between layout presets
- **Location:** Right side
- **Status:** Planned
- **Options:** Default, Focus Mode, Debug Mode, Inspector Mode, QA Mode
- **Behavior:** Applies selected layout preset
- **Related:** Layout system

### Renderer Selector
- **Type:** Select dropdown
- **Purpose:** Switch between renderers
- **Location:** Right side
- **Status:** Planned
- **Options:** Sigma 2D, Sigma 3D (future), Custom (future)
- **Behavior:** Switches renderer implementation
- **Related:** Renderer system

### Save Button
- **Type:** Button
- **Purpose:** Save current project state
- **Location:** Right side
- **Status:** Planned
- **Behavior:** Saves project to local storage or file

### Export Button
- **Type:** Button
- **Purpose:** Export project
- **Location:** Right side
- **Status:** Planned
- **Behavior:** Exports project as JSON

### Import Button
- **Type:** Button
- **Purpose:** Import project
- **Location:** Right side
- **Status:** Planned
- **Behavior:** Imports project from JSON file

## Control Groups

### Left Group
- LumaWeave Observatory title
- Active project selector

### Right Group
- Theme preset dropdown
- Layout preset dropdown
- Renderer selector
- Save button
- Export button
- Import button

## Responsive Behavior

### Desktop (>= 1200px)
- All controls visible
- Full labels

### Tablet (768px - 1199px)
- All controls visible
- Shorter labels
- Some controls in overflow menu if needed

### Mobile (< 768px)
- LumaWeave title visible
- Project selector in overflow menu
- Theme selector visible
- Layout selector in overflow menu
- Renderer selector in overflow menu
- Save/Export/Import in overflow menu

## Overflow Menu

### Purpose
- Handle controls that don't fit on smaller screens
- Provide access to all controls on mobile

### Behavior
- Hamburger menu icon
- Opens dropdown with all controls
- Closes on selection

## Keyboard Shortcuts

### Project Selector
- Ctrl+P: Open project selector
- Arrow keys: Navigate projects
- Enter: Select project

### Theme Selector
- Ctrl+T: Open theme selector
- Arrow keys: Navigate themes
- Enter: Select theme

### Layout Selector
- Ctrl+L: Open layout selector
- Arrow keys: Navigate layouts
- Enter: Select layout

### Renderer Selector
- Ctrl+R: Open renderer selector
- Arrow keys: Navigate renderers
- Enter: Select renderer

### Save
- Ctrl+S: Save project

### Export
- Ctrl+E: Export project

### Import
- Ctrl+I: Import project

## Accessibility

### Focus Management
- Tab order: Left to right
- Skip to main content link
- Focus indicators

### Screen Reader Support
- Announce control labels
- Announce current selection
- Announce keyboard shortcuts

### Contrast
- Ensure sufficient contrast for all controls
- Ensure hover states are visible

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Start with theme preset dropdown only
- Add other controls incrementally
