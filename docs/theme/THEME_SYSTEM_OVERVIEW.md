---
id: theme.system.overview
title: Theme System Overview
type: overview
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/
references:
  - theme.token.path.map
  - theme.preset.model
  - theme.token.compatibility
  - theme.target.registry
  - link.network.overview
  - link.network.layer.3
  - graph.visual.theme.mapping.contract
tags:
  - theme
  - system
  - overview
  - tier-model
  - v86a
---

# Theme System Overview

The LumaWeave theme system controls how visual elements look across the application — node colors, panel chrome, backdrops, typography, motion. It is built on a three-tier token architecture, six built-in theme presets, and a four-layer link network that connects user-facing controls to runtime visual rendering.

This doc is the entry point for the theme cluster. It points outward to the docs that handle each topic in detail.

---

## What the theme system is

A typed, governance-validated system where every visual value flows through a chain:

```
user-selected preset
    ↓
Tier 1 primitives (raw colors, sizes, durations per theme)
    ↓
Tier 2 semantics (role assignments — surface.background.deep, text.primary)
    ↓
Tier 3 components (component slots — shell.background, panel.border)
    ↓
canonical token paths consumed by graph elements and UI surfaces
    ↓
runtime application via applyTheme.ts and CSS custom properties
```

The system is not just runtime styling — it's the **data layer** for the eventual radial inspector, which queries cross-references across docs and registries to surface "what controls affect this visual element" and "which tokens does this control consume."

For the underlying architecture, see [Link Network Overview](link.network.overview).

---

## Three-tier token model

Established in v86a. Each tier has a single source-of-truth file.

**Tier 1 — Primitives.** Raw vocabulary per theme. Themes redefine these. Components never reference them directly.
- File: `src/themes/tokenPrimitives.ts`
- Examples: `color.gold.500`, `space.4`, `duration.base`

**Tier 2 — Semantics.** Role assignments that resolve to primitives.
- File: `src/themes/tokenSemantics.ts`
- Examples: `surface.background.deep` → `{color.void.900}`, `text.primary` → `{color.cream.100}`

**Tier 3 — Components.** Component-family slots that resolve to semantics. Theme-agnostic by design.
- File: `src/themes/tokenComponents.ts`
- Examples: `shell.background` → `{surface.background.deep}`, `panel.border` → `{surface.border.accent}`

Tier walking is enforced at boot via `assertThemeTokenGovernanceClean()` in `themeTokenGovernance.ts`. Inline values in Tier 2 or 3 throw. Tier-skip references throw.

For tier governance details, see [Theme Token Compatibility](theme.token.compatibility).

---

## Six built-in themes

| Preset ID | Display name | Style | Notes |
|-----------|--------------|-------|-------|
| `solar-plasma` | Solar Plasma | Dark sci-fi with cyan and gold plasma | Default LumaWeave theme |
| `obsidian-aurora` | Obsidian Aurora | Dark crystalline aurora borealis | Inspired by northern lights over dark stone |
| `midnight-loom` | Midnight Loom | Dark warm gold candlelight | Cozy candlelit workspace |
| `void-circuit` | Void Circuit | Dark cyberpunk neon | High-contrast neon aesthetic |
| `agartha-dream` | Agartha Dream | Light pastel dreamy | Gentle dreamlike workspace |
| `agartha-dusk` | Agartha Dusk | Dark pastel moonlit night | Soft moonlit atmosphere |

Each theme has its own primitives object in `tokenPrimitives.ts`. Solar Plasma is the most fully tuned at v86a; the other five share neutral defaults at the semantic and component tiers and will receive theme-specific tuning in v87.

For preset structure, see [Theme Preset Model](theme.preset.model).

---

## Canonical and planned token paths

**40 canonical paths** are currently active across all six themes. Composed of 16 pre-v86a paths (app, panel, text, accent, graph nodes, graph edges, glow effects) plus 24 v86a-promoted paths (backdrop, node sphere, edge plasma, selection, bookmark, panel tile, inspector radial, typography).

