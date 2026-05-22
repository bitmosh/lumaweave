# Phase Packet: v86a Foundation

## A. Phase Mission

Establish the design system the project will live on. Land the three-tier token model, formalize the registry contract pattern, define the asset bank schema, extend the theme preset format with `assetRefs`, ship the schema patch + migrations, and restyle Solar Plasma's chrome onto the new tier model.

This is the keystone sub-arc of v86. v86b/c/d cannot start until v86a is green.

## B. Scope Boundaries

### Allowed

- All files in `/src/themes/`
- `settings.schema.ts`, `settings.defaults.ts`, `settings.migrations.ts`, `settings.registry.ts`, `settings.store.ts`
- `themeTargetRegistry.ts`, `themeTokenPaths.ts`, `themeTokenGovernance.ts`, `themeOverrideStorage.ts`, `themeTargetHeuristics.ts`
- `themeTokens.ts`, `themePresets.ts`, `theme.types.ts`, `applyTheme.ts`
- `panel-registry.ts`, `panel.types.ts` (rationalize or delete)
- `tokens.ts`, `DockLayout.tsx` (resolve empty files)
- `LeftTabPanel.tsx` (Settings tab removal only)
- New files:
  - `tokenPrimitives.ts`, `tokenSemantics.ts`, `tokenComponents.ts`
  - `assetRegistry.ts`, `assetBank.types.ts`
  - `inspectorSpokeRegistry.ts` (empty registry, contract only)
  - `registryContract.types.ts`
- New tests: `tier-governance.spec.ts`, `scoped-overrides-foundation.spec.ts`, `asset-bank-schema.spec.ts`, `tier-walk-validator.spec.ts`

### Forbidden

- Any visual treatment (sphere uniforms, backdrop, halo, glitter, dimming) → v86b
- Any tile system rewrite → v86c
- Any inspector overlay change beyond keeping its current behavior intact → v86d
- TopBar / footer / dock section restyling → v86e
- Workshop UI of any kind → v88
- Theme inheritance → v88+
- Retrofitting other themes onto tier model → v87 (other themes get neutral defaults only in v86a)
- Edge program work → v90/v91
- New audio / lens / physics dialect / hotkey / node program registries → v92/v93/v90/v97

## C. Architecture Map

```
Layer 1 — Skeleton (types/contracts)
  theme.types.ts                    ThemePreset + ThemeRuntimeTokens (extend)
  registryContract.types.ts         NEW — Registry<T> contract pattern
  assetBank.types.ts                NEW — AssetEntry, AssetType, AssetFamily
  tokenPrimitives.ts                NEW — Tier 1 primitive registry
  tokenSemantics.ts                 NEW — Tier 2 semantic tokens
  tokenComponents.ts                NEW — Tier 3 component tokens

Layer 2 — Organs (state/policy/data flow)
  themeTokens.ts                    6 themes restated against tier model
  themeTokenPaths.ts                CANONICAL + PLANNED + tier metadata
  themeTokenGovernance.ts           Tier-walking validator (extend)
  themeOverrideStorage.ts           Extended with scope field (foundation only — runtime in v86d)
  themePresets.ts                   ThemePreset extended with assetRefs
  assetRegistry.ts                  NEW — bank registry, runtime contract, empty bank
  inspectorSpokeRegistry.ts         NEW — empty registry, contract only

Layer 4 — Nerves (settings/debug/QA)
  settings.schema.ts                appearance keys + tileLayout shape + Settings tab removal
  settings.defaults.ts              defaults for new keys
  settings.migrations.ts            v76→v77→v78→v79
  settings.registry.ts              Theme-category entries land in v86e (not v86a)

Layer 5 — Armor (panel usability)
  LeftTabPanel.tsx                  Remove Settings tab (4-tab layout)

Layer 6 — Paint (theme/effects/polish)
  Solar Plasma chrome restyle via Tier 1+2 value changes (cascades through Tier 3 automatically)
```

## D. Non-Negotiable Contracts

The seven v86 long-term contracts (see `v86_INDEX.md`) plus these v86a-specific:

1. **Tier walk integrity.** Tier 3 component reading anything that doesn't resolve to a Tier 2 semantic = governance throw. Tier 2 semantic referencing anything that doesn't resolve to a Tier 1 primitive = governance throw. Inline values anywhere in Tier 2 or 3 = governance throw.
2. **All six themes populate every canonical Tier 1 + Tier 2 token.** Solar Plasma gets the design palette. The other five get neutral defaults that match their existing aesthetic without trying to also re-theme them. Component tokens (Tier 3) are theme-agnostic by design and live in `tokenComponents.ts`, not per-theme.
3. **Asset bank schema is forward-compatible.** No v88 Workshop work, but the type shape must accommodate everything v88 needs: `id`, `type`, `family`, `tags`, `mediaUrl`, `thumbnail`, `sourceTheme`, `remixOf?`, `createdAt`, `updatedAt`, `license?`.
4. **Override resolution rules documented even though only `global` and `target` scopes implemented.** `themeOverrideStorage` extended to accept `scope: { kind, targetId?, targetKind?, clusterAnchor? }`. v86a only writes/reads `global`. v86d adds `target`. The other two scope kinds are accepted by the schema but unused until v89.
5. **Stale registry resolution.** `panel-registry.ts` is rationalized to mirror the actual UI panels OR deleted. `tokens.ts` and `DockLayout.tsx` are deleted (empty placeholders) unless a clear keep-and-document case is made. Decision recorded in this packet's session log.
6. **Settings tab removal coordinated across files.** `LeftTabPanel.tsx` (tabs array, TAB_ICONS, prop type) + `settings.schema.ts` (`leftPanelActiveTab` union, `settingsTabSections` object, `tiledTabs` entries) + any Playwright test referencing the tab. Migration in `settings.migrations.ts` rewrites stored `leftPanelActiveTab: "settings"` → `"graph"` on load.

## E. Dependency Order

```txt
1. Skeleton:
   - registryContract.types.ts
   - assetBank.types.ts
   - tokenPrimitives.ts (concrete values for all six themes)
   - tokenSemantics.ts (token names + references to primitives)
   - tokenComponents.ts (component family token names + references to semantics)
   - theme.types.ts extended

2. Organs:
   - themeTokenPaths.ts canonical + planned + tier metadata
   - themeTokenGovernance.ts tier-walking validator
   - themeOverrideStorage.ts scope field added (write paths for "global" only in v86a)
   - themeTokens.ts six themes restated
   - themePresets.ts assetRefs field
   - assetRegistry.ts (empty bank, contract live)
   - inspectorSpokeRegistry.ts (empty, contract live)

3. Nerves:
   - settings.schema.ts patched
   - settings.defaults.ts populated
   - settings.migrations.ts v76→v77→v78→v79

4. Armor:
   - LeftTabPanel.tsx 4-tab layout
   - panel-registry.ts decision applied
   - tokens.ts and DockLayout.tsx deleted (or documented)

5. Paint:
   - Solar Plasma chrome restyled (Tier 1 + Tier 2 value changes; Tier 3 cascades automatically)

6. Validation:
   - typecheck
   - existing Playwright suite (must remain green — Settings tab removal will require updating any test that references it)
   - new tier governance test
   - new override storage scope foundation test
   - new asset registry shape test
   - new tier walk validator test
```

## F. Current Permissions

Bandit may patch any file in the Allowed list. Bandit may inspect any file in the codebase. Bandit may NOT touch any visual rendering code (`SigmaGraphView.tsx`, `NodeSphereProgram.ts`, etc.) beyond what's necessary to keep the existing app working.

## G. Later-Phase Items

Document only. Do not implement in v86a.

- Tier 3 component token expansion beyond the v86 set (each future component family adds its own Tier 3 entries)
- `target-kind` and `cluster` override scopes (write paths defined in schema, runtime in v86d/v89)
- Asset bank Workshop UI → v88
- Theme inheritance → v88+
- Spoke registry runtime children → v86d / v89
- Other-theme migration to tier model → v87
- `assetRefs` populated on non-Solar-Plasma themes → v87 (they get empty arrays in v86a)

