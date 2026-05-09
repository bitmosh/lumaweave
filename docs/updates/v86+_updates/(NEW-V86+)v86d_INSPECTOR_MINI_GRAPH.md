# Phase Packet: v86d Inspector Mini-Graph

## A. Phase Mission

Replace the design's flat radial menu with a **second-instance LumaWeave graph** mounted as an inspector overlay. The inspector mini-graph has its own physics, gravity, and selection. A root node anchors to the clicked target; child spoke nodes branch off as a small, alive, customizable graph. Four spokes ship in v86d (Color, Apply, IDE, History); the rest become spoke registry entries in v89.

This sub-arc also ships **scoped overrides** as a prerequisite (extends `themeOverrideStorage` with `target` scope; foundation laid in v86a).

## B. Scope Boundaries

### Allowed

- `themeOverrideStorage.ts` — `target` scope writes/reads (foundation in v86a; runtime in v86d)
- `ThemeTargetInspectorOverlay.tsx` — extend with Alt+Shift+click handler (keep Alt+Shift+I toggle behavior intact)
- New files in `/src/control-plane/inspector/`:
  - `InspectorMiniGraph.tsx`
  - `inspectorSpokeRegistry.ts` (foundation in v86a; populate spokes here)
  - `MiniGraphRenderer.tsx` — SVG-based render of root + spoke nodes (Approach B)
  - `SpokeNode.ts` — node definition contract
  - `RootNode.ts` — root anchor node spec
  - `tabs/ColorTab.tsx`
  - `tabs/ApplyTab.tsx`
  - `tabs/IdeTab.tsx`
  - `tabs/HistoryTab.tsx`
- `themeTargetHeuristics.ts` — already exposes `runAndRecordThemeTargetProbe`; consume it for Apply tab
- `selectionNeighborhood.ts` — leveraged for cluster selection; no changes
- `graphStylePolicy.ts` — verify dimMode integration with radial menu opening (depends on v86b)

### Forbidden

- Tile system changes → v86c
- Visual treatment changes (sphere uniforms, backdrop, etc.) → v86b
- TopBar / footer / dock changes → v86e
- Geometry / Type / Motion / Layout / Code spokes → v89
- Camera auto-frame to selected cluster → v89 (v86d preserves camera state)
- Live code editing in Code tab → v98
- Time-scrubbing history → v99
- `target-kind` and `cluster` scope writes → schema accepts them (v86a), but no UI to set them in v86d

## C. Architecture Map

```
Layer 1 — Skeleton
  inspectorSpokeRegistry.ts (foundation in v86a; entries here)
  SpokeNode.ts
  RootNode.ts
  
Layer 2 — Organs
  themeOverrideStorage.ts target-scope runtime
  
Layer 3 — Muscles
  MiniGraphRenderer.tsx     SVG root + spokes; physics tick (gravity + repulsion)
  InspectorMiniGraph.tsx    Container, anchors mini-graph to target
  
Layer 4 — Nerves
  ThemeTargetInspectorOverlay.tsx  Alt+Shift+click → inspector:open event
  
Layer 5 — Armor
  tabs/ColorTab.tsx         Eyedropper + 8-swatch history + scope picker
  tabs/ApplyTab.tsx         Ranked candidates from heuristics
  tabs/IdeTab.tsx           File path display + open-in-IDE dispatch
  tabs/HistoryTab.tsx       Per-target override history list
  
Layer 6 — Paint
  Reads inspector.radial.* tokens from v86a
```

## D. Non-Negotiable Contracts

The seven v86 long-term contracts apply. Plus these v86d-specific:

