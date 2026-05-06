---
id: index.source.of.truth
title: Source of Truth Map
type: index
status: accepted
version: v73c
domain: operating-policies
cluster: purple
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [source-of-truth, forbidden, boundaries, operating, agent]
---

# LumaWeave / Lattica — Source of Truth Map

## Repo Root

```
/home/boop/Projects/lumaweave
```

`/home/boop/Projects` is not the repo.

---

## QA / Mission Control

Primary files:
```
docs/control-plane/qa/BACKLOG_POLICY.md
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
- No skipped tests. Ever.
- `switchQaKey()` must not wait for Advisory tab content.
- `waitForAdvisory()` belongs only after Advisory tab is explicitly opened.

---

## Graph / Sigma Boundary

External foundations (not LumaWeave-owned):
```
Graphology  — graph data model/library
Sigma       — graph renderer (2D WebGL)
```

LumaWeave-owned graph governance:
```
docs/graph/contracts/
src/graph/graphViewElementRegistry.ts
src/graph/graphVisualThemeMappingRegistry.ts
src/control-plane/graph/GraphVisualInventoryPanel.tsx
```

Rules:
- Registry and inventory metadata do not mutate Sigma.
- DOM-wrapper evidence is not canvas/Sigma internals evidence.
- Node/edge/canvas styling requires explicit future contract.
- Physics/camera/filter behavior requires explicit future contract.
- No Sigma API calls without a promoted runtime contract.

---

## Theme / Token System

Primary:
```
docs/theme/THEME_TOKEN_PATH_MAP.md
src/themes/themeTokenPaths.ts
src/graph/graphVisualThemeMappingRegistry.ts
```

Rules:
- Use canonical token paths only.
- Do not promote planned tokens without explicit pass.
- Token path metadata precedes token value preview.
- Token value preview precedes application.
- CSS variable writes require explicit future contract.
- No invented token paths. No parallel asset registries.

---

## Ghost Overlay / Grammar Lens

Current state (partial — in development):
```
docs/grammar-lens/GHOST_OVERLAY_CURRENT_STATE.md
src/[overlay implementation — ask user for current path]
```

Rules:
- Overlay uses `data-lw-*` DOM attributes to identify clickable elements.
- Overlay respects forbidden boundaries — it cannot expose or edit
  contract truth, evidence status, or Sigma internals.
- Changes apply only to the currently active rendering layer.
- Inactive layer changes are queued in the cross-layer override cache.
- Cross-layer cache flushes pending overrides when user switches layers,
  passing each through the canonical token path validation and Motion
  Safety gate before applying.
- Grammar Lens popout shows per-element YAML/JSON slice only.
- Global element type updates ("apply to all type:border") require the
  GLOBAL_ELEMENT_UPDATE_CONTRACT before implementation.

---

## Motion Safety / Epilepsy Guard

Primary:
```
docs/accessibility/MOTION_SAFETY_AND_EPILEPSY_GUARD_CONTRACT.md
src/accessibility/motionSafetyRegistry.ts
```

Rules:
- Reduce Motion is master authority over all visual reactivity.
- Visual effects must be classified before implementation.
- Moderate/high effects disable under reduced motion.
- No strobe, rapid flash, high-frequency flicker, camera shake,
  or risky pulse without explicit contract and safety gate.
- All audio-reactive visual effects must pass through Motion Safety gate.
- Physics dialects bundle audio routing — both pass through the gate.

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
- No microphone, Web Audio input, file upload, decoding, playback,
  music reactivity, or graph/Sigma mutation until explicitly promoted.
- Audio reactivity is universal — any handle in any rendering layer
  can subscribe to any signal channel via the Signal Loom.
- All audio-reactive handles pass through Motion Safety gate.

---

## Physics Dialects

Primary:
```
docs/physics/PHYSICS_DIALECT_SYSTEM.md
docs/physics/HELIX_CONSTELLATION_DIALECT.md
docs/physics/CONSTELLATION_MODE_DIALECT.md
docs/physics/GALAXY_MODE_DIALECT.md
docs/physics/PHYSICS_AUDIO_ROUTING_CONTRACT.md
```

Rules:
- Physics dialects bundle force layout config AND audio routing config.
- Selecting a dialect sets both simultaneously.
- All physics-audio effects pass through Motion Safety gate.
- Galaxy mode requires stable per-cluster gravity wells and
  inter-cluster repulsion walls — do not implement without explicit contract.
- Physics changes apply only to the active rendering layer.

---

## Rendering Layer System

Primary:
```
docs/rendering/RENDERING_LAYER_ARCHITECTURE.md
docs/rendering/CROSS_LAYER_OVERRIDE_CACHE_CONTRACT.md
docs/rendering/SIGMA_2D_LAYER_CONTRACT.md
```

Rules:
- Only the active rendering layer receives live changes.
- Inactive layers receive pending override cache entries.
- Cache stores canonical token path changes, not raw CSS values.
- On layer switch: pending cache → token path validation → handle
  resolver for target layer → Motion Safety gate → apply.
- Themes preserve identity across layers via canonical token paths.
- Do not implement 3D rendering layer without explicit contract.

---

## System Index Registry

Primary:
```
docs/control-plane/contracts/SYSTEM_INDEX_REGISTRY_CONTRACT.md
src/system-index/systemIndexRegistry.ts
src/control-plane/system-index/SystemIndexPanel.tsx
scripts/validate-system-index.ts
scripts/validate-mode-registry.ts
```

Rules:
- 16-field SystemIndexEntry type is canonical.
- 10 categories, 10 kinds, 8 lifecycle statuses.
- System Index Validator (v72c) must pass before new entries accepted.
- Mode Registry Validator (v73c) must pass before mode-dependent UI added.
- SystemIndexPanel is passive/read-only. No interactive edits without contract.

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
- Mode Registry Validator (v73c) must pass before mode-dependent UI added.
- Human Mode: summary/overview only.
- Evidence Mode: full evidence panels. Default and QA-recommended.
- Debug Mode: raw IDs, registry internals, validator outputs.
- No runtime mode toggle without explicit contract.
- No evidence hiding in any mode.

---

## Command Deck / Perspective System

Primary:
```
src/control-plane/command-deck/
src/control-plane/perspectives/
docs/control-plane/contracts/COMMAND_DECK_AND_HOTKEY_REGISTRY_CONTRACT.md
docs/control-plane/contracts/PERSPECTIVE_SYSTEM_CONTRACT.md
```

Rules:
- Command Deck is read-only metadata unless explicitly promoted.
- No command execution.
- No new hotkeys without Hotkey Registry approval.
- Perspective System is read-only metadata unless explicitly promoted.
- No perspective save/load/switch without storage contract.

---

## Theme Workshop Security

Primary:
```
docs/security/
```

Core rule:
```
Only Lattica-generated, signed, schema-valid, provenance-attested
theme bundles may enter the trusted installation path.
```

No theme-defined commands, scripts, postinstall hooks, remote URLs,
executable assets, or arbitrary workshop downloads.

---

## Source Adapter OS

Primary:
```
docs/source-adapter/
src/source-adapter/         (v74b — not yet implemented)
scripts/validate-source-adapters.ts  (v74b — not yet implemented)
```

Rules:
- No runtime source ingestion without explicit contract.
- Local-first operation. No unapproved network transmission.
- No secret/token leakage. No parent-directory wandering.
- No auto-execution of project commands.
- Audit logs required for all source ingestion.
- SOURCE_ADAPTER_OS_CONTRACT.md (v74a) must be accepted before
  any adapter implementation begins.

---

## Full Forbidden Boundary List

The following require an explicit new contract before any implementation.

**Graph / Renderer:**
- Sigma/renderer mutation of any kind
- Graph physics, camera, or filter behavior changes without contract
- Node/edge/canvas styling
- 3D rendering layer implementation

**Audio:**
- Microphone access or any Web Audio input
- Audio file upload or decoding
- Audio playback
- Music-reactive visual behavior

**Motion:**
- Animation, pulse, shimmer, or flash (any frequency) without Safety gate
- Strobe or rapid flicker
- Camera shake

**Theme / Assets:**
- CSS variable writes
- New canonical token promotion
- Theme pack installation or download execution
- Executable theme assets of any kind

**Grammar Lens / Overlay:**
- Editing contract truth, evidence status, or QA state via overlay
- Applying overlay changes to inactive rendering layers without
  cross-layer override cache contract
- Global element type updates without GLOBAL_ELEMENT_UPDATE_CONTRACT

**System:**
- Command execution
- Storage/persistence beyond what is explicitly contracted
- Remote imports or external URL loading
- Arbitrary JavaScript injection

**QA / Evidence:**
- Skipping tests
- Weakening tests to match broken behavior
- Treating fallback advisory as current-pass evidence
- Manual DevTools JavaScript as primary evidence

**Future Concepts (no implementation without explicit contract):**
- VR implementation of any kind
- Agent familiar system
- Memory Palace sidecar
- Galaxy physics mode
- Real audio input / microphone
- Cross-layer active rendering
