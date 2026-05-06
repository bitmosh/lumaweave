---
id: system.theme.overview
title: Theme System Overview
type: manual
status: accepted
version: v73c
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/themes/themeTokens.ts
  - src/themes/themePresets.ts
  - src/themes/applyTheme.ts
  - src/themes/themeTokenPaths.ts
  - src/themes/themeTargetRegistry.ts
tags: [theme, system, overview, presets, tokens, accepted]
---

# Theme System Overview

---

## Current State (v73c)

**What is implemented:**
```
4 built-in theme presets: Solar Plasma, Obsidian Aurora, Haunted Observatory, Glitter Goblin
Theme preset selector in top bar (AppShell.tsx)
Graph node/edge/label colors update on theme change
Theme tokens defined in src/themes/themeTokens.ts
Canonical token paths defined in src/themes/themeTokenPaths.ts
Theme Target Registry (read-only, v20) — data-lw-theme-target attributes
Ghost Overlay (partial — hold key + click for YAML popout)
applyTheme.ts — applies token values via DOM CSS variables
validateThemeTokens — dev-only runtime guardrail
```

**What is NOT yet implemented:**
```
Custom theme creation / save / rename / delete
Import/export theme JSON
Pop-out color picker
Full app theme editor (only graph-level tokens are wired)
Theme Mapping Panel (generates editable controls from registry)
Theme override storage with persistence (v34a/b partial, pre-v65 — check archive)
```

---

## Architecture

### Theme Resolution Chain
```
User selects preset
  → themePresets.ts (built-in presets with token values)
  → applyTheme.ts (sets CSS custom properties on DOM)
  → DOM cascade (Sigma reads colors via CSS where wired)
  → graphVisualTokens.ts (explicit graph token values per preset)
```

### Token Groups

```
app.*           Shell/background scaffolding
panel.*         Mission Control + panel chrome
text.*          Primary vs muted UI text
accent.*        Highlight/accent color
graph.node.*    Node fills, label color, hover, selected states
graph.edge.*    Edge strokes, label color, hover, selected states
effects.glow.*  Non-graph glow intensity
```

See `docs/theme/THEME_TOKEN_PATH_MAP.md` for the canonical vocabulary.

### Visual Handle Layer

DOM elements use CSS classes: `.lw-panel`, `.lw-card`, etc.
These classes inherit from CSS custom properties set by `applyTheme.ts`.
Theme tokens eventually drive these via `lumaweave-visual-handles.css`.

---

## 4 Built-in Presets

```
solar-plasma        Default. Purple/violet nodes, cool blue edges.
obsidian-aurora     Deep dark blues, aurora borealis accents.
haunted-observatory Eerie dark blues, ghostly highlights. Graph nodes: green.
glitter-goblin      Warm, sparkle-heavy, playful palette.
```

Presets are defined in `src/themes/themePresets.ts` and `src/themes/themeTokens.ts`.
Built-in presets are `isBuiltIn: true` and cannot be deleted.

---

## Theme Safety Rules

- Do not write CSS variables directly — go through canonical token paths
- Do not apply token values that bypass `themeTokenPaths.ts` registry
- Do not promote planned token paths without an explicit pass
- Theme changes must not affect Sigma internals directly
- All theme overrides are reversible (preview → commit or cancel model)

---

## Phase Roadmap

```
Phase 1A  Built-in presets + top bar selector        DONE
Phase 2   Custom theme save/rename/delete            PLANNED
Phase 3   Pop-out color picker                       PLANNED
Phase 4   Full app theme editor                      PLANNED (after graph tokens stable)
Phase 5   Theme Mapping Panel (from Target Registry) PLANNED (requires overlay contract)
Phase 6   Community themes (after security pipeline) PLANNED (v77+)
```

---

## Relationship to Grammar Lens / Overlay

The Ghost Overlay (partially implemented) uses `data-lw-theme-target` DOM attributes
to identify clickable elements. When an element is clicked in overlay mode, the
YAML/JSON slice for that element is shown in the cursor popout.

The overlay's ability to apply changes flows through the canonical token path system —
not through raw CSS injection. This is the contract boundary.

See `docs/grammar-lens/GHOST_OVERLAY_CURRENT_STATE.md` for current overlay state.
