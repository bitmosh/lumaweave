---
id: policy.source.of.truth
title: LumaWeave — Source of Truth Map
type: policy
status: current
cluster: violet
domain: operating-policies
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-15
references:
  - policy.session.and.stack
  - policy.qa.and.playwright
  - theme.token.path.map
  - theme.system.overview
  - graph.runtime.boundary.contract
  - motion.safety.contract
  - audio.reactivity.contract
  - audio.source.system.contract
  - music.reactive.mapping.contract
  - system.index.registry.contract
  - human.mode.evidence.mode.contract
  - command.deck.and.hotkey.registry.contract
  - physics.gwells.contract
tags:
  - policy
  - source-of-truth
  - governance
  - forbidden-boundaries
  - v86a
  - gwells
---

# LumaWeave — Source of Truth Map

Authoritative file/contract locations and rules per system. When in doubt, this doc is what governs. Stale paths or duplicate content elsewhere lose to this.

## Repo Root

```
/home/boop/Projects/lumaweave
```

`/home/boop/Projects` is not the repo.

---

## QA / Mission Control

Primary files:
```
docs/roadmap/BACKLOG_POLICY.md
src/control-plane/qa/QaPanel.tsx
src/control-plane/qa/qa-registry.ts
src/control-plane/qa/advisory-registry.ts
tests/e2e/contract-registry.spec.ts
tests/e2e/helpers/qa.ts
```

Rules:
- Current QA key must match current pass.
- Advisory questions/proposals/backlog must load for current QA key.
- Proposal IDs expected by tests must exist in the active advisory section.
- Backlog tests require active advisory backlog rows.
- Fallback advisory is not valid current-pass evidence.
- No skipped tests.

---

## Graph / Sigma Boundary

External foundations:
```
Graphology — graph data model/library
Sigma      — graph renderer
```

LumaWeave-owned graph governance:
```
docs/graph/contracts/*
docs/graph/intelligence/*
src/graph/graphViewElementRegistry.ts
src/graph/graphVisualThemeMappingRegistry.ts
src/control-plane/graph/GraphVisualInventoryPanel.tsx
```

Rules:
- Registry and inventory metadata do not mutate Sigma.
- DOM-wrapper evidence is not canvas/Sigma internals evidence.
- Node/edge/canvas styling requires explicit future contract.
- Camera/filter behavior requires explicit future contract.
- Physics layout is now governed by the Gwells contract (see "Physics / Gwells" section below). Layout changes outside the gwells engine remain forbidden.

---

## Physics / Gwells

Primary:
docs/_v100-rewrites/GWELLS_PHYSICS.md  (supersedes GRAVITY_WELL_SYSTEM_CONTRACT.md, GWELLS_README.md, GWELLS_REGISTRY_PATTERNS.md, GWELLS_DIALECT_RADIAL_BACKBONE.md — archived v100.0.4)
src/physics/gwells/types.ts
src/physics/gwells/wellTypes.ts
src/physics/gwells/interactions.ts
src/physics/gwells/seedFunctions.ts
src/physics/gwells/dialects.ts
src/physics/gwells/engine.ts
src/physics/gwells/seeders/directoryBackboneN2.ts
scripts/validate-gwells.mjs

Rules:
- Gwells is the sole physics engine. No other layout or force-simulation
  code may write node positions.
- Gwells depends only on `graphology`. No React, no Sigma, no theme
  tokens, no LumaWeave-specific imports inside the module.
- Gwells writes only the `x` and `y` node attributes plus the
  `__seededSpinePositions` and `__gwellsState` graph-level attributes.
  All other mutations are forbidden.
- The `__seededSpinePositions` attribute is a stable contract used by
  Sigma's `nodeReducer` for spine pinning. Do not rename it.
- The `__gwellsState` attribute is read-only for all external consumers
  (Graph Inspector Panel, debug tools). Engine has exclusive write
  authority.
- Dialects are the user-facing concept. Picking a layout means picking
  a dialect. Dialect IDs are stable string references; never rename
  without a migration.
- The dialect-not-found case must fall back to a default dialect and
  log via `onError`. Engine never crashes on unknown dialect ID.
- Validator script (`scripts/validate-gwells.mjs`) must pass before
  registry edits are accepted.
- Force kinds are minimal-and-final: `attraction`, `repulsion`,
  `spring`, `linear-alignment`, `perpendicular`. New kinds added only
  when they cannot be composed from existing ones.

