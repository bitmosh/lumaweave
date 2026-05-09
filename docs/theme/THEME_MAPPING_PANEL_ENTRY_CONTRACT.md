---
id: theme.mapping.panel.entry.contract
title: Theme Mapping Panel Entry Contract
type: contract
status: current
version: v86a
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-09
references:
  - theme.system.overview
  - theme.target.registry
  - theme.token.path.map
  - theme.override.storage.contract
  - theme.token.compatibility
  - link.network.overview
tags:
  - theme
  - mapping
  - panel
  - entry
  - contract
  - v28
  - v34b
  - v86a
---

# Theme Mapping Panel Entry Contract

*Originally drafted v28 Planning. Updated through: v31 token path citations, v32 generated read-only controls, v33 theme override storage contract, v34a global-only storage implementation, v34b narrow theme mapping edit control, v86a registry contract pattern expansion.*

## Purpose

Theme Mapping Panel v0 will eventually expose editable theme controls for qualified UI surfaces. This document captures the contract that gates each surface before any runtime editing UI or storage work begins. It stitches together the accepted inspector stack (UI Inspector toggle, metadata panel, ghost overlay, ThemeTargetRegistry, runtime probe, warning badges, token governance, visual handles, and canonical `ThemeTokenPath` vocabulary) so future editing passes do not re-litigate requirements.

This contract is planning-only. No runtime Theme Mapping Panel exists yet. All rules below are enforced through documentation, QA/advisory identity, and Playwright/QA evidence once implemented. v29 lock/pin behavior simply stabilizes which inspector target you are reviewing; it does **not** enable editing or storage and exists purely as the bridge into this entry contract.

## v31 Note

As of v31, visual handles in the Visual Handle Library cite canonical token paths from [Theme Token Path Map](theme.token.path.map). This prevents drift between visual handles, Theme Target Registry token bindings, and canonical tokens before generated Theme Mapping controls are implemented.

## v32 Note

As of v32, the Theme Mapping Panel generates read-only/disabled control rows for registered pinned targets, displaying canonical token paths and visual handle relationships. This makes the panel feel like it is showing the future editing surface, but nothing is editable yet. Storage and editing remain locked until v33–v34.

## v33 Note

As of v33, the [Theme Override / Storage Contract](theme.override.storage.contract) defines semantics for future theme override storage implementation. v33 is contract-only with no storage implementation. v34 may implement storage only after this contract is accepted.

## v34a Note

As of v34a, global-only theme override storage foundation has been implemented. Storage validates canonical token paths, rejects planned/noncanonical strings, supports reset/remove behavior, and persists via localStorage. Theme Mapping Panel controls remain disabled; v34b will enable editing UI.

## v34b Note

As of v34b, one narrow theme mapping edit control has been enabled for `panel.background` on `mission-control.panel`. The control is wired to v34a global override storage, supports reset/remove, and persists via localStorage. All other controls remain disabled.

## v86a Status Note

As of v86a, the registry contract pattern that this entry contract depends on has expanded with two new forward-compat registries:

- **Asset Registry** (`src/themes/assetRegistry.ts`) — Empty bank, contract live. Provides validated visual assets (textures, shaders, animations) bound to canonical token slots. Used by theme presets via the `assetRefs` field. Populated in v88+ workshop work.
- **Inspector Spoke Registry** (`src/themes/inspectorSpokeRegistry.ts`) — Empty registry, contract only. Will hold radial inspector spoke definitions (Geometry, Type, Motion, Layout). Populated in v86d / v89.

Neither registry changes the entry contract requirements. Both follow the standard registry contract pattern from v86a (singleton with `list / getById / filterByCategory / validateShape / register` methods).

The four-layer link network (Handle Registry → Control Surface Contract Registry → Graph Visual Theme Mapping Registry → Graph View Element Registry) provides the architectural context for how Theme Targets connect to user-facing controls. A Theme Target's eligibility for editing depends both on this entry contract AND on its participation in the Layer 2 control surface contract.

The three-tier token model (primitives / semantics / components) sits underneath all token bindings — every canonical `ThemeTokenPath` referenced in this contract resolves through the tier chain at runtime. See [Theme Token Compatibility](theme.token.compatibility) for tier governance rules.

For the link network architecture, see [Link Network Overview](link.network.overview).

## 1. Entry Requirements for Editable Surfaces

A DOM surface may enter the future Theme Mapping Panel only if **all** of the following are true:

1. **themeTargetId** – The surface is registered in `ThemeTargetRegistry` with a stable `themeTargetId`.
2. **Registry contract** – The registry entry includes canonical `tokenBindings`, `visualHandle`, and `surface` metadata.
3. **DOM marker** – The live DOM node carries `data-lw-theme-target="<themeTargetId>"` and appears in existing Playwright witnesses.
4. **Inspector fidelity** – UI Inspector metadata tooltip displays its registry metadata and ghost overlay outlines it when enabled.
5. **Runtime probe** – The registered surface shows up in probe/ghost overlays as "registered" (never in candidates/unknown).
6. **Warning badges** – No active warning badge for that surface; badges only highlight *unregistered* candidates.
7. **Token governance** – All `tokenBindings` use canonical `ThemeTokenPath` entries (no planned-only placeholders) per the accepted governance pass.
8. **QA evidence** – A QA checklist/advisory item cites the surface as ready for mapping and references Playwright/Debug evidence.

Surfaces missing any of these remain read-only and continue to rely on inspector/debug tooling only.

## 2. Registered Surface Path

```
ThemeTargetRegistry entry (themeTargetId + tokenBindings)
→ DOM node annotated with data-lw-theme-target
→ UI Inspector metadata + ghost outline evidence
→ Runtime probe marks as registered (never candidate)
→ Manual QA confirms warning badges are absent
→ Future Theme Mapping Panel generates read-only controls bound to canonical tokenBindings
```

