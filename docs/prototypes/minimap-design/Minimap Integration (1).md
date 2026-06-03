# Minimap Integration Guide

Drop-in port of the prototype into your `src/` tree. The prototype components in `_minimap-prototype/*.jsx` are 1:1 ports of the eventual `.ts/.tsx` files — same names, same prop shapes, same hook signatures. The only difference is mocks vs. real stores.

This guide walks the whole change file-by-file. **No new theme token paths needed** — everything binds to existing canonical paths or is overridable via `themeTargetRegistry`.

---

## 0. Decision summary

| Decision | Choice | Why |
|---|---|---|
| Floating shell | New `MinimapShell.tsx` (not `FloatingTile`) | FloatingTile is tab-tear-off bound. Minimap is overlay-native. |
| Opacity scope | Independent (`settings.minimap.opacity`) | Minimap overlaps canvas; users want per-panel control. |
| Theme paths | Reuse existing canonical; override via `themeTargetRegistry` | Avoids PLANNED→CANONICAL promotion blocking. |
| Snapshot refresh | Structural events only, 120 ms debounce | Cheap. Live viewport rect handles camera moves separately. |
| Sigma handle | `(window as any).__lwSigma` | Already canonical (SigmaGraphView line ~440). |
| `graph.minimap` registry status | `locked` → `active` | Governance bump required to ship. |
| Public symbol name | `Minimap` | Minimal AppShell diff. |

---

## 1. Files to create

Drop these directly in `src/graph/overlay/`. Each is a 1:1 port from the prototype.

```
src/graph/overlay/
  Minimap.tsx                    ← from _minimap-prototype/minimap.jsx
  MinimapShell.tsx               ← from _minimap-prototype/minimap-shell.jsx
  MinimapSnapshotCanvas.tsx      ← from _minimap-prototype/minimap-snapshot-canvas.jsx
  MinimapViewportRect.tsx        ← from _minimap-prototype/minimap-viewport-rect.jsx
  MinimapChrome.tsx              ← from _minimap-prototype/minimap-chrome.jsx
  useMinimapSnapshot.ts          ← from _minimap-prototype/use-minimap-snapshot.jsx
  useMinimapCamera.ts            ← from _minimap-prototype/use-minimap-camera.jsx
  useMinimapNavigation.ts        ← from _minimap-prototype/use-minimap-navigation.jsx  (NEW)
```

### New behaviors landed in v2

- **Drag-by-header-only.** Panel root no longer has `onMouseDown`. Drag starts from `MinimapHeader` via `ShellContext`. Clicks inside the snapshot pan the camera instead of moving the panel.
- **Click-to-pan + drag-scrub.** `useMinimapNavigation(bounds, areaRef)` returns `{ onMouseDown, onWheel }` for the snapshot area. Reverses the canvas projection to graph coords and calls `sigma.panTo(x, y)` on mousedown and every mousemove until mouseup.
- **Wheel-zoom in unison.** `onWheel` calls `sigma.zoomBy(factor)`. The live viewport rect (driven by `useMinimapCamera`) updates in sync with no snapshot redraw.
- **Collapse direction flip.** `shouldFlip(position, size, collapsed, vh)` returns true when the panel's bottom edge sits in the bottom 25% of the viewport. When flipped, `MinimapHeader` renders at the bottom (with border on top), `MinimapFooter` at the top (with border on bottom). `toggleCollapsed` adjusts `position.y` to preserve the header's visible Y across the collapse, same trick FloatingTile uses.
- **OKLCH-native colors throughout.** Every alpha-derivative of a token uses the relative-color syntax `oklch(from var(--lw-accent) l c h / 0.18)` instead of `color-mix(in oklab, …, transparent)`. The latter collapsed to black when the source had alpha (CSS Color 4 alpha-premultiplication interaction). Requires Chromium 119+ / Firefox 128+ / Safari 16.4+.

### Type-only changes needed during port

Each `.jsx` → `.tsx` swap is mostly adding types. The patterns:

```ts
// useMinimapSnapshot.ts
import type Graph from "graphology";
import type Sigma from "sigma";

export interface MinimapBounds {
  minX: number; minY: number; maxX: number; maxY: number;
}
export interface MinimapSnapshotState {
  snapshotVersion: number;
  bounds: MinimapBounds | null;
  counts: { nodes: number; edges: number };
  isRefreshing: boolean;
}

export function useMinimapSnapshot(): MinimapSnapshotState { /* … */ }
```

