# GWells v0.2 — Implementation Bridge

**Status:** Draft  
**Purpose:** Translate the v0.2 profile/matrix/node-family planning docs into an implementation path that can be applied to the current GWells codebase without breaking existing radial-backbone and parallel-spines behavior.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`  
**Replaces:** Nothing yet. New bridge/planning doc.  
**Related:**
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`
- `GWELLS_PHYSICS.md`
- `gwells-committee-review.md`

---

## 1. Summary

GWells v0.2 should not be a rewrite.

It should be a bridge from the current dialect-based system into a composable profile system.

Current GWells already has the correct core idea:

```txt
well types + interactions + seed functions + dialects → applyDialect()
```

The problem is that the current dialect is too large as a user-facing unit. A dialect currently bundles too many things at once:

- seed function
- well assignment
- active interactions
- parameter overrides

That is useful internally, but too rigid for the LumaWeave UI. Users need to swap layouts, remap node families, adjust physics, and override selected nodes without replacing the whole system every time.

The v0.2 bridge introduces a product-facing layer above the current engine:

```txt
Profile
  → Seed Layout
  → Node Family Map
  → Well Assignment Resolver
  → Interaction Set
  → Parameter Preset
  → User Overrides
  → Existing applyDialect-compatible runtime
```

This lets LumaWeave present a calm guided UI while GWells keeps its registry-driven engine.

---

## 2. Design goal

The goal is to support one base physics system with many composable arrangements.

The user should experience:

```txt
Choose a layout profile.
Optionally tune it.
Override specific families or nodes when needed.
```

The engine should experience:

```txt
Resolve profile layers into the same runtime ingredients GWells already understands.
```

The implementation should preserve existing radial-backbone and parallel-spines behavior while making them expressible as profiles.

---

## 3. Current-state anchor

The current GWells codebase is organized around these files:

```txt
types.ts
wellTypes.ts
interactions.ts
seedFunctions.ts
dialects.ts
engine.ts
seederHelpers.ts
seeders/radialBackbone.ts
seeders/parallelSpines.ts
index.ts
```

Current primary runtime:

```ts
applyDialect(graph, dialectId, options)
```

Current dialect shape:

```ts
GWDialectEntry {
  id
  label
  description
  status
  isDefault
  seedFunctionId
  wellAssignment
  activeInteractions
  config
}
```

Current runtime sequence:

```txt
resolve dialect
merge engine config
merge dialect config
run seed function
build node→well assignment cache
build contains parent map
resolve interactions
resolve well parameters
initialize __gwellsState
start animation loop
```

This should remain valid during the bridge phase.

---

## 4. New v0.2 modules

The v0.2 layer should add new modules rather than immediately replacing current files.

