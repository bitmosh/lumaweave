# Source Adapter Catalog

## Summary

This catalog lists high-value future source adapters for LumaWeave. Each adapter turns a relationship-rich source into a normalized graph.

## Priority Adapters

### 1. Git / Codebase Adapter

Nodes:

```txt
files
folders
functions
classes
components
commits
authors
issues
PRs
tests
```

Edges:

```txt
imports
calls
defines
exports
tests
modified_by
reviewed_by
fixes_issue
changed_with
```

Use cases:

```txt
architecture map
impact analysis
ownership graph
hotspot map
test coverage map
technical debt graph
```

### 2. Website / URL Adapter

Nodes:

```txt
pages
headings
assets
topics
domains
forms
```

Edges:

```txt
links_to
has_heading
mentions_topic
embeds_asset
canonicalizes_to
belongs_to_domain
```

Use cases:

```txt
site map
SEO architecture
content audit
documentation graph
topic cluster map
```

### 3. Markdown / Obsidian Adapter

Nodes:

```txt
notes
headings
tags
concepts
attachments
```

Edges:

```txt
links_to
backlinks_to
tagged_as
mentions
embeds
supports
contradicts
```

Use cases:

```txt
knowledge graph
research map
project planning map
worldbuilding graph
documentation ecosystem
```

### 4. OpenAPI / API Spec Adapter

Nodes:

```txt
endpoints
methods
schemas
request bodies
responses
security schemes
tags
```

Edges:

```txt
uses_schema
returns_schema
requires_auth
tagged_as
accepts_body
```

Use cases:

```txt
API surface map
breaking-change analysis
schema dependency graph
service contract review
```

### 5. Database Schema Adapter

Nodes:

```txt
tables
columns
indexes
constraints
views
enums
stored procedures
```

Edges:

```txt
has_column
foreign_key_to
indexed_by
derived_from
uses_enum
```

Use cases:

```txt
data architecture
migration impact analysis
data lineage
query planning
schema review
```

### 6. Package Dependency Adapter

Nodes:

```txt
packages
versions
licenses
maintainers
vulnerabilities
```

Edges:

```txt
depends_on
dev_depends_on
transitive_depends_on
conflicts_with
vulnerable_to
```

Use cases:

```txt
supply chain risk
upgrade planning
license review
dependency cleanup
```

### 7. Cloud Infrastructure Adapter

Nodes:

```txt
services
containers
clusters
buckets
queues
secrets
networks
IAM roles
volumes
```

Edges:

```txt
depends_on
connects_to
reads_from
writes_to
exposes
mounts
assumes_role
```

Use cases:

```txt
infra architecture
security review
incident response
cost/ownership analysis
```

### 8. Issue Tracker / Project Management Adapter

Nodes:

```txt
issues
epics
milestones
owners
labels
PRs
commits
```

Edges:

```txt
blocks
duplicates
depends_on
assigned_to
fixed_by
relates_to
```

Use cases:

```txt
roadmap graph
blocker map
team ownership
release planning
risk tracking
```

### 9. PDF / Document Corpus Adapter

Nodes:

```txt
documents
sections
citations
claims
entities
tables
figures
```

Edges:

```txt
cites
mentions
supports
contradicts
defines
same_entity
```

Use cases:

```txt
research literature map
contract analysis
policy comparison
business intelligence
```

## Industry-Specific Adapters

### Healthcare / Biology

Nodes:

```txt
genes
proteins
diseases
drugs
symptoms
studies
pathways
```

Edges:

```txt
interacts_with
treats
causes
associated_with
inhibits
activates
```

### Legal / Compliance

Nodes:

```txt
contracts
clauses
obligations
laws
cases
parties
risks
```

Edges:

```txt
references
conflicts_with
requires
prohibits
supersedes
assigns_obligation
```

### Finance / Business Intelligence

Nodes:

```txt
companies
accounts
transactions
vendors
products
KPIs
risks
```

Edges:

```txt
owns
pays
depends_on
correlates_with
supplies
competes_with
```

### Cybersecurity

Nodes:

```txt
hosts
users
IPs
domains
vulnerabilities
alerts
processes
permissions
```

Edges:

```txt
connects_to
authenticates_as
exploits
alerts_on
owns
lateral_moves_to
```

### Education / Learning

Nodes:

```txt
concepts
lessons
prerequisites
quizzes
skills
sources
```

Edges:

```txt
requires
teaches
reinforces
confuses_with
assesses
```

### Game Development / Worldbuilding

Nodes:

```txt
characters
locations
quests
factions
items
mechanics
scenes
```

Edges:

```txt
belongs_to
conflicts_with
unlocks
requires
appears_in
influences
```

### Manufacturing / Supply Chain

Nodes:

```txt
parts
suppliers
factories
shipments
SKUs
machines
defects
```

Edges:

```txt
supplies
depends_on
assembled_into
shipped_to
failed_at
```

## Creative Adapters

### Music Project Adapter

Nodes:

```txt
tracks
clips
samples
effects
automation lanes
MIDI mappings
```

Edges:

```txt
routes_to
modulates
samples
sidechains
triggers
```

### Blender / 3D Scene Adapter

Nodes:

```txt
objects
materials
lights
cameras
modifiers
collections
```

Edges:

```txt
uses_material
parented_to
constrained_by
instanced_by
```

### Unity / Unreal Project Adapter

Nodes:

```txt
scenes
prefabs
blueprints
scripts
assets
materials
animations
```

Edges:

```txt
references
uses
spawns
inherits
depends_on
```

## High-Value Initial Adapter Set

Recommended order:

```txt
1. Graphify / local JSON adapter
2. Markdown / Obsidian adapter
3. Website URL adapter v0
4. OpenAPI adapter
5. Database schema adapter
6. Package dependency adapter
7. Issue tracker adapter
8. Cloud infra adapter
```

## Multi-Source Fusion

The eventual killer feature is multi-source fusion:

```txt
repo + tests + docs + issues + website + package dependencies
= complete project intelligence graph
```

Questions LumaWeave could answer visually:

```txt
Which files support this feature?
Which tests validate it?
Which issues requested it?
Which docs explain it?
Which packages affect it?
Which UI controls expose it?
```
