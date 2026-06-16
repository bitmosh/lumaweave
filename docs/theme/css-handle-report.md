# LumaWeave CSS Handle Report

Maps every `--lw-*` CSS custom property: what theme token sets it, what it affects in the UI, and where tokens share variables or variables share sources.

**Written:** 2026-06-03  
**Source files audited:** `AppShell.tsx`, `App.css`, `lumaweave-visual-handles.css`, `SettingsPanel.css`, `palette.css`, `topbar.css`, `StatusBar.css`, `MinimapShell.tsx`, `MinimapChrome.tsx`, `MinimapSnapshotCanvas.tsx`, `themeCrossfade.ts`, `SettingsStatusBar.tsx`, all inspector CSS files

---

## How CSS Vars Are Set

There are five distinct sources that write `--lw-*` variables, at different DOM scopes:

| Source | Scope | Reactive to theme? |
|---|---|---|
| `App.css :root` | Document root | No — static at build time |
| `lumaweave-visual-handles.css :root` | Document root | No — static fallbacks |
| `themeCrossfade.ts` `setProperty()` | `document.documentElement` | Yes — only `--lw-app-background` |
| `AppShell.tsx` `<main style={...}>` | `<main>` element and all descendants | Yes — all theme tokens |
| `SettingsStatusBar.tsx` `setProperty()` | `document.documentElement` | No — opacity slider only |

**Important:** AppShell sets CSS vars on `<main>`, not `:root`. Components rendered outside `<main>` (e.g., portals, modals mounted at body) inherit the static `:root` fallbacks from `lumaweave-visual-handles.css`, not the live theme values.

---

## Theme Token → CSS Variable Map

Every theme token path and the CSS variable it populates. Variables in **bold** go through the ThemeTarget override system before being written (see [state-layers.md]).

### App / Shell tokens

| Token path | Runtime field | CSS variable | What it affects |
|---|---|---|---|
| `app.background` | `tokens.app.background` | `--lw-app-background` | Root app background color — `<main>` background, settings panel glow backdrop, slider thumb background |
| `app.panelBackground` | `tokens.app.panelBackground` | `--lw-panel-background` | All `.lw-panel`, `.lw-card` backgrounds, settings panel, minimap shell |
| `app.panelBorder` | `tokens.app.panelBorder` | **`--lw-panel-border`** | Panel borders, card borders, tile borders, tile head dividers, topbar borders, command palette borders — the single most-consumed var in the codebase |
| `app.textPrimary` | `tokens.app.textPrimary` | **`--lw-text-primary`** | All primary text, tile titles, settings labels, command palette text, inspector node labels |
| `app.textMuted` | `tokens.app.textMuted` | `--lw-text-muted` | Secondary text, tile grip, settings descriptions, status bar, slider track background |
| `app.accent` | `tokens.app.accent` | **`--lw-accent`** | Active states, focus rings, tile buttons (hover/active), snap guide lines, group titles, override indicator dots, minimap opacity bar |
| `app.glow` | `tokens.app.glow` | `--lw-app-glow` | Glow in elevated UI elements — settings panel hover glow, active button glow, focused input glow |

### Inspector tokens

| Token path | Runtime field | CSS variable | What it affects |
|---|---|---|---|
| `inspector.radial.spokeColor` | `tokens.inspector.radialSpokeColor` | `--lw-inspector-radial-spoke-color` | SVG fill color of spoke nodes in the radial inspector menu |
| `inspector.radial.spokeColor` | `tokens.inspector.radialSpokeColor` | `--lw-inspector-radial-root-color` | SVG fill color of the center/root node in the radial inspector |
| `inspector.radial.haloColor` | `tokens.inspector.radialHaloColor` | `--lw-inspector-radial-root-border` | SVG stroke color of the halo ring around the root node |
| `app.textPrimary` | `tokens.app.textPrimary` | `--lw-inspector-radial-text` | SVG text fill inside radial inspector nodes (spoke labels, root label) |

### Tier 1 primitive color tokens (not canonical paths)

These are read directly from `themePrimitives[themeId]` — they bypass the canonical token path system and the ThemeTarget override mechanism.

| Source | CSS variable | What it affects |
|---|---|---|
| `themePrimitives[theme].color.flare[500]` | `--lw-color-flare-500` | HexLogo flare arm color, settings panel danger/alert indicators, topbar flare element |
| `themePrimitives[theme].color.magenta[500]` | `--lw-color-magenta-500` | HexLogo magenta arm, topbar wordmark gradient stop, radial inspector gradient |
| `themePrimitives[theme].color.purple[500]` | `--lw-color-purple-500` | HexLogo purple arm, topbar wordmark gradient stop, radial inspector gradient |
| `themePrimitives[theme].color.gold[500]` | `--lw-color-gold-500` | HexLogo center fill, topbar wordmark gold stop, settings panel gold indicators |

