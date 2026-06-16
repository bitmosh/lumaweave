# LumaWeave Render Optimization Proposals

Analysis of rendering and effect firing order across AppShell, SigmaGraphView, and overlay components.
Written 2026-06-03 based on code audit + state-layers.md findings.

**Companion docs:** `state-layers.md` (layer architecture), `token-sets.md` (theme token inventory)

---

## How a Single Settings Write Propagates

Tracing `setSetting("graphView.nodeSize", 14)` from slider drag to screen:

```
1. setSetting() called
   ├─ setNestedValue(): structuredClone(settings) → O(settings-size) deep copy
   ├─ Zustand notifies all subscribers
   └─ localStorage.setItem(...) → synchronous I/O (every write, no debounce)

2. AppShell re-renders (subscribes to full settings object)
   ├─ themeTokens useMemo: deps unchanged → cache hit ✅
   ├─ crossfadeTokens: unchanged ✅
   ├─ resolvedGraphTokens useMemo: deps unchanged → cache hit ✅
   ├─ activeSeedParamOverrides useMemo: unchanged ✅
   ├─ activePins useMemo: unchanged ✅
   ├─ graphNodes/graphEdges useMemos: unchanged ✅
   └─ buildGraphologyGraph() in render body: RUNS — full graph build discarded ❌

3. SigmaGraphView re-renders (arePropsEqual: nodeSize changed → false)
   └─ After render, [nodeSize] effect fires:
      ├─ Iterates all nodes, scales sizes
      └─ sigma.refresh({ skipIndexation: true })
```

**For a theme switch**, step 2 repeats ~20 times (one per rAF frame during the 300ms crossfade), each time running `buildGraphologyGraph` in the render body.

**For a tile drag**, step 2 fires + TileProvider reconcile effect runs unconditionally.

---

## SigmaGraphView — Effect Firing Map

All 21 effects in firing order (mount → steady state):

| # | Deps | What | Sigma call |
|---|---|---|---|
| 1 | `[]` (every render, no array) | Sync `resolvedTokensRef` | — |
| 2 | `[callbacks, dialectId, activePins, onUpdatePins]` | Sync callback + physics refs | — |
| 3 | `[nodeHum, nodeFlowSpeed, nodeGlow]` | Sync animation uniform refs | — |
| 4 | `[reduceMotion]` | rAF loop for per-frame uniforms | rAF (continuous) |
| 5 | `[nodes, edges]` | **Full rebuild** — 150ms debounced | `sigma.kill()` + recreation |
| 6 | `[dialectId]` | Dialect mutate (no rebuild) | `sigma.refresh()` |
| 7 | `[seedParamOverrides]` | Apply config override to gwells | — |
| 8 | `[activePins]` | Apply pin map to gwells | — |
| 9 | `[nodeSize]` | Scale all node sizes in-place | `sigma.refresh({ skipIndexation: true })` |
| 10 | `[resolvedTokens]` | Live-recolor all nodes/edges | `sigma.refresh()` |
| 11 | `[]` | Global geometry override listener | `sigma.refresh({ skipIndexation: false })` on event |
| 12 | `[pathTargetId, selectedNodeId]` | Shortest-path highlight | `sigma.refresh({ skipIndexation: true })` |
| 13 | `[]` | ResizeObserver for container | `sigma.resize()` + `sigma.refresh()` |
| 14 | `[selectedNodeId, selectedEdgeId, neighborhoodDepth, hoverNodeColor, edgeLabelFontSize, pinnedHighlightActive, activePins, resolvedTokens, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover]` | **12-dep** — full style+label policy | `sigma.refresh({ skipIndexation: true })` |
| 15 | `[hoveredNodeId, hoveredEdgeId]` | Hover delta only | `sigma.scheduleRender()` |
| 16 | `[edgeLabelFontSize]` | Update Sigma edge label size setting | `sigma.refresh({ skipIndexation: true })` |
| 17 | `[nodeLabelFontSize]` | Update Sigma node label size setting | `sigma.refresh({ skipIndexation: true })` |
| 18 | `[debugInfo, nodeSize, neighborhoodDepth, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, edgeLabelFontSize, nodeLabelFontSize, showLabelsOnHover, zoomLabelThreshold, setDebugRenderer]` | Debug renderer state sync | — |
| 19 | `[hoveredNodeId, hoveredEdgeId, activeSelectionMode, selectedNodeId, selectedEdgeId, setDebugInteraction]` | Debug interaction state sync | — |
| 20 | `[neighborhoodInfo, setDebugNeighborhood]` | Debug neighborhood sync | — |
| 21 | `[nodeNeighborhoodInfo, setDebugNodeNeighborhood]` | Debug node neighborhood sync | — |

