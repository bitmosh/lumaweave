# GWells v0.2 — Profile Apply Modes and Override Semantics

**Status:** Draft  
**Purpose:** Define exactly how GWells applies layout profiles, seed layouts, node family maps, detected-type overrides, selected-node overrides, pins, reseeding, and reset behavior.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_PROFILE_APPLY_MODES_AND_OVERRIDE_SEMANTICS.md`  
**Replaces:** Nothing yet. New implementation/behavior contract doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`
- `GWELLS_UI_CONTROL_MODEL.md`

---

## 1. Summary

GWells v0.2 introduces profile-level layout control, but profile application must be predictable.

Users should be able to:

- apply a full layout profile
- change only the seed layout
- change only the node family map
- reassign all nodes of a family
- reassign all nodes of a detected source type
- reassign one selected node
- pin or elastic-pin nodes
- reset specific override layers
- preserve or discard current positions intentionally

This document defines the apply modes and override resolution order that make those behaviors safe.

---

## 2. Core design goal

Every visible layout change should answer four questions:

```txt
What changed?
What stayed the same?
Did the graph reseed?
Can the user undo/reset it?
```

GWells should avoid surprising users with hidden full-layout resets.

A profile apply should be intentional.

A family override should be scoped.

A selected-node override should be local.

A reset should be reversible when possible.

---

## 3. Apply mode vocabulary

```ts
export type GWApplyMode =
  | "full-profile"
  | "seed-layout-only"
  | "family-map-only"
  | "single-family"
  | "detected-node-type"
  | "selected-node"
  | "parameter-preset-only"
  | "interaction-set-only"
  | "reset-overrides";
```

---

## 4. Override state

```ts
export interface GWProfileOverrideState {
  profileId: string;

  seedLayoutOverrideId?: string;
  nodeFamilyMapOverrideId?: string;
  interactionSetOverrideId?: string;
  parameterPresetOverrideId?: string;

  familyWellOverrides?: Partial<Record<GWNodeFamily, string>>;
  detectedTypeWellOverrides?: Record<string, string>;
  nodeWellOverrides?: Record<string, string>;

  pinnedNodeIds?: string[];
  elasticPinnedNodeIds?: string[];
  hiddenFamilies?: GWNodeFamily[];
}
```

The override state is layered on top of the active profile. It should be serializable later, but v0.2 does not require persistence.

---

## 5. Resolution order

Well type resolution must be deterministic.

For any node, resolve well type in this order:

```txt
1. Selected-node override
2. Detected source type override
3. Node family override
4. Active profile family map
5. Universal fallback family map
6. unknown → gwells.well.document-orbit
```

This means more specific user intent always wins over broader defaults.

---

## 6. Resolution examples

### 6.1 Normal profile behavior

```txt
Node:
  family: document

Profile family map:
  document → gwells.well.document-orbit

Resolved:
  gwells.well.document-orbit
```

### 6.2 Family override

```txt
Node:
  family: document

Profile family map:
  document → gwells.well.document-orbit

User family override:
  document → gwells.well.semantic-cluster

Resolved:
  gwells.well.semantic-cluster
```

### 6.3 Detected-type override

```txt
Node:
  family: document
  detectedType: markdown-note

Family override:
  document → gwells.well.document-orbit

Detected-type override:
  markdown-note → gwells.well.topic-hub

Resolved:
  gwells.well.topic-hub
```

### 6.4 Selected-node override

```txt
Node:
  id: note.daily-2026-06-10
  family: document
  detectedType: markdown-note

Detected-type override:
  markdown-note → gwells.well.document-orbit

Selected-node override:
  note.daily-2026-06-10 → gwells.well.bridge-node

Resolved:
  gwells.well.bridge-node
```

---

## 7. Apply mode behavior

### 7.1 `full-profile`

Applies a complete profile.

Changes:

- active profile ID
- seed layout
- family map
- interaction set
- parameter preset

Default behavior:

```txt
reseed: true
preserve pins: true
preserve selected-node overrides: false, unless requested
preserve family overrides: false, unless requested
preserve detected-type overrides: false, unless requested
```

Use when:

```txt
User clicks a recommended layout card.
User intentionally switches the graph's interpretation.
```

UI language:

```txt
Apply Knowledge Garden
Apply Document Library
Use Semantic Constellation
```

Warning behavior:

- warn if imported positions will be overwritten
- warn if current overrides will be cleared
- warn if profile is experimental
- warn if graph is large and profile may be expensive

---

### 7.2 `seed-layout-only`

Changes only the opening arrangement.

Changes:

- seed layout ID
- seed positions
- x/y/z positions, depending on reseed mode

Preserves:

- active profile
- family map
- interaction set
- parameter preset
- node/family/detected-type overrides
- pins, unless explicitly reset

Default behavior:

```txt
reseed: true
preserve pins: true
preserve overrides: true
```

Use when:

```txt
The current interpretation is right, but the shape is wrong.
```

UI language:

```txt
Try a different shape
Reseed as hierarchy
Reseed as constellation
Preserve behavior, change arrangement
```

---

### 7.3 `family-map-only`

Changes the family-to-well mapping.

Changes:

- node family map
- resolved node→well assignments

Preserves:

- seed layout
- active profile, unless map is applied as a profile override
- interaction set
- parameter preset
- pins
- selected-node overrides by default

Default behavior:

```txt
reseed: optional
preserve pins: true
preserve selected-node overrides: true
clear family overrides: true, if replacing the whole family map
```

Use when:

```txt
The graph shape is fine, but node roles should behave differently.
```

UI language:

```txt
Use Knowledge Garden family behavior
Use Document Library family behavior
Treat this graph like a document library
```

---

### 7.4 `single-family`

Changes the well assignment for all nodes with one normalized family.

Changes:

- one entry in `familyWellOverrides`

Preserves:

- all other profile layers
- seed layout
- pins
- selected-node overrides

Default behavior:

```txt
reseed: false
preserve pins: true
preserve selected-node overrides: true
```

Use when:

```txt
User wants every concept, document, asset, etc. to behave differently.
```

UI language:

```txt
Make all documents semantic clusters
Make all concepts topic hubs
Make all assets satellites
Apply to all nodes in this family
```

---

### 7.5 `detected-node-type`

Changes the well assignment for all nodes matching an ingestion-specific type.

Changes:

- one entry in `detectedTypeWellOverrides`

Preserves:

- all other profile layers
- family overrides
- selected-node overrides
- pins

Default behavior:

```txt
reseed: false
preserve pins: true
preserve selected-node overrides: true
```

Use when:

```txt
User wants all markdown notes, PDF pages, domains, imports, etc. to behave differently.
```

UI language:

```txt
Apply to all Markdown notes
Apply to all PDF pages
Apply to all web domains
Apply to all imported symbols
```

---

### 7.6 `selected-node`

Changes the well assignment for one node.

Changes:

- one entry in `nodeWellOverrides`

Preserves:

- everything else

Default behavior:

```txt
reseed: false
preserve pins: true
```

Use when:

```txt
User curates one important node.
```

UI language:

```txt
Make this a topic hub
Make this a bridge
Make this an anchor
Reset this node
```

---

### 7.7 `parameter-preset-only`

Changes physics tuning without changing interpretation.

Changes:

- parameter preset
- resolved engine/dialect config

Preserves:

- seed layout
- family map
- interaction set
- overrides
- pins

Default behavior:

```txt
reseed: false
preserve pins: true
```

Use when:

```txt
Graph meaning is right, but motion/spacing/stability feels wrong.
```

UI language:

```txt
Make layout calmer
Make layout more spacious
Make layout more compact
Increase relationship pull
Increase hierarchy pull
```

---

### 7.8 `interaction-set-only`

Changes which relationships influence physics.

Changes:

- interaction set

Preserves:

- seed layout
- family map
- parameter preset
- overrides
- pins

Default behavior:

```txt
reseed: false
preserve pins: true
```

Use when:

```txt
User wants links, citations, dependencies, or semantic similarity to matter more/less.
```

UI language:

```txt
Let backlinks shape the layout
Prioritize containment
Prioritize references
Use semantic clustering forces
```

---

### 7.9 `reset-overrides`

Clears one or more override layers.

Scopes:

```ts
type GWResetScope =
  | "selected-node"
  | "all-nodes"
  | "family"
  | "detected-type"
  | "pins"
  | "layout"
  | "parameters"
  | "all";
```

Default behavior:

```txt
reseed: false, unless layout reset changes seed layout
preserve pins: true, unless pins are reset
```

Use when:

```txt
User wants to return to profile defaults.
```

UI language:

```txt
Reset selected node
Reset family overrides
Reset detected-type overrides
Reset pins
Reset layout changes
Reset to profile defaults
```

---

## 8. Reseed semantics

Reseeding is one of the most visually disruptive actions. It must be explicit.

### 8.1 Reseed modes

```ts
export type GWReseedMode =
  | "none"
  | "full"
  | "preserve-pins"
  | "preserve-user-positions"
  | "soft";
```

### 8.2 Mode meanings

```txt
none:
  Do not rerun seed layout. Only update behavior.

full:
  Rerun seed layout for all nodes.

preserve-pins:
  Rerun seed layout, but do not move pinned nodes.

preserve-user-positions:
  Rerun seed layout only for nodes not manually moved or pinned.

soft:
  Update seed anchors but interpolate or let physics drift toward new seeds.
```

### 8.3 v0.2 recommendation

Initial implementation should support:

```txt
none
full
preserve-pins
```

Defer:

```txt
preserve-user-positions
soft
```

until position provenance exists.

---

## 9. Pin semantics

### 9.1 Hard pin

A hard-pinned node is fixed.

Behavior:

```txt
node does not move during physics
node keeps position during reseed if preserve-pins is true
node may still visually connect through edges
```

Use for:

```txt
manual curation
important anchors
imported positions user wants to preserve
```

