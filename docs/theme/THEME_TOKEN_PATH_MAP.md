---
id: theme.token.path.map
title: Theme Token Path Map
type: map
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/themeTokenPaths.ts
references:
  - theme.system.overview
  - theme.preset.model
  - theme.token.compatibility
  - link.network.layer.3
  - graph.theme.application.contract
  - graph.theme.runtime.application.contract
  - contract.graph.theme.first.value.application
  - graph.visual.theme.mapping.contract
tags:
  - theme
  - tokens
  - paths
  - canonical
  - planned
  - map
  - v86a
---

# Theme Token Path Map

Canonical vocabulary of theme token paths. Every active path resolves to a real runtime value via the three-tier model. Planned paths are declared but not yet promoted.

The source of truth is `src/themes/themeTokenPaths.ts`. This doc describes the vocabulary and explains the promotion protocol; the arrays in code are authoritative.

---

## Two-step promotion model

Token paths land in two stages:

1. **PLANNED** — Paths added to `PLANNED_THEME_TOKEN_PATHS` array. Themes may or may not populate values yet. Paths are not eligible for active target binding.
2. **CANONICAL** — Paths populated across all six themes and promoted to `CANONICAL_THEME_TOKEN_PATHS`. Eligible for binding. Promotion records an entry in `PROMOTION_HISTORY` with the pass that promoted the paths.

Contract: paths must be staged in PLANNED first, then promoted only after all six themes populate values. This prevents binding to incomplete paths.

---

## Canonical paths (40)

The 16 paths existing pre-v86a plus 24 promoted in v86a.

### Pre-v86a paths (16)

| Path | Tier | Group | Consumers |
|------|------|-------|-----------|
| `app.background` | 2 | Shell | App shell, panels |
| `app.glow` | 2 | Shell | Shell glow gradients, ambient effects |
| `panel.background` | 2 | Panel | Mission Control panels, settings |
| `panel.border` | 2 | Panel | Panel chrome borders |
| `text.primary` | 2 | Text | Main UI text |
| `text.muted` | 2 | Text | Dimmed/secondary UI text |
| `accent.primary` | 2 | Accent | Highlight color, active states |
| `graph.node.fill` | 2 | Graph node | Default node fill |
| `graph.node.hoverFill` | 2 | Graph node | Hovered node fill |
| `graph.node.selectedFill` | 2 | Graph node | Selected node fill |
| `graph.node.label` | 2 | Graph node | Node label color |
| `graph.edge.stroke` | 2 | Graph edge | Default edge stroke |
| `graph.edge.hoverStroke` | 2 | Graph edge | Hovered edge stroke |
| `graph.edge.selectedStroke` | 2 | Graph edge | Selected edge stroke |
| `graph.edge.label` | 2 | Graph edge | Edge label color |
| `effects.glow.intensity` | 2 | Effects | Shell + panel glow |

### v86a-promoted paths (24)

Promoted 2026-05-08. Reason: all six themes populated values; ready for binding.

| Path | Tier | Group | Consumers |
|------|------|-------|-----------|
| `backdrop.corona.color` | 3 | Backdrop | SolarBackdrop overlay |
| `backdrop.corona.intensity` | 3 | Backdrop | SolarBackdrop overlay |
| `backdrop.flare.color` | 3 | Backdrop | SolarBackdrop overlay |
| `backdrop.starfield.density` | 3 | Backdrop | SolarBackdrop overlay |
| `backdrop.vignette.intensity` | 3 | Backdrop | SolarBackdrop overlay |
| `node.sphere.humDuration` | 3 | Node sphere | NodeSphereProgram (u_hum) |
| `node.sphere.flowDuration` | 3 | Node sphere | NodeSphereProgram (u_flowSpeed) |
| `node.sphere.glowStrength` | 3 | Node sphere | NodeSphereProgram (u_glowStrength) |
| `edge.style.preset` | 3 | Edge plasma | PlasmaOverlayEdge mode |
| `edge.plasma.flowSpeed` | 3 | Edge plasma | PlasmaOverlayEdge animation |
| `selection.halo.color` | 3 | Selection | ClickHalo overlay |
| `selection.halo.maxRadiusRatio` | 3 | Selection | ClickHalo overlay |
| `selection.glitter.densityScale` | 3 | Selection | GlitterField overlay |
| `selection.dim.opacity` | 3 | Selection | dimmingPolicy |
| `bookmark.alert.color` | 3 | Bookmark | FloatingBookmark alert variant |
| `bookmark.pinned.color` | 3 | Bookmark | FloatingBookmark pinned variant |
| `bookmark.ref.color` | 3 | Bookmark | FloatingBookmark ref variant |
| `panel.blur.amount` | 3 | Panel | Panel chrome backdrop-filter |
| `panel.tile.handleColor` | 3 | Panel tile | (v86c — Tile system, planned consumer) |
| `panel.tile.groupOutlineColor` | 3 | Panel tile | (v86c — Tile system, planned consumer) |
| `inspector.radial.spokeColor` | 3 | Inspector radial | (v86d — Inspector mini-graph, planned consumer) |
| `inspector.radial.haloColor` | 3 | Inspector radial | (v86d — Inspector mini-graph, planned consumer) |
| `typography.font.display` | 3 | Typography | (v86e — Cosmetic polish, planned consumer) |
| `typography.font.body` | 3 | Typography | (v86e — Cosmetic polish, planned consumer) |
| `typography.font.mono` | 3 | Typography | (v86e — Cosmetic polish, planned consumer) |

