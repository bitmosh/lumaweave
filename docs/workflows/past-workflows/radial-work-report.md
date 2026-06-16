# Radial Inspector — State Report

_Generated: 2026-06-04 · v0.12.0 · No code changes._

---

## §1 — Current live radial: what exists today

"Live" here means what's **committed at HEAD** (`fix(v105.0.3)`). All changes described in later sections are **working tree only, not yet committed**.

### Committed components

**`src/control-plane/inspector/InspectorMiniGraph.tsx:15`**
Top-level listener. Handles `inspector:open` custom event; stores `TargetDescriptor`; manages dim-mode mutation (`graphView.dimMode → "outside-cluster"` on open, restored on close); Esc key handler. Passes `spokes` from registry subscription to `MiniGraphRenderer`. No `animationsActive` prop at HEAD.

**`src/control-plane/inspector/MiniGraphRenderer.tsx:1–267`** (HEAD)
SVG physics implementation. `svgSize = 320`. Fixed-position `<svg>` element at `zIndex: 80`. Physics constants: `SPRING_K = 0.02`, `REPULSION_K = 80`, `DAMPING = 0.85`, `VELOCITY_THRESHOLD = 0.5`. State: `spokePositions`, `positionsRef`, `expandedSpokeId`. rAF tick: spring attraction to root + inter-spoke repulsion + damping.

Two render modes — the entire 320×320 area swaps between them:
1. **Ring view** (`expandedSpokeId === null`): renders `<svg>` with spoke `<line>` connectors, `<RootNode>`, and one `<SpokeNode>` per registered spoke.
2. **Tab view** (`expandedSpokeId !== null && TabComponent && targetDescriptor`): renders a plain `<div className="inspector-mini-graph-tab">` containing the `TabComponent` directly. The ring disappears.

Tab-mount lifecycle: `setExpandedSpokeId(spoke.id)` → next render returns TabComponent div → `onClose()` resets `expandedSpokeId(null)` → ring resumes.

**`src/control-plane/inspector/RootNode.tsx:1–49`** (HEAD, committed)
SVG `<g>` component. Two `<circle>` elements (fill + border stroke) + `<text>` label. Carries `data-lw-theme-target="inspector.root"`. Radius parameter defaults to 20.

**`src/control-plane/inspector/SpokeNode.tsx:1–82`** (HEAD, committed)
SVG `<g>` component. Circle with `data-spoke-id` attribute, `onClick` prop. `isPlaceholder=true` renders at opacity 0.4. No icon path support — emoji `icon` field was the only per-spoke visual identifier at this point.

**`src/themes/inspectorSpokeRegistry.ts`** (HEAD)
Interface has 12 fields. Unused five: `description?`, `icon?`, `parentSpokeId?`, `action?`, `tabContent?`. Import includes `ReactNode` (for the now-unused `tabContent` field). `status` union is `"active" | "placeholder"` only — no `"beta"`.

### Spoke registration set at HEAD (sorted by `order`)

| id | order | icon | status | tabComponent |
|----|-------|------|--------|-------------|
| color | 0 | `"🎨"` | _(omitted→active)_ | `ColorTab` |
| geometry | 1 | `"◉"` | `"active"` | `GeometryTab` |
| type | 2 | `"T"` | `"placeholder"` | `makePlaceholderTab("type")` |
| motion | 3 | `"◌"` | `"placeholder"` | `makePlaceholderTab("motion")` |
| layout | 4 | `"⊞"` | `"placeholder"` | `makePlaceholderTab("layout")` |
| code | 5 | `"</>"` | _(omitted→active)_ | `CodeTab` |
| apply | 6 | `"🎯"` | _(omitted→active)_ | `ApplyTab` |
| history | **8** | `"🕐"` | _(omitted→active)_ | `HistoryTab` |

Note: History `order: 8` is a stale value. The old IDE spoke (order 7) was removed in v105.0.1 but History was never decremented. `angleFor(8, 8) = 270°` — same angle as `angleFor(0, 8)` — so Color and History spawn at the same position. The old renderer used `spoke.order` directly for angle calculation rather than array index.

