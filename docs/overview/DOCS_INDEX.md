---
id: index.docs
title: Documentation Index
type: index
status: current
domain: overview
cluster: stone
agent_readable: true
include_in_self_graph: false
last_updated: 2026-06-30
references:
  - system.lumaweave.current-status
  - system.lumaweave.roadmap
  - system.doc.architecture
  - domain.graph.sigma.rendering
  - domain.physics.gwells
  - domain.source.adapter
tags: [index, docs, navigation, overview]
---

# LumaWeave Documentation Index

Code and executable validation are authoritative for implementation. This index lists the maintained GitHub-facing documentation after historical prompts, pass reports, and prototypes were moved to external notes.

## Start here

1. [Project README](../../README.md) — purpose, setup, architecture, and validation.
2. [Current Status](../CURRENT_STATUS.md) — Implemented, Partial, and Planned.
3. [Roadmap](../ROADMAP.md) — release sequence and future direction.
4. [Known Issues](../KNOWN_ISSUES.md) — current defects and quarantined tests.
5. [Development History](../DEVELOPMENT_HISTORY.md) — compressed engineering narrative.
6. [Documentation Architecture](../canonical/DOC_ARCHITECTURE.md) — trust and maintenance rules.

## Maintained architecture

| Document | Scope |
|---|---|
| [Graph, Sigma & Rendering](../canonical/GRAPH_SIGMA_AND_RENDERING.md) | Graphology/Sigma lifecycle, custom WebGL programs, policies, overlays, and renderer limitations. |
| [GWells Physics](../canonical/GWELLS_PHYSICS.md) | Standalone well types, interactions, seeds, dialects, lifecycle, and tuning. |
| [Source Adapter](../canonical/SOURCE_ADAPTER.md) | Registry/loader dispatch, normalized boundary, implemented formats, and ingestion safety. |
| [Theme & Token System](../canonical/THEME_AND_TOKEN_SYSTEM.md) | Authored/runtime tokens, target overrides, crossfade, and accessibility. |
| [Tile & Layout Workspace](../canonical/TILE_AND_LAYOUT_WORKSPACE.md) | Persistent tiles, docking, snapping, grouping, and minimap boundary. |
| [Control Plane & System Index](../canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md) | Commands, hotkeys, modes, perspectives, and system discovery. |
| [Registries & Link Network](../canonical/REGISTRY_AND_LINK_NETWORK.md) | Registry patterns and metadata relationships. |
| [Versioning](../canonical/VERSIONING_AND_ARCS.md) | Product SemVer versus historical internal arc labels. |
| [Deferred Vision](../canonical/DEFERRED_AND_POST_V1_VISION.md) | Deferred systems and existing seams. |
| [Inference and Chat](../canonical/LUMAWEAVE_POST_V1_FEATURE_ARCHITECTURE.md) | Implemented remote inference/chat boundary and remaining future work. |

## GWells design library

These documents are `status: concept`; they do not describe shipped APIs.

- [Profiles and Controls](../design/gwells/PROFILES_AND_CONTROLS.md)
- [Layouts](../design/gwells/LAYOUTS.md)
- [Runtime and Validation](../design/gwells/RUNTIME_AND_VALIDATION.md)

## Engineering practice

- [Project Conventions](../agent/PROJECT_CONVENTIONS.md)
- [Known Sharp Edges](../agent/KNOWN_SHARP_EDGES.md)
- [Diagnostics and Failure Reporting](../agent/DIAGNOSTICS.md)
- [QA and Playwright](../operating-policies/QA_AND_PLAYWRIGHT.md)
- [Motion Safety](../accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md)
- [Aseptic Change-Control Case Study](../aseptic/CASE_STUDY.md)
- [Polish Debt](../polish-debt/README.md)

## Specialized references

Contracts and focused design notes under `docs/graph/`, `docs/theme/`, `docs/rendering/`, `docs/grammar-lens/`, and related directories may still be useful, but they are narrower than the maintained entry points above. Verify older versioned contracts against current canonical docs and code.

Raw workflow prompts, agent-brain records, test forensics, prototypes, generated Git logs, and pass-level blast-radius reports are preserved outside the repository rather than presented as current architecture.

## Maintenance rule

- Verify public claims in code or tests.
- Label seams and future work Partial or Planned.
- Keep current state, roadmap, issues, and history separate.
- Update or retire stale paths immediately.
- Regenerate the self-graph after documentation structure changes.
