# V86 ARC — BANDIT MASTER INDEX
## LumaWeave · Solar Plasma + Token Tier Foundations

**QA Spine:** v85f → v86a  
**Product:** 0.6.0 → 0.7.0 (on v86e completion)  
**QA Key:** v74b (active throughout)  
**Tests at baseline:** 345 passing, 8 skipped, 0 failing

---

## MANDATORY PRE-FLIGHT (read before touching any code)

Run these before v86a starts. Do not skip.

```bash
cd /home/boop/Projects/lumaweave
npx playwright install --dry-run    # verify browsers
git status                          # confirm clean tree
git log --oneline -5                # confirm at v85f
npm run typecheck                   # confirm zero errors
npm run qa:e2e                      # confirm 345 passing
```

If any check fails, stop and report before proceeding.

---

## THE FIVE SUB-ARCS

```
v86a  Foundations             KEYSTONE — do first, others blocked
  ↓
  ├── v86b  Visual Treatment       run after a — parallel ok
  ├── v86c  Tile System            run after a — parallel ok
  └── v86d  Inspector Mini-Graph   run after a — parallel ok
  ↓
v86e  Cosmetic Polish          LAST — needs a + c complete
```

**Do not start v86b, v86c, or v86d until v86a is accepted and 345 green.**  
**Do not start v86e until v86a AND v86c are both accepted and 345 green.**

---

## SEVEN NON-NEGOTIABLE CONTRACTS (apply to every sub-arc)

1. **Three-tier token model.** Primitives → Semantics → Components. No tier skipping. Components never reference Tier 1 primitives directly.
2. **Full theme declarations.** Every theme declares every canonical path. No inheritance until v88.
3. **Override scope specificity.** target > target-kind > cluster > global.
4. **Two-step canonical landing.** PLANNED first → values in all 6 themes → promote to CANONICAL. Never skip.
5. **Registry contract pattern.** Every registry exposes: `list / getById / filterByCategory / validateShape / register`.
6. **Asset / preset separation.** Themes store native values directly. External assets (textures, shaders, sounds) stored by id in asset bank.
7. **Solar Plasma is the reference theme.** New paths get real Solar Plasma values. Other themes get neutral defaults until v87.

**Violation of any contract = halt, report, fix before continuing.**

---

## CRITICAL DECISIONS (locked — do not re-litigate)

**Renderer conflict resolved:**  
Edge plasma v86b = SVG overlay (not Sigma EdgeProgram).  
Edge plasma v91 = full Sigma EdgeProgram replaces the overlay.  
Reason: SVG overlay is buildable in v86b without touching Sigma internals.  
Sigma EdgeProgram requires v90's node program registry first.

**Font stack locked:**  
Display: Space Grotesk (weights 400/500/600/700)  
Body: IBM Plex Sans (weights 400/500/600)  
Mono: IBM Plex Mono (weights 400/500)  
Load via: index.html preconnect + stylesheet link (not App.css @import)  
Token paths: `typography.font.display` / `typography.font.body` / `typography.font.mono`

**Inspector approach for v86d:**  
SVG-based (Approach B) for v86d MVP — 4 spokes only.  
Second Sigma instance (Approach A) deferred to v90.

**Settings tab removal:**  
Settings tab removed from left panel in v86a.  
All settings moved to Control Dock sections.  
leftPanelActiveTab union shrinks: remove "settings".

---

## V86A — FOUNDATIONS DETAIL

### What it does
Schema patch, tier model files, three new registries, Solar Plasma chrome restyle, settings tab removal, dead file cleanup.

### Files created (new)
```
src/themes/tokenPrimitives.ts          — Tier 1 raw vocabulary
src/themes/tokenSemantics.ts           — Tier 2 role assignments
src/themes/tokenComponents.ts          — Tier 3 component families (theme-agnostic)
src/control-plane/inspector/inspectorSpokeRegistry.ts  — foundation only (no spokes yet)
src/graph/assets/assetRegistry.ts      — empty bank, contract established
```

### Files modified
```
src/control-plane/settings/settings.schema.ts   — schema patch (see below)
src/control-plane/settings/settings.defaults.ts — new field defaults
src/control-plane/settings/settings.migrations.ts — v2→v3 (see below)
src/themes/themeTokenPaths.ts           — 24 new paths (PLANNED, then CANONICAL)
src/themes/themeTokens.ts              — Solar Plasma chrome restyle values
src/app/AppShell.tsx                   — remove Settings tab wiring
src/control-plane/panels/LeftTabPanel.tsx — remove Settings tab UI
```

