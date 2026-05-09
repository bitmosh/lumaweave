---
id: theme.preset.model
title: Theme Preset Model
type: model
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/themes/themePresets.ts
  - src/themes/themeTokens.ts
  - src/themes/theme.types.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.token.compatibility
  - theme.override.storage.contract
  - asset.bank
tags:
  - theme
  - presets
  - model
  - v86a
---

# Theme Preset Model

Theme presets are named entries that select which set of primitive/semantic/component values become active. The preset itself is metadata; the actual visual values live in the tier files keyed by `themeId`.

The source of truth is `src/themes/themePresets.ts` (the registry) and `src/themes/themeTokens.ts` (per-theme runtime tokens). This doc describes the structure and the six built-in presets.

---

## ThemePreset interface

Defined in `src/themes/theme.types.ts`:

```typescript
export interface ThemePreset {
  /** Unique preset identifier */
  id: ThemePresetId;
  /** Human-readable name */
  name: string;
  /** Description of the preset */
  description?: string;
  /** Whether this is a built-in preset (cannot be deleted) */
  builtIn: boolean;
  /** The theme ID this preset represents */
  themeId: ThemeId;
  /** Optional tags for categorization */
  tags?: string[];
  /** Additional notes */
  notes?: string;

  /** v86a: Asset references for this preset (optional for backward compatibility) */
  assetRefs?: Array<{
    assetId: string;
    type: AssetType;
    purpose: string; // "starfield", "node-shader", etc.
  }>;
}
```

Key points:
- The preset does **not** store token values directly. Values live in tier files.
- The `themeId` field is the bridge — it indexes into `themePrimitives[themeId]`, `themeSemantics[themeId]`, etc.
- `builtIn: true` presets cannot be deleted via UI; user-saved customs would be `builtIn: false` (custom preset save is planned, not yet shipped).
- `assetRefs` is the v86a forward-compat field for the asset bank. Empty in v86a builds; populated in v88+ workshop work.

---

## Six built-in presets

| Preset ID | Display name | Style | Tags | Notes |
|-----------|--------------|-------|------|-------|
| `solar-plasma` | Solar Plasma | Dark sci-fi with cyan and gold plasma | `dark`, `sci-fi` | Default LumaWeave theme. Most fully tuned at v86a. |
| `obsidian-aurora` | Obsidian Aurora | Dark crystalline aurora borealis | `dark`, `aurora` | Inspired by northern lights over dark stone |
| `midnight-loom` | Midnight Loom | Dark warm gold candlelight | `dark`, `warm` | Cozy candlelit workspace |
| `void-circuit` | Void Circuit | Dark cyberpunk neon | `dark`, `cyberpunk` | High-contrast neon aesthetic |
| `agartha-dream` | Agartha Dream | Light pastel dreamy | `light`, `pastel` | Gentle dreamlike workspace. Only light theme in built-in set. |
| `agartha-dusk` | Agartha Dusk | Dark pastel moonlit night | `dark`, `pastel` | Soft moonlit atmosphere |

All six are declared in `builtInThemePresets` array in `themePresets.ts` and exposed via `themePresetRegistry`.

---

## Per-theme tuning state

The presets exist as metadata across all six themes, but theme-specific tuning at the primitive layer is at different stages:

**Solar Plasma** — fully tuned at v86a. Hand-selected values for every primitive (gold plasma `#FFB347`, void background `#03000A`, corona cyan `#00D4FF`, etc.). Reference theme.

**Other 5 themes** — neutral defaults at v86a. Each has its own `<theme>Primitives` object in `tokenPrimitives.ts`, but values are placeholder-quality (often Tailwind-derived slate/violet palettes that don't match the theme's intended visual identity). Theme-specific tuning is queued for v87.

**Tier 2 semantics** are currently identical across all six themes — every theme has the same `surface`, `text`, and `motion` semantic mappings. Theme differentiation flows entirely through Tier 1 primitives at this stage. Tier 2 differentiation may be added in v87+ if themes need different role assignments.

**Tier 3 components** are theme-agnostic by design — there is one `components` object that resolves through whichever Tier 2 / Tier 1 the active theme provides.