Retired (do not reintroduce):
- ForceAtlas2 (`graphology-layout-forceatlas2`)
- Noverlap (`graphology-layout-noverlap`)
- The FA2-based helix and solar-orbit dialect implementations
- Per-edge physicsWeight via `edgeTypePhysicsRegistry`
- Slider-based physics tuning (linkDistance, repelForce, centerForce,
  communityGravity, strongGravityMode, linLogMode, adjustSizes,
  barnesHutTheta, physicsPreset)

Future dialects (concept docs only; gwells provides the implementation
substrate):
- `docs/physics/CONSTELLATION_MODE_DIALECT.md`
- `docs/physics/HELIX_CONSTELLATION_DIALECT.md`
- `docs/physics/GALAXY_MODE_DIALECT.md`
- `docs/_v100-rewrites/GWELLS_PHYSICS.md` (supersedes PHYSICS_DIALECT_SYSTEM.md — archived v100.0.4)
- `docs/graph/intelligence/CLUSTER_GRAVITY_AND_COLOR_CODED_NEIGHBORHOODS.md`

---

## Theme / Token System

Primary:
```
docs/theme/THEME_SYSTEM_OVERVIEW.md
docs/theme/THEME_TOKEN_PATH_MAP.md
src/themes/themeTokenPaths.ts
src/themes/tokenPrimitives.ts
src/themes/tokenSemantics.ts
src/themes/tokenComponents.ts
src/themes/themeTokenGovernance.ts
src/graph/graphVisualThemeMappingRegistry.ts
```

Rules:
- Use canonical token paths only.
- Three-tier model: primitives → semantics → components. Tier-walk validator hard-throws on violations.
- Do not promote planned tokens without explicit pass.
- Token path metadata precedes token value preview.
- Token value preview precedes application.
- CSS variable writes outside the override storage layer require explicit future contract.

---

## Motion Safety / Epilepsy Guard

Primary:
```
docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
src/accessibility/motionSafetyRegistry.ts
```

Rules:
- Reduce Motion is master authority.
- Visual effects must be classified before implementation.
- Moderate/high effects disable under reduced motion.
- No strobe, rapid flash, high-frequency flicker, camera shake, or risky pulse without explicit contract and safety gate.

---

## Audio / Music Reactive Systems

Primary:
```
docs/audio/AUDIO_REACTIVITY_CONTRACT.md
docs/audio/MUSIC_REACTIVE_MAPPING_CONTRACT.md
docs/audio/AUDIO_SOURCE_SYSTEM_CONTRACT.md
docs/audio/UNIVERSAL_AUDIO_HANDLE_ROUTING.md
src/audio/syntheticAudioSignal.ts
src/audio/musicReactiveMappingRegistry.ts
src/audio/audioSourceRegistry.ts
```

Rules:
- Synthetic signal before real audio.
- Signal preview before visual reaction.
- Mapping inventory before runtime reaction.
- Audio source registry before microphone/file/audio playback.
- No microphone, Web Audio input, file upload, decoding, playback, music reactivity, or graph/Sigma mutation until explicitly promoted.

---

## System Index Registry

Primary:
```
docs/control-plane/contracts/SYSTEM_INDEX_REGISTRY_CONTRACT.md
docs/control-plane/contracts/SYSTEM_INDEX_PANEL_MOUNT_CONTRACT.md
src/system-index/systemIndexRegistry.ts
src/control-plane/system-index/SystemIndexPanel.tsx
```

Rules:
- 16-field SystemIndexEntry type is canonical.
- 10 categories, 10 kinds, 8 lifecycle statuses.
- Validator (v72c) must pass before any new entry is accepted.
- SystemIndexPanel is passive/read-only; no interactive edits without future contract.

---

## Human / Evidence / Debug Mode System

Primary:
```
docs/control-plane/contracts/HUMAN_MODE_EVIDENCE_MODE_CONTRACT.md
src/modes/modeMetadataRegistry.ts
scripts/validate-mode-registry.ts
```

Rules:
- Mode metadata registry (v73b) is the source of truth for mode definitions.
- Mode Registry Validator (v73c) must pass before mode-dependent UI is added.
- Human Mode: summary/overview only. Evidence Mode: full evidence panels. Debug Mode: raw IDs and registry internals.

---

## Command Deck / Perspective System