### Files to delete (confirmed dead)
```
src/themes/tokens.ts        — empty passthrough
src/control-plane/panels/DockLayout.tsx  — if confirmed unused
```

### Schema patch (exact TypeScript diff)

```typescript
// settings.schema.ts

// APPEARANCE — add these 6 fields:
appearance: {
  theme: ThemeId;                              // existing
  accentIntensity: number;                     // existing
  panelTransparency: number;                   // existing
  glitterEnabled: boolean;                     // existing
  reduceMotion: boolean;                       // existing
  starfieldEnabled: boolean;                   // existing
  // NEW v86a:
  drama: "quiet" | "cranked" | "extreme";      // multiplier 0.55/1.0/1.4
  motionScale: number;                         // 0–1.5; reduceMotion forces 0
  panelBlur: number;                           // 0–28px backdrop-filter
  nodeHum: number;                             // 0–2 sphere fade rate
  nodeFlowSpeed: number;                       // 0–2 sphere flow speed
  nodeGlow: number;                            // 0.2–2 glow strength
};

// UI — remove Settings tab, replace tile state:
ui: {
  // CHANGE: remove "settings" from union
  leftPanelActiveTab: "graph" | "qa" | "evidence" | "debug";  // was: | "settings"
  // REMOVE entirely:
  // settingsTabSections: { generalSettings: boolean };
  // REMOVE (deprecated by tileLayout):
  // tiledTabs: Array<TabId>;                // REMOVED
  // ADD:
  tileLayout: TileLayoutEntry[];             // NEW — replaces tiledTabs
  // ...rest unchanged
};

// NEW interface (add near bottom of file):
interface TileLayoutEntry {
  id: string;                 // "tile_xyz"
  sectionKey: string;         // "graphSources" | "physics" | ...
  x: number; y: number;       // snapped 16-pt grid
  w: number; h: number;
  collapsed: boolean;
  z: number;                  // stacking order
  // groupId is runtime-computed, NOT stored
}
```

### Migration functions (add to settings.migrations.ts)

Current schema version: 2. After v86a: version 3 (three migration steps).

```typescript
// v2→v3 runs as three sequential steps: 2→2.1→2.2→3
// (use integers in prod: bump version to 3 after all three steps)

// STEP 1: settings tab removal
function migrateStep_TabRemoval(state: any): any {
  if (state.ui?.leftPanelActiveTab === "settings") {
    state.ui.leftPanelActiveTab = "graph";
  }
  delete state.ui?.settingsTabSections;
  if (Array.isArray(state.ui?.tiledTabs)) {
    state.ui.tiledTabs = state.ui.tiledTabs.filter((t: string) => t !== "settings");
  }
  return state;
}

// STEP 2: tile layout reshape
function migrateStep_TileLayout(state: any): any {
  const oldTabs = Array.isArray(state.ui?.tiledTabs)
    ? state.ui.tiledTabs : [];
  state.ui.tileLayout = oldTabs.map((tabId: string, i: number) => ({
    id: `tile_legacy_${tabId}_${i}`,
    sectionKey: tabId,
    x: 200 + i * 30,
    y: 120 + i * 30,
    w: 320,
    h: 480,
    collapsed: false,
    z: 1,
  }));
  state.ui.tiledTabs = [];   // keep field for one version, then drop
  return state;
}

// STEP 3: appearance defaults
function migrateStep_AppearanceDefaults(state: any): any {
  state.appearance ??= {};
  state.appearance.drama         ??= "cranked";
  state.appearance.motionScale   ??= 0.6;
  state.appearance.panelBlur     ??= 16;
  state.appearance.nodeHum       ??= 0.7;
  state.appearance.nodeFlowSpeed ??= 0.55;
  state.appearance.nodeGlow      ??= 1.0;
  return state;
}

// Wire into MIGRATIONS record:
// 3: (s) => migrateStep_AppearanceDefaults(
//              migrateStep_TileLayout(
//                migrateStep_TabRemoval(s)))
```

Bump `settings.defaults.ts` version to `3` and add defaults for all 6 new appearance fields.

### 24 new canonical token paths (add to themeTokenPaths.ts)

