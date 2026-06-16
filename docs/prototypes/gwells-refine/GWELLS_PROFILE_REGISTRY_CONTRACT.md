# GWells v0.2 — Profile Registry Contract

**Status:** Draft  
**Purpose:** Define the concrete registry/API contract for GWells v0.2 layout profiles, seed layouts, node family maps, interaction sets, parameter presets, and recommendation scoring.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_PROFILE_REGISTRY_CONTRACT.md`  
**Replaces:** Nothing yet. New implementation contract doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`

---

## 1. Summary

GWells v0.2 introduces profile-level registries above the current low-level dialect system.

The current v0 registry stack is:

```txt
Well Types
Interactions
Seed Functions
Dialects
```

The v0.2 product-facing registry stack should be:

```txt
Seed Layouts
Node Families
Family Maps
Interaction Sets
Parameter Presets
Physics Profiles
Layout Recommendations
```

The new layer should not immediately delete or replace the old one. Instead, profile resolution should convert the new product-facing concepts into the existing engine-facing concepts.

The first goal is compatibility.

The second goal is hot-swappable configuration.

The third goal is guided layout recommendation.

---

## 2. Design principle

Profiles are user-facing.

Dialects are engine-facing.

Seed layouts, family maps, interaction sets, and parameter presets are composable profile parts.

The UI should primarily talk to profiles.

The engine may continue to talk to dialect-compatible runtime objects until the lower-level engine is refactored.

---

## 3. Registry map

Recommended v0.2 registries:

```txt
GW_SEED_LAYOUT_REGISTRY
GW_NODE_FAMILY_METADATA
GW_NODE_FAMILY_MAP_REGISTRY
GW_INTERACTION_SET_REGISTRY
GW_PARAMETER_PRESET_REGISTRY
GW_PHYSICS_PROFILE_REGISTRY
```

Optional later registries:

```txt
GW_LAYOUT_ANALYZER_REGISTRY
GW_PROFILE_RECOMMENDER_REGISTRY
GW_PROFILE_UI_CARD_REGISTRY
```

---

## 4. Registry design

The first implementation can use readonly arrays to minimize churn.

However, the contract should be designed so it can move to mutable `Map` registries later.

Recommended pattern for v0.2:

```ts
export const GW_PHYSICS_PROFILE_REGISTRY: readonly GWPhysicsProfile[] = [
  // built-ins
] as const;

export function getProfileById(id: string): GWPhysicsProfile | undefined {
  return GW_PHYSICS_PROFILE_REGISTRY.find((entry) => entry.id === id);
}

export function listProfiles(): readonly GWPhysicsProfile[] {
  return GW_PHYSICS_PROFILE_REGISTRY;
}
```

Future mutable API target:

```ts
registerProfile(profile: GWPhysicsProfile): void;
unregisterProfile(id: string): boolean;
clearProfiles(scope?: "custom" | "all"): void;
```

The first pass should not block on mutable registries, but it should avoid designs that make mutable registries difficult later.

---

## 5. Seed layout registry

### 5.1 Purpose

A seed layout describes the opening arrangement before physics refinement.

Seed layouts are not the same as seed functions.

A seed function is an executable implementation.

A seed layout is a user/profile-facing option that may resolve to:

- an existing seed function
- a future seed primitive composition
- an imported-position strategy
- a no-op preserve strategy

### 5.2 Type

```ts
export type GWSeedLayoutStatus =
  | "active"
  | "experimental"
  | "planned"
  | "legacy";

export interface GWSeedLayoutEntry {
  id: string;
  label: string;
  description: string;
  status: GWSeedLayoutStatus;

  /**
   * Existing seed function ID used during bridge phase.
   * Optional because future seed layouts may use primitive composition
   * or imported-position preservation.
   */
  seedFunctionId?: string;

  /**
   * Visual/semantic shape for UI preview and recommendations.
   */
  shape:
    | "balanced"
    | "hierarchical"
    | "radial"
    | "parallel"
    | "cluster"
    | "domain-map"
    | "timeline"
    | "preserve"
    | "custom";

  recommendedFor?: GWSourceKind[];

  uiHints?: {
    goodFor?: string[];
    avoidFor?: string[];
    previewLabel?: string;
  };
}
```

### 5.3 Initial entries

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

### 5.4 Lookup helpers

