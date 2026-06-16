# GWells Node Families and Universal Well Types

**Status:** Draft  
**Purpose:** Define the source-agnostic node family vocabulary and universal well type set used by GWells v0.2 layout profiles.  
**Intended location:** `docs/planning/GWELLS_NODE_FAMILIES_AND_WELL_TYPES.md`  
**Replaces:** Nothing yet. New planning doc.  
**Related:** `GWELLS_V0_2_LAYOUT_PROFILE_SYSTEM.md`, `GWELLS_LAYOUT_MATRIX_AND_GUIDE.md`

---

## 1. Summary

GWells currently uses domain-specific node roles such as spine, directory, file, doc, code, config, and fixture. That works for directory-oriented layouts, but does not scale cleanly to Obsidian vaults, PDF libraries, ebooks, web pages, Cytoscape imports, semantic graphs, or mixed datasets.

GWells v0.2 introduces two source-agnostic concepts:

1. Node Families
2. Universal Well Types

A node family describes what a node means in the loaded graph.

A well type describes how that node behaves in the physics system.

A layout profile maps node families to well types.

---

## 2. Why this distinction matters

Source adapters should not have to emit GWells-specific well types directly.

Instead, ingestion should produce normalized semantic families.

Then GWells profiles decide how those families behave.

Example:

```txt
PDF page
  source kind: pdf
  node family: section
  default well in Document Library profile: section-band
  default well in Semantic Constellation profile: semantic-cluster
```

The same node can behave differently depending on the selected layout profile.

---

## 3. Node family vocabulary

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

## 4. Node family definitions

### 4.1 root

Top-level graph origin or imported dataset root.

Examples:

- uploaded folder root
- vault root
- website root
- library root
- Cytoscape import root
- artificial graph root

Default behavior:

- stable anchor
- usually central or top-level
- may be hidden if visually noisy

### 4.2 collection

A meaningful group of documents or containers.

Examples:

- folder
- Obsidian vault section
- PDF library
- ebook series
- web domain
- package/module group
- topic collection

Default behavior:

- strong anchor
- attracts member documents/containers
- repels other collections enough to prevent overlap

### 4.3 container

A structural parent inside a collection.

Examples:

- directory
- chapter
- section group
- domain path segment
- module folder
- nested outline node

Default behavior:

- branch point
- parent for documents/sections/fragments
- important in hierarchical layouts
- secondary in semantic layouts

### 4.4 document

A primary readable or inspectable content unit.

Examples:

- markdown note
- source file
- PDF
- ebook
- web page
- article
- paper
- code file
- documentation page

Default behavior:

- orbits parent collection/container
- clusters by topic/link/reference when profile allows
- often the main visible node type

### 4.5 section

A subdivision of a document.

Examples:

- heading
- chapter section
- PDF page
- article section
- code symbol group
- document outline node

Default behavior:

- forms bands or local orbits around document
- may collapse into parent document at low zoom
- useful for document-library layouts

### 4.6 fragment

Small content unit inside a section/document.

Examples:

- paragraph
- quote
- code block
- extracted passage
- table row
- search result snippet

Default behavior:

- satellite of document/section
- often hidden or collapsed by default
- becomes useful in deep inspection mode

### 4.7 concept

Abstract topic or semantic label.

Examples:

- tag
- topic
- keyword
- embedding cluster label
- generated concept
- category

Default behavior:

- topic hub
- attracts related documents/fragments/entities
- can become dominant in knowledge-garden or semantic layouts

### 4.8 entity

Concrete named thing extracted from content.

Examples:

- person
- organization
- location
- project name
- package name
- API name
- product name

Default behavior:

- similar to concept
- may cluster documents that mention it
- can become a bridge if mentioned across clusters

### 4.9 reference

A formal or informal relationship target.

Examples:

- citation
- backlink target
- footnote
- URL reference
- import target
- dependency target
- bibliography item

Default behavior:

- forms threads across documents
- pulls related documents together
- useful in citation/dependency layouts

### 4.10 annotation

User or system-created note attached to another node.

Examples:

- highlight
- comment
- margin note
- extracted summary
- AI annotation
- user bookmark

Default behavior:

- satellite of target node
- low mass
- high seed adherence
- optional visibility

### 4.11 asset

Non-text or supporting resource.

Examples:

- image
- video
- audio
- PDF attachment
- CSS file
- script
- embedded media
- downloadable file

Default behavior:

- satellite of owning document/page/container
- usually visually smaller
- usually less structurally dominant

### 4.12 bridge

Node that connects otherwise separate clusters.

Examples:

- highly linked page
- shared reference
- dependency hub
- concept spanning multiple topics
- document with high betweenness
- index page

Default behavior:

- stabilizes between clusters
- should not be pulled too tightly into one cluster
- can be detected automatically from graph metrics

### 4.13 unknown

Fallback family when no confident classification exists.

Examples:

- untyped imported node
- incomplete source adapter output
- unsupported source type
- ambiguous entity

Default behavior:

- safe document-like behavior
- never ignored by default
- should remain legible

---

## 5. Universal well type vocabulary

```ts
export type GWUniversalWellTypeId =
  | "gwells.well.collection-anchor"
  | "gwells.well.topic-hub"
  | "gwells.well.document-orbit"
  | "gwells.well.section-band"
  | "gwells.well.annotation-satellite"
  | "gwells.well.reference-thread"
  | "gwells.well.semantic-cluster"
  | "gwells.well.temporal-lane"
  | "gwells.well.bridge-node"
  | "gwells.well.asset-satellite";
```

---

## 6. Universal well type definitions

### 6.1 collection-anchor

A stable anchor for major groups.

Best for:

- root
- collection
- major container
- domain
- library
- vault area

Behavior:

- medium/high mass
- strong local gravity
- moderate repulsion from other anchors
- low motion
- may be pinned or elastic-pinned depending on profile

### 6.2 topic-hub

A hub that attracts related content.

Best for:

- concept
- tag
- entity
- semantic cluster label
- high-degree topic node

Behavior:

- attracts documents/fragments/entities
- repels other topic hubs
- remains visually prominent
- may drift based on relationships

### 6.3 document-orbit

A primary content node orbiting a parent or hub.

Best for:

- document
- note
- file
- page
- article
- paper

Behavior:

- springs to parent collection/container/topic
- repels sibling documents
- responds to links/references/semantic pulls
- should be stable and readable

### 6.4 section-band

A document subdivision arranged near its parent.

Best for:

- section
- heading
- chapter
- page
- outline node

Behavior:

- aligns into bands or ordered local clusters
- stays close to document parent
- lower visual priority than document nodes
- can collapse at low zoom

### 6.5 annotation-satellite

A small attached node.

Best for:

- annotation
- highlight
- quote
- comment
- extracted passage
- fragment

Behavior:

- strong spring to target
- low mass
- low repulsion
- high seed adherence
- optional visibility

### 6.6 reference-thread

A node or relationship endpoint that forms cross-document threads.

Best for:

- citation
- reference
- import target
- dependency target
- backlink target
- bibliography item

Behavior:

- creates long-range springs
- should not completely collapse clusters
- good for showing cross-document structure

### 6.7 semantic-cluster

A node participating primarily in semantic grouping.

Best for:

- concept-heavy documents
- embedding clusters
- mixed notes
- generated topic groups
- unstructured content

Behavior:

- attracted to similar nodes
- hierarchy is secondary
- useful for exploratory maps

### 6.8 temporal-lane

A node arranged along time.

Best for:

- dated note
- event
- changelog entry
- journal entry
- historical document
- versioned artifact

Behavior:

- aligns by timestamp
- can combine with semantic clustering
- useful for timeline views

### 6.9 bridge-node

A connector between clusters.

Best for:

- high-betweenness node
- index page
- hub document
- cross-topic reference
- dependency bridge

Behavior:

- medium/high mass
- moderate attraction to multiple clusters
- resists over-collapsing into one group
- helps preserve graph readability

### 6.10 asset-satellite

Supporting media/resource node.

Best for:

- image
- audio
- video
- attachment
- script
- style file
- embedded resource

Behavior:

- orbits owning document/page/container
- low structural influence
- may be collapsed or hidden by default

---

## 7. Default family-to-well map

The universal fallback map should be safe for unknown or mixed data.

```ts
export const UNIVERSAL_BALANCED_FAMILY_MAP: Record<GWNodeFamily, GWUniversalWellTypeId> = {
  root: "gwells.well.collection-anchor",
  collection: "gwells.well.collection-anchor",
  container: "gwells.well.collection-anchor",
  document: "gwells.well.document-orbit",
  section: "gwells.well.section-band",
  fragment: "gwells.well.annotation-satellite",
  concept: "gwells.well.topic-hub",
  entity: "gwells.well.topic-hub",
  reference: "gwells.well.reference-thread",
  annotation: "gwells.well.annotation-satellite",
  asset: "gwells.well.asset-satellite",
  bridge: "gwells.well.bridge-node",
  unknown: "gwells.well.document-orbit",
};
```

---

## 8. Example profile-specific family maps

### 8.1 Knowledge Garden

```ts
export const KNOWLEDGE_GARDEN_FAMILY_MAP: Record<GWNodeFamily, GWUniversalWellTypeId> = {
  root: "gwells.well.collection-anchor",
  collection: "gwells.well.collection-anchor",
  container: "gwells.well.semantic-cluster",
  document: "gwells.well.document-orbit",
  section: "gwells.well.section-band",
  fragment: "gwells.well.annotation-satellite",
  concept: "gwells.well.topic-hub",
  entity: "gwells.well.topic-hub",
  reference: "gwells.well.reference-thread",
  annotation: "gwells.well.annotation-satellite",
  asset: "gwells.well.asset-satellite",
  bridge: "gwells.well.bridge-node",
  unknown: "gwells.well.document-orbit",
};
```