```typescript
// Two-step rule: add to PLANNED first, populate all 6 themes, then promote to CANONICAL.
// Do not bind any component to a PLANNED path.

"backdrop.corona.color"
"backdrop.corona.intensity"
"backdrop.flare.color"
"backdrop.starfield.density"
"backdrop.vignette.intensity"
"node.sphere.humDuration"
"node.sphere.flowDuration"
"node.sphere.glowStrength"
"edge.style.preset"
"edge.plasma.flowSpeed"
"selection.halo.color"
"selection.halo.maxRadiusRatio"
"selection.glitter.densityScale"
"selection.dim.opacity"
"bookmark.alert.color"
"bookmark.pinned.color"
"bookmark.ref.color"
"panel.blur.amount"
"panel.tile.handleColor"
"panel.tile.groupOutlineColor"
"inspector.radial.spokeColor"
"inspector.radial.haloColor"
"typography.font.display"
"typography.font.body"
"typography.font.mono"
```

### Solar Plasma chrome restyle (update themeTokens.ts solarPlasmaTokens)

```typescript
// Exact value changes for Solar Plasma:
app.background:      "#020617"            → "#03000A"
app.panelBackground: "rgba(15,23,42,.82)" → "rgba(27,8,48,0.82)"
app.panelBorder:     "rgba(34,211,238,.2)"→ "rgba(255,179,71,0.32)"
app.textPrimary:     "#f1f5f9"            → "#FFE9D6"
app.textMuted:       "#94a3b8"            → "rgba(255,215,188,0.55)"
app.accent:          "#22d3ee"            → "#FFB347"
app.glow:            "rgba(34,211,238,.3)"→ "rgba(255,107,26,0.40)"
graph.nodeLabel:     "#f1f5f9"            → "#FFE9D6"
graph.nodeLabelHover:"#0f172a"            → "#1B0830"
graph.edgeLabel:     "#94a3b8"            → "rgba(255,215,188,0.55)"
graph.edgeLabelHover:"#cbd5e1"            → "rgba(255,233,214,0.85)"

// Solar Plasma nodeColorScale (update in v86a):
nodeColorScale: [
  "#7B2FFF",  // peripheral — deep coronal purple
  "#4FACFF",  // coronal blue
  "#00D4FF",  // solar wind cyan
  "#CC2EFA",  // chromosphere magenta
  "#FFB347",  // prominence amber
  "#FF6B1A",  // solar flare orange (hub nodes)
]

// New backdrop paths (Solar Plasma values):
"backdrop.corona.color":            "rgba(255,179,71,0.28)"
"backdrop.corona.intensity":        "0.7"
"backdrop.flare.color":             "rgba(255,107,26,0.55)"
"backdrop.starfield.density":       "0.7"
"backdrop.vignette.intensity":      "0.92"
"node.sphere.humDuration":          "4.86"
"node.sphere.flowDuration":         "4.73"
"node.sphere.glowStrength":         "1.0"
"edge.style.preset":                "\"plasma\""
"edge.plasma.flowSpeed":            "0.55"
"selection.halo.color":             "rgba(255,179,71,0.6)"
"selection.halo.maxRadiusRatio":    "2.2"
"selection.glitter.densityScale":   "1.0"
"selection.dim.opacity":            "0.18"
"panel.blur.amount":                "16"
"panel.tile.handleColor":           "rgba(255,179,71,0.6)"
"panel.tile.groupOutlineColor":     "rgba(255,107,26,0.45)"
"inspector.radial.spokeColor":      "#FFB347"
"inspector.radial.haloColor":       "rgba(255,179,71,0.5)"
"typography.font.display":          "'Space Grotesk', system-ui, sans-serif"
"typography.font.body":             "'IBM Plex Sans', system-ui, sans-serif"
"typography.font.mono":             "'IBM Plex Mono', 'Fira Code', monospace"
```

### Font loading (index.html — not App.css)

```html
<!-- Add to <head> in index.html BEFORE any other stylesheets -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" />
```

### v86a validation ladder

```bash
npm run typecheck                      # zero errors
node scripts/validate-system-index.mjs # system index sound
node scripts/validate-contract-trace.mjs # contracts intact
npm run qa:e2e                         # 345 passing (with self-split active)
```

Manual check: open app, Solar Plasma theme active, panel background shows deep purple-black not slate, accent is gold not cyan, no console errors.

### v86a output report must include:
1. Migration version sequence applied (v2→v3)
2. Total canonical token paths after arc (16 existing + 24 new = 40)
3. Which dead files were deleted
4. Settings tab confirmed removed from UI
5. Inspector spoke registry confirmed registered (empty, no spokes yet)
6. Asset registry confirmed registered (empty bank)
7. Zero token governance violations

