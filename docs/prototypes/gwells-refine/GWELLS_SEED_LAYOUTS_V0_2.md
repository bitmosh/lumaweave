# GWells v0.2 — Seed Layouts

**Status:** Draft  
**Purpose:** Define the first v0.2 seed layouts, their visual guarantees, their input assumptions, and their role in the profile system.  
**Intended location:** `lumaweave/docs/prototypes/gwells-refine/GWELLS_SEED_LAYOUTS_V0_2.md`  
**Replaces:** Nothing yet. New planning/implementation doc.  
**Related:**
- `GWELLS_V0_2_IMPLEMENTATION_BRIDGE.md`
- `GWELLS_PROFILE_REGISTRY_CONTRACT.md`
- `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`
- `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`
- `GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`

---

## 1. Summary

Seed layouts are the visible starting arrangements for GWells physics.

They do not need to solve the entire graph. They need to give the simulation a sane, deterministic, readable opening state.

The v0.2 seed layout system should support multiple data types without forcing every source adapter to pretend its graph is a directory tree.

The key shift:

```txt
Current seeders:
  optimized around directory/code graph structure

v0.2 seed layouts:
  source-aware but family-driven arrangements
```

Seed layouts should work with normalized node families and edge families rather than hardcoded `spine`, `directory`, and `file` assumptions.

---

## 2. Design mantra

The seed layout does not need to be perfect.

The seed layout must never be awful.

A bad seed creates chaos the physics engine has to fight. A good seed makes the physics engine look smarter than it is.

---

## 3. Seed layout vs seed function

A **seed function** is executable code that writes node positions.

A **seed layout** is a product/profile-facing arrangement option.

During the v0.2 bridge phase, seed layouts may point to existing seed functions:

```txt
gwells.seed-layout.radial-backbone
  → gwells.seed.radial-backbone

gwells.seed-layout.parallel-spines
  → gwells.seed.parallel-spines
```

Future seed layouts may instead use seed primitives:

```txt
placeRing()
placeGrid()
placeTree()
placePhyllotaxis()
placeComponentIslands()
placeTimeline()
placeDomainMap()
```

This distinction lets the UI talk about arrangements while the engine talks about implementations.

---

## 4. Seed layout registry target

Recommended type:

```ts
export interface GWSeedLayoutEntry {
  id: string;
  label: string;
  description: string;
  status: "active" | "experimental" | "planned" | "legacy";

  seedFunctionId?: string;

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

  guarantees?: string[];
  failureModes?: string[];

  uiHints?: {
    goodFor?: string[];
    avoidFor?: string[];
    previewLabel?: string;
    complexity?: "simple" | "moderate" | "advanced";
  };
}
```

---

## 5. First v0.2 seed layouts

The first useful set should be diverse but not huge.

Recommended first batch:

```txt
1. Universal Balanced
2. Hierarchical Containment
3. Knowledge Garden
4. Document Library
5. Web Domain Map
6. Semantic Constellation
7. Imported Position Preserve
8. Legacy Radial Backbone
9. Legacy Parallel Spines
```

The first six create the new product direction.

The last three preserve compatibility and import safety.

---

## 6. Universal Balanced

### ID

```txt
gwells.seed-layout.universal-balanced
```

### Purpose

Universal Balanced is the fallback seed layout for unknown, mixed, incomplete, or weakly structured graphs.

This is the most important seed layout in v0.2.

It should be boring, stable, and hard to embarrass.

### Good for

- unknown source types
- mixed imports
- Cytoscape JSON without reliable layout intent
- early ingestion results
- incomplete metadata
- small/medium exploratory graphs
- fallback after source-specific layout failure

### Input assumptions

Universal Balanced assumes only:

- nodes exist
- edges may or may not exist
- some node family information may exist
- some existing positions may exist
- graph may have disconnected components

It must not require containment edges.

### Visual behavior

Universal Balanced should:

- place high-degree nodes closer to the center
- separate disconnected components into visible islands
- place collections/containers as loose anchors
- place documents around nearest meaningful parent or strongest neighbor
- place unknown nodes as safe document-like nodes
- avoid hard overlap
- preserve imported positions when they look intentional

