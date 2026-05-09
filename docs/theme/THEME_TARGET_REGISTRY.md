---
id: theme.target.registry
title: Theme Target Registry
type: registry
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
governs:
  - src/themes/themeTargetRegistry.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.mapping.panel.entry.contract
  - theme.token.compatibility
  - link.network.layer.2
  - link.network.layer.3
tags: [theme, target, registry, surfaces, v86a]
---

# Theme Target Registry

The Theme Target Registry catalogs **inspectable UI surfaces** that consume theme tokens. Each entry records a `themeTargetId`, surface classification, optional visual handle, canonical `themeTokenPath` bindings, and editable properties.

This registry is **read-only metadata** — it documents which UI elements consume which tokens, but does not by itself apply styles. Runtime style application happens through the contracts that depend on this registry.

The source of truth is `src/themes/themeTargetRegistry.ts`. This doc describes the registry shape and lists current entries.

---

## Relationship to the four-layer link network

The Theme Target Registry is closely related to but distinct from the four-layer link network:

- **Layer 1 (Handle Registry)** — what the user can manipulate
- **Layer 2 (Control Surface Contract Registry)** — where each control lives in the UI
- **This registry (Theme Target Registry)** — which UI surfaces consume theme tokens
- **Layer 3 (Graph Visual Theme Mapping Registry)** — which graph elements consume theme tokens
- **Layer 4 (Graph View Element Registry)** — graph element identities

This registry is the non-graph counterpart to Layer 3. Where Layer 3 maps graph elements (`graph.nodes`, `graph.edges`) to tokens, this registry maps UI surfaces (`mission-control.panel`, `app.shell`) to tokens.

For the link network architecture, see [Link Network Overview](link.network.overview).

---

## Relationship to Theme Token Path Map

- Registry entries reference canonical token path names from [Theme Token Path Map](theme.token.path.map). Cross-references must use canonical paths only, not planned-only paths.
- Active entries map to resolvable runtime tokens. Planned entries hold empty `tokenBindings` until promoted.

---

## Relationship to visual handles

Where possible, targets list the existing `lw-*` visual handle CSS class (e.g., `lw-panel`, `lw-card`). Visual handles provide the CSS scaffolding that binds registry tokens to DOM styling. Surfaces with visual handles inherit consistent base styling; surfaces without visual handles are typically unique elements (the shell, the topbar root) styled directly.

---

## Relationship to Theme Mapping Mode

Theme Mapping Mode uses `themeTargetId` as the binding between inspector overlay, generated controls, and token overrides. Registry entries act as the contract that the inspector targets — no target ID, no mapping.

For the entry rules that gate which surfaces become editable, see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract).

---

## ThemeTargetContract shape

```ts
export type ThemeTargetContract = {
  themeTargetId: string;
  label: string;
  surface: "shell" | "topbar" | "panel" | "mission-control"
         | "control" | "settings" | "graph";
  visualHandle?: string;
  tokenBindings: Partial<Record<ThemeEditableProperty, ThemeTokenPath>>;
  editableProperties: ThemeEditableProperty[];
  status: "active" | "planned" | "experimental";
  notes?: string;
};
```

**`ThemeEditableProperty`** values: `background`, `border`, `text`, `accent`, `glow`, `opacity`, `radius`.

**`tokenBindings`** holds resolved canonical theme token paths. Empty for planned targets until a mapping is proven.

**`status`** indicates whether the target is wired to runtime DOM (`active`), declared but not wired (`planned`), or behind a feature flag (`experimental`).

---

## Active targets (8)

Surfaces currently wired to runtime DOM and bound to canonical token paths.