### Typography tokens (currently inert)

| Token path | Runtime field | CSS variable | Status |
|---|---|---|---|
| `typography.font.display` | `tokens.typography?.fontDisplay` | `--lw-font-display` | **Disconnected** — the CSS var is set statically in `App.css :root` and never updated from the runtime token. The token value exists in all 6 themes but no code reads it to write this var. |
| `typography.font.body` | `tokens.typography?.fontBody` | `--lw-font-body` | Same — static only |
| `typography.font.mono` | `tokens.typography?.fontMono` | `--lw-font-mono` | Same — static only |

Font vars affect: tile titles, tile body text, settings labels, minimap readouts, all UI typography. They do respond to CSS inheritance — body uses `var(--lw-font-body)` globally — but they never change because the runtime token never writes them.

---

## CSS Variables with No Theme Token (Static / Not Theme-Reactive)

These vars exist in the CSS layer but are not connected to the runtime token system. Changing the theme does not affect them.

### `--lw-visual-*` (17 variables — all static in `:root`)

Declared in `lumaweave-visual-handles.css`. These are hardcoded fallback values that apply when no live theme value is present. They all use a cyan accent (`rgba(34, 211, 238, ...)`) regardless of theme.

| Variable | Value | Affects |
|---|---|---|
| `--lw-visual-accent` | `rgba(34, 211, 238, 0.9)` | All `input[type="range"]` accent-color and slider track fill; `.lw-button` hover/active border; all node/edge glow CSS classes |
| `--lw-visual-accent-soft` | `rgba(34, 211, 238, 0.22)` | Declared but no consumers found — scaffolding |
| `--lw-visual-accent-hover` | `rgba(34, 211, 238, 1)` | Declared but no consumers found — scaffolding |
| `--lw-visual-panel-bg` | `rgba(15, 23, 42, 0.72)` | `.lw-ambient-shell`, `.lw-panel-aurora` backgrounds |
| `--lw-visual-panel-border` | `rgba(148, 163, 184, 0.24)` | `.lw-panel` border fallback |
| `--lw-visual-card-bg` | `rgba(15, 23, 42, 0.48)` | `.lw-card` background fallback |
| `--lw-visual-card-border` | `rgba(148, 163, 184, 0.18)` | `.lw-card` border fallback |
| `--lw-visual-badge-bg` | `rgba(34, 211, 238, 0.15)` | `.lw-badge` background |
| `--lw-visual-badge-text` | `rgba(34, 211, 238, 0.95)` | `.lw-badge` text color |
| `--lw-visual-divider-color` | `rgba(148, 163, 184, 0.16)` | `.lw-divider` background |
| `--lw-visual-button-bg` | `rgba(34, 211, 238, 0.12)` | `.lw-button` default background |
| `--lw-visual-button-border` | `rgba(34, 211, 238, 0.3)` | `.lw-button` default border |
| `--lw-visual-button-text` | `rgba(241, 245, 249, 0.95)` | `.lw-button` text color |
| `--lw-visual-button-hover-bg` | `rgba(34, 211, 238, 0.2)` | `.lw-button:hover` background |
| `--lw-visual-button-active-bg` | `rgba(34, 211, 238, 0.28)` | `.lw-button:active` and `.lw-button-active` background |
| `--lw-visual-graph-frame-bg` | `rgba(2, 6, 23, 0.5)` | `.lw-graph-frame` background |
| `--lw-visual-graph-frame-border` | `rgba(34, 211, 238, 0.15)` | `.lw-graph-frame` border |
| `--lw-visual-glow-color` | `rgba(34, 211, 238, 0.4)` | `.lw-node-glow`, `.lw-edge-glow` box-shadow color (not yet wired to Sigma) |
| `--lw-visual-glow-spread` | `8px` | `.lw-node-glow`, `.lw-edge-glow` box-shadow spread |

**Note:** `--lw-visual-accent` is also written by AppShell (`<main style={{ "--lw-visual-accent": topbarAccent }}>`) to the same value as `--lw-accent`. So inside `<main>`, `--lw-visual-accent` is theme-reactive. Outside `<main>` (e.g., portals), it's the static cyan.

### Settings opacity vars (not theme tokens)

Set by `SettingsStatusBar.tsx` on `document.documentElement` when the opacity slider is adjusted.