### Suggested algorithm

```txt
1. Analyze connected components.
2. Sort components by size.
3. Place components in a loose ring/grid around origin.
4. Inside each component:
   - choose local anchors by family and degree
   - place anchors near component center
   - place documents with phyllotaxis/ring around strongest anchor
   - place concepts/entities near related documents
   - place assets/annotations as satellites
5. Write seed positions.
6. Let physics refine.
```

### Guarantees

- Does not require hierarchy.
- Does not collapse disconnected components into one pile.
- Unknown nodes remain visible.
- Safe fallback for every source kind.
- Acceptable even when analysis confidence is low.

### Failure modes

- May look generic.
- May not emphasize the user's actual intent.
- Large dense graphs may still need scale-specific optimization.

### Recommendation priority

Always available.

Should appear in recommendations when:

- source kind is unknown
- family confidence is low
- graph has many unknown nodes
- no dominant structure exists
- selected profile fails

---

## 7. Hierarchical Containment

### ID

```txt
gwells.seed-layout.hierarchical-containment
```

### Purpose

Hierarchical Containment is the generalized replacement for the current directory-first seed layouts.

It should work for any graph where containment is the dominant structure.

### Good for

- folders
- codebases
- markdown directories
- document outlines
- PDF chapter/page structures
- ebook structures
- website path hierarchies
- nested collections

### Input assumptions

- containment edges are available
- containers/documents can be identified
- graph has roots or synthetic roots can be created
- depth is meaningful

### Visual behavior

Hierarchical Containment should:

- place roots as stable anchors
- place containers along branches
- place documents/leaves around containers
- preserve depth visually
- keep sibling groups separated
- keep cross-links secondary

### Suggested algorithm

```txt
1. Build configurable containment map.
2. Identify roots.
3. Place each root as an anchor.
4. Recursively place child containers outward by depth.
5. Place document leaves using phyllotaxis around parent containers.
6. Place sections/fragments as satellites around documents.
7. Store seeded parent-child distances for spring rest lengths.
```

### Guarantees

- Strong hierarchy readability.
- Good parent-child locality.
- Depth is visible.
- Works beyond filesystem graphs.

### Failure modes

- Poor choice for flat graphs.
- Poor choice when semantic links should dominate.
- Can overemphasize folder/container structure for notes or web graphs.

### Recommendation priority

Recommend when:

- containment edge ratio is high
- max depth is meaningful
- containers/documents dominate
- source kind is filesystem, markdown, PDF, ebook, code, or web path structure

---

## 8. Knowledge Garden

### ID

```txt
gwells.seed-layout.knowledge-garden
```

### Purpose

Knowledge Garden arranges note-like data around topics, tags, concepts, and backlinks.

It should feel less like a file tree and more like a living field of related ideas.

### Good for

- Obsidian vaults
- markdown notes
- wiki-like datasets
- backlink-heavy graphs
- tag-heavy knowledge bases
- concept maps
- personal research notes

### Input assumptions

At least one of these should exist:

- links/backlinks
- tags
- concepts
- entities
- note/document families
- semantic similarity

Containment may exist but should not dominate.

### Visual behavior

Knowledge Garden should:

- place concepts/tags as topic hubs
- place notes/documents around relevant topics
- use links/backlinks as cluster-shaping springs
- keep folders/containers visible but secondary
- place orphan notes on the periphery
- keep bridge notes between topic clusters

### Suggested algorithm

```txt
1. Identify topic hubs from concept/entity/tag families.
2. If no explicit topics exist, infer hubs from high-degree documents.
3. Place topic hubs in a ring or soft constellation.
4. Assign documents to nearest/strongest topic by edge count or metadata.
5. Place documents around topic hubs with phyllotaxis or local rings.
6. Place bridge documents between the hubs they connect.
7. Place containers as background/secondary anchors.
```

### Guarantees

- Links matter more than folder location.
- Topic hubs become visible.
- Backlink-heavy notes pull closer together.
- Orphans remain visible.