1. **Mini-graph runs in screen-space coordinates, not graph-space.** Fixed pixel size regardless of main graph zoom or rotation. Its own SVG element, not a second Sigma instance (Approach B; see Appendix B).
2. **Camera state of main graph is preserved.** When the mini-graph opens, do not pan, zoom, or rotate the main camera. Auto-frame-to-selected-cluster is logged for v89.
3. **Mini-graph activates dim mode on the main graph.** Opening the mini-graph asserts `graphStylePolicy.dimMode = "outside-cluster"` if not already set. Closing reverts to the previous dimMode value. (Depends on v86b's dimming feature.)
4. **Spokes are a registry, not hardcoded.** `inspectorSpokeRegistry` populates 4 entries in v86d. Adding a spoke is a one-line `register(entry)` call. v89 adds the remaining 5.
5. **Override resolution honors specificity.** `target` scope wins over `global` for the same path on the same target. `themeOverrideStorage.resolveForTarget(tokenPath, targetId)` returns the most specific applicable override.
6. **Apply-to-similar uses `themeTargetHeuristics`.** Ranked candidates come from `runAndRecordThemeTargetProbe()`'s `candidates` array, sorted by `signals.length` descending. No new heuristic engine.
7. **Eyedropper uses native `window.EyeDropper` where available.** Fallback: clicking visible elements and reading `getComputedStyle`. Document fallback in code comments.
8. **Trigger fusion with existing overlay.** Alt+Shift+I keeps its toggle behavior (discovery layer). Alt+Shift+click on any registered target dispatches `inspector:open` regardless of discovery layer state. Both can coexist.

## E. Dependency Order

```txt
1. Skeleton:
   - SpokeNode.ts, RootNode.ts (types)
   - inspectorSpokeRegistry.ts entries

2. Organs:
   - themeOverrideStorage.ts target-scope runtime (resolveForTarget, setTargetOverride, etc.)
   - Inspector spoke entries register

3. Muscles:
   - MiniGraphRenderer.tsx (SVG root + spokes; physics tick)
   - InspectorMiniGraph.tsx (mounts MiniGraphRenderer, listens for inspector:open)

4. Nerves:
   - ThemeTargetInspectorOverlay.tsx Alt+Shift+click handler
   - dispatch inspector:open with target descriptor
   - InspectorMiniGraph subscribes
   
5. Armor (tab content):
   - ColorTab.tsx (most complex — eyedropper, palette, recent swatches, scope picker)
   - ApplyTab.tsx (heuristics consumer)
   - IdeTab.tsx (dispatch open-in-ide event)
   - HistoryTab.tsx (read scoped overrides for target)

6. Paint:
   - Connect to inspector.radial.* tokens

7. Validation:
   - Alt+Shift+click summons mini-graph
   - 4 spoke nodes visible around root
   - Click Color spoke → expands child nodes (palette, eyedropper, recent)
   - Click a palette node → applies color, persists
   - Reload → color persists
   - Apply-to-similar shows ranked candidates
   - Open in IDE dispatches event
   - History tab shows past overrides for this target
```

## F. Current Permissions

Bandit may patch the Allowed list. Bandit may inspect the entire codebase. Bandit may NOT touch SigmaGraphView's main rendering, NodeSphereProgram, the tile system, or panel layout.

## G. Later-Phase Items

- Geometry, Type, Motion, Layout, Code, History-deep spokes → v89, v98, v99
- `target-kind` and `cluster` scope runtime + UI → v89
- Camera auto-frame to selected cluster (75% of frame) → v89
- Mini-graph upgrade to second Sigma instance (Approach A) once geometry presets land → v90
- Theme branching with versioned history → v99

## H. Known Failure Modes

1. **Mini-graph anchoring drifts.** The root node's screen position must follow the target element if the layout reflows (window resize, panel collapse, etc.). Subscribe to ResizeObserver on the target element and update root position.
2. **Spoke registry → mini-graph nodes mismatch.** The mini-graph constructs its node list from `inspectorSpokeRegistry.list()`. A spoke registered after the mini-graph mounted won't appear unless the registry has change subscribers. Add the subscriber pattern to the registry contract.
3. **Eyedropper API not supported in some browsers.** Chrome/Edge ship `window.EyeDropper`. Firefox does not. Detect and fall back to "click an element on screen" mode that reads `getComputedStyle`.
4. **Override persistence not reapplying on reload.** `themeOverrideStorage` writes to localStorage; the override applicator must run on app mount. Verify by setting an override, reloading, and checking the targeted element's computed color.
5. **Apply-to-similar shows the original target as a candidate.** Filter the candidates: exclude the current target itself.
6. **History tab is empty.** History reads scoped overrides for the current target. If the user hasn't made any changes yet, it should show an empty state, not crash.
7. **Spoke children lazy-load incorrectly.** Each spoke's tab is mounted only when the spoke is clicked. Don't mount all four tabs eagerly — that wastes memory and runs heuristics needlessly.
8. **Mini-graph breaks dim mode toggle on close.** When the inspector closes, restore the previous `dimMode` value. If the user had `dimMode = "off"` before opening, it should return to off.
9. **Mini-graph blocks main graph interaction.** The mini-graph wrapper element must capture pointer events only on its bounds. Use a small bounding rect (e.g. 320×320 px around the target) and `pointer-events: auto` only inside; outside the bounds, `pointer-events: none`.

## I. Troubleshooting Playbooks

### Mini-graph doesn't appear on Alt+Shift+click

1. Check the `inspector:open` event is being dispatched (DevTools console).
2. Check `InspectorMiniGraph` is mounted (it should always be in the tree, hidden until target set).
3. Check the listener on `inspector:open` is registered (use `getEventListeners` in DevTools).
4. Check the target element has `data-lw-theme-target` — if not, the click is ignored.

### Color override doesn't persist

1. Check `themeOverrideStorage.setTargetOverride(...)` is called in ColorTab.
2. Check localStorage for `lumaweave-theme-overrides` key.
3. Check the override has the right `scope: { kind: "target", targetId }` shape.
4. On reload, check the override applicator runs and writes the value to the target's CSS variable.

### Apply-to-similar list is empty

1. `themeTargetHeuristics.runAndRecordThemeTargetProbe()` returns candidates; log the count.
2. Filter out the current target from the candidate list.
3. Verify candidates have `signals.length >= MIN_SIGNALS_REQUIRED` (= 3).

### Eyedropper picks the wrong color

1. If using `window.EyeDropper`, the result is a hex string — use directly.
2. If fallback (click-element mode), use `getComputedStyle(el).getPropertyValue("--lw-...")` to read the resolved value.
3. The value applied via override storage must match the eyedropper's read.

## J. Validation Ladder

```bash
npm run typecheck                              # zero errors
npm run qa:e2e                                 # all tests green
node scripts/validate-system-index.mjs         # system index sound
```

New tests required:

- `inspector-mini-graph.spec.ts` — Alt+Shift+click summons mini-graph; 4 spokes visible.
- `scoped-overrides-runtime.spec.ts` — set target override; resolveForTarget returns target value, not global; remove target override; resolves to global.
- `color-tab.spec.ts` — palette click writes override; reload persists; eyedropper API integration.
- `apply-tab.spec.ts` — candidate ranking; clicking a candidate applies the same override to it.
- `ide-tab.spec.ts` — dispatch `inspector:open-in-ide` event with correct target descriptor.
- `history-tab.spec.ts` — past overrides for target listed; empty state when none.
- `dim-mode-toggle-on-inspector.spec.ts` — opening inspector activates dim mode; closing restores previous.

Manual QA:

1. App loads. Theme: Solar Plasma.
2. Alt+Shift+click on the topbar → mini-graph appears anchored to topbar.
3. 4 spoke nodes around root (Color, Apply, IDE, History).
4. Click Color spoke → expands palette + eyedropper + recent swatches as further child nodes.
5. Click a palette node → topbar background changes immediately.
6. Reload → topbar background still changed.
7. Click Apply spoke → list of similar targets ranked by signal count.
8. Click a similar target → same override applied to it.
9. Click IDE spoke → file path displayed; click "Open" → event dispatches (verify via console).
10. Click History spoke → list of past edits to topbar; clicking an entry restores that value.
11. Press Esc → mini-graph closes; dim mode restores to previous.

## K. Research / Tool Policy

- EyeDropper API: MDN docs. `await new EyeDropper().open()` returns `{ sRGBHex }`. Test in Chrome.
- Custom events: standard `CustomEvent` API. Use `window.dispatchEvent(new CustomEvent("inspector:open", { detail }))`.
- React Context for inspector spoke registry subscriber pattern: standard.

## L. Output Requirements

Final report must include:

1. Number of spoke registry entries (expected: 4).
2. Confirmed Approach B (SVG-based) chosen for v86d; Approach A (second Sigma instance) deferred to v90.
3. EyeDropper API fallback path implemented.
4. Override conflict resolution test passing (target wins over global).
5. Apply-to-similar candidate count for a known target (should match heuristic probe output).
6. History tab integration with override storage's per-target read confirmed.
7. Dim mode integration verified with v86b output.

---

## Appendix A — Scoped Overrides Runtime

```typescript
// themeOverrideStorage.ts extension (v86a foundation, v86d runtime)

export interface ScopedThemeOverride extends ThemeOverride {
  scope: {
    kind: "global" | "target" | "target-kind" | "cluster";
    targetId?: string;        // for "target"
    targetKind?: string;      // for "target-kind" — v89
    clusterAnchor?: string;   // for "cluster" — v89
  };
}

// v86d implements:
export function setTargetOverride(targetId: string, tokenPath: ThemeTokenPath, value: ThemeTokenValue): void { /* */ }
export function getTargetOverride(targetId: string, tokenPath: ThemeTokenPath): ThemeTokenValue | undefined { /* */ }
export function removeTargetOverride(targetId: string, tokenPath: ThemeTokenPath): void { /* */ }
export function getTargetOverrides(targetId: string): ScopedThemeOverride[] { /* */ }

export function resolveForTarget(
  tokenPath: ThemeTokenPath,
  targetId: string,
  targetKind?: string,
  clusterAnchor?: string,
): ThemeTokenValue | undefined {
  // priority: target > target-kind > cluster > global
  const target = overrides.find(o => o.scope.kind === "target" && o.scope.targetId === targetId && o.tokenPath === tokenPath);
  if (target) return target.value;
  
  if (targetKind) {
    const tk = overrides.find(o => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind && o.tokenPath === tokenPath);
    if (tk) return tk.value;
  }
  
  if (clusterAnchor) {
    const cl = overrides.find(o => o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor && o.tokenPath === tokenPath);
    if (cl) return cl.value;
  }
  
  const global = overrides.find(o => o.scope.kind === "global" && o.tokenPath === tokenPath);
  if (global) return global.value;
  
  return undefined;
}
```

## Appendix B — Mini-Graph Mounting Strategy

Two approaches considered; v86d picks one in implementation:

**Approach A: Second Sigma instance.**
- Pros: reuses Sigma's WebGL renderer, label policy, selection state. Future spoke types get geometry presets for free (v90).
- Cons: two `<canvas>` elements on the same page; pointer event isolation requires care.

**Approach B: SVG fallback.**
- Pros: simpler isolation; mini-graph nodes are real SVG elements, easy to style.
- Cons: doesn't reuse the main graph's visual treatment; spokes won't share node geometry presets.

**Decision: Approach B for v86d's MVP.** SVG nodes are sufficient for 4 spokes. v89 may upgrade to Approach A when geometry presets land and the cost of the upgrade is justified.

```typescript
// MiniGraphRenderer.tsx — Approach B (SVG-based)
function MiniGraphRenderer({ rootNode, spokeNodes, anchor, onSpokeClick }) {
  const physics = usePhysicsTick(rootNode, spokeNodes);  // gravity + repulsion
  
  return (
    <svg className="inspector-mini-graph"
         style={{
           position: "fixed",
           left: anchor.x - 160, top: anchor.y - 160,
           width: 320, height: 320,
           zIndex: 80,
           pointerEvents: "none",
         }}>
      <g style={{ pointerEvents: "auto" }}>
        {/* root */}
        <circle cx={160} cy={160} r={20} fill={rootNode.color} />
        
        {/* spokes — physics simulation positions */}
        {physics.spokes.map((spoke, i) => (
          <g key={spoke.id} onClick={() => onSpokeClick(spoke.id)}>
            <line x1={160} y1={160} x2={spoke.x} y2={spoke.y} stroke={spoke.color} strokeOpacity="0.6" />
            <circle cx={spoke.x} cy={spoke.y} r={14} fill={spoke.color} />
            <text x={spoke.x} y={spoke.y + 4} textAnchor="middle" fontSize="10" fill={spoke.textColor}>
              {spoke.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
```

The "alive" feeling comes from a physics tick: spokes have damped attraction to their target angles, plus mutual repulsion. Implement as `requestAnimationFrame` loop updating spoke positions, ~30 lines. Stops when delta < 0.5 px.

## Appendix C — Inspector Spoke Registry

```typescript
// inspectorSpokeRegistry.ts
export interface SpokeEntry {
  id: string;
  label: string;
  icon?: string;
  color?: string;                // defaults to inspector.radial.spokeColor token
  parentSpokeId?: string;        // null for root spokes; non-null for child spokes
  order: number;                 // angular position
  action?: () => void;           // for terminal spokes (e.g. "Open in IDE")
  tabContent?: () => ReactNode;  // for spokes that open a tab
}

export interface InspectorSpokeRegistry {
  list(): SpokeEntry[];
  listChildren(parentSpokeId: string): SpokeEntry[];
  getById(id: string): SpokeEntry | undefined;
  register(entry: SpokeEntry): void;
  // change subscribers — for live mini-graph updates
  subscribe(listener: (entries: SpokeEntry[]) => void): () => void;
}

// v86d initial registration
register({ id: "color",   label: "Color",        order: 0, tabContent: () => <ColorTab/> });
register({ id: "apply",   label: "Apply to…",    order: 1, tabContent: () => <ApplyTab/> });
register({ id: "ide",     label: "Open in IDE",  order: 2, action: () => dispatchOpenInIde() });
register({ id: "history", label: "History",      order: 3, tabContent: () => <HistoryTab/> });

// v89 additions:
// register({ id: "geometry", ... });
// register({ id: "type", ... });
// register({ id: "motion", ... });
// register({ id: "layout", ... });
// register({ id: "code", ... });
```

## Appendix D — Tab Specifications

### ColorTab

- Eyedropper button (uses `window.EyeDropper` if available)
- 8-swatch recent history (read from localStorage `ins-recent-colors`)
- 12-color palette (theme-derived from current Tier 1 primitives)
- Scope picker (this/kind/cluster/global) — only `this` (target) and `global` actionable in v86d
- On color pick: `setTargetOverride(targetId, tokenPath, value)` (or global variant)
- Live preview on hover (apply override, restore on leave if not committed)

### ApplyTab

- Reads `themeTargetHeuristics.runAndRecordThemeTargetProbe()`
- Filters out current target
- Sorts by `signals.length` desc, then by signal-type priority
- Each candidate: card with descriptor, signal count, "Apply" button
- Apply button: copies all current target's overrides to the candidate's targetId
- "Apply to all" button: same for entire candidate list

### IdeTab

- Reads target's `themeTargetRegistry` entry
- Shows file path (currently not stored — v86d adds optional `sourceFile?: string` to `ThemeTargetContract`)
- "Open in editor" button dispatches `inspector:open-in-ide` event
- Tauri side handles file open (separate concern, v96)

### HistoryTab

- Calls `getTargetOverrides(targetId)` for each token path
- Lists chronologically (newest first)
- Each entry: token path, value, timestamp, "Restore" button
- "Restore" button: `setTargetOverride(targetId, tokenPath, value)` with the historical value
- Empty state: "No edits yet for this target"

## Appendix E — Override Resolution at Render Time

Every component that consumes a theme token must resolve via the new `resolveForTarget` path if it has a target id, else fall back to global resolution.

```typescript
// usage example in a component
function TopBar() {
  const themeTargetId = "topbar.root";
  const tokenPath = "panel.background";
  
  // resolved value (target override > global override > theme default)
  const bg = resolveForTarget(tokenPath, themeTargetId)
          ?? resolveGlobal(tokenPath)
          ?? themeTokens[currentTheme].panelBackground;
  
  return <header style={{ backgroundColor: bg }} data-lw-theme-target={themeTargetId}>...</header>;
}
```

For v86d, this resolution is wired into a single React hook `useResolvedToken(tokenPath, targetId?)`. All consumers go through the hook.

---

*See `v86a_FOUNDATION.md` for `themeOverrideStorage` foundation. See `v86b_VISUAL_TREATMENT.md` for `dimMode` interaction. Spokes Geometry/Type/Motion/Layout/Code defer to v89.*