---

## ThemeRuntimeTokens shape

Each theme also has a `ThemeRuntimeTokens` object defined in `src/themes/themeTokens.ts`. This is the runtime-resolved value structure that `applyTheme.ts` consumes when applying a theme.

```typescript
export interface ThemeRuntimeTokens {
  app: {
    background, panelBackground, panelBorder,
    textPrimary, textMuted, accent, glow,
  };
  graph: {
    nodeDefault, nodeHover, nodeSelected, nodeSecondary, nodeTertiary,
    edgeDefault, edgeHover, edgeSelected, edgeSecondary, edgeTertiary,
    nodeLabel, nodeLabelHover, edgeLabel, edgeLabelHover,
    nodeColorScale, edgeColorScale,
  };
  effects: {
    glitterEnabled, starfieldEnabled, glowIntensity,
  };
  // v86a additions:
  backdrop: { coronaColor, coronaIntensity, flareColor,
              starfieldDensity, vignetteIntensity };
  node: { sphereHumDuration, sphereFlowDuration, sphereGlowStrength };
  edge: { stylePreset, plasmaFlowSpeed };
  selection: { haloColor, haloMaxRadiusRatio,
               glitterDensityScale, dimOpacity };
  bookmark: { alertColor, pinnedColor, refColor };
  panel: { blurAmount, tileHandleColor, tileGroupOutlineColor };
  inspector: { radialSpokeColor, radialHaloColor };
  typography: { fontDisplay, fontBody, fontMono };
}
```

This shape is what the canonical token paths resolve against. For instance, `graph.node.fill` resolves via `resolveThemeTokenPath` to `tokens.graph.nodeDefault`. The token path is the public vocabulary; the runtime tokens object is the internal storage shape.

---

## Preset selection flow

1. User picks a preset via top bar dropdown.
2. Settings store updates `appearance.theme` to the new preset ID.
3. `applyTheme.ts` runs:
   - Loads `themePrimitives[themeId]`, `themeSemantics[themeId]`, `components`
   - Walks Tier 3 → Tier 2 → Tier 1 to resolve every component's primitive value
   - Writes resolved values to CSS custom properties (`--lw-*`)
4. Stylesheets and components consume the updated CSS vars.
5. Graph elements consume canonical token paths via `resolveThemeTokenPath`.

---

## Custom presets (planned, not shipped)

Custom user-saved presets are forward-compat planned but not yet implemented. The interface field `builtIn: false` exists for them. The override storage contract (see [Theme Override Storage Contract](theme.override.storage.contract)) defines how user-authored token overrides layer on top of base presets without mutating canonical preset definitions.

User customization roadmap is tracked in [Theme Customization Roadmap](theme.customization.roadmap).

---

## Asset references (forward-compat)

The `assetRefs` array on each preset is the binding to the asset bank — a v86a contract that's "empty bank, contract live" today and gets populated in v88+ workshop work.

When populated, each `assetRef` declares:
- `assetId` — identifier of an asset in the asset bank
- `type` — asset type (texture / shader / animation / etc.)
- `purpose` — what slot in the theme it fills (e.g. "starfield", "node-shader")

Asset bank governance is documented separately. The key compatibility rule: asset bank entries cannot create parallel token paths or bypass canonical token resolution. See [Theme Token Compatibility](theme.token.compatibility).

---

## What this doc does not cover

- Specific Tier 1 primitive values per theme — see `tokenPrimitives.ts`
- Specific Tier 2 semantic mappings — see `tokenSemantics.ts`
- Tier 3 component structure — see `tokenComponents.ts`
- Canonical path catalog — see [Theme Token Path Map](theme.token.path.map)
- Override storage rules — see [Theme Override Storage Contract](theme.override.storage.contract)
- Theme selector UI — see [Theme Top Bar Controls](theme.top.bar.controls)
- Custom preset save/import/export — see [Theme Customization Roadmap](theme.customization.roadmap)

---

*Replaces v15-era preset model that listed five fictional themes. Anchored on actual v86a `themePresets.ts` state.*
