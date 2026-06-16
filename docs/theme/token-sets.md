# LumaWeave Token Sets

Full inventory of all text tokens and UI tokens in the theming system, plus findings and nuances from a codebase audit. This is the reference for understanding what gets affected when theme settings change — whether via per-element overrides, font family/type changes, or full theme swaps.

**Audit date:** 2026-06-02 (pass 2: unmapped runtime tokens added)
**Key files:**
- `src/themes/themeTokenPaths.ts` — canonical path definitions + resolver function
- `src/themes/themeTokens.ts` — per-theme runtime values (all 6 themes)
- `src/themes/theme.types.ts` — `ThemeRuntimeTokens` interface (source of truth for the full runtime shape)
- `src/themes/typographyRegistry.ts` — font family roles
- `src/themes/fontAxisRegistry.ts` — font variation axes
- `src/themes/tokenPrimitives.ts` — Tier 1 primitive color/spacing/motion values
- `src/themes/tokenSemantics.ts` — Tier 2 semantic mappings
- `src/themes/tokenComponents.ts` — Tier 3 component-level mappings
- `src/styles/lumaweave-visual-handles.css` — CSS custom properties for visual handles
- `src/App.css` — root-level CSS font variables

---

## Token Architecture Overview

The system uses a **three-tier token model** plus a separate runtime layer:

1. **Tier 1 — Primitives** (`tokenPrimitives.ts`): Raw values — color palettes, spacing scale, radius, shadow, motion duration/easing.
2. **Tier 2 — Semantics** (`tokenSemantics.ts`): Named roles that reference primitives (e.g. `text.primary → color.cream.100`).
3. **Tier 3 — Components** (`tokenComponents.ts`): Component-scoped bindings (e.g. `topbar.background`, `tile.border`).
4. **Runtime tokens** (`themeTokens.ts`): Fully resolved flat objects, one per theme, what the app actually reads at runtime.

The **canonical token paths** in `themeTokenPaths.ts` are the public API of the theme system — the only paths that can be bound to `ThemeTarget`s (the per-element override mechanism). A path must pass through a `PLANNED → CANONICAL` promotion process before anything can bind to it. The resolver function `resolveThemeTokenPath()` bridges a canonical path string to its field in the runtime token object.

There are currently **42 canonical paths** and **12 planned (not yet active) paths**.

### Coverage gap — unmapped runtime fields

`ThemeRuntimeTokens` (defined in `theme.types.ts`) has **10 fields with no canonical path**. These fields exist in every theme's runtime token object and are read directly by consumers (Sigma graph renderer, effect layers), bypassing the `ThemeTarget` binding and override system entirely. They cannot be overridden per-element today.

| Runtime Field | Type | Used By | Gap |
|---|---|---|---|
| `graph.nodeSecondary` | `string` | Graph renderer — secondary/relationship nodes | No canonical path, no override |
| `graph.nodeTertiary` | `string` | Graph renderer — low-importance nodes | No canonical path, no override |
| `graph.edgeSecondary` | `string` | Graph renderer — secondary edges | No canonical path, no override |
| `graph.edgeTertiary` | `string` | Graph renderer — tertiary edges | No canonical path, no override |
| `graph.nodeLabelHover` | `string` | Graph renderer — node label hover state | No canonical path, no override |
| `graph.edgeLabelHover` | `string` | Graph renderer — edge label hover state | No canonical path, no override |
| `graph.nodeColorScale` | `string[]` | Graph renderer — heat-map / cluster color ramp | No canonical path, no override |
| `graph.edgeColorScale` | `string[]` | Graph renderer — edge ranking color ramp | No canonical path, no override |
| `effects.glitterEnabled` | `boolean` | GlitterField overlay | No canonical path, no override |
| `effects.starfieldEnabled` | `boolean` | SolarBackdrop / starfield layer | No canonical path, no override |

**Coverage:** 42 canonical paths out of 52 total runtime fields = **~81% coverage**.