### 8.2 Document Library

```ts
export const DOCUMENT_LIBRARY_FAMILY_MAP: Record<GWNodeFamily, GWUniversalWellTypeId> = {
  root: "gwells.well.collection-anchor",
  collection: "gwells.well.collection-anchor",
  container: "gwells.well.collection-anchor",
  document: "gwells.well.document-orbit",
  section: "gwells.well.section-band",
  fragment: "gwells.well.annotation-satellite",
  concept: "gwells.well.topic-hub",
  entity: "gwells.well.topic-hub",
  reference: "gwells.well.reference-thread",
  annotation: "gwells.well.annotation-satellite",
  asset: "gwells.well.asset-satellite",
  bridge: "gwells.well.bridge-node",
  unknown: "gwells.well.document-orbit",
};
```

### 8.3 Semantic Constellation

```ts
export const SEMANTIC_CONSTELLATION_FAMILY_MAP: Record<GWNodeFamily, GWUniversalWellTypeId> = {
  root: "gwells.well.collection-anchor",
  collection: "gwells.well.semantic-cluster",
  container: "gwells.well.semantic-cluster",
  document: "gwells.well.semantic-cluster",
  section: "gwells.well.semantic-cluster",
  fragment: "gwells.well.annotation-satellite",
  concept: "gwells.well.topic-hub",
  entity: "gwells.well.topic-hub",
  reference: "gwells.well.reference-thread",
  annotation: "gwells.well.annotation-satellite",
  asset: "gwells.well.asset-satellite",
  bridge: "gwells.well.bridge-node",
  unknown: "gwells.well.semantic-cluster",
};
```

---

## 9. Source adapter mapping examples

### 9.1 Filesystem

```txt
root folder       → root
folder            → container
file              → document
image/media       → asset
unknown file      → document
```

### 9.2 Obsidian

```txt
vault             → root
folder            → container
note              → document
heading           → section
block             → fragment
tag               → concept
wikilink target   → reference
attachment        → asset
```

### 9.3 PDF Library

```txt
library           → root
collection        → collection
PDF/book          → document
chapter           → section
page              → section
quote/highlight   → fragment
citation          → reference
topic/entity      → concept/entity
```

### 9.4 Web

```txt
crawl root        → root
domain            → collection
path group        → container
page              → document
heading section   → section
paragraph/snippet → fragment
link target       → reference
asset             → asset
```

### 9.5 Cytoscape JSON

```txt
graph root        → root, if synthesized
compound node     → container
node with degree  → document or bridge
node with label   → document
imported position → preserve via profile metadata
unknown           → unknown
```

---

## 10. Override behavior

GWells should support layered well assignment.

Resolution order:

```txt
1. Selected node override
2. Detected source type override
3. Node family override
4. Active profile family map
5. Universal fallback map
6. unknown → document-orbit
```

This allows both safe defaults and detailed manual control.

---

## 11. UI labels

Internal IDs should not be shown as the primary label.

Use friendly labels:

| Internal Well Type | UI Label |
|---|---|
| `gwells.well.collection-anchor` | Collection Anchor |
| `gwells.well.topic-hub` | Topic Hub |
| `gwells.well.document-orbit` | Document Orbit |
| `gwells.well.section-band` | Section Band |
| `gwells.well.annotation-satellite` | Annotation Satellite |
| `gwells.well.reference-thread` | Reference Thread |
| `gwells.well.semantic-cluster` | Semantic Cluster |
| `gwells.well.temporal-lane` | Temporal Lane |
| `gwells.well.bridge-node` | Bridge Node |
| `gwells.well.asset-satellite` | Asset Satellite |

---

## 12. Anti-overwhelm rule

Users should be able to use these concepts without learning these concepts.

The default UI should say:

```txt
Treat notes like topic clusters.
Make this node a hub.
Apply this behavior to all PDFs.
Use document-library structure.
```

The advanced UI can reveal:

```txt
GWNodeFamily.document → gwells.well.document-orbit
```

---

## 13. Implementation sequence

1. Add `GWNodeFamily` type.
2. Add universal well type IDs.
3. Add universal well type registry entries.
4. Add default family maps.
5. Add profile-specific family maps.
6. Add layered override resolver.
7. Add UI label metadata.
8. Add source adapter mapping helpers.
9. Add tests for fallback behavior.
10. Add selected-node and family override behavior.

---

## 14. Success criteria

This system is successful when:

- every node can be assigned a family
- every family can resolve to a well type
- unknown data still looks sane
- users can apply full mappings
- users can cherry-pick one family
- users can override one node
- source adapters do not need to know physics internals
- new data types can be added without rewriting the engine

---

## 15. Guiding principle

Families describe meaning.

Wells describe motion.

Profiles connect the two.
