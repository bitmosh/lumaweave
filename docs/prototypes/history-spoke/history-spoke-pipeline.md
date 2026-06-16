# History Spoke — Pipeline Trace

Maps the full architecture of the inspector history spoke: how a selected element's per-element color overrides are displayed, reset individually or wholesale, and kept reactive without triggering React re-renders.

**Audited:** 2026-06-03  
**Status:** Active — fully wired since v86d.4

---

## What It Does

The history spoke is the override audit view for an inspected target. When you Alt+Shift+click any themed element and select the history spoke from the radial menu, you see:

- Every **target-scoped** color override that has been applied to that specific element — token path, color chip, current value, and timestamp
- A **Reset** button per row that removes that individual override
- A **Reset All** button that clears all overrides for the target at once
- An **empty state** ("No edits yet") when the target has no overrides
- **Live reactivity** — if another spoke (e.g., Color) applies an override while the history tab is open, the list updates immediately via the `lw:override-change` event

---

## How It Differs from the IDE Spoke

| | IDE spoke | History spoke |
|---|---|---|
| **Data source** | Static build-time JSON (provenance manifest) | Live runtime localStorage |
| **Data shape** | One entry per target, immutable | Many entries per target, mutable |
| **Writes data?** | No — read only | Yes — Reset and Reset All mutate localStorage |
| **Reactivity** | None needed (static) | Subscribes to `lw:override-change` event |
| **Outbound event** | `inspector:open-in-ide` | None |

---

## Full Pipeline Trace

### Entry point — same as all spokes

```
User Alt+Shift+clicks a DOM element with data-lw-theme-target="<id>"
  ↓
ThemeTargetInspectorOverlay.tsx
  Dispatches "inspector:open" CustomEvent with:
    { targetId, label, surface, status, anchorX, anchorY }
  ↓
InspectorMiniGraph.tsx
  Listens for "inspector:open", extracts TargetDescriptor,
  pulls all registered spokes from inspectorSpokeRegistry
  ↓
MiniGraphRenderer.tsx
  Renders SVG radial: root node + 9 spoke nodes in a physics-simulated ring
  ↓
User clicks the History spoke node
  ↓
MiniGraphRenderer sets expandedSpokeId = "history"
  Mounts HistoryTab React component
```

### HistoryTab — load, display, react

```
HistoryTab.tsx  receives TargetDescriptor as props

On mount and whenever targetDescriptor.targetId changes:
  1. refresh() called immediately:
       setOverrides( getTargetOverrides(targetDescriptor.targetId) )
       → reads localStorage key "lumaweave-theme-overrides"
       → filters for overrides where scope.kind === "target"
         AND scope.targetId === targetId
       → returns ThemeOverride[]

  2. Attaches "lw:override-change" window event listener:
       on event → calls refresh() again
       Cleanup: removes listener on unmount / targetId change

Renders:
  If overrides.length === 0:
    Empty state — "No edits yet."

  If overrides.length > 0:
    For each ThemeOverride:
      - tokenPath label           (e.g., "text.primary")
      - 12×12px color chip        (backgroundColor: o.value if string)
      - value string              (e.g., "#FF6B1A")
      - timestamp                 (toLocaleTimeString() if present)
      - Reset button
    Reset All button at the bottom
```

### Per-entry Reset

```
User clicks Reset on a row
  ↓
handleReset(tokenPath) in HistoryTab
  ↓
removeTargetOverride(targetDescriptor.targetId, tokenPath)
  in themeOverrideStorage.ts:
    loadOverrides() from localStorage
    filters out entry where:
      scope.kind === "target"
      scope.targetId === targetId
      tokenPath === tokenPath
    saveOverrides() back to localStorage
  ↓
notifyOverrideChange()
  in useResolvedTargetColor.ts:
    increments window.__lwOverrideVersion
    dispatches "lw:override-change" CustomEvent
  ↓
HistoryTab's event listener fires → refresh() → list updates
All useResolvedTargetColor subscribers also re-read their values
  (e.g., AppShell's topbarBorder, topbarText, topbarAccent re-resolve)
```

### Reset All

```
User clicks Reset All
  ↓
handleResetAll() in HistoryTab
  iterates over overrides array (captured at render time)
  for each override:
    removeTargetOverride(targetId, override.tokenPath)
  ↓
notifyOverrideChange()  ← called once after all removals
  ↓
HistoryTab refreshes → empty state shown
All override-aware consumers re-read their values
```

---

## Override Storage — themeOverrideStorage.ts

The persistence and resolution layer. All reads and writes go through this module.

### Storage shape (localStorage key: `lumaweave-theme-overrides`)