| Variable | Value source | Affects |
|---|---|---|
| `--lw-settings-bg-opacity` | Opacity slider (0–1) | Settings panel background transparency |
| `--lw-settings-chrome-opacity` | Mapped slider (0.6–1) | Settings panel border/button opacity via `--lw-panel-border-current` |
| `--lw-settings-text-opacity` | Always `"1"` | Text always fully opaque (unchanged by opacity slider) |

---

## Orphaned Variables (Used but Never Set)

These vars appear in `var()` calls but are never declared or written anywhere. They always fall through to their fallback values — effectively making them hardcoded constants in disguise.

| Variable | Fallback used | Where consumed | Intended connection |
|---|---|---|---|
| `--lw-glow` | `rgba(255, 179, 71, 0.12)` / `rgba(255, 107, 26, 0.08)` in tile CSS; **no fallback** in `SettingsPanel.css` | Tile box-shadows, group-bar glow, SettingsPanel.css (14 uses as box-shadow) | Should be aliased from `--lw-app-glow` — likely a naming split that was never reconciled |
| `--lw-panel-bg` | `rgba(27, 8, 48, 0.92)` | Tile backgrounds, tile-head gradient | Should track `--lw-panel-background` or `app.panelBackground` |
| `--lw-app-bg` | `rgba(11, 4, 22, 0.96)` | Tile background gradient second stop | Should track `--lw-app-background` or `app.background` |
| `--lw-flare-gold` | `#f59e0b` | Tiled-out indicator pulse dot | Could be wired to `--lw-color-gold-500` or the `bookmark.alert.color` token |
| `--lw-panel-blur` | `14px` | Minimap shell `backdrop-filter` blur amount | Should be wired to `panel.blur.amount` token (`tokens.panel?.blurAmount`) |
| `--lw-numeric-accent` | `var(--lw-text-primary)` | Minimap numeric readouts (zoom %, opacity %) | No obvious token — could be `accent.primary` or a new planned token |
| `--lw-tile-handle` | `var(--lw-text-muted)` | Minimap resize handle color | Could be wired to `panel.tile.handleColor` token |
| `--lw-graph-node-fill` | `rgba(255,200,160,0.85)` | Minimap canvas node fill (drawn via `getComputedStyle`) | Should be wired to `graph.node.fill` token — minimap always renders hardcoded fallback |
| `--lw-graph-edge-stroke` | `rgba(255,200,160,0.16)` | Minimap canvas edge stroke (drawn via `getComputedStyle`) | Should be wired to `graph.edge.stroke` token — minimap always renders hardcoded fallback |

**`--lw-glow` in SettingsPanel.css is a silent failure:** 14 `box-shadow` declarations use `var(--lw-glow)` without a fallback. Since the var is never set, these box-shadows compute as invalid values and silently don't render. The `--lw-app-glow` variable exists and holds the correct value — this is almost certainly a naming divergence where one name was renamed and the CSS file wasn't updated.

---

## Shared Sources (Multiple Vars from the Same Token)

### `accent.primary` → two CSS vars (always identical)

```
tokens.app.accent
  ↓ topbarAccent = useResolvedTargetColor("topbar.root", "accent.primary", ...)
    ├─ --lw-accent        (set on <main>)
    └─ --lw-visual-accent (set on <main>) — same value
```

`--lw-accent` and `--lw-visual-accent` are always written to the same value. The split exists because older components use the `--lw-visual-*` namespace while newer ones use `--lw-accent`. Both are now theme-reactive inside `<main>`.

### `inspector.radial.spokeColor` → two CSS vars (always identical)

```
tokens.inspector.radialSpokeColor (crossfadeTokens)
  ├─ --lw-inspector-radial-spoke-color  → SpokeNode SVG fill
  └─ --lw-inspector-radial-root-color   → RootNode SVG fill
```

Different element types, same underlying color. Could be collapsed to one var if spoke and root always share a color.

### `app.textPrimary` → two CSS vars (different paths)

```
tokens.app.textPrimary
  ├─ via topbarText (override-aware):
  │    --lw-text-primary               → all UI text
  └─ via crossfadeTokens (raw, no override):
       --lw-inspector-radial-text      → text inside radial inspector SVG nodes
```

These can diverge if a per-element color override is applied to `topbar.root` → `text.primary`. In that case, `--lw-text-primary` gets the override color but `--lw-inspector-radial-text` stays on the base theme color.

### `app.background` → written twice (same value, different scopes)

```
tokens.app.background (crossfadeTokens)
  ├─ AppShell <main style={...}>
  │    --lw-app-background on <main> and descendants
  └─ themeCrossfade.ts line 107:
       document.documentElement.style.setProperty("--lw-app-background", background)
       → for Playwright probe access (reads computed root style)
```

