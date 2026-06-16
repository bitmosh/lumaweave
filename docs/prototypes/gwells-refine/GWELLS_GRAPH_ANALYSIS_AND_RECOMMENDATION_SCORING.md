# GWells v0.2 — Graph Analysis and Recommendation Scoring

**Status:** Draft  
**Purpose:** Define how GWells analyzes a loaded graph and scores layout profiles so LumaWeave can recommend good arrangements without exposing overwhelming physics complexity.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_GRAPH_ANALYSIS_AND_RECOMMENDATION_SCORING.md`  
**Replaces:** Nothing yet. New planning/implementation doc.  
**Related:**
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`
- `GWELLS_UI_CONTROL_MODEL.md`

---

## 1. Summary

GWells v0.2 needs a recommendation layer that can inspect the currently loaded graph and suggest the best layout profiles.

The recommendation layer should answer:

```txt
What kind of graph is this?
Which layout profiles are likely to look sane?
Why were those profiles recommended?
Are there any warnings before applying one?
```

This system should be deterministic, explainable, and conservative.

It does not need machine learning.

It does need good graph heuristics.

---

## 2. Core design goal

The recommendation system should simplify operation without simplifying capability.

Users should see:

```txt
Recommended:
1. Knowledge Garden
2. Semantic Constellation
3. Universal Balanced
```

Internally, GWells can evaluate:

```txt
source kinds
node families
containment ratio
link density
citation density
semantic density
temporal density
component count
imported positions
graph scale
estimated physics cost
```

The matrix can be complex.

The UI should remain calm.

---

## 3. Guiding principle

Do not recommend the theoretically most powerful layout.

Recommend the layout least likely to betray the user’s data.

The fallback profile should follow the GWells mantra:

```txt
The default does not need to be perfect.
The default must never be awful.
```

---

## 4. Public API target

```ts
export function analyzeGraphForLayout(graph: Graph): GWGraphAnalysis;

export function scoreProfileForGraph(
  profile: GWPhysicsProfile,
  analysis: GWGraphAnalysis
): GWProfileScore;

export function recommendProfilesForGraph(
  graph: Graph,
  options?: GWRecommendProfilesOptions
): GWProfileScore[];
```

---

## 5. Graph analysis shape

```ts
export interface GWGraphAnalysis {
  sourceKinds: GWSourceKind[];

  scale: GWGraphScaleAnalysis;
  structure: GWGraphStructureAnalysis;
  relationships: GWGraphRelationshipAnalysis;
  nodeFamilies: GWGraphNodeFamilyAnalysis;
  metadata: GWGraphMetadataAnalysis;

  confidence: {
    sourceKindConfidence: number;
    familyClassificationConfidence: number;
    recommendationConfidence: number;
  };

  diagnostics: {
    warnings: string[];
    notes: string[];
  };
}
```

---

## 6. Scale analysis

Scale analysis estimates how expensive the graph will be for physics and how conservative the layout recommendation should be.

```ts
export interface GWGraphScaleAnalysis {
  nodeCount: number;
  edgeCount: number;

  averageDegree: number;
  maxDegree: number;

  disconnectedComponentCount: number;
  largestComponentNodeCount: number;

  estimatedPhysicsCost: "small" | "medium" | "large" | "huge";
}
```

### 6.1 Suggested thresholds

```txt
small:
  nodes <= 250

medium:
  nodes > 250 and <= 1000

large:
  nodes > 1000 and <= 3000

huge:
  nodes > 3000
```

These thresholds are conservative. They should be revisited after benchmark data exists.

### 6.2 Scale implications

```txt
small:
  richer layouts are safe

medium:
  most layouts are safe, but avoid unnecessary force density

large:
  prefer stable seed-heavy profiles

huge:
  prefer Universal Balanced, Hierarchical Containment, Component Islands,
  Imported Position Preserve, or other cheap/stable layouts
```

---

## 7. Structure analysis

Structure analysis determines whether the graph has a strong hierarchy, weak hierarchy, or no meaningful hierarchy.

```ts
export interface GWGraphStructureAnalysis {
  containmentEdgeCount: number;
  containmentEdgeRatio: number;

  rootCount: number;
  maxDepth: number;
  averageDepth: number;
  averageBranchingFactor: number;

  hasDominantHierarchy: boolean;
  isMostlyFlat: boolean;
  hasManyRoots: boolean;
  hasManyDisconnectedComponents: boolean;
}
```

### 7.1 Containment edge detection

Containment edges should be detected by normalized edge relation, not by one hardcoded attribute forever.

Bridge-phase detection may check:

```txt
edge.relationship === "contains"
edge.raw?.type === "contains"
edge.relation === "contains"
edge.kind === "contains"
```