```ts
export function getSeedLayoutById(id: string): GWSeedLayoutEntry | undefined;

export function listSeedLayouts(): readonly GWSeedLayoutEntry[];

export function listSeedLayoutsByStatus(
  status: GWSeedLayoutStatus
): GWSeedLayoutEntry[];

export function listSeedLayoutsForSource(
  sourceKind: GWSourceKind
): GWSeedLayoutEntry[];
```

---

## 6. Node family metadata registry

### 6.1 Purpose

Node families are source-agnostic semantic roles.

This metadata registry gives the UI stable labels and descriptions without forcing the user to see internal IDs.

### 6.2 Type

```ts
export interface GWNodeFamilyMetadata {
  family: GWNodeFamily;
  label: string;
  description: string;

  examples?: string[];

  defaultVisibility?: "visible" | "collapsed" | "hidden";

  uiHints?: {
    icon?: string;
    colorRole?: string;
    shortLabel?: string;
  };
}
```

### 6.3 Required families

```txt
root
collection
container
document
section
fragment
concept
entity
reference
annotation
asset
bridge
unknown
```

### 6.4 Lookup helpers

```ts
export function getNodeFamilyMetadata(
  family: GWNodeFamily
): GWNodeFamilyMetadata;

export function listNodeFamilies(): readonly GWNodeFamilyMetadata[];
```

---

## 7. Family map registry

### 7.1 Purpose

A family map assigns each `GWNodeFamily` to a well type.

Family maps are the main hot-swap mechanism for changing graph behavior without changing source data.

### 7.2 Type

```ts
export interface GWNodeFamilyMap {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "legacy";

  assignments: Record<GWNodeFamily, string>;

  recommendedFor?: GWSourceKind[];

  uiHints?: {
    goodFor?: string[];
    avoidFor?: string[];
  };
}
```

### 7.3 Required contract

Every active family map must assign every `GWNodeFamily`.

No missing family assignments.

`unknown` must always resolve to a safe well type, usually:

```txt
gwells.well.document-orbit
```

### 7.4 Initial entries

```txt
gwells.family-map.universal-balanced
gwells.family-map.hierarchical-containment
gwells.family-map.knowledge-garden
gwells.family-map.document-library
gwells.family-map.web-domain-map
gwells.family-map.semantic-constellation
gwells.family-map.legacy-filesystem
```

### 7.5 Lookup helpers

```ts
export function getFamilyMapById(id: string): GWNodeFamilyMap | undefined;

export function listFamilyMaps(): readonly GWNodeFamilyMap[];

export function listFamilyMapsByStatus(
  status: GWNodeFamilyMap["status"]
): GWNodeFamilyMap[];

export function validateFamilyMap(map: GWNodeFamilyMap): GWFamilyMapValidationResult;
```

### 7.6 Validation result

```ts
export interface GWFamilyMapValidationResult {
  valid: boolean;
  missingFamilies: GWNodeFamily[];
  unknownWellTypeIds: string[];
  warnings: string[];
}
```

---

## 8. Interaction set registry

### 8.1 Purpose

An interaction set groups low-level interaction IDs into a reusable profile layer.

Current dialects have `activeInteractions` directly.

Profiles should reference an interaction set instead.

### 8.2 Type

```ts
export interface GWInteractionSetEntry {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "legacy";

  interactionIds: readonly string[];

  emphasis:
    | "hierarchy"
    | "relationships"
    | "semantic"
    | "temporal"
    | "balanced"
    | "preserve"
    | "custom";

  uiHints?: {
    goodFor?: string[];
    avoidFor?: string[];
  };
}
```

### 8.3 Initial entries

```txt
gwells.interaction-set.legacy-directory-structure
gwells.interaction-set.universal-balanced
gwells.interaction-set.hierarchical-containment
gwells.interaction-set.knowledge-garden
gwells.interaction-set.document-library
gwells.interaction-set.web-domain-map
gwells.interaction-set.semantic-constellation
```

### 8.4 Lookup helpers

```ts
export function getInteractionSetById(id: string): GWInteractionSetEntry | undefined;

export function listInteractionSets(): readonly GWInteractionSetEntry[];

export function validateInteractionSet(
  entry: GWInteractionSetEntry
): GWInteractionSetValidationResult;
```

### 8.5 Validation result

```ts
export interface GWInteractionSetValidationResult {
  valid: boolean;
  missingInteractionIds: string[];
  warnings: string[];
}
```

---

## 9. Parameter preset registry

### 9.1 Purpose

A parameter preset groups well overrides, interaction overrides, and engine config defaults.

It lets the UI expose friendly tuning choices like Calm, Spacious, Stable, or Relationship-Heavy.

### 9.2 Type

