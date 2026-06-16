# GWells v0.2 — Layout Profile System

**Status:** Draft  
**Purpose:** Define the next GWells product layer: composable layout profiles, hot-swappable node families, guided presets, and UI-safe configuration controls.  
**Intended location:** `docs/planning/GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`  
**Replaces:** Nothing yet. New planning doc.  
**Related:** `GWELLS_PHYSICS.md`, `gwells-committee-review.md`, `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`, `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`

---

## 1. Summary

GWells v0 currently behaves like a registry-driven graph physics engine where a dialect bundles:

- seed function
- well assignment
- active interactions
- parameter overrides

That model is technically strong, but too coarse for the next LumaWeave UI. Users should not have to understand force registries, well IDs, or interaction tables to get a good graph arrangement.

GWells v0.2 introduces a higher-level product concept:

> A layout profile is a guided, composable configuration that combines seed layout, node family mapping, well assignments, interaction sets, and physics parameters into one user-friendly arrangement.

The goal is not to reduce GWells capability. The goal is to make its complexity navigable.

---

## 2. Design mantra

The default layout does not need to be perfect.

The default layout must never be awful.

This principle drives the v0.2 profile system. Any loaded graph should be able to fall back to a universal arrangement that is stable, legible, and recoverable, even if GWells does not fully understand the data source yet.

---

## 3. Product goal

GWells should support one base physics system with many composable arrangements.

Instead of treating every layout mode as a fully separate dialect, v0.2 should break layout behavior into smaller hot-swappable layers:

```txt
Base Physics Kernel
  → Seed Layout
  → Node Family Map
  → Well Type Assignment
  → Interaction Set
  → Parameter Preset
  → UI Overrides
```

A user should be able to:

- apply a full recommended profile
- switch seed layouts
- adopt a full node family structure
- reassign all nodes of a detected family
- reassign one selected node
- tune friendly macro-controls
- open advanced raw physics parameters only when needed

---

## 4. Core concepts

### 4.1 Seed Layout

A seed layout determines initial node positions before physics refinement.

Seed layouts should be deterministic, fast, and visually sane. They are not expected to solve the entire graph. Their job is to give the physics engine a strong opening arrangement.

Examples:

- Universal Balanced
- Hierarchical Containment
- Knowledge Garden
- Document Library
- Web Domain Map
- Semantic Constellation
- Timeline River
- Imported Position Preserve

### 4.2 Node Family

A node family is a normalized semantic role assigned to a graph node after ingestion.

Examples:

- root
- collection
- container
- document
- section
- fragment
- concept
- entity
- reference
- annotation
- asset
- bridge
- unknown

Node families should be source-agnostic. A Markdown file, PDF chapter, web page, note, and code file may all map to `document` depending on the active profile.

### 4.3 Well Type

A well type defines how a node participates in the physics system.

Examples:

- collection-anchor
- topic-hub
- document-orbit
- section-band
- annotation-satellite
- reference-thread
- semantic-cluster
- temporal-lane
- bridge-node
- asset-satellite

A profile maps node families to well types.

### 4.4 Interaction Set

An interaction set defines which physical relationships are active.

Examples:

- containment springs
- sibling repulsion
- semantic attraction
- citation/reference springs
- link-follow springs
- topic clustering
- temporal alignment
- bridge stabilization

### 4.5 Parameter Preset

A parameter preset defines the default force tuning for a profile.

Examples:

- Calm
- Spacious
- Compact
- Organic
- Structured
- Relationship-Heavy
- Hierarchy-Heavy
- Stable Large Graph

### 4.6 UI Override

A UI override is a user-specific change layered on top of the selected profile.

Examples:

- pinned node
- elastic pin
- selected node well override
- all nodes of family override
- all nodes of detected source type override
- hidden family
- saved custom profile

---

## 5. Proposed type model

