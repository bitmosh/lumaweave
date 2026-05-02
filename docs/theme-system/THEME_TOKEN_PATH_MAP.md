# Theme Token Path Map (v19)

## Summary
The Theme Token Path Map defines the canonical vocabulary that bridges current theme runtime tokens to future Theme Mapping Mode targets. It is intentionally small: only values that already exist in `ThemeRuntimeTokens` receive canonical paths, ensuring every path is resolvable today.

## Why Token Paths Exist
- Provide stable names that future systems (Theme Target Registry, Theme Mapping Panel, Debug overlay) can reference.
- Prevent drift between Control Contract OS, visual handles, and runtime styling.
- Make QA evidence explicit: if a path is missing, `validateThemeTokenPaths` logs the gap during development.

## Relationship to Existing Theme Presets
- Built-in presets still live in `src/themes/themeTokens.ts`.
- Canonical paths map directly onto those runtime fields via `resolveThemeTokenPath()` in `src/themes/themeTokenPaths.ts`.
- No preset values changed in v19; the resolver is read-only and helps other systems refer to the same data consistently.

## Relationship to Visual Handles
- Visual handle CSS (e.g., `.lw-panel`, `.lw-card`) currently uses fallback variables defined in `src/styles/lumaweave-visual-handles.css`.
- v19 documents which canonical token groups will eventually drive those CSS variables but does not attempt runtime synchronization.
- Future Theme Target Registry work should bind `visualHandle.*` planned paths to concrete canonical tokens before UI mapping occurs.

## Relationship to Theme Mapping Mode
- Theme Mapping Mode will need to translate inspector overlays (`themeTargetId`, `visualHandle`) into editable values. Canonical token paths are the vocabulary it will target.
- The v18a backlog already lists Theme Token Path Map as a prerequisite; this document fulfills that requirement without introducing mapping UI or controls.

## Canonical Token Groups
| Group | Purpose | Notes |
| --- | --- | --- |
| `app.*` | Shell/background scaffolding | Includes `app.background` and `app.glow` (used for atmosphere/glow effects). |
| `panel.*` | Mission Control + panel chrome | Maps to existing `panelBackground` / `panelBorder` runtime fields. |
| `text.*` | Primary vs muted UI text | Allows Mission Control + shell typography to reference the same names. |
| `accent.*` | Highlight/accent color | Currently only primary is needed/resolvable. |
| `graph.node.*` | Node fills + label color | Mirrors `ThemeRuntimeTokens.graph` values without renaming them. |
| `graph.edge.*` | Edge strokes + label color | Same intent as node paths; hover/selected states remain intact. |
| `effects.glow.*` | Non-graph glow intensity | Captures glow intensity used by Mission Control shell and future visual handles. |

## Current Token Paths
| Token Path | Resolves To | Consumers |
| --- | --- | --- |
| `app.background` | `tokens.app.background` | App shell background, Mission Control panels, QA panel inline styles. |
| `app.glow` | `tokens.app.glow` | Shell glow gradients, ambient effects. |
| `panel.background` | `tokens.app.panelBackground` | `.lw-panel`, `.lw-card`, QA panel container. |
| `panel.border` | `tokens.app.panelBorder` | Panel borders, top-bar selectors, section dividers. |
| `text.primary` | `tokens.app.textPrimary` | Mission Control headings, QA content. |
| `text.muted` | `tokens.app.textMuted` | Sub-labels and body copy. |
| `accent.primary` | `tokens.app.accent` | Headers, status badges, CTA highlights. |
| `graph.node.fill` | `tokens.graph.nodeDefault` | Sigma default node fill (via `resolveGraphVisualTokens`). |
| `graph.node.hoverFill` | `tokens.graph.nodeHover` | Hover overlay color. |
| `graph.node.selectedFill` | `tokens.graph.nodeSelected` | Selected node styling. |
| `graph.node.label` | `tokens.graph.nodeLabel` | Node label default color. |
| `graph.edge.stroke` | `tokens.graph.edgeDefault` | Default edge stroke in Sigma. |
| `graph.edge.hoverStroke` | `tokens.graph.edgeHover` | Hovered edge emphasis. |
| `graph.edge.selectedStroke` | `tokens.graph.edgeSelected` | Selected/primary edge styling. |
| `graph.edge.label` | `tokens.graph.edgeLabel` | Edge label default color. |
| `effects.glow.intensity` | `tokens.effects.glowIntensity` | QA shell glow + ambient future handles. |

## Planned/Future Token Paths
| Planned Path | Rationale |
| --- | --- |
| `app.surface` | Distinguish base background vs inner surface glass layers. |
| `text.warning`, `text.inverse` | Enable caution banners and inverse-on-glow text without ad-hoc colors. |
| `accent.secondary` | Provide secondary accent for multi-tone panels. |
| `control.background`, `control.border`, `control.active` | Back future Theme Mapping Panel controls without creating dead tokens today. |
| `panel.card.background`, `panel.card.border` | Separate card styling from main panels when Theme Target Registry lands. |
| `motion.reduce` | Express reduce-motion preference as tokenized signal. |
| `visualHandle.panel.background`, `visualHandle.button.background` | Bind CSS fallback variables to canonical paths once Theme Target Registry + Mapping Panel exist. |

## Non-Goals
- Do not add Theme Mapping UI or color pickers.
- Do not restyle the app or change Sigma/Graphology behavior.
- Do not rename `ThemeRuntimeTokens`; the resolver adapts canonical names to existing structure.
- Do not synchronize every CSS variable during v19; documenting the bridge is sufficient.

## Validation / QA Expectations
- `npm run typecheck` and `npm run qa:e2e` must pass with zero skipped tests.
- `validateThemeTokenPaths()` logs any canonical-path drift when themes load (dev-only warning).
- QA v19 checklist confirms: token path doc exists, canonical list resolves, theme switching + graph rendering still function, visual handle CSS loads, Theme Mapping UI remains unimplemented, and evidence for typecheck/Playwright results is captured.
- No `test.skip` entries are allowed.

**Terminology Reference**
- `themeId`: which preset is active (e.g., `solar-plasma`).
- `themeTokenPath`: canonical string from this document (e.g., `panel.border`).
- `visualHandle`: CSS primitive (e.g., `.lw-panel`).
- `themeTargetId`: future inspectable/customizable UI element identifier (e.g., `mission-control.panel`).
- `handleId`: Control Contract identity.
- `settingsKey`: Persisted state path for controls where applicable.