```ts
export interface GWParameterPresetEntry {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "legacy";

  /**
   * Optional engine config overrides.
   */
  engineConfig?: Partial<GWEngineConfig>;

  /**
   * Dialect-compatible config layer.
   */
  config: GWDialectConfig;

  /**
   * Optional macro values used by the UI.
   */
  macroDefaults?: {
    structure?: number;
    spacing?: number;
    clustering?: number;
    motion?: number;
    relationshipPull?: number;
    hierarchyPull?: number;
    stability?: number;
  };

  uiHints?: {
    goodFor?: string[];
    avoidFor?: string[];
  };
}
```

### 9.3 Initial entries

```txt
gwells.parameter-preset.legacy-radial-backbone
gwells.parameter-preset.legacy-parallel-spines
gwells.parameter-preset.universal-calm
gwells.parameter-preset.spacious
gwells.parameter-preset.compact
gwells.parameter-preset.stable-large-graph
gwells.parameter-preset.relationship-heavy
gwells.parameter-preset.hierarchy-heavy
gwells.parameter-preset.semantic-clustering
```

### 9.4 Lookup helpers

```ts
export function getParameterPresetById(
  id: string
): GWParameterPresetEntry | undefined;

export function listParameterPresets(): readonly GWParameterPresetEntry[];
```

---

## 10. Physics profile registry

### 10.1 Purpose

A physics profile is the top-level user-facing layout configuration.

It references:

- seed layout
- family map
- interaction set
- parameter preset
- recommendation hints
- UI hints

### 10.2 Type

```ts
export interface GWPhysicsProfile {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "legacy";

  recommendedFor: GWSourceKind[];

  seedLayoutId: string;
  nodeFamilyMapId: string;
  interactionSetId: string;
  parameterPresetId: string;

  recommendation?: GWLayoutProfileRecommendationHints;

  uiHints?: {
    summary?: string;
    goodFor?: string[];
    avoidFor?: string[];
    complexity?: "simple" | "moderate" | "advanced";
    previewStyle?: "balanced" | "tree" | "radial" | "cluster" | "timeline" | "preserve";
  };
}
```

### 10.3 Initial profiles

```txt
gwells.profile.universal-balanced
gwells.profile.hierarchical-containment
gwells.profile.knowledge-garden
gwells.profile.document-library
gwells.profile.web-domain-map
gwells.profile.semantic-constellation
gwells.profile.imported-position-preserve
gwells.profile.legacy-radial-backbone
gwells.profile.legacy-parallel-spines
```

### 10.4 Lookup helpers

```ts
export function getProfileById(id: string): GWPhysicsProfile | undefined;

export function listProfiles(): readonly GWPhysicsProfile[];

export function listProfilesByStatus(
  status: GWPhysicsProfile["status"]
): GWPhysicsProfile[];

export function listProfilesForSource(
  sourceKind: GWSourceKind
): GWPhysicsProfile[];

export function validateProfile(
  profile: GWPhysicsProfile
): GWProfileValidationResult;
```

### 10.5 Validation result

```ts
export interface GWProfileValidationResult {
  valid: boolean;

  missingSeedLayout?: string;
  missingFamilyMap?: string;
  missingInteractionSet?: string;
  missingParameterPreset?: string;

  familyMapErrors?: GWFamilyMapValidationResult;
  interactionSetErrors?: GWInteractionSetValidationResult;

  warnings: string[];
}
```

---

## 11. Override state contract

### 11.1 Purpose

Overrides layer user intent on top of the selected profile.

### 11.2 Type

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

### 11.3 Resolution order

```txt
1. nodeWellOverrides[nodeId]
2. detectedTypeWellOverrides[detectedType]
3. familyWellOverrides[family]
4. active family map assignment
5. universal fallback family map assignment
6. unknown → gwells.well.document-orbit
```

This order must be deterministic and tested.

---

## 12. Resolved runtime contract

### 12.1 Purpose

A resolved runtime is what the profile system hands to the current engine bridge.

It should contain everything needed to run or re-run physics.

### 12.2 Type

```ts
export interface GWResolvedProfileRuntime {
  profileId: string;
  seedLayoutId: string;
  nodeFamilyMapId: string;
  interactionSetId: string;
  parameterPresetId: string;

  assignWellType: (
    nodeId: string,
    attrs: Record<string, unknown>
  ) => string | null;

  activeInteractions: readonly string[];

  config: GWDialectConfig;
  engineConfig?: Partial<GWEngineConfig>;

  diagnostics: {
    warnings: string[];
    missingWellTypeIds: string[];
    fallbackCount?: number;
  };
}
```