Primary:
```
src/control-plane/command-deck/*
src/control-plane/perspectives/*
docs/control-plane/contracts/COMMAND_DECK_AND_HOTKEY_REGISTRY_CONTRACT.md
docs/control-plane/contracts/PERSPECTIVE_SYSTEM_CONTRACT.md
docs/control-plane/contracts/GRAPH_CONTROL_PLANE_NAVIGATION_CONTRACT.md
```

Rules:
- Command Deck is read-only metadata unless explicitly promoted.
- No command execution.
- No new hotkeys without registry approval.
- Perspective System is read-only metadata unless explicitly promoted.

---

## Theme Workshop Security (Lattica — deferred)

The Lattica Theme Workshop security packet is **archived** at the operator level pending v88+ workshop work. No active codebase docs reference it. When workshop work resumes, the archived packet returns to `docs/security/`.

Until then, **no theme-defined commands, scripts, postinstall hooks, remote URLs, executable assets, or arbitrary workshop downloads.**

Only future Lattica-generated, signed, schema-valid, provenance-attested theme bundles will be permitted to enter the trusted installation path. Until that contract lands, all theme content stays locally authored.

---

## Visual Grammar Engine (design-locked)

Primary:
```
docs/visual-grammar-engine/VGE_OVERVIEW_AND_TERMS.md
docs/visual-grammar-engine/VGE_GRAMMAR_HANDLE_AND_LENS.md
docs/visual-grammar-engine/VGE_SIGNAL_LOOM.md
docs/visual-grammar-engine/VGE_ASSET_AND_TOKENS.md
docs/visual-grammar-engine/VGE_DIALECT_AND_SAFETY.md
docs/visual-grammar-engine/VGE_UI_AND_POSITIONING.md
docs/visual-grammar-engine/VGE_ROADMAP.md
```

Status: design-locked / docs-only. No runtime implementation authorized. Implementation gated on Source Adapter OS Reconnect Contract (v74), Synthetic Data Fixtures v0 (v75), and other prerequisites.

Shipping precursors exist for several VGE concepts: Grammar Lens (`docs/grammar-lens/`), Asset Bank (`src/themes/assetRegistry.ts` empty bank), Visual Handles (`docs/handleset/`), Theme Tokens (three-tier model in `docs/theme/`).

---

## Source Adapter OS

Primary:
```
docs/_v100-rewrites/SOURCE_ADAPTER.md  (supersedes all source-adapter docs — archived v100.0.5)
```

Rules:
- Local-first operation, no unapproved network transmission.
- No secret/token leakage.
- User-controlled workspace scope.
- No parent-directory wandering.
- No auto-execution of project commands.
- Audit logs for source ingestion.
- Do not mutate the graph renderer directly from source events.

---

## Full Forbidden Boundary List

The following capabilities require an explicit new contract before any implementation. No exceptions.

**Graph / Renderer:**
- Sigma/renderer mutation of any kind
- Camera or filter behavior changes
- Physics layout changes outside the Gwells contract (gwells engine is the only allowed physics path; see "Physics / Gwells" section above)
- Node/edge/canvas styling

**Audio:**
- Microphone access or any Web Audio input
- Audio file upload or decoding
- Audio playback
- Music-reactive visual behavior

**Motion:**
- Animation, pulse, shimmer, or flash (any frequency)
- Strobe or rapid flicker
- Camera shake

**Theme / Assets:**
- CSS variable writes outside the override storage layer
- New canonical token promotion outside the promotion process
- Theme pack installation or download execution
- Executable theme assets of any kind

**System:**
- Command execution
- Storage/persistence (beyond what is explicitly contracted)
- Remote imports or external URL loading
- Arbitrary JavaScript injection

**QA / Evidence:**
- Skipping tests
- Weakening tests to match broken behavior
- Treating fallback advisory as current-pass evidence
- Manual DevTools JavaScript as primary evidence

---

*Stale doc paths from pre-rehaul docs (`docs/theme-system/`, `docs/system-index/`, `docs/modes/`, `docs/control-plane/qa/BACKLOG_POLICY.md`, `docs/security/lattica_theme_workshop_security_packet/`) have been corrected to current locations. v86a-era docs added (Source Adapter OS, Visual Grammar Engine cluster, three-tier token model). 2026-05-15 update: Physics / Gwells section added as gwells migration begins; FA2/noverlap/edgeTypePhysicsRegistry retired.*