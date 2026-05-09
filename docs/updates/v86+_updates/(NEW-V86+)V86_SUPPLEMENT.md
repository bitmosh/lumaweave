# V86 SUPPLEMENT — Missing Pieces
## Adds to V86_BANDIT_MASTER_INDEX.md

Read the master index first. This document fills three gaps.

---

## SUPPLEMENT 1 — Neutral defaults for 5 non-Solar-Plasma themes

Contract #2: every theme declares every canonical path. No inheritance until v88.
The 24 new paths MUST be declared in all 6 themes in v86a.
Solar Plasma values are in the master index. Below are neutral defaults for the other 5.

When adding to themeTokens.ts, use these values for each non-Solar-Plasma theme.
They are intentionally conservative — v87 retrofits thoughtful per-theme values.

```typescript
// Add to ALL 5 remaining themes (obsidianAurora, midnightLoom, voidCircuit,
// agarthaDream, agarthaDusk). Paste these into each theme's graph section.
// v87 will replace these with proper per-theme values.

"backdrop.corona.color":          "rgba(100,100,100,0.15)"
"backdrop.corona.intensity":      "0.4"
"backdrop.flare.color":           "rgba(100,100,100,0.25)"
"backdrop.starfield.density":     "0.5"
"backdrop.vignette.intensity":    "0.7"
"node.sphere.humDuration":        "4.0"
"node.sphere.flowDuration":       "4.0"
"node.sphere.glowStrength":       "0.8"
"edge.style.preset":              "\"line\""
"edge.plasma.flowSpeed":          "0.4"
"selection.halo.color":           // use each theme's existing accent color
  obsidianAurora:  "rgba(139,92,246,0.6)"
  midnightLoom:    "rgba(251,191,36,0.6)"
  voidCircuit:     "rgba(236,72,153,0.6)"
  agarthaDream:    "rgba(168,85,247,0.6)"
  agarthaDusk:     "rgba(244,114,182,0.6)"
"selection.halo.maxRadiusRatio":  "2.0"
"selection.glitter.densityScale": "0.8"
"selection.dim.opacity":          "0.18"  // same across all themes
"bookmark.alert.color":           "rgba(248,113,113,0.7)"   // same all themes
"bookmark.pinned.color":          "rgba(100,217,164,0.7)"   // same all themes
"bookmark.ref.color":             "rgba(147,197,253,0.7)"   // same all themes
"panel.blur.amount":              "16"   // same across all themes
"panel.tile.handleColor":         // use each theme's accent color at 0.6 opacity
  obsidianAurora:  "rgba(139,92,246,0.6)"
  midnightLoom:    "rgba(251,191,36,0.6)"
  voidCircuit:     "rgba(236,72,153,0.6)"
  agarthaDream:    "rgba(168,85,247,0.6)"
  agarthaDusk:     "rgba(244,114,182,0.6)"
"panel.tile.groupOutlineColor":   // use each theme's accent at 0.4 opacity
  obsidianAurora:  "rgba(139,92,246,0.4)"
  midnightLoom:    "rgba(251,191,36,0.4)"
  voidCircuit:     "rgba(236,72,153,0.4)"
  agarthaDream:    "rgba(168,85,247,0.4)"
  agarthaDusk:     "rgba(244,114,182,0.4)"
"inspector.radial.spokeColor":    // use each theme's accent
  obsidianAurora:  "#8b5cf6"
  midnightLoom:    "#fbbf24"
  voidCircuit:     "#ec4899"
  agarthaDream:    "#a855f7"
  agarthaDusk:     "#f472b6"
"inspector.radial.haloColor":     // use each theme's accent at 0.5 opacity
  obsidianAurora:  "rgba(139,92,246,0.5)"
  midnightLoom:    "rgba(251,191,36,0.5)"
  voidCircuit:     "rgba(236,72,153,0.5)"
  agarthaDream:    "rgba(168,85,247,0.5)"
  agarthaDusk:     "rgba(244,114,182,0.5)"
"typography.font.display":        "'Space Grotesk', system-ui, sans-serif"  // same all
"typography.font.body":           "'IBM Plex Sans', system-ui, sans-serif"  // same all
"typography.font.mono":           "'IBM Plex Mono', 'Fira Code', monospace" // same all
```