### 12.3 Resolver function

```ts
export function resolveProfileRuntime(
  graph: Graph,
  profileId: string,
  overrides?: Partial<GWProfileOverrideState>
): GWResolvedProfileRuntime;
```

During the bridge phase, this may be used by `applyProfile()` to build a temporary dialect-compatible runtime.

---

## 13. Profile application contract

### 13.1 Apply options

```ts
export interface GWApplyProfileOptions extends GWApplyDialectOptions {
  overrides?: Partial<GWProfileOverrideState>;

  applyMode?: GWApplyMode;

  /**
   * When true, re-run seed layout.
   * Default true for full-profile and seed-layout-only.
   */
  reseed?: boolean;

  /**
   * When true, preserve user pins.
   * Default true.
   */
  preservePins?: boolean;

  /**
   * When true, preserve selected-node well overrides.
   * Default true unless reset is explicit.
   */
  preserveOverrides?: boolean;
}
```

### 13.2 Public function

```ts
export function applyProfile(
  graph: Graph,
  profileId: string,
  options?: GWApplyProfileOptions
): GWController;
```

### 13.3 Bridge behavior

Initial implementation:

```txt
applyProfile()
  → resolveProfileRuntime()
  → construct dialect-compatible object or config
  → call applyDialect()
```

Long-term implementation:

```txt
applyProfile()
  → resolveProfileRuntime()
  → engine consumes resolved runtime directly
```

---

## 14. Profile-aware controller contract

### 14.1 Interface extension

```ts
export interface GWProfileController extends GWController {
  applyProfile(profileId: string, options?: GWApplyProfileOptions): void;

  applySeedLayout(seedLayoutId: string, options?: GWApplyProfileOptions): void;

  applyNodeFamilyMap(familyMapId: string, options?: GWApplyProfileOptions): void;

  reassignNodeFamily(
    family: GWNodeFamily,
    wellTypeId: string,
    options?: GWApplyProfileOptions
  ): void;

  reassignDetectedNodeType(
    detectedType: string,
    wellTypeId: string,
    options?: GWApplyProfileOptions
  ): void;

  reassignNode(
    nodeId: string,
    wellTypeId: string,
    options?: GWApplyProfileOptions
  ): void;

  resetProfileOverrides(
    scope?: "node" | "family" | "detected-type" | "layout" | "all"
  ): void;

  getCurrentProfileState(): GWProfileOverrideState;
}
```

### 14.2 First-pass simplification

The first pass does not need to return a full `GWProfileController`.

It can expose standalone utility functions first:

```ts
resolveProfileRuntime()
applyProfile()
resolveNodeWellType()
```

The controller can follow after the data model stabilizes.

---

## 15. Recommendation contract

### 15.1 Analysis function

```ts
export function analyzeGraphForLayout(graph: Graph): GWGraphAnalysis;
```

### 15.2 Scoring function

```ts
export function scoreProfileForGraph(
  profile: GWPhysicsProfile,
  analysis: GWGraphAnalysis
): GWProfileScore;
```

### 15.3 Recommendation function

```ts
export interface GWRecommendProfilesOptions {
  limit?: number;
  includeExperimental?: boolean;
  includeLegacy?: boolean;
  alwaysIncludeUniversalBalanced?: boolean;
}

export function recommendProfilesForGraph(
  graph: Graph,
  options?: GWRecommendProfilesOptions
): GWProfileScore[];
```

### 15.4 Score type

```ts
export interface GWProfileScore {
  profileId: string;
  label: string;
  score: number;
  reasons: string[];
  warnings: string[];
}
```

### 15.5 Recommendation rules

Required behavior:

- sort descending by score
- include reasons
- include warnings
- cap output by `limit`
- keep Universal Balanced available unless explicitly disabled
- avoid recommending planned profiles by default
- allow experimental profiles only when requested

---

## 16. Export contract

Update `index.ts` to export the new profile layer.

Minimum exports:

```ts
export type {
  GWSourceKind,
  GWNodeFamily,
  GWApplyMode,
  GWSeedLayoutEntry,
  GWNodeFamilyMetadata,
  GWNodeFamilyMap,
  GWInteractionSetEntry,
  GWParameterPresetEntry,
  GWPhysicsProfile,
  GWProfileOverrideState,
  GWResolvedProfileRuntime,
  GWApplyProfileOptions,
  GWProfileController,
  GWGraphAnalysis,
  GWProfileScore,
};

export {
  GW_SEED_LAYOUT_REGISTRY,
  getSeedLayoutById,
  listSeedLayouts,

  GW_NODE_FAMILY_METADATA,
  getNodeFamilyMetadata,
  listNodeFamilies,

  GW_NODE_FAMILY_MAP_REGISTRY,
  getFamilyMapById,
  listFamilyMaps,

  GW_INTERACTION_SET_REGISTRY,
  getInteractionSetById,
  listInteractionSets,

  GW_PARAMETER_PRESET_REGISTRY,
  getParameterPresetById,
  listParameterPresets,

  GW_PHYSICS_PROFILE_REGISTRY,
  getProfileById,
  listProfiles,

  resolveProfileRuntime,
  applyProfile,

  analyzeGraphForLayout,
  scoreProfileForGraph,
  recommendProfilesForGraph,
};
```

---

## 17. Validation requirements

### 17.1 Registry validation

Add a validation helper:

```ts
export function validateProfileRegistry(): GWRegistryValidationReport;
```

Report type:

```ts
export interface GWRegistryValidationReport {
  valid: boolean;
  profiles: GWProfileValidationResult[];
  familyMaps: GWFamilyMapValidationResult[];
  interactionSets: GWInteractionSetValidationResult[];
  warnings: string[];
}
```

### 17.2 Required validation checks

Check:

- every profile references an existing seed layout
- every profile references an existing family map
- every profile references an existing interaction set
- every profile references an existing parameter preset
- every family map covers every `GWNodeFamily`
- every interaction set references known interaction IDs or planned placeholders
- every active well type assignment references known well type IDs
- exactly one default profile is identified, or Universal Balanced exists as fallback

---

## 18. Initial implementation sequence

### Pass 1 — Types and static registries

Add:

```txt
nodeFamilies.ts
universalWellTypes.ts
familyMaps.ts
seedLayouts.ts
interactionSets.ts
parameterPresets.ts
profiles.ts
```

No engine changes.

### Pass 2 — Validation and resolution

Add:

```txt
profileResolution.ts
registryValidation.ts
```

Implement:

```txt
validateProfileRegistry()
resolveNodeWellType()
resolveProfileRuntime()
```

### Pass 3 — Legacy profile bridge

Add:

```txt
legacy radial-backbone profile
legacy parallel-spines profile
applyProfile() wrapper
```

Prove existing behavior still works.

### Pass 4 — Recommendation layer

Add:

```txt
layoutAnalysis.ts
layoutMatrix.ts
recommendProfilesForGraph()
```

### Pass 5 — UI integration

Add LumaWeave UI only after the registry/resolution layer is stable.

---

## 19. Testing checklist

### 19.1 Registry tests

- `listProfiles()` returns all built-ins.
- `getProfileById()` returns expected profile.
- unknown profile ID returns undefined.
- every active profile validates.
- every active family map covers all node families.
- Universal Balanced exists.

### 19.2 Resolution tests

- selected node override wins.
- detected type override wins over family override.
- family override wins over profile map.
- profile map wins over universal fallback.
- unknown resolves to document-orbit.
- missing profile throws useful error or falls back through controlled path.

### 19.3 Legacy bridge tests

- legacy radial profile resolves radial seed layout.
- legacy parallel profile resolves parallel seed layout.
- legacy profiles use existing interaction set.
- old `applyDialect()` behavior is unchanged.

### 19.4 Recommendation tests

- unknown graph recommends Universal Balanced.
- strong containment graph recommends Hierarchical Containment.
- backlink-heavy graph recommends Knowledge Garden.
- existing-position graph recommends Imported Position Preserve.
- recommendation includes at least one reason.

---

## 20. Non-goals

This contract does not require:

- full mutable registry implementation
- Barnes-Hut/spatial indexing
- real 3D physics
- new force kinds
- complete UI implementation
- saved user profiles
- cloud sync
- machine-learning recommendations
- complete seed primitive library

These should remain separate efforts.

---

## 21. Success criteria

The profile registry contract is successful when:

- the profile layer can be implemented without changing the engine loop
- existing dialects remain functional
- profiles can be listed, validated, and resolved
- family maps are hot-swappable
- profile recommendations have a stable API target
- LumaWeave can build UI against profile IDs instead of raw dialect IDs
- future seed layouts can be added without redesigning the profile model

---

## 22. Guiding principle

A profile is not a new engine.

A profile is a readable promise about how the engine should behave.
