---
id: contract.graph.theme.first.value.application
title: Graph Theme First Value Application Contract
type: contract
status: accepted
version: v59
domain: graph
subdomain: contracts
cluster: azure
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-21
depends_on:
  - contract.graph.theme.token.value.application
  - theme.token.path.map
  - theme.engine
governs:
  - src/graph/renderers/sigma2d/SigmaGraphView.tsx
  - src/graph/visual/graphStylePolicy.ts
  - src/graph/visual/graphVisualTokens.ts
  - src/app/AppShell.tsx
  - src/themes/themeTokens.ts
tags:
  - graph
  - theme
  - sigma
  - runtime
  - application
  - canonical
  - contract
  - accepted
  - v59
---

# Graph Theme First Value Application Contract

**Status:** Accepted — v59

---

## 1. Purpose

This contract governs the **first genuine application of resolved theme token values to graph
runtime surfaces** — the Sigma canvas, its node and edge rendering, and the background fill.
It is the implementation contract that completes the governance chain established by v49 through
v57 and makes graph visual elements respond to theme switches through the canonical token path
system.

Prior contracts (v49–v57) established governance scaffolding: the mapping registry, the runtime
lifecycle model, the DOM-wrapper CSS variable approach, and the token value resolution pipeline.
This contract closes the last gap: ensuring that resolved canonical path values (`graph.node.fill`,
`graph.edge.stroke`, `graph.background`) reach the Sigma renderer and update live when the active
theme changes, without requiring a full graph rebuild.

---

## 2. Chain Position

```
v49  Graph Visual Theme Mapping Contract
     (static mapping registry, metadata only — no mutation)
  ↓
v51  Graph Theme Runtime Application Contract
     (lifecycle model: preset → token paths → CSS variables → DOM)
  ↓
v53  Graph Theme Token Value Preview Contract
     (read-only diagnostic surface, no application)
  ↓
v55  Graph Theme Application Contract
     (DOM wrapper layer, no direct Sigma API calls)
  ↓
v57  Graph Theme Token Value Application Contract
     (token value resolution via themeTokenPaths.ts, CSS custom properties)
  ↓
v59  Graph Theme First Value Application Contract    ← THIS CONTRACT
     (live application to Sigma runtime surfaces, canonical path enforcement)
  ↓
v60  [CANDIDATE] Graph Theme CSS Variable Bridge
     (write --lw-graph-* CSS variables to Sigma container element)
```

v59 is the first contract that sanctions direct updates to `sigma.setSetting()` for color tokens
and mandates that all graph visual color values are sourced from `resolveThemeTokenPath`. v60
(analysis in § 18) would add DOM-observable CSS variables for graph tokens.

---

## 3. Executive Summary

The current implementation wires `themeTokens.graph.*` (a flat per-theme runtime object) into
`resolveGraphVisualTokens`, which produces the `ResolvedGraphVisualTokens` shape passed to
`SigmaGraphView`. Graph node and edge colors DO change with theme switches because `AppShell`
re-memoizes `resolvedGraphTokens` when `settings.appearance.theme` changes.

**However, three critical gaps remain:**

1. **Sigma's own default color settings are not updated on theme switch.** `defaultNodeColor`
   and `defaultEdgeColor` are Sigma constructor arguments set at graph build time. On theme
   change, `applyGraphStylePolicy` runs (via the `resolvedTokens` dep in the selection effect)
   and updates node/edge graph attributes. But `sigma.getSetting("defaultNodeColor")` remains
   stale — it reflects the color from the last Sigma initialization. This means any node that
   falls through `applyGraphStylePolicy` without an explicit attribute set will render the old
   theme's color.

2. **No CSS custom properties exist for graph-specific token paths.** The theme engine doc
   specifies that `graph.node.fill` should write `--lw-graph-node-fill`. AppShell writes
   `--lw-app-background`, `--lw-panel-background`, etc. but writes NO graph canvas tokens.
   These variables don't exist in the DOM. Overlays, debug panels, and external inspectors
   cannot read current graph theme colors from CSS.

3. **The canonical path system is not the authoritative source for graph Sigma colors.** Values
   flow from `themeTokens.graph.nodeDefault` through `resolveGraphVisualTokens`. The canonical
   `resolveThemeTokenPath(tokens, "graph.node.fill")` resolves to the same underlying value
   (because `themeTokenPaths.ts` maps `graph.node.fill` → `tokens.graph.nodeDefault`), but
   this is a coincidence of current mapping, not enforced governance. If the canonical path is
   re-pointed to a different source or receives an override, the Sigma renderer would NOT see
   the override — it still reads from the flat model.

v59 closes gaps 1 and 3. v60 is the candidate to close gap 2.

---

## 4. Definitions

| Term | Definition |
|------|-----------|
| **Graph runtime surface** | A visual element rendered directly by the Sigma.js canvas engine — node fills, edge strokes, canvas background |
| **Flat graph token model** | The `themeTokens.graph.*` shape (e.g., `themeTokens.graph.nodeDefault`) — the current per-theme runtime object with hardcoded string keys |
| **Canonical path resolution** | `resolveThemeTokenPath(tokens, path)` from `themeTokenPaths.ts` — the tier-walk resolver that respects override storage and governance |
| **Live Sigma update** | Calling `sigma.setSetting(key, value)` + `sigma.refresh()` on an existing Sigma instance — updates visual without rebuilding the graph or recreating Sigma |
| **Default color** | A Sigma constructor-level setting (`defaultNodeColor`, `defaultEdgeColor`) that acts as the fallback when a node/edge has no explicit `color` attribute |

