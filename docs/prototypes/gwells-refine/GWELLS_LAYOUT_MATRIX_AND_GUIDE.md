# GWells Layout Matrix and Guide

**Status:** Draft  
**Purpose:** Define the recommendation layer that maps graph analysis to ideal layout profiles, helping users choose good arrangements without facing raw physics complexity.  
**Intended location:** `docs/planning/GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`  
**Replaces:** Nothing yet. New planning doc.  
**Related:** `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`, `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`

---

## 1. Summary

GWells is becoming powerful enough that users need a guided navigation system.

The Layout Matrix is the internal recommendation model that scores layout profiles against the currently loaded graph. The Layout Guide is the user-facing interface that presents those recommendations simply.

The matrix can be complex.

The guide should not feel complex.

---

## 2. Core goal

Expose capability through guided choices.

Hide raw complexity until the user asks for it.

The user should not need to know which force settings, seed layouts, well assignments, and interaction sets produce a good graph. GWells should inspect the loaded data and suggest a small number of good arrangements.

---

## 3. User-facing behavior

When a graph loads, LumaWeave should analyze it and show:

```txt
This graph looks like:
- Mostly hierarchical
- Medium-size
- Strong containment structure
- Some cross-links

Recommended layouts:
1. Hierarchical Containment
2. Knowledge Garden
3. Universal Balanced
```

The user can apply a recommended layout immediately, or open “Show why” to inspect the matrix reasoning.

---

## 4. Internal graph analysis

The Layout Matrix should score profiles from a normalized graph analysis object.

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

## 5. Matrix dimensions

The first version of the matrix should evaluate these dimensions:

```txt
Structure
  → Is there a strong hierarchy?
  → Are there many roots?
  → Is the graph deep or flat?

Relationships
  → Are links/backlinks important?
  → Are citations/references important?
  → Are dependencies important?
  → Are semantic similarities available?

Node Families
  → Which families dominate?
  → Are there many containers?
  → Are concepts/tags/entities present?
  → Are there many unknowns?

Metadata
  → Are imported positions available?
  → Are timestamps available?
  → Are embeddings available?
  → Are size/weight metrics available?

Scale
  → Is the graph small enough for richer physics?
  → Is the graph large enough to need stable/cheap layouts?
```

---

## 6. Layout profile recommendation hints

Each layout profile should declare what graph conditions it prefers.

```ts
export interface GWLayoutProfileRecommendationHints {
  prefers?: {
    sourceKinds?: GWSourceKind[];

    minContainmentRatio?: number;
    maxContainmentRatio?: number;

    minLinkDensity?: number;
    minCitationDensity?: number;
    minDependencyDensity?: number;
    minSemanticDensity?: number;
    minTemporalDensity?: number;

    minDepth?: number;
    maxDepth?: number;

    minNodeCount?: number;
    maxNodeCount?: number;

    hasExistingPositions?: boolean;
    hasTimestamps?: boolean;
    hasEmbeddings?: boolean;

    dominantFamilies?: GWNodeFamily[];
  };

  avoidWhen?: {
    noContainment?: boolean;
    tooFlat?: boolean;
    tooDeep?: boolean;
    noLinks?: boolean;
    noSemanticSignals?: boolean;
    tooManyDisconnectedComponents?: boolean;
    tooLarge?: boolean;
  };

  scoring?: {
    baseScore?: number;
    sourceKindWeight?: number;
    structureWeight?: number;
    relationshipWeight?: number;
    semanticWeight?: number;
    metadataWeight?: number;
    scaleWeight?: number;
  };
}
```

---

## 7. Example matrix

| Layout Profile | Hierarchy | Links | Semantic | Scale | Best For |
|---|---:|---:|---:|---:|---|
| Universal Balanced | Medium | Medium | Low | High | unknown/mixed data |
| Hierarchical Containment | High | Low | Low | High | folders, books, docs |
| Knowledge Garden | Medium | High | Medium | Medium | notes, tags, backlinks |
| Document Library | High | Medium | Medium | Medium | PDFs, ebooks, papers |
| Web Domain Map | Medium | High | Low | Medium | websites, crawls |
| Citation Field | Low | High | Medium | Medium | references, papers |
| Dependency Gravity | Medium | High | Low | Medium | code, packages, imports |
| Semantic Constellation | Low | Medium | High | Medium | embeddings, concepts |
| Timeline River | Low | Low | Medium | High | dated notes/events |
| Component Islands | Low | Low | Low | High | disconnected mixed graphs |
| Imported Position Preserve | Variable | Variable | Variable | High | Cytoscape/positioned imports |

---

## 8. First recommendation rules

The first implementation does not need machine learning or complex scoring.

Start with deterministic heuristics.

### 8.1 Universal Balanced

Recommend when:

- source kind is unknown or mixed
- node family confidence is low
- graph has many unknown nodes
- no dominant relationship type exists
- graph is newly imported

Always keep this profile available.

### 8.2 Hierarchical Containment

Recommend when:

- containment edge ratio is high
- graph has meaningful depth
- container/document families dominate
- source kind is filesystem, markdown, PDF, ebook, or code

Avoid when:

- there are almost no containment edges
- the graph is extremely flat
- semantic or link relationships should dominate

### 8.3 Knowledge Garden

Recommend when:

- source kind is Obsidian or markdown
- link density is moderate/high
- tags, concepts, notes, or backlinks are present
- graph is not purely hierarchical

Avoid when:

- graph has no links
- graph is only a simple folder tree

### 8.4 Document Library

Recommend when:

- source kind is PDF, ebook, markdown, or mixed document library
- documents, sections, fragments, references, or citations are present
- containment exists but should not be the only layout force

Avoid when:

- graph contains mostly code dependency nodes
- graph has no document-like families

### 8.5 Web Domain Map

Recommend when:

- source kind is web
- domains/pages/assets are present
- link density is high
- page-to-page navigation should shape layout

Avoid when:

- graph has no URL/domain information
- graph is mostly local documents

### 8.6 Semantic Constellation

Recommend when:

- embeddings are present
- semantic similarity edges are present
- concepts/entities dominate
- user intent is exploratory clustering

Avoid when:

- no semantic signals exist
- hierarchy must be preserved exactly

### 8.7 Imported Position Preserve

Recommend when:

- graph imported existing positions
- source kind is Cytoscape
- user likely expects original layout to remain visible

Avoid when:

- imported positions are missing or low quality

---

## 9. Scoring model v0

A simple scoring function is enough for v0.

```ts
export interface GWProfileScore {
  profileId: string;
  score: number;
  label: string;
  reasons: string[];
  warnings: string[];
}
```

```ts
export function scoreProfile(
  profile: GWPhysicsProfile,
  analysis: GWGraphAnalysis
): GWProfileScore {
  let score = profile.recommendation?.scoring?.baseScore ?? 50;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // Source kind match
  if (profile.recommendedFor.some(kind => analysis.sourceKinds.includes(kind))) {
    score += 20;
    reasons.push("Matches detected source type.");
  }

  // Structure match
  // Relationship match
  // Node family match
  // Metadata match
  // Scale match

  // Avoidance penalties

  return {
    profileId: profile.id,
    score: Math.max(0, Math.min(100, score)),
    label: profile.label,
    reasons,
    warnings,
  };
}
```

Rules should be readable and debuggable. Avoid opaque scoring early.

---

## 10. Layout Guide UI

The user-facing guide should have three modes.

### 10.1 Guided Mode

Default mode.

Shows:

```txt
Best Fit
Explore Alternatives
Advanced Controls
```

Example:

```txt
Best Fit:
Knowledge Garden

Also good:
Semantic Constellation
Hierarchical Containment
Universal Balanced
```

### 10.2 Matrix Mode

Power-user/debug mode.

Shows:

| Layout | Fit | Best For | Warning |
|---|---:|---|---|
| Knowledge Garden | 94% | notes, backlinks, tags | none |
| Semantic Constellation | 86% | concepts, mixed links | may weaken hierarchy |
| Hierarchical Containment | 74% | folders/tree depth | cross-links secondary |
| Citation Field | 42% | references/citations | few citation edges found |

### 10.3 Composer Mode

Advanced profile builder.

Lets users choose layers independently:

```txt
Seed Layout: Knowledge Garden
Node Family Map: Obsidian Notes
Interaction Set: Backlinks + Topic Clusters
Parameter Preset: Calm / Stable
```

---

## 11. “Show why” explanation model

Each recommendation should be explainable.

Example:

```txt
Why Knowledge Garden?
- 61% of document nodes have links.
- Tags/concepts were detected.
- The graph has moderate hierarchy but strong cross-linking.
- This layout keeps containers visible while letting backlinks shape clusters.
```

The explanation should use human terms, not raw physics parameters.

Avoid:

```txt
Increased spring stiffness on link interactions by 0.18.
```

Prefer:

```txt
Backlinks will pull related notes closer together.
```

---

## 12. Macro controls

The Layout Guide should expose macro controls first.

Recommended macro controls:

| Macro Control | Meaning |
|---|---|
| Structure | How strongly seeded structure is preserved |
| Spacing | How far apart clusters/nodes spread |
| Clustering | How strongly similar nodes group |
| Motion | How fluid or damped the graph feels |
| Relationship Pull | How strongly links/references affect layout |
| Hierarchy Pull | How strongly containment affects layout |
| Stability | How quickly the graph settles |

Raw physics controls should live under Advanced Mode.

---

## 13. Preview strategy

Eventually, recommended layouts should show previews.

Preview options:

1. lightweight thumbnail from cached previous layout
2. mini simulation on sampled graph
3. static icon/diagram per profile
4. side-by-side preview canvas
5. apply-and-undo workflow

For v0, static cards plus “Show why” are enough.

---

## 14. Anti-overwhelm rules

The guide should obey these UX constraints:

- never show more than 3 primary recommendations
- always keep Universal Balanced available
- explain recommendations in plain language
- hide raw physics by default
- provide safe undo/reset
- separate “apply full profile” from “tune current profile”
- show warnings before destructive remapping
- use stable labels, not internal IDs
- allow advanced users to inspect everything

---

## 15. Initial implementation sequence

1. Add `GWGraphAnalysis`.
2. Add `GWLayoutProfileRecommendationHints`.
3. Add `GWProfileScore`.
4. Add deterministic scoring function.
5. Add recommendation reasons/warnings.
6. Add matrix data for first 6 profiles.
7. Add Guided Mode UI.
8. Add Matrix Mode UI.
9. Add Composer Mode later.

---

## 16. Success criteria

The Layout Matrix and Guide are successful when:

- users can pick a good layout without understanding physics
- recommended layouts match obvious source types
- mixed/unknown data falls back gracefully
- every recommendation can explain itself
- advanced users can inspect the matrix
- the system can grow without hardcoded UI branches
- LumaWeave feels powerful but not overwhelming

---

## 17. Guiding principle

The matrix is allowed to be complex.

The guide must feel calm.