## H. Known Failure Modes

1. **Token tier name collisions.** `app.background` exists as both a Tier 2 semantic name and a Tier 3 component name in the design conversation. Resolution: Tier 2 names use category-leading dotpath (`surface.background.deep`); Tier 3 names use component-leading dotpath (`shell.background`). No bare names that could mean either.
2. **Migration ordering.** v76→v77 runs before v77→v78 which runs before v78→v79. Bandit will be tempted to write all three as one mega-migration. Don't. Each migration is independently testable and the version bumps document the change history.
3. **Six themes × 24 new canonical paths = 144 values.** This is the largest mechanical task in v86a. Solar Plasma values are in Appendix E. The other five themes need values that don't break their visual identity. **If unsure, default to a neutral semantic value (e.g. 50% gray with theme-appropriate alpha) and tag with `// TODO(v87): review` for v87 review.**
4. **`assertThemeTokenGovernanceClean` will throw if any binding references a planned-only path.** When promoting paths from PLANNED to CANONICAL, do it in this order: (a) populate values across all six themes; (b) move path string from PLANNED set to CANONICAL set; (c) only then add bindings. Skipping (a) or (b) causes governance to throw at boot.
5. **Settings tab removal touches 6+ files.** Use grep before patching: `grep -rn "leftPanelActiveTab\|settingsTabSections\|tiledTabs\|tab.*settings" src tests`.
6. **Stale `panel-registry.ts` decision must be recorded.** Two options: (a) rewrite to mirror what AppShell mounts; (b) delete. Either is fine. Document choice in session log.
7. **`themeOverrideStorage_spec.ts` (13 tests) tests global-only behavior.** When extending with the `scope` field, the existing tests must continue to pass — the global path must remain unchanged. New tests cover the new scope shape. Read the existing spec before patching.

## I. Troubleshooting Playbooks

### `assertThemeTokenGovernanceClean` throws

1. Read the error — it names the violating target + property + tokenPath.
2. Check whether the tokenPath is in CANONICAL or PLANNED.
3. If in PLANNED: either move it to CANONICAL (after populating values across all six themes) or remove the binding.
4. If neither: the path is malformed — fix the binding or add the path.
5. Re-run governance.

### `npm run qa:e2e` reports Settings tab tests failing

1. The Settings tab removal will break any test asserting its presence.
2. Grep tests for `"settings"` and `tab-settings` and `leftPanelActiveTab.*settings`.
3. Update tests to assert 4-tab layout, not 5-tab.
4. If a test is testing genuine settings-panel functionality, route it through the Control Dock (settings now live there exclusively per design conversation).

### A migration runs but data shape is wrong on next load

1. Migration runs in `settings.store.ts` rehydrate path.
2. Check `version` field — if the migration didn't bump version, the store won't re-run on subsequent loads.
3. Each migration must read the previous shape, transform, and bump the `version` field.
4. Test migrations with synthetic prior-version data — write a unit test that constructs a v76-shaped object and asserts the v79 result.

### Tier walk validator says "Tier 3 references inline value"

1. A Tier 3 component is using a literal string/number instead of a Tier 2 semantic reference.
2. Identify the literal — should be replaced with a Tier 2 semantic name.
3. If no appropriate Tier 2 semantic exists, that's a design gap — add the semantic, then reference it.
4. Never inline values at Tier 3.

## J. Validation Ladder

```bash
npm run typecheck                               # zero errors
npm run qa:e2e                                  # all existing + new tests green
node scripts/validate-contract-trace.mjs        # contract registry sound
node scripts/validate-system-index.mjs          # system index sound
```

New tests required:

- `tier-governance.spec.ts` — `assertThemeTokenGovernanceClean` throws on a planted Tier 3 → primitive reference.
- `scoped-overrides-foundation.spec.ts` — global override write/read still works; loading a v34a (pre-scope) override applies as global; schema accepts `target`/`target-kind`/`cluster` scope shapes (no runtime yet for the latter two).
- `asset-bank-schema.spec.ts` — empty bank loads; schema rejects malformed entries.
- `tier-walk-validator.spec.ts` — every canonical token resolves through the tier walk without circular references.

