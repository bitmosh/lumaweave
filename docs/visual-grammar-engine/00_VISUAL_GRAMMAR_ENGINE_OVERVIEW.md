# 00 — Visual Grammar Engine Overview

## Product Thesis

LumaWeave is evolving from a local-first code architecture visualization platform into a local-first experiential data visualization platform.

It should eventually allow users to plug in modular data sources, classify the shape of the data, recommend physics layouts and visual dialects, and let users tune how the resulting living system looks, reacts, breathes, and explains itself.

## Core Product Line

> Every visual element can resolve to a grammar handle.  
> LumaWeave lets users inspect, edit, validate, preview, and save visual dialect overrides through safe, schema-governed workflows.

## Emotional Product Line

Do not just visualize your data.

Enter it. Shape its dialect. Watch it breathe.

## Enterprise Product Line

LumaWeave bridges enterprise-grade evidence, governance, and local-first security with immersive visual workspaces that make complex systems easier to understand, audit, and evolve.

## System Stack

```txt
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

## Responsibility Split

```txt
Visual Grammar Engine
The terminal/config/file-level system for authoring, validating, previewing, and managing full visual grammar presets.

Signal Loom
The routing layer: events, signals, timing, envelopes, source changes, and audio-like control signals mapped to visual handles.

Grammar Lens
The inspector experience: click an element, inspect/edit the local grammar slice, validate, preview, pin, save.

Cursor Grammar Inspector
A default-on, toggleable Grammar Lens mode that appears as a small cursor popout.

Asset Bank
The user-facing catalog/router for validated themes, layouts, visual assets, grammar presets, and compatible customization assets.
```

## Fundamental User Experiences

```txt
I want to edit the whole system:
→ Visual Grammar Engine / YAML / terminal

I want to edit the thing I clicked:
→ Grammar Lens / Cursor Grammar Inspector

I want to understand why things react:
→ Signal Loom / Routing Matrix

I want to reuse/share pieces:
→ Asset Bank

I want to try it safely:
→ Preview Override Layer
```

## Living Data System Vision

LumaWeave should eventually support:

- Code repositories.
- Documentation systems.
- Obsidian vaults.
- Websites.
- Source adapter outputs.
- Music libraries.
- Workflow graphs.
- QA/evidence systems.
- Agent patch histories.
- Supply chains.
- Research corpora.
- Chat archives.

The platform should recommend a visual dialect based on the shape of the data.

Examples:

```txt
Hierarchical data → Cathedral Stack / Atlas Map
Dense relationships → Constellation Mesh
Timeline/event flow → River Timeline
Hub-and-spoke systems → Orbital System
Semantic clusters → Neural Bloom
Dependency pipelines → Loom Flow / Debug Circuit
```

## Non-Negotiable Safety Principle

LumaWeave can make data feel alive.

It must not make truth ambiguous.

Every grammar, route, asset, and visual override must remain subordinate to:

- Source provenance.
- Evidence status.
- Permission boundaries.
- Motion safety.
- Audio safety.
- Graph/Sigma runtime contracts.
- QA/advisory lockstep.
- Schema validation.