The `:root` write from `themeCrossfade.ts` is a dev/test probe — it makes `--lw-app-background` readable via `getComputedStyle(document.documentElement)` in tests. It does not affect rendering (the `<main>` scoped var takes precedence within the app).

---

## Theme Tokens with No CSS Variable

These token values exist in the runtime token object and are consumed by JS directly — they never become CSS custom properties. They are passed as props to components (SigmaGraphView, SolarBackdrop, etc.) or read inline.

| Token domain | Fields | Consumed by |
|---|---|---|
| `graph.*` | nodeDefault/Hover/Selected, nodeSecondary/Tertiary, edgeDefault/Hover/Selected, nodeLabel, edgeLabel, nodeColorScale, edgeColorScale | SigmaGraphView directly (Graphology node/edge attributes) |
| `effects.*` | glitterEnabled, starfieldEnabled, glowIntensity | Overlay components via props |
| `backdrop.*` | coronaColor, coronaIntensity, flareColor, starfieldDensity, vignetteIntensity | SolarBackdrop via props |
| `node.*` | sphereHumDuration, sphereFlowDuration, sphereGlowStrength, geometryPreset | SigmaGraphView shader uniforms |
| `edge.*` | stylePreset, plasmaFlowSpeed | SigmaGraphView edge program |
| `selection.*` | haloColor, haloMaxRadiusRatio, glitterDensityScale, dimOpacity | SigmaGraphView selection policy |
| `bookmark.*` | alertColor, pinnedColor, refColor | BookmarkLayer via props |
| `panel.*` | blurAmount, tileHandleColor, tileGroupOutlineColor | Currently not wired to CSS — `--lw-panel-blur` exists but is unset |

---

## Full Variable Inventory

| Variable | Set by | Theme-reactive? | Primary consumers |
|---|---|---|---|
| `--lw-app-background` | AppShell `<main>`, crossfade `documentElement` | Yes | Slider thumb background, settings panel backdrop glow |
| `--lw-panel-background` | AppShell `<main>` | Yes | `.lw-panel`, `.lw-card`, settings panel, minimap shell |
| `--lw-panel-border` | AppShell `<main>` (override-aware) | Yes | Tiles, cards, topbar, command palette, inspector — most-used var |
| `--lw-text-primary` | AppShell `<main>` (override-aware) | Yes | All UI text, tile titles, settings labels |
| `--lw-text-muted` | AppShell `<main>` | Yes | Secondary text, grip icons, slider track |
| `--lw-accent` | AppShell `<main>` (override-aware) | Yes | Active/focus states, tile buttons, snap guides, group titles |
| `--lw-visual-accent` | `:root` (static) + AppShell `<main>` (override) | Yes inside `<main>`, no outside | Slider accent-color, `.lw-button` hover border |
| `--lw-app-glow` | AppShell `<main>` | Yes | Settings panel glow, focused element glow |
| `--lw-inspector-radial-spoke-color` | AppShell `<main>` | Yes | Radial inspector spoke node SVG fill |
| `--lw-inspector-radial-root-color` | AppShell `<main>` | Yes | Radial inspector root node SVG fill |
| `--lw-inspector-radial-root-border` | AppShell `<main>` | Yes | Radial inspector root node SVG stroke (halo) |
| `--lw-inspector-radial-text` | AppShell `<main>` | Yes | Radial inspector node label text |
| `--lw-color-flare-500` | AppShell `<main>` | Yes (Tier 1 primitive) | HexLogo, topbar wordmark, settings danger indicators |
| `--lw-color-magenta-500` | AppShell `<main>` | Yes (Tier 1 primitive) | HexLogo, topbar wordmark, radial inspector gradient |
| `--lw-color-purple-500` | AppShell `<main>` | Yes (Tier 1 primitive) | HexLogo, topbar wordmark, radial inspector gradient |
| `--lw-color-gold-500` | AppShell `<main>` | Yes (Tier 1 primitive) | HexLogo center, topbar wordmark, settings gold indicators |
| `--lw-font-display` | `App.css :root` | **No** (token disconnected) | All display/heading text, tile titles |
| `--lw-font-body` | `App.css :root` | **No** (token disconnected) | Body text globally |
| `--lw-font-mono` | `App.css :root` | **No** (token disconnected) | Code, minimap readouts, tiled-out indicator |
| `--lw-settings-bg-opacity` | SettingsStatusBar `setProperty` | No (opacity slider) | Settings panel background transparency |
| `--lw-settings-chrome-opacity` | SettingsStatusBar `setProperty` | No (opacity slider) | Settings panel border/button opacity |
| `--lw-settings-text-opacity` | SettingsStatusBar `setProperty` | No (always `"1"`) | Settings panel text opacity (always 100%) |
| `--lw-visual-*` (17 vars) | `lumaweave-visual-handles.css :root` | **No** (static) | Fallback buttons, badges, panels — active only outside `<main>` or for `.lw-button`/`.lw-badge` etc. |
| `--lw-glow` | **Never set** ⚠️ | — | 14 SettingsPanel.css box-shadows (silent fail), tile/group-bar glow (with fallback) |
| `--lw-panel-bg` | **Never set** | — | Tile backgrounds (fallback `rgba(27, 8, 48, 0.92)`) |
| `--lw-app-bg` | **Never set** | — | Tile background gradient (fallback `rgba(11, 4, 22, 0.96)`) |
| `--lw-flare-gold` | **Never set** | — | Tiled-out indicator dot (fallback `#f59e0b`) |
| `--lw-panel-blur` | **Never set** | — | Minimap backdrop blur (fallback `14px`) |
| `--lw-numeric-accent` | **Never set** | — | Minimap numeric readouts (fallback `var(--lw-text-primary)`) |
| `--lw-tile-handle` | **Never set** | — | Minimap resize handle (fallback `var(--lw-text-muted)`) |
| `--lw-graph-node-fill` | **Never set** | — | Minimap canvas node fill (fallback `rgba(255,200,160,0.85)`) |
| `--lw-graph-edge-stroke` | **Never set** | — | Minimap canvas edge stroke (fallback `rgba(255,200,160,0.16)`) |

