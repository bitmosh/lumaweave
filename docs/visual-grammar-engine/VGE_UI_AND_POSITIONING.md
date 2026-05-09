---
id: vge.ui.and.positioning
title: Visual Grammar Engine — UI Layout, Mode Presets & Product Positioning
type: concept
status: design-locked
version: v86a
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
references:
  - vge.overview.and.terms
  - vge.dialect.and.safety
  - cockpit.layout.overview
  - lens.navigation.model
  - panel.zones
  - tile.workspace.system
  - human.mode.evidence.mode.contract
  - theme.preset.model
tags: [vge, ui, layout, modes, positioning, future, docs-only]
---

# Visual Grammar Engine — UI Layout, Mode Presets & Product Positioning

> **Status:** Future architecture / docs-only. No runtime implementation authorized.

## v86a Status Note

The UI mode and layout concepts in this doc relate to several shipping precursors:

- **Cockpit layout** — [Cockpit Layout Overview](cockpit.layout.overview) and [Panel Zones](panel.zones) define the current panel/widget framework that Layout Presets eventually customize.
- **Tile system** — [Tile Workspace System](tile.workspace.system) is the v86c work that delivers the widget workspace direction described in this doc.
- **Lens navigation** — [Lens Navigation Model](lens.navigation.model) defines the six-lens system (Overview, Atlas, Evidence, Signal, Workshop, Mission) that Layout Worlds map onto.
- **Human/Evidence/Debug modes** — [Human Mode / Evidence Mode Contract](human.mode.evidence.mode.contract) is the shipping precursor for the Global Modes section in this doc.
- **Theme presets** — Current 6 themes are documented in [Theme Preset Model](theme.preset.model). The 12-theme set in this doc is a future expansion target.

VGE UI work is gated on v86c (Tile System) and the Source Adapter OS Reconnect Contract (v74). See [VGE Roadmap](vge.roadmap).

---

## Favored Layout Worlds

### 1. Overview Grid (A3 / Dashboard Grid)

Default practical dashboard. Summary cards first, evidence activity below. Good for daily use and QA overview.

```
Top status strip → summary card grid → registry/evidence widgets → selected detail drawer
```

### 2. Documentation Reader (B1)

Clean, stable, readable evidence/contract review mode. Best for QA, docs, and Playwright-friendly surfaces.

```
Sticky summary → clean sections → contract/evidence cards → compact registry tables
```

### 3. Architecture Atlas (C1)

Luminous graph/evidence map. Strong product identity. Best bridge toward immersive architecture visualization.

```
Atlas index → graph/evidence map → selected evidence inscription panel → contract seals / visual dialect badges
```

### 4. Panorama Atlas

Showcase/demo mode. Big visual world, immersive, less dense. Best for screenshots, trailers, Steam page, and future screensaver/ambient mode.

---

## Four Customization Layers

```
1. Layout Presets    Where panels/widgets live
2. Display Depth     How much detail each panel shows
3. Visual Theme      Color, shape language, typography, decorative treatment
4. Interaction Mode  How panels open, link, pin, filter, inspect, and expose evidence
```

---

## Display Depth Levels

```
0 = Minimal      Title only
1 = Summary      Title + status + count
2 = Operational  Title + status + count + risk badges + next action
3 = Evidence     Accepted version + test coverage + source
4 = Debug        Data-testid + registry key + file path
```

---

## Global Modes

```
Human Mode          Compact readable summary
Evidence Mode       Expanded evidence, source IDs, test coverage, contracts
Debug Mode          Registry keys, handles, test IDs, internal wiring
Presentation Mode   Beautiful, reduced detail, demo-safe
Screensaver / Ambient Observatory Mode   Future: living visual graph with safe signal routing
```

The first three modes have a shipping precursor in [Human Mode / Evidence Mode Contract](human.mode.evidence.mode.contract).

---

## Widget Workspace Direction

Long-term, the control plane becomes a widget workspace:

```
Command Deck / Mission Control Shell
→ widget grid / docked / movable panels
→ each widget has display depth
→ each widget has evidence mode
→ each widget has pin/open/collapse/link behavior
→ theme controls change visual expression, not contract meaning
```

Customization ladder:

```
Phase 1: fixed presets           Phase 2: user-selectable presets
Phase 3: widget visibility       Phase 4: resizable panels
Phase 5: draggable panels        Phase 6: magnetic/smart layout guides
Phase 7: saved custom workspaces Phase 8: inspector-based element styling
```

The widget workspace direction is being implemented incrementally through the [Tile Workspace System](tile.workspace.system) (v86c).

---

## Theme Preset Worlds (12-theme set)

The current shipping set has 6 themes (see [Theme Preset Model](theme.preset.model)). The full design vision is a 12-theme set:

```
Professional / dev-friendly:
  1. Obsidian Console     2. Paperlight Studio
  3. Graphite Lab         4. Blueprint Glass

Coder-centric vibespaces:
  5. Cozy Terminal        6. Pastel Workspace

Luminous / fantasy-inspired:
  7. Solar Archive        8. Glade Atlas

Neon / sci-fi:
  9. Tokyo Neon           10. Aurora Shell

Sacred geometry / fractal:
  11. Lattice Mandala     12. Fractal Observatory
```

The current 6 (Solar Plasma, Obsidian Aurora, Midnight Loom, Void Circuit, Agartha Dream, Agartha Dusk) are conceptually adjacent to several entries here but use distinct names and visual identities. The relationship between current shipping and the 12-theme vision is a future curation decision.

**Key UI rule:** Presentation is configurable. Evidence truth is not.

---

## Product Positioning

### Core Technical Blurb

Every visual element can resolve to a grammar handle. LumaWeave lets users inspect, edit, validate, preview, and save visual dialect overrides through safe, schema-governed workflows.

### Emotional Blurb

LumaWeave is about turning data into a place you can enter, understand, and reshape. Every visual element has grammar, and every grammar can become part of your own visual dialect.

### Steam Hook

Bring your data. Choose a visual dialect. Step inside the living graph.

### Enterprise Hook

A local-first architecture intelligence layer with evidence-backed visual governance.

### Product Manifesto

LumaWeave is not just a tool for visualizing data. It is a local-first environment for entering your data as a living system.

Plug in code, documents, knowledge bases, workflows, media libraries, or operational networks. LumaWeave classifies the shape of the source, recommends a visual dialect, and lets you tune the physics, layout, theme, signal routing, and evidence overlays until the system feels natural to you.

You do not just look at a graph. You walk through it. You watch it grow. You learn its rhythms. You live beside your data.

### Steam Potential

Strong Steam hooks: Architecture Atlas mode · Panorama Atlas mode · Self-graph fixture · Theme/dialect customization · Local-first privacy · Future safe Workshop-style theme/layout/grammar packs.

### Patreon Framing

- Help build a living data visualization engine
- Support local-first visual tools
- Watch the Visual Grammar Engine, Signal Loom, and Grammar Lens evolve
- Vote on visual dialects, theme worlds, and layout presets
- Access devlogs, design boards, and early concept packets

### Taglines

```
Every visual element has grammar.
Design the dialect of your data.
Enter your data as a living system.
Map your codebase like a world.
Write the rhythm of your data.
Safe visual grammar for living systems.
```

### Scope Caution

Marketing must never imply real-world offensive capability, unauthorized pentesting, exploit execution, or bypassing safety boundaries. Always describe the product as synthetic, sandboxed, defensive/evaluative, local-first, and evidence-scored.

---

*Frontmatter normalized v86a. Body content preserved as design-locked architecture. Connections added to current shipping cockpit/tile/lens/mode contracts and theme preset model.*