Manual QA:

1. App loads to graph view (existing baseline — not broken).
2. Theme selector still works (selects between 6 themes).
3. Solar Plasma now uses the warm chrome (cream text, gold borders, deep purple background).
4. The other five themes look unchanged from current trunk.
5. Settings tab is gone from the left panel (4 tabs visible).
6. Settings controls in the Control Dock still work.
7. Existing override behavior (changing theme, toggling glitter, toggling reduce motion) persists across reload.

## K. Research / Tool Policy

- `themeTokenPaths.ts` is the source of truth for the canonical/planned split. Read it before any path operation.
- `theme-override-storage_spec.ts` is the contract spec for override persistence — preserve every assertion that doesn't directly contradict the new scope field.
- Use `grep` aggressively for `"settings"` references when removing the Settings tab.
- Browser DevTools for verifying token resolution at runtime: `getComputedStyle(document.querySelector('main[data-lw-theme-target="app.shell"]')).getPropertyValue('--lw-app-background')`. (Legacy `--lw-app-bg` removed in v88c.)
- No external research needed — this is mechanical schema and registry work.

## L. Output Requirements

Final report must include:

1. Which empty file was deleted (`tokens.ts` and/or `DockLayout.tsx`).
2. `panel-registry.ts` decision (rationalized vs. deleted) with reasoning.
3. Total canonical token paths after this sub-arc (current 16 + 24 new = 40 expected).
4. Governance check final state (zero violations).
5. Migration version sequence applied (v76→v77→v78→v79).
6. Any token paths added to PLANNED but not yet promoted to CANONICAL — with reason.
7. Settings registry entry count under each existing category (Physics, Labels, Graph View) — should be unchanged in v86a.
8. Inspector spoke registry confirmed registered as a contract (no spokes yet).
9. Asset registry confirmed registered as a contract (empty bank).
10. Any v86 long-term contracts violated and why.

---

## Appendix A — Token Tier Specification

### Tier 1 — Primitives

The raw vocabulary. Themes redefine these. Components never reference them directly.

```typescript
// tokenPrimitives.ts (Solar Plasma values shown)
export const primitives = {
  color: {
    void:    { 900: "#03000A", 800: "#0E0420", 700: "#1B0830", 600: "#14071F" },
    gold:    { 500: "#FFB347", 400: "#FFD79A" },
    flare:   { 500: "#FF6B1A" },
    magenta: { 500: "#FF1F8F" },
    fuchsia: { 500: "#CC2EFA" },
    purple:  { 500: "#7B2FFF" },
    corona:  { 500: "#00D4FF", 400: "#4FACFF" },
    cream:   { 100: "#FFE9D6", 200: "#F5DAB7" },
    green:   { 500: "#7CF6B5" },
    red:     { 500: "#FF4D6D" },
  },
  space:    { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 8: 48, 12: 96 },
  radius:   { sm: 4, md: 8, lg: 12, full: 9999 },
  shadow:   { sm: "0 1px 2px rgba(0,0,0,.4)", lg: "0 25px 50px -12px rgba(0,0,0,.5)" },
  duration: { fast: 150, base: 220, slow: 380 },
  easing:   { standard: "cubic-bezier(.4,0,.2,1)", out: "cubic-bezier(0,0,.2,1)" },
};
```

### Tier 2 — Semantics

Role assignments. Every reference resolves to a primitive. Themes redefine these.

```typescript
// tokenSemantics.ts (Solar Plasma values shown)
export const semantics = {
  surface: {
    background: { deep: "{color.void.900}", mid: "{color.void.800}", warm: "{color.void.700}" },
    panel:      { warm: "{color.void.700} / 82%", muted: "{color.void.800} / 60%" },
    border:     { accent: "{color.gold.500} / 32%", hot: "{color.gold.500} / 62%", subtle: "{color.cream.100} / 14%" },
    accent:     { warm: "{color.flare.500}", primary: "{color.gold.500}" },
  },
  text: {
    primary: "{color.cream.100}",
    muted:   "{color.cream.100} / 55%",
    faint:   "{color.cream.100} / 32%",
    accent:  "{color.gold.500}",
    success: "{color.green.500}",
    danger:  "{color.red.500}",
  },
  motion: {
    duration: "{duration.base}",
    easing:   "{easing.out}",
  },
};
```

### Tier 3 — Components

Component families. Reference Tier 2 only. Stable across themes.

```typescript
// tokenComponents.ts — theme-agnostic
export const components = {
  shell:     { background: "{surface.background.deep}", glow: "{surface.accent.warm}" },
  topbar:    { background: "{surface.background.deep}", border: "{surface.border.accent}", text: "{text.primary}", accent: "{surface.accent.primary}" },
  panel:     { background: "{surface.panel.warm}", border: "{surface.border.accent}", text: "{text.primary}" },
  tile:      { background: "{surface.panel.warm}", border: "{surface.border.accent}", handle: "{surface.border.hot}", groupOutline: "{surface.accent.primary}" },
  graph:     { background: "{surface.background.deep}", frameBorder: "{surface.border.accent}" },
  inspector: { 
    radial:  { halo: "{surface.border.hot}", spoke: "{surface.accent.primary}" },
    popover: { background: "{surface.panel.warm}", border: "{surface.border.accent}" },
  },
  // button, dock-section, control-row, etc. — extend as needed; never inline values
};
```

## Appendix B — Schema Patch

```typescript
// settings.schema.ts diff
interface StarmapSettings {
  appearance: {
    theme: ThemeId;                          // existing
    accentIntensity: number;                 // existing
    panelTransparency: number;               // existing
    glitterEnabled: boolean;                 // existing
    reduceMotion: boolean;                   // existing
    starfieldEnabled: boolean;               // existing
    
    // NEW v86a (defaults defined; UI for these is v86e)
    drama: "quiet" | "cranked" | "extreme";  // multiplier 0.55/1.0/1.4
    motionScale: number;                     // 0–1.5; reduceMotion forces 0
    panelBlur: number;                       // 0–28 px backdrop-filter
    nodeHum: number;                         // 0–2 sphere fade rate
    nodeFlowSpeed: number;                   // 0–2 sphere flow speed
    nodeGlow: number;                        // 0.2–2 glow strength
  };
  
  ui: {
    leftPanelActiveTab: "graph" | "qa" | "evidence" | "debug";  // CHANGED — settings removed
    // settingsTabSections: REMOVED
    
    tiledTabs: never[];                       // DEPRECATED — kept for migration only
    tileLayout: TileLayoutEntry[];            // NEW — replaces tiledTabs in v86c
    
    // ...rest unchanged
  };
}

interface TileLayoutEntry {
  id: string;
  sectionKey: string;
  x: number; y: number;
  w: number; h: number;
  collapsed: boolean;
  z: number;
}
```

## Appendix C — Migrations

```typescript
// settings.migrations.ts additions

// v76 → v77: settings tab removal
function migrate76To77(state) {
  if (state.ui?.leftPanelActiveTab === "settings") {
    state.ui.leftPanelActiveTab = "graph";
  }
  delete state.ui?.settingsTabSections;
  if (Array.isArray(state.ui?.tiledTabs)) {
    state.ui.tiledTabs = state.ui.tiledTabs.filter(t => t !== "settings");
  }
  state.version = 77;
  return state;
}

// v77 → v78: tile layout reshape
function migrate77To78(state) {
  const oldTabs = Array.isArray(state.ui?.tiledTabs) ? state.ui.tiledTabs : [];
  state.ui.tileLayout = oldTabs.map((tabId, i) => ({
    id: `tile_legacy_${tabId}_${i}`,
    sectionKey: tabId,
    x: 200 + i * 30,
    y: 120 + i * 30,
    w: 320,
    h: 480,
    collapsed: false,
    z: 1,
  }));
  state.ui.tiledTabs = [];
  state.version = 78;
  return state;
}

// v78 → v79: appearance defaults
function migrate78To79(state) {
  state.appearance ??= {};
  state.appearance.drama         ??= "cranked";
  state.appearance.motionScale   ??= 0.6;
  state.appearance.panelBlur     ??= 16;
  state.appearance.nodeHum       ??= 0.7;
  state.appearance.nodeFlowSpeed ??= 0.55;
  state.appearance.nodeGlow      ??= 1.0;
  state.version = 79;
  return state;
}
```

