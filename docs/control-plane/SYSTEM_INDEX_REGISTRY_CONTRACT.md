# System Index Registry Contract

**Version**: v72a
**Purpose**: Define the schema and taxonomy for a searchable registry of LumaWeave systems, contracts, registries, validators, evidence surfaces, future docs packets, and source-plugin concepts.

## Overview

The System Index Registry is a searchable catalog of all LumaWeave systems, providing metadata for navigation, traceability, and future graph visualization. It complements the Contract-to-Code Trace Matrix (v71) by mapping systems to searchable metadata and future graph nodes, while the trace matrix maps contracts to code/tests/evidence.

## System Index Purpose

The System Index Registry serves as:

1. **Navigation Aid**: A searchable catalog for discovering LumaWeave systems, contracts, registries, and validators
2. **Traceability Hub**: Central metadata linking systems to their docs, source, tests, QA passes, validators, and evidence surfaces
3. **Future Graph Foundation**: Schema for the LumaWeave Self-Graph Fixture to graph accepted systems and future docs-only concepts
4. **Taxonomy Source**: Canonical categories, kinds, status/lifecycle definitions for future tooling
5. **Forbidden Boundary Enforcement**: Metadata for tracking forbidden boundaries per system

## System Index Entry Schema

Each System Index entry should eventually have:

```typescript
interface SystemIndexEntry {
  // Identity
  id: string;                    // Canonical ID (e.g., "qa.bundle.validator")
  title: string;                 // Human-readable title
  category: SystemCategory;     // High-level category
  kind: SystemKind;              // Specific kind within category
  status: SystemStatus;          // Current status
  lifecycle: SystemLifecycle;    // Lifecycle phase

  // Paths
  docPaths: string[];            // Documentation paths
  sourcePaths: string[];         // Source/runtime paths
  testPaths: string[];           // Test paths

  // QA & Validation
  qaKeys: string[];              // Associated QA keys
  acceptedPasses: string[];      // Accepted pass versions
  validators: string[];          // Validator scripts/tools

  // Evidence & Boundaries
  evidenceSurfaces: string[];    // UI surfaces showing evidence
  forbiddenBoundaries: string[]; // Forbidden boundaries for this system

  // Relationships
  relatedSystems: string[];      // Related system IDs
  tags: string[];                // Free-form tags

  // Future
  futureImplementationStatus?: string; // Implementation status for future systems
  notes?: string;                // Additional notes
}
```

## Categories

High-level categories for organizing systems:

1. **QA / Governance**
   - QA keys, advisory systems, validators, governance contracts

2. **Graph / Sigma Boundary**
   - Graph View Element Registry, Graph Runtime Boundary, Graph Visual Inventory

3. **Theme / Token System**
   - Theme Token Path Map, Theme Mapping Registry, Theme Workshop Security

4. **Motion Safety**
   - Motion Safety / Epilepsy Guard, Reduced Motion Guard Registry

5. **Audio / Signal Systems**
   - Audio Source Registry, Synthetic Audio Signal, Music Reactive Mapping

6. **Source Adapter / Future Architecture**
   - Source Adapter OS concepts, future architecture layers

7. **Visual Grammar / Customization**
   - Grammar Lens, Cursor Grammar Inspector, Signal Loom, Asset Bank (future)

8. **Arena / Simulation Future Concepts**
   - Procedural graph arenas, LLM benchmark tournaments, defensive security hardening (future)

9. **Evidence / Traceability**
   - Contract-to-Code Trace Matrix, System Index Registry, evidence surfaces

10. **Developer Tooling**
    - Command Deck, Hotkey Registry, Perspective System

## Kinds

Specific kinds within categories:

- **contract**: Governance or technical contract document
- **registry**: Runtime registry of entries (elements, themes, audio sources, etc.)
- **validator**: Read-only validation script or tool
- **runtime-surface**: UI surface or panel displaying runtime data
- **evidence-surface**: UI surface displaying accepted evidence
- **future-architecture**: Future architecture docs-only source
- **future-concept**: Future concept docs-only source
- **source-adapter**: External source integration (future)
- **fixture**: Test fixture or synthetic data fixture
- **roadmap-item**: Roadmap or improvement track item

## Status / Lifecycle

Status values:

- **accepted**: System is accepted and stable
- **current**: System is the current active implementation
- **paused**: System is paused, may be retried later
- **future**: System is planned for future implementation
- **docs-only**: System is documentation-only, no runtime implementation authorized
- **planned**: System is planned but not started
- **candidate**: System is a candidate for future work
- **deprecated**: System is deprecated

