---
id: vge.asset.and.tokens
title: Visual Grammar Engine — Asset Bank & Theme Token Compatibility
type: concept
status: design-locked
version: v86a
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
references:
  - vge.overview.and.terms
  - vge.grammar.handle.and.lens
  - vge.dialect.and.safety
  - theme.token.compatibility
  - theme.token.path.map
  - theme.preset.model
  - theme.system.overview
  - handleset.active
  - handleset.planned
tags: [vge, asset-bank, tokens, compatibility, future, docs-only]
---

# Visual Grammar Engine — Asset Bank & Theme Token Compatibility

> **Status:** Future architecture / docs-only. No runtime implementation authorized.

## v86a Status Note

This concept is the future expansion of two shipping precursors:

- **Asset Bank** — A forward-compat empty-bank contract exists today as `src/themes/assetRegistry.ts`. Theme presets carry an `assetRefs` field pre-wired for asset bank entries. See [Theme Preset Model](theme.preset.model). The bank itself is empty in v86a; population happens in VGE work and v88+ workshop.
- **Theme Token Compatibility** — The compatibility hierarchy (tokens first → handles second → assets third) is already enforced in [Theme Token Compatibility](theme.token.compatibility) for the current canonical token system. VGE Asset Bank operates within this same hierarchy.

The compatibility rules in this doc and the v86a [Theme Token Compatibility](theme.token.compatibility) doc are aligned. When VGE Asset Bank ships, its rules extend the existing v86a rules — they do not replace or contradict them.

---

## Asset Bank

### Purpose

The Asset Bank is the user-facing catalog, staging area, and routing layer for approved customization assets. It routes user choices into the correct underlying registries — it does not replace them.

```
User-facing layer:  Asset Bank
Routes into:        Theme Token Registry, Theme Handle Registry, Layout Preset Registry,
                    Widget Registry, Graph/Sigma visual mapping (future), Audio/music
                    reactive mapping (future), Evidence/QA templates, Source Adapter fixtures (future)
Does not replace:   Canonical token paths, safety contracts, QA/advisory lockstep,
                    graph/audio/runtime boundaries
```

**Core rule:** Asset Bank exposes approved customization options. Registries decide what those options are allowed to mean.

### Responsibilities

Asset Bank should:

- Organize user-accessible customization assets with provenance, status, type, compatible targets, and safety status
- Route assets into token/handle/layout/signal registries
- Prevent unsupported or unsafe asset use
- Support preview/revert/history (future)
- Support import quarantine (future)

Asset Bank must not:

- Invent canonical token paths
- Write arbitrary CSS/JS
- Execute commands, mutate Sigma, enable audio input/playback
- Bypass evidence contracts
- Treat imported assets as trusted by default
- Install executable theme packs

### User-Facing Categories

```
Themes                  Layouts                 Widget presets
Panel frames            Status badges           Icons
Typography packs        Graph visual presets    Visual grammar presets
Signal Loom routes      Evidence templates      Source adapter fixtures
Screensaver/Ambient modes (future)
```

### Asset Lifecycle

```
candidate → quarantined → validated → accepted → active → deprecated → rejected
```

### Example Asset Metadata

```ts
{
  id: "asset.solar-archive.boundary-seal.gold",
  type: "badge-style-preset",
  name: "Solar Archive Boundary Seal",
  status: "accepted",
  source: "lumaweave-generated",
  version: "1.0.0",
  scope: ["theme", "evidence", "boundary-status"],
  allowedTargets: ["evidence.boundarySeal", "status.badge"],
  forbiddenCapabilities: ["commandExecution", "audioInput", "graphMutation"],
  reducedMotionSafe: true,
  provenance: { createdBy: "local-user", signed: false }
}
```

### Inspector Integration

When a user clicks a visual element in Grammar Lens, the Asset Bank shows only compatible assets for the resolved handle's editable slots.

### Product Analogy

```
Registries    = warehouse inventory system / routing rules / safety rules
Asset Bank    = user-facing catalog and staging area
Inspector     = scanner gun / picker interface
Theme Preview = temporary staging cart
Saved Theme   = finalized order
```

---

## Theme Token Compatibility

### Purpose

Prevents the Visual Grammar Engine, Grammar Lens, and Asset Bank from conflicting with the existing theme/surface/token system.

This section is the VGE-aware framing of the same compatibility principles enforced in [Theme Token Compatibility](theme.token.compatibility) for v86a's canonical token system. The two docs share the same underlying invariants.

### Core Rule

Canonical token paths remain the source of truth. Asset Bank, Grammar Lens, and Visual Grammar files must not invent parallel token systems or bypass canonical token paths.

### Compatibility Hierarchy

```
Canonical Token Paths
        ↓
Theme Presets assign values
        ↓
Theme Handles expose editable slots
        ↓
Grammar Handles expose visual grammar slots
        ↓
Asset Bank provides compatible visual assets for those slots
        ↓
Preview / saved override only through contract
```

Simplified: **tokens first → handles second → assets third → user customization fourth → runtime application only by explicit contract**

### Conflict Risks to Avoid

**Asset Bank becoming a second token registry:**

- Wrong: Asset Bank defines `cardBackground`, `panelGlow`, `dangerRed`.
- Right: Asset Bank asset declares `uses token slot: surfaceRaised`, `uses token slot: statusForbidden`.

**Grammar Lens bypassing token paths:**

- Wrong: User clicks card → Inspector writes arbitrary CSS variable or inline style.
- Right: User clicks card → Grammar Lens resolves handle → editable slots → canonical token paths → preview layer.

**Asset implying behavior:**

- Wrong: "This music theme enables audio input." / "This layout button runs commands."
- Right: "This preset is passive metadata until explicitly promoted by contract."

### Theme/Grammar Editable Slot Categories

```
Color:       surface, text, border, accent, warning, danger, safe, locked, verified
Shape:       radius, border width, divider style
Depth:       shadow, elevation, inset, glass strength
Expression:  glow strength, ornament density, texture strength
Typography:  heading/body/mono font role, size scale
Density:     padding, gap, row height, card compactness
Iconography: icon style, badge style, seal style
Motion:      static only until explicit future reduced-motion-safe contract
```

### Forbidden Through Theme/Grammar

Commands · scripts · event handlers · remote URLs · arbitrary CSS injection · theme-defined command execution · graph/Sigma behavior · audio input/playback · music reactivity runtime · storage/persistence without contract.

### Compatibility Rule

Asset Bank may provide validated visual assets only for slots exposed by the Theme Handle Registry or Grammar Handle Registry. Assets must not create new canonical token paths, bypass token path maps, write arbitrary CSS variables, or alter contract truth.

If a new visual slot is needed, it must be added through the canonical token/theme path process first. See the promotion model in [Theme Token Path Map](theme.token.path.map).

### Core Invariant

Customization changes presentation. Customization does not change evidence truth.

This is identical to the load-bearing principle in [Theme Token Compatibility](theme.token.compatibility) — applied across all customization layers, not only theme tokens.

---

*Frontmatter normalized v86a. Body content preserved as design-locked architecture. Connections added to the v86a empty-bank asset registry contract and the canonical theme token compatibility doc.*