Future detection should route through a configurable relationship adapter.

### 7.2 Suggested interpretation

```txt
containmentEdgeRatio >= 0.60:
  strong hierarchy

containmentEdgeRatio >= 0.30 and < 0.60:
  mixed hierarchy

containmentEdgeRatio < 0.30:
  weak hierarchy
```

### 7.3 Depth interpretation

```txt
maxDepth <= 1:
  mostly flat

maxDepth 2–4:
  shallow hierarchy

maxDepth 5–8:
  meaningful hierarchy

maxDepth > 8:
  deep hierarchy; layout may need compression or folding
```

---

## 8. Relationship analysis

Relationship analysis identifies which non-containment relationships should shape layout.

```ts
export interface GWGraphRelationshipAnalysis {
  linkEdgeCount: number;
  citationEdgeCount: number;
  dependencyEdgeCount: number;
  semanticEdgeCount: number;
  temporalEdgeCount: number;
  referenceEdgeCount: number;

  linkDensity: number;
  citationDensity: number;
  dependencyDensity: number;
  semanticDensity: number;
  temporalDensity: number;
  referenceDensity: number;

  dominantRelationship:
    | "containment"
    | "links"
    | "citations"
    | "dependencies"
    | "semantic"
    | "temporal"
    | "mixed"
    | "none";
}
```

### 8.1 Suggested relationship buckets

```txt
links:
  links_to
  backlink
  wikilink
  hyperlink
  url-link
  page-link

citations:
  cites
  cited_by
  bibliography
  footnote
  reference-citation

dependencies:
  imports
  depends_on
  calls
  extends
  implements
  requires
  package-dependency

semantic:
  similar_to
  same_topic
  mentions_concept
  embedding-neighbor
  topic-neighbor
  entity-cooccurrence

temporal:
  before
  after
  same_day
  same_month
  version_of
  supersedes
  changelog-neighbor

references:
  references
  mentions
  annotates
  embeds
  target_of
```

### 8.2 Density formula

For v0:

```txt
density = relationshipEdgeCount / max(edgeCount, 1)
```

Later, some densities may need source-specific denominators.

Example:

```txt
link density in Obsidian may be better measured against document node count
rather than all edges.
```

---

## 9. Node family analysis

Node family analysis counts normalized node roles.

```ts
export interface GWGraphNodeFamilyAnalysis {
  counts: Partial<Record<GWNodeFamily, number>>;
  ratios: Partial<Record<GWNodeFamily, number>>;

  dominantFamilies: GWNodeFamily[];

  unknownRatio: number;
  documentLikeRatio: number;
  conceptLikeRatio: number;
  containerLikeRatio: number;
  assetRatio: number;
}
```

### 9.1 Family groupings

```txt
document-like:
  document
  section
  fragment

concept-like:
  concept
  entity

container-like:
  root
  collection
  container

relationship-like:
  reference
  bridge

supporting:
  annotation
  asset
```

### 9.2 Unknown ratio implications

```txt
unknownRatio < 0.10:
  high classification confidence

unknownRatio 0.10–0.35:
  moderate classification confidence

unknownRatio > 0.35:
  low classification confidence; keep Universal Balanced high
```

---

## 10. Metadata analysis

Metadata analysis checks for imported graph features that should affect recommendations.

```ts
export interface GWGraphMetadataAnalysis {
  hasExistingPositions: boolean;
  hasZPositions: boolean;
  hasSizeWeights: boolean;
  hasTimestamps: boolean;
  hasEmbeddings: boolean;
  hasSemanticSimilarity: boolean;

  positionedNodeRatio: number;
  timestampedNodeRatio: number;
  weightedNodeRatio: number;
}
```

### 10.1 Existing positions

If many nodes already have x/y positions, recommend:

```txt
Imported Position Preserve
Universal Balanced
```

and warn before applying layouts that will discard imported positions.

### 10.2 Timestamps

If many nodes have timestamps, recommend:

```txt
Timeline River
Semantic Constellation
Universal Balanced
```

depending on relationship signals.

### 10.3 Embeddings or semantic similarity

If embeddings or semantic edges are present, recommend:

```txt
Semantic Constellation
Knowledge Garden
Document Library
```

depending on source kind and hierarchy.

---

## 11. Source kind detection

Source kind detection may be explicit or inferred.

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
```

### 11.1 Explicit source kind

Prefer explicit source adapter metadata when available:

```txt
graph.getAttribute("__lumaweaveSourceKind")
node.sourceKind
node.raw?.sourceKind
```

### 11.2 Inferred source kind

Fallback detection examples:

```txt
filesystem:
  many directory/file nodes
  path-like IDs
  file extensions