Recommended new files:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
profiles.ts
profileRecommendations.ts
profileResolution.ts
profileController.ts
seedLayouts.ts
layoutAnalysis.ts
layoutMatrix.ts
```

The current files should stay in place during the first implementation pass.

---

## 5. Migration principle

Do not delete dialects first.

Instead:

1. Add profile types.
2. Add profile registries.
3. Add family maps.
4. Add profile resolution.
5. Make current dialects representable as profile presets.
6. Add controller helpers that resolve profiles into current engine-compatible configuration.
7. Gradually reduce direct UI dependency on raw dialects.

Current dialects become legacy-compatible presets, not abandoned code.

---

## 6. Compatibility model

The first implementation should support both APIs:

```ts
applyDialect(graph, "gwells.dialect.parallel-spines", options)
```

and:

```ts
applyProfile(graph, "gwells.profile.hierarchical-containment", options)
```

Internally, `applyProfile()` may temporarily resolve to an existing dialect until profile-native runtime support is added.

Example bridge behavior:

```txt
profile → resolved profile runtime → dialect-compatible config → applyDialect()
```

This avoids forcing the engine refactor and UI/product refactor to land at the same time.

---

## 7. Proposed file responsibilities

### 7.1 `nodeFamilies.ts`

Defines source-agnostic node families.

Responsibilities:

- export `GWNodeFamily`
- export family metadata
- export friendly labels/descriptions
- provide fallback family behavior

Example:

```ts
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
```

---

### 7.2 `universalWellTypes.ts`

Defines universal well type IDs and optional metadata for UI display.

Responsibilities:

- export universal well type ID constants
- export friendly labels
- export descriptions
- eventually register universal well types into the well type registry

Example:

```ts
export const GW_UNIVERSAL_WELL_TYPES = {
  COLLECTION_ANCHOR: "gwells.well.collection-anchor",
  TOPIC_HUB: "gwells.well.topic-hub",
  DOCUMENT_ORBIT: "gwells.well.document-orbit",
  SECTION_BAND: "gwells.well.section-band",
  ANNOTATION_SATELLITE: "gwells.well.annotation-satellite",
  REFERENCE_THREAD: "gwells.well.reference-thread",
  SEMANTIC_CLUSTER: "gwells.well.semantic-cluster",
  TEMPORAL_LANE: "gwells.well.temporal-lane",
  BRIDGE_NODE: "gwells.well.bridge-node",
  ASSET_SATELLITE: "gwells.well.asset-satellite",
} as const;
```

---

### 7.3 `familyMaps.ts`

Defines mappings from `GWNodeFamily` to well type IDs.

Responsibilities:

- export `GWNodeFamilyMap`
- define Universal Balanced map
- define Knowledge Garden map
- define Document Library map
- define Semantic Constellation map
- provide lookup helpers

Example:

```ts
export interface GWNodeFamilyMap {
  id: string;
  label: string;
  description: string;
  assignments: Record<GWNodeFamily, string>;
}
```

---

### 7.4 `profiles.ts`

Defines full profile entries.

Responsibilities:

- export `GWPhysicsProfile`
- define first profile registry
- provide lookup/list helpers
- connect profile IDs to seed layout IDs, family maps, interaction sets, and parameter presets

Example profile IDs:

```txt
gwells.profile.universal-balanced
gwells.profile.hierarchical-containment
gwells.profile.knowledge-garden
gwells.profile.document-library
gwells.profile.web-domain-map
gwells.profile.semantic-constellation
```

---

### 7.5 `seedLayouts.ts`

Defines seed layout registry entries.

Responsibilities:

- distinguish seed layout from old seed function
- map early seed layouts to current seed functions where possible
- reserve IDs for future seeders
- provide metadata for recommendations/UI

Example seed layout IDs:

```txt
gwells.seed-layout.universal-balanced
gwells.seed-layout.hierarchical-containment
gwells.seed-layout.radial-backbone
gwells.seed-layout.parallel-spines
gwells.seed-layout.knowledge-garden
gwells.seed-layout.document-library
gwells.seed-layout.web-domain-map
gwells.seed-layout.semantic-constellation
gwells.seed-layout.imported-position-preserve
```

Bridge behavior:

```txt
radial-backbone seed layout → gwells.seed.radial-backbone
parallel-spines seed layout → gwells.seed.parallel-spines
```

Future behavior:

```txt
seed layout registry → seed primitive composition → profile runtime
```

---

### 7.6 `layoutAnalysis.ts`

Analyzes a loaded graph and produces recommendation inputs.

Responsibilities:

- count nodes/edges
- detect source kinds
- detect node family distribution
- calculate containment ratio
- calculate link/reference/dependency/semantic density
- detect imported positions
- estimate graph scale/physics cost

Example:

```ts
export interface GWGraphAnalysis {
  sourceKinds: GWSourceKind[];

  scale: {
    nodeCount: number;
    edgeCount: number;
    averageDegree: number;
    maxDegree: number;
    disconnectedComponentCount: number;
    estimatedPhysicsCost: "small" | "medium" | "large" | "huge";
  };

  structure: {
    containmentEdgeRatio: number;
    rootCount: number;
    maxDepth: number;
    averageDepth: number;
    averageBranchingFactor: number;
    hasDominantHierarchy: boolean;
    hasManyDisconnectedComponents: boolean;
  };

  relationships: {
    linkDensity: number;
    citationDensity: number;
    dependencyDensity: number;
    semanticDensity: number;
    temporalDensity: number;
    referenceDensity: number;
  };

  nodeFamilies: Partial<Record<GWNodeFamily, number>>;

