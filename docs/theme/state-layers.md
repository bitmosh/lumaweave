# LumaWeave Theme State Layers

Reference map of every state and rendering layer that participates in theming, token resolution, and graph rendering. Use this to reason about what propagates where, what is isolated, and what causes re-renders.

**Written:** 2026-06-02 · **Updated:** 2026-06-03 (candidates verified against code)
**Relevant to:** theme settings, typography tile, graph re-render issue

---

## Layer Map (outermost → innermost)

```
[L0] CSS Custom Properties  ←─ static stylesheet, set once on app.shell style prop
[L1] Primitive Tokens       ←─ tokenPrimitives.ts (per-theme color/spacing palettes)
[L2] Semantic Tokens        ←─ tokenSemantics.ts (roles that ref L1 values)
[L3] Component Tokens       ←─ tokenComponents.ts (component-scoped bindings)
[L4] Runtime Tokens         ←─ themeTokens.ts (fully resolved, flat per-theme object)
[L5] Settings Store         ←─ Zustand (useSettingsStore) — persisted app-wide state
[L6] AppShell               ←─ subscribes to full settings; memoizes derived values
[L7] ThemeTarget Overrides  ←─ themeOverrideStorage / lw:override-change events
[L8] SigmaGraphView         ←─ memo'd component; selective effects per concern
[L9] Graph Rebuild Effect   ←─ [nodes, edges] only — full Sigma kill+recreate
```

---

## Layer Details

### L0 — CSS Custom Properties

**Where:** `src/styles/lumaweave-visual-handles.css`, `src/App.css`, and the `style` prop on `<main>` in `AppShell`.

**What:** The `--lw-*` CSS variables consumed by all components. Some are set by AppShell's `style` prop (reactive, crossfades on theme switch). Others are hardcoded in the stylesheet and not tied to the runtime token system.

**Who sets them:**
- `AppShell` `<main style={...}>` sets: `--lw-app-background`, `--lw-panel-background`, `--lw-panel-border`, `--lw-text-primary`, `--lw-text-muted`, `--lw-accent`, `--lw-visual-accent`, `--lw-app-glow`, `--lw-inspector-radial-*`, `--lw-color-*` (Tier 1 primitives)
- `lumaweave-visual-handles.css` sets: all `--lw-visual-*` vars — hardcoded, **not reactive to theme changes**. Visual handle components (overlays, badges, buttons) read these directly.

**Isolation:** CSS vars propagate down the DOM tree. Changing a var on `<main>` affects every descendant. Changing a var in the stylesheet affects the scope it's declared in (usually `:root`).

---

### L1–L3 — Token Tier System

**Where:** `src/themes/tokenPrimitives.ts`, `tokenSemantics.ts`, `tokenComponents.ts`

**What:** Design-time static structures. Not reactive at runtime — they're imported as constants. Changes here require a rebuild.

- **L1 Primitives:** Raw color palettes per theme (void, gold, flare, magenta, etc.), spacing scale, radius, shadow, motion duration/easing.
- **L2 Semantics:** Named roles referencing L1 values via `{token.ref}` syntax. `text.primary → color.cream.100`, etc.
- **L3 Components:** Component-scoped bindings. `topbar.background`, `tile.border`, etc.

**These tiers do NOT directly drive runtime rendering.** They are the authoring layer. The resolved outputs land in L4.

---

### L4 — Runtime Tokens (`ThemeRuntimeTokens`)

**Where:** `src/themes/themeTokens.ts`, interface in `src/themes/theme.types.ts`

**What:** A fully resolved flat object per theme — one for each of the 6 presets. `getThemeRuntimeTokens(themeId)` returns the object for a given theme.