obsidian:
  markdown notes
  wikilinks
  tags
  vault metadata

cytoscape:
  imported x/y positions
  Cytoscape-style data fields
  compound nodes

web:
  URL/domain fields
  page/link/asset families
  href-like edges

pdf:
  document/page/quote/citation metadata
  page numbers
  PDF source fields

code:
  imports/calls/depends_on edges
  code/config/test/source file families
```

### 11.3 Confidence

Source confidence should be numeric:

```txt
0.00–0.39:
  weak

0.40–0.69:
  moderate

0.70–1.00:
  strong
```

Low confidence should increase the score of Universal Balanced.

---

## 12. Profile scoring shape

```ts
export interface GWProfileScore {
  profileId: string;
  label: string;
  score: number;

  reasons: string[];
  warnings: string[];

  matchedDimensions: {
    sourceKind?: boolean;
    structure?: boolean;
    relationships?: boolean;
    nodeFamilies?: boolean;
    metadata?: boolean;
    scale?: boolean;
  };
}
```

Score should be clamped:

```txt
0–100
```

Recommended interpretation:

```txt
90–100:
  excellent fit

75–89:
  strong fit

60–74:
  usable fit

40–59:
  weak/experimental fit

0–39:
  not recommended
```

---

## 13. Scoring model v0

The first scoring model should be simple and explainable.

Suggested base:

```txt
base score: 40
```

Then add/subtract factors.

### 13.1 Source kind match

```txt
+20 if source kind matches profile.recommendedFor
+10 if source kind is compatible but not explicit
-10 if source kind strongly conflicts
```

### 13.2 Structure match

```txt
+20 if hierarchy requirement matches containment ratio/depth
+10 if structure partially matches
-15 if profile needs hierarchy and graph has none
-10 if graph is deep but profile is flat/semantic-only
```

### 13.3 Relationship match

```txt
+20 if dominant relationship matches profile
+10 if relationship is present but not dominant
-10 if profile needs links/citations/dependencies and graph has none
```

### 13.4 Node family match

```txt
+15 if dominant families match profile purpose
+8 if useful supporting families exist
-10 if unknown ratio is high and profile is specialized
```

### 13.5 Metadata match

```txt
+15 if profile uses available metadata
+20 if Imported Position Preserve and positioned ratio is high
-20 if profile would destroy imported positions without warning
```

### 13.6 Scale match

```txt
+10 if profile is appropriate for graph size
-10 if graph is large and profile is expensive
-20 if graph is huge and profile is known expensive
```

### 13.7 Universal Balanced safety boost

Universal Balanced should receive:

```txt
+10 if source kind is unknown
+10 if unknown family ratio is high
+10 if no dominant relationship exists
+10 if graph is mixed source
```

Universal Balanced should almost always remain visible, even if not top-ranked.

---

## 14. Recommendation output rules

### 14.1 Default output

Return top 3 recommendations.

Always include Universal Balanced as either:

- top 3 result, or
- pinned fallback below top 3

unless explicitly disabled.

### 14.2 Recommended profile status behavior

Default:

```txt
include active profiles
include legacy profiles only if compatibility mode is enabled
exclude experimental unless user enables experimental layouts
exclude planned
```

### 14.3 Warning behavior

Warnings should appear when:

```txt
layout may discard imported positions
layout may weaken hierarchy
layout needs links but few links exist
layout may be expensive for graph size
node family classification confidence is low
profile is experimental
profile is legacy
```

---

## 15. Example recommendations

### 15.1 Filesystem/code folder

Detected:

```txt
sourceKind: filesystem/code
containmentEdgeRatio: high
dependencyDensity: low/medium
documentLikeRatio: high
```

Recommend:

```txt
1. Hierarchical Containment
2. Dependency Gravity, if imports exist
3. Universal Balanced
```

Reasons:

```txt
- Strong containment structure detected.
- Files/documents are the dominant node family.
- Hierarchical layout preserves folder structure.
```

---

### 15.2 Obsidian vault

Detected:

```txt
sourceKind: obsidian/markdown
containmentEdgeRatio: medium
linkDensity: high
conceptLikeRatio: medium/high
```

Recommend:

```txt
1. Knowledge Garden
2. Semantic Constellation
3. Universal Balanced
```

Reasons:

```txt
- Backlinks or note links are dense enough to shape the layout.
- Tags/concepts were detected.
- Hierarchy exists but should not dominate the graph.
```

---

### 15.3 PDF library

Detected:

```txt
sourceKind: pdf
containmentEdgeRatio: medium/high
citation/reference density: medium
document/section/fragment families present
```

Recommend:

```txt
1. Document Library
2. Citation Field
3. Universal Balanced
```

Reasons:

```txt
- Document and section families are present.
- Containment can preserve book/chapter/page structure.
- References can form cross-document threads.
```

---

### 15.4 Web crawl

Detected:

```txt
sourceKind: web
linkDensity: high
collection/domain/page/asset families present
```

Recommend:

```txt
1. Web Domain Map
2. Semantic Constellation
3. Universal Balanced
```

Reasons:

```txt
- Domain/page structure detected.
- Link density is high.
- Web Domain Map keeps domains readable while links pull pages together.
```

---

### 15.5 Cytoscape import

Detected:

```txt
sourceKind: cytoscape
positionedNodeRatio: high
```

Recommend:

```txt
1. Imported Position Preserve
2. Universal Balanced
3. Semantic Constellation, if semantic edges exist
```

Warnings:

```txt
Applying a new seed layout may overwrite imported positions.
```

---

## 16. Explanation strings

Recommendation reasons should be plain-language.

Good:

```txt
This graph has strong containment structure.
Backlinks are dense enough to shape clusters.
Many nodes already have imported positions.
This layout is safer for large graphs.
```

Avoid:

```txt
containmentEdgeRatio >= 0.6
relationshipWeight +20
profile.recommendedFor matched
```

Developer/debug mode may expose raw values separately.

---

## 17. Diagnostic output

The analysis function should expose diagnostics for debugging.

```ts
diagnostics: {
  warnings: string[];
  notes: string[];
}
```

Examples:

```txt
warning:
  More than 40% of nodes could not be assigned a confident family.

