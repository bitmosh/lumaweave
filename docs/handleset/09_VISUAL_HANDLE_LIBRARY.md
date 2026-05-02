# Visual Handle Library v0

## Overview

The LumaWeave Visual Handle Library provides reusable CSS primitives for consistent visual language across the application. These are visual scaffolding handles, not active controls.

## Visual Handles

### lw-ambient-shell
- **Category**: Shell / Atmosphere
- **Purpose**: Background atmosphere effects
- **Intended Use**: Full-page background effects
- **Where Currently Applied**: None (scaffold-only)
- **Where Not to Use**: Interactive containers
- **Motion Behavior**: None (parked)
- **Theme Variables**: None
- **Current Status**: scaffolded
- **Notes**: Ambient shell effects are parked for future glitter system

### lw-panel-aurora
- **Category**: Shell / Atmosphere
- **Purpose**: Panel aurora effects
- **Intended Use**: Decorative panel effects
- **Where Currently Applied**: None (scaffold-only)
- **Where Not to Use**: Interactive containers
- **Motion Behavior**: None (parked)
- **Theme Variables**: None
- **Current Status**: scaffolded
- **Notes**: Aurora effects are parked for future glitter system

### lw-graph-frame
- **Category**: Shell / Atmosphere
- **Purpose**: Graph viewport frame
- **Intended Use**: Graph container wrapper
- **Where Currently Applied**: None (layout risk)
- **Where Not to Use**: Sigma renderer container
- **Motion Behavior**: None
- **Theme Variables**: `--lw-visual-graph-frame-bg`, `--lw-visual-graph-frame-border`
- **Current Status**: scaffolded
- **Notes**: Not applied to Sigma renderer in v16 due to layout safety concerns. May be applied in future after layout verification.

### lw-panel
- **Category**: Containers
- **Purpose**: Primary panel container
- **Intended Use**: Main panel containers with border, background, and backdrop blur
- **Where Currently Applied**: QA panel wrapper
- **Where Not to Use**: Graph renderer container
- **Motion Behavior**: None
- **Theme Variables**: `--lw-panel-bg`, `--lw-panel-border`
- **Current Status**: active
- **Notes**: Uses backdrop blur for glassmorphism effect

### lw-card
- **Category**: Containers
- **Purpose**: Card container for content sections
- **Intended Use**: Content cards with lighter background
- **Where Currently Applied**: Advisory question cards, proposal cards, backlog items
- **Where Not to Use**: Interactive control containers
- **Motion Behavior**: None
- **Theme Variables**: `--lw-card-bg`, `--lw-card-border`
- **Current Status**: active
- **Notes**: Uses lighter background than panels

### lw-button
- **Category**: Controls
- **Purpose**: Base button style
- **Intended Use**: Standard buttons with hover/active states
- **Where Currently Applied**: None (not yet applied)
- **Where Not to Use**: Tab buttons (use existing Tailwind for now)
- **Motion Behavior**: Transition on background/border (respects reduced motion)
- **Theme Variables**: `--lw-visual-button-bg`, `--lw-visual-button-border`, `--lw-visual-button-text`, `--lw-visual-button-hover-bg`, `--lw-visual-button-active-bg`
- **Current Status**: scaffolded
- **Notes**: Not applied in v16. Can replace ad-hoc Tailwind button classes in future phases.

### lw-button-active
- **Category**: Controls
- **Purpose**: Active button state
- **Intended Use**: Active/selected button state
- **Where Currently Applied**: None
- **Where Not to Use**: Non-interactive elements
- **Motion Behavior**: None
- **Theme Variables**: Same as lw-button
- **Current Status**: scaffolded
- **Notes**: Not applied in v16

### lw-control-grid
- **Category**: Controls
- **Purpose**: 2-column grid for control layouts
- **Intended Use**: Tab grids, control button grids
- **Where Currently Applied**: Mission Control tab grid
- **Where Not to Use**: Single-column layouts
- **Motion Behavior**: None
- **Theme Variables**: None
- **Current Status**: active
- **Notes**: Uses `grid-template-columns: repeat(2, minmax(0, 1fr))` with 0.25rem gap

### lw-badge
- **Category**: Metadata / Status
- **Purpose**: Status/version badge
- **Intended Use**: Version badges, decision badges, status indicators
- **Where Currently Applied**: Version badge, decision badge in QA panel
- **Where Not to Use**: Interactive buttons
- **Motion Behavior**: None
- **Theme Variables**: `--lw-visual-badge-bg`, `--lw-visual-badge-text`
- **Current Status**: active
- **Notes**: Rounded pill shape with accent color

### lw-divider
- **Category**: Metadata / Status
- **Purpose**: Horizontal divider line
- **Intended Use**: Section dividers
- **Where Currently Applied**: Debug section divider, advisory section divider
- **Where Not to Use**: Interactive containers
- **Motion Behavior**: None
- **Theme Variables**: `--lw-visual-divider-color`
- **Current Status**: active
- **Notes**: Applied to existing border-based dividers as additional class

### lw-node-glow
- **Category**: Graph Effects
- **Purpose**: Node glow effect
- **Intended Use**: Graph node glow decoration
- **Where Currently Applied**: None (not wired to Sigma renderer)
- **Where Not to Use**: Non-graph elements
- **Motion Behavior**: None (parked)
- **Theme Variables**: `--lw-visual-glow-color`, `--lw-visual-glow-spread`
- **Current Status**: scaffolded
- **Notes**: Not wired to Sigma renderer in v16. Will be integrated in future phases.

### lw-edge-glow
- **Category**: Graph Effects
- **Purpose**: Edge glow effect
- **Intended Use**: Graph edge glow decoration
- **Where Currently Applied**: None (not wired to Sigma renderer)
- **Where Not to Use**: Non-graph elements
- **Motion Behavior**: None (parked)
- **Theme Variables**: `--lw-visual-glow-color`, `--lw-visual-glow-spread`
- **Current Status**: scaffolded
- **Notes**: Not wired to Sigma renderer in v16. Will be integrated in future phases.

## Implementation Notes

### v16 Scope
- Visual scaffolding pass only
- No graph renderer behavior changes
- No glitter implementation
- No new runtime features
- Applied only to safe, low-risk UI elements

### Future Phases
- Graph effect handles will be wired to Sigma renderer
- Button handles will replace ad-hoc Tailwind classes
- Ambient effects will be implemented when glitter system is mature
- Graph frame may be applied after layout safety verification

### Theme Integration
- Visual handles use CSS variables for theme integration
- Theme runtime variables can override defaults
- Fallback values provided for all theme variables

### Reduced Motion
- All animated effects respect `prefers-reduced-motion`
- Button transitions disabled when reduced motion is preferred

## File Location
Visual handle CSS: `src/styles/lumaweave-visual-handles.css`
Imported from: `src/App.css`