```ts
// useMinimapCamera.ts
export interface MinimapViewportRect {
  left: number; top: number; width: number; height: number;
}
export function useMinimapCamera(
  bounds: MinimapBounds | null
): { rect: MinimapViewportRect | null } { /* … */ }
```

The `window.__lwSigma` access stays untyped — same `(window as any).__lwSigma` pattern as `BookmarkLayer.tsx` and the existing `Minimap.tsx`. Don't invent a typed accessor unless you're rolling one for all overlays at once.

### Replace the mock context with the real store

In the prototype, components read settings via `useMinimapSettings()` / `useSetMinimapSetting()` from `mock-stores.jsx`. In production:

```ts
// minimap-shell.tsx etc. — top of file
import { useSettingsStore } from "../../control-plane/settings/settings.store";

const useMinimapSettings = () =>
  useSettingsStore((s) => s.settings.minimap);

const useSetMinimapSetting = () => {
  const setSetting = useSettingsStore((s) => s.setSetting);
  const current    = useSettingsStore((s) => s.settings.minimap);
  return React.useCallback(
    (keyOrPatch: string | Partial<MinimapSettings>, value?: unknown) => {
      const next = typeof keyOrPatch === "string"
        ? { ...current, [keyOrPatch]: value }
        : { ...current, ...keyOrPatch };
      setSetting("minimap", next);
    },
    [setSetting, current]
  );
};
```