To make any of these overridable, the path would need to be added to `PlannedThemeTokenPath` first, all six themes would need to populate values, then promoted to `ThemeTokenPath` in a named pass.

---

## Text Tokens

These are all canonical paths that affect typography and text rendering. "Text token" covers font family selection, text colors, and label colors on graph elements.

### Font Family Tokens

Controlled by the three typography roles defined in `typographyRegistry.ts`. When a theme sets `typography.font.display`, it replaces the display font across anything consuming `--lw-font-display`.

| Token Path | Runtime Field | Default Font | CSS Variable |
|---|---|---|---|
| `typography.font.display` | `tokens.typography?.fontDisplay` | `"Space Grotesk", system-ui, sans-serif` | `--lw-font-display` |
| `typography.font.body` | `tokens.typography?.fontBody` | `"IBM Plex Sans", system-ui, sans-serif` | `--lw-font-body` |
| `typography.font.mono` | `tokens.typography?.fontMono` | `"IBM Plex Mono", ui-monospace, monospace` | `--lw-font-mono` |

**Font variation axes** (from `fontAxisRegistry.ts`):
- Space Grotesk: `wght` axis, range 300–700, default 500
- IBM Plex Sans: `wght` axis, range 100–700, default 400
- IBM Plex Mono: `wght` axis, range 100–500, default 400

### Text Color Tokens

| Token Path | Runtime Field | Affects |
|---|---|---|
| `text.primary` | `tokens.app.textPrimary` | Main UI text throughout the app shell and panels |
| `text.muted` | `tokens.app.textMuted` | Secondary/de-emphasized text, hints, subtitles |
| `graph.node.label` | `tokens.graph.nodeLabel` | Node label text in the default (non-hover) state |
| `graph.edge.label` | `tokens.graph.edgeLabel` | Edge label text in the default (non-hover) state |

Note: node/edge *hover* label colors (`nodeLabelHover`, `edgeLabelHover`) are present in the runtime token object but are **not yet exposed as canonical paths** — they're read directly by the graph renderer without going through the `ThemeTarget` binding system. So you can't override them per-element today; they're theme-set-only.

### Planned Text Tokens (not yet active)

These are staged in `PlannedThemeTokenPath` but not yet promotable — no themes populate values yet:

| Planned Path | Intended Purpose |
|---|---|
| `text.warning` | Warning/caution text state |
| `text.inverse` | Text on light/inverted surfaces |

---

## UI Tokens

All 38 canonical paths that are not text tokens. Organized by domain.

### App / Shell

| Token Path | Runtime Field | Notes |
|---|---|---|
| `app.background` | `tokens.app.background` | Root app background color |
| `app.glow` | `tokens.app.glow` | App-level ambient glow color (used by shell glow layer) |
| `panel.background` | `tokens.app.panelBackground` | Semi-transparent panel/sidebar background |
| `panel.border` | `tokens.app.panelBorder` | Panel border color |
| `accent.primary` | `tokens.app.accent` | Primary accent — used for highlights, active states, snap guides |
| `panel.blur.amount` | `tokens.panel?.blurAmount` | Backdrop blur in px for panels (range: 8–20px across themes) |

### Graph — Nodes

| Token Path | Runtime Field | Notes |
|---|---|---|
| `graph.node.fill` | `tokens.graph.nodeDefault` | Default node fill color |
| `graph.node.hoverFill` | `tokens.graph.nodeHover` | Node fill on cursor hover |
| `graph.node.selectedFill` | `tokens.graph.nodeSelected` | Node fill when selected |
| `node.geometry.preset` | `tokens.node?.geometryPreset` | Geometry program used to render nodes (default: `"glass-sphere"`). Special-case v90a path — not a ThemeTarget binding, governs the graphology pipeline directly. Defaults to `"glass-sphere"` when absent so themes don't have to declare it. |
| `node.sphere.humDuration` | `tokens.node?.sphereHumDuration` | Sphere hum animation duration in seconds (range: 3.5–6.0) |
| `node.sphere.flowDuration` | `tokens.node?.sphereFlowDuration` | Sphere flow animation duration in seconds (range: 3.2–5.5) |
| `node.sphere.glowStrength` | `tokens.node?.sphereGlowStrength` | Sphere glow intensity (range: 0–1.2) |