---

## Issues and Wiring Gaps

### Critical: `--lw-glow` is unset, breaking SettingsPanel.css box-shadows

`SettingsPanel.css` uses `var(--lw-glow)` in 14 box-shadow declarations without a fallback value. Since `--lw-glow` is never set, these all compute as invalid and the box-shadows don't render. The intended variable almost certainly is `--lw-app-glow` (which IS set by AppShell from `tokens.app.glow`).

**Fix:** Add `--lw-glow: var(--lw-app-glow)` as an alias in `lumaweave-visual-handles.css :root`, or globally replace `--lw-glow` with `--lw-app-glow` in `SettingsPanel.css`.

### Minimap ignores the theme for node/edge colors

`MinimapSnapshotCanvas.tsx` reads `--lw-graph-node-fill` and `--lw-graph-edge-stroke` from computed styles, but these are never set — so the minimap always draws nodes and edges in the hardcoded fallback colors `rgba(255,200,160,0.85)` and `rgba(255,200,160,0.16)` regardless of theme. The graph tokens `graph.node.fill` and `graph.edge.stroke` hold the correct per-theme values but are never written to CSS.

**Fix:** AppShell should write:
```typescript
"--lw-graph-node-fill": themeTokens.graph.nodeDefault,
"--lw-graph-edge-stroke": themeTokens.graph.edgeDefault,
```

### Tiles don't follow the theme for backgrounds and glow

Tiles use `--lw-panel-bg`, `--lw-app-bg`, and `--lw-glow` with hardcoded fallbacks — bypassing the live theme system. The tile backgrounds are always the dark purple/navy values regardless of active theme.

**Fix:** AppShell should write `--lw-panel-bg` and `--lw-app-bg` from `tokens.app.panelBackground` and `tokens.app.background` (or the tile-specific theme token if one is created).

### Typography tokens exist but never drive their CSS vars

The runtime token object has `typography.fontDisplay`, `typography.fontBody`, `typography.fontMono` populated in all 6 themes, but `--lw-font-display`, `--lw-font-body`, `--lw-font-mono` are set statically in `App.css` once and never updated. Swapping themes has no effect on typography.

**Fix:** AppShell should write the three `--lw-font-*` vars from `themeTokens.typography` when it has values.

### `--lw-panel-blur` doesn't follow the `panel.blur.amount` token

The token exists (`panel.blur.amount` ranges from 8–20px across themes) and the minimap shell reads `--lw-panel-blur`, but nothing connects them.

**Fix:** AppShell should write `"--lw-panel-blur": themeTokens.panel?.blurAmount + "px"`.

### `--lw-accent` and `--lw-visual-accent` are redundant duplicates

Both are always written to the same value (`topbarAccent`). Older components use `--lw-visual-accent`, newer ones use `--lw-accent`. The split is purely historical.

**Not urgent** — both work. Long-term: migrate all consumers to `--lw-accent` and drop the `--lw-visual-accent` write from AppShell (the `:root` fallback in `lumaweave-visual-handles.css` can stay for non-`<main>` contexts).