---

## 5. Current State Assessment

### 5a. What works

- Theme selection changes `settings.appearance.theme` → `themeTokens` re-memoizes →
  `resolvedGraphTokens` re-memoizes → SigmaGraphView re-renders.
- The `arePropsEqual` memo check returns `false` when `resolvedTokens !== next.resolvedTokens`,
  triggering a React render of SigmaGraphView.
- The selection styling `useEffect` (deps include `resolvedTokens`) calls
  `applyGraphStylePolicy(graph, ..., resolvedTokens)` which calls `resetGraphStyles` and
  sets `color` attributes on all nodes/edges → `sigma.refresh()` → visual updates on screen.
- The `colorSuggestionEngine` (v88b.0.1) assigns per-node colors from the active theme at
  graph build time via `buildGraphologyGraph`. These are stored in `attrs.raw.color` and
  survive style-policy resets because `resetGraphStyles` reads `attrs.raw?.color` first.

### 5b. What is broken or incomplete

- `sigma.getSetting("defaultNodeColor")` is never updated after initialization. If a node
  has no explicit `color` attribute AND `attrs.raw?.color` is absent, Sigma falls back to
  its internal default — the value from when Sigma was last constructed.

- `sigma.getSetting("defaultEdgeColor")` is similarly stale after theme switch. Edges that
  fall through the style policy without an explicit `color` attribute keep the old color.

- There is no `--lw-graph-node-fill` custom property in the DOM. The THEME_ENGINE.md describes
  this variable as expected output, but it is not written anywhere in the codebase.

- The `resolveGraphVisualTokens` function in `themeTokens.ts` reads from the flat
  `themeGraphTokens.*` shape. Override storage values (from `themeOverrideStorage.ts`) are
  NOT applied to graph visual tokens. If a user overrides `graph.node.fill` via the theme
  override system, the override would not reach Sigma.

- The `resolvedGraphTokens` shape includes `nodeColorScale` and `edgeColorScale` arrays from
  the flat model. These are consumed by `buildGraphologyGraph` as the legacy color rotation
  source. Post-v88b.0.1, `colorSuggestionEngine` is the primary source for node colors at
  build time, but `nodeColorScale` is still passed through the pipeline as a fallback.

---

## 6. Gap Analysis

### Gap A: Stale Sigma default colors on theme switch

**Location:** `SigmaGraphView.tsx` lines 398–421 (Sigma constructor call)

```typescript
// Current — only set at construction time
const sigma = new Sigma(graph, containerRef.current, {
  defaultNodeColor: resolvedTokens.nodeColor.default,
  defaultEdgeColor: resolvedTokens.edgeColor.default,
  // ...
});
```

When `resolvedTokens` changes (theme switch), this constructor block does NOT re-run unless
`nodes` or `edges` change (the outer `useEffect` depends on `[nodes, edges]` not `[resolvedTokens]`).
The `sigma.setSetting` for default colors must be called separately on theme change.

**Required fix:** Add a `useEffect` with `[resolvedTokens]` as dependency that calls:
```typescript
sigma.setSetting("defaultNodeColor", resolvedTokens.nodeColor.default);
sigma.setSetting("defaultEdgeColor", resolvedTokens.edgeColor.default);
sigma.refresh();
```

### Gap B: Override storage bypass for graph tokens

**Location:** `AppShell.tsx` lines 228–234

```typescript
const resolvedGraphTokens = useMemo(
  () => resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  }),
  [themeTokens, settings.graphView.hoverNodeColor]
);
```

`resolveGraphVisualTokens` reads from the flat `themeTokens.graph.*` shape directly. It does
not pass through the override storage system. `resolveThemeTokenPath` does apply overrides
(when the override storage layer is active). The flat path and the canonical path currently
return the same values, but this is coincidental — override support for graph tokens is absent.

**Required fix:** The sources for `nodeColor.default`, `nodeColor.selected`, `edgeColor.default`
etc. in `resolvedGraphTokens` must come from `resolveThemeTokenPath(themeTokens, path)` for the
relevant canonical paths, not directly from `themeTokens.graph.*`.

### Gap C: No CSS variable bridge for graph canvas tokens

**Location:** `AppShell.tsx` — inline style on `<main data-lw-theme-target="app.shell">`

The graph canvas tokens (`graph.node.fill`, `graph.edge.stroke`, `graph.background`) are never
written as CSS custom properties. The THEME_ENGINE.md specifies `--lw-graph-node-fill` etc.
should exist. They do not. This gap is addressed by v60 (§ 18).

---

## 7. Graph Runtime Surfaces — Authoritative List

For the purposes of this contract, "graph runtime surfaces" are the Sigma-rendered elements
that must reflect the active theme. Each surface has a canonical token path and a Sigma
configuration key:

| Surface | Canonical Token Path | Sigma Setting Key | Sigma Attribute | Priority |
|---------|---------------------|-------------------|----------------|----------|
| Node default fill | `graph.node.fill` | `defaultNodeColor` | node `color` attr | v59 |
| Node hover fill | `graph.node.hoverFill` | n/a | set in style policy | v59 |
| Node selected fill | `graph.node.selectedFill` | n/a | set in style policy | v59 |
| Node label color | `graph.node.label` | `labelColor.color` | node `labelColor` attr | v59 |
| Edge default stroke | `graph.edge.stroke` | `defaultEdgeColor` | edge `color` attr | v59 |
| Edge hover stroke | `graph.edge.hoverStroke` | n/a | set in style policy | v59 |
| Edge selected stroke | `graph.edge.selectedStroke` | n/a | set in style policy | v59 |
| Edge label color | `graph.edge.label` | `edgeLabelColor.color` | n/a | v59 |
| Graph canvas background | `app.background` | n/a (via CSS) | container CSS | deferred |

The canvas background is handled by the `--lw-app-background` CSS variable already written
by AppShell (v88c). Sigma reads the container's background color via CSS inheritance; no
additional Sigma setting is required for this surface. It is marked "deferred" here because
it already works via the existing CSS pipeline.

---

## 8. Canonical Token Paths Governed

This contract takes authority over the following canonical paths as sources for Sigma rendering
values. All are CANONICAL in `themeTokenPaths.ts` (pre-v86a Tier 2 paths):

```
graph.node.fill         → defaultNodeColor in Sigma constructor
                        → nodeColor.default in ResolvedGraphVisualTokens
                        → fallback in resetGraphStyles when attrs.raw.color absent

graph.node.hoverFill    → nodeColor.hover in ResolvedGraphVisualTokens
                        → hoverNodeColor in applyHoverStyles

graph.node.selectedFill → nodeColor.selected in ResolvedGraphVisualTokens
                        → applySelectedNodeStyles (primary node color)

graph.node.label        → nodeLabelColor.default in ResolvedGraphVisualTokens
                        → labelColor setting in Sigma constructor

graph.edge.stroke       → defaultEdgeColor in Sigma constructor
                        → edgeColor.default in ResolvedGraphVisualTokens
                        → fallback in resetGraphStyles for edges

graph.edge.hoverStroke  → edgeColor.hovered in ResolvedGraphVisualTokens

graph.edge.selectedStroke → edgeColor.selected in ResolvedGraphVisualTokens

graph.edge.label        → edgeLabelColor.default in ResolvedGraphVisualTokens
                        → edgeLabelColor setting in Sigma constructor
```

Secondary color entries (`graph.node.hoverFill` → `nodeColor.secondary`, `nodeColor.tertiary`,
etc.) are resolved from the flat `themeTokens.graph.*` values for v59. Full tier-walk sourcing
for secondary/tertiary colors is deferred to a future pass — the critical path is the DEFAULT
and SELECTED colors.

---

## 9. Application Architecture

### Chosen approach: Live Sigma settings update on theme change

v59 does NOT change the construction path (Sigma is still initialized with resolved token values
at build time). It adds a **live update** path: when `resolvedTokens` changes, a dedicated
`useEffect` calls `sigma.setSetting()` for the relevant keys and triggers `sigma.refresh()`.

This completes the reactivity loop without requiring a full Sigma rebuild on theme switch.

```
Theme change
    │
    ▼
AppShell: settings.appearance.theme → themeTokens → resolvedGraphTokens
    │
    ▼
SigmaGraphView receives new resolvedTokens prop
    │
    ├──▶ [existing] selection styling useEffect:
    │        applyGraphStylePolicy(graph, ..., resolvedTokens)
    │        → resetGraphStyles updates node/edge color attributes
    │        → sigma.refresh()
    │
    └──▶ [NEW v59] token live-update useEffect:
             sigma.setSetting("defaultNodeColor", resolvedTokens.nodeColor.default)
             sigma.setSetting("defaultEdgeColor", resolvedTokens.edgeColor.default)
             sigma.setSetting("labelColor", { attribute: "labelColor", color: resolvedTokens.nodeLabelColor.default })
             sigma.setSetting("edgeLabelColor", { color: resolvedTokens.edgeLabelColor.default })
             sigma.refresh()
```

### Why not rebuild Sigma on theme change?

Rebuilding Sigma (via the `[nodes, edges]` useEffect) would correctly re-initialize with new
token values but has significant costs:
- Full graph rebuild (~150ms debounce + graphology construction + Sigma init)
- Camera state lost (position and zoom reset)
- gwells physics controller restart (node positions reset)
- All interaction state cleared

The live-update path (calling `sigma.setSetting()`) is O(1) and preserves all runtime state.

### Canonical path enforcement

The `resolveGraphVisualTokens` function in `themeTokens.ts` must be updated so that primary
graph color entries read from `resolveThemeTokenPath(tokens, canonicalPath)` rather than
directly from `themeTokens.graph.*`. This ensures:

1. Override storage values for `graph.node.fill` reach Sigma
2. Tier-walk validator coverage extends to graph rendering colors
3. Any future re-pointing of the canonical path automatically propagates

The secondary/tertiary color entries (used only in style policy for neighborhood highlighting)
continue to read from `themeTokens.graph.*` in v59. They are interaction-state colors with no
canonical paths defined; full governance is deferred.

---

## 10. Resolution Pipeline Specification

The canonical application pipeline for graph rendering colors in v59:

```
Active theme preset
    │
    ▼
getThemeRuntimeTokens(themeId): ThemeRuntimeTokens
    │
    ▼
resolveThemeTokenPath(tokens, "graph.node.fill")      ← canonical path resolver
    │                                                     (goes through override storage)
    ▼
string (hex or rgba)     e.g., "#22d3ee"
    │
    ▼
resolveGraphVisualTokens(themeTokens.graph, settings)
    └── nodeColor.default = resolveThemeTokenPath(tokens, "graph.node.fill")
    └── edgeColor.default = resolveThemeTokenPath(tokens, "graph.edge.stroke")
    └── nodeLabelColor.default = resolveThemeTokenPath(tokens, "graph.node.label")
    └── edgeLabelColor.default = resolveThemeTokenPath(tokens, "graph.edge.label")
    └── nodeColor.hover = resolveThemeTokenPath(tokens, "graph.node.hoverFill")
    └── nodeColor.selected = resolveThemeTokenPath(tokens, "graph.node.selectedFill")
    └── edgeColor.selected = resolveThemeTokenPath(tokens, "graph.edge.selectedStroke")
    └── edgeColor.hovered = resolveThemeTokenPath(tokens, "graph.edge.hoverStroke")
    │   (secondary/tertiary → still from themeTokens.graph.* in v59)
    │
    ▼
resolvedGraphTokens: ResolvedGraphVisualTokens
    │
    ▼
SigmaGraphView resolvedTokens prop
    │
    ├── Sigma constructor:
    │       defaultNodeColor: resolvedTokens.nodeColor.default
    │       defaultEdgeColor: resolvedTokens.edgeColor.default
    │       labelColor: { attribute: "labelColor", color: resolvedTokens.nodeLabelColor.default }
    │       edgeLabelColor: { color: resolvedTokens.edgeLabelColor.default }
    │
    ├── v59 live-update useEffect:
    │       sigma.setSetting("defaultNodeColor", ...)
    │       sigma.setSetting("defaultEdgeColor", ...)
    │       sigma.setSetting("labelColor", ...)
    │       sigma.setSetting("edgeLabelColor", ...)
    │
    └── Style policy (existing):
            resetGraphStyles → node color attributes from nodeColor.default
            applySelectedNodeStyles → nodeColor.selected
            applySelectedEdgeStyles → edgeColor.selected
            applyHoverStyles → nodeColor.hover, edgeColor.hovered
```

---

## 11. Sigma Integration Specification

### 11a. Constructor (unchanged — builds with initial resolved values)

```typescript
const sigma = new Sigma(graph, containerRef.current, {
  // ... existing settings ...
  defaultNodeColor: resolvedTokens.nodeColor.default,
  defaultEdgeColor: resolvedTokens.edgeColor.default,
  labelColor: { attribute: "labelColor", color: resolvedTokens.nodeLabelColor.default },
  edgeLabelColor: { color: resolvedTokens.edgeLabelColor.default },
});
```

No changes to the constructor call. Initial values are correct at build time.

### 11b. NEW: Live-update effect

Add to `SigmaGraphView.tsx`, with `resolvedTokens` as the primary dependency:

```typescript
useEffect(() => {
  const sigma = sigmaRef.current;
  if (!sigma) return;

  sigma.setSetting("defaultNodeColor", resolvedTokens.nodeColor.default);
  sigma.setSetting("defaultEdgeColor", resolvedTokens.edgeColor.default);
  sigma.setSetting("labelColor", {
    attribute: "labelColor",
    color: resolvedTokens.nodeLabelColor.default,
  });
  sigma.setSetting("edgeLabelColor", { color: resolvedTokens.edgeLabelColor.default });
  sigma.refresh();
}, [resolvedTokens]);
```

This effect runs:
- On mount (after first Sigma init — benign, same values as constructor)
- On any `resolvedTokens` identity change (theme switch, override applied)

The `sigma.refresh()` in this effect and the `sigma.refresh()` in the selection styling
effect may fire in the same microtask batch (both triggered by same `resolvedTokens` change).
Sigma deduplicates same-frame refreshes internally. No coordination is required.

### 11c. Existing behavior preserved

The selection styling effect (`deps: [..., resolvedTokens]`) already calls
`applyGraphStylePolicy` → `resetGraphStyles` which sets node/edge `color` attributes.
This existing behavior is NOT changed by v59. The live-update effect handles Sigma's own
default settings; the selection effect handles graph attribute colors.

Both effects are necessary:
- `defaultNodeColor` is Sigma's fallback for nodes with no `color` attribute
- The graph attribute `color` is what most nodes/edges render with (set by style policy)
- Both must reflect the current theme for consistent rendering

---

## 12. resolveGraphVisualTokens Migration

### 12a. Target state for primary color entries

In `src/themes/themeTokens.ts`, the `resolveGraphVisualTokens` function signature gains a
`tokens: ThemeRuntimeTokens` parameter to enable canonical path resolution:

```typescript
export function resolveGraphVisualTokens(
  themeGraphTokens: ThemeRuntimeTokens["graph"],
  settings: { hoverNodeColor?: string },
  tokens: ThemeRuntimeTokens,   // NEW: full tokens object for canonical resolution
): ResolvedGraphVisualTokens {
  return {
    nodeColor: {
      default: resolveThemeTokenPath(tokens, "graph.node.fill") as string,
      selected: resolveThemeTokenPath(tokens, "graph.node.selectedFill") as string,
      hover: settings.hoverNodeColor || (resolveThemeTokenPath(tokens, "graph.node.hoverFill") as string),
      relationshipEndpoint: themeGraphTokens.nodeSelected, // v59: still flat — no canonical path
      secondary: themeGraphTokens.nodeSecondary,           // v59: still flat — no canonical path
      tertiary: themeGraphTokens.nodeTertiary,             // v59: still flat — no canonical path
    },
    edgeColor: {
      default: resolveThemeTokenPath(tokens, "graph.edge.stroke") as string,
      selected: resolveThemeTokenPath(tokens, "graph.edge.selectedStroke") as string,
      hovered: resolveThemeTokenPath(tokens, "graph.edge.hoverStroke") as string,
      secondary: themeGraphTokens.edgeSecondary,           // v59: still flat — no canonical path
      tertiary: themeGraphTokens.edgeTertiary,             // v59: still flat — no canonical path
    },
    nodeLabelColor: {
      default: resolveThemeTokenPath(tokens, "graph.node.label") as string,
      hover: themeGraphTokens.nodeLabelHover,              // v59: still flat — no canonical path
      selected: themeGraphTokens.nodeLabel,                // v59: still flat — no canonical path
    },
    edgeLabelColor: {
      default: resolveThemeTokenPath(tokens, "graph.edge.label") as string,
      selected: themeGraphTokens.edgeLabelHover,           // v59: still flat — no canonical path
    },
    // ... rest unchanged
  };
}
```

### 12b. Call-site update

In `AppShell.tsx`, pass the full `themeTokens` object as the third argument:

```typescript
const resolvedGraphTokens = useMemo(
  () => resolveGraphVisualTokens(themeTokens.graph, {
    hoverNodeColor: settings.graphView.hoverNodeColor,
  }, themeTokens),   // NEW: third argument
  [themeTokens, settings.graphView.hoverNodeColor]
);
```

### 12c. What is NOT changed in v59

The following entries in `ResolvedGraphVisualTokens` continue to read from the flat model
in v59. They are interaction-state colors that have no canonical token paths defined and
receive no overrides:

- `nodeColor.secondary`, `nodeColor.tertiary`, `nodeColor.relationshipEndpoint`
- `edgeColor.secondary`, `edgeColor.tertiary`
- `nodeLabelColor.hover`, `nodeLabelColor.selected`
- `edgeLabelColor.selected`
- `nodeColorScale`, `edgeColorScale`

Promoting these to canonical paths is deferred. The cost of deferral is small: these colors
are used only for neighborhood highlighting (interaction states) and are not subject to override
in current user flows.

---

## 13. Theme Switch Reactivity

### Before v59 (current)

```
Theme switch
    → AppShell: themeTokens re-memoizes
    → resolvedGraphTokens re-memoizes (identity changes)
    → SigmaGraphView re-renders (arePropsEqual returns false)
    → selection styling useEffect fires (resolvedTokens in deps)
        → applyGraphStylePolicy → resetGraphStyles → node/edge attrs updated
        → sigma.refresh() → visual updates
    → BUT: sigma.getSetting("defaultNodeColor") still reflects old theme
    → Nodes/edges without a raw.color attr AND not processed by style policy
       render with stale default color
```

### After v59

```
Theme switch
    → AppShell: themeTokens re-memoizes
    → resolvedGraphTokens re-memoizes (canonical path values)
    → SigmaGraphView re-renders (arePropsEqual returns false)
    → selection styling useEffect fires:
        → applyGraphStylePolicy → resetGraphStyles → node/edge attrs updated
    → [NEW] live-update useEffect fires:
        → sigma.setSetting("defaultNodeColor", resolvedTokens.nodeColor.default)
        → sigma.setSetting("defaultEdgeColor", resolvedTokens.edgeColor.default)
        → sigma.setSetting("labelColor", { ... })
        → sigma.setSetting("edgeLabelColor", { ... })
        → sigma.refresh()
    → ALL graph surfaces now reflect new theme, including Sigma fallback defaults
```

### Override propagation (new capability in v59)

When a user applies a theme override for `graph.node.fill` via the override storage system:

```
Override applied
    → themeTokens identity changes (override invalidates memoized tokens)
    → resolvedGraphTokens re-memoizes: resolveThemeTokenPath reads override value
    → SigmaGraphView re-renders
    → same live-update path fires → Sigma defaults updated → sigma.refresh()
```

This override path is NEW in v59. In the prior implementation, overrides on `graph.node.fill`
would never reach Sigma because `resolveGraphVisualTokens` bypassed the canonical path resolver.

---

## 14. Fallback Chain

If `resolveThemeTokenPath` returns an empty string or undefined for a graph token path
(indicating a corrupt or incomplete theme preset), the following fallback order applies:

```
resolveThemeTokenPath(tokens, "graph.node.fill")
    → empty/undefined → fall back to themeGraphTokens.nodeDefault
    → empty/undefined → fall back to graphVisualTokens.nodeColor.default ("#22d3ee")
    → empty/undefined → Sigma internal default (undefined behavior, not contracted)
```

The fallback to `graphVisualTokens.nodeColor.default` is a safety net only. In practice,
all six built-in theme presets populate `graph.node.fill` values — the fallback should never
fire in production. The tier-walk validator (`assertThemeTokenGovernanceClean`) will
hard-throw at boot if any canonical path is missing from a built-in preset.

---

## 15. File Changes

### New or modified files in v59