```ts
export type GWSourceKind =
  | "filesystem"
  | "obsidian"
  | "cytoscape"
  | "web"
  | "pdf"
  | "ebook"
  | "markdown"
  | "code"
  | "mixed"
  | "unknown";

export type GWNodeFamily =
  | "root"
  | "collection"
  | "container"
  | "document"
  | "section"
  | "fragment"
  | "concept"
  | "entity"
  | "reference"
  | "annotation"
  | "asset"
  | "bridge"
  | "unknown";

export type GWApplyMode =
  | "full-profile"
  | "seed-layout-only"
  | "family-map-only"
  | "single-family"
  | "detected-node-type"
  | "selected-node";
```

```ts
export interface GWPhysicsProfile {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "deprecated";

  recommendedFor: GWSourceKind[];

  seedLayoutId: string;
  nodeFamilyMapId: string;
  interactionSetId: string;
  parameterPresetId: string;

  uiHints?: {
    summary?: string;
    goodFor?: string[];
    avoidFor?: string[];
    complexity?: "simple" | "moderate" | "advanced";
    previewStyle?: "tree" | "radial" | "cluster" | "timeline" | "preserve";
  };
}
```

```ts
export interface GWNodeFamilyMap {
  id: string;
  label: string;
  description: string;
  assignments: Record<GWNodeFamily, string>;
}
```

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

---

## 6. Apply modes

### 6.1 Full Profile

Applies the complete profile:

- seed layout
- node family map
- well assignments
- interaction set
- parameter preset

Use when the user selects a recommended layout card.

Example:

```txt
Apply Knowledge Garden
```

### 6.2 Seed Layout Only

Keeps current family/well/interaction settings but reseeds positions.

Use when the graph interpretation is good but the shape is wrong.

Example:

```txt
Switch from radial to hierarchical seed.
```

### 6.3 Family Map Only

Keeps current seed and parameter preset but remaps node families to well types.

Use when the user wants to reinterpret the graph without changing the whole layout.

Example:

```txt
Treat notes as semantic clusters instead of document orbits.
```

### 6.4 Single Family Override

Changes the well type for all nodes in a family.

Example:

```txt
All concepts → topic-hub.
All assets → asset-satellite.
All references → reference-thread.
```

### 6.5 Detected Node Type Override

Changes the well type for all nodes matching an ingestion-specific type.

Example:

```txt
All .md files → document-orbit.
All PDF pages → section-band.
All tags → topic-hub.
All web domains → collection-anchor.
```

### 6.6 Selected Node Override

Changes the well type for one selected node.

Example:

```txt
Make this one note a topic hub.
Make this one page a bridge node.
Make this one folder a collection anchor.
```

---

## 7. Required controller additions

The current controller should eventually grow into a profile-aware controller.

Proposed additions:

```ts
export interface GWProfileController {
  applyProfile(profileId: string, options?: GWApplyProfileOptions): void;

  applySeedLayout(seedLayoutId: string, options?: GWReseedOptions): void;

  applyNodeFamilyMap(nodeFamilyMapId: string, options?: GWRemapOptions): void;

  reassignNodeFamily(
    family: GWNodeFamily,
    wellTypeId: string,
    options?: GWRemapOptions
  ): void;

  reassignDetectedNodeType(
    detectedType: string,
    wellTypeId: string,
    options?: GWRemapOptions
  ): void;

  reassignNode(
    nodeId: string,
    wellTypeId: string,
    options?: GWRemapOptions
  ): void;

  resetOverrides(scope?: "node" | "family" | "detected-type" | "all"): void;

  getCurrentProfileState(): GWProfileOverrideState;
}
```

---

## 8. Recommended first profiles

### 8.1 Universal Balanced

Fallback for unknown and mixed data.

Good for:

- unknown graphs
- Cytoscape JSON
- mixed imports
- early ingestion results
- incomplete metadata

Behavior:

- high-degree nodes drift toward center
- containers become loose anchors
- leaves orbit nearest parent or strongest neighbor
- disconnected components become separate islands
- imported positions are respected when available

### 8.2 Hierarchical Containment

Generalized replacement for current folder-first layouts.

Good for:

- folders
- markdown directories
- document outlines
- PDF chapter/page trees
- ebook structures

