# LumaWeave Visual Language

## Overview

LumaWeave visual language is defined through reusable CSS primitives called **visual handles**. These handles provide consistent styling across the application while maintaining flexibility for theme customization.

## Visual Handle Categories

### Shell / Atmosphere
- `lw-ambient-shell` - Background atmosphere effects (scaffold-only, parked)
- `lw-panel-aurora` - Panel aurora effects (scaffold-only, parked)
- `lw-graph-frame` - Graph viewport frame (scaffold-only, not applied to Sigma renderer)

### Containers
- `lw-panel` - Primary panel container with border, background, and backdrop blur
- `lw-card` - Card container for content sections with lighter background

### Controls
- `lw-button` - Base button style with hover/active states
- `lw-button-active` - Active button state
- `lw-control-grid` - 2-column grid for control layouts

### Metadata / Status
- `lw-badge` - Status/version badge with accent color
- `lw-divider` - Horizontal divider line

### Graph Effects
- `lw-node-glow` - Node glow effect (scaffold-only, not wired to Sigma renderer)
- `lw-edge-glow` - Edge glow effect (scaffold-only, not wired to Sigma renderer)

## Theme Variable Bridge

Visual handles use CSS variables for theme integration:

```css
:root {
  --lw-visual-accent: rgba(34, 211, 238, 0.9);
  --lw-visual-accent-soft: rgba(34, 211, 238, 0.22);
  --lw-visual-panel-bg: rgba(15, 23, 42, 0.72);
  --lw-visual-panel-border: rgba(148, 163, 184, 0.24);
  --lw-visual-card-bg: rgba(15, 23, 42, 0.48);
  --lw-visual-card-border: rgba(148, 163, 184, 0.18);
  --lw-visual-badge-bg: rgba(34, 211, 238, 0.15);
  --lw-visual-badge-text: rgba(34, 211, 238, 0.95);
  --lw-visual-divider-color: rgba(148, 163, 184, 0.16);
  --lw-visual-button-bg: rgba(34, 211, 238, 0.12);
  --lw-visual-button-border: rgba(34, 211, 238, 0.3);
  --lw-visual-button-text: rgba(241, 245, 249, 0.95);
  --lw-visual-button-hover-bg: rgba(34, 211, 238, 0.2);
  --lw-visual-button-active-bg: rgba(34, 211, 238, 0.28);
  --lw-visual-graph-frame-bg: rgba(2, 6, 23, 0.5);
  --lw-visual-graph-frame-border: rgba(34, 211, 238, 0.15);
  --lw-visual-glow-color: rgba(34, 211, 238, 0.4);
  --lw-visual-glow-spread: 8px;
}
```

## Design Principles

### 1. Visual Handles are Not Active Controls
Visual handles are CSS primitives, not interactive components. They provide styling but no behavior.

### 2. Theme Integration
Visual handles use CSS variables that align with the theme system. Theme runtime variables can override these defaults.

### 3. Reduced Motion Support
All animated effects respect `prefers-reduced-motion` media queries.

### 4. Layout Safety
Visual handles use `pointer-events: none` for decorative pseudo-elements to avoid interference with interactions.

### 5. Backdrop Blur
Panel and card handles use backdrop blur for glassmorphism effects where supported.

## Current Application Status

### Applied in v16
- `lw-panel` - QA panel wrapper
- `lw-control-grid` - Mission Control tab grid
- `lw-badge` - Version and decision badges in QA panel
- `lw-card` - Advisory question cards
- `lw-card` - Advisory proposal cards
- `lw-card` - Backlog items
- `lw-divider` - Debug section divider
- `lw-divider` - Advisory section divider

### Scaffold-Only (Not Applied)
- `lw-ambient-shell` - Ambient shell effects parked
- `lw-panel-aurora` - Aurora effects parked
- `lw-graph-frame` - Not applied to Sigma renderer (layout risk)
- `lw-node-glow` - Not wired to Sigma renderer
- `lw-edge-glow` - Not wired to Sigma renderer

### Not Yet Applied
- `lw-button` / `lw-button-active` - Buttons use existing Tailwind classes
- `lw-button` - Could be applied to control buttons in future

## Future Directions

### Graph Renderer Integration
- `lw-node-glow` and `lw-edge-glow` will be wired to Sigma renderer in future phases
- `lw-graph-frame` may be applied to graph viewport after layout safety verification

### Ambient Effects
- `lw-ambient-shell` and `lw-panel-aurora` will be implemented when glitter system is mature

### Control Standardization
- `lw-button` handles will replace ad-hoc Tailwind button classes in future phases

## File Location

Visual handle CSS: `src/styles/lumaweave-visual-handles.css`
Imported from: `src/App.css`