| themeTargetId | Surface | Visual Handle | Token Bindings | Notes |
|---------------|---------|---------------|----------------|-------|
| `app.shell` | shell | (none) | `background: app.background`, `glow: app.glow` | Global ambient shell background + glow |
| `topbar.root` | topbar | (none) | `background: app.background`, `border: panel.border`, `text: text.primary`, `accent: accent.primary` | |
| `mission-control.panel` | mission-control | `lw-panel` | `background: panel.background`, `border: panel.border`, `text: text.primary` | |
| `mission-control.question-card` | mission-control | `lw-card` | `background: panel.background`, `border: panel.border`, `text: text.primary` | |
| `mission-control.proposal-card` | mission-control | `lw-card` | `background: panel.background`, `border: panel.border`, `text: text.primary` | |
| `mission-control.backlog-card` | mission-control | `lw-card` | `background: panel.background`, `border: panel.border`, `text: text.primary` | |
| `settings.panel` | settings | `lw-panel` | `background: panel.background`, `border: panel.border`, `text: text.primary` | |
| `graph.frame` | graph | (none) | `background: app.background`, `border: panel.border` | Wrapper around Sigma canvas (not Sigma internals) |

These bindings drive the `data-lw-theme-target` markers in the DOM and inform the Theme Mapping Panel's read-only control rows.

---

## Planned targets (6)

Surfaces declared in the registry but not yet wired to runtime DOM. Token bindings are empty until promotion.

| themeTargetId | Surface | Notes |
|---------------|---------|-------|
| `graph.node.default` | graph | Will bind to `graph.node.fill` once Layer 3 mapping registry extension lands |
| `graph.node.selected` | graph | Will bind to `graph.node.selectedFill` |
| `graph.edge.default` | graph | Will bind to `graph.edge.stroke` |
| `graph.edge.selected` | graph | Will bind to `graph.edge.selectedStroke` |
| `theme-mapping.panel` | mission-control | Future Theme Mapping UI container |
| `theme-mapping.control` | control | Placeholder for generated inspector controls |

Promotion requires:
1. The DOM surface exists with `data-lw-theme-target="<themeTargetId>"`
2. Token bindings reference canonical paths
3. The Theme Mapping Panel Entry Contract requirements are satisfied

---

## v86a notes

- v86a's tier model added 24 promoted token paths to the canonical set. Most of those paths target overlay components (SolarBackdrop, ClickHalo, FloatingBookmark, etc.) which are **not currently registered as theme targets** in this registry. Those overlays consume tokens via different code paths (direct `applyTheme` reads, shader uniforms) rather than through the target/handle layer.
- A future pass may register overlay components as theme targets. That decision is pending — see [Layer 2 Overlay Question](link.network.layer.2.overlay.question) when Phase Y outputs land.
- v86a did not change this registry's structure, only its surrounding context. Active targets remain the same 8 entries from the v20 era.

---

## Read-only inspector behavior

- Inspector overlay toggled via `Alt+Shift+I` (Ubuntu-safe debug hotkey)
- Hover over registered DOM nodes shows `themeTargetId`, `visualHandle`, `tokenBindings`, `editableProperties`
- Inspector currently displays metadata only — editing is gated by [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- The inspector overlay renders ghost frames around registered targets when activated

---

## Helper functions

`themeTargetRegistry.ts` exposes:

- `getThemeTargetById(id)` — lookup by `themeTargetId`
- `getActiveThemeTargets()` — filter to active status
- `getPlannedThemeTargets()` — filter to planned status
- `getThemeTargetsBySurface(surface)` — filter by surface enum
- `getThemeTargetSummary()` — counts (total, active, planned, with-bindings, with-visual-handles, missing-bindings)

These functions are consumed by the inspector overlay, governance validator, and any future Theme Mapping Panel implementation.

---

## What this doc does not cover

- Canonical token vocabulary — see [Theme Token Path Map](theme.token.path.map)
- Theme Mapping Panel entry rules — see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- Override storage rules — see [Theme Override Storage Contract](theme.override.storage.contract)
- Tier-walk validation — see [Theme Token Compatibility](theme.token.compatibility)
- Graph element targets — see [Layer 3: Graph Visual Theme Mapping](link.network.layer.3)
- Layer 4 graph element identities — see [Layer 4: Graph View Element](link.network.layer.4)

---

*Refreshed against current `themeTargetRegistry.ts` state (8 active + 6 planned = 14 entries). Structural model unchanged from v20.*
