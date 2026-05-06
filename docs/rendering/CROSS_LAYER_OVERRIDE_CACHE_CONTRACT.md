---
id: contract.cross.layer.override.cache
title: Cross-Layer Override Cache Contract
type: contract
status: accepted
version: v73c
domain: rendering
cluster: blue
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - architecture.rendering.layers
  - contract.graph.theme.application
  - contract.grammar.lens
related:
  - contract.sigma.2d.layer
  - system.grammar.lens.current.state
tags: [rendering, cross-layer, override, cache, grammar-lens, theme, contract]
---

# Cross-Layer Override Cache Contract

## Purpose

When a user edits a visual element via the Grammar Lens overlay
while one rendering layer is active, that change must eventually
propagate to other rendering layers when the user switches to them.

This contract defines how that propagation works safely.

---

## The Core Problem

A user is in 2D Sigma mode. They hold the Grammar Lens key and
click a node to change its fill color from blue to teal. The
change applies immediately to the 2D layer. Then they switch to
3D mode. What happens to the teal fill?

Without a cache: the 3D layer renders the node in its default
color, ignoring the user's edit. The user's customization is lost.

With a naive cache: the raw CSS hex value `#4fd9c8` is stored and
blindly applied to the 3D layer, which may interpret it correctly
or may not, depending on how the 3D renderer handles color.

With this contract: the canonical token path change is stored.
Each layer's handle resolver interprets it correctly.

---

## Cache Model

### What is Stored

The cache stores **canonical token path changes**, not raw values,
not CSS, not layer-specific properties.

```typescript
interface OverrideCacheEntry {
  handlePath: string;          // e.g. "graph.node.fill"
  tokenPath: string;           // e.g. "graph.node.fill" (canonical)
  value: string;               // e.g. "#4fd9c8"
  scope: OverrideScope;        // "instance" | "type" | "global"
  targetId?: string;           // node/edge ID for instance scope
  targetType?: string;         // handle type for type scope
  sourceLayer: RenderingLayer; // which layer made the edit
  timestamp: number;
  status: "pending" | "applied" | "failed" | "blocked";
}

type RenderingLayer = "sigma-2d" | "hyper-3d" | "flat";
type OverrideScope = "instance" | "type" | "global";
```

### Cache Lifecycle

```
User edits element via Grammar Lens (active layer: 2D)
  → override applied to 2D layer immediately
  → cache entry created for each inactive layer:
      { handlePath, tokenPath, value, scope, sourceLayer: "sigma-2d",
        status: "pending" }

User switches to 3D layer:
  → active layer changes to "hyper-3d"
  → pending cache entries for "hyper-3d" are flushed:
      for each pending entry:
        1. Validate canonical token path (must exist in token registry)
        2. Run handle resolver for 3D layer
        3. Pass result through Motion Safety gate
        4. If gate passes: apply, mark entry "applied"
        5. If gate blocks: soften or block, mark entry "blocked",
           surface warning to user
  → cache entries for "sigma-2d" remain in cache (still pending
     for future 2D → 3D switches after further 2D edits)
```

---

## Flush Sequence (Detailed)

```
1. PENDING ENTRY COLLECTION
   Gather all cache entries with status "pending" for the
   newly-activating layer.

2. TOKEN PATH VALIDATION
   For each entry: verify tokenPath exists in canonical token
   registry (themeTokenPaths.ts). If not found: mark "failed",
   log warning, skip. Do not apply unknown tokens.

3. HANDLE RESOLUTION
   For each valid entry: call the target layer's handle resolver
   with (handlePath, tokenPath, value, scope, targetId?).
   The resolver returns a layer-specific property + value pair
   or null if the handle is not supported in this layer.

4. MOTION SAFETY GATE
   For each resolved property: pass through the Motion Safety
   gate. Check:
   - Is this handle classified in motionSafetyRegistry?
   - Is the user's reduce-motion preference enabled?
   - What is the epilepsy risk classification?
   Apply gate decision (allow / soften / block).

5. APPLICATION
   Apply allowed/softened property changes to the newly-active layer.
   Mark applied entries as "applied".
   Mark blocked entries as "blocked" with reason.

6. USER NOTIFICATION (if any blocked)
   If any entries were blocked by Motion Safety gate, surface a
   passive notification: "Some visual changes were adjusted for
   motion safety in this rendering layer."
```

---

## Scope Behavior

### Instance Scope (default)
Change applies to a specific node or edge by ID.

Cross-layer: the same node/edge ID must exist in the target layer.
If it does not exist (e.g., the 3D layer uses different entity
mapping), the entry is marked "failed" with a cross-reference
warning.

### Type Scope (future — requires GLOBAL_ELEMENT_UPDATE_CONTRACT)
Change applies to all elements of the same handle type.

Cross-layer: the target layer applies the change to all elements
of the matching handle type in that layer.

### Global Scope (future — requires GLOBAL_ELEMENT_UPDATE_CONTRACT)
Change applies to all elements matching a pattern.

Cross-layer: same as type scope, broader pattern.

---

## What the Cache Does NOT Do

- Does not store raw CSS values
- Does not store layer-specific properties (Sigma API params, etc.)
- Does not apply changes to Sigma internals
- Does not bypass the Motion Safety gate
- Does not persist across app restarts (session-only, until a
  storage contract is explicitly written)
- Does not automatically merge conflicting edits from two
  different agents (multi-agent: human resolves conflicts)

---

## Forbidden Boundaries

- No cache entry may reference a non-canonical token path
- No cache flush may skip Motion Safety gate
- No cache flush may write CSS variables directly
- No cache flush may call Sigma API without going through the
  contracted DOM-wrapper pathway
- No cache entry from one agent's session overwrites another
  agent's live edits without human review

---

## Implementation Preconditions

Before this contract can be implemented:

1. Grammar Lens must be using canonical token paths for all edits
   (not raw CSS values or Sigma-specific properties)
2. Each rendering layer must have an implemented handle resolver
3. Motion Safety gate must be running per-effect (v60 accepted)
4. The canonical token registry must be queryable at runtime

v74 is the earliest reasonable implementation target, after the
Source Adapter OS foundation is in place. More likely v80+.

---

## Acceptance Criteria (for future implementation)

When this contract is implemented:
- Grammar Lens edits in 2D layer must appear in 3D layer on switch
- Token path validation must reject unknown paths
- Motion Safety gate must run on every flush
- Blocked entries must surface passive user notification
- Cache must not persist after app restart (session-only)
- Playwright tests must prove: edit in 2D → switch to 3D → node
  color matches edit (or softened version if motion-gated)