```json
{
  "version": "1.0.0",
  "overrides": [
    {
      "tokenPath": "text.primary",
      "value": "#FF6B1A",
      "timestamp": 1748900000000,
      "scope": { "kind": "target", "targetId": "topbar.root" }
    },
    {
      "tokenPath": "accent.primary",
      "value": "#FFB347",
      "timestamp": 1748900001000,
      "scope": { "kind": "global" }
    }
  ]
}
```

### ThemeOverride type

```typescript
export interface ThemeOverride {
  tokenPath:  ThemeTokenPath;  // validated against CANONICAL_THEME_TOKEN_PATHS
  value:      ThemeTokenValue; // string | number
  timestamp:  number;          // Date.now() at write time
  scope:      OverrideScope;
}

export interface OverrideScope {
  kind:          "global" | "target" | "target-kind" | "cluster";
  targetId?:     string;  // for kind: "target"
  targetKind?:   string;  // for kind: "target-kind"
  clusterAnchor?: string; // for kind: "cluster"
}
```

### Scope priority (resolution order)

```
target          ← highest — per-element, specific to one targetId
target-kind     ← per surface class (e.g., all "panel" targets)
cluster         ← per neighborhood anchor (deferred — see notes)
global          ← lowest — applies to everything without a narrower match
```

`resolveForTarget(tokenPath, targetId, targetKind?, clusterAnchor?)` walks this priority chain and returns the first match, or `undefined` if none.

### Validation on every write

Both token path and value are validated before being stored:
- **Path:** must be in `CANONICAL_THEME_TOKEN_PATHS` — planned paths and arbitrary strings are rejected
- **Value:** must be `string | number`

### Load-time cleanup

Every `loadOverrides()` call (triggered on every read) runs:
1. Normalizes missing `scope` fields (pre-v86a data gets `scope: { kind: "global" }`)
2. Filters out invalid token paths and values
3. One-time migration: removes stale `target`-scoped `node.geometry.preset` entries
4. Deduplicates by `(scope, tokenPath)` key — keeps most-recent by timestamp

### Key functions used by HistoryTab

| Function | Purpose |
|---|---|
| `getTargetOverrides(targetId)` | Returns all target-scoped overrides for one element |
| `removeTargetOverride(targetId, tokenPath)` | Removes one target-scoped override |
| `notifyOverrideChange()` | Increments `window.__lwOverrideVersion`, fires `lw:override-change` |

---

## Reactivity — lw:override-change

This custom event is the nervous system connecting all override-aware parts of the app. It fires whenever any override is written or removed.

### Who fires it

| Caller | When |
|---|---|
| `HistoryTab` → `notifyOverrideChange()` | After Reset or Reset All |
| `ColorTab` → `notifyOverrideChange()` | After applying a color override |
| `ApplyTab` → `notifyOverrideChange()` | After applying any override |
| `GeometryTab` → `notifyOverrideChange()` | After a geometry preset override |

### Who listens

