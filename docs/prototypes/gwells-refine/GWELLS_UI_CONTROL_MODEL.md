# GWells v0.2 — UI Control Model

**Status:** Draft  
**Purpose:** Define how LumaWeave should expose GWells v0.2 layout profiles, recommendations, node family mappings, macro physics controls, and overrides without overwhelming users.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_UI_CONTROL_MODEL.md`  
**Replaces:** Nothing yet. New UI/product planning doc.  
**Related:**
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_SEED_LAYOUTS_V0_2.md`

---

## 1. Summary

GWells v0.2 introduces a powerful profile system, but most users should not have to understand profiles, seed layouts, node families, well types, interaction sets, or parameter presets directly.

The UI should make GWells feel like a guided layout assistant.

The system can remain complex internally.

The controls should feel calm externally.

Primary goal:

```txt
Let users choose visual intent, not physics internals.
```

---

## 2. Design principle

Do not simplify GWells by removing capability.

Simplify GWells by layering capability.

Recommended control ladder:

```txt
Guided recommendation
  → layout profile
  → macro tuning
  → family remapping
  → selected-node override
  → advanced raw physics
```

Most users should live at the top.

Power users can descend when needed.

---

## 3. UI modes

GWells should expose three main modes inside LumaWeave.

```txt
Guided Mode
Matrix Mode
Composer Mode
```

Each mode serves a different level of user intent.

---

## 4. Guided Mode

### 4.1 Purpose

Guided Mode is the default.

It shows the best profile recommendations for the loaded graph and lets the user apply one safely.

The user should not need to know what seed layout, family map, interaction set, or parameter preset is being used.

### 4.2 User-facing layout

Example:

```txt
Layout Guide

This graph looks like:
- Mostly hierarchical
- Medium-size
- Strong containment structure
- Some cross-links

Recommended:
★ Hierarchical Containment
★ Knowledge Garden
  Universal Balanced

[Apply Best Fit] [Show Why] [Explore More]
```

### 4.3 Recommendation card

Each recommendation card should show:

```txt
Profile name
Short summary
Best-for tags
Confidence / fit score
Primary visual promise
Warnings, if any
Apply button
Show Why button
```

Example:

```txt
Knowledge Garden
Best for notes, tags, and backlinks.
Fit: 91%

Keeps note clusters readable while letting backlinks pull related ideas together.

[Apply] [Show Why]
```

### 4.4 Default recommendation rules

Guided Mode should:

- show no more than 3 primary recommendations
- always keep Universal Balanced available
- hide planned profiles by default
- show experimental profiles only if enabled
- include warnings before destructive remapping
- preserve pins by default
- allow undo/reset after applying a profile

---

## 5. Matrix Mode

### 5.1 Purpose

Matrix Mode is for advanced users, debugging, and layout exploration.

It exposes the recommendation scores and tradeoffs behind Guided Mode.

### 5.2 User-facing layout

Example:

| Layout | Fit | Best For | Warning |
|---|---:|---|---|
| Hierarchical Containment | 94% | folders, depth, containers | cross-links secondary |
| Knowledge Garden | 86% | notes, backlinks, tags | hierarchy may loosen |
| Universal Balanced | 78% | safe fallback | less specialized |
| Semantic Constellation | 52% | embeddings/concepts | no semantic signals found |

### 5.3 Matrix columns

Recommended columns:

```txt
Profile
Fit score
Hierarchy strength
Relationship strength
Semantic strength
Scale tolerance
Best for
Warnings
Status
```

### 5.4 Expand row

An expanded matrix row should show:

```txt
Seed Layout
Node Family Map
Interaction Set
Parameter Preset
Reasons
Warnings
Apply options
```

Example:

```txt
Knowledge Garden

Seed Layout: Knowledge Garden
Family Map: Knowledge Garden
Interaction Set: Backlinks + Topic Clusters
Parameter Preset: Calm Relationship Pull

Reasons:
- 61% of documents have links.
- Tags/concepts were detected.
- Graph has moderate hierarchy and strong cross-linking.

Warnings:
- Folder structure will become secondary.
```