warning:
  Graph has more than 3000 nodes; expensive layouts may perform poorly.

note:
  Existing x/y positions were detected on 92% of nodes.

note:
  Containment edges make up 73% of graph relationships.
```

---

## 18. Determinism

Recommendation scoring must be deterministic.

Given the same graph and profile registry, output order should be stable.

Tie-break order:

```txt
1. higher score
2. active before experimental
3. non-legacy before legacy
4. profile priority, if defined
5. alphabetical label
```

---

## 19. Performance requirements

`analyzeGraphForLayout()` should be cheap enough to run after ingestion.

Target:

```txt
small/medium graphs:
  immediate

large graphs:
  acceptable during load or as debounced analysis

huge graphs:
  analysis should avoid expensive all-pairs operations
```

Do not use O(N²) checks in the recommendation layer.

Do not run physics simulation to decide recommendations in v0.

---

## 20. Implementation sequence

### Pass 1 — Basic analysis

Implement:

```txt
node count
edge count
degree stats
source kind detection
node family counts
relationship counts
imported position detection
```

### Pass 2 — Structure analysis

Implement:

```txt
containment ratio
root count
basic depth estimate
component count
dominant hierarchy flag
```

### Pass 3 — Profile scoring

Implement:

```txt
scoreProfileForGraph()
recommendProfilesForGraph()
reason strings
warning strings
top 3 output
Universal Balanced fallback rule
```

### Pass 4 — UI debug support

Implement:

```txt
Show why payload
matrix mode table data
diagnostic notes/warnings
raw score breakdown, optional
```

---

## 21. Test checklist

### 21.1 Analysis tests

- empty graph produces safe analysis
- single-node graph does not crash
- containment-heavy graph sets `hasDominantHierarchy`
- link-heavy graph produces high `linkDensity`
- existing positions set `hasExistingPositions`
- unknown nodes increase `unknownRatio`

### 21.2 Recommendation tests

- unknown graph recommends Universal Balanced
- containment-heavy graph recommends Hierarchical Containment
- backlink-heavy graph recommends Knowledge Garden
- PDF-like graph recommends Document Library
- web-like graph recommends Web Domain Map
- positioned graph recommends Imported Position Preserve
- huge graph penalizes expensive layouts

### 21.3 Explanation tests

- every recommendation has at least one reason
- warnings appear for imported position overwrite risk
- warnings appear for low classification confidence
- warnings appear for large graph cost risk

---

## 22. Non-goals

This doc does not require:

- machine-learning recommendations
- embedding generation
- simulation-based preview scoring
- visual thumbnail generation
- expensive graph centrality algorithms
- perfect source detection
- perfect family classification
- user preference learning

Those can be added later.

---

## 23. Success criteria

This system is successful when:

- LumaWeave can recommend layouts immediately after graph load
- recommendations are explainable
- Universal Balanced remains a safe fallback
- users see simple choices instead of raw physics
- advanced users can inspect why a profile was recommended
- no recommendation step performs expensive simulation
- the system can add new profiles without hardcoded UI branching

---

## 24. Guiding principle

The recommendation system should not pretend to be smarter than the graph.

It should make the safest good guess, explain the guess, and make switching easy.
