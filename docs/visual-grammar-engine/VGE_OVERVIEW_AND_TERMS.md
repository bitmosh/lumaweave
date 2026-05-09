---
id: vge.overview.and.terms
title: Visual Grammar Engine — Overview & Core Terms
type: concept
status: design-locked
version: v86a
domain: visual-grammar-engine
cluster: teal
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
references:
  - vge.grammar.handle.and.lens
  - vge.signal.loom
  - vge.asset.and.tokens
  - vge.dialect.and.safety
  - vge.ui.and.positioning
  - vge.roadmap
  - theme.system.overview
  - theme.token.compatibility
  - grammar.lens.contract
  - cursor.inspector.contract
  - link.network.overview
tags: [vge, visual-grammar-engine, overview, terms, future, docs-only]
---

# Visual Grammar Engine — Overview & Core Terms

> **Status:** Future architecture / docs-only snapshot. No runtime implementation authorized by this packet.

## v86a Status Note

VGE is design-locked, not implementation-active. This cluster captures the future architecture of the Visual Grammar Engine as it relates to current v86a state. Several VGE concepts have shipped partial precursors:

- **Grammar Lens / Cursor Grammar Inspector** — A precursor exists today as the [Grammar Lens Contract](grammar.lens.contract) and [Cursor Inspector Contract](cursor.inspector.contract) in the grammar-lens cluster. Full VGE Grammar Lens extends those contracts with editing, validation, and override flows.
- **Asset Bank** — A forward-compat empty-bank contract exists today via `src/themes/assetRegistry.ts` and the `assetRefs` field on theme presets. VGE Asset Bank populates this.
- **Visual Handles** — The current handleset cluster ([Active Handles](handleset.active), [Planned Handles](handleset.planned)) is a precursor to the Grammar Handle Registry. VGE handles extend the model with grammar paths, signal compatibility, and safety capabilities.
- **Theme Tokens** — The three-tier token model and canonical token paths (see [Theme System Overview](theme.system.overview)) define the vocabulary VGE handles consume. VGE does not redefine tokens; it routes to them.

VGE implementation is gated on the Source Adapter OS Reconnect Contract (v74), Synthetic Data Fixtures v0 (v75), and other prerequisites. See [VGE Roadmap](vge.roadmap).

---

## Product Thesis

LumaWeave is evolving from a local-first code architecture visualization platform into a local-first experiential data visualization platform.

Users plug in modular data sources, classify the shape of the data, choose physics layouts and visual dialects, and tune how the resulting living system looks, reacts, breathes, and explains itself.

**Core product line:**

> Every visual element can resolve to a grammar handle.
> LumaWeave lets users inspect, edit, validate, preview, and save visual dialect overrides through safe, schema-governed workflows.

**Emotional line:**

> Do not just visualize your data. Enter it. Shape its dialect. Watch it breathe.

**Enterprise line:**

> LumaWeave bridges enterprise-grade evidence, governance, and local-first security with immersive visual workspaces that make complex systems easier to understand, audit, and evolve.

---

## Core Invariant

Presentation is customizable.

Contract truth, evidence status, permissions, safety boundaries, and runtime capabilities are not casually editable.

This invariant is the same load-bearing principle as the [Theme Token Compatibility](theme.token.compatibility) doc: **customization changes presentation, not evidence truth.** VGE applies that principle across the entire visual experience — not just theme tokens.

---

## System Stack

```
Visual Grammar Engine
├─ Source Adapter OS
├─ Data Shape Classifier
├─ Physics Layout Registry
├─ Theme / Asset Bank
├─ Signal Loom
├─ Visual Handle Registry
├─ Safety / Motion Guard
├─ Preview / Override Layer
└─ Dialect Preset Library
```

---

## Responsibility Split

| Component | Role |
|---|---|
| **Visual Grammar Engine** | Terminal/config/file-level system for authoring, validating, previewing, and managing full visual grammar presets |
| **Signal Loom** | Routing layer: events, signals, timing, envelopes, source changes mapped to visual handles |
| **Grammar Lens** | Inspector experience: click an element, inspect/edit the local grammar slice |
| **Cursor Grammar Inspector** | Default-on, toggleable Grammar Lens mode as a small cursor popout |
| **Asset Bank** | User-facing catalog/router for validated themes, layouts, visual assets, grammar presets |

**Fundamental user paths:**

