---
id: link.network.overview
title: Link Network Overview
type: overview
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
governs:
  - src/control-plane/handles/handleset.registry.ts
  - src/control-plane/contracts/controlSurfaceContract.registry.ts
  - src/graph/graphVisualThemeMappingRegistry.ts
  - src/graph/graphViewElementRegistry.ts
references:
  - theme.system.overview
  - theme.token.path.map
  - theme.target.registry
  - graph.visual.theme.mapping.contract
  - graph.view.element.registry.contract
  - link.network.layer.1 (LAYER_1_HANDLE_REGISTRY.md)
  - link.network.layer.2 (LAYER_2_CONTROL_SURFACE_CONTRACT.md)
  - link.network.layer.3 (LAYER_3_GRAPH_VISUAL_THEME_MAPPING.md)
  - link.network.layer.4 (LAYER_4_GRAPH_VIEW_ELEMENT.md)
  - link.network.layer.2.overlay.question (LAYER_2_OVERLAY_SURFACE_QUESTION.md)
  - link.network.layer.3.gaps (LAYER_3_TOKEN_COVERAGE_GAP.md)
  - link.network.layer.4.gaps (LAYER_4_OVERLAY_ELEMENT_GAP.md)
  - link.network.naming.drift (NAMING_CONVENTION_DRIFT.md)
  - registry.inventory (REGISTRY_INVENTORY.md)
tags:
  - link-network
  - registries
  - four-layer
  - governance
  - v86a
  - vP-Registry-Y
---

# Link Network Overview

The Link Network is a four-layer metadata architecture that connects user-facing controls to their runtime implementation and to the theme tokens they consume. It is the spine that the radial inspector will eventually traverse to surface "what controls affect this visual element" and "which tokens does this control consume."

The network does not execute code. It is metadata only — a typed inventory that describes relationships between systems. Runtime behavior remains in the implementation files referenced by the network.

## Phase Y context

This overview is the entry doc for the four-layer link network and is the foundation Phase Y (vP-Registry-1, second sub-pass) builds on. It was authored mid-Phase-Y as the architectural anchor; the per-layer docs and gap analysis docs are forward references that resolve when Phase Y resumes.

Forward references are explicit:

- [Layer 1 — Handle Registry](link.network.layer.1) — per-layer doc, forthcoming
- [Layer 2 — Control Surface Contract Registry](link.network.layer.2) — per-layer doc, forthcoming
- [Layer 3 — Graph Visual Theme Mapping Registry](link.network.layer.3) — per-layer doc, forthcoming
- [Layer 4 — Graph View Element Registry](link.network.layer.4) — per-layer doc, forthcoming
- [Layer 2 Overlay Surface Question](link.network.layer.2.overlay.question) — gap doc, forthcoming
- [Layer 3 Token Coverage Gaps](link.network.layer.3.gaps) — gap doc, forthcoming
- [Layer 4 Overlay Element Gaps](link.network.layer.4.gaps) — gap doc, forthcoming
- [Naming Convention Drift](link.network.naming.drift) — drift doc, forthcoming
- [Registry Inventory](registry.inventory) — orthogonal subsystem catalog, forthcoming

When Phase Y resumes, those docs are produced and these references resolve.

## Purpose

The link network enables:

- **Traceability** — From any UI control, trace its handle, surface location, settings binding, and theme token dependencies.
- **Governance** — Visual changes require explicit contract acceptance through the mapping layers.
- **Discovery** — The radial inspector can navigate across layers to show "what controls affect this visual element" and "which tokens does this control consume."
- **Validation** — Cross-layer consistency checks prevent orphaned handles, unmapped tokens, or surfaceless controls.

## The Four Layers

### Layer 1 — Handle Registry

**File:** `src/control-plane/handles/handleset.registry.ts`

**Role:** Catalog of user-manipulable controls.

Layer 1 defines the abstract handles that users can interact with, independent of where they appear in the UI. Each handle represents a control capability (e.g., `labels.nodeLabelMode`, `appearance.theme`) with metadata about its category, default value, control type, and runtime binding.

**Entry count:** 24 handles

**Key fields:**

- `handle` — Dot-path identifier (e.g., `labels.nodeLabelMode`)
- `label` — Human-readable name
- `category` — Logical grouping (e.g., Labels, Physics, Appearance)
- `controlType` — UI control type (select, range, toggle)
- `status` — `active` / `internal` / `partial` / `planned`
- `binding.sourceFile` — Where the setting is defined
- `binding.runtimeTarget` — Which code consumes the setting
- `binding.liveUpdate` — Whether changes apply immediately