## Appendix D — New Canonical Token Paths

24 paths to add. Two-step landing: PLANNED first, populate values across all six themes, then promote to CANONICAL.

```typescript
// themeTokenPaths.ts additions
export type ThemeTokenPath_v86 =
  // existing 16, plus:
  | "backdrop.corona.color"
  | "backdrop.corona.intensity"
  | "backdrop.flare.color"
  | "backdrop.starfield.density"
  | "backdrop.vignette.intensity"
  | "node.sphere.humDuration"
  | "node.sphere.flowDuration"
  | "node.sphere.glowStrength"
  | "edge.style.preset"
  | "edge.plasma.flowSpeed"
  | "selection.halo.color"
  | "selection.halo.maxRadiusRatio"
  | "selection.glitter.densityScale"
  | "selection.dim.opacity"           // for v86b dimming feature
  | "bookmark.alert.color"
  | "bookmark.pinned.color"
  | "bookmark.ref.color"
  | "panel.blur.amount"
  | "panel.tile.handleColor"
  | "panel.tile.groupOutlineColor"
  | "inspector.radial.spokeColor"
  | "inspector.radial.haloColor"
  | "typography.font.display"
  | "typography.font.body"
  | "typography.font.mono";
```

## Appendix E — Solar Plasma Token Values

Existing values to overwrite (Tier 2 chrome restyle):

| Path | Current | New |
|---|---|---|
| `app.background` | `#020617` | `#03000A` |
| `app.panelBackground` | `rgba(15,23,42,0.82)` | `rgba(27,8,48,0.82)` |
| `app.panelBorder` | `rgba(34,211,238,0.20)` | `rgba(255,179,71,0.32)` |
| `app.textPrimary` | `#f1f5f9` | `#FFE9D6` |
| `app.textMuted` | `#94a3b8` | `rgba(255,215,188,0.55)` |
| `app.accent` | `#22d3ee` | `#FFB347` |
| `app.glow` | `rgba(34,211,238,0.30)` | `rgba(255,107,26,0.40)` |
| `graph.nodeLabel` | `#f1f5f9` | `#FFE9D6` |
| `graph.nodeLabelHover` | `#0f172a` | `#1B0830` |
| `graph.edgeLabel` | `#94a3b8` | `rgba(255,215,188,0.55)` |
| `graph.edgeLabelHover` | `#cbd5e1` | `rgba(255,233,214,0.85)` |

New v86 paths (Solar Plasma values):

| Path | Value |
|---|---|
| `backdrop.corona.color` | `rgba(255,179,71,0.28)` |
| `backdrop.corona.intensity` | `0.7` |
| `backdrop.flare.color` | `rgba(255,107,26,0.55)` |
| `backdrop.starfield.density` | `0.7` |
| `backdrop.vignette.intensity` | `0.92` |
| `node.sphere.humDuration` | `4.86` |
| `node.sphere.flowDuration` | `4.73` |
| `node.sphere.glowStrength` | `1.0` |
| `edge.style.preset` | `"plasma"` |
| `edge.plasma.flowSpeed` | `0.55` |
| `selection.halo.color` | `rgba(255,179,71,0.6)` |
| `selection.halo.maxRadiusRatio` | `0.25` |
| `selection.glitter.densityScale` | `1.0` |
| `selection.dim.opacity` | `0.18` |
| `bookmark.alert.color` | `#FF4D6D` |
| `bookmark.pinned.color` | `#FFB347` |
| `bookmark.ref.color` | `#00D4FF` |
| `panel.blur.amount` | `16` |
| `panel.tile.handleColor` | `rgba(255,179,71,0.62)` |
| `panel.tile.groupOutlineColor` | `#FFB347` |
| `inspector.radial.spokeColor` | `#FFB347` |
| `inspector.radial.haloColor` | `rgba(255,179,71,0.6)` |
| `typography.font.display` | `"Space Grotesk", system-ui, sans-serif` |
| `typography.font.body` | `"IBM Plex Sans", system-ui, sans-serif` |
| `typography.font.mono` | `"IBM Plex Mono", ui-monospace, monospace` |