Lifecycle phases:

- **proposed**: Initial proposal
- **contract-defined**: Contract document exists
- **implemented**: Runtime implementation exists
- **validated**: Validated by tests/validators
- **accepted**: Accepted as stable checkpoint
- **paused**: Paused, may be retried
- **deferred**: Deferred to future

## Canonical ID Examples

Examples of canonical system IDs:

- `qa.bundle.validator` — QA Bundle Validator (v70)
- `contract.trace.matrix` — Contract-to-Code Trace Matrix (v71a)
- `contract.trace.validator` — Contract Trace Validator (v71b)
- `graph.visual.inventory` — Graph Visual Inventory Panel (v48, v68)
- `graph.runtime.boundary` — Graph Runtime Boundary / Probe (v42)
- `graph.view.element.registry` — Graph View Element Registry (v40)
- `graph.theme.mapping.registry` — Graph Visual Theme Mapping Registry (v57)
- `theme.token.path-map` — Theme Token Path Map (v57)
- `motion.safety.guard` — Motion Safety / Epilepsy Guard (v59)
- `audio.source.registry` — Audio Source Registry (v66)
- `synthetic.audio.signal` — Synthetic Audio Signal Preview (v62)
- `music.reactive.mapping` — Music Reactive Mapping Registry (v63)
- `visual-grammar.engine` — Visual Grammar Engine (future/docs-only)
- `visual-grammar.grammar-lens` — Grammar Lens (future)
- `signal-loom.routing` — Signal Loom routing (future)
- `lumaweave-arena.concept` — Lumaweave Arena concept (future)
- `self-graph.fixture` — LumaWeave Self-Graph Fixture (future)

## Relationship to Contract-to-Code Trace Matrix

The System Index Registry and Contract-to-Code Trace Matrix are complementary:

- **Trace Matrix (v71)**: Maps contracts to code/tests/evidence, focuses on file-level traceability
- **System Index (v72)**: Maps systems to searchable metadata, focuses on system-level discoverability and graph node modeling

They are not replacements. The trace matrix answers "where is the code for this contract?" The system index answers "what systems exist and how do they relate?"

## Relationship to LumaWeave Self-Graph Fixture

The LumaWeave Self-Graph Fixture should:

1. **Ingest or mirror the System Index entry model** to graph accepted systems and future docs-only concepts
2. **Use the canonical ID scheme** to avoid inventing a new taxonomy
3. **Leverage categories, kinds, and status/lifecycle** for graph node classification
4. **Use relatedSystems edges** to graph system relationships
5. **Respect forbidden boundaries** from system metadata when rendering graph nodes

The System Index provides the schema and taxonomy so the Self-Graph Fixture does not need to invent a new classification system.

## Visual Grammar and Arena Status