### How to wire this in themeTokens.ts

The 24 new paths don't map to the existing `ThemeRuntimeTokens` shape directly.
The tier model adds new top-level sections (backdrop, node.sphere, edge, selection,
bookmark, panel.tile, inspector.radial, typography).

Options — pick ONE and be consistent:

**Option A (recommended for v86a):** Extend `ThemeRuntimeTokens` in `theme.types.ts`
with new optional sections. Populate Solar Plasma fully, other themes with neutrals.
v87 populates thoughtful values for all themes.

```typescript
// theme.types.ts additions
export interface ThemeRuntimeTokens {
  app: { ... };       // existing
  graph: { ... };     // existing
  effects: { ... };   // existing
  // NEW v86a:
  backdrop?: {
    corona: { color: string; intensity: string };
    flare: { color: string };
    starfield: { density: string };
    vignette: { intensity: string };
  };
  nodeSphere?: {
    humDuration: string;
    flowDuration: string;
    glowStrength: string;
  };
  edgeStyle?: {
    preset: string;
    plasma: { flowSpeed: string };
  };
  selection?: {
    halo: { color: string; maxRadiusRatio: string };
    glitter: { densityScale: string };
    dim: { opacity: string };
  };
  bookmark?: {
    alert: { color: string };
    pinned: { color: string };
    ref: { color: string };
  };
  panel?: {
    blur: { amount: string };
    tile: { handleColor: string; groupOutlineColor: string };
  };
  inspector?: {
    radial: { spokeColor: string; haloColor: string };
  };
  typography?: {
    font: { display: string; body: string; mono: string };
  };
}
```

Make all new sections optional (`?`) so existing code compiles before v86a populates them.
After v86a: all 6 themes declare all new sections. No optionals needed from v87 onward.

**Option B:** Extend themeTokenPaths.ts with the 24 new paths and resolve them
via the existing `resolveGraphVisualTokens` pattern. More work, more correct long-term.
Recommended only if v86a has bandwidth — otherwise defer to v87.

Use Option A for v86a. Note it in the output report.

---

## SUPPLEMENT 2 — applyTheme.ts bridge for new token paths

The existing `applyTheme.ts` maps `ThemeRuntimeTokens` to CSS custom properties
on `document.documentElement`. New token sections need CSS vars so components
can reference `var(--lw-*)` in their styles.

### Add to applyTheme.ts

```typescript
// applyTheme.ts — add inside the applyTheme() function
// After existing app/graph/effects CSS var block:

if (tokens.backdrop) {
  el.style.setProperty("--lw-backdrop-corona-color",
    tokens.backdrop.corona.color);
  el.style.setProperty("--lw-backdrop-corona-intensity",
    tokens.backdrop.corona.intensity);
  el.style.setProperty("--lw-backdrop-flare-color",
    tokens.backdrop.flare.color);
  el.style.setProperty("--lw-backdrop-starfield-density",
    tokens.backdrop.starfield.density);
  el.style.setProperty("--lw-backdrop-vignette-intensity",
    tokens.backdrop.vignette.intensity);
}

if (tokens.nodeSphere) {
  el.style.setProperty("--lw-node-hum-duration",
    tokens.nodeSphere.humDuration);
  el.style.setProperty("--lw-node-flow-duration",
    tokens.nodeSphere.flowDuration);
  el.style.setProperty("--lw-node-glow-strength",
    tokens.nodeSphere.glowStrength);
}

if (tokens.selection) {
  el.style.setProperty("--lw-selection-halo-color",
    tokens.selection.halo.color);
  el.style.setProperty("--lw-selection-dim-opacity",
    tokens.selection.dim.opacity);
  el.style.setProperty("--lw-selection-glitter-density",
    tokens.selection.glitter.densityScale);
}

if (tokens.panel) {
  el.style.setProperty("--lw-panel-blur",
    `${tokens.panel.blur.amount}px`);
  el.style.setProperty("--lw-tile-handle-color",
    tokens.panel.tile.handleColor);
  el.style.setProperty("--lw-tile-group-outline",
    tokens.panel.tile.groupOutlineColor);
}

if (tokens.typography) {
  el.style.setProperty("--lw-font-display",
    tokens.typography.font.display);
  el.style.setProperty("--lw-font-body",
    tokens.typography.font.body);
  el.style.setProperty("--lw-font-mono",
    tokens.typography.font.mono);
}
```