### Graph — Edges

| Token Path | Runtime Field | Notes |
|---|---|---|
| `graph.edge.stroke` | `tokens.graph.edgeDefault` | Default edge stroke color |
| `graph.edge.hoverStroke` | `tokens.graph.edgeHover` | Edge stroke on hover |
| `graph.edge.selectedStroke` | `tokens.graph.edgeSelected` | Edge stroke when selected |
| `edge.style.preset` | `tokens.edge?.stylePreset` | Edge rendering style: `"plasma"`, `"wire"`, or `"ribbon"` |
| `edge.plasma.flowSpeed` | `tokens.edge?.plasmaFlowSpeed` | Speed of plasma flow animation (range: 0–1) |

### Effects / Glow

| Token Path | Runtime Field | Notes |
|---|---|---|
| `effects.glow.intensity` | `tokens.effects.glowIntensity` | Global glow effect intensity (range: 0–1.2) |

### Backdrop

These tokens control the animated background environment behind the graph canvas.

| Token Path | Runtime Field | Notes |
|---|---|---|
| `backdrop.corona.color` | `tokens.backdrop?.coronaColor` | Color of the corona/halo atmospheric effect |
| `backdrop.corona.intensity` | `tokens.backdrop?.coronaIntensity` | Corona effect opacity/strength (range: 0–1) |
| `backdrop.flare.color` | `tokens.backdrop?.flareColor` | Color of lens flare / light streak elements |
| `backdrop.starfield.density` | `tokens.backdrop?.starfieldDensity` | Density of background star particles (range: 0–1) |
| `backdrop.vignette.intensity` | `tokens.backdrop?.vignetteIntensity` | Vignette darkening at screen edges (range: 0–1) |

### Selection

Controls how selected and non-selected elements look during an active selection.

| Token Path | Runtime Field | Notes |
|---|---|---|
| `selection.halo.color` | `tokens.selection?.haloColor` | Color of the radial halo ring around selected nodes |
| `selection.halo.maxRadiusRatio` | `tokens.selection?.haloMaxRadiusRatio` | Max halo radius as a ratio of node size (range: 0.20–0.28) |
| `selection.glitter.densityScale` | `tokens.selection?.glitterDensityScale` | Glitter particle density during selection (range: 0–1.2) |
| `selection.dim.opacity` | `tokens.selection?.dimOpacity` | Opacity applied to non-selected elements during selection (range: 0–0.22) |

### Bookmarks

| Token Path | Runtime Field | Notes |
|---|---|---|
| `bookmark.alert.color` | `tokens.bookmark?.alertColor` | Color of alert-type bookmark indicators |
| `bookmark.pinned.color` | `tokens.bookmark?.pinnedColor` | Color of pinned bookmark indicators |
| `bookmark.ref.color` | `tokens.bookmark?.refColor` | Color of reference-type bookmark indicators |

### Panels / Tiles

| Token Path | Runtime Field | Notes |
|---|---|---|
| `panel.tile.handleColor` | `tokens.panel?.tileHandleColor` | Color of tile drag handles |
| `panel.tile.groupOutlineColor` | `tokens.panel?.tileGroupOutlineColor` | Color of the outline drawn around tile groups |

### Inspector

| Token Path | Runtime Field | Notes |
|---|---|---|
| `inspector.radial.spokeColor` | `tokens.inspector?.radialSpokeColor` | Color of the spoke lines in the radial inspector |
| `inspector.radial.haloColor` | `tokens.inspector?.radialHaloColor` | Color of the halo ring in the radial inspector |