### 9.2 Elastic pin

An elastic-pinned node has high seed adherence but can still move.

Behavior:

```txt
node resists movement
strong forces can displace it
node drifts back toward pinned/seeded position
```

Use for:

```txt
soft anchors
important topics
curated clusters
layout breathing room
```

### 9.3 v0.2 recommendation

Support hard pins first.

Represent elastic pins in the override state, but defer actual physics behavior until seed-adherence override support exists.

---

## 10. Imported position semantics

Graphs imported from Cytoscape or other positioned sources may already contain meaningful x/y positions.

If `hasExistingPositions` is high:

- recommend Imported Position Preserve
- warn before full reseed
- offer Universal Balanced as safe fallback
- allow user to intentionally overwrite positions

Warning text:

```txt
This graph already has imported positions. Applying this layout may replace them.
```

---

## 11. Undo and history

v0.2 does not need full undo history inside GWells, but the API should support LumaWeave undo later.

Every apply operation should be representable as a command:

```ts
export interface GWProfileApplyCommand {
  id: string;
  timestamp: number;
  mode: GWApplyMode;
  before: GWProfileOverrideState;
  after: GWProfileOverrideState;
  affectedNodeIds?: string[];
  description: string;
}
```

LumaWeave can store these commands in UI state.

---

## 12. Apply operation result

Every apply action should return a result object.

```ts
export interface GWApplyProfileResult {
  ok: boolean;
  mode: GWApplyMode;

  profileId: string;

  reseeded: boolean;
  affectedNodeCount: number;

  warnings: string[];
  notes: string[];

  previousState?: GWProfileOverrideState;
  nextState: GWProfileOverrideState;
}
```

This allows UI to show clear feedback.

Examples:

```txt
Applied Knowledge Garden.
Reseeded 842 nodes.
Preserved 3 pinned nodes.
```

```txt
Made all documents semantic clusters.
Updated 214 nodes.
No reseed was performed.
```

---

## 13. Preview behavior

Before applying a destructive change, UI can request an apply preview.

```ts
export interface GWApplyProfilePreview {
  mode: GWApplyMode;
  affectedNodeCount: number;
  willReseed: boolean;
  willClearOverrides: boolean;
  willMovePinnedNodes: boolean;
  warnings: string[];
  summary: string;
}
```

Example summary:

```txt
This will apply Document Library, reseed 1,240 nodes, preserve 4 pinned nodes,
and clear 2 family overrides.
```

Preview is optional for v0.2 but strongly recommended for full-profile changes.

---

## 14. UI confirmation rules

Do not confirm every operation.

Confirm only when the operation is broad or destructive.

### 14.1 No confirmation needed

```txt
selected-node override
single-family override
parameter preset change
interaction set change
reset selected node
```

### 14.2 Confirmation recommended

```txt
full profile apply
full reseed
clear all overrides
overwrite imported positions
reset all pins
apply experimental profile
```

---

## 15. Status feedback

After each operation, show a concise status.

Examples:

```txt
Applied Knowledge Garden.
```

```txt
Changed all concept nodes to Topic Hub.
```

```txt
Reseeded with Hierarchical Containment. Pins preserved.
```

```txt
Reset selected node override.
```

Avoid exposing internal IDs unless in advanced/debug mode.

---

## 16. Advanced/debug mode

Advanced mode may show:

- active profile ID
- seed layout ID
- family map ID
- interaction set ID
- parameter preset ID
- override state
- affected node count
- raw well type IDs

Default mode should show friendly labels only.

---

## 17. Test checklist

### 17.1 Resolution tests

- selected-node override wins
- detected-type override beats family override
- family override beats profile family map
- profile family map beats universal fallback
- unknown resolves to document-orbit

### 17.2 Apply mode tests

- full-profile changes all profile layers
- seed-layout-only preserves family map
- family-map-only preserves seed layout
- single-family only changes one family override
- selected-node only changes one node override
- parameter-preset-only does not reseed by default
- interaction-set-only does not reseed by default

### 17.3 Pin tests

- preserve-pins reseed keeps pinned node positions
- reset pins clears pinned node IDs
- selected-node override does not remove pin

### 17.4 Warning tests

- imported positions produce warning on full reseed
- experimental profile produces warning
- clearing all overrides produces warning
- large graph expensive profile produces warning

---

## 18. Non-goals

This doc does not require:

- full undo implementation
- animated morphing between profiles
- soft reseed interpolation
- persistent profile storage
- elastic pin physics implementation
- UI component implementation
- collaborative state syncing

These are future work.

---

## 19. Success criteria

This apply/override system is successful when:

- users can safely apply profiles
- users understand what changed
- family and node overrides are deterministic
- reseeding is explicit
- pins are respected
- broad destructive changes show warnings
- advanced complexity remains available but hidden
- LumaWeave can build calm UI controls on top of predictable behavior

---

## 20. Guiding principle

A layout change should never feel like the graph betrayed the user.

Every apply operation should be scoped, explainable, and recoverable.