---

## Planned paths (12)

Declared in `PLANNED_THEME_TOKEN_PATHS` but not yet promoted. Themes have not populated values across all six.

| Path | Intended group | Promotion target |
|------|----------------|------------------|
| `app.surface` | Shell | TBD |
| `text.warning` | Text | TBD |
| `text.inverse` | Text | TBD |
| `accent.secondary` | Accent | TBD |
| `control.background` | Control | TBD |
| `control.border` | Control | TBD |
| `control.active` | Control | TBD |
| `panel.card.background` | Panel | TBD |
| `panel.card.border` | Panel | TBD |
| `motion.reduce` | Motion | TBD (express reduce-motion as token) |
| `visualHandle.panel.background` | Visual handle | TBD (CSS fallback alignment) |
| `visualHandle.button.background` | Visual handle | TBD (CSS fallback alignment) |

Promotion happens when a sub-arc populates values across all six themes and the operator approves the promotion. New paths typically join PLANNED first as part of feature work, then promote in a later sub-arc.

---

## Tier classification

Every canonical path resolves to a value through the three-tier chain. The tier indicates the highest layer that path is declared in:

- **Tier 1** — Raw primitive value (e.g. `color.gold.500`). No paths in CANONICAL are Tier 1; all primitives are referenced through Tier 2 semantics.
- **Tier 2** — Semantic role assignment that resolves to a primitive (e.g. `surface.background.deep` → `{color.void.900}`). The 16 pre-v86a paths are Tier 2.
- **Tier 3** — Component slot that resolves to a semantic (e.g. `node.sphere.glowStrength` → `{surface.accent.warm}`). The 24 v86a-promoted paths are Tier 3.

For the tier model architecture, see [Theme System Overview](theme.system.overview) and [Theme Token Compatibility](theme.token.compatibility).

---

## Promotion history

```
v86a — promoted 2026-05-08
  Reason: All six themes populated values; ready for binding.
  Paths (24): backdrop.* (5), node.sphere.* (3), edge.* (2),
              selection.* (4), bookmark.* (3), panel.* (3),
              inspector.radial.* (2), typography.font.* (3)
```

Future promotion entries get appended to `PROMOTION_HISTORY` array in `themeTokenPaths.ts`.

---

## Validation

Two governance functions operate on token paths:

**`validateThemeTokenPaths(tokens)`** — In `themeTokenPaths.ts`. Returns the list of canonical paths that fail to resolve in the supplied runtime tokens. Used as a dev-only warning when themes load.

**`assertThemeTokenGovernanceClean()`** — In `themeTokenGovernance.ts`. Hard-throws at boot if any of the following violate:
- Active targets bound to non-canonical paths
- Active targets bound to planned-only paths
- Planned targets declaring tokenBindings prematurely
- Built-in presets missing canonical paths
- Tier-walk violations (Tier 3 → not-Tier-2, Tier 2 → not-Tier-1, inline values in Tier 2 or 3)

Playwright spec `tier-walk-validator.spec.ts` proves the validator catches synthetic violations.

---

## Naming conventions

**Canonical token paths** use lowercase dot-notation with the form `<group>.<element>` or `<group>.<element>.<aspect>`:
- Group prefixes: `app`, `panel`, `text`, `accent`, `graph`, `effects`, `backdrop`, `node`, `edge`, `selection`, `bookmark`, `inspector`, `typography`, `control` (planned), `motion` (planned), `visualHandle` (planned)
- Element/aspect words use camelCase when multi-word: `selectedFill`, `glowStrength`, `maxRadiusRatio`

This dot-notation is shared with theme target IDs and other dot-notation registries in the codebase, but the namespace prefix uniquely identifies which subsystem an ID belongs to. For cross-subsystem distinction, see [Theme System Overview](theme.system.overview).

---

## Terminology reference

```
themeId           which preset is active (e.g. "solar-plasma")
themeTokenPath    canonical string from this doc (e.g. "panel.border")
visualHandle      CSS primitive (e.g. ".lw-panel")
themeTargetId     inspectable UI element ID (e.g. "mission-control.panel")
handleId          Control Contract identity (Layer 1)
settingsKey       persisted state path for controls
```

---

## What this doc does not cover

- Specific token values per theme — see [Theme Preset Model](theme.preset.model)
- Tier source files (Tier 1/2/3 declarations) — see `tokenPrimitives.ts`, `tokenSemantics.ts`, `tokenComponents.ts`
- Cross-system invariants — see [Theme Token Compatibility](theme.token.compatibility)
- Graph element-to-token mapping — see [Layer 3: Graph Visual Theme Mapping](link.network.layer.3) and [Graph Visual Theme Mapping Contract](graph.visual.theme.mapping.contract)
- Runtime application of token values — see [Graph Theme Application Contract](graph.theme.application.contract) and [Graph Theme First Value Application Contract](contract.graph.theme.first.value.application)

---

*Replaces v19-era token path map. Aligned with v86a state.*