For full Layer 1 details, see [Layer 1 — Handle Registry](link.network.layer.1).

---

### Layer 2 — Control Surface Contract Registry

**File:** `src/control-plane/contracts/controlSurfaceContract.registry.ts`

**Role:** Where each control lives in the UI.

Layer 2 maps handles to their UI surface locations (topbar, graph, missionControl, settings). Each contract describes the physical placement, owner, runtime binding, QA coverage, and documentation status.

**Entry count:** 24 contracts

**Surfaces enum:**

- `topbar` — Top application bar controls
- `graph` — Graph viewport controls
- `missionControl` — Mission Control panel controls
- `settings` — Settings panel controls

**Key fields:**

- `id` — Contract identifier (e.g., `topbar.themeSelector`)
- `label` — Human-readable name
- `surface` — UI surface location
- `owner` — Which store/module owns the control
- `settingsKey` — Cross-reference to Layer 1 handle
- `runtimeBinding.sourceFile` — Implementation file
- `runtimeBinding.targetComponent` — UI component
- `runtimeBinding.liveUpdate` — Real-time update flag (the multi-renderer queue point — future per-renderer `liveUpdate2D / liveUpdate3D / liveUpdateSVG` flags can extend this)
- `status` — `active` / `planned` / `deprecated`
- `risk` — `low` / `medium` / `high`

For full Layer 2 details, see [Layer 2 — Control Surface Contract Registry](link.network.layer.2).

---

### Layer 3 — Graph Visual Theme Mapping Registry

**File:** `src/graph/graphVisualThemeMappingRegistry.ts`

**Role:** Graph element → canonical token mapping.

Layer 3 defines the governance relationship between graph visual elements and their canonical theme token paths. Each mapping is metadata only — it does not apply styles at runtime. It documents the intended relationship for inspection and validation.

**Entry count:** 14 mappings (v50 coverage; missing 27 v86a-promoted token mappings — see [Layer 3 Token Coverage Gaps](link.network.layer.3.gaps))

**Status enum:**

- `active` — Mapping is established and documented
- `planned` — Mapping is intended but not yet implemented
- `deferred` — Mapping is deferred to a future phase

**Key fields:**

- `graphElementId` — Foreign key to Layer 4 (e.g., `graph.nodes`)
- `visualRole` — Description of what the token controls
- `canonicalTokenPath` — Theme token path (e.g., `graph.node.fill`)
- `tokenSource` — Documentation source
- `status` — Mapping lifecycle state
- `boundaryNote` — Why this is governance-only

**Boundary note:** This registry does not mutate Sigma, does not apply styles, and does not change node/edge rendering. It is governance metadata for validation only. Runtime token application happens through the [Graph Theme Application Contract](graph.theme.application.contract) chain.

For full Layer 3 details, see [Layer 3 — Graph Visual Theme Mapping Registry](link.network.layer.3) and the formal [Graph Visual Theme Mapping Contract](graph.visual.theme.mapping.contract).

---

### Layer 4 — Graph View Element Registry

**File:** `src/graph/graphViewElementRegistry.ts`

**Role:** Graph element identities.

Layer 4 defines the typed inventory of graph visual elements (frames, layers, overlays, controls) with their metadata. Each element has an identity, category, status, evidence kind, test selector, and policy notes.

**Entry count:** Full element inventory (v50 set; missing 7 v86b overlay components — see [Layer 4 Overlay Element Gaps](link.network.layer.4.gaps))

**Categories enum:**

- `frame` — Container elements (graph frame, surface)
- `layer` — Rendering layers (nodes, edges, labels)
- `overlay` — Visual overlays (selection indicators, hover states)
- `control` — Interactive controls (zoom, pan, selection)

**Status enum:**

- `active` — Element exists and is observable
- `future` — Element is planned but not yet implemented
- `locked` — Element is reserved for future use

**Evidence kinds:**

- `dom-wrapper` — Element has DOM evidence markers
- `policy-only` — Element exists only in policy, no DOM
- `future` — Element is not yet observable

**Key fields:**

- `id` — Element identifier (e.g., `graph.nodes`)
- `title` — Human-readable name
- `description` — What the element does
- `category` — Element type
- `status` — Lifecycle state
- `evidenceKind` — How the element is observed
- `testSelector` — Playwright selector (if applicable)
- `sigmaBoundary` — Note about Sigma control boundary
- `policyNote` — Governance note

**Sigma boundary note:** Layer 4 does not control Sigma internals. Elements are DOM wrappers or policy metadata. Sigma manages actual rendering.

For full Layer 4 details, see [Layer 4 — Graph View Element Registry](link.network.layer.4) and the formal [Graph View Element Registry Contract](graph.view.element.registry.contract).

