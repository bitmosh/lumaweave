# UI Surface & Handle Inventory (v23 Planning)

## Purpose
Establish a single additive reference for every front-facing UI surface that may eventually become theme-editable, inspected via the UI Inspector, or exposed through the future Theme Mapping Panel. This inventory keeps DOM/UI concerns separate from graph-rendered elements and prevents accidental drift between ThemeTargetRegistry, visual handles, QA evidence, and Playwright selectors.

## Source-of-Truth Relationships
- **ThemeTargetRegistry** (`src/themes/themeTargetRegistry.ts`) — authoritative list of themeTargetId values, surfaces, and canonical ThemeTokenPath bindings.
- **Visual Handle Library** (`src/styles/lumaweave-visual-handles.css`) — reusable CSS classes (`lw-panel`, `lw-card`, etc.) that define styling scaffolds for DOM surfaces.
- **DOM Markers** (`data-lw-theme-target`, `data-testid`) — runtime attributes the UI Inspector and Playwright suites rely on.
- **QA / Advisory Registry** — backlog questions enforce correct registration policy (e.g., `require-data-lw-theme-target`).
- **Playwright Witnesses** (`tests/e2e/theme-target-inspector.spec.ts`, `tests/e2e/contract-registry.spec.ts`) — confirm required markers and surface visibility.

## Classification Overview
| Category | Current Surfaces (themeTargetId) | Visual Handle(s) | `data-lw-theme-target` / `data-testid` | Interaction Level | Notes |
| --- | --- | --- | --- | --- | --- |
| **Shell** | `app.shell` | `.lw-ambient-shell` (scaffold) | Required; Playwright checks presence | Visual-only | Wraps entire app background and glow.
| **Topbar** | `topbar.root` | (custom flex layout today) | Required | Interactive (global menus) | Houses theme selector + mission controls.
| **Panel** | `mission-control.panel`, `settings.panel` | `.lw-panel` | Required; `data-testid="qa-panel"` etc. | Interactive (tabs, forms) | Mission Control + Settings use same visual handle.
| **Card** | `mission-control.question-card`, `mission-control.proposal-card`, `mission-control.backlog-card` | `.lw-card` | Required; `data-testid` per card | Interactive (expand/collapse, reorder) | Cards inherit panel tokens; future per-card tokens planned.
| **Button** | Mission Control UI Inspector toggle (QA Debug) | `.lw-button` | `data-testid="theme-inspector-toggle-button"` + state chip | Interactive | Shares state with Alt+Shift+I hotkey; still outside ThemeTargetRegistry until controls become theme-editable.
| **Slider / Control** | Settings sliders, Mission Control toggles | `.lw-control-grid` (layout), future handle IDs | Use `data-testid` (e.g., `hover-node-color-slider`) | Interactive, writes settings state | Remain outside ThemeTargetRegistry until override storage exists.
| **Dropdown** | Theme selector, QA key selector | Native `<select>` + `data-testid` | `data-lw-theme-target` inherited from parent panel | Interactive | Documented as control surfaces, not independent theme targets yet.
| **Badge** | Status badges in QA panel | `.lw-badge` | `data-testid` on containing card | Visual-only | Colors derive from accent token fallbacks.
| **Tab / Debug Surface** | QA tabs, Debug tab surfaces | `.lw-panel` container + tab buttons | `data-testid="qa-tab-*"` | Interactive navigation | Tab chrome follows panel tokens; per-tab theme targets deferred.
| **Inspector Surface** | Theme Target Inspector overlay HUD | (non-interactive overlay) | `data-testid="theme-target-inspector-panel"`; no `data-lw-*` (overlay is meta) | Visual-only | Overlay must remain pointer-events none.
| **Settings / Control Surface** | `settings.panel` plus nested controls | `.lw-panel` | Required | Interactive, persists settings | Additional control-specific registration deferred until override storage exists.
| **Graph-Adjacent HUD** | Graph viewport frame overlays, future graph HUD bits | `graph.frame` (DOM) | Required | Visual-only today | Distinct from Sigma internals; see Graph View doc.

## Current Known Elements
- **Active theme targets** with DOM markers: `app.shell`, `topbar.root`, `mission-control.panel`, `mission-control.question-card`, `mission-control.proposal-card`, `mission-control.backlog-card`, `settings.panel`, `graph.frame`.
- **Visual handles in use**: `.lw-panel`, `.lw-card`, `.lw-badge`, `.lw-button` (Mission Control toggle). `.lw-control-grid`, `.lw-node-glow`, `.lw-edge-glow` exist but are not fully registered.
- **QA witnesses**: `tests/e2e/theme-target-inspector.spec.ts` asserts shell/topbar/panel/card/settings/graph markers; `tests/e2e/contract-registry.spec.ts` asserts QA panel/advisory surfaces.

### v24a UI Inspector Granularity Finding
- Manual QA confirmed the Mission Control toggle + graph-viewport placement work, but hovering nested controls (buttons, tabs, sliders, dropdowns, labels, status chips, debug rows) still reports their parent surface (e.g., `mission-control.panel`).
- This is **expected** under the current registry because only major surfaces are registered; we must not sprinkle `data-lw-theme-target` on every nested element to paper over the gap.
- Before v25 ghost overlays or registered/unregistered warnings, we need a formal **UI Part / Component Role Registration Model** that spells out which layer owns identifiers, tokens, QA evidence, and handles text roles vs. reusable controls.

## UI Part / Component Role Registration Model (v24a)

