---
id: system.lumaweave.current-status
title: LumaWeave Current Status
type: status
status: current
domain: overview
cluster: stone
agent_readable: true
include_in_self_graph: true
last_updated: 2026-06-30
references:
  - system.doc.architecture
  - domain.graph.sigma.rendering
  - domain.physics.gwells
  - domain.source.adapter
  - domain.theme.token.system
  - domain.tile.layout.workspace
  - domain.deferred.post.v1.vision
tags: [current-state, implementation, roadmap, evidence]
---

# LumaWeave Current Status

This document separates observable implementation from partial scaffolding and future plans. It was verified against the repository at committed `main` revision `4f28c47` plus the current test tree on 2026-06-30.


## Status definitions

- **Implemented** — a runtime path exists in committed code and has direct code or test evidence.
- **Partial** — meaningful code exists, but an important format, control, integration, or verification boundary remains incomplete.
- **Planned** — documentation, dependencies, types, registry entries, or extension seams may exist, but there is no complete runtime feature.

## Implemented

### Application and rendering

- Tauri desktop shell with a React 19 and TypeScript frontend.
- Graphology is the live graph model; Sigma 3 is the active WebGL renderer.
- Five registered node programs are active: glass sphere, sun, crystal, orb, and pip.
- A custom plasma edge program renders graph edges.
- `SigmaGraphView` creates the Sigma instance around graph dataset identity and applies subsequent selection, hover, label, sizing, theme, geometry, and physics changes through graph mutation and `sigma.refresh()`.
- Selection neighborhoods, label policies, dimming, camera persistence, minimap overlays, bookmarks, and node pinning have runtime paths and targeted Playwright coverage.

Evidence: `src/graph/renderers/sigma2d/`, `src/graph/nodePrograms/`, `src/graph/edgePrograms/`, `src/graph/visual/`, and the graph/viewport E2E specifications under `tests/e2e/`.

### GWells physics

- GWells is isolated under `src/physics/gwells/` and has no LumaWeave UI, React, Sigma, theme, or browser imports.
- Four active well types, eight active interactions, two active seed functions, and two active dialects are registered.
- `applyDialect()` returns a controller supporting `pause()`, `resume()`, `stop()`, `step()`, runtime-state inspection, live configuration overrides, and pins.
- A structural resolver classifies arbitrary graph topology and supplies source-agnostic fallback roles while retaining legacy explicit-kind handling.
- Seeders include radial-backbone and parallel-spines behavior, fallback placement, root crowding handling, and persisted `z` seed coordinates.
- A deterministic benchmark harness covers multiple graph sizes and shapes.

Evidence: `src/physics/gwells/`, `scripts/validate-gwells.mjs`, `scripts/benchmark-gwells.mjs`, and `tests/e2e/gwells-physics.spec.ts`.

### Source adapters

Committed `main` contains working registered loaders for:

- LumaWeave self-graph YAML/frontmatter data.
- Markdown vaults, including wiki links, tags, aliases, and unresolved-link handling.
- Cytoscape JSON, including nested and flat forms, position passthrough, duplicate handling, and orphan-edge warnings.
- `package.json` dependency graphs.
- CSV edge lists with configurable columns, header handling, quoted fields, and partial-load warnings.

The active source and per-adapter configuration are stored in settings. `loadSource()` resolves the registry entry, builds the saved adapter configuration, and dispatches through the registered loader. Registered adapters can be activated from the source-adapter panel; candidate entries remain read-only.

Evidence: `src/source-adapter/`, `src/graph/ingest/`, `src/control-plane/settings/settings.schema.ts`, and the five adapter E2E specifications.

### Theme, inspector, and workspace

- The theme system has authored primitive/semantic/component tiers plus flat runtime tokens consumed by the application.
- Governance helpers and targeted tests validate canonical token paths and tier references; the application does not currently execute that assertion during boot.
- Theme switching, OKLCH application crossfade, WCAG contrast helpers, scoped target overrides, and override persistence have runtime implementations.
- The radial inspector registers eight spokes in a stable order.
- Color applies palette, hex, and supported eyedropper values to active bindings.
- Geometry switches among the five node programs at global or target scope.
- Type presents the registered typography roles as a read-only reference.
- Motion toggles Reduce Motion and presents the motion-safety registry.
- Code shows registered source provenance and dispatches open-in-editor behavior.
- Apply copies current target overrides to selected compatible targets.
- History lists and resets target overrides.
- The tile workspace supports floating and docked modes, dragging, resizing, snapping, explicit groups, collapse, z-ordering, and persisted layout state.

Evidence: `src/themes/`, `src/control-plane/inspector/`, `src/control-plane/panels/`, `tests/e2e/v89-4-inspector-radial-full.spec.ts`, inspector-spoke specifications, and tile specifications.

### Desktop safety and validation

- Project-scoped file reads canonicalize and enforce the project-root boundary.
- Directory traversal skips symlinks, limits recursion depth, applies extension/exclusion filters, and returns relative paths.
- User-file reads reject symlinks and non-regular files.
- Script dispatch is allowlisted and output-capped; the caller wait is wrapped in a 60-second timeout.
- GitHub Actions runs CSS logical-property linting and TypeScript typechecking on pushes and pull requests.
- The repository contains a broad local Playwright suite across rendering, settings, themes, adapters, inspector behavior, accessibility, and GWells.

Evidence: `src-tauri/src/fs.rs`, `.github/workflows/ci.yml`, and `tests/e2e/`.

## Partial

### Source coverage and ingestion UX

- The adapter platform and five committed loaders work, but the catalog is broader than the implementation.
- The package-dependency loader currently implements `package.json`; the registry's Cargo, Python, and Go manifest patterns are not equivalent working loaders.
- Source configuration is adapter-specific and functional, but onboarding, validation messaging, and candidate-versus-registered presentation still need product-level refinement.

### Inspector depth

- The Layout radial spoke is an explicit placeholder.
- Type is informational rather than an editor.
- Color exposes target and global application; some finer-grained scope controls remain disabled.
- History is target-override history, not general application history or event sourcing.

### Physics controls

- The backend supports seed, well, and interaction overrides, but the user-facing controls expose only a small subset of that capability.
- Existing layouts remain oriented toward hierarchical/containment-shaped graphs even though structural fallback classification is more general.
- Runtime diagnostics exist primarily through developer/test probes rather than a finished user-facing lifecycle surface.

### Renderer abstraction and 3D data

- `graphRendererInterface.ts` is an extension seam, not a second renderer implementation.
- GWells seeders can write `z`, but the active force integration and Sigma renderer use two-dimensional positions.
- Three.js, React Three Fiber, and Drei are dependencies without runtime imports in `src/`.

### Test automation and release readiness

- Playwright coverage exists locally, but GitHub Actions does not execute it.
- The repository is pre-1.0 and has not completed the documented cold-install/release-build readiness arc.
- Some developer and internal QA surfaces are intentionally gated behind development settings.

## Planned

### Three-dimensional rendering

- A Three.js / React Three Fiber renderer attached through the renderer interface.
- Translation of semantic graph policies, theme bindings, selection, and camera behavior into the 3D renderer.
- Full three-dimensional GWells force integration, followed later by optional VR interaction.

### Source-adapter expansion

- Git/codebase analysis.
- Website crawling.
- OpenAPI and database-schema ingestion.
- Cloud-infrastructure and issue-tracker ingestion.
- Stronger adapter discovery, pre-load validation, bounded QA reports, and acceptance evidence.

Registry entries for these sources are catalog declarations; they do not constitute working adapters.

### GWells evolution

- A profile layer above the existing dialect API while preserving `applyDialect()` compatibility.
- Universal-balanced and source-shaped seed layouts beyond the current containment layouts.
- Graph analysis and explainable layout recommendations.
- User-facing macro controls followed by safe advanced well/interaction controls.
- Import/export of reproducible tuning profiles and clearer settle/runtime feedback.

### Workspace and control-plane evolution

- Saved and named workspace layouts.
- Implemented navigation lenses rather than the current registry seam.
- Deeper provenance and source-aware Code spoke relationships.
- Event-backed layout and override history as a control-plane consumer, not a GWells dependency.

## Evidence and trust notes

- Code is authoritative for whether a runtime path exists.
- A test file is evidence of intended and exercised behavior, but this document does not claim that the entire Playwright suite currently passes on every platform.
- A registry entry, dependency, type, interface, schema field, or design document is not implementation evidence by itself.
- Historical roadmap and pass documents may contain useful rationale but are not current feature-status authorities.
- Current navigation begins at the [README](../README.md) and [Documentation Index](overview/DOCS_INDEX.md).