---

## Cross-Reference Patterns

### Handle ↔ Contract (Layer 1 ↔ Layer 2)

**Mechanism:** `settingsKey` field

Layer 1 handles connect to Layer 2 contracts via the `settingsKey` field. A handle's `binding.sourceFile` typically points to a settings schema, and the Layer 2 contract's `settingsKey` references the same setting path.

**Example:**

- Layer 1: `handle: "appearance.theme"` → `binding.sourceFile: "src/control-plane/settings/settings.schema.ts"`
- Layer 2: `id: "topbar.themeSelector"` → `settingsKey: "appearance.theme"`

**Pattern:** One-to-one correspondence is typical. Most handles have a corresponding contract entry.

---

### Contract ↔ Surface (Layer 2)

**Mechanism:** `surface` field

Layer 2 contracts specify their UI surface location via the `surface` enum (`topbar` / `graph` / `missionControl` / `settings`). This groups controls by their physical location in the application.

**Example:**

- `id: "topbar.themeSelector"` → `surface: "topbar"`
- `id: "graph.fit"` → `surface: "graph"`

**Pattern:** Surface grouping enables surface-specific validation (e.g., "all topbar controls must have Playwright coverage").

**Open question:** v86b overlays do not fit the current surface enum. See [Layer 2 Overlay Surface Question](link.network.layer.2.overlay.question).

---

### Visual Mapping ↔ Token (Layer 3)

**Mechanism:** `canonicalTokenPath` field

Layer 3 mappings reference canonical theme token paths via `canonicalTokenPath`. These paths resolve to values in `themeTokenPaths.ts` and the theme token objects.

**Example:**

- `graphElementId: "graph.nodes"` → `canonicalTokenPath: "graph.node.fill"`

**Pattern:** One graph element can have multiple token mappings (e.g., `graph.nodes` has `fill`, `hoverFill`, `selectedFill`). One token can map to multiple elements (e.g., `panel.border` maps to multiple frame elements).

For canonical token paths, see [Theme Token Path Map](theme.token.path.map).

---

### Visual Mapping ↔ Element (Layer 3 ↔ Layer 4)

**Mechanism:** `graphElementId` field

Layer 3 mappings reference Layer 4 elements via `graphElementId`. This is a foreign key relationship — the `graphElementId` must exist in Layer 4's element inventory.

**Example:**

- Layer 3: `graphElementId: "graph.nodes"` → `canonicalTokenPath: "graph.node.fill"`
- Layer 4: `id: "graph.nodes"` → `title: "Node Layer"`

**Pattern:** Layer 3 mappings are validated against Layer 4's element inventory. Orphaned mappings (referencing non-existent elements) are caught by validation.

---

## Navigation Paths

The radial inspector (future feature) will query across layers to answer navigation questions.

### "What controls affect this visual element?"

**Path:** Layer 4 element → Layer 3 mappings → Layer 2 contracts → Layer 1 handles

1. Start with a Layer 4 element (e.g., `graph.nodes`).
2. Query Layer 3 for mappings with `graphElementId: "graph.nodes"`.
3. Extract `canonicalTokenPath` values (e.g., `graph.node.fill`, `graph.node.hoverFill`).
4. Query Layer 2 for contracts that reference those tokens (via settings paths or runtime bindings).
5. Query Layer 1 for handles that connect to those contracts (via `settingsKey`).

**Result:** "Node layer visual properties are controlled by these handles: `labels.nodeLabelMode`, `appearance.theme`, `physics.nodeSizeMultiplier`."

---

### "Which tokens does this control consume?"

**Path:** Layer 1 handle → Layer 2 contract → Layer 3 mappings → `themeTokenPaths.ts`

1. Start with a Layer 1 handle (e.g., `appearance.theme`).
2. Query Layer 2 for contract with `settingsKey: "appearance.theme"`.
3. Identify which graph elements the contract affects (via `runtimeBinding` or `surface`).
4. Query Layer 3 for mappings to those elements.
5. Extract `canonicalTokenPath` values.
6. Resolve paths in `themeTokenPaths.ts`.

**Result:** "Theme selector controls these tokens: `app.background`, `graph.node.fill`, `panel.border`, `edge.default`, ..."

---

### "Where is this control located in the UI?"

**Path:** Layer 1 handle → Layer 2 contract

1. Start with a Layer 1 handle (e.g., `labels.nodeLabelMode`).
2. Query Layer 2 for contract with `settingsKey: "labels.nodeLabelMode"`.
3. Read `surface` field.

**Result:** "Node label mode control is located in: topbar (via theme selector) or settings panel (via labels category)."