Effects 18–21 are debug UI sync. Effects 14 and 18 have the largest dep arrays (12 and 10 items respectively) and fire most frequently on normal interaction.

---

## Proposals

### Tier 1 — Fix Now (high impact, no new deps, low risk)

---

#### P1 · Memoize the AppShell diagnostic build

**File:** `AppShell.tsx:312–331`  
**Cost:** O(nodes + edges) Graphology build on every AppShell render — including each frame of a 300ms theme crossfade (~20 redundant builds per theme switch).

```typescript
// Before: runs in render body every render
if (useFixture && adaptedFixture.nodes.length > 0) {
  const { diagnostics: fixtureDiagnostics } = buildGraphologyGraph(...);
  ...
}

// After: runs only when fixture data or nodeSize changes
const componentDiagnostics = useMemo(() => {
  if (!useFixture || adaptedFixture.nodes.length === 0) {
    return { componentCount: undefined, isolatedNodeCount: undefined, largestComponentSize: undefined };
  }
  const { diagnostics } = buildGraphologyGraph(
    adaptedFixture.nodes,
    adaptedFixture.edges,
    { nodeSize: settings.graphView.nodeSize },
  );
  return {
    componentCount: diagnostics.componentCount,
    isolatedNodeCount: diagnostics.isolatedNodeCount,
    largestComponentSize: diagnostics.largestComponentSize,
  };
}, [useFixture, adaptedFixture.nodes, adaptedFixture.edges, settings.graphView.nodeSize]);
```

**Expected gain:** Eliminates ~20 full graph builds per theme switch, and 1 build per any other settings write. For the self-graph fixture (130+ nodes, 200+ edges) this is meaningful CPU savings.

---

#### P2 · Debounce localStorage writes in the settings store

**File:** `settings.store.ts` (the `subscribe` block)  
**Cost:** Synchronous localStorage I/O on every `setSetting()` call. At 60Hz slider drag: 60 writes/second.

```typescript
// Before
useSettingsStore.subscribe((state) => {
  localStorage.setItem("lumaweave-settings", JSON.stringify(state.settings));
});

// After
let _persistTimer: ReturnType<typeof setTimeout> | null = null;
useSettingsStore.subscribe((state) => {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => {
    localStorage.setItem("lumaweave-settings", JSON.stringify(state.settings));
  }, 500);
});
```

**Expected gain:** localStorage writes drop from 60/second to 1 per 500ms during drag. No behavioral change — settings persist within 500ms of last write. Zero risk of data loss: this is already best-effort (browser close would lose in-flight writes, same as before).

---

#### P3 · Convert SolarBackdrop from setInterval+state to rAF+ref

**File:** `src/graph/overlay/SolarBackdrop.tsx`  
**Cost:** `setInterval` at 16ms calling `setTime(t => t + 0.016)` — this triggers a React state update → re-render at 60fps, every frame, always (even at rest). SolarBackdrop is re-rendering ~3600 times per minute.

```typescript
// Before
const [time, setTime] = useState(0);
useEffect(() => {
  const id = setInterval(() => setTime(t => t + 0.016), 16);
  return () => clearInterval(id);
}, [backdropMotion, reduceMotion]);

// After — write CSS var directly, skip React state
const containerRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (reduceMotion || backdropMotion === "off") return;
  let running = true;
  const start = performance.now();
  const tick = (now: number) => {
    if (!running || !containerRef.current) return;
    containerRef.current.style.setProperty("--sb-time", String((now - start) * 0.001));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => { running = false; };
}, [backdropMotion, reduceMotion]);
```

The `time` value currently drives a `backgroundImage` style with trig functions. Replace those style expressions with CSS `@keyframes` or a CSS custom property read from `--sb-time`.

**Expected gain:** SolarBackdrop goes from re-rendering 60x/sec to rendering once on mount. All animation stays on the GPU via CSS. The rest of the app is also less noisy — 60 fewer React renders/sec eliminated.

---

#### P4 · Guard TileProvider reconcile effect

**File:** `src/control-plane/panels/TileProvider.tsx:145–156`  
**Cost:** Runs on every TileProvider render with no guard, checking all registry entries for missing default-visible tiles. Fires on every tile drag (which writes tile layout → store update → TileProvider re-render).