**Shape** (full — includes unmapped fields, see token-sets.md):
```
app.{ background, panelBackground, panelBorder, textPrimary, textMuted, accent, glow }
graph.{ nodeDefault, nodeHover, nodeSelected, nodeSecondary, nodeTertiary,
        edgeDefault, edgeHover, edgeSelected, edgeSecondary, edgeTertiary,
        nodeLabel, nodeLabelHover, edgeLabel, edgeLabelHover,
        nodeColorScale[], edgeColorScale[] }
effects.{ glitterEnabled, starfieldEnabled, glowIntensity }
backdrop.{ coronaColor, coronaIntensity, flareColor, starfieldDensity, vignetteIntensity }
node.{ sphereHumDuration, sphereFlowDuration, sphereGlowStrength, geometryPreset? }
edge.{ stylePreset, plasmaFlowSpeed }
selection.{ haloColor, haloMaxRadiusRatio, glitterDensityScale, dimOpacity }
bookmark.{ alertColor, pinnedColor, refColor }
panel.{ blurAmount, tileHandleColor, tileGroupOutlineColor }
inspector.{ radialSpokeColor, radialHaloColor }
typography.{ fontDisplay, fontBody, fontMono }
```

**Note:** `typography.*` fields exist in the runtime object and are in the canonical path system (`typography.font.*`), but as of this writing nothing reads them from the runtime object to apply them to CSS — the fonts are loaded statically via `@font-face` and the CSS vars are set once in `App.css`. The typography fields in the runtime token are populated in all 6 themes but are effectively inert until a consumer is wired up.

---

### L5 — Settings Store (Zustand)

**Where:** `src/control-plane/settings/settings.store.ts`

**What:** The single persisted app-wide state store. Schema version 88 as of the time of writing. Organized into sections:

| Section | Contents | Theme-relevant? |
|---|---|---|
| `appearance` | `theme`, `reduceMotion`, `animationDensity`, `edgePlasmaMode`, `backdropMotion`, `motionScale`, `drama`, `nodeHum`, `nodeFlowSpeed`, `nodeGlow`, `starfieldEnabled` | **Yes — primary** |
| `graphView` | `nodeSize`, `hoverNodeColor`, `neighborhoodDepth` | Yes — affects graph rendering |
| `labels` | `nodeLabelMode`, `edgeLabelMode`, `nodeLabelFontSize`, `edgeLabelFontSize`, `maxEdgeLabelLength`, `showLabelsOnHover`, `zoomLabelThreshold` | Yes — label display |
| `physics` | `dialectId`, `seedParamOverrides`, `pins`, `pinnedHighlightActive` | No — layout only |
| `performance` | `qualityPreset` | Indirect (drives appearance sync) |
| `ui` | panel open/close, left panel toggle | No |
| `dataSources` | source paths/config | **Graph rebuild trigger** |

**Critical note:** AppShell subscribes to the entire `settings` object:
```typescript
// AppShell.tsx:55
const settings = useSettingsStore((state) => state.settings);
```
This means **any change to any settings section causes AppShell to re-render**, including UI state, physics pins, and data source paths. AppShell memoizes downstream derivations to prevent cascading, but the component itself re-renders on every write.

---

### L6 — AppShell Derivations

**Where:** `src/app/AppShell.tsx`

**What:** AppShell is the root component. It subscribes to settings (L5) and derives the values passed down to all children. Key derivations:

```typescript
// Memoized on settings.appearance.theme only — stable across unrelated settings changes
const themeTokens = useMemo(
  () => getThemeRuntimeTokens(settings.appearance.theme),
  [settings.appearance.theme]
);

// v87.4: Crossfades colors over 300ms on theme switch
const crossfadeTokens = useCrossfadeAppTokens(themeTokens, settings.appearance.reduceMotion);

// Memoized on themeTokens + hoverNodeColor — stable across other settings changes
const resolvedGraphTokens = useMemo(
  () => resolveGraphVisualTokens(themeTokens.graph, { hoverNodeColor: settings.graphView.hoverNodeColor }),
  [themeTokens, settings.graphView.hoverNodeColor]
);

// Graph data — memoized on fixture/source data refs only
const graphNodes = useMemo(
  () => (useFixture ? adaptedFixture.nodes : summary.normalizedNodes),
  [useFixture, adaptedFixture.nodes, summary.normalizedNodes],
);
const graphEdges = useMemo(
  () => (useFixture ? adaptedFixture.edges : summary.normalizedEdges),
  [useFixture, adaptedFixture.edges, summary.normalizedEdges],
);
```

**SigmaGraphView key:** `key={graphSummary.source}` — stable string (`"Self-Graph (LumaWeave docs)"` for the fixture). This prevents Sigma from being unmounted/remounted on settings changes.

---

### L7 — ThemeTarget Override System

**Where:** `src/themes/themeTargetRegistry.ts`, `src/themes/themeOverrideStorage.ts` (or equivalent), `useResolvedTargetColor`

**What:** Per-element color overrides. `data-lw-theme-target="<target-id>"` marks interactive elements. The override storage holds a map of `targetId → { path, value }`. When an override is written, a `lw:override-change` CustomEvent fires on `window`.

**How overrides propagate:**
- `useResolvedTargetColor(targetId, path, fallback)` — reads the current override (if any) for a target at render time; falls back to the theme-resolved value
- `lw:override-change` window event — consumed by effects in `SigmaGraphView` and `AppShell` to apply overrides reactively without triggering React re-renders

**Isolation:** Override changes are event-driven, not React state. They bypass the React render tree entirely. This is intentional — per-element overrides can update without AppShell re-rendering.

---

### L8 — SigmaGraphView (React Component)

**Where:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`

**What:** The Sigma.js wrapper component. Imported via `memo()`. Contains Sigma's lifecycle (init, render, kill) plus many selective effects for live updates.

**Props that trigger re-render (AppShell passes these):**
- `nodes`, `edges` — graph data
- `resolvedTokens` — memoized graph color tokens
- `nodeHum`, `nodeFlowSpeed`, `nodeGlow` — animation params from `settings.appearance.*`
- `reduceMotion` — from `settings.appearance.reduceMotion`
- `nodeLabelMode`, `edgeLabelMode`, `nodeLabelFontSize`, `edgeLabelFontSize`, etc. — from `settings.labels.*`
- `nodeSize`, `hoverNodeColor`, `neighborhoodDepth` — from `settings.graphView.*`
- `dialectId`, `seedParamOverrides`, `activePins` — from `settings.physics.*`

Because AppShell subscribes to the full `settings` object, **any settings write causes AppShell to re-render**, which re-renders SigmaGraphView. However, Sigma's internal graph is only rebuilt when the `[nodes, edges]` effect fires (L9).

**Selective live-update effects inside SigmaGraphView (no rebuild):**

| Effect | Deps | What it does |
|---|---|---|
| Hum / flow / glow | `[nodeHum, nodeFlowSpeed, nodeGlow]` | Updates animation parameters in-place |
| Reduce motion | `[reduceMotion]` | Pauses/resumes animations |
| **Live recolor** (v103.0.4) | `[resolvedTokens]` | Walks graph nodes/edges, sets colors in-place; calls `sigma.refresh()` — **no rebuild** |
| Geometry override | `[]` + `lw:override-change` event | Updates node `type` attribute on global geometry override |
| Selection / neighborhood | `[selectedNodeId, selectedEdgeId, neighborhoodDepth, ...]` | Applies selection dimming and highlight |
| Node size | `[nodeSize]` | Scales all node sizes in-place |
| Dialect | `[dialectId]` | Swaps gwells physics controller — no Sigma recreation |
| Seed overrides | `[seedParamOverrides]` | Passes config to gwells controller |
| Pins | `[activePins]` | Applies pin positions to gwells controller |
| Label size | `[nodeLabelFontSize]`, `[edgeLabelFontSize]` | Updates Sigma settings in-place |

---

### L9 — Graph Rebuild Effect (`[nodes, edges]`)

**Where:** `SigmaGraphView.tsx:322–787`

**What:** The only effect that kills and recreates the full Sigma instance. Calls `sigmaRef.current.kill()`, runs `buildGraphologyGraph()`, creates a new Sigma, and starts the gwells physics controller.

**Dependency array:**
```typescript
}, [nodes, edges]);  // SigmaGraphView.tsx:787
```

**This effect fires when and only when:**
1. `nodes` array reference changes (fixture changes or source data changes)
2. `edges` array reference changes

**This effect does NOT fire when:**
- Theme changes (`resolvedTokens` has its own separate live-recolor effect at L8)
- Typography changes
- Any `settings.*` change that doesn't affect `graphNodes`/`graphEdges`
- UI state changes (panel open/close, tile interactions)

---

## Typography Tile — State Isolation

The Typography Playground tile (`TypographyPlaygroundSection`) uses **local React state only** (`useState`) — it does not write to the settings store. Font weight slider changes live entirely inside the component and affect only the inline `style={{ fontWeight }}` on the sample text elements.

```typescript
// TypographyPlaygroundSection.tsx
const [weights, setWeights] = useState<Record<string, number>>(() => { ... });
// Never calls setSetting, never touches useSettingsStore
```

This means typography tile interactions **cannot** cause a graph rebuild (L9) through the React state path. If the graph appears to fully reload when interacting with the typography tile, the root cause is elsewhere.

---

## Sigma Event Map — All Callers

Every place `sigma.refresh()` or `sigma.kill()` fires, what triggers it, and whether it's a rebuild.

| Call | Location | Trigger | Rebuild? |
|---|---|---|---|
| `sigma.kill()` | `SigmaGraphView.tsx:782` (cleanup of `[nodes, edges]` effect) | `nodes` or `edges` ref changes; also fires on unmount | **Yes — full kill+recreate** |
| `sigma.refresh()` | `SigmaGraphView.tsx:813` (`[dialectId]` effect) | dialectId changes | No — in-place refresh |
| `sigma.refresh()` | `SigmaGraphView.tsx:874` (`[resolvedTokens]` effect — live-recolor) | theme swap or `hoverNodeColor` changes | No — walks nodes/edges, sets colors |
| `sigma.refresh({ skipIndexation: false })` | `SigmaGraphView.tsx:892` (`lw:override-change` handler) | global geometry preset override | No |
| `sigma.refresh({ skipIndexation: true })` | `SigmaGraphView.tsx:846` (`[nodeSize]` effect) | nodeSize changes | No |
| `sigma.refresh()` | `SigmaGraphView.tsx:964` (container resize handler) | window resize | No |
| `sigma.refresh({ skipIndexation: true })` | Lines 948, 1058, 1110, 1119 | hover/selection interaction handlers | No |

**The only full kill+recreate path is the `[nodes, edges]` effect** at line 787. Every other sigma event is an in-place refresh.

---

## Analysis of Spurious Rebuild Candidates (2026-06-03 code audit)

Four candidates were identified in the initial analysis. Here are the verified findings:

### Candidate 1 — `useGraphSourceSummary` returning unstable references: **RULED OUT**

**Code:** `src/graph/ingest/useGraphSourceSummary.ts`

The hook's `useEffect` has `[]` deps — it runs once on mount. It calls `loadGraphifySource()` async and calls `setSummary(result)` exactly once when the data arrives. After that, `summary.normalizedNodes` and `summary.normalizedEdges` are stable object references that never change.

The `graphNodes`/`graphEdges` memos in AppShell (`AppShell.tsx:302–309`) depend on `[useFixture, adaptedFixture.nodes, summary.normalizedNodes]`. After the initial async load completes, all three deps are stable — no new references are produced on settings writes. **The `[nodes, edges]` effect does not fire spuriously from this path.**

### Candidate 2 — `buildGraphologyGraph` diagnostic call outside effect: **CONFIRMED performance issue, not rebuild trigger**

**Code:** `AppShell.tsx:318–331`

```typescript
if (useFixture && adaptedFixture.nodes.length > 0) {
  const { diagnostics: fixtureDiagnostics } = buildGraphologyGraph(
    adaptedFixture.nodes,
    adaptedFixture.edges,
    { nodeSize: settings.graphView.nodeSize },
  );
```

This runs in the render body — every AppShell render creates a full Graphology graph, runs connected-component analysis, then discards the graph. The result is used to populate `graphSummary` (displayed in the status bar). The build does **not** store state anywhere that SigmaGraphView reads, so it cannot trigger sigma rebuilds. But it IS expensive — O(nodes + edges) work on every settings write. **Fix: wrap in `useMemo([adaptedFixture.nodes, adaptedFixture.edges, settings.graphView.nodeSize])`.**

### Candidate 3 — `nodeSize` in `[nodes, edges]` closure: **NOT a rebuild trigger (correct)**

The `[nodes, edges]` effect reads `nodeSize` from a stale closure inside its debounced callback. Since `nodeSize` is not in the `[nodes, edges]` dep array, its changes don't trigger the effect. The `[nodeSize]` effect handles size updates independently. This is intentional and correct — confirmed by code inspection.

### Candidate 4 — Settings writes touching appearance: **PARTIALLY CONFIRMED**

Theme changes (`settings.appearance.theme`) cascade: `themeTokens` → `resolvedGraphTokens` → SigmaGraphView re-renders → `[resolvedTokens]` effect fires → `sigma.refresh()` (live-recolor). **This is intentional behavior**, not a bug. The live-recolor `sigma.refresh()` is fast and does not cause a kill+recreate. On large graphs it may briefly redraw but is not a "full reload."

The `quality preset` effects (AppShell:155–194) write `settings.appearance` wholesale, which re-renders AppShell and propagates `nodeHum`/`nodeFlowSpeed`/`nodeGlow` changes to SigmaGraphView. These go through the `[nodeHum, nodeFlowSpeed, nodeGlow]` animation effect which just updates refs — no sigma call.

---

## New Finding: `settings: LayoutSettings` Stale Closure

**Where:** `SigmaGraphView.tsx:262–265`

```typescript
const settings: LayoutSettings = {
  nodeSize,
  nodeColorScale: resolvedTokensRef.current?.nodeColorScale,
};
```

This object is recreated every render. It's captured by the `[nodes, edges]` effect closure. If `nodeSize` or `nodeColorScale` changes *between* the time `nodes`/`edges` change and the debounce fires (150ms), the rebuild uses potentially stale values. Since `resolvedTokensRef` is initialized with the prop value on mount (`useRef(resolvedTokens)` at line 212), `nodeColorScale` is correct on the first build. After the build, the `[resolvedTokens]` live-recolor effect would overwrite any color issues anyway.

This is a **subtle stale-data bug in the rebuild path** (not a spurious rebuild trigger). If a user changes `nodeSize` quickly and then a source file changes within 150ms, the first build would use the pre-change `nodeSize`. The `[nodeSize]` effect would fix it afterward. In practice this race is invisible.

---

## New Finding: `arePropsEqual` Intentionally Excludes Callbacks

**Where:** `SigmaGraphView.tsx:1177–1216`

The custom `memo` comparator does not check `onSelectNode`, `onClearSelection`, `onSetPathTarget`, `onSelectEdge`, or `onUpdatePins`. These callbacks are defined inline in AppShell JSX and get new references on every render. Excluding them from `arePropsEqual` means SigmaGraphView correctly skips re-renders when only callbacks change — they're synced into refs via the effect at `SigmaGraphView.tsx:279–288`. **This is correct and intentional.**

---

## New Finding: Intentional Fixture→Real-Source Flip

If a real source loads successfully after mount, `useFixture` flips from `true` → `false`, `graphNodes` changes from `adaptedFixture.nodes` → `summary.normalizedNodes`, and the `[nodes, edges]` effect fires — triggering a full Sigma kill+recreate. **This is the intended behavior for switching from the self-graph fixture to a real project source.** It only happens once per app session (on first successful source load).

In the AI-lab environment (source path `/home/boop/Projects/ai-lab/graphify-out`), if the source isn't available, `hasRealSource` stays `false`, `useFixture` stays `true`, and the fixture graph is never replaced. No spurious rebuilds.

---

## Conclusion on Spurious Rebuilds

**Based on 2026-06-03 code audit, there are no spurious Sigma kill+recreate cycles in steady state.**

The architecture is correctly guarded:
- `graphNodes`/`graphEdges` memos produce stable refs after initial load
- `key={graphSummary.source}` is a stable string (no remounts)
- `arePropsEqual` correctly blocks re-renders from callback identity churn
- The `[nodes, edges]` dep array is correctly isolated from settings writes

**What may appear to be a "full reload" to the eye:**
1. The live-recolor `sigma.refresh()` on theme change — intentional, colors update in-place
2. The no-skipIndexation `sigma.refresh()` on dialectId change — Sigma re-indexes on physics mode swap
3. The initial mount build — always takes ~100–300ms on first render
4. The fixture→real source flip — one-time, intentional

If the developer observes a sigma kill+recreate during normal settings interaction (not source changes), the most likely remaining causes are: (a) the `useFixture` boolean flipping unexpectedly due to `summaryError` toggling, or (b) a React DevTools Strict Mode double-invoke in development causing effects to run twice.

---

---

## Render Cost Summary

| Action | AppShell re-renders? | SigmaGraphView re-renders? | Sigma rebuilds? |
|---|---|---|---|
| Theme swap | Yes | Yes | No (live-recolor effect) |
| Typography tile slider | No (local state only) | No | No |
| Any settings write | **Yes** | Yes (props change) | Only if `nodes`/`edges` refs change |
| Source file added/changed/deleted | Yes | Yes | **Yes** (`[nodes, edges]` fires) |
| Per-element color override | No (event-driven) | No | No |
| Node size change | Yes | Yes | No (`[nodeSize]` effect) |
| Dialect change | Yes | Yes | No (`[dialectId]` effect) |
| Panel open/close | Yes | Yes | No — `nodes`/`edges` refs are stable after initial load |

The last column ("Sigma rebuilds") is what the user perceives as a "full graph reload." Everything else is either a cheap React re-render or a Sigma `refresh()` call that's imperceptible at normal graph sizes.

---

## Recommendations

**Updated 2026-06-03 — candidates verified against code.**

1. ~~**Verify `useGraphSourceSummary` reference stability.**~~ **RESOLVED — stable.** The hook runs once on mount and `setSummary` fires at most once. No action needed.

2. **Move the diagnostic `buildGraphologyGraph` call into a `useMemo`.** `AppShell.tsx:318–331` runs on every render, rebuilding a full Graphology graph just to extract 3 diagnostic numbers for the status bar. Fix:
   ```typescript
   const componentDiagnostics = useMemo(() => {
     if (!useFixture || adaptedFixture.nodes.length === 0) return {};
     const { diagnostics } = buildGraphologyGraph(
       adaptedFixture.nodes, adaptedFixture.edges, { nodeSize: settings.graphView.nodeSize }
     );
     return { componentCount: diagnostics.componentCount, isolatedNodeCount: diagnostics.isolatedNodeCount, largestComponentSize: diagnostics.largestComponentSize };
   }, [useFixture, adaptedFixture.nodes, adaptedFixture.edges, settings.graphView.nodeSize]);
   ```

3. **Consider narrowing AppShell's store subscription.** The broad `useSettingsStore((s) => s.settings)` subscription re-renders AppShell on every write (including physics pins, UI state, etc.). Splitting into narrower selectors would reduce render-body work (including the un-memoized diagnostic build above). This is a refactor, not a hotfix.

4. **Typography tile weights should stay local state** — this is correct. If font weight changes ever need to be persisted, add a `settings.typography` section; the graph would remain unaffected since typography has no path into `resolvedTokens`.

5. **If investigating observed "reloads"**: instrument with `console.count('sigma.kill')` at `SigmaGraphView.tsx:782` to distinguish kill+recreate from `sigma.refresh()`. The live-recolor refresh on theme change may look like a reload visually but is not one. Strict Mode double-invokes (dev only) can also cause two builds on mount — expected in dev, harmless.
