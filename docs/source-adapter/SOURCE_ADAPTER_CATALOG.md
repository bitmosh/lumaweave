---
id: catalog.source.adapters
title: Source Adapter Catalog
type: registry
status: accepted
version: v73c
domain: source-adapter
cluster: green
agent_readable: true
include_in_self_graph: true
last_updated: v73c
depends_on:
  - system.source.adapter.os
tags: [source-adapter, catalog, adapters, ingestion, accepted]
---

# Source Adapter Catalog

High-value future source adapters. Each adapter turns a relationship-rich source into a normalized LumaWeave graph. Listed in implementation priority order.

---

## Priority Adapters

### 1. Self-Graph / YAML Frontmatter (First — v75a)
```
Input:      LumaWeave docs/ folder with YAML frontmatter
Nodes:      doc files, contracts, registries, concepts
Edges:      depends_on, implements, governs, tested_by (from frontmatter)
Confidence: observed (from explicit frontmatter fields)
Use cases:  Self-graph fixture, LumaWeave visualizing itself
Status:     v75a next
```

### 2. Git / Codebase Adapter
```
Input:      Git repository
Nodes:      files, folders, functions, classes, components, commits, authors
Edges:      imports, calls, defines, exports, tests, modified_by, reviewed_by
Use cases:  Architecture map, impact analysis, ownership graph, hotspot map
Status:     planned
```

### 3. Website / URL Adapter
```
Input:      URL or site
Nodes:      pages, headings, assets, topics, domains, forms
Edges:      links_to, has_heading, mentions_topic, embeds_asset, canonicalizes_to
Use cases:  Site map, SEO architecture, content audit, topic cluster map
Status:     planned (see WEBSITE_URL_ADAPTER_V0.md for detailed spec)
```

### 4. Markdown / Obsidian Adapter
```
Input:      Markdown folder or Obsidian vault
Nodes:      notes, headings, tags, concepts, attachments
Edges:      links_to, backlinks_to, tagged_as, mentions, embeds
Use cases:  Knowledge graph, research map, worldbuilding graph
Status:     planned
```

### 5. OpenAPI / API Spec Adapter
```
Input:      OpenAPI YAML/JSON spec
Nodes:      endpoints, methods, schemas, request bodies, responses, security schemes
Edges:      uses_schema, returns_schema, requires_auth, tagged_as
Use cases:  API surface map, breaking-change analysis, service contract review
Status:     planned
```

### 6. Database Schema Adapter
```
Input:      SQL schema, Prisma schema, or introspection output
Nodes:      tables, columns, indexes, constraints, views, enums
Edges:      has_column, foreign_key_to, indexed_by, derived_from
Use cases:  Data architecture, migration impact, lineage, schema review
Status:     planned
```

### 7. Package Dependency Adapter
```
Input:      package.json, Cargo.toml, pyproject.toml, etc.
Nodes:      packages, versions, licenses, maintainers, vulnerabilities
Edges:      depends_on, dev_depends_on, transitive_depends_on, conflicts_with
Use cases:  Supply chain risk, upgrade planning, license review
Status:     planned
```

### 8. Cloud Infrastructure Adapter
```
Input:      Terraform, CloudFormation, AWS/GCP/Azure resource graph
Nodes:      services, containers, clusters, buckets, queues, secrets, networks, IAM roles
Edges:      depends_on, connects_to, reads_from, writes_to, exposes, assumes_role
Use cases:  Infra architecture, security review, incident response
Status:     planned
```

### 9. Issue Tracker / Project Management Adapter
```
Input:      GitHub Issues, Linear, Jira
Nodes:      issues, epics, milestones, owners, labels, PRs, commits
Edges:      blocks, duplicates, depends_on, assigned_to, fixed_by
Use cases:  Roadmap graph, blocker map, team ownership, risk tracking
Status:     planned
```

---

## Future Adapters (Backlog)

```
PDF / Document corpus    → sections, paragraphs, citations, references
Research papers          → papers, authors, citations, claims, methods
Legal / Compliance       → clauses, obligations, references, risks
Game / Worldbuilding     → entities, locations, events, relationships
Cybersecurity feeds      → CVEs, packages, patch status, risk chains
Chat archives            → threads, mentions, decisions, links
```

---

## Implementation Strategy

Build one adapter at a time as a vertical slice:
```
detection
→ extraction
→ translation set
→ normalized graph
→ validation report
→ renderer proof
→ Playwright evidence
→ acceptance
```

Never implement multiple adapters simultaneously.
First adapter: Self-Graph / YAML Frontmatter (lowest risk, proves the schema).
First impressive external adapter: Website URL Adapter (wow-factor).