| File | Change Type | Description |
|------|-------------|-------------|
| `src/themes/themeTokens.ts` | Modify | Add `tokens: ThemeRuntimeTokens` param to `resolveGraphVisualTokens`; use `resolveThemeTokenPath` for 8 primary color entries |
| `src/app/AppShell.tsx` | Modify | Pass `themeTokens` as third arg to `resolveGraphVisualTokens` |
| `src/graph/renderers/sigma2d/SigmaGraphView.tsx` | Modify | Add live-update `useEffect` with `[resolvedTokens]` dep that calls `sigma.setSetting()` for 4 color settings |
| `tests/e2e/v59-graph-theme-first-value-application.spec.ts` | New | E2E test file (spec in § 17) |

### Files intentionally NOT changed in v59

| File | Reason |
|------|--------|
| `src/graph/visual/graphStylePolicy.ts` | Style policy receives `resolvedTokens` from caller; correct resolution is enforced upstream. No direct changes needed. |
| `src/graph/visual/graphVisualTokens.ts` | Static defaults file; remains as fallback values only |
| `src/themes/themeTokenPaths.ts` | `resolveThemeTokenPath` is already wired correctly; no changes needed |
| `src/graph/graphVisualThemeMappingRegistry.ts` | Governance metadata; already correct — `graph.node.fill` → `tokens.graph.nodeDefault` mapping is accurate |
| `src/app/AppShell.tsx` (CSS variables) | v88c already migrated all AppShell CSS vars to canonical names; no additional changes from v59 |

---

## 16. Governance Boundaries

### Permitted in v59

```
✓ Call sigma.setSetting("defaultNodeColor", ...) on theme change
✓ Call sigma.setSetting("defaultEdgeColor", ...) on theme change
✓ Call sigma.setSetting("labelColor", ...) on theme change
✓ Call sigma.setSetting("edgeLabelColor", ...) on theme change
✓ Add resolvedTokens dependency to a live-update useEffect
✓ Pass themeTokens as third argument to resolveGraphVisualTokens
✓ Use resolveThemeTokenPath as the source for 8 primary graph color entries
✓ Sigma.refresh() in the live-update effect
```

### Forbidden in v59

```
✗ Calling sigma.setSetting() for any visual property OTHER than the 4 color keys listed above
✗ Writing --lw-graph-node-fill or other graph CSS variables (that is v60 — see § 18)
✗ Bypassing resolveThemeTokenPath for the 8 primary color entries after v59 lands
✗ Adding graph.node.fill to the AppShell inline style CSS variable write (v60 scope)
✗ Modifying Sigma constructor call (construction values are already correct)
✗ Changing the sigma rebuild trigger (the [nodes, edges] useEffect dep array)
✗ Modifying graphStylePolicy.ts in this pass
✗ Direct Sigma WebGL or canvas API calls for color values
✗ Reading CSS custom properties inside SigmaGraphView to derive colors
```

### Sigma API boundary

`sigma.setSetting()` is explicitly allowed for the 4 color configuration keys. All other
Sigma settings that control visual behavior (e.g., `nodeReducer`, `edgeReducer`, renderer
programs, size settings) remain under the contracts that govern those systems.

Per `GRAPH_VISUAL_POLICY.md`, `Direct Sigma.setSetting() calls for visual properties` are
"Forbidden Without Contract." This contract (v59) is the authorizing contract for
`sigma.setSetting()` on the four color keys listed above.

---

## 17. QA Requirements

### Required: Playwright evidence before v59 is marked complete

A Playwright spec `tests/e2e/v59-graph-theme-first-value-application.spec.ts` must prove:

**Test 1: Node color matches active theme's graph.node.fill on initial load**
- Load app, wait for graph to render
- Read `window.__lwSigma.getSetting("defaultNodeColor")` via `page.evaluate`
- Read `graph.node.fill` resolved value from `window.__lwColorSuggestionEngine` or via
  CSS property inspection
- Assert they match (within hex equivalence)

**Test 2: Sigma default node color updates on theme switch**
- Record `window.__lwSigma.getSetting("defaultNodeColor")` before theme switch
- Select a different theme preset via `[data-testid="theme-preset-selector"]`
- Wait 500ms for React render + sigma.refresh()
- Record `window.__lwSigma.getSetting("defaultNodeColor")` after theme switch
- Assert `before !== after`
- Assert `after` is a valid hex color or rgba string (not empty, not undefined)

**Test 3: Sigma default edge color updates on theme switch**
- Same pattern as Test 2 but for `sigma.getSetting("defaultEdgeColor")`

**Test 4: Override propagation reaches Sigma default color**
- This test is marked `test.fixme` in v59 and remains pending until override storage
  tooling is exposed via a testable path. Documented here as a future QA requirement.

### Regression: Existing tests must remain passing

All tests in `tests/e2e/v86c-tile-system.spec.ts`, `tests/e2e/v88b01-engine-graph-integration.spec.ts`,
and `tests/e2e/v88c-css-variable-canonical.spec.ts` must pass without modification.

The `window.__lwSigma` probe already exists in `SigmaGraphView.tsx` (exposed at line ~435).
Test 1 and Test 2 read from this probe directly — no new probe setup required.

---

## 18. v60 Candidate Analysis: CSS Variable Bridge

The user's preferred lean for v60 is writing graph-specific CSS custom properties to the DOM.
This analysis evaluates that approach.

### What v60 would do

Write the resolved values of graph canvas token paths as CSS custom properties on the Sigma
container element (`containerRef.current` in `SigmaGraphView.tsx`):

