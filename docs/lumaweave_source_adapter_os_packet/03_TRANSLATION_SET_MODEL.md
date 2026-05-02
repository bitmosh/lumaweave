# Translation Set Model

## Summary

A **translation set** defines how a source adapter converts source-specific entities and relationships into normalized LumaWeave graph nodes and edges.

Adapters extract raw facts. Translation sets map those facts into graph structure.

```txt
raw extracted facts
→ translation set
→ normalized LumaWeave graph
```

## Why Translation Sets Matter

Without translation sets, every adapter would invent its own graph shape. That would make rendering, QA, filtering, and inspection inconsistent.

Translation sets give each adapter a repeatable vocabulary:

```txt
source entity → node type
source relationship → edge type
source proof → evidence
source confidence → observed/inferred/ai-inferred
```

## Translation Set Type Sketch

```ts
type TranslationSet = {
  sourceType: string;
  nodeMappings: Record<string, NodeMapping>;
  edgeMappings: Record<string, EdgeMapping>;
};

type NodeMapping = {
  nodeType: string;
  labelField: string;
  idStrategy: string;
  metadataFields?: string[];
};

type EdgeMapping = {
  edgeType: string;
  sourceField: string;
  targetField: string;
  labelField?: string;
  weightField?: string;
  confidence: "observed" | "inferred" | "ai-inferred";
  evidenceStrategy: string;
};
```

## Website Translation Set

Source entities:

```txt
page
heading
link
image
script
stylesheet
topic
external_domain
```

Luma node types:

```txt
website.page
website.heading
website.asset
website.topic
website.domain
```

Luma edge types:

```txt
links_to
has_heading
mentions_topic
embeds_asset
belongs_to_domain
canonicalizes_to
```

Example:

```ts
const websiteTranslationSet: TranslationSet = {
  sourceType: "website",
  nodeMappings: {
    page: {
      nodeType: "website.page",
      labelField: "title",
      idStrategy: "canonical-url",
    },
    heading: {
      nodeType: "website.heading",
      labelField: "text",
      idStrategy: "url-heading-slug",
    },
  },
  edgeMappings: {
    link: {
      edgeType: "links_to",
      sourceField: "fromUrl",
      targetField: "toUrl",
      confidence: "observed",
      evidenceStrategy: "anchor-selector",
    },
  },
};
```

## Markdown / Obsidian Translation Set

Source entities:

```txt
note
heading
tag
backlink
attachment
concept
```

Luma nodes:

```txt
markdown.note
markdown.heading
markdown.tag
markdown.concept
markdown.asset
```

Luma edges:

```txt
links_to
has_heading
tagged_as
mentions
embeds
supports
contradicts
```

## Codebase Translation Set

Source entities:

```txt
file
folder
function
class
component
import
test
package
```

Luma nodes:

```txt
code.file
code.symbol
code.component
code.package
code.test
```

Luma edges:

```txt
imports
calls
defines
exports
tests
depends_on
changed_with
```

## OpenAPI Translation Set

Source entities:

```txt
endpoint
method
schema
requestBody
response
securityScheme
tag
```

Luma nodes:

```txt
api.endpoint
api.schema
api.tag
api.security
```

Luma edges:

```txt
uses_schema
returns_schema
requires_auth
tagged_as
accepts_body
```

## Database Translation Set

Source entities:

```txt
table
column
index
foreign_key
view
enum
```

Luma nodes:

```txt
db.table
db.column
db.index
db.view
db.enum
```

Luma edges:

```txt
has_column
foreign_key_to
indexed_by
derived_from
uses_enum
```

## Cloud Infrastructure Translation Set

Source entities:

```txt
service
container
network
volume
secret
queue
bucket
role
```

Luma nodes:

```txt
infra.service
infra.container
infra.network
infra.secret
infra.storage
infra.role
```

Luma edges:

```txt
depends_on
connects_to
mounts
reads_from
writes_to
exposes
assumes_role
```

## Translation Set Validation

Each translation set should be validated for:

```txt
node mappings have nodeType and id strategy
edge mappings have source/target fields
edge confidence is explicit
evidence strategy is explicit
no edge type is unlabeled
no AI-inferred relationship is mislabeled as observed
```

## Future UI Use

Mission Control can eventually show:

```txt
Adapter: Website
Translation Set: website-v0
Node mappings: 5
Edge mappings: 6
Observed edges: 234
Inferred edges: 41
AI-inferred edges: 0
Warnings: 3
```