| Listener | How | Effect |
|---|---|---|
| `HistoryTab` | `window.addEventListener("lw:override-change", refresh)` | Re-reads `getTargetOverrides()`, updates list |
| `useResolvedTargetColor` | `useSyncExternalStore(subscribe, getSnapshot)` | Forces re-render of any component reading a resolved override (AppShell's topbar colors, etc.) |
| `SigmaGraphView` (geometry effect) | `window.addEventListener("lw:override-change", handler)` | Updates node geometry type in-place, calls `sigma.refresh()` |

### Why useSyncExternalStore (not useState)

`useResolvedTargetColor` uses `useSyncExternalStore` with the `lw:override-change` event rather than React state. This makes it immune to Vite HMR module-boundary splits and React 18 Strict Mode double-invoke edge cases that plain `useState` + `useEffect` listeners can hit when the event fires across module reload boundaries.

```typescript
// useResolvedTargetColor.ts
function subscribe(callback: () => void): () => void {
  window.addEventListener("lw:override-change", callback);
  return () => window.removeEventListener("lw:override-change", callback);
}

function getSnapshot(): number {
  return window.__lwOverrideVersion ?? 0;
}

export function useResolvedTargetColor(targetId, tokenPath, fallback) {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // ↑ subscribes but only uses the version number as a re-render trigger
  const resolved = resolveForTarget(tokenPath, targetId);
  return typeof resolved === "string" ? resolved : fallback;
}
```

---

## Spoke Registration

```typescript
// registerHistorySpoke.ts
inspectorSpokeRegistry.register({
  id:           "history",
  name:         "History",
  label:        "History",
  category:     "appearance",
  enabled:      true,
  order:        8,           // renders last in the ring
  icon:         "🕐",
  color:        "inspector.radial.spokeColor",
  tabComponent: HistoryTab,  // active — no placeholder
});
```

Registered in AppShell's mount effect as the last spoke (`registerHistorySpoke()` at position 8 of 9).

In the Playwright tests, the history spoke renders at approximately `anchorY - 70` (angle 270° in the ring). When the topbar anchor is near the top of the viewport this puts the spoke above y=0, outside the Playwright viewport bounds check — so tests dispatch a synthetic click via `page.evaluate()` rather than using `locator.click()`.

---

## Key Files

| File | Role |
|---|---|
| `src/control-plane/inspector/spokes/HistoryTab.tsx` | Tab component — renders override list, Reset, Reset All |
| `src/control-plane/inspector/spokes/registerHistorySpoke.ts` | Registers the history spoke in the registry |
| `src/themes/themeOverrideStorage.ts` | All override persistence logic — read, write, validate, scope resolution |
| `src/themes/useResolvedTargetColor.ts` | `useSyncExternalStore`-based hook for reactive override reads; exports `notifyOverrideChange()` |
| `src/themes/inspectorSpokeRegistry.ts` | Central registry; `subscribe()` used by InspectorMiniGraph |
| `src/control-plane/inspector/InspectorMiniGraph.tsx` | Listens for `inspector:open`, owns TargetDescriptor state |
| `src/control-plane/inspector/MiniGraphRenderer.tsx` | SVG radial + physics layout, routes spoke click → tab |
| `src/themes/ThemeTargetInspectorOverlay.tsx` | Entry point — Alt+Shift+click detection, dispatches `inspector:open` |
| `src/control-plane/inspector/inspector.types.ts` | `TargetDescriptor` type |
| `src/control-plane/inspector/styles/color-tab.css` | Styles for `.lw-history-tab`, `.lw-history-row`, `.lw-history-color-chip`, `.lw-history-reset-btn`, `.lw-history-reset-all`, `.lw-tab-empty` |

---

## Custom Events

| Event | Dispatched by | Consumed by | Payload |
|---|---|---|---|
| `inspector:open` | `ThemeTargetInspectorOverlay` | `InspectorMiniGraph` | `TargetDescriptor` + anchor coords |
| `lw:override-change` | `notifyOverrideChange()` (called by HistoryTab, ColorTab, ApplyTab, GeometryTab) | `HistoryTab` (refresh), `useResolvedTargetColor` (re-render trigger), `SigmaGraphView` geometry effect | None — event is a pure notification; consumers re-read from localStorage |

---

## Test Coverage

**`tests/e2e/inspector-spokes-history.spec.ts`**

| Test | What it covers |
|---|---|
| History spoke appears in mini-graph | `[data-spoke-id="history"]` is present in the radial |
| Clicking History spoke opens history-tab | `[data-testid="history-tab"]` becomes visible |
| history-tab shows empty state when no overrides exist | `history-empty` visible, `history-list` absent |
| history-tab shows override rows after seeding | Seeds via `__lwThemeOverrideStorage.setTargetOverride()`, checks row renders |
| Reset button removes the override row | Clicks `reset-text.primary`, row disappears, empty state returns |
| Reset all removes all override rows | Seeds two overrides, clicks `reset-all`, both rows gone |
| Back button returns to ring view | Clicks back, history-tab gone, spoke ring returns |

**Related specs:**

| Spec | What it covers |
|---|---|
| `tests/e2e/theme-override-storage.spec.ts` | Storage layer — set/get/remove/reset, validation, scopes |
| `tests/e2e/scoped-overrides-runtime.spec.ts` | Target-kind and cluster scope resolution at runtime |
| `tests/e2e/v89-1-override-visibility-indicator.spec.ts` | Override indicator dots in `ThemeTargetInspectorOverlay` |

---

## Scope System — Current vs Deferred

| Scope kind | Status | Used by HistoryTab? |
|---|---|---|
| `target` | **Live** (v86d.1) | Yes — `getTargetOverrides()` returns only target-scoped entries |
| `global` | **Live** (v34a) | No — HistoryTab only shows target-scoped overrides |
| `target-kind` | **Live** (v89.2) | No — not surfaced in the history tab UI yet |
| `cluster` | **Deferred** | No — requires a "given targetId, what cluster anchor applies" primitive that v89.2 did not ship |

The history tab currently only shows `target`-scoped overrides for the selected element. Global overrides are visible in the Apply tab. Target-kind and cluster overrides exist in storage but have no dedicated history UI yet — that's a natural expansion point.