(Or hoist these two helpers into their own `useMinimapSettings.ts` so the components don't import the settings store directly — cleaner boundary.)

### Replace mock theme provider with the real one

Delete `applyTheme(themeId)` calls — `AppShell.tsx` already sets the CSS variables (`--lw-panel-background`, `--lw-panel-border`, `--lw-accent`, etc.) on `<main>`. The components consume them as-is.

One token the components use is **not** currently exposed: `--lw-numeric-accent` (the cool cyan in the footer numbers). Two paths forward:

- **Short term:** add a fallback in the components: `color: 'var(--lw-numeric-accent, var(--lw-text-primary))'` — the footer reads as plain text-primary until the path is wired.
- **Long term:** promote `accent.secondary` from `PLANNED_THEME_TOKEN_PATHS` (already declared!) and have AppShell set `--lw-numeric-accent: ${tokens.accent.secondary}`. That's a separate token-promotion ticket.

---

## 2. Files to edit

### 2a. `src/control-plane/settings/settings.schema.ts`

Bump version, reuse `TileAnchor`, add slice.

```ts
// add import at top:
import type { TileAnchor } from "../panels/tile.types";

// add interface:
export interface MinimapSettings {
  visible: boolean;
  collapsed: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;                    // clamped 0.30..1.00 by MinimapOpacitySlider
  anchor: TileAnchor;
  theme: "auto-contrast" | "warm-glass" | "cool-glass";
  showViewport: boolean;
  showSelectedNode: boolean;
  refreshOnLayoutComplete: boolean;
  enableClickToNavigate: boolean;     // scaffolded; renderer ignores until shipped
}

// in StarmapSettings:
export interface StarmapSettings {
  version: 90;                        // v104.0.0: bumped from 89
  // … existing slices …
  minimap: MinimapSettings;
}
```

### 2b. `src/control-plane/settings/settings.defaults.ts`

```ts
export const defaultMinimapSettings: MinimapSettings = {
  visible: true,
  collapsed: false,
  position: { x: 0, y: 0 },           // first-mount: hydrated from anchor
  size: { width: 300, height: 200 },
  opacity: 0.92,
  anchor: { edge: "right", offset: 18 },
  theme: "auto-contrast",
  showViewport: true,
  showSelectedNode: true,
  refreshOnLayoutComplete: true,
  enableClickToNavigate: false,
};

// add into defaultSettings:
export const defaultSettings: StarmapSettings = {
  version: 89,
  // …
  minimap: defaultMinimapSettings,
};
```

### 2c. `src/control-plane/settings/settings.migrations.ts`

```ts
// Add migration 89 → 90 (additive only):
function migrate_89_to_90(prev: StarmapSettings & { version: 89 }): StarmapSettings {
  return {
    ...prev,
    version: 90,
    minimap: defaultMinimapSettings,
  };
}

// Register in the migration chain (style of your existing chain).
```

### 2d. `src/themes/themeTargetRegistry.ts`

Add 4 active targets to `THEME_TARGETS`:

```ts
{
  themeTargetId: "minimap.root",
  label: "Minimap Panel",
  surface: "graph",
  visualHandle: "lw-panel",
  tokenBindings: {
    background: "panel.background",
    border:     "panel.border",
    glow:       "effects.glow.intensity",
  },
  editableProperties: ["background", "border", "glow", "opacity"],
  status: "active",
  notes: "Floating overlay over Sigma canvas. Opacity is settings-driven (settings.minimap.opacity), not theme-driven.",
},
{
  themeTargetId: "minimap.header",
  label: "Minimap Header",
  surface: "graph",
  tokenBindings: {
    background: "panel.background",
    border:     "panel.border",
    text:       "text.primary",
  },
  editableProperties: ["background", "border", "text"],
  status: "active",
},
{
  themeTargetId: "minimap.footer",
  label: "Minimap Footer",
  surface: "graph",
  tokenBindings: {
    background: "panel.background",
    border:     "panel.border",
    text:       "text.muted",
  },
  editableProperties: ["background", "border", "text"],
  status: "active",
},
{
  themeTargetId: "minimap.viewport-rect",
  label: "Minimap Viewport Rectangle",
  surface: "graph",
  tokenBindings: {
    border:     "accent.primary",
    background: "accent.primary",   // resolved with low-alpha mix in component
    glow:       "effects.glow.intensity",
  },
  editableProperties: ["border", "background", "glow"],
  status: "active",
  notes: "Live indicator of main-camera viewport. Updates without redrawing the snapshot canvas.",
},
```

### 2e. `src/graph/graphViewElementRegistry.ts`

Activate the existing locked entry:

```ts
// was:
{
  id: "graph.minimap",
  title: "Graph Minimap",
  status: "locked",
  evidenceKind: "future",
  // …
}

// becomes:
{
  id: "graph.minimap",
  title: "Graph Minimap",
  description: "Floating overview of the entire graph with live viewport indicator.",
  category: "overlay",
  status: "active",
  evidenceKind: "dom-wrapper",
  testSelector: "minimap-panel",
  sigmaBoundary: "Reads (window as any).__lwSigma; never writes. Subscribes to graphology structural events + sigma 'afterRender' for the viewport rect.",
  policyNote: "Snapshot redraws only on structural mutations (nodeAdded/Dropped/edgeAdded/Dropped/cleared). Camera moves update the viewport rectangle only.",
},
```

### 2f. `src/graph/graphVisualThemeMappingRegistry.ts`

Add governance entries (passive metadata, no runtime effect):

```ts
{
  graphElementId: "graph.minimap",
  visualRole: "Minimap panel background",
  canonicalTokenPath: "panel.background",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-panel-background) in MinimapShell.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Minimap panel border (idle)",
  canonicalTokenPath: "panel.border",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-panel-border) in MinimapShell.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Minimap panel border (active drag/resize)",
  canonicalTokenPath: "accent.primary",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-accent) when data-active=true.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Viewport rectangle stroke",
  canonicalTokenPath: "accent.primary",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-accent) in MinimapViewportRect.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Snapshot node fill",
  canonicalTokenPath: "graph.node.fill",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Read by MinimapSnapshotCanvas via getComputedStyle.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Snapshot edge stroke",
  canonicalTokenPath: "graph.edge.stroke",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Read by MinimapSnapshotCanvas via getComputedStyle.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Resize grip color",
  canonicalTokenPath: "panel.tile.handleColor",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-tile-handle) in MinimapResizeGrip.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Status dot (fresh/refreshing/stale)",
  canonicalTokenPath: "accent.primary",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Opacity varies by status; color fixed.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Glass backdrop blur",
  canonicalTokenPath: "panel.blur.amount",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-panel-blur) in MinimapShell.",
},
{
  graphElementId: "graph.minimap",
  visualRole: "Technical caps label font",
  canonicalTokenPath: "typography.font.mono",
  tokenSource: "THEME_TOKEN_PATH_MAP.md",
  status: "active",
  boundaryNote: "Governance mapping only. Applied via CSS var var(--lw-font-mono).",
},
```

### 2g. `src/app/AppShell.tsx`

Two diffs only.

**Diff 1.** Replace the import block:

```diff
- import { Minimap } from "../graph/overlay/Minimap";
+ import { Minimap } from "../graph/overlay/Minimap";    // unchanged path; new file
```

(File path stays the same. Import line stays the same. Nothing to change here unless you decide to use a sub-folder like `overlay/minimap/`.)

**Diff 2.** Delete the IIFE that derives bounds + camera, replace with the one-liner:

```diff
- {/* v86b close-1: Minimap */}
- {(window as any).__lwSigma && (() => {
-   const sigma = (window as any).__lwSigma;
-   try {
-     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
-     sigma.getGraph().forEachNode((id: string) => {
-       const d = sigma.getNodeDisplayData(id);
-       if (!d) return;
-       if (d.x < minX) minX = d.x;
-       if (d.y < minY) minY = d.y;
-       if (d.x > maxX) maxX = d.x;
-       if (d.y > maxY) maxY = d.y;
-     });
-     if (!isFinite(minX)) return null;
-     const cam = sigma.getCamera().getState();
-     return (
-       <Minimap
-         graphBounds={{ minX, minY, maxX, maxY }}
-         viewportBounds={{ x: cam.x, y: cam.y, ratio: cam.ratio }}
-       />
-     );
-   } catch {
-     return null;
-   }
- })()}
+ {/* Minimap — subscribes to Sigma + graphology internally. */}
+ {settings.minimap.visible && <Minimap />}
```

That's the whole AppShell change.

---

## 3. Optional follow-ups (separate tickets)

### 3a. Settings UI

Add a `Mini Graph Map` subsection to `CategoryGraph.tsx`. With the schema slice in place, this is mostly boilerplate using your existing setting controls — visible toggle, theme select, opacity slider (mirrors the in-panel one), the three secondary toggles.

### 3b. Command + hotkey registry

`src/control-plane/commands/command-registry.entries.ts`:

```ts
registerCommand({
  id: "minimap.toggle",
  label: "Toggle Minimap",
  category: "view",
  run: () => {
    const s = useSettingsStore.getState();
    s.setSetting("minimap", { ...s.settings.minimap, visible: !s.settings.minimap.visible });
  },
});

registerCommand({
  id: "minimap.snap-to-corner",
  label: "Snap Minimap to Default Position",
  category: "view",
  run: () => {
    const s = useSettingsStore.getState();
    s.setSetting("minimap", {
      ...s.settings.minimap,
      position: { x: 0, y: 0 },        // forces re-hydrate from anchor on next mount
      size: { width: 300, height: 200 },
    });
  },
});
```

`src/control-plane/hotkeys/hotkey-registry.entries.ts`:

```ts
registerHotkey({ commandId: "minimap.toggle", binding: "Ctrl+M" });
```

### 3c. Selected-node ping

The prototype scaffolds the `selectedPing` but doesn't wire it. To enable: subscribe to `selectedNodeId` (already in AppShell state — pass as a prop or expose via the sigma global / a small selection store), and add a small `<MinimapSelectedPing>` component inside `Minimap.tsx` after `MinimapViewportRect`. Bind position to `getNodeDisplayData(selectedNodeId)` projected through the same `bounds` transform the snapshot uses.

### 3d. Click-to-navigate

`settings.minimap.enableClickToNavigate` ships as `false`. When you flip it on later, the implementation is: bind `onMouseDown` on the snapshot canvas → project click coord back into graph space using `bounds` → call `sigma.getCamera().animate({ x, y, ratio })`. Sigma has built-in easing for this. No new files.

---

## 4. Test contract (Playwright)

The prototype components carry `data-testid`s aligned with the active `graphViewElementRegistry` entry (`graph.minimap` → `testSelector: "minimap-panel"`):

- `minimap-panel`
- `minimap-header`
- `minimap-footer`
- `minimap-snapshot-canvas`
- `minimap-viewport-rect`
- `minimap-status-dot` (with `data-state` attr)
- `minimap-opacity-slider`
- `minimap-resize-grip`
- `minimap-snap` / `minimap-collapse` / `minimap-close`

Suggested spec outline:

```ts
test("minimap shows after structural change", async ({ page }) => {
  // … set up graph …
  await expect(page.getByTestId("minimap-panel")).toBeVisible();
  const v1 = await page.getByTestId("minimap-snapshot-canvas")
    .evaluate((c) => c.toDataURL());
  // trigger a structural change …
  await page.waitForTimeout(200);   // > 120ms debounce
  const v2 = await page.getByTestId("minimap-snapshot-canvas")
    .evaluate((c) => c.toDataURL());
  expect(v1).not.toEqual(v2);
});

test("minimap snapshot does not redraw on camera pan", async ({ page }) => {
  const v1 = await page.getByTestId("minimap-snapshot-canvas")
    .evaluate((c) => c.toDataURL());
  // pan camera …
  const v2 = await page.getByTestId("minimap-snapshot-canvas")
    .evaluate((c) => c.toDataURL());
  expect(v1).toEqual(v2);  // snapshot stays stable
  // but viewport rect moves
  // … assert different left/top on minimap-viewport-rect …
});
```

---

## 5. File mapping cheat sheet

| Prototype file | Production file | Notes |
|---|---|---|
| `_minimap-prototype/minimap.jsx` | `src/graph/overlay/Minimap.tsx` | 1:1 port + types |
| `_minimap-prototype/minimap-shell.jsx` | `src/graph/overlay/MinimapShell.tsx` | 1:1 port + types |
| `_minimap-prototype/minimap-snapshot-canvas.jsx` | `src/graph/overlay/MinimapSnapshotCanvas.tsx` | 1:1 port + types |
| `_minimap-prototype/minimap-viewport-rect.jsx` | `src/graph/overlay/MinimapViewportRect.tsx` | 1:1 port + types |
| `_minimap-prototype/minimap-chrome.jsx` | `src/graph/overlay/MinimapChrome.tsx` | 1:1 port + types |
| `_minimap-prototype/use-minimap-snapshot.jsx` | `src/graph/overlay/useMinimapSnapshot.ts` | 1:1 port + types |
| `_minimap-prototype/use-minimap-camera.jsx` | `src/graph/overlay/useMinimapCamera.ts` | 1:1 port + types |
| `_minimap-prototype/use-minimap-navigation.jsx` | `src/graph/overlay/useMinimapNavigation.ts` | 1:1 port + types. **Project Claude: route through cameraController for eased transitions — see §7.** |
| `_minimap-prototype/mock-stores.jsx` | **DELETE** — replaced by real `useSettingsStore` + AppShell-set CSS vars | — |
| `_minimap-prototype/prototype-harness.jsx` | **DELETE** — AppShell is the host site | — |

---

## 6. Final boundary diagram

```
┌─────────────────── AppShell.tsx ───────────────────┐
│                                                     │
│   <SigmaGraphView/> sets window.__lwSigma           │
│   <Minimap/> ◄─── settings.minimap.visible gate     │
│                                                     │
└─────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────── Minimap.tsx ────────────────────────┐
│   useMinimapSettings()  ◄── useSettingsStore       │
│   useMinimapSnapshot()  ◄── window.__lwSigma       │
│                            + graphology events     │
│   useMinimapCamera()    ◄── window.__lwSigma       │
│                            + sigma 'afterRender'   │
│   ┌── MinimapShell (drag/resize/persist/clamp)    │
│   │   ├── MinimapHeader (status dot, breadcrumb)  │
│   │   ├── MinimapSnapshotCanvas (static; v-bumps) │
│   │   ├── MinimapViewportRect (live; no redraw)   │
│   │   ├── MinimapFooter (opacity, n/e counts)     │
│   │   └── MinimapResizeGrip                       │
│   └──                                              │
└─────────────────────────────────────────────────────┘

Reads from:   graphology events (structural only) → snapshot
              sigma 'afterRender' (high-frequency) → viewport rect
              settings.minimap (Zustand)           → position/size/opacity/etc.

Writes to:    settings.minimap                     → position/size/opacity/visible/collapsed
              (NEVER writes to graph or sigma in this pass)
```

The only mutable boundary is settings. Graph + Sigma are read-only **except** when the navigation hook writes to camera state (`sigma.panTo`, `sigma.zoomBy` in the prototype). In production this routes through `cameraController` — see §7.

---

## 7. Camera handoff — for project Claude

The navigation hook (`useMinimapNavigation`) routes **all camera writes** through `window.__lwCameraController` — the same handle `SigmaGraphView.tsx` installs at line 441 alongside `__lwSigma`. The mock controller in `mock-stores.jsx` matches the real `CameraController` API surface exactly, so the prototype's hook code is the production hook code.

**Real `CameraController` API** (`src/graph/overlay/cameraController.ts`):

```ts
interface CameraController {
  pan(dx: number, dy: number, opts?: { animated?: boolean }): void;
  zoom(factor: number, opts?: { animated?: boolean; anchor?: { x: number; y: number } }): void;
  rotate(degrees: number, opts?: { animated?: boolean }): void;
  reset(): void;
  getState(): { x: number; y: number; ratio: number; angle: number };
}
```

- `pan` is **relative** (dx, dy added to current state). For an absolute jump, compute `pan(target.x - getState().x, target.y - getState().y)`.
- `zoom(factor)` multiplies `ratio` by `factor`. Smaller factor = zoom in.
- `animated: true` (default) uses the controller's eased 380ms transition; `animated: false` uses `setState` for instant updates.
- `reduceMotion: true` at controller construction time forces 0ms easing.

**Prototype behavior the production hook already matches:**

```ts
// Click / start of drag → animated jump
controller.pan(dx, dy, { animated: true });

// Subsequent mousemoves during drag → instant tracking
controller.pan(dx, dy, { animated: false });

// Wheel tick → instant per-tick zoom (small enough to feel snappy without jank)
controller.zoom(factor, { animated: false });
```

**Decisions project Claude owns (and can change in one place each):**

| Concern | Where to change | Notes |
|---|---|---|
| **Eased click/drag** | `useMinimapNavigation.ts` `onMouseDown` handler | Flip `animated: false` → `true` in the mousemove path. Default left as `false` because the controller's 380ms ease compounds during fast scrubs and looks laggy. |
| **Eased wheel** | `useMinimapNavigation.ts` `onWheel` handler | Same — flip to `animated: true` if you want each tick to ease. |
| **Wheel zoom anchor** | `useMinimapNavigation.ts` `onWheel` handler | Currently zooms around the camera's current center. To zoom around the cursor's projected graph point instead, project `clientX/clientY` through `unproject` and pass `{ anchor: { x, y } }` to `controller.zoom(...)`. |
| **Wheel-zoom event-bubbling conflict with Sigma's own wheel listener** | `useMinimapNavigation.ts` `onWheel` already calls `e.stopPropagation()` | Confirm Sigma's wheel listener is attached such that propagation actually stops it; if it's on `window`, additional measures may be needed. |
| **Drag-pan throttling** | `useMinimapNavigation.ts` `onMouseDown` mousemove | Currently fires on every mousemove (potentially 120Hz). rAF-throttle if the controller's `setState` proves expensive in production. |
| **Click vs. drag dead zone** | `useMinimapNavigation.ts` `onMouseDown` | No threshold currently — every mousedown immediately pans. Add ~3px dead zone before treating as a drag-scrub if click-only navigation should not jitter. |
| **`enableClickToNavigate` gating** | `Minimap.tsx` | Currently `useMinimapNavigation` is always wired. Gate it on the setting: `const nav = settings.enableClickToNavigate ? useMinimapNavigation(...) : { onMouseDown: undefined, onWheel: undefined };` |
| **Default of `enableClickToNavigate`** | `settings.defaults.ts` | Ships `false` per the original spec. Recommend flipping to `true` now that the prototype demonstrates the interaction is solid — and considering deprecating the toggle entirely. |

**Files I read to align:**

- `src/graph/overlay/cameraController.ts` — primary API source. Used verbatim.
- `src/graph/overlay/CameraHUD.tsx` — confirms `zoom % = round(1 / ratio * 100)`. Worth knowing if the minimap ever shows a numeric zoom indicator.
- `src/graph/overlay/BookmarkLayer.tsx` — no screen↔graph coord conversion used (bookmarks are pointer-events:none). The prototype's hand-rolled `unproject` is the right pattern for the minimap.

---

## 8. What the prototype DOESN'T cover (project Claude scope)

In addition to the camera-handoff items above:

- **Selected-node ping inside the minimap.** Scaffolded as a comment; wiring depends on `selectedNodeId` from AppShell's existing state. Pass as a prop or expose via a small selection store. Project from `sigma.getNodeDisplayData(id)` through the same bounds transform the snapshot uses.
- **Persistence write throttling.** The prototype calls `setMinimapSetting` on every mousemove during drag/resize. Production should debounce writes to the Tauri-backed settings store (currently every position pixel = one write).
- **Settings UI in `CategoryGraph.tsx`.** Boilerplate using your existing setting controls — visible toggle, theme select, opacity slider mirror, the three secondary toggles.
- **Command + hotkey registry entries.** Listed in §3b above.
- **Touch / gesture support.** Prototype is mouse-only. If Tauri is shipped for tablets, add touch handlers — same logic, different event source.
- **Playwright spec.** Test IDs are in place; spec outline in §4.
