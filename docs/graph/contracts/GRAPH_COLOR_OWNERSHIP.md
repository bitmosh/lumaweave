---
id: domain.graph.color.ownership
title: "Graph Color Ownership Contract"
type: contract
domain: graph
cluster: azure
agent_readable: true
include_in_self_graph: true
references:
  - domain.graph.sigma.rendering
  - domain.theme.token.system
tags: [graph, color, ownership, contract, v103]
---

# Graph Color Ownership Contract

**Status:** canonical (v103.0.0) — re-derived from `graphStylePolicy.ts` + `buildGraphologyGraph.ts` actual behavior. Supersedes the previously-referenced `GRAPH_COLOR_OWNERSHIP.md` which was absent from the tree.

---

## Priority chain (highest priority wins)

The following hierarchy governs which color a node or edge displays. The style layer in `graphStylePolicy.ts` already implements this correctly; v103 writes only into the layer(s) below and must not disrupt the chain.

### 1. Selection / hover overlay (highest)

`applySelectedNodeStyles`, `applySelectedEdgeStyles`, and hover handlers (lines ~102-207 in `graphStylePolicy.ts`) apply `tokens.nodeColor.selected|hover|secondary|tertiary` etc. Theme-driven, temporary. Always overrides everything below.

**v103 must not:** assign cluster colors in a way that suppresses or competes with selection/hover state.

### 2. Per-element `raw.color` (persistent per-element color)

`resetGraphStyles` (line 43 in `graphStylePolicy.ts`) sets:
- node color = `attrs.raw?.color ?? tokens.nodeColor.default`
- edge color = `rawColor ?? tokens.edgeColor.default`

`raw.color` is read FIRST and is the persistent per-element color. **This is where cluster color belongs** — set by the adapter at build time via `buildGraphologyGraph`, read by the style layer on every reset.

**v103.0.2 will:** populate `raw.color` per node from `resolveClusterColor(node.cluster, mode)` inside `buildGraphologyGraph`. The existing style layer already carries it correctly.

### 3. Theme default (fallback only)

`tokens.nodeColor.default` / `tokens.edgeColor.default` — theme-resolved via AppShell's `resolveGraphVisualTokens(themeTokens.graph, {...})`. Applies when `raw.color` is absent (nodes with no cluster, edges before v103.0.3).

---

## Invariants — violation re-breaks color (learned from regression history)

1. **No `forEachNode(setAttribute("color"))` outside the style policy.** The only place that sets element colors in bulk is `resetGraphStyles`. Ad-hoc global color writes conflict with the priority chain.
2. **Selection/hover overlay always wins.** Cluster color is set at `raw.color` (layer 2), which is below selection (layer 1). The style policy enforces this; don't bypass it.
3. **`raw.color` is the build-time property.** Set it in the adapter (`buildGraphologyGraph`) when the node/edge is constructed. Do not write it in a `useEffect` or on theme change — that's the hook that caused past regressions.
4. **Theme tokens are FALLBACK for node color.** Nodes without a cluster fall back to `tokens.nodeColor.default`. Themes own edges + chrome + the fallback; cluster identity drives the primary node color.
5. **No global color mutation on theme change.** Theme change triggers `applyGraphStylePolicy` via the style layer — not a rebuild. To recolor on theme/mode change, re-resolve `raw.color` per-element and call `resetGraphStyles` (v103.0.4). This is distinct from triggering `buildGraphologyGraph` (which is expensive and keyed to `[nodes, edges]` changes, not theme changes).

---

## The current disconnects (pre-v103 state, for context)

These are WHY the graph shows incoherent colors. The style layer is already correct; the problems are upstream of it.

| Disconnect | Location | Status |
|---|---|---|
| Node `raw.color` is never set from the node's `cluster` | `buildGraphologyGraph.ts:90`, `165`, `179-201` | Fixes in v103.0.2 |
| `cluster-colors.json` palette never consulted | `buildGraphologyGraph.ts` | Fixes in v103.0.1+.0.2 |
| Edges hardcode `rgba(100,130,180,0.55)` literal, ignore theme | `buildGraphologyGraph.ts:111` | Fixes in v103.0.3 |
| `graphVisualTokens` constant is static Solar-Plasma ramp, not live theme | `graphVisualTokens.ts:168-175` | Fixes in v103.0.4 |
| Theme change does not recolor nodes (rebuild effect keyed to `[nodes, edges]` only) | `SigmaGraphView.tsx` build effect | Fixes in v103.0.4 |

---

## The cluster-color mapping abstraction (v103 design — locked pending D1-D4 sign-off)

Node color is a function of the node's `cluster`, resolved through a swappable mode-based mapping:

```ts
type ClusterColorMode =
  | { kind: "semantic" }                              // default: cluster-colors.json domain colors
  | { kind: "mono-shades"; baseHue: string; steps: number }  // one hue, N shades per cluster index
  | { kind: "custom"; map: Record<string, string> }   // explicit per-cluster overrides
;

resolveClusterColor(cluster: string, mode: ClusterColorMode): string
```

**Default mode = `semantic`:** reads `docs/_meta/cluster-colors.json`. Colors are **absolute** (stable across themes). Cluster identity does not shift with the active theme. Themes own edges + chrome + the fallback; cluster color is the node's domain identity.

Nodes with no cluster (or unknown cluster) fall back to `tokens.nodeColor.default` (theme-driven fallback, layer 3 above).

Mode + custom map persists via settings (`settings.graph.clusterColorMode`), scoped as a new `cluster-color` override scope in the theme override storage.

---

## Related contracts

- `GRAPH_RENDERER_INTERFACE_CONTRACT.md` — Sigma render interface
- `GRAPH_THEME_APPLICATION_CONTRACT.md` — how theme tokens reach the renderer
- `FIRST_GRAPH_RUNTIME_MUTATION_CONTRACT.md` — runtime mutation rules
- `docs/_meta/cluster-colors.json` — the semantic cluster palette (source of truth for `semantic` mode)