**`src/control-plane/inspector/spokes/GeometryTab.tsx`** (HEAD)
No scope picker. `targetDescriptor` is received but aliased as `_targetDescriptor` and unused. All writes go to `setGlobalOverride("node.geometry.preset", presetId)`. Three `test.fixme` items in `tests/e2e/geometry-spoke.spec.ts:37,44,68`.

**`src/control-plane/inspector/spokes/IdeTab.tsx`** (HEAD, committed)
Exists. Deprecated since v105.0.1 (superseded by `CodeTab`). No consumers at HEAD but not yet deleted.

---

## §2 — Redesign in flight: what's changed

The redesign is **not a separate branch or prototype directory**. It exists entirely as uncommitted working-tree changes against HEAD — 17 files, verified, but not committed. Running `npm run dev` serves the new design; `git show HEAD:...` returns the old.

### Design direction

**Visual:** Fixed-position HTML `<div>` stage (320×320). Spoke buttons are CSS-positioned HTML `<button>` elements. A non-interactive decorative `<svg>` overlays two dashed ring circles + crosshair lines. The ring stays visible when a spoke is open. The tab content renders in a submenu panel that appears alongside the ring rather than replacing it.

**Structural:** Removed physics. Added viewport-clamped submenu. Added spoke clearance detection (prevents submenu from covering the active spoke when top-clamped). Added aurora gradient background on the outer stage container. Ring spin animation driven by `animationsActive` prop, stops when a spoke is open.

**Key constants** (`MiniGraphRenderer.tsx:13–22`, working tree):
```
STAGE = 320  CENTER = 160  RING_R = 118  RING_BTN = 60
SUB_OFFSET = 47  SUBMENU_W = 240  SUBMENU_MAX_H = 320
VP_MARGIN = 8  TOPBAR_H = 44
```

**Spoke angle calculation** (`MiniGraphRenderer.tsx:24`):
```ts
const angleFor = (index: number, total: number) => (index / total) * 360 - 90;
```
Uses sorted-array **index**, not `spoke.order`. Immune to gaps in order values. History `order: 7` (fixed from 8) doesn't matter for positioning — index is what counts.

**Tab mount lifecycle (new model):**
1. Spoke click → `setActiveSpokeId(spoke.id)` (was `setExpandedSpokeId`)
2. Ring stays rendered; submenu `<div>` appears at viewport-clamped coordinates alongside the ring
3. `TabComponent` renders inside `.lw-radial-submenu-body`
4. `onClose()` → `setActiveSpokeId(null)` → submenu disappears, ring returns to idle state
5. Stage background click: if spoke open → close spoke; else → close inspector
6. Center button: if spoke open → close spoke; else → close inspector

**Settings preview** (`src/control-plane/settings/categories/CategoryInspector.tsx:33–169`):
`RadialPreviewWidget` — added this session, not at HEAD. Renders the full ring using the same CSS classes as the live inspector. Subscribes to `inspectorSpokeRegistry`. Submenu uses angle-based `translate(txPct%, tyPct%)` (no viewport clamping needed in the scrollable settings context). Wrapped in `.lw-radial-frame` for aurora background. Constants duplicated from `MiniGraphRenderer` — not imported.

### What's working
- All 8 spokes render, position correctly, open their tabs
- Submenu viewport clamping: no off-screen panel regardless of anchor position
- Spoke clearance: top-clamped submenu no longer covers the active spoke button (`MiniGraphRenderer.tsx:226–230`)
- Aurora gradient (`MiniGraphRenderer.tsx:99–103`)
- Geometry scope picker: "This" → `setTargetOverride`, "All" → `setGlobalOverride` (`GeometryTab.tsx:48–55`)
- `:focus-visible` rings on spokes and center button (`SettingsPanel.css:1011–1017`)
- Submenu pop-in animation, `prefers-reduced-motion` guarded (`SettingsPanel.css:1041–1062`)
- All CSS variable references verified against AppShell-set variables
- 635 E2E tests passing, typecheck clean

### What's uncommitted
Every changed file is in the working tree, staged or unstaged, against HEAD. None of the redesign changes are committed.