---

## 6. Composer Mode

### 6.1 Purpose

Composer Mode is for power users who want to build or modify a profile layer by layer.

It should expose the composable structure directly:

```txt
Seed Layout
Node Family Map
Interaction Set
Parameter Preset
Overrides
```

### 6.2 User-facing layout

Example:

```txt
Profile Composer

Seed Layout:        Knowledge Garden        [Change]
Node Family Map:    Obsidian Notes          [Change]
Interaction Set:    Backlinks + Topics      [Change]
Parameter Preset:   Calm / Stable           [Change]

[Apply] [Save as Custom Profile] [Reset]
```

### 6.3 Layer change behavior

Changing a layer should clearly indicate what will happen.

Examples:

```txt
Changing Seed Layout will reposition nodes.
Changing Node Family Map may reassign node behavior.
Changing Interaction Set changes which relationships affect physics.
Changing Parameter Preset changes tuning only.
```

### 6.4 Safe apply options

Composer Mode should support:

```txt
Apply full profile
Apply seed only
Apply family map only
Apply parameter preset only
Apply interaction set only
```

---

## 7. Macro controls

### 7.1 Purpose

Macro controls translate human intent into lower-level physics settings.

Users should not initially see raw values like spring stiffness, ideal distance, seed adherence, damping, or interaction strength.

### 7.2 Recommended macro controls

| Macro Control | Meaning |
|---|---|
| Structure | How strongly seeded structure is preserved |
| Spacing | How much room nodes/clusters get |
| Clustering | How strongly similar nodes group |
| Motion | How fluid or damped the graph feels |
| Relationship Pull | How strongly links/references affect layout |
| Hierarchy Pull | How strongly containment affects layout |
| Stability | How quickly the graph settles |

### 7.3 Macro slider labels

Use user-friendly labels rather than raw numbers.

Examples:

```txt
Structure: Loose ←→ Strict
Spacing: Compact ←→ Spacious
Clustering: Gentle ←→ Strong
Motion: Still ←→ Fluid
Relationship Pull: Subtle ←→ Dominant
Hierarchy Pull: Soft ←→ Strong
Stability: Exploratory ←→ Settled
```

### 7.4 Macro-to-physics mapping

Initial mapping can be approximate.

#### Structure

Increasing Structure should:

```txt
increase seedAdherence
increase containment spring strength
increase hierarchy interaction weights
reduce semantic drift
```

#### Spacing

Increasing Spacing should:

```txt
increase sibling repulsion
increase ideal distances
increase cluster-to-cluster separation
possibly increase center gravity slightly to prevent runaway drift
```

#### Clustering

Increasing Clustering should:

```txt
increase semantic/link attraction
increase topic-hub attraction
reduce same-cluster repulsion slightly
preserve enough collision/repulsion to avoid overlap
```

#### Motion

Increasing Motion should:

```txt
reduce damping
increase maxVelocity slightly
reduce convergence aggressiveness
allow visible settling movement
```

#### Relationship Pull

Increasing Relationship Pull should:

```txt
increase link/reference/citation spring strength
increase edge-weight sensitivity
reduce containment dominance slightly
```

#### Hierarchy Pull

Increasing Hierarchy Pull should:

```txt
increase parent-child spring strength
increase seed adherence for containers
increase depth consistency
reduce cross-link dominance slightly
```

#### Stability

Increasing Stability should:

```txt
increase damping
reduce maxVelocity
increase convergence sensitivity
reduce volatile interaction strengths
```

---

## 8. Family map table

### 8.1 Purpose

The family map table lets users inspect and hot-swap how families behave.

This should be visible in Guided Mode as a collapsible section and fully editable in Composer Mode.

### 8.2 User-facing layout

Example:

| Node Family | Current Behavior | Actions |
|---|---|---|
| Collection | Collection Anchor | Change |
| Document | Document Orbit | Change |
| Concept | Topic Hub | Change |
| Reference | Reference Thread | Change |
| Asset | Asset Satellite | Change |
| Unknown | Document Orbit | Change |

### 8.3 Change behavior

When changing a family, the UI should explain scope.

Example:

```txt
Change all Document nodes from Document Orbit to Semantic Cluster?

This affects 428 nodes.
The graph will reseed and settle again.

[Apply] [Cancel]
```

### 8.4 Suggested replacements

The dropdown should prioritize useful well types for the selected family.

Example for `document`:

```txt
Recommended:
- Document Orbit
- Semantic Cluster
- Bridge Node

Other:
- Topic Hub
- Section Band
- Annotation Satellite
```

Example for `concept`:

```txt
Recommended:
- Topic Hub
- Semantic Cluster
- Bridge Node

Other:
- Collection Anchor
- Reference Thread
```

---

## 9. Selected node override panel

### 9.1 Purpose

When a user selects a node, the UI should let them override that node without changing the whole layout.

### 9.2 User-facing layout

Example:

```txt
Selected Node

Title: Architecture Notes
Family: Document
Current behavior: Document Orbit
Source type: markdown-note

Quick actions:
[Make Topic Hub]
[Make Bridge Node]
[Make Semantic Cluster]
[Apply to all Documents]
[Apply to all markdown-note nodes]
[Reset Node Override]
```

### 9.3 Scope controls

Any override action should have clear scope options:

```txt
Only this node
All nodes in this family
All nodes with this detected source type
```

Example:

```txt
Make this node a Bridge Node?

Apply to:
(•) Only this node
( ) All Document nodes
( ) All markdown-note nodes
```

---

## 10. Apply/reseed/reset semantics

### 10.1 Apply full profile

Expected behavior:

```txt
resolve profile
apply seed layout
apply family map
apply interaction set
apply parameter preset
preserve pins if possible
preserve selected-node overrides only if user asks
restart/settle physics
```

### 10.2 Apply seed layout only

Expected behavior:

```txt
keep current family map
keep current interactions
keep current parameters
recompute seed positions
restart/settle physics
```

### 10.3 Apply family map only

Expected behavior:

```txt
keep current seed layout unless reseed is requested
update node→well assignments
rebuild resolved well params
restart/settle physics
```

### 10.4 Reset profile

Expected behavior:

```txt
remove current UI overrides
return to selected profile defaults
preserve graph data
preserve imported metadata
optionally preserve pins
```

### 10.5 Reset all GWells state

Expected behavior:

```txt
remove profile overrides
remove pins
remove seed positions
remove runtime physics state
return to Universal Balanced or source-recommended default
```

This should be a deliberate action, not a casual button.

---

## 11. Undo model

Every profile/family/override action should create a small undo snapshot.

Minimum undo state:

```ts
interface GWUILayoutUndoSnapshot {
  profileId: string;
  overrideState: GWProfileOverrideState;
  seedLayoutId: string;
  nodeFamilyMapId: string;
  interactionSetId: string;
  parameterPresetId: string;
  timestamp: number;
  label: string;
}
```

The UI should support at least one-step undo:

```txt
Profile changed to Knowledge Garden.
[Undo]
```

Later, LumaWeave can support an undo history.

---

## 12. Warning model

Some actions should warn before applying.

### 12.1 Destructive visual changes

Warn when:

```txt
changing full profile
changing family map for many nodes
resetting all overrides
clearing pins
switching away from imported-position preserve
```

### 12.2 Example warning

```txt
This will remap 1,284 nodes and reseed the graph.
Your data will not change, but the visual layout will reorganize.

[Apply Layout] [Cancel]
```

### 12.3 No warning needed

No warning needed for:

```txt
macro slider tuning
selected node temporary preview
opening advanced mode
show why
matrix inspection
```

---

## 13. Preview model