### Add to lumaweave-visual-handles.css

```css
/* Typography base — applied after font vars are set by applyTheme */
body,
.lw-body {
  font-family: var(--lw-font-body, system-ui, sans-serif);
}

h1, h2, h3, h4, h5, h6,
.lw-display {
  font-family: var(--lw-font-display, system-ui, sans-serif);
}

code, pre, .lw-mono {
  font-family: var(--lw-font-mono, monospace);
}

/* Panel blur — consumed by panel components */
.lw-panel {
  backdrop-filter: blur(var(--lw-panel-blur, 16px));
  -webkit-backdrop-filter: blur(var(--lw-panel-blur, 16px));
}
```

### Verify in browser after v86a

```javascript
// Run in DevTools console to confirm bridge works:
getComputedStyle(document.documentElement)
  .getPropertyValue('--lw-backdrop-corona-color')
// Expected: "rgba(255,179,71,0.28)" for Solar Plasma
// If empty string: applyTheme.ts bridge not running
```

---

## SUPPLEMENT 3 — Prototype reference guidance

The project knowledge contains `(NEW)_*.jsx` files from the Claude Design session.
These are reference implementations — visual targets, not direct ports.

```
(NEW)_app.jsx              — top-level composition reference
(NEW)_shell.jsx            — TopBar + layout structure reference
(NEW)_graph-view.jsx       — overlay layer reference (click halo, minimap, camera)
(NEW)_tweaks-panel.jsx     — settings/tweaks UI reference
(NEW)_tile-system.jsx      — tile system behavior reference
(NEW)_inspector-overlay.jsx — inspector radial menu reference
(NEW)_LumaWeave Solar Plasma.html — combined prototype (open in browser)
```

### How to use them

Read for visual intent and interaction behavior.
Do NOT port code directly — the prototype is standalone React with no
TypeScript, no Graphology, no FA2 worker, no Sigma, no settings store.

When implementing a feature in v86b/c/d, open the relevant prototype file
and use it to understand what the user wants to see and feel.
Then implement it correctly in the actual src architecture.

### Key divergences to know

| Prototype | Correct src approach |
|---|---|
| Inline `tweaks` state | `useSettingsStore` + `settings.appearance.*` |
| Hand-rolled SVG graph renderer | Do not replace — keep Sigma + NodeSphereProgram |
| Inline tile state `tiledTabs` array | `TileLayoutEntry[]` via `TileProvider` context |
| Direct DOM manipulation for camera | `cameraController.ts` wrapping Sigma camera API |
| Hardcoded Solar Plasma color constants | `var(--lw-*)` CSS custom properties from token system |

---

## SUPPLEMENT VALIDATION

After adding these supplements, v86a Bandit's first typecheck should pass with:
- All 6 themes declaring all 24 new paths (via optional sections in ThemeRuntimeTokens)
- applyTheme.ts generating CSS vars for new paths
- themeTokenGovernance.ts passing (if it validates new paths)
- Migration v2→v3 applied cleanly

Run after v86a:
```bash
# Verify theme governance
node -e "
  const { validateThemeTokens } = require('./src/themes/themeTokens');
  validateThemeTokens();
  console.log('Theme validation complete');
"

# Verify CSS bridge
# Open browser DevTools after app loads:
# getComputedStyle(document.documentElement).getPropertyValue('--lw-font-display')
# Should return: "'Space Grotesk', system-ui, sans-serif"
```

---

*Supplement version: 1.0 — compiled 2026-05-07*  
*Resolves gaps in V86_BANDIT_MASTER_INDEX.md*
