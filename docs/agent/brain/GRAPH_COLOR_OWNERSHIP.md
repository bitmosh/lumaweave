---
id: contract.graph.color.ownership
title: Graph Color Ownership Contract
type: contract
status: current
domain: graph
subdomain: color
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: 2026-05-09
tags:
  - bandit
  - contract
  - color
  - ownership
  - graph
  - sigma
  - style-policy
last_pass: vP-Forensics-2
---

# Graph Color Ownership Contract

**Effective Date:** 2026-05-07 (P1·S3)

This contract documents the color priority chain learned through regression debugging. Violations cause color rendering bugs where adapter-set colors are overwritten by global reset cycles.

---

## PRIORITY ORDER (highest wins)

### 1. Selection/Hover Overlay (Highest Priority)
- **Source:** `graphStylePolicy` in `SigmaGraphView.tsx`
- **Colors:** Gold (selected node), Purple (selected edge), Blue (hover node)
- **Applies to:** `node.raw.color` and `edge.raw.color` are temporarily overridden during selection/hover state
- **Scope:** Visual overlay only, does not mutate graph data

### 2. Per-Element `raw.color`
- **Source:** Graph adapters (e.g., `buildGraphologyGraph.tsx`)
- **Colors:** Cluster-aware RGBA values (e.g., `rgba(59, 130, 246, 0.6)`)
- **Applies to:** Every edge must have `raw.color` set by adapter
- **Scope:** Graph data model, persists across render cycles
- **Rule:** Adapter MUST set `raw.color` on every edge

### 3. Theme `edgeDefault` / `nodeDefault`
- **Source:** Theme tokens (`themePresets.ts` → `graphVisualTokens.ts`)
- **Colors:** Theme-specific fallback colors
- **Applies to:** Last resort fallback only when `raw.color` is missing
- **Scope:** Sigma config fallback, not a reset target
- **Rule:** Never used for edge color directly when `raw.color` exists

### 4. `graphVisualTokens` Static Defaults (Lowest Priority)
- **Source:** `graphVisualTokens.ts` static defaults
- **Colors:** Hardcoded fallback values
- **Applies to:** Never used for edge color directly
- **Scope:** Sigma config initialization only

---

## RULES

### Adapter Responsibility
- **Adapter MUST set `raw.color` on every edge**
- Cluster-aware colors should be RGBA for transparency support
- Example: `graph.setEdgeAttribute(edgeId, "raw.color", clusterColor)`

### Reset Policy Responsibility
- **`resetGraphStyles` MUST read `raw.color` first**
- If `raw.color` exists, use it as the reset default
- If `raw.color` is missing, fall back to theme tokens
- Never assume theme tokens override `raw.color`

### Global Mutation Ban
- **No useEffect may overwrite node/edge color globally**
- Only selection policy (`graphStylePolicy`) may override colors
- Any global color write causes regression
- Color changes must be per-element via `raw.color`

### Sigma Config Fallback
- **`resolvedTokens.edgeColor.default` is a Sigma config fallback only**
- Not a reset target
- Not a global color source
- Used only when Sigma initializes without edge colors

---

## Anti-Patterns (Do NOT Do These)

### Anti-Pattern 1: Global Color Reset Without Reading `raw.color`
```typescript
// BAD — overwrites adapter colors
graph.forEachNode((node) => {
  graph.setNodeAttribute(node, "color", themeColor);
});
```

### Anti-Pattern 2: Using Theme Tokens as Reset Target
```typescript
// BAD — ignores raw.color
const defaultColor = resolvedTokens.edgeColor.default;
graph.setEdgeAttribute(edgeId, "color", defaultColor);
```

### Anti-Pattern 3: useEffect Global Color Write
```typescript
// BAD — global mutation, breaks adapter colors
useEffect(() => {
  graph.forEachEdge((edge) => {
    graph.setEdgeAttribute(edge, "color", newColor);
  });
}, [newColor]);
```

---

## Correct Patterns

### Pattern 1: Adapter Sets `raw.color`
```typescript
// GOOD — adapter sets raw.color
graph.setEdgeAttribute(edgeId, "raw.color", clusterColor);
```

### Pattern 2: Reset Policy Reads `raw.color`
```typescript
// GOOD — reset reads raw.color first
const rawColor = edgeAttributes.raw as any;
const color = rawColor?.color ?? themeColor;
graph.setEdgeAttribute(edgeId, "color", color);
```

### Pattern 3: Selection Policy Overrides Temporarily
```typescript
// GOOD — selection overlay only
graph.setNodeAttribute(nodeId, "color", selectionColor);
// Restore on clear selection
```

---

## Debugging Color Issues

When colors appear wrong:

1. **Check `resetGraphStyles`** — Does it read `raw.color` first?
2. **Check adapter** — Does it set `raw.color` on every edge?
3. **Check for global useEffect** — Is there a global color write anywhere?
4. **Check Sigma config** — Is `resolvedTokens.edgeColor.default` being used as a reset target?

The issue is almost always in the reset cycle, not in the initial color assignment.

---

## Contract Enforcement

This contract is permanent. Any violation constitutes a color regression. When debugging color issues, trace the signal path from adapter → raw.color → reset policy → selection overlay. Never assume theme tokens override adapter-set colors.