### 13.1 First version

Do not build expensive live previews first.

Use:

```txt
profile cards
static preview icon/shape
show why explanation
apply + undo
```

### 13.2 Later versions

Potential preview upgrades:

```txt
sampled mini graph preview
side-by-side layout preview
cached thumbnail after first use
ghosted target positions before apply
animated morph preview
```

---

## 14. Advanced mode

### 14.1 Purpose

Advanced Mode exposes raw GWells settings for power users.

It should not be the default.

### 14.2 Advanced sections

Recommended sections:

```txt
Engine
Well Types
Interactions
Seed Parameters
Convergence
Debug
```

### 14.3 Engine controls

Examples:

```txt
maxVelocity
frameBudgetMs
autoStart
scheduler mode
convergence threshold
```

### 14.4 Well type controls

Examples:

```txt
attractionStrength
siblingRepulsion
springStiffness
damping
idealDistance
centerGravity
seedAdherence
```

### 14.5 Interaction controls

Examples:

```txt
strength
range
idealDistance
requireEdge / predicate
edge type
weight attr
```

### 14.6 Debug display

Advanced mode should show:

```txt
current profile ID
seed layout ID
family map ID
interaction set ID
parameter preset ID
active override count
selected node resolved family
selected node resolved well type
active interactions for selected node
```

---

## 15. Empty/error states

### 15.1 No graph loaded

```txt
Load a graph to see layout recommendations.
```

### 15.2 Unknown graph type

```txt
This graph does not match a known source type yet.
Universal Balanced is recommended as a safe starting point.
```

### 15.3 No strong recommendation

```txt
No specialized layout clearly fits this graph.
Universal Balanced should provide the safest initial arrangement.
```

### 15.4 Very large graph

```txt
This graph is large. Stable/low-motion layouts are recommended first.
Advanced force-heavy layouts may be slower.
```

### 15.5 Imported positions detected

```txt
This graph includes imported positions.
You may want to preserve the original layout before trying physics-based profiles.
```

---

## 16. Suggested first UI panel structure

Recommended sidebar/card layout:

```txt
GWells Layout

[Guided] [Matrix] [Composer]

Best Fit
  Profile card

Also Good
  Profile card
  Profile card

Current Layout
  Profile: Universal Balanced
  Seed: Universal Balanced
  Family Map: Universal Balanced
  Tuning: Calm

Macro Controls
  Structure
  Spacing
  Clustering
  Stability

Node Families
  Collapsed table

Selected Node
  Context actions, if selected

Advanced
  Collapsed
```

---

## 17. Minimal v0 UI scope

The first UI implementation should include only:

```txt
Guided Mode profile cards
Show Why panel
Apply profile
Universal Balanced fallback
Current profile summary
Reset profile
One-step undo
```

Do not start with:

```txt
Composer Mode
full advanced controls
live preview thumbnails
custom profile saving
animated transitions
```

Add those after the data model and profile application behavior are stable.

---

## 18. Implementation order

Recommended UI implementation sequence:

1. Render current profile summary.
2. Render recommendation cards from `recommendProfilesForGraph()`.
3. Add Apply Profile button.
4. Add Show Why panel.
5. Add one-step Undo.
6. Add Reset Profile.
7. Add macro controls as disabled placeholders or read-only descriptions.
8. Add family map table read-only.
9. Add family map editing.
10. Add selected node override panel.
11. Add Matrix Mode.
12. Add Composer Mode.
13. Add Advanced Mode.

---

## 19. Success criteria

The UI control model is successful when:

- users can apply good layouts without reading physics settings
- Universal Balanced is always available as a safe fallback
- recommendations explain themselves
- advanced capability remains discoverable but not intrusive
- family and node overrides are scoped clearly
- profile changes are undoable
- raw physics parameters are available only when requested
- the UI feels like a calm guide, not a cockpit full of emergency switches

---

## 20. Guiding principle

The system can be deep.

The first click should be simple.