  metadata: {
    hasExistingPositions: boolean;
    hasZPositions: boolean;
    hasSizeWeights: boolean;
    hasTimestamps: boolean;
    hasEmbeddings: boolean;
    hasSemanticSimilarity: boolean;
  };
}
```

---

### 7.7 `layoutMatrix.ts`

Scores profiles for the loaded graph.

Responsibilities:

- define recommendation hints
- score profiles against `GWGraphAnalysis`
- produce reasons/warnings
- sort recommendations
- keep Universal Balanced available

Example:

```ts
export interface GWProfileScore {
  profileId: string;
  score: number;
  label: string;
  reasons: string[];
  warnings: string[];
}
```

---

### 7.8 `profileResolution.ts`

Converts a profile plus overrides into runtime instructions.

Responsibilities:

- resolve active profile
- resolve family map
- apply node/family/detected-type overrides
- produce node→well assignment function
- resolve interaction IDs
- resolve parameter preset
- produce dialect-compatible bridge config

This file is the heart of the bridge.

Example:

```ts
export interface GWResolvedProfileRuntime {
  profileId: string;
  seedLayoutId: string;
  familyMapId: string;
  interactionSetId: string;
  parameterPresetId: string;

  assignWellType: (nodeId: string, attrs: Record<string, unknown>) => string | null;

  activeInteractions: readonly string[];
  config: GWDialectConfig;
}
```

---

### 7.9 `profileController.ts`

Adds profile-aware controller helpers.

Responsibilities:

- apply full profile
- apply seed layout only
- apply family map only
- reassign family
- reassign detected source type
- reassign selected node
- reset overrides
- expose current profile state

This may initially wrap the current `GWController`.

---

## 8. Type additions

Add these types before implementing runtime behavior.

Recommended location for first pass:

```txt
types.ts
```

Eventually they may be split into profile-specific type files.

Initial additions:

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

---

## 9. Profile resolution order

Well assignment should resolve in this order:

```txt
1. Selected node override
2. Detected source type override
3. Node family override
4. Active profile family map
5. Universal fallback map
6. unknown → document-orbit
```

This makes user intent more specific as it rises through the stack.

Example:

```txt
A selected PDF page may normally resolve as:
section → section-band

But if the user manually marks it as a bridge:
selected node override → bridge-node
```

---

## 10. Existing dialect compatibility

Current dialects should map into the new system.

### 10.1 Radial Backbone

Legacy dialect:

```txt
gwells.dialect.radial-backbone
```

Bridge profile:

```txt
gwells.profile.legacy-radial-backbone
```

Uses:

```txt
seed layout: gwells.seed-layout.radial-backbone
family map: legacy filesystem family map
interaction set: current radialBackboneInteractions
parameter preset: current shared overrides
```

### 10.2 Parallel Spines

Legacy dialect:

```txt
gwells.dialect.parallel-spines
```

Bridge profile:

```txt
gwells.profile.legacy-parallel-spines
```

Uses:

```txt
seed layout: gwells.seed-layout.parallel-spines
family map: legacy filesystem family map
interaction set: current radialBackboneInteractions
parameter preset: current parallel-spines overrides
```

This allows old behavior to remain available through the new UI.

---

## 11. Implementation milestone 1

The first implementation pass should be narrow.

Goal:

```txt
Add profile/family types and registries without changing engine behavior.
```

Deliverables:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
profiles.ts
seedLayouts.ts
profileResolution.ts
exports from index.ts
basic tests for profile lookup and family map resolution
```

No physics loop changes required.

No UI required.

No replacement of current dialects required.

---

## 12. Implementation milestone 2

Goal:

```txt
Allow profile resolution to produce dialect-compatible runtime config.
```

Deliverables:

```txt
resolveProfileRuntime(profileId, overrides)
legacy profile definitions for radial-backbone and parallel-spines
applyProfile() wrapper
tests proving applyProfile(legacy-parallel-spines) matches old dialect behavior
```

This milestone lets LumaWeave start using profiles without losing existing layouts.

---

## 13. Implementation milestone 3

Goal:

```txt
Introduce universal family maps and first new profile behavior.
```

Deliverables:

```txt
Universal Balanced profile
Hierarchical Containment profile
Knowledge Garden profile placeholder
Document Library profile placeholder
family override resolver
selected-node override resolver
```

Seed behavior may still delegate to existing seeders where needed.

---

## 14. Implementation milestone 4

Goal:

```txt
Add recommendation support.
```

Deliverables:

```txt
analyzeGraphForLayout()
scoreProfilesForGraph()
recommendProfilesForGraph()
reason/warning strings
top 3 recommendation output
```

UI can consume the output later.

---

## 15. Implementation milestone 5

Goal:

```txt
Add LumaWeave UI integration.
```

Deliverables:

```txt
Guided Mode recommended cards
Show Why panel
Family map table
Selected node override actions
Macro slider placeholders
Reset profile / reset override controls
```

---

## 16. New public API target

By the end of the bridge, GWells should expose:

```ts
// Existing
applyDialect(graph, dialectId, options)

// New
applyProfile(graph, profileId, options)
analyzeGraphForLayout(graph)
scoreProfilesForGraph(graph, profiles)
recommendProfilesForGraph(graph, options)

// Registry/listing
listProfiles()
getProfileById(id)
listSeedLayouts()
listFamilyMaps()
getFamilyMapById(id)

// Resolution
resolveNodeFamily(nodeId, attrs, context)
resolveNodeWellType(nodeId, attrs, overrideState)
resolveProfileRuntime(profileId, overrideState)
```

---

## 17. UI-facing API target

LumaWeave should eventually be able to ask:

```ts
const analysis = analyzeGraphForLayout(graph);
const recommendations = recommendProfilesForGraph(graph, { limit: 3 });
```

Then render:

```txt
Best Fit:
Knowledge Garden

Also good:
Semantic Constellation
Hierarchical Containment
Universal Balanced
```

When the user applies a recommendation:

```ts
controller.applyProfile("gwells.profile.knowledge-garden");
```

When the user overrides all documents:

```ts
controller.reassignNodeFamily("document", "gwells.well.semantic-cluster");
```

When the user overrides one selected node:

```ts
controller.reassignNode(nodeId, "gwells.well.bridge-node");
```

---

## 18. Testing strategy

### 18.1 Type/registry tests

Verify:

- all profiles reference existing seed layouts
- all profiles reference existing family maps
- all family maps assign every `GWNodeFamily`
- all assigned well type IDs exist or are explicitly planned
- Universal Balanced covers unknown

### 18.2 Resolution tests

Verify:

- selected-node override wins
- detected-type override beats family override
- family override beats profile family map
- profile family map beats universal fallback
- unknown resolves to document-orbit

### 18.3 Legacy compatibility tests

Verify:

- legacy radial-backbone profile resolves to current radial-backbone behavior
- legacy parallel-spines profile resolves to current parallel-spines behavior
- current `applyDialect()` remains unchanged

### 18.4 Recommendation tests

Verify:

- unknown graph recommends Universal Balanced
- strong containment graph recommends Hierarchical Containment
- link-heavy note graph recommends Knowledge Garden
- existing-position graph recommends Imported Position Preserve
- recommendations include reasons
- recommendations include warnings when appropriate

---

## 19. Risks

### 19.1 Too much abstraction before visual proof

Risk:

```txt
Building a large profile system before any new layout looks better.
```

Mitigation:

```txt
Keep first pass small.
Make legacy profiles work first.
Then add one visually meaningful new seed/profile.
```

### 19.2 Confusing profile vs dialect terminology

Risk:

```txt
Developers may not know whether to add a dialect or profile.
```

Mitigation:

```txt
Profiles are user-facing.
Dialects are engine-facing legacy/internal bundles.
New work should prefer profiles unless adding low-level engine behavior.
```

### 19.3 Current seeders remain too domain-specific

Risk:

```txt
Profiles exist, but all seed layouts still behave like folder visualizers.
```

Mitigation:

```txt
Use this bridge to separate the product model first.
Then implement new seed layouts as isolated follow-up work.
```

### 19.4 UI exposes too much too soon

Risk:

```txt
Users face family maps, well types, interactions, and presets all at once.
```

Mitigation:

```txt
Guided Mode first.
Matrix Mode and Composer Mode later.
```

---

## 20. Non-goals

This bridge does not implement:

- true 3D physics
- Barnes-Hut optimization
- full mutable registry refactor
- complete seed primitive library
- all universal well type force tuning
- UI components
- persistent saved custom profiles
- machine-learning recommendation logic

Those remain future work.

---

## 21. Recommended first coding pass

First pass should create files and types only:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
profiles.ts
seedLayouts.ts
profileResolution.ts
```

Then export them from:

```txt
index.ts
```

Add tests for:

```txt
profile lookup
family map completeness
well resolution order
legacy profile references
```

This gives future coding passes a stable structure without touching engine physics.

---

## 22. Success criteria

This bridge is successful when:

- the current dialect system still works
- legacy dialects can be represented as profiles
- profile/family/well concepts exist in code
- family maps can be hot-swapped
- node/family override resolution is deterministic
- LumaWeave has a clear target API for guided layout recommendations
- future seed layouts can be added without redesigning the product layer

---

## 23. Guiding principle

Do not make the user choose physics.

Let the user choose intent.

Then resolve intent into physics.