### Planned UI Tokens (not yet active)

| Planned Path | Intended Purpose |
|---|---|
| `app.surface` | Mid-level surface color (between background and panel) |
| `accent.secondary` | Secondary accent color |
| `control.background` | Background for interactive controls (sliders, inputs) |
| `control.border` | Border for interactive controls |
| `control.active` | Active/focused state color for controls |
| `panel.card.background` | Card-within-panel background |
| `panel.card.border` | Card-within-panel border |
| `motion.reduce` | Flag for reduced motion preference |
| `visualHandle.panel.background` | Background for visual handle overlay panels |
| `visualHandle.button.background` | Background for visual handle buttons |

---

## CSS Custom Properties (not in canonical path system)

These variables exist in `src/styles/lumaweave-visual-handles.css` and `src/App.css` and are consumed by the visual handle overlay components. They are **not** bound through the `ThemeTarget` system — they're set either at the root or scoped to specific components. Changing a theme does not automatically update these unless the theme explicitly writes them.

### Typography CSS vars (set in `App.css`)
- `--lw-font-display`
- `--lw-font-body`
- `--lw-font-mono`

### Visual handle color vars (set in `lumaweave-visual-handles.css`)
- `--lw-visual-accent` / `--lw-visual-accent-soft` / `--lw-visual-accent-hover`
- `--lw-visual-panel-bg` / `--lw-visual-panel-border`
- `--lw-visual-card-bg` / `--lw-visual-card-border`
- `--lw-visual-badge-bg` / `--lw-visual-badge-text`
- `--lw-visual-divider-color`
- `--lw-visual-button-bg` / `--lw-visual-button-border` / `--lw-visual-button-text` / `--lw-visual-button-hover-bg` / `--lw-visual-button-active-bg`
- `--lw-visual-graph-frame-bg` / `--lw-visual-graph-frame-border`
- `--lw-visual-glow-color` / `--lw-visual-glow-spread`

### App-wide shorthand vars (with fallbacks)
- `--lw-app-background` (fallback: `#0f1420`)
- `--lw-accent` (fallback: `#FFB347`)
- `--lw-text` (fallback: `#e9e4f5`)
- `--lw-text-muted` (fallback: `#a28fc0`)
- `--lw-panel-border` (fallback: `rgba(255, 179, 71, 0.18)`)
- `--lw-flare-gold` (fallback: `#f59e0b`)

---

## Nuances and Findings

### 1. Two distinct override surfaces exist

The `ThemeTarget` binding system (which uses canonical paths) and the CSS custom property layer are **separate**. The `data-lw-theme-target` attribute marks elements that the inspector can target, and overrides are stored via `ThemeTarget` bindings resolved through `resolveThemeTokenPath()`. But the visual handles CSS vars (`--lw-visual-*`) are hardcoded in the stylesheet and don't flow through that pipeline. This means visual handle elements look different from the main app theming in edge cases — they'll reflect whatever was last set in the CSS file, not the active theme override.

### 2. Hover label colors are orphaned from the override system

`graph.node.label` and `graph.edge.label` are canonical and bindable. Their hover counterparts (`nodeLabelHover`, `edgeLabelHover`) live in the runtime token object and are read directly by the graph renderer, but have no canonical path — so you can't create a per-element override for hover label color today. Worth promoting to canonical if per-element hover label color becomes a requested feature.

### 3. `node.geometry.preset` is a special-case non-binding canonical path

It was promoted to canonical in v90a but is explicitly exempt from `ThemeTarget` binding governance. It drives the graphology pipeline's geometry program selection, not a visual property you'd inspect on a rendered element. It doesn't appear in the inspector and isn't selectable as an override target. The fallback default `"glass-sphere"` means themes that omit it still work fine.

### 4. The `node.geometry.preset` token type is `string | number`, but it's always a string

