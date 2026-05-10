---
id: registry.inventory
title: Registry Inventory
type: inventory
status: current
version: v86a
domain: registries
cluster: slate
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-10
governs:
  - All registry files in src/
references:
  - link.network.overview
  - link.network.layer.1
  - link.network.layer.2
  - link.network.layer.3
  - link.network.layer.4
tags:
  - registry
  - inventory
  - link-network
  - orthogonal
  - v86a
  - vP-Registry-Y
---

# Registry Inventory

Canonical answer to "what registries exist in this codebase?" This inventory catalogs all 18 active registries, 1 stale registry, and 2 out-of-scope configuration files. Future agents can grep this single doc instead of crawling the codebase to find registry existence.

## Section 1: Link Network Registries (4)

The four-layer visual link network that connects user-facing controls to runtime implementation and theme tokens. These are the core governance registries for the visual system.

| Registry | File | Purpose | Documentation |
|----------|------|---------|---------------|
| Handleset Registry | `src/control-plane/handles/handleset.registry.ts` | Layer 1: User-manipulable control handles | [LAYER_1_HANDLE_REGISTRY.md](LAYER_1_HANDLE_REGISTRY.md) |
| Control Surface Contract Registry | `src/control-plane/contracts/controlSurfaceContract.registry.ts` | Layer 2: UI surface locations for controls | [LAYER_2_CONTROL_SURFACE_CONTRACT.md](LAYER_2_CONTROL_SURFACE_CONTRACT.md) |
| Graph Visual Theme Mapping Registry | `src/graph/graphVisualThemeMappingRegistry.ts` | Layer 3: Graph elements to theme token mappings | [LAYER_3_GRAPH_VISUAL_THEME_MAPPING.md](LAYER_3_GRAPH_VISUAL_THEME_MAPPING.md) |
| Graph View Element Registry | `src/graph/graphViewElementRegistry.ts` | Layer 4: Graph visual element inventory | [LAYER_4_GRAPH_VIEW_ELEMENT.md](LAYER_4_GRAPH_VIEW_ELEMENT.md) |

**Why in link network:** These four registries form the spine that the radial inspector will traverse to surface "what controls affect this visual element" and "which tokens does this control consume."

---

## Section 2: Orthogonal Subsystems (14)

Registries that serve orthogonal purposes to the visual link network. These are confirmed clean clusters from the rehaul and are not part of the visual control-to-token governance chain.

| Registry | File | Purpose | Why Not in Link Network |
|----------|------|---------|-------------------------|
| Settings Registry | `src/control-plane/settings/settings.registry.ts` | Settings persistence and schema | Handles storage, not visual governance |
| System Index Registry | `src/control-plane/system-index/systemIndexRegistry.ts` | Meta-registry of all system registries | Indexes registries, not part of visual chain |
| QA Registry | `src/control-plane/qa/qa-registry.ts` | QA state management and submission history | QA workflow, not visual governance |
| Advisory Registry | `src/control-plane/qa/advisory-registry.ts` | Advisory message definitions | QA workflow, not visual governance |
| Theme Target Registry | `src/themes/themeTargetRegistry.ts` | Theme target configuration and heuristics | Theme system, not visual control chain |
| Asset Registry | `src/themes/assetRegistry.ts` | Asset management (textures, shaders, sound packs) | Asset system, not visual control chain |
| Inspector Spoke Registry | `src/themes/inspectorSpokeRegistry.ts` | Inspector spoke configuration | Inspector UI, not visual control chain |
| Audio Source Registry | `src/audio/audioSourceRegistry.ts` | Audio source definitions | Audio system, not visual governance |
| Music Reactive Mapping Registry | `src/audio/musicReactiveMappingRegistry.ts` | Music-to-graph mapping rules | Audio system, not visual governance |
| Source Adapter Registry | `src/source-adapter/sourceAdapterRegistry.ts` | Source adapter configurations (Cypher, JSONL, GraphQL) | Data ingestion, not visual governance |
| Command Registry | `src/control-plane/commands/command-registry.ts` | Command palette definitions | Command system, not visual governance |
| Perspective Registry | `src/control-plane/perspectives/perspectiveRegistry.ts` | View perspective configurations | View system, not visual control chain |
| Control Plane Mode Registry | `src/control-plane/modes/controlPlaneModeRegistry.ts` | Control plane mode definitions | Mode system, not visual governance |
| Bookmark Registry | `src/graph/overlay/bookmarkRegistry.ts` | Bookmark state management | Bookmark feature, not visual governance |
| Motion Safety Registry | `src/accessibility/motionSafetyRegistry.ts` | Motion safety settings for accessibility | Accessibility, not visual governance |

**Why orthogonal:** These registries serve distinct subsystems (QA, audio, accessibility, data ingestion, command palette, etc.) that are orthogonal to the visual control-to-token governance chain. They are confirmed clean clusters from the rehaul and do not participate in the link network traversal.

---

## Section 3: Stale (1)

Registry files that are empty or deprecated and candidates for cleanup.

| Registry | File | Status | Recommendation |
|----------|------|--------|----------------|
| Feature Registry | `src/control-plane/features/feature-registry.ts` | Empty file | Delete or repurpose for v86 asset registry |

**Why stale:** File exists but contains no content. Originally intended for feature flag management, but feature flags are now defined in `feature-flags.ts` (config, not registry).

---

## Section 4: Out of Scope (2)

Files that use "registry" naming but are not registries in the governance sense.

| File | Type | Why Out of Scope |
|------|------|-----------------|
| `src/control-plane/features/feature-flags.ts` | Configuration | Feature flag definitions (config object, not a registry) |
| `src/control-plane/qa/qa.types.ts` | Types | Type definitions for QA system (no runtime registry) |

**Why out of scope:** These are configuration files or type definitions, not governance registries with runtime entries.

---

## Summary

- **Total registries:** 18 (4 link network + 14 orthogonal)
- **Stale:** 1 (feature-registry.ts)
- **Out of scope:** 2 (feature-flags.ts, qa.types.ts)

All active registries follow the registry contract pattern: `list / getById / filterByCategory / validateShape / register`. The link network registries are the spine for visual governance traversal. Orthogonal subsystems serve distinct purposes and are confirmed clean clusters from the rehaul.
