---
id: source.adapter.roadmap
title: Source Adapter OS Roadmap
type: roadmap
status: accepted
version: v73c
cluster: lime
domain: source-adapter
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - source.adapter.os.overview
  - source.adapter.os.contract
  - source.adapter.catalog
tags: [source-adapter, roadmap, phases, v74]
---

# Source Adapter OS Roadmap

**Current position:** v73c accepted. v74a is next.

---

## Phase Sequence

### v74a — Source Adapter OS Foundation Contract
```
Type:      docs-only
Target:    docs/source-adapter/SOURCE_ADAPTER_OS_CONTRACT.md
Content:
  - Adapter lifecycle: candidate → registered → validated → accepted → active
  - Base metadata schema for all adapters
  - Safety requirements (no parent-dir, no auto-exec, no secret leakage, local-first)
  - Forbidden behavior list (explicit)
  - Relationship to existing graph/audio/runtime boundaries
  - Acceptance criteria for v74b
Risk:      low — docs only
```

### v74b — Source Adapter Base Registry + Validator
```
Type:      registry + validator
Target:
  src/source-adapter/sourceAdapterRegistry.ts
  scripts/validate-source-adapters.mjs
Content:
  - TypeScript SourceAdapterEntry type (matches v74a contract schema)
  - Static registry seeded with documented adapter types (synthetic/planned)
  - Validator script checking registry against contract rules
  - Playwright proves registry data renders in evidence panel
Risk:      low — same pattern as System Index Registry (v72)
```

### v75a — Synthetic Data Fixtures v0 — Self-Graph Seed
```
Type:      fixture
Target:    src/fixtures/self-graph-fixture.ts
Content:
  - Static LumaSourceGraph built from docs/ YAML frontmatter
  - Nodes = doc files, contracts, registries
  - Edges = depends_on, implements, governs, tested_by (from frontmatter)
  - All confidence: "observed" (explicit frontmatter declarations)
Risk:      medium — first real use of normalized schema
Notes:     This is LumaWeave's first real adapter output, even though it's
           a manually constructed fixture rather than a live adapter.
           It validates the schema before any dynamic adapter is built.
```

### v75b — Self-Graph Passive Mount
```
Type:      passive UI + Playwright
Target:    Sigma graph surface mounting self-graph fixture
Content:
  - Sigma renders nodes and edges from self-graph fixture
  - Passive — no controls that modify the graph
  - All nodes have data-testid evidence
  - Playwright proves graph renders with correct node/edge counts
Risk:      medium — first Sigma rendering from source adapter output
Notes:     This is the "LumaWeave shows its own architecture" milestone.
           First real demo surface. First product screenshot.
```

### v76+ — Verified Download Button Boundary
```
Type:      contract
Content:   Security boundary for future adapter download/install actions
Notes:     Prerequisite for any community adapter distribution
```

### v80+ — Website URL Adapter v0
```
Type:      implementation
Notes:     After self-graph is proven, the first external adapter.
           See WEBSITE_URL_ADAPTER_V0.md for detailed spec.
```

---

## Strategic Guardrail

Do not implement multiple adapters at once. Each adapter is its own vertical slice:

```
detection
→ extraction
→ translation set
→ normalized graph
→ validation report
→ renderer proof
→ acceptance
```

First adapter (v75a): Self-Graph / YAML frontmatter — lowest risk, proves the schema.
First external adapter (v80+): Website URL — highest first impression value.

---

## Relationship to Self-Graph Vision

The self-graph fixture is the convergence of the Source Adapter OS, the docs YAML frontmatter schema, and the passive Sigma rendering. When v75b ships:

```
Every doc with frontmatter → a node in the graph
Every frontmatter relationship → an edge in the graph
LumaWeave showing its own architecture → first real product demo
```

This milestone validates the entire Source Adapter OS pattern before any external source is ingested.