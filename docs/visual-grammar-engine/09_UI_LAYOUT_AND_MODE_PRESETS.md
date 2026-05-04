# 09 — UI Layout and Mode Presets

## Purpose

This document captures the current preferred layout worlds and customization model for LumaWeave's control plane and future Visual Grammar workspace.

## Favored Layout Presets

### 1. Overview Grid

Also referenced as A3 / Dashboard Grid / Overview First.

Purpose:

- Default practical dashboard.
- Summary cards first.
- Evidence activity below.
- Good for daily use and QA overview.

Structure:

```txt
Top status strip
→ summary card grid
→ registry/evidence widgets
→ selected detail drawer
```

### 2. Documentation Reader

Also referenced as B1.

Purpose:

- Clean, stable, readable evidence/contract review mode.
- Best for QA, docs, and Playwright-friendly surfaces.

Structure:

```txt
Sticky summary
→ clean sections
→ contract/evidence cards
→ compact registry tables
```

### 3. Architecture Atlas

Also referenced as C1.

Purpose:

- Luminous graph/evidence map.
- Strong product identity.
- Best bridge toward immersive architecture visualization.

Structure:

```txt
Atlas index
→ graph/evidence map
→ selected evidence inscription panel
→ contract seals / visual dialect badges
```

### 4. Panorama Atlas

Showcase/demo mode.

Purpose:

- Big visual world.
- Immersive, beautiful, less dense.
- Best for screenshots, trailers, Steam page, and future screensaver/ambient mode.

## Four Customization Layers

```txt
1. Layout Presets
Where panels/widgets live.

2. Display Depth
How much detail each panel shows.

3. Visual Theme
Color, shape language, typography, decorative treatment.

4. Interaction Mode
How panels open, link, pin, filter, inspect, and expose evidence.
```

## Display Depth Levels

```txt
0 = Minimal
1 = Summary
2 = Operational
3 = Evidence
4 = Debug
```

Example behavior:

```txt
Minimal:
Title only

Summary:
Title + status + count

Operational:
Title + status + count + risk badges + next action

Evidence:
Accepted version + test coverage + source

Debug:
Data-testid + registry key + file path
```

## Global Modes

```txt
Human Mode
Compact readable summary.

Evidence Mode
Expanded evidence, source IDs, test coverage, contracts.

Debug Mode
Registry keys, handles, test IDs, internal wiring.

Presentation Mode
Beautiful, reduced detail, demo-safe.

Screensaver / Ambient Observatory Mode
Future: living visual graph with safe signal routing.
```

## Widget Workspace Direction

Long-term, the control plane should become a widget workspace:

```txt
Command Deck / Mission Control Shell
→ widget grid / docked panels / movable panels
→ each widget has display depth
→ each widget has evidence mode
→ each widget has pin/open/collapse/link behavior
→ theme controls change visual expression, not contract meaning
```

## Customization Ladder

```txt
Phase 1: fixed presets
Phase 2: user-selectable presets
Phase 3: widget visibility toggles
Phase 4: resizable panels
Phase 5: draggable panels
Phase 6: magnetic/smart layout guides
Phase 7: saved custom workspaces
Phase 8: inspector-based element styling
```

## Theme Preset Worlds

Potential 12-theme set:

```txt
Professional / dev-friendly:
1. Obsidian Console
2. Paperlight Studio
3. Graphite Lab
4. Blueprint Glass

Coder-centric vibespaces:
5. Cozy Terminal
6. Pastel Workspace

Luminous / fantasy-inspired:
7. Solar Archive
8. Glade Atlas

Neon / sci-fi:
9. Tokyo Neon
10. Aurora Shell

Sacred geometry / fractal:
11. Lattice Mandala
12. Fractal Observatory
```

## Key UI Rule

Presentation is configurable.

Evidence truth is not.
