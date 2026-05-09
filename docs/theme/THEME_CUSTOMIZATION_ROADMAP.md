---
id: theme.customization.roadmap
title: Theme Customization Roadmap
type: roadmap
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-08
references:
  - theme.system.overview
  - theme.preset.model
  - theme.override.storage.contract
  - theme.mapping.panel.entry.contract
  - theme.token.compatibility
tags: [theme, customization, roadmap, future, v86a]
---

# Theme Customization Roadmap

What customization features exist today, what's planned, and what stays off-limits without explicit contract work. This doc consolidates the v15-era customization path and scaffolding plan docs into a single forward-looking roadmap anchored on v86a state.

For implementation contracts that gate customization features, see [Theme Override Storage Contract](theme.override.storage.contract) and [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract).

---

## Current state (v86a)

What works today:

- Six built-in themes selectable via top bar dropdown
- Glitter and reduce-motion toggles in top bar
- Three-tier token model (primitives / semantics / components) with tier-walk governance
- 40 canonical token paths active across all six themes
- 12 planned token paths declared but not yet promoted
- Theme target registry with 8 active + 6 planned UI surfaces
- Override storage foundation (v34a) — global-scope only, validates canonical paths
- One narrow theme mapping edit control (v34b) — `panel.background` on `mission-control.panel`
- Override export (v34c1) — bundle export for validated global theme overrides

For the runtime engine, see [Theme Engine](theme.engine). For preset structure, see [Theme Preset Model](theme.preset.model).

---

## Near-term planned features

Features that are next in line, gated by their own contracts:

- **Override import / apply (v34c2)** — Inverse of v34c1's export. Lets users import a previously-exported override bundle. Defers schema validation rules to the export contract.
- **Theme target scope override (v34b+ continuation)** — Currently overrides are global-scope only. Per-target overrides (e.g. only override `panel.background` on `mission-control.panel`, not on every panel) are the next scope tier.
- **Visual handle scope override (v34c+)** — Even narrower scope: override only on surfaces using a specific visual handle (e.g. `lw-card`).
- **Generated theme mapping controls** — Currently the Theme Mapping Panel renders disabled/read-only control rows for registered targets. Enabling actual editing on more controls beyond the v34b narrow control.
- **Per-theme primitive tuning for the other 5 themes (v87)** — Solar Plasma is fully tuned at v86a. Obsidian Aurora, Midnight Loom, Void Circuit, Agartha Dream, Agartha Dusk currently have neutral defaults at the primitive layer. v87 work fills in theme-specific values.

---

## Mid-term planned features

Customization beyond simple per-token overrides:

- **Custom theme save** — User adjusts overrides, saves the result as a named custom preset. Custom presets live alongside built-in presets in the dropdown.
- **Custom theme rename / delete** — Standard CRUD on user-saved presets.
- **Custom preset import / export** — Distinct from override bundle import/export. This is a full preset (token values + metadata).
- **Pop-out color picker** — UI for editing color values (HSV, alpha, swatches). Replaces simple text input or token-path-only editing in the current Theme Mapping Panel.
- **Animated theme preview** — Hover a preset in the dropdown, see live preview of selection without committing.

These features depend on prerequisite contracts being satisfied. None of them ship before the Theme Mapping Panel Entry Contract requirements are met for the surfaces they affect.

---

## Long-term / v88+ features

Customization that requires external infrastructure:

- **User-generated theme submissions** — Workshop UI for sharing custom themes. Requires the Lattica security packet (sandbox, signature, provenance, submission filter, threat model) and is deferred until v88+.
- **Asset bank population** — The asset bank contract is live in v86a but the bank is empty. Populating with textures, shaders, animations is a separate workstream tied to workshop work.
- **Multi-renderer theme coordination** — When 3D and SVG renderers exist alongside the current 2D Sigma renderer, theme changes need to coordinate across all three. Per-renderer `liveUpdate` flags and a queue/cache pattern for non-active renderers are the architectural approach.

---

## Future menu sections (as features ship)

The eventual full theme customization UI will likely organize controls into these sections:

- Node colors
- Edge colors
- Node labels
- Edge labels
- Hover / selection
- Depth rings (graph intelligence work)
- Panels
- Background / starfield (backdrop tokens)
- Typography (typography tokens, v86e+)
- Motion (motion tokens, accessibility-aware)
- Presets
- Import / export

This list is illustrative — actual UI organization happens when each section's contracts are satisfied and the editing surface is ready.

---

## Customization rules

Whatever ships, the following always hold:

**Tokens first.** New visual capabilities are added at the canonical token path level first. Customization features cannot create new slots; they can only fill existing ones.

**Tier governance preserved.** Every customization mechanism must resolve through the three-tier model. Inline raw values (hex codes, sizes) in Tier 2 or 3 declarations are forbidden. Overrides on a Tier 2 path resolve through to a Tier 1 primitive.

**No behavior in themes.** Theme entries can change presentation. They cannot change behavior, run scripts, fetch remote resources, modify data, or alter evidence truth. See [Theme Token Compatibility](theme.token.compatibility) for the full forbidden list.

**No bypass of canonical paths.** Asset bank entries, grammar lens edits, override storage — none of these can write arbitrary CSS variables or bypass canonical resolution. Every visual change flows through canonical paths.

**Customization changes presentation, not evidence truth.** Mission Control results, QA evidence, contract truth remain constant across theme changes. Only rendered pixels differ.

---

## Forbidden until explicit contract

The following remain off-limits and require dedicated contract work before any implementation:

- Direct CSS variable mutation outside the override storage layer
- Component-local style hacks or inline style overrides
- Graph/Sigma renderer behavior modification
- Audio input/playback from theme entries
- Music reactivity runtime modification
- Theme-defined command execution
- Storage/persistence behavior outside the override storage contract
- Remote URL loading from theme bundles
- Arbitrary JavaScript evaluation from user-submitted content (Lattica sandbox territory)

---

## What this doc does not cover

- Override storage mechanics, scopes, and validation — see [Theme Override Storage Contract](theme.override.storage.contract)
- Theme Mapping Panel entry rules — see [Theme Mapping Panel Entry Contract](theme.mapping.panel.entry.contract)
- Asset bank schema (forward-compat empty bank) — see asset bank docs (pending)
- Workshop / Lattica architecture — archived to operator's machine until v88+
- Per-theme primitive value tuning (v87 work) — pending dedicated v87 sub-arc

---

*Replaces v15-era `09_THEME_CUSTOMIZATION_PATH.md` and `13_THEME_CUSTOMIZATION_SCAFFOLDING_PLAN.md`. Both source docs were ~700-byte stubs covering near-identical content. This roadmap merges them and refreshes for v86a state plus visible long-term features.*
