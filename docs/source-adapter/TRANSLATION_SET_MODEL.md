---
id: model.translation.set
title: Translation Set Model
type: manual
status: accepted
version: v73c
domain: source-adapter
cluster: lime
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
depends_on:
  - schema.source.graph.normalized
tags:
  - source-adapter
  - translation
  - set
  - model
  - mapping
  - accepted
---

# Translation Set Model

A **translation set** defines how a source adapter converts source-specific entities and relationships into normalized LumaWeave graph nodes and edges. Adapters extract raw facts; translation sets map those facts into graph structure.

```
raw extracted facts
→ translation set
→ normalized LumaWeave graph
```

---

## Why Translation Sets Matter

Without translation sets, every adapter would invent its own graph shape. Translation sets give each adapter a repeatable vocabulary: source entity → node type, source relationship → edge type, source proof → evidence, source confidence → observed/inferred/ai-inferred.

---

## Translation Set Type

```typescript
type TranslationSet = {
  sourceType: string;           // "website" | "codebase" | "openapi" | ...
  nodeMappings: Record<string, NodeMapping>;
  edgeMappings: Record<string, EdgeMapping>;
};

type NodeMapping = {
  nodeType: string;             // e.g. "website.page"
  labelField: string;           // which source field becomes the label
  idStrategy: string;           // how to generate stable IDs
  metadataFields?: string[];    // additional fields to include
};

type EdgeMapping = {
  edgeType: string;             // e.g. "links_to"
  sourceField: string;          // source entity field pointing to origin
  targetField: string;          // source entity field pointing to target
  labelField?: string;
  weightField?: string;
  confidenceClass: "observed" | "inferred" | "ai-inferred";
  evidenceStrategy: string;     // how to generate evidence entries
};
```

---

## Website Adapter Translation Set Example

```typescript
{
  sourceType: "website",
  nodeMappings: {
    "html-page": {
      nodeType: "website.page",
      labelField: "title",
      idStrategy: "url-normalized",
      metadataFields: ["url", "statusCode", "wordCount"]
    },
    "html-heading": {
      nodeType: "website.heading",
      labelField: "text",
      idStrategy: "url-plus-anchor"
    }
  },
  edgeMappings: {
    "html-link": {
      edgeType: "links_to",
      sourceField: "fromUrl",
      targetField: "toUrl",
      confidenceClass: "observed",
      evidenceStrategy: "html-anchor"
    }
  }
}
```

---

## Translation Set Guardrails

```
Never mix confidence classes in one mapping without clear labeling
ID strategy must produce stable IDs across re-ingestion
Evidence strategy must point to a real source artifact
Translation sets are static definitions — no runtime logic
One translation set per adapter type (not per source instance)
```