```typescript
// In a useEffect with [resolvedTokens] dep — runs alongside the live-update effect:
if (containerRef.current) {
  containerRef.current.style.setProperty("--lw-graph-node-fill", resolvedTokens.nodeColor.default);
  containerRef.current.style.setProperty("--lw-graph-edge-stroke", resolvedTokens.edgeColor.default);
  containerRef.current.style.setProperty("--lw-graph-node-hover-fill", resolvedTokens.nodeColor.hover);
  containerRef.current.style.setProperty("--lw-graph-node-selected-fill", resolvedTokens.nodeColor.selected);
  containerRef.current.style.setProperty("--lw-graph-edge-selected-stroke", resolvedTokens.edgeColor.selected);
  containerRef.current.style.setProperty("--lw-graph-node-label", resolvedTokens.nodeLabelColor.default);
  containerRef.current.style.setProperty("--lw-graph-edge-label", resolvedTokens.edgeLabelColor.default);
}
```

Alternatively, these could be written to `document.documentElement` (the document root), consistent
with how THEME_ENGINE.md describes the output. Writing to `containerRef.current` scopes them to
the Sigma subtree; writing to `:root` makes them globally available.

### Why v60 is valuable

1. **Inspectability.** Browser DevTools would show `--lw-graph-node-fill: #22d3ee` on the Sigma
   container. Theme inspectors, design tools, and CSS overlays can read current graph colors from
   the DOM without JS.

2. **CSS consumer compatibility.** Overlays such as `BookmarkLayer`, `ClickHalo`, `GlitterField`
   currently hardcode colors or read from `graphVisualTokens` directly. After v60, they could use
   `var(--lw-graph-node-fill)` in their CSS, automatically picking up the active theme color.

3. **Completes the THEME_ENGINE.md spec.** The engine doc describes `--lw-graph-node-fill` as
   expected output. v60 makes this accurate.

4. **Foundation for CSS-only theming.** In a future where custom themes are defined via CSS
   variable overrides (rather than preset objects), the graph layer would already be reading
   from CSS.

### What v60 does NOT do

- v60 does not change how Sigma reads colors. Sigma reads from `sigma.getSetting(...)` and from
  graph node/edge attributes. It does not read CSS variables from the container. The CSS variables
  written in v60 are for DOM-side consumers, not for Sigma itself.
- v60 does not replace the v59 live-update effect. Both are necessary: v59's `sigma.setSetting()`
  calls update Sigma's rendering; v60's `style.setProperty()` calls update the DOM-observable state.

### Risk assessment for v60

**Low risk.** Writing CSS custom properties to a DOM element is a read-only operation from Sigma's
perspective. No Sigma state is changed. No React render is triggered. The worst case is that
the variables are written but never consumed — a no-op.

**Naming decision for v60.** The naming convention is already established by THEME_ENGINE.md:
canonical path dot-notation converts to dashes → `graph.node.fill` → `--lw-graph-node-fill`.
No new naming decisions are required.

**Scope question for v60.** Recommend writing to `document.documentElement` (`:root`) rather
than the Sigma container element. Rationale: the AppShell variables (`--lw-app-background`, etc.)
are on `<main>`, accessible via CSS cascade to all descendants. Writing graph variables to the
container scopes them too narrowly — `BookmarkLayer` and other overlays at sibling DOM positions
could not read them. Writing to `:root` makes them universally accessible, consistent with the
THEME_ENGINE.md spec.

### v60 prerequisite

v60 has no implementation prerequisite other than v59 completing. Once `resolvedGraphTokens` is
sourced from `resolveThemeTokenPath` (v59 gap B closure), v60 simply mirrors those resolved values
to CSS. The values are already correct — v60 adds the CSS mirror.

---

## 19. Promotion Path Extended

The full chain with v59 inserted and v60 projected:

```
v49  Graph Visual Theme Mapping Contract
     → Static mapping registry. Metadata only.

v51  Graph Theme Runtime Application Contract
     → Runtime lifecycle: preset → token paths → CSS vars → DOM → Sigma CSS cascade

v53  Graph Theme Token Value Preview Contract
     → Read-only diagnostic surface

v55  Graph Theme Application Contract
     → DOM wrapper layer. No direct Sigma API.

v57  Graph Theme Token Value Application Contract
     → Token value resolution pipeline. Canonical path enforcement declared.

v59  Graph Theme First Value Application Contract            ← CURRENT
     → Live Sigma settings update on theme change.
     → resolveThemeTokenPath as authoritative source for 8 primary graph colors.
     → Override storage propagation to graph Sigma surfaces.

v60  [PLANNED] Graph Theme CSS Variable Bridge
     → Write --lw-graph-node-fill et al to :root on theme change.
     → Complete THEME_ENGINE.md CSS custom property spec.
     → Enables CSS consumer access to current graph theme colors.
```

Beyond v60, future contracts may address:
- Full canonical path coverage for secondary/tertiary interaction colors
- Audio-reactive color override system (requires Motion Safety gate + contract)
- Per-node theme override (requires source adapter contract per GRAPH_VISUAL_POLICY.md)
- Custom WebGL renderer with theme-aware color injection

---

## 20. Known Constraints and Risks

### 20a. Sigma version dependency

The `sigma.setSetting()` API is the stable Sigma v3 settings mutation method. It is used
in the existing codebase (see `SigmaGraphView.tsx` lines 1025, 1033 for `edgeLabelSize` and
`labelSize` live-update patterns). The v59 live-update pattern directly parallels the existing
label size live-update effects — there is no new API surface introduced.