```typescript
// Before — runs unconditionally
useEffect(() => {
  const missing = tileSectionRegistry.getAll().filter(entry =>
    entry.defaultVisible && !tiles.has(entry.id)
  );
  // ... reconcile missing tiles
});

// After — gate on tile count changing
const tileCount = tiles.size;
useEffect(() => {
  const missing = tileSectionRegistry.getAll().filter(entry =>
    entry.defaultVisible && !tiles.has(entry.id)
  );
  // ... reconcile missing tiles
}, [tileCount]); // Only check when tile count changes (new tile added/removed)
```

**Expected gain:** Reconcile runs only when the number of tiles changes, not on every drag-event re-render.

---

### Tier 2 — Medium Term (real benefit, some refactor)

---

#### P5 · Narrow AppShell's settings store subscription

**File:** `AppShell.tsx:55`  
**Cost:** `useSettingsStore((s) => s.settings)` subscribes to the entire settings object. Every write to any section (physics pins during drag, UI state on panel toggle) re-renders AppShell and runs all its render-body logic.

```typescript
// Before — one fat subscription
const settings = useSettingsStore((state) => state.settings);

// After — section-level subscriptions
const appearance  = useSettingsStore(s => s.settings.appearance);
const graphView   = useSettingsStore(s => s.settings.graphView);
const labels      = useSettingsStore(s => s.settings.labels);
const physics     = useSettingsStore(s => s.settings.physics);
const performance = useSettingsStore(s => s.settings.performance);
const uiSettings  = useSettingsStore(s => s.settings.ui);
```

This requires threading the decomposed sections through the existing call sites. Since Zustand uses shallow equality by default per selector, each section only re-renders AppShell when that specific section object changes — physics-pin updates during gwells drag no longer re-render AppShell at all.

**Expected gain:** Eliminates the majority of spurious AppShell re-renders. Combines with P1 to prevent diagnostic builds during unrelated writes (physics, UI).

**Risk:** This is the largest refactor in this list. Do it last among Tier 2 — the gains from P1–P4 should be validated first.

---

#### P6 · Split the 12-dep selection effect

**File:** `SigmaGraphView.tsx:976`  
**Cost:** A single effect handles selection state, label policy, style policy, and neighborhood computation. Whenever any of 12 deps change, all three policy functions run + `sigma.refresh()`. Specifically, `resolvedTokens` is in this dep array — every theme change triggers the full selection+label+style cycle in addition to the dedicated `[resolvedTokens]` live-recolor effect.

```typescript
// Current: one effect, all concerns
useEffect(() => {
  applyGraphStylePolicy(graph, interactionState, styleOptions, tokens);
  applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
  applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);
  sigma.refresh({ skipIndexation: true });
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoverNodeColor,
    edgeLabelFontSize, pinnedHighlightActive, activePins, resolvedTokens,
    nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover]);

// Proposed: separate selection/style from label policy
useEffect(() => {
  // Style policy — cares about selection state + colors
  applyGraphStylePolicy(graph, interactionState, styleOptions, tokens);
  sigma.refresh({ skipIndexation: true });
}, [selectedNodeId, selectedEdgeId, neighborhoodDepth, hoverNodeColor,
    pinnedHighlightActive, activePins, resolvedTokens]);

useEffect(() => {
  // Label policy — cares about mode + selection (for neighborhood labels)
  applyNodeLabelPolicy(graph, selectionContext, labelOptions, nodeLabelMode);
  applyEdgeLabelPolicy(graph, selectionContext, labelOptions, edgeLabelMode);
  sigma.refresh({ skipIndexation: true });
}, [selectedNodeId, nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover]);
```

**Expected gain:** Changing `nodeLabelMode` no longer triggers `applyGraphStylePolicy`. Changing `resolvedTokens` (theme) no longer triggers label policy re-application. Two `sigma.refresh()` calls in the same React flush is fine — Sigma batches them.

**Risk:** Must verify policy functions don't have cross-concerns (style policy reading label state or vice versa). Both policies read the same `interactionState` — ensure they reconstruct it consistently.

---

#### P7 · DOM-direct crossfade (bypass React re-renders)

**File:** `src/themes/themeCrossfade.ts`  
**Cost:** `useCrossfadeAppTokens` calls `setActiveTokens()` each rAF frame during a 300ms crossfade → AppShell re-renders ~20 times per theme switch (once per interpolated frame). Each re-render runs all of AppShell's memo lookups plus the diagnostic build (until P1 lands).