## Appendix F — Asset Bank Schema

```typescript
// assetBank.types.ts
export type AssetType =
  | "texture"
  | "shader"
  | "animation"
  | "sound-pack"
  | "font-pack"
  | "icon-pack"
  | "particle-system";

export type AssetFamily = string;     // theme id or "shared"

export interface AssetEntry {
  id: string;
  type: AssetType;
  family: AssetFamily;
  tags: string[];
  mediaUrl: string;
  thumbnail?: string;
  sourceTheme: string;                // theme id of origin
  remixOf?: string;                   // asset id of original (if remix)
  createdAt: number;
  updatedAt: number;
  license?: string;
  description?: string;
}

export interface AssetRegistry {
  list(): AssetEntry[];
  getById(id: string): AssetEntry | undefined;
  filterByCategory(query: { type?: AssetType; family?: AssetFamily; tags?: string[] }): AssetEntry[];
  validateShape(entry: unknown): { valid: boolean; errors?: string[] };
  register(entry: AssetEntry): void;
}
```

## Appendix G — ThemePreset Extension

```typescript
// theme.types.ts diff
export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  description?: string;
  builtIn: boolean;
  themeId: ThemeId;
  tags?: string[];
  notes?: string;
  
  // NEW v86a
  assetRefs: Array<{
    assetId: string;
    type: AssetType;
    purpose: string;        // "starfield", "node-shader", etc.
  }>;
}
```

In v86a, all `builtInThemePresets` get `assetRefs: []`. v88's Workshop populates them.

## Appendix H — Override Conflict Resolution Rules

Documented even though only `global` and `target` implemented in v86d.

```typescript
// resolveOverrideForTarget(tokenPath, targetId, targetKind?, clusterAnchor?)
// Returns the most specific applicable override, or undefined.

priority = [
  "target",         // exact target match
  "target-kind",    // any target with same kind
  "cluster",        // any target in cluster reachable from clusterAnchor
  "global",         // catches everything
];

// Example: user sets "panel.background" globally to red, then sets it
// for "topbar.root" specifically to blue. Resolution for "topbar.root" = blue.
// Resolution for any other target = red.
```

Implemented in v86d for `target` + `global`. `target-kind` lands in v89. `cluster` lands when cluster scope becomes a real surface (likely v89).

## Appendix I — Hygiene Decisions Required

Record decisions made in v86a for future reference:

```
[ ] tokens.ts                   delete (recommended)
[ ] DockLayout.tsx              delete (recommended)
[ ] panel-registry.ts           rationalize OR delete (decision pending)
[ ] panel.types.ts              follows panel-registry decision
```

Document choice in session log.

## Appendix J — Registry Contract Pattern

```typescript
// registryContract.types.ts
export interface RegistryContract<TEntry, TQuery = Partial<TEntry>> {
  list(): TEntry[];
  getById(id: string): TEntry | undefined;
  filterByCategory(query: TQuery): TEntry[];
  validateShape(entry: unknown): { valid: boolean; errors?: string[] };
  register(entry: TEntry): void;
  // optional change subscription
  subscribe?(listener: (entries: TEntry[]) => void): () => void;
}
```

Existing registries (settings, themeTarget, etc.) may have shape drift from this contract. v86a does NOT retrofit them — that work is documented as future cleanup. New registries (asset, inspector spoke) MUST conform.

---

*Next: `v86b_VISUAL_TREATMENT.md` (parallel), `v86c_TILE_SYSTEM.md` (parallel), `v86d_INSPECTOR_MINI_GRAPH.md` (parallel) — all unblocked once v86a lands.*