---

## Source-of-Truth Files

| Layer | File | Purpose |
|-------|------|---------|
| Layer 1 | `src/control-plane/handles/handleset.registry.ts` | Handle definitions and runtime bindings |
| Layer 2 | `src/control-plane/contracts/controlSurfaceContract.registry.ts` | UI surface locations and contracts |
| Layer 3 | `src/graph/graphVisualThemeMappingRegistry.ts` | Graph element → token mappings |
| Layer 4 | `src/graph/graphViewElementRegistry.ts` | Graph element identities |
| Theme Tokens (paths) | `src/themes/themeTokenPaths.ts` | Canonical token path declarations |
| Theme Tokens (values) | `src/themes/themeTokens.ts` | Resolved token values per theme |
| Theme Targets | `src/themes/themeTargetRegistry.ts` | UI surfaces that consume tokens (non-graph) |

---

## Boundary Notes

### What the Link Network Covers

- User-facing controls (handles and their UI placement)
- Graph visual elements (nodes, edges, labels, overlays)
- Theme token dependencies (which elements consume which tokens)
- Runtime binding information (where controls are implemented)

### What the Link Network Does Not Cover

The link network is **specifically about visual / control / token relationships.** It does not cover orthogonal subsystems with their own governance. From Phase X registry triage, those orthogonal subsystems are:

- Motion safety registry — accessibility subsystem
- Audio source registry — audio subsystem
- Control plane mode registry — governance subsystem
- Perspective registry — view subsystem
- Advisory registry — QA subsystem
- QA registry — QA subsystem
- Bookmark registry — runtime data store
- Asset registry — runtime data store (forward-compat empty bank in v86a)
- Inspector spoke registry — runtime data store
- Command registry — command subsystem
- Feature flags — configuration

Each is documented separately. They participate in their own architectural networks but do not connect through the four-layer visual link network.

For the orthogonal subsystem catalog, see [Registry Inventory](registry.inventory).

---

## Known Gaps (Phase Y completion targets)

When Phase Y resumes, these gap docs are the natural completion targets:

### Layer 3 Token Coverage Gap

Layer 3 has 14 mappings covering v50 graph elements. The 24 v86a-promoted token paths (backdrop, node sphere, edge plasma, selection, bookmark, panel tile, inspector radial, typography) are not yet mapped. Gap analysis goes in [Layer 3 Token Coverage Gaps](link.network.layer.3.gaps).

### Layer 4 Overlay Element Gap

v86b shipped 7 overlay components (SolarBackdrop, ClickHalo, GlitterField, FloatingBookmark, BookmarkLayer, Minimap, CameraHUD) that do not appear in Layer 4. Gap analysis goes in [Layer 4 Overlay Element Gaps](link.network.layer.4.gaps).

### Layer 2 Overlay Surface Gap

The v86b overlays do not fit the current `surface` enum (`topbar` / `graph` / `missionControl` / `settings`). Decision pending: extend the enum or accept overlays as non-user-controllable. See [Layer 2 Overlay Surface Question](link.network.layer.2.overlay.question).

### Naming Convention Drift

Naming inconsistencies across layers exist:

- Layer 1 handle namespace vs Layer 2 id namespace (`labels.*` vs `graph.*`)
- Layer 3 status enum vs Layer 4 status enum (`active` / `planned` / `deferred` vs `active` / `future` / `locked`)

Drift analysis and reconciliation plan goes in [Naming Convention Drift](link.network.naming.drift).

---

## Relationship to Earlier Documentation

The link network architecture is **complementary** to the existing canonical token vocabulary docs, not a replacement. Both layers exist side-by-side post-rehaul:

- [Theme Token Path Map](theme.token.path.map) — the **canonical vocabulary** (what tokens exist, how tier classification works, what the promotion process is)
- This Link Network Overview — the **architectural relationships** (how handles, contracts, mappings, and elements connect across layers)

The link network adds:

- **Separation of concerns** — Handle identity (Layer 1) from UI placement (Layer 2) from token mapping (Layer 3) from element identity (Layer 4)
- **Cross-layer governance** — Validation across layers prevents orphaned mappings
- **Navigation queryability** — The radial inspector can traverse relationships
- **Scalability** — Adding a new surface (e.g., overlays) requires updating one layer, not rewriting the entire vocabulary

The path map captures *what tokens exist*. The link network captures *how those tokens connect to controls and elements*. Both are needed.

---

*Authored mid-Phase Y as architectural anchor. Frontmatter and rehaul-aware framing added v86a. Per-layer detail docs and gap analysis docs are forward references for Phase Y resumption.*