**12 planned paths** are declared but not yet promoted. Promotion requires all six themes to populate values; only then does a path move from `PLANNED_THEME_TOKEN_PATHS` to `CANONICAL_THEME_TOKEN_PATHS` with an entry in `PROMOTION_HISTORY`.

For the complete vocabulary and promotion protocol, see [Theme Token Path Map](theme.token.path.map).

---

## How tokens become visible

The path from token declaration to rendered pixel goes through several layers, each with its own contract:

1. **Theme preset selected** — User picks a preset via top bar dropdown. Setting persisted to `appearance.theme`.
2. **Primitives loaded** — `themePrimitives[selectedThemeId]` becomes active.
3. **Semantics resolve** — Tier 2 paths resolve their `{primitive.path}` references.
4. **Components resolve** — Tier 3 paths resolve their `{semantic.path}` references.
5. **applyTheme runs** — Tier values written to CSS custom properties (`--lw-*`).
6. **CSS reads vars** — Stylesheets and components consume the custom properties.
7. **Graph elements consume tokens** — Graph rendering reads canonical token paths via the mapping registry.

For the runtime application contract chain, see [Graph Theme Application Contract](graph.theme.application.contract) and [Graph Visual Theme Mapping Contract](graph.visual.theme.mapping.contract).

---

## How user controls connect to visuals

User-facing controls (theme selector, glitter toggle, reduce-motion toggle, label modes, physics sliders) are connected to runtime rendering through a four-layer metadata network:

- **Layer 1 — Handle Registry** — Catalog of user-manipulable controls
- **Layer 2 — Control Surface Contract Registry** — Where each control lives in the UI
- **Layer 3 — Graph Visual Theme Mapping Registry** — Graph element → canonical token mapping
- **Layer 4 — Graph View Element Registry** — Graph element identities

Each layer has its own source-of-truth registry file in code and per-layer documentation. The four layers form the cross-reference network the radial inspector navigates.

For the full architecture, see [Link Network Overview](link.network.overview).

---

## Source files

| Concern | File |
|---------|------|
| Type definitions | `src/themes/theme.types.ts` |
| Token paths (canonical + planned) | `src/themes/themeTokenPaths.ts` |
| Tier 1 primitives (per theme) | `src/themes/tokenPrimitives.ts` |
| Tier 2 semantics (per theme) | `src/themes/tokenSemantics.ts` |
| Tier 3 components (theme-agnostic) | `src/themes/tokenComponents.ts` |
| Theme preset registry | `src/themes/themePresets.ts` |
| Per-theme runtime tokens | `src/themes/themeTokens.ts` |
| Token governance / tier-walk validator | `src/themes/themeTokenGovernance.ts` |
| Runtime application | `src/themes/applyTheme.ts` |
| Theme target registry | `src/themes/themeTargetRegistry.ts` |
| Override storage | `src/themes/themeOverrideStorage.ts` |
| CSS custom property mirror | `src/styles/lumaweave-visual-handles.css` |

---

## What this doc does not cover

- Specific token values per theme — see [Theme Preset Model](theme.preset.model)
- Canonical path catalog — see [Theme Token Path Map](theme.token.path.map)
- Cross-system invariants (asset bank, grammar lens, override boundaries) — see [Theme Token Compatibility](theme.token.compatibility)
- Theme target registry contents — see [Theme Target Registry](theme.target.registry)
- Top bar UI controls — see [Theme Top Bar Controls](theme.top.bar.controls)
- User customization roadmap — see [Theme Customization Roadmap](theme.customization.roadmap)
- Override storage governance — see [Theme Override Storage Contract](theme.override.storage.contract)
- Theme Mapping Panel entry rules — see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- Multi-renderer coordination (2D/3D/SVG) — planned for v86d/v86e
- User-generated theme submissions (workshop, sandbox, signing) — planned for v88+ (Lattica)

---

*This overview replaces the v15-era Phase 1A overview. Anchored on v86a state.*