`ThemeTokenValue` is typed as `string | number` (for numeric tokens like durations and opacities), but `node.geometry.preset` returns a string preset name. The resolver correctly handles this but consumers reading this value should assert it's a string before using it as a geometry key.

### 5. Numeric tokens are theme-controlled motion/animation parameters, not just colors

Several canonical paths are numbers, not colors: `effects.glow.intensity`, `backdrop.corona.intensity`, `backdrop.starfield.density`, `backdrop.vignette.intensity`, `node.sphere.humDuration`, `node.sphere.flowDuration`, `node.sphere.glowStrength`, `edge.plasma.flowSpeed`, `selection.halo.maxRadiusRatio`, `selection.glitter.densityScale`, `selection.dim.opacity`, `panel.blur.amount`. These all change the feel of the UI (animation speed, blur, glow weight) in addition to the color-based tokens. A "theme settings adjustment" will affect these too, not just colors.

### 6. The `PLANNED` list is the roadmap for what's *almost* in reach

The 12 planned paths represent subsystems the codebase is ready to receive but hasn't fully wired yet. `control.background/border/active` and `panel.card.background/border` are the most likely to unlock interactive control customization once all six themes populate them. `motion.reduce` is notable as it would be a boolean flag rather than a color or number — a different kind of token than what currently exists.

### 7. Six themes, identical shape

All six themes (`Solar Plasma`, `Obsidian Aurora`, `Midnight Loom`, `Void Circuit`, `Agartha Dream`, `Agartha Dusk`) are expected to populate every canonical path before a path can be promoted. The `validateThemeTokenPaths()` function in `themeTokenPaths.ts` enforces this — it filters for any path that resolves to `undefined` or `null` against a given theme's runtime tokens.

### 8. CSS-only font sizes and weights are not tokenized

Font sizes (0.75rem, 0.875rem, 12px, 11px, 10px) and weights (400, 500, 600) in `lumaweave-visual-handles.css` are hardcoded, not drawn from any token. The typography token system only covers font *family* selection — you can swap Space Grotesk for another display font but you can't change the type scale or weight via theme settings today. This is a gap if per-element font-size or weight customization becomes desirable.

---

## Quick-Reference: Full Canonical Path List (42 total)

```
# Text tokens (8)
text.primary
text.muted
graph.node.label
graph.edge.label
typography.font.display
typography.font.body
typography.font.mono
  + graph.node.label (hover variant not canonical — see nuance #2)

# App / Shell (6)
app.background
app.glow
panel.background
panel.border
accent.primary
panel.blur.amount

# Graph — Nodes (7)
graph.node.fill
graph.node.hoverFill
graph.node.selectedFill
node.geometry.preset          ← special-case, not a ThemeTarget binding
node.sphere.humDuration
node.sphere.flowDuration
node.sphere.glowStrength

# Graph — Edges (5)
graph.edge.stroke
graph.edge.hoverStroke
graph.edge.selectedStroke
edge.style.preset
edge.plasma.flowSpeed

# Effects (1)
effects.glow.intensity

# Backdrop (5)
backdrop.corona.color
backdrop.corona.intensity
backdrop.flare.color
backdrop.starfield.density
backdrop.vignette.intensity

# Selection (4)
selection.halo.color
selection.halo.maxRadiusRatio
selection.glitter.densityScale
selection.dim.opacity

# Bookmarks (3)
bookmark.alert.color
bookmark.pinned.color
bookmark.ref.color

# Panels / Tiles (2)
panel.tile.handleColor
panel.tile.groupOutlineColor

# Inspector (2)
inspector.radial.spokeColor
inspector.radial.haloColor
```

---

## Promotion History

| Pass | Date | Paths Promoted | Reason |
|---|---|---|---|
| pre-v86a | — | 16 paths | Original set |
| v86a | 2026-05-08 | 24 paths | All six themes populated values; ready for binding |
| v90a | 2026-05-22 | 1 path (`node.geometry.preset`) | Special-case graph-visual attribute; exempt from standard staging |