```typescript
// Current: returns interpolated tokens (causes AppShell re-render each frame)
export function useCrossfadeAppTokens(targetTokens, reduceMotion) {
  const [activeTokens, setActiveTokens] = useState(targetTokens);
  useEffect(() => {
    // rAF loop calls setActiveTokens(interpolated) each frame
  }, [targetTokens, reduceMotion]);
  return activeTokens;
}

// Proposed: write CSS vars directly, return target tokens (stable ref)
export function useCrossfadeAppTokens(
  mainRef: RefObject<HTMLElement>,
  targetTokens: ThemeRuntimeTokens,
  reduceMotion: boolean
): void {
  useEffect(() => {
    // rAF loop writes to mainRef.current.style.setProperty() each frame
    // No React state — AppShell never re-renders during crossfade
  }, [targetTokens, reduceMotion]);
}
// AppShell: remove crossfadeTokens usage; keep CSS vars set once on theme switch,
// let the effect animate them directly on the DOM element.
```

**Expected gain:** Theme switches go from 20 AppShell re-renders to 1. Crossfade animation stays at full quality.

**Risk:** Breaks the React data-flow model — CSS vars are written imperatively. Must ensure cleanup is thorough on unmount/fast theme switch. Also requires changing AppShell's `style` prop to read final token values (not crossfaded values) and letting the DOM effect handle the transition.

---

### Tier 3 — Architectural (larger changes, discuss first)

---

#### P8 · Coalesce rapid settings writes at store level

**File:** `settings.store.ts` — the `setSetting` action  
**Cost:** Each `setSetting` call does `structuredClone(settings)` — a full deep copy of the ~2–3KB settings object. At 60Hz slider drag: 60 clones/second.

Option A: Swap `structuredClone` for a path-aware shallow clone (only clone the changed subtree). No new dependencies:
```typescript
// Instead of structuredClone the whole tree:
const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  const result = { ...obj };  // shallow clone root
  let cur = result;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...cur[keys[i]] };  // shallow clone each level
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return result;
};
```
This makes each `setSetting` O(path-depth) clones instead of O(settings-size). Risk: any code that does `settings === prevSettings` reference checks would still work since the root is always a new object.

Option B: Immer (requires package approval per CLAUDE.md safeguard). Would achieve the same with less custom code.

---

#### P9 · Debounce the debug sync effects

**File:** `SigmaGraphView.tsx:1127–1167`  
**Cost:** Four debug effects with 10-item dep arrays between them fire on every interaction (hover, select, resize). They push diagnostic snapshots to `useDebugStore`. This is low priority since the debug store likely doesn't affect rendering outside of a debug panel.

These could be wrapped with `requestIdleCallback` or a 50ms debounce so they don't compete with interaction-critical effects:
```typescript
useEffect(() => {
  const id = requestIdleCallback(() => {
    setDebugRenderer({ ... });
  });
  return () => cancelIdleCallback(id);
}, [debugInfo, nodeSize, ...]);
```

This ensures debug updates happen during idle time rather than synchronously after every user interaction.

---

## Recommended Sequence

| Phase | Proposals | Why This Order |
|---|---|---|
| 1 | P1 (diagnostic memo), P2 (localStorage debounce) | Safest wins; no behavioral change |
| 2 | P3 (SolarBackdrop rAF) | Eliminates the biggest continuous render source |
| 3 | P4 (TileProvider reconcile guard) | Small, targeted |
| 4 | P6 (split 12-dep effect) | Verify no cross-policy concerns first |
| 5 | P5 (narrow AppShell subscription) | Validate P1–P4 gains before refactoring subscription |
| 6 | P7 (DOM-direct crossfade) | Architectural; want earlier gains confirmed first |
| 7 | P8 (shallow clone), P9 (debug idle) | Once other gains are in, measure if still needed |

---

## What This Does NOT Change

- `arePropsEqual` custom comparator — already correct; callbacks excluded intentionally (synced to refs)
- `[nodes, edges]` dep array — already isolated; no spurious rebuild in steady state (confirmed by code audit)
- Live-recolor `[resolvedTokens]` effect — intentional; `sigma.refresh()` on theme change is the correct behavior
- Typography tile using local state — correct; no path into `resolvedTokens` or graph data

These were candidates from the initial state analysis and are confirmed non-issues. No changes needed.