---

## V86B — VISUAL TREATMENT DETAIL

**Depends on:** v86a accepted and 345 green  
**Parallel with:** v86c, v86d

### Three rendering layers (stack order)

```
z=0   SolarBackdrop (CSS+SVG)     — behind canvas, pure CSS animation
z=2   Sigma graph canvas          — WebGL, nodes+edges
z=4   Interaction overlay (SVG)   — click halo, glitter, bookmarks, minimap, HUD
```

### Shader uniform extension for NodeSphereProgram

The current shader uses `v_position` (vec2, 0→1 quad space) and `v_color` (vec4).  
These are correct — no renaming needed.

Add these 4 uniforms to the fragment shader:

```glsl
uniform float u_time;         // driven by rAF in SigmaGraphView
uniform float u_hum;          // appearance.nodeHum (0–2)
uniform float u_flowSpeed;    // appearance.nodeFlowSpeed (0–2)
uniform float u_glowStrength; // appearance.nodeGlow (0.2–2)
```

Wire in SigmaGraphView via `sigma.setSetting()` or the WebGL program's `setUniforms()` method on each animation frame. Gate all motion uniforms: when `reduceMotion=true`, send `0.0` for `u_hum` and `u_flowSpeed`.

### New files to create

```
src/graph/overlay/SolarBackdrop.tsx        — CSS+SVG corona/flare/starfield
src/graph/overlay/ClickHalo.tsx            — water-ripple rings on click
src/graph/overlay/GlitterField.tsx         — cluster-depth glitter wrap
src/graph/overlay/FloatingBookmark.tsx     — single bookmark widget
src/graph/overlay/BookmarkLayer.tsx        — manages all bookmarks
src/graph/overlay/bookmarkRegistry.ts      — bookmark state
src/graph/overlay/Minimap.tsx              — 2D minimap with viewport rect
src/graph/overlay/CameraHUD.tsx            — zoom/pan/rotate buttons
src/graph/overlay/cameraController.ts     — left-drag pan, right-drag rotate
src/graph/visual/dimmingPolicy.ts          — dim mode logic
src/graph/edges/PlasmaOverlayEdge.tsx      — SVG animated edge overlay
```

### Edge plasma decision (LOCKED)
Use SVG overlay route. No Sigma EdgeProgram changes.  
PlasmaOverlayEdge renders animated SVG strokes over static Sigma edge positions.  
Sigma EdgeProgram upgrade deferred to v91.

### v86b validation ladder

```bash
npm run typecheck
npm run qa:e2e  # 345 green — pre-flight first
```

Manual check: Solar Plasma backdrop visible behind graph, corona pulse animating, sphere nodes hum when nodeHum > 0, glitter wraps selection cluster, minimap tracks viewport, right-drag rotates, reduce-motion halts all animation.

Performance baseline to record: FPS at 124 nodes with full v86b visual stack.

---

## V86C — TILE SYSTEM DETAIL

**Depends on:** v86a accepted and 345 green  
**Parallel with:** v86b, v86d

### The BIG RULE (user's explicit requirement)
When a group has a top row of 1 tile and a wider bottom row, the group bar's horizontal extent matches only the top tile, NOT the bounding box. Group outline is a rectilinear hull polygon — not a bounding rectangle.

### New files to create

```
src/control-plane/tiles/tileSection.types.ts   — TileSectionEntry, TileLayoutEntry
src/control-plane/tiles/tileSectionRegistry.ts — contract + 7 initial sections
src/control-plane/tiles/tileSnap.ts            — 16px grid + 22px edge magnetism
src/control-plane/tiles/tileGroups.ts          — rectilinear hull computation
src/control-plane/tiles/TileProvider.tsx       — context owner
src/control-plane/tiles/TileableSection.tsx    — extends CollapsibleSection
src/control-plane/tiles/FloatingTile.tsx       — drag/resize + snap
src/control-plane/tiles/GroupBar.tsx           — top-row-width-only
src/control-plane/tiles/GroupOutline.tsx       — SVG rectilinear polygon
src/control-plane/tiles/TileLayer.tsx          — renders all tiles + groups
```