### Failure modes

- Weak if no links, tags, or concepts exist.
- May make folder hierarchy less obvious.
- Dense backlink graphs may need clustering/LOD later.

### Recommendation priority

Recommend when:

- source kind is Obsidian or markdown
- link density is moderate/high
- concept/tag/entity nodes exist
- graph is not purely hierarchical

---

## 9. Document Library

### ID

```txt
gwells.seed-layout.document-library
```

### Purpose

Document Library arranges books, PDFs, papers, chapters, pages, sections, quotes, and references in a readable library-like map.

It should make collections and documents feel stable while allowing citations/references to form threads across the layout.

### Good for

- PDF libraries
- ebook libraries
- research papers
- long markdown documents
- article collections
- extracted notes/highlights
- citation/reference graphs

### Input assumptions

Useful signals include:

- collection/document/section/fragment families
- containment edges
- citation/reference edges
- author/topic metadata
- timestamps or publication dates

### Visual behavior

Document Library should:

- place collections as anchors
- place documents/books around collections
- place chapters/sections as bands near their parent document
- place quotes/highlights/fragments as satellites
- place citations/references as cross-document threads
- keep document identity stable and readable

### Suggested algorithm

```txt
1. Identify collections/libraries.
2. Place collections as anchors.
3. Place documents around collection anchors.
4. For each document:
   - place sections/pages in ordered bands or arcs
   - place fragments as satellites
5. Place reference/citation nodes between related documents.
6. If topics exist, gently pull related documents toward topic hubs.
```

### Guarantees

- Documents remain primary.
- Internal document structure stays local.
- References can cross collections without destroying document grouping.
- Scales better than showing every fragment as a peer node.

### Failure modes

- Too heavy for simple folder views.
- Requires good family classification to shine.
- Very large libraries need collapse/LOD later.

### Recommendation priority

Recommend when:

- source kind is PDF, ebook, markdown, or mixed document library
- document/section/fragment families exist
- citation/reference edges exist
- containment exists but should not fully dominate

---

## 10. Web Domain Map

### ID

```txt
gwells.seed-layout.web-domain-map
```

### Purpose

Web Domain Map arranges crawled or imported web pages around domains, paths, navigation links, and embedded assets.

It should make websites feel like navigable territories.

### Good for

- HTML/web page ingestion
- crawled websites
- documentation sites
- linked pages
- web archives
- sitemap-like graphs

### Input assumptions

Useful signals include:

- domain nodes
- page/document nodes
- path/container nodes
- link/reference edges
- asset nodes
- existing URL metadata

### Visual behavior

Web Domain Map should:

- place domains as collection anchors
- place path groups as containers
- place pages around domain/path anchors
- use links as springs
- place highly linked pages as bridge nodes
- place assets as satellites of pages

### Suggested algorithm

```txt
1. Group pages by domain.
2. Place domains as major anchors.
3. Place path groups around domain anchors.
4. Place pages around path groups or domains.
5. Use page-to-page links to pull navigation clusters together.
6. Mark high-betweenness/high-degree pages as bridge candidates.
7. Place assets as page satellites.
```

### Guarantees

- Domains remain visually distinct.
- Pages stay near their domain/path group.
- Links influence layout.
- Assets do not dominate.

### Failure modes

- Not useful for local-only document graphs.
- Dense link graphs may need link filtering.
- Cross-domain link spam may create visual noise.

### Recommendation priority

Recommend when:

- source kind is web
- URLs/domains exist
- link density is meaningful
- page/document nodes dominate

---

## 11. Semantic Constellation

### ID

```txt
gwells.seed-layout.semantic-constellation
```

### Purpose

Semantic Constellation arranges nodes around conceptual similarity rather than hierarchy.

It should support exploratory maps where clusters, bridges, and meaning are more important than source structure.

### Good for

- mixed research data
- semantic similarity graphs
- embeddings
- concept/entity maps
- AI-generated clusters
- exploratory browsing

### Input assumptions

Best with at least one of:

- semantic similarity edges
- embeddings
- concept/entity nodes
- cluster labels
- topic metadata
- high-quality tags

### Visual behavior

Semantic Constellation should:

- place semantic clusters as local constellations
- place concepts/entities as hubs or labels
- place bridge nodes between clusters
- reduce hierarchy dominance
- keep disconnected semantic groups separated

### Suggested algorithm

```txt
1. Identify semantic clusters from edges, embeddings, or topic metadata.
2. Place cluster centers in a ring/sphere-like constellation.
3. Place documents/fragments around semantic cluster centers.
4. Place concept/entity hubs near cluster centers.
5. Place bridge nodes between connected clusters.
6. Use containment only as a weak local stabilizer.
```

### Guarantees

- Semantic grouping dominates.
- Hierarchy becomes secondary.
- Bridge nodes become legible.
- Mixed data has a meaningful non-folder fallback.

### Failure modes

- Weak without semantic signals.
- Can hide source hierarchy.
- Similarity edges may need thresholding.

### Recommendation priority

Recommend when:

- embeddings exist
- semantic similarity edges exist
- concepts/entities dominate
- user intent is exploratory clustering

---

## 12. Imported Position Preserve

### ID

```txt
gwells.seed-layout.imported-position-preserve
```

### Purpose

Imported Position Preserve respects coordinates supplied by imported graph formats.

This is especially useful for Cytoscape JSON or any external graph format where the layout itself carries meaning.

### Good for

- Cytoscape JSON
- manually arranged graphs
- imported diagrams
- saved LumaWeave layouts
- external graph tools

### Input assumptions

- some or all nodes have x/y positions
- imported positions are intentional
- user may expect layout fidelity

### Visual behavior

Imported Position Preserve should:

- keep existing x/y positions
- normalize only if required
- fill missing node positions around nearest known neighbors
- avoid immediately reseeding the whole graph
- optionally add light physics refinement

### Suggested algorithm

```txt
1. Detect nodes with existing x/y.
2. Compute bounding box and normalize if necessary.
3. Preserve known positions.
4. For nodes missing positions:
   - place near neighbors with known positions
   - otherwise place in peripheral fallback islands
5. Apply low seedAdherence physics.
```

### Guarantees

- Does not destroy imported layout intent.
- Missing positions get reasonable fallback placement.
- Safe for external graph formats.

### Failure modes

- Bad imported coordinates remain bad unless user reseeds.
- Not ideal when imported positions are arbitrary.
- May preserve visual clutter.

### Recommendation priority

Recommend when:

- existing positions are detected
- source kind is Cytoscape
- source format likely encodes layout intent

---

## 13. Legacy Radial Backbone

### ID

```txt
gwells.seed-layout.radial-backbone
```

### Purpose

Compatibility wrapper around the existing radial-backbone seed function.

### Current implementation

```txt
gwells.seed.radial-backbone
```

### Good for

- existing LumaWeave code/folder graphs
- regression testing
- preserving old behavior
- legacy visual comparisons

### Notes

This should remain available but should not be the primary universal recommendation for all data types.

---

## 14. Legacy Parallel Spines

### ID

```txt
gwells.seed-layout.parallel-spines
```

### Purpose

Compatibility wrapper around the existing parallel-spines seed function.

### Current implementation

```txt
gwells.seed.parallel-spines
```

### Good for

- existing LumaWeave code/folder graphs
- large directory structures
- visual comparison to previous FA2-like dual vertical layouts
- regression testing

### Notes

The current implementation stores `z` positions for future 3D use, but the engine remains 2D until z integration is implemented.

---

## 15. Seed primitive library target

Seed layouts should eventually be composed from reusable primitives.

Recommended primitives:

```ts
placeRing(nodes, options)
placeGrid(nodes, options)
placeLine(nodes, options)
placeTree(root, children, options)
placeRadialTree(root, children, options)
placePhyllotaxis(nodes, options)
placeComponentIslands(components, options)
placeTimeline(nodes, options)
placeDomainMap(domains, pages, options)
placeImportedPositions(graph, options)
```