```
Edit the whole system     → Visual Grammar Engine / YAML / terminal
Edit the thing I clicked  → Grammar Lens / Cursor Grammar Inspector
Understand why things react → Signal Loom / Routing Matrix
Reuse/share pieces        → Asset Bank
Try it safely             → Preview Override Layer
```

---

## Core Term Definitions

### Visual Grammar

The complete ruleset that determines how data becomes visual experience. Includes source type, data shape, layout/physics profile, theme and asset selections, signal routes, visual handles, safety transforms, display depth, and evidence overlays.

### Visual Dialect

A named visual/behavioral profile for a type of data, workspace, or experience. What makes a repo graph feel like a mission-control dashboard vs an architecture atlas vs a living music-library screensaver.

### Grammar Handle

A stable addressable handle connecting a visual/UI/rendering element to a piece of visual grammar.

Example handles:

```
graph.node.changed
graph.edge.trace
panel.boundary.seal
status.badge.verified
music.cluster.currentTrack
evidence.card.contractStatus
```

Handles expose editable presentation slots. They do not expose contract truth, source truth, permissions, or uncontracted runtime behavior.

For the model details, see [Grammar Handle and Lens](vge.grammar.handle.and.lens).

### Grammar Lens

The inspector feature that lets a user click a visual element and inspect/edit the grammar slice controlling that element. Includes lightweight cursor popouts and pinned/docked editor modes.

The current shipping precursors are documented in [Grammar Lens Contract](grammar.lens.contract) and [Cursor Inspector Contract](cursor.inspector.contract).

### Cursor Grammar Inspector

The toggleable default Grammar Lens mode. When enabled, clicking an element opens a small cursor-adjacent popout showing the focused YAML grammar slice for that element.

Suggested UI hint: `Press P to pin this Grammar Lens.`

### Signal Loom

The routing subsystem inside the Visual Grammar Engine. Maps source events/data changes/synthetic signals/timing patterns/envelopes through visual handles and safety transforms into custom visual reactivity.

For routing details, see [Signal Loom](vge.signal.loom).

### Asset Bank

User-facing catalog and routing layer for approved customization assets. Organizes themes, layouts, icons, badges, typography packs, panel frames, grammar presets, graph fixtures, and visual dialects. Routes user choices into canonical registries — does not replace them.

For the asset model and theme token compatibility, see [Asset and Tokens](vge.asset.and.tokens).

### Visual Dialect Protocol

Schema-governed preset/configuration files defining a visual dialect. Possible extensions: `.lwgrammar.yaml`, `.lwdialect.yaml`.

For schema governance and safety boundaries, see [Dialect and Safety](vge.dialect.and.safety).

### SignalScript

Optional term for the declarative syntax inside Visual Dialect Protocol files. Should begin as YAML/JSON schema — not arbitrary JavaScript.

---

## Living Data Source Vision

LumaWeave should eventually support:

- Code repositories, documentation systems, Obsidian vaults
- Websites, source adapter outputs, music libraries
- Workflow graphs, QA/evidence systems, agent patch histories
- Supply chains, research corpora, chat archives

Recommended visual dialects by data shape:

```
Hierarchical data      → Cathedral Stack / Atlas Map
Dense relationships    → Constellation Mesh
Timeline/event flow    → River Timeline
Hub-and-spoke systems  → Orbital System
Semantic clusters      → Neural Bloom
Dependency pipelines   → Loom Flow / Debug Circuit
```

---

## Non-Negotiable Safety Principle

LumaWeave can make data feel alive. It must not make truth ambiguous.

Every grammar, route, asset, and visual override must remain subordinate to:

- source provenance
- evidence status
- permission boundaries
- motion safety
- audio safety
- graph/Sigma runtime contracts
- QA/advisory lockstep
- schema validation

---

## What This Packet Does Not Authorize

- No graph/Sigma mutation
- No node/edge/canvas styling runtime changes
- No audio input, playback, decoding, microphone, or Web Audio behavior
- No arbitrary JavaScript, shell commands, remote imports, or executable theme assets
- No CSS variable writes or new token promotion without explicit future contract
- No Playwright weakening, skipped tests, or fallback advisory acceptance

**Repo location:** `docs/visual-grammar-engine/`

---

*Frontmatter normalized v86a (id `vge.overview.and.terms`, status `design-locked`, references added). Body content preserved as design-locked architecture.*