### Key implementation rules
- Pointer capture on tear-off handle (`setPointerCapture` on `pointerdown`) — prevents "first 8px lost" bug
- Source slot: CSS state only via `data-tiled-out="true"` — no re-render
- Snap computed at `pointerup` not during drag — prevents jitter
- Groups are runtime-computed from positions, never stored in settings
- Per-tile un-snap grip: dragging grip pulls tile 30px from nearest neighbor edge

### v86c validation ladder

```bash
npm run typecheck
npm run qa:e2e
```

Manual: tear off section → floating tile appears, source slot greys out, snap to grid works, two snapped tiles form group, group bar matches top-row width, group outline is hull not rectangle, layout persists across reload.

---

## V86D — INSPECTOR MINI-GRAPH DETAIL

**Depends on:** v86a accepted and 345 green  
**Uses:** v86b dimming feature (verify dim mode integration)

### Approach: SVG-based (Approach B)
Second Sigma instance deferred to v90.  
MiniGraphRenderer = SVG root node + spoke nodes with physics tick (gravity + repulsion).

### 4 spokes for v86d
Color, Apply, IDE, History.  
Geometry / Type / Motion / Layout / Code spokes → v89.

### Scoped overrides prerequisite
Extend `ThemeOverride` with `scope` field before anything else in v86d:

```typescript
// themeOverrideStorage.ts addition
export interface ScopedThemeOverride extends ThemeOverride {
  scope: {
    kind: "global" | "target" | "target-kind" | "cluster";
    targetId?: string;      // for "target" kind
    targetKind?: string;    // for "target-kind" kind
    clusterId?: string;     // for "cluster" kind
  };
}
// Migrate existing global-only overrides to scope: { kind: "global" }
// Update theme-override-storage.spec.ts for new shape
```

Only `target` and `global` scope get runtime in v86d.  
`target-kind` and `cluster` runtime deferred to v89.

### New spec files required (Playwright)

```
tests/e2e/inspector-mini-graph.spec.ts
tests/e2e/scoped-overrides-runtime.spec.ts
tests/e2e/color-tab.spec.ts
tests/e2e/apply-tab.spec.ts
tests/e2e/ide-tab.spec.ts
tests/e2e/history-tab.spec.ts
```

### v86d validation ladder

```bash
npm run typecheck
npm run qa:e2e  # now includes new specs
```

Manual: Alt+Shift+click element → mini-graph appears anchored to element, 4 spokes visible, Color spoke opens palette + eyedropper, clicking palette node changes element color immediately, reload persists change, Esc closes and restores dim mode.

---

## V86E — COSMETIC POLISH DETAIL

**Depends on:** v86a AND v86c both accepted and 345 green

### What it delivers
- TopBar with HexLogo + WordmarkBlock + StatusCluster + StatusPill
- Footer with control-plane status + ⌘K hint (decorative only — no handler)
- ControlDock rebuilt as registry-driven (iterates settingsRegistry categories, renders DockSection per category)
- Font loading verified (Space Grotesk, IBM Plex Sans, IBM Plex Mono)
- Reduced-motion: pulsing StatusPill dot respects both setting and `prefers-reduced-motion` media query
- StatusCluster shows live values: node count, edge count, FA2 state, current FPS

### NOT in v86e
- ⌘K command palette runtime → v97
- Hotkey registry behind ⌘K → v97
- Mobile-responsive topbar collapse → out of scope

### New components
```
src/control-plane/topbar/HexLogo.tsx        — parameterized via tokens
src/control-plane/topbar/WordmarkBlock.tsx
src/control-plane/topbar/StatusPill.tsx     — motion-safety aware
src/control-plane/topbar/StatusCluster.tsx  — reads live graph metrics
src/control-plane/topbar/Topbar.tsx         — composes above
src/control-plane/topbar/Footer.tsx
```

### v86e validation ladder

```bash
npm run typecheck
npm run qa:e2e
```

Manual: Solar Plasma identity visible in topbar, all settings reachable via dock sections, StatusCluster shows live values, fonts load (Space Grotesk visible in headings), pulsing dot silenced when reduceMotion enabled.

---

## SETTINGS CHANGES MAPPING (prototype → src)

The Claude Design prototype uses inline tweaks state. Here is how each maps to src:

| Prototype tweak | src location | Notes |
|---|---|---|
| `drama` | `settings.appearance.drama` | New field v86a |
| `motionScale` | `settings.appearance.motionScale` | New field v86a |
| `panelBlur` | `settings.appearance.panelBlur` | New field v86a |
| `nodeHum` | `settings.appearance.nodeHum` | New field v86a |
| `nodeFlowSpeed` | `settings.appearance.nodeFlowSpeed` | New field v86a |
| `nodeGlow` | `settings.appearance.nodeGlow` | New field v86a |
| `clusterDepth` | `settings.graphView.neighborhoodDepth` | Already exists |
| `glitter` | `settings.appearance.glitterEnabled` | Already exists |
| `reduceMotion` | `settings.appearance.reduceMotion` | Already exists |

---

## LONG-TERM REGISTRY STEADY STATE (target: 23 registries)

```
Currently in code (10):
  settingsRegistry, themeTargetRegistry, handleset.registry,
  panel-registry, controlPlaneModeRegistry, perspectiveRegistry,
  command-registry, audioSourceRegistry, motionSafetyRegistry,
  graphViewElementRegistry

Added in v86 (3):
  assetRegistry (v86a), inspectorSpokeRegistry (v86a/d),
  tileSectionRegistry (v86c)

Added v87–v97 (7):
  hotkey registry (v97), lens registry (v93),
  physics dialect registry (v93), node program registry (v90),
  edge program registry (v91), audio mapping rule registry (v92),
  (tile section registry above)

Added v98+ (3):
  theme bundle registry (v100), agent persona registry (v101),
  arena ruleset registry (v102)
```

---

## ARC-LEVEL STOP CONDITIONS

Halt and report immediately if any of these occur:

- A registry's runtime contract drifts from `list/getById/filterByCategory/validateShape/register` pattern
- A theme cannot express a design intent within Tier 2 semantics
- Any canonical token path is used before it's promoted from PLANNED
- Any component references a Tier 1 primitive directly (skipping Tier 2)
- Override conflict resolution returns a result that surprises the user
- Full test cascade (>5 failures) before self-split triggers — streak reset

---

## XP / VERSION TRACKING

Each sub-arc = one accepted pass with version bump:

```
v86a  → bump patch: 0.6.1
v86b  → bump patch: 0.6.2
v86c  → bump patch: 0.6.3
v86d  → bump patch: 0.6.4
v86e  → bump minor: 0.7.0  (arc completion)
```

After v86e: `npm version minor --no-git-tag-version` + commit.

---

## FULL ROADMAP REFERENCE (v86 → v103)

```
v86   Solar Plasma + Token Tier Foundations (IN FLIGHT)
v87   Theme Migration — retrofit 5 themes onto tier model
v88   Workshop MVP — asset import, tagging, remix preview
v89   Inspector Full Radial — 5 more spokes
v90   Node Program Registry + Geometry Presets
v91   Edge Plasma Full — Sigma EdgeProgram replaces v86b overlay
v92   Audio Reactivity
v93   Physics Dialect + Lens Registry
v94   3D Minimap — Three.js companion renderer
v95   Source Adapter Expansion
v96   IDE Integration
v97   Hotkey Registry + Command Palette (⌘K runtime)
v98   Code Spoke — live + diff editor
v99   History Spoke Deepening
v100  Lattica Workshop Hardening
v101  Agent Familiar System
v102  Arena
v103  VR Compatibility (stretch)

Polish arcs (interleave):
vP1   Performance — large-graph mode, FPS guardrails
vP2   Accessibility — WCAG AAA, color-blind palettes
vP3   Documentation
vP4   Onboarding tour
vP5   Community — theme sharing, asset marketplace
```

---

## BANDIT HANDOFF PROMPT (use this for each sub-arc)

```
Bandit, read and follow the V86 MASTER INDEX
located in project knowledge as V86_BANDIT_MASTER_INDEX.md.

This pass is: {V86X — sub-arc name}

Before implementing anything:
1. Run pre-flight checks (top of master index)
2. Read the sub-arc detail section for {V86X}
3. Verify all dependencies are met
4. Read the "Forbidden" list — do not touch those files
5. Implement in the dependency order specified
6. Run typecheck after each file change
7. Run full suite with self-split protocol active on completion
8. Report per the output requirements listed

QA protocol, version bump, and streak rules from
BANDIT_QA_PROTOCOL.md apply throughout.
Current spine: v85f → v86a
Do not proceed to v86b/c/d until v86a is accepted.
```

---

*Master Index version: 1.0 — compiled 2026-05-07*  
*Sources: v86_INDEX.md, v86a-e packets, lumaweave_integration_audit.html (NEW-V86+)*