### First primitive candidates

Start with:

```txt
placePhyllotaxis
placeComponentIslands
placeRing
placeTree
placeImportedPositions
```

These unlock most v0.2 seed layouts.

---

## 16. Shared seed context target

Current seed functions receive:

```ts
GWSeedFunctionContext {
  graph
  config
}
```

v0.2 seed layouts will need more context.

Proposed future context:

```ts
export interface GWSeedLayoutContext {
  graph: Graph;
  config: GWDialectConfig;
  analysis?: GWGraphAnalysis;
  familyMap?: GWNodeFamilyMap;
  overrideState?: GWProfileOverrideState;

  getNodeFamily?: (nodeId: string, attrs: Record<string, unknown>) => GWNodeFamily;
  getNodeWellType?: (nodeId: string, attrs: Record<string, unknown>) => string | null;
}
```

Bridge phase can keep using `GWSeedFunctionContext` while reserving this shape.

---

## 17. Edge family assumptions

Seed layouts should eventually understand edge families such as:

```txt
contains
links_to
references
cites
imports
depends_on
mentions
embeds
annotates
similar_to
chronologically_near
```

But the first pass should only require:

```txt
contains
links_to / references
similar_to, if available
```

Edge-type expansion should be coordinated with the relationship-aware physics work.

---

## 18. Visual quality checklist

Every active seed layout should be checked against this list.

A seed layout is acceptable when:

- nodes do not start in one pile
- disconnected components are visible
- roots/collections are visually identifiable
- unknown nodes still appear
- parent-child locality is reasonable when containment exists
- high-degree nodes do not instantly dominate the whole canvas
- imported positions are not destroyed unless user asks
- seed positions are deterministic
- physics refinement improves the layout instead of fighting it

---

## 19. Testing strategy

### 19.1 Unit tests

Test:

- seed layout registry lookup
- seed layout status filtering
- seed layout source-kind recommendations
- deterministic output for primitive functions
- fallback placement for unknown nodes

### 19.2 Fixture graphs

Create small fixture graphs:

```txt
unknown-flat.graph.json
folder-tree.graph.json
obsidian-links.graph.json
pdf-library.graph.json
web-domain.graph.json
semantic-clusters.graph.json
cytoscape-positioned.graph.json
```

Each fixture should include expected seed layout recommendations.

### 19.3 Visual smoke tests

For each seed layout, inspect:

- initial seeded positions before physics
- layout after 30 frames
- layout after convergence
- selected-node override behavior
- family remap behavior

---

## 20. Implementation sequence

### Pass 1 — Registry entries

Add `seedLayouts.ts` with registry entries and lookup helpers.

No new algorithms required.

Map legacy seed layouts to existing seed functions.

### Pass 2 — Universal Balanced prototype

Implement the first truly generic seed layout.

Use:

- connected components
- degree-based center choice
- ring/grid component placement
- phyllotaxis local placement

### Pass 3 — Hierarchical Containment prototype

Generalize directory seeding into configurable containment seeding.

Avoid hardcoded `spine`, `directory`, and `file` where possible.

### Pass 4 — Imported Position Preserve

Add a safe preserve mode for Cytoscape/external layouts.

### Pass 5 — Knowledge Garden / Document Library placeholders

Register these profiles and seed layouts with planned/experimental status first.

Implement after family mapping and edge-type detection mature.

---

## 21. Non-goals

This doc does not require:

- true 3D physics
- Barnes-Hut optimization
- full semantic embeddings
- perfect automatic clustering
- all layout previews
- complete UI implementation
- replacing current seeders immediately

---

## 22. Success criteria

The v0.2 seed layout system is successful when:

- legacy seeders still work
- seed layouts are profile-facing options
- Universal Balanced can seed unknown graphs safely
- Hierarchical Containment works beyond directory trees
- imported positions can be preserved
- future layouts can be added through the registry
- LumaWeave can recommend seed layouts without hardcoded UI branches

---

## 23. Guiding principle

Seed first for sanity.

Simulate second for life.