Behavior:

- roots become anchors
- containers branch outward
- leaves orbit containers
- depth maps to distance
- containment edges dominate

### 8.3 Knowledge Garden

Good for:

- Obsidian vaults
- markdown notes
- wiki-like data
- tag-heavy note systems
- concept maps

Behavior:

- topics and tags become hubs
- notes orbit topics
- backlinks pull notes together
- orphan notes drift to the edge
- hierarchy is present but not dominant

### 8.4 Document Library

Good for:

- PDFs
- ebooks
- papers
- long markdown documents
- source libraries

Behavior:

- collections/books become anchors
- chapters/sections form bands
- pages/fragments orbit their parent document
- citations and references form cross-document threads

### 8.5 Web Domain Map

Good for:

- HTML pages
- crawled websites
- documentation sites
- web archives

Behavior:

- domains become collection anchors
- pages orbit domains
- links create springs
- highly linked pages become bridges
- assets orbit pages

### 8.6 Semantic Constellation

Good for:

- mixed data
- semantic similarity graphs
- embeddings
- entity/concept maps
- exploratory research graphs

Behavior:

- semantic clusters dominate
- hierarchy becomes secondary
- bridge nodes connect clusters
- references/citations act as cross-cluster threads

---

## 9. UI model

The first UI version should avoid exposing raw physics parameters by default.

Recommended UI stack:

```txt
Layout Guide
  → Recommended Profiles
  → Node Family Mapping
  → Macro Physics Controls
  → Selection Overrides
  → Advanced Parameters
```

### 9.1 Recommended Profiles

The user sees the top suggestions for the loaded graph.

Example:

```txt
Recommended for this graph:
★ Knowledge Garden
★ Semantic Constellation
  Universal Balanced
  Hierarchical Containment
```

### 9.2 Node Family Mapping

The user can inspect and change family-to-well assignment.

Example:

```txt
Collection  → collection-anchor
Document    → document-orbit
Concept     → topic-hub
Reference   → reference-thread
Asset       → asset-satellite
Unknown     → document-orbit
```

### 9.3 Macro Physics Controls

Friendly controls should map to lower-level parameters.

Recommended macro controls:

- Structure
- Spacing
- Clustering
- Motion
- Relationship Pull
- Hierarchy Pull
- Stability

### 9.4 Selection Overrides

When a node is selected, the user can override that node or its family.

Example:

```txt
Selected node:
family: document
well type: document-orbit

Actions:
- Make topic hub
- Make bridge node
- Make annotation satellite
- Apply this well to all documents
- Reset override
```

---

## 10. Non-goals for v0.2

The v0.2 profile system should not attempt to solve everything.

Explicit non-goals:

- full 3D physics activation
- Barnes-Hut optimization
- advanced vortex/magnetic force kinds
- fully automatic semantic embeddings
- perfect layout recommendations
- complex visual preview generation
- persistent user profile sync

These can follow after the profile system is stable.

---

## 11. Implementation sequence

Recommended order:

1. Add `GWNodeFamily`.
2. Add universal well type IDs.
3. Add `GWPhysicsProfile`.
4. Add `GWNodeFamilyMap`.
5. Add profile registry.
6. Add family map registry.
7. Add first 4 profiles:
   - Universal Balanced
   - Hierarchical Containment
   - Knowledge Garden
   - Document Library
8. Add controller-level apply modes.
9. Add basic graph analysis for recommendations.
10. Add UI macro-control mapping.

---

## 12. Success criteria

GWells v0.2 is successful when:

- every loaded graph gets a sane default arrangement
- LumaWeave can recommend layouts without hardcoded UI special cases
- users can apply full profiles without understanding physics internals
- users can reassign node families without editing code
- selected-node overrides are possible
- existing dialects can be represented as profile presets
- raw physics remains available in advanced mode
- the default layout is stable enough to never be embarrassing

---

## 13. Design principle

Do not simplify the engine by removing capability.

Simplify the user experience by organizing capability into guided layers.