- **docs/visual-grammar-engine/**: Future architecture/docs-only source. No implementation authorization.
  - Grammar Lens
  - Cursor Grammar Inspector
  - Signal Loom
  - Asset Bank
  - Grammar handles
  - Visual dialect presets
  - Theme/token compatibility
  - Safety/schema governance

- **docs/lumaweave-arena/**: Future concept/docs-only source. No implementation authorization.
  - Sandboxed procedural graph arenas
  - LLM benchmark tournaments
  - Defensive security hardening arenas
  - Replay/evidence scoring
  - Signal Loom spectator visualization

Both are docs-only future concepts. Neither authorizes implementation.

## Forbidden Boundaries

The System Index Registry enforces the following forbidden boundaries:

1. **No graph/Sigma mutation** without explicit authorization
2. **No runtime UI implementation** without contract and validation
3. **No source adapter runtime ingestion** without security model
4. **No audio input/playback/music runtime behavior** without safety gates
5. **No command execution** without explicit authorization
6. **No token promotion** without theme workshop security model
7. **No CSS variable writes** without explicit authorization
8. **No v69 retry** without sliced passes plan
9. **No QA key rotation** without validator proof

Each system entry should list its specific forbidden boundaries in the `forbiddenBoundaries` field.

## Future Implementation Ladder

The System Index Registry implementation should follow this ladder:

- **v72a**: Contract only (this document)
- **v72b**: Static system index registry (TypeScript interface + sample entries)
- **v72c**: System index validator (read-only validator script)
- **v72d**: Passive searchable UI (read-only search interface, no mutations)
- **v72e**: Self-Graph Fixture integration (graph visualization of system index)

Each step requires validation before proceeding to the next.

## Sample Entries

### QA Bundle Validator (v70)

```typescript
{
  id: "qa.bundle.validator",
  title: "QA Bundle Validator",
  category: "QA / Governance",
  kind: "validator",
  status: "accepted",
  lifecycle: "accepted",
  docPaths: ["docs/control-plane/qa/BACKLOG_POLICY.md"],
  sourcePaths: ["scripts/validate-qa-bundle.mjs"],
  testPaths: ["tests/e2e/contract-registry.spec.ts"],
  qaKeys: ["v68", "v70"],
  acceptedPasses: ["v70"],
  validators: [],
  evidenceSurfaces: ["Validator script output"],
  forbiddenBoundaries: ["no runtime UI changes", "no test rewrites", "no QA key rotation without validator proof"],
  relatedSystems: ["contract.trace.matrix", "contract.trace.validator"],
  tags: ["drift-detection", "qa-governance"],
  notes: "Detects QA bundle drift before Playwright cascades"
}
```

### Contract-to-Code Trace Matrix (v71a)

```typescript
{
  id: "contract.trace.matrix",
  title: "Contract-to-Code Trace Matrix",
  category: "Evidence / Traceability",
  kind: "contract",
  status: "accepted",
  lifecycle: "accepted",
  docPaths: ["docs/control-plane/CONTRACT_TO_CODE_TRACE_MATRIX.md"],
  sourcePaths: [],
  testPaths: ["tests/e2e/contract-registry.spec.ts"],
  qaKeys: ["v71"],
  acceptedPasses: ["v71a"],
  validators: ["contract.trace.validator"],
  evidenceSurfaces: ["Trace matrix document"],
  forbiddenBoundaries: ["no runtime UI changes", "no graph/Sigma mutation"],
  relatedSystems: ["contract.trace.validator"],
  tags: ["traceability", "contract-mapping"],
  notes: "Maps contracts to code/tests/evidence"
}
```

### Contract Trace Validator (v71b)

```typescript
{
  id: "contract.trace.validator",
  title: "Contract Trace Validator",
  category: "Evidence / Traceability",
  kind: "validator",
  status: "accepted",
  lifecycle: "accepted",
  docPaths: ["docs/control-plane/CONTRACT_TO_CODE_TRACE_MATRIX.md"],
  sourcePaths: ["scripts/validate-contract-trace.mjs"],
  testPaths: ["tests/e2e/contract-registry.spec.ts"],
  qaKeys: ["v71"],
  acceptedPasses: ["v71b"],
  validators: [],
  evidenceSurfaces: ["Validator script output"],
  forbiddenBoundaries: ["no runtime UI changes", "no graph/Sigma mutation"],
  relatedSystems: ["contract.trace.matrix"],
  tags: ["traceability", "validation"],
  notes: "Validates trace matrix structure and required rows"
}
```

### Visual Grammar Engine (future)

```typescript
{
  id: "visual-grammar.engine",
  title: "Visual Grammar Engine",
  category: "Visual Grammar / Customization",
  kind: "future-architecture",
  status: "future",
  lifecycle: "contract-defined",
  docPaths: ["docs/visual-grammar-engine/"],
  sourcePaths: [],
  testPaths: [],
  qaKeys: [],
  acceptedPasses: [],
  validators: [],
  evidenceSurfaces: [],
  forbiddenBoundaries: ["no implementation without explicit authorization", "no CSS variable writes", "no graph/Sigma mutation"],
  relatedSystems: ["visual-grammar.grammar-lens", "signal-loom.routing"],
  tags: ["future", "docs-only", "customization"],
  futureImplementationStatus: "docs-only - no implementation authorization",
  notes: "Future architecture for grammar-based visual customization"
}
```

### Lumaweave Arena Concept (future)

```typescript
{
  id: "lumaweave-arena.concept",
  title: "Lumaweave Arena",
  category: "Arena / Simulation Future Concepts",
  kind: "future-concept",
  status: "future",
  lifecycle: "contract-defined",
  docPaths: ["docs/lumaweave-arena/"],
  sourcePaths: [],
  testPaths: [],
  qaKeys: [],
  acceptedPasses: [],
  validators: [],
  evidenceSurfaces: [],
  forbiddenBoundaries: ["no implementation authorization", "no real-world exploitation", "no live target interaction"],
  relatedSystems: [],
  tags: ["future", "docs-only", "simulation", "defensive"],
  futureImplementationStatus: "docs-only - no implementation authorization",
  notes: "Future concept for sandboxed procedural graph arenas and LLM benchmark tournaments"
}
```

## Version History

- **v72a** (2026-05-04): Initial System Index Registry Contract (docs-only)