---

## §3 — What's kept vs replaced

### Kept (unchanged or lightly modified)
| File | Status |
|------|--------|
| `InspectorMiniGraph.tsx` | Modified: +`animationsActive` prop pass-through |
| `inspector.types.ts` | Unchanged |
| `ColorTab.tsx`, `HistoryTab.tsx`, `ApplyTab.tsx`, `CodeTab.tsx`, `PlaceholderTab.tsx` | Unchanged |
| `nodeProgramThumbnails.ts` | Unchanged |
| `colorTabUtils.ts` | Unchanged |
| `geometry-tab.css`, `color-tab.css`, `placeholder-tab.css` | Unchanged |
| `CategoryInspector.tsx` | Modified: `RadialPreviewWidget` added |

### Replaced / deleted
| File | What happened |
|------|--------------|
| `MiniGraphRenderer.tsx` | Full rewrite: SVG+physics → HTML/CSS radial |
| `RootNode.tsx` | Deleted (SVG component, no longer needed) |
| `SpokeNode.tsx` | Deleted (SVG component, no longer needed) |
| `IdeTab.tsx` | Deleted (deprecated since v105.0.1, superseded by `CodeTab`) |

### Contracts honored by the new design
- `inspector:open` custom event shape `{targetId, label, surface, status, anchorX, anchorY}` — unchanged, dispatched by `ThemeTargetInspectorOverlay.tsx:262`
- `TargetDescriptor` interface (`inspector.types.ts:7`) — unchanged
- `tabComponent?: ComponentType<{ targetDescriptor: TargetDescriptor; onClose?: () => void }>` — preserved; all tab components receive the same props
- `data-testid="inspector-mini-graph"` — preserved on outer container
- `data-spoke-id` attribute on spoke elements — preserved
- `data-lw-theme-target="inspector.spoke"` on spoke elements — preserved
- `data-placeholder="true"` on placeholder spoke elements — restored (was missing in the initial rewrite, fixed before this report)
- `[aria-label="back"]` inside tab components — unchanged

### Contract-level changes
- `inspectorSpokeRegistry.ts`: 5 fields removed (`description`, `icon`, `parentSpokeId`, `action`, `tabContent`). `"beta"` added to `status` union. `iconPath?` and `iconFill?` added.
- `MiniGraphRendererProps`: `animationsActive: boolean` added (required). Only one call site: `InspectorMiniGraph.tsx:116`.
- `themeOverrideStorage.ts`: geometry target-scope migration block removed from `loadOverrides()`. Target-scoped `node.geometry.preset` entries now persist where they were previously auto-cleaned.
- `GeometryTab.tsx`: `targetDescriptor` is now actively used (was `_targetDescriptor` in HEAD).

---

## §4 — Open design questions

**Q1: When does this get committed?**
The working tree redesign is complete and tested. Per `CLAUDE.md`, a Discord merge gate (#approve-this) is required before any commit. No commit has been posted or approved.

**Q2: Should `.is-beta` have distinct CSS?**
`MiniGraphRenderer.tsx:191` applies `"is-beta"` class and renders a `β` tag pill (`MiniGraphRenderer.tsx:200`). `SettingsPanel.css:1034` has `.lw-radial-spoke-tag` CSS for the pill, but no `.lw-radial-spoke.is-beta` rule. Beta spokes look identical to active spokes except for the text pill. Intentional or gap?

**Q3: Keyboard navigation approach?**
`:focus-visible` is implemented. No arrow-key handling exists. Question: should Left/Right rotate around the ring (circular, index-based), or Tab/Shift-Tab fall through naturally? When the submenu is open, does focus move into it, and if so, how does Escape behave (close submenu only vs close inspector)?

**Q4: HistoryTab — should global-scope edits appear?**
`HistoryTab` calls `getTargetOverrides(targetDescriptor.targetId)` — returns only target-scoped overrides. A Geometry "All" scope edit, or a Color "All" scope edit, won't appear in History for any target. Consistent with the tab's name ("History" = what changed on this element), but potentially confusing given the scope pickers on Color and Geometry.

**Q5: ApplyTab — 3 skipped tests, what's the fixture approach?**
Three tests in `inspector-spokes-apply.spec.ts:41,57,72` are `test.skip()` because the DOM probe returns no candidates on a fresh page. Options: (a) inject synthetic `data-lw-theme-target` element in a test helper before opening the inspector; (b) wait for a graph-loaded test suite; (c) accept the skip permanently.

**Q6: `RadialPreviewWidget` constants are duplicated, not imported.**
`CategoryInspector.tsx:9–13` re-declares `STAGE`, `CENTER`, `RING_R`, `RING_BTN`, `SUB_OFFSET`. If `MiniGraphRenderer.tsx` constants change, the preview silently drifts out of sync. Should these be exported from a shared constants file?

---

## §5 — Dependencies and touchpoints

**`ThemeTargetInspectorOverlay.tsx:234–282`**
Always-on `click` listener. Dispatches `inspector:open` on Alt+Shift+click of registered targets. Contract is stable. No changes needed.

**`AppShell.tsx:360–376`**
Sets every CSS variable the radial design consumes:
- `--lw-app-background`, `--lw-panel-background` — stage gradient and submenu background
- `--lw-app-glow` — glow fallback (replaces old `--lw-glow` which was never set)
- `--lw-color-magenta-500`, `--lw-color-purple-500` — aurora gradient layers
- `--lw-inspector-radial-spoke-color` — spoke button tinting and borders
All correctly referenced. Pre-existing `--lw-glow` and `--lw-app-bg` references in OTHER sections of `SettingsPanel.css` (outside the radial block, lines 35–773) remain undefined — these are pre-existing across the whole file and outside the scope of this redesign.

**`SettingsPanel.css:885–1103`**
All radial CSS. Shared by `MiniGraphRenderer` (live) and `RadialPreviewWidget` (settings preview). Single source of truth for visual language. If the radial CSS changes, both are affected.

**`themeOverrideStorage.ts`**
The `loadOverrides()` filter that stripped `node.geometry.preset` target-scoped overrides has been removed. All callers of `loadOverrides()` now see those entries. Downstream: `getTargetOverrides()`, `getTargetOverride()`, the dedup pass, the save path. No schema change — the data shape is valid, previously it was being discarded at read time.

**`useResolvedTargetColor.ts` + `lw:override-change` event**
`notifyOverrideChange()` is called after every write in ColorTab, GeometryTab, HistoryTab (via `removeTargetOverride`), and ApplyTab. HistoryTab subscribes via `useSyncExternalStore`. Override-visibility indicators also subscribe. No changes to this system.

**`InspectorMiniGraph.tsx:50–63` — dim mode mutation**
On open: `useSettingsStore.setState(...)` directly sets `graphView.dimMode = "outside-cluster"`. This bypasses the normal `setSetting` path. On close, the previous value is restored from `previousDimModeRef`. If the settings schema for `graphView.dimMode` changes, this manual mutation may drift.

**`tests/e2e/helpers/inspector.ts:12`**
`openInspectorOnTopbar` clicks topbar at `(x:8, y:16)` — the far-left logo region with no child elements. If the topbar's left padding or the HexLogo width changes, this helper may begin hitting an interactive child and the inspector won't open.

**`CategoryInspector.tsx` / `RadialPreviewWidget`**
No viewport clamping — uses angle-based `translate(txPct%, tyPct%)` for the submenu in the settings preview. This is correct for a scrollable settings container. But the submenu transform logic is NOT shared with `MiniGraphRenderer.tsx` — it's a parallel implementation. Changes to submenu appearance should be applied in both places.

---

## §6 — Suggested next pass

**Commit gate.** The redesign is complete, tested (635 pass / 0 fail), and typechecks clean. It has been sitting uncommitted in the working tree through the entire polish session. The single concrete next step is walking it through the standard CLAUDE.md commit protocol: post the PASS COMPLETE report to #changelog, get merge approval at #approve-this, and commit. The Quick polish items (Q1–Q3 from `radial-outstanding-work.md`) are small enough to go in the same commit or a follow-on pass, but they're not blocking.