| Precision Layer | Examples | Identifiers / Fields | Notes |
| --- | --- | --- | --- |
| **Major surfacing target** | `app.shell`, `mission-control.panel`, `settings.panel`, `graph.frame` | `themeTargetId`, `data-lw-theme-target`, `visualHandle`, canonical `tokenBindings` | Already covered by ThemeTargetRegistry; continue to prove via UI Inspector.
| **UI component role** | `button.primary`, `tab.active`, `badge.success`, `slider.thumb`, `dropdown.root`, `panel.heading` | `visualHandle`, planned `componentRoleId`, shared `tokenBindings` template | Represents reusable building blocks, not unique DOM nodes. Lives in docs until Theme Mapping unlocks them.
| **Specific control instance** | `qa.debug.ui-inspector-toggle`, `settings.physics.node-size-slider`, `qa.tabs.debug` | `handleId`, `settingsKey`, `data-testid` | Only documented as part of QA/UX state; should not automatically gain a `themeTargetId`.
| **Text role** | `text.primary`, `text.muted`, `label.text`, `value.text`, `heading.text` | Token references (e.g., `text.primary`) | Static strings should inherit these roles; no per-string IDs.
| **Graph HUD panel** | Graph Inspector tabs, future zoom HUD | `themeTargetId` (if DOM), QA doc references | DOM HUD surfaces stay in this inventory; still separate from Sigma.
| **Sigma element** | `graph.node.default`, `graph.edge.selected`, `graph.node.label` | Graph View Element Registry, Graph Visual Policy tokens | Never receives `data-lw-theme-target`. Registered via graph-centric docs/policies.

### Handling Nested Controls Until Theme Mapping
- Buttons, tabs, dropdowns, etc. remain discoverable at the **component role** layer, not by attaching unique `data-lw-*` markers per instance.
- When Theme Mapping Panel work begins, these roles will inform generated controls and token bindings; for now, document them with `visualHandle` + `data-testid` references so QA can trace behavior without runtime churn.
- Static text/labels should map back to **text roles** rather than spawning new surfaces.
- Graph HUD vs. Sigma distinction must stay explicit so DOM overlays (ghost outline, inspector panel) never mutate renderer primitives.

## Planned / Future Elements
- **Theme Mapping Panel (`theme-mapping.panel`)** — planned Mission Control surface that will host editable controls.
- **Theme Mapping Control (`theme-mapping.control`)** — generated controls (sliders/dropdowns) per editable property.
- **Button/Slider/Dropdown handles** — will gain dedicated themeTargetId entries once override storage + Theme Mapping Panel ship.
- **UI badges, tabs, toggle buttons** — remain visual-only until Theme Mapping Panel defines editing scope.

## Registration Requirements
1. **Classification before creation** — assign category (shell, panel, card, control, etc.) and document in this inventory.
2. **ThemeTargetRegistry entry** — required before adding new `data-lw-theme-target` markers.
3. **Visual handle binding** — prefer existing `.lw-*` handles; add new handles only when shared styling is needed.
4. **DOM markers** — `data-lw-theme-target` mandatory for inspectable surfaces; `data-testid` mandatory for Playwright coverage.
5. **QA evidence** — extend QA checklists or advisory backlog only when new surfaces add risk.
6. **Settings/Handle IDs** — controls that persist state must declare `settingsKey` or `handleId` in documentation before runtime work.

## Additive Checklist for New UI Surfaces
1. Document intent + category in this file.
2. Add planned entry to ThemeTargetRegistry (status `planned`).
3. Define/choose visual handle class.
4. Add design note for `data-lw-theme-target`, `data-testid`, and (if interactive) settings binding.
5. Capture QA/advisory backlog impact (e.g., new validation or Playwright witness) without removing existing items.
6. Once runtime work is approved, promote ThemeTargetRegistry entry to `active` and add DOM markers.

## Validation Expectations
- `npm run typecheck` + `npm run qa:e2e` remain baseline for any future runtime changes.
- Theme Target Inspector Playwright spec must show new markers before shipping.
- QA checklist items (v22+) enforce canonical token usage and require diff review to ensure UI surfaces were not altered unexpectedly.

## Forbidden Assumptions
- Do **not** assume every DOM element should become editable; visual-only handles remain valid.
- Do **not** add `data-lw-theme-target` to Sigma-rendered nodes/edges (belongs in Graph View registry).
- Do **not** collapse multiple surfaces under one themeTargetId just to reduce documentation; each front-facing surface needs explicit intent.
- Do **not** remove existing markers without updating QA evidence.

## Risk Tiers
| Tier | Description | Examples | Handling |
| --- | --- | --- | --- |
| **Low** | Visual-only scaffolds, no settings writes | `.lw-badge`, `.lw-divider` | Document + keep pointer-events none if overlay.
| **Medium** | Interactive UI that reads/writes state but not user-authored themes | QA tabs, Mission Control cards | Requires settings/QA linkage and inspector proof.
| **High** | Surfaces that will expose Theme Mapping Panel editing or save presets | Future `theme-mapping.*`, override controls | Requires governance gates + additional validation.

## Future Implementation Phases
1. **v23 planning (this doc)** — classify and document surfaces.
2. **v24 overlay hardening** — implement Mission Control toggle, ghost layer, heuristics, lock/pin (backlog item #1).
3. **Theme Mapping Panel v0** — register editing surfaces + controls using this inventory as contract.
4. **Override storage + save preset** — align controls with persistence before enabling user-authored themes.
5. **Visual handles cite token paths** — extend this file once visual handles encode canonical token references.