Key rules:

- Generated controls inherit the registry's `tokenBindings` — no ad-hoc tokens.
- Entry contract does **not** grant mutation. Controls remain read-only until storage work lands.
- QA must cite `themeTargetId`, `visualHandle`, and the canonical token paths when referencing a ready surface.

## 3. Candidate Surface Path (Warning Badges)

```
runtime probe candidate (>=3 signals, no themeTargetId)
→ warning badge visible while UI Inspector is ON
→ manual/design review of candidate descriptor + signals
→ ThemeTargetRegistry proposal filed (docs + backlog)
→ QA/advisory approval for registry change
→ surface promoted to registered path above
→ only then can Theme Mapping controls be generated
```

Important:

- Warning badges **never** auto-generate mapping controls.
- Candidate review must reference badge descriptor + signals and decide whether to add a registry entry or ignore the candidate.
- Playwright evidence must prove candidates stay badge-only until promoted.

## 4. Unknown Path

```
runtime probe unknown (<3 signals)
→ zero warning badges (diagnostic only)
→ QA Debug / Playwright logging optional
→ no ThemeTargetRegistry promotion until signals improve
→ no mapping UI, no read-only controls
```

Unknown entries ensure borderline elements remain invisible to operators. They can inform documentation or future heuristic tweaks but do not produce badges or controls.

## 5. Component Role Path

Component roles cover reusable widgets (buttons, tabs, sliders, dropdowns, badges, panels headings, status chips, etc.). Their flow is:

```
componentRoleId / visualHandle defined in docs
→ shared styling tokens (e.g., button.primary → accent.primary)
→ referenced by multiple DOM instances via className/handleId
→ future Theme Mapping Panel may expose role-level controls (not surface-specific)
```

Rules:

- Component roles stay separate from ThemeTargetRegistry entries. They **do not** get `data-lw-theme-target`.
- Roles only become editable once a dedicated component-role contract exists (post v28 planning) and QA proves role-wide controls behave.
- Nested buttons/sliders remain read-only under parent surfaces until role editing unlocks.

## 6. Text Role Path

```
text role (text.primary, text.muted, label.text, value.text, heading.text, description.text)
→ referenced directly in component/token definitions
→ static copy inherits these tokens automatically
→ no per-string themeTargetId or unique token paths
→ Theme Mapping Panel may expose role-level toggles once text-role policy exists
```

Rules:

- Do not register individual text spans or labels as theme targets.
- Any future editable control for text must operate on the *role* (e.g., all `label.text`), not a specific string.

## 7. Graph / Sigma Path

Sigma-rendered primitives remain outside DOM Theme Mapping scope:

```
Graph View Element Registry + Graph Visual Policy
→ tokens for graph.node.*, graph.edge.*, graph.label.*
→ Sigma renderer applies tokens directly
→ DOM inspector tooling never touches Sigma primitives
```

Rules:

- No `data-lw-theme-target` on Sigma elements.
- Theme Mapping Panel must not expose DOM controls for Sigma primitives until the Graph Visual Policy exposes its own editor.
- DOM graph HUDs (panels overlaying the graph) follow the registered-surface path, but WebGL/Canvas internals stay separate.

## 8. Storage Block

Theme Mapping Panel Entry Contract does **not** unlock persistence:

- No theme override storage.
- No preset save/import/export.
- No schema mutations to `settings` or `themeSelector` state.
- No localStorage writes beyond existing QA/debug data.

Future dependencies before storage:

1. Theme override data model (file + runtime contract).
2. Save preset UX, reset/revert semantics, and evidence.
3. QA/Playwright coverage proving mutations persist and roll back safely.

Until those ship, any generated controls must be read-only previews of canonical token bindings.

## 9. QA Evidence Requirements (Future Runtime Pass)

When Theme Mapping Panel v0 ships, QA must prove:

1. Only registered surfaces (per Section 2) receive editable controls.
2. Warning badge candidates do **not** generate controls until promoted.
3. Unknown entries never produce controls.
4. Component roles remain role-level, not auto-promoted to surface controls.
5. Token bindings for every control reference canonical `ThemeTokenPath` entries.
6. Controls default to read-only / disabled state until storage dependencies land.
7. Graph/Sigma primitives stay excluded from DOM mapping.
8. Typecheck + Playwright suites pass with zero skipped tests.
9. QA report references this contract and includes evidence for each path above.

## 10. Non-Goals / Explicit Exclusions

- No runtime Theme Mapping Panel UI.
- No color pickers, sliders, or overrides beyond existing inspector/debug features.
- No lock/pin behavior (remains part of inspector hardening backlog).
- No changes to ThemeTargetRegistry entries or warning badge heuristics.
- No new hotkeys or Command Deck registry work.
- No graph renderer (Sigma) modifications.

## References

- [Theme Target Registry](theme.target.registry)
- [Theme Override Storage Contract](theme.override.storage.contract)
- [Theme Token Path Map](theme.token.path.map)
- [Theme Token Compatibility](theme.token.compatibility)
- [Theme System Overview](theme.system.overview)
- UI Surface and Handle Inventory — pending consolidation
- Backlog Policy — `docs/roadmap/BACKLOG_POLICY.md`
- `tests/e2e/theme-target-inspector.spec.ts`
- `tests/e2e/contract-registry.spec.ts`

---

*v28 entry contract preserved with full v31, v32, v33, v34a, v34b history. v86a status note added at top of version chain. Path references updated from `docs/theme-system/` to current `docs/theme/`. All entry rules unchanged.*