### 20b. colorSuggestionEngine interaction

Post-v88b.0.1, `colorSuggestionEngine.pick()` assigns per-node colors at build time. These
are stored in `attrs.raw.color` and read by `resetGraphStyles`:

```typescript
const clusterColor = (attrs.raw?.color as string) ?? tokens.nodeColor.default;
```

The engine-assigned colors take precedence over `tokens.nodeColor.default` for nodes that have
them. This means `graph.node.fill` controls the fallback color for nodes without engine
assignments, but the engine's picks dominate when present.

This is correct behavior. The color suggestion engine picks are theme-aware (they read `themeId`
at build time). Engine colors and canonical token colors are complementary, not competing.

The v59 live-update effect updates `defaultNodeColor` — Sigma's own fallback. This is the
color Sigma renders for nodes that Sigma internally hasn't processed through its render pipeline
yet. It does not override the graph attribute `color` set by style policy. The precedence order
remains: `attrs.color` (set by style policy) > `defaultNodeColor` (Sigma setting).

### 20c. Double refresh risk

After v59, two effects fire when `resolvedTokens` changes:
1. Selection styling effect → `sigma.refresh()`
2. Live-update effect → `sigma.refresh()`

Sigma v3's `refresh()` schedules a render via `requestAnimationFrame`. Multiple `refresh()`
calls in the same task batch collapse into a single frame. No visual stutter or double-draw
occurs. This is confirmed by the existing pattern: `edgeLabelFontSize` changes trigger both
`sigma.setSetting("edgeLabelSize", ...)` + `sigma.refresh()` (line 1025) AND the selection
effect fires with `edgeLabelFontSize` in its dep array — two refreshes for one change, working
correctly.

### 20d. ResolvedGraphVisualTokens type compatibility

The `ResolvedGraphVisualTokens` type (in `graphVisualTokens.ts`) requires string values for
color fields. `resolveThemeTokenPath` returns `ThemeTokenValue` which is `string | number`.
For the 8 primary color entries, the values are always strings (hex or rgba). The type assertion
`as string` is needed in `resolveGraphVisualTokens`. This is safe because:
- All graph color canonical paths resolve to string values in every built-in preset
- The tier-walk validator hard-throws if any canonical path returns a non-string value for
  a path that's expected to be a color
- The fallback chain (§ 14) provides a static string if resolution returns empty

---

## 21. Dependencies

### Runtime dependencies (no change in v59)

v59 makes no new runtime dependencies. The functions it calls (`resolveThemeTokenPath`,
`sigma.setSetting`) are already present in the codebase.

### Logical dependencies

| This contract depends on | Reason |
|--------------------------|--------|
| `contract.graph.theme.token.value.application` (v57) | v59 completes the application pipeline v57 defined as governance only |
| `theme.token.path.map` | Canonical path names (`graph.node.fill` etc.) are defined there |
| `theme.engine` | `resolveThemeTokenPath` is the resolver the engine doc specifies |
| v88c CSS variable migration | Canonical naming convention in place; v59 respects same naming pattern |
| v88b.0.1 colorSuggestionEngine | v59 must not break engine-assigned node colors (§ 20b) |

---

## 22. Pre-Implementation Checklist

Before beginning v59 implementation work, verify:

- [ ] `npm run typecheck` passes clean on main branch
- [ ] `resolveThemeTokenPath` returns a non-empty string for `"graph.node.fill"` in all six
      built-in themes (can be verified with a one-off test)
- [ ] `window.__lwSigma` is accessible in Playwright context (confirmed via existing E2E tests
      that use it)
- [ ] `sigma.setSetting("defaultNodeColor", ...)` does not throw in Sigma v3 (confirmed:
      existing `edgeLabelSize` and `labelSize` update effects use the same API)

---

## 23. Verification Checklist

After v59 implementation, all of the following must pass:

**Automated:**
- [ ] `npm run typecheck` — 0 errors
- [ ] `tests/e2e/v59-graph-theme-first-value-application.spec.ts` — Tests 1, 2, 3 pass
- [ ] `tests/e2e/v88b01-engine-graph-integration.spec.ts` — all pass (colorSuggestionEngine not broken)
- [ ] `tests/e2e/v88c-css-variable-canonical.spec.ts` — all pass (CSS variable writes unchanged)
- [ ] `tests/e2e/v86c-tile-system.spec.ts` — all pass (unrelated, no regression)

**Manual:**
- [ ] Switch from Solar Plasma to Agartha Dream → node colors visibly change to that theme's
      node fill color without graph rebuild (no layout reset, no camera reset)
- [ ] Switch back to Solar Plasma → node colors restore
- [ ] `window.__lwSigma.getSetting("defaultNodeColor")` in browser console reflects active
      theme's node fill color before AND after theme switch
- [ ] colorSuggestionEngine-assigned nodes retain their engine-assigned colors (not overridden
      by the live-update effect)

---

## Notes

This contract was authored in v88d as a planning document. Implementation (v59 code pass)
is a separate future arc. The contract status is "accepted" indicating the design is approved
for implementation — it is not yet "implemented" in the codebase.

The implementation arc for v59 should target `src/themes/themeTokens.ts`,
`src/app/AppShell.tsx`, and `src/graph/renderers/sigma2d/SigmaGraphView.tsx` only.
Scope is deliberately narrow: three files, one new effect, one function signature update.
