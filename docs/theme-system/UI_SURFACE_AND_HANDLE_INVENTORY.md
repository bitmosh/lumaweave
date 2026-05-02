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
- v25 introduces the first ghost overlay pass: registered surfaces now receive a pointer-events:none outline whenever the UI Inspector is ON. This layer must consume the table below so only major surfaces (and future HUD containers) are highlighted.

## UI Part / Component Role Registration Model (v24a)

| Precision Layer | Examples | Identifiers / Fields | Notes |
| --- | --- | --- | --- |
| **Major surfacing target** | `app.shell`, `mission-control.panel`, `settings.panel`, `graph.frame` | `themeTargetId`, `data-lw-theme-target`, `visualHandle`, canonical `tokenBindings` | Already covered by ThemeTargetRegistry; continue to prove via UI Inspector.
| **UI component role** | `button.primary`, `tab.active`, `badge.success`, `slider.thumb`, `dropdown.root`, `panel.heading` | `visualHandle`, planned `componentRoleId`, shared `tokenBindings` template | Represents reusable building blocks, not unique DOM nodes. Lives in docs until Theme Mapping unlocks them.
| **Specific control instance** | `qa.debug.ui-inspector-toggle`, `settings.physics.node-size-slider`, `qa.tabs.debug` | `handleId`, `settingsKey`, `data-testid` | Only documented as part of QA/UX state; should not automatically gain a `themeTargetId`.
| **Text role** | `text.primary`, `text.muted`, `label.text`, `value.text`, `heading.text` | Token references (e.g., `text.primary`) | Static strings should inherit these roles; no per-string IDs.
| **Graph HUD panel** | Graph Inspector tabs, future zoom HUD | `themeTargetId` (if DOM), QA doc references | DOM HUD surfaces stay in this inventory; still separate from Sigma.
| **Sigma element** | `graph.node.default`, `graph.edge.selected`, `graph.node.label` | Graph View Element Registry, Graph Visual Policy tokens | Never receives `data-lw-theme-target`. Registered via graph-centric docs/policies.

### Registration Decision Matrix (v24b hardening)

| Element Example | Classification | themeTargetId | componentRoleId / visualHandle | `data-lw-theme-target` | `data-testid` | handleId / settingsKey | Token Binding Source | QA Evidence Hook | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mission-control.panel` (panel container) | Major surface target | ✅ (`mission-control.panel`) | `.lw-panel` | ✅ | Optional | n/a | ThemeTargetRegistry tokenBindings | UI Inspector + Playwright panel presence | Primary inspectable surface; safe to outline in v25.
| Primary button (e.g., QA action button) | UI component role | ❌ | `button.primary` role + `.lw-button` | ❌ | Optional | n/a | Component role maps to `accent.primary`, `text.primary` tokens | Style guide + future Theme Mapping, not UI Inspector | Shared role; multiple instances reuse same role ID.
| Mission Control Debug UI Inspector toggle | Specific control instance + component role | ❌ | `button.primary` role + `.lw-button` | ❌ | `theme-inspector-toggle-button` | `qa.debug.ui-inspector-toggle` handleId | Inherits component role tokens; no custom binding | QA Debug tab & Playwright toggle tests | Concrete control tracked by handleId + data-testid only.
| QA tab button (`qa.tabs.debug`) | Specific control instance (tab role) | ❌ | `tab.active` / `tab.inactive` roles | ❌ | `qa-tab-debug` | `qa.tabs.debug` | Text role + component role tokens | Playwright tab switching | Instances stay bound to roles; no new ThemeTarget entries.
| Badge/status chip (e.g., checklist decision badge) | UI component role | ❌ | `badge.success` / `.lw-badge` | ❌ | Optional | n/a | Token role referencing `text.success`, `border.success` | Visual regression + QA acceptance text | Remains role-based until Theme Mapping Panel.
| Slider control (settings.physics.node-size-slider) | Specific control instance + component role | ❌ | `slider.track` / `slider.thumb` roles | ❌ | `settings-node-size-slider` | `settings.physics.node-size-slider` | Component role tied to `control.track`, `control.thumb` tokens | Settings Playwright coverage (future) | Only documented via handleId + role mapping.
| Dropdown (settings.labels.node-label-mode-dropdown) | Specific control instance | ❌ | `dropdown.root` role | ❌ | `settings-label-mode-dropdown` | `settings.labels.node-label-mode-dropdown` | Role references `panel.background`, `text.primary` tokens | Settings Playwright + QA evidence | Instances reuse same role template.
| Tab heading / panel heading text | Text role | ❌ | `panel.heading` text role | ❌ | Optional | n/a | `heading.text` token | Documentation + Storybook (future) | Static text inherits tokens, never new IDs.
| Static label or value text | Text role | ❌ | `label.text` / `value.text` | ❌ | Optional | n/a | `text.muted`, `text.primary` tokens | QA screenshots/logs | No per-string registrations.
| Settings value row (label + control) | Major surface + component role mix | Maybe (panel container) | `form.row` role for nested layout | Major row inherits parent panel target | Test IDs for controls | `settings.*` handleIds as needed | Panel tokens + component-role tokens | Settings QA evidence | Outline only the parent panel; rows stay role-based.
| Graph Inspector panel (Mission Control cards showing graph data) | Major surface target | ✅ (`mission-control.panel` variants) | `.lw-card` | ✅ (card-level) | `graph-inspector-card-*` optional | n/a | Panel/card token bindings | UI Inspector + Playwright graph tests | Treated as DOM surface, separate from Sigma.
| UI Inspector panel / HUD | Inspector overlay surface (meta) | ❌ (overlay meta) | Custom overlay styling (pointer-events none) | ❌ (HUD uses `data-testid` only) | `theme-target-inspector-panel` & tooltip TIDs | `ui.inspector.panel` handle (doc only) | Hard-coded overlay theme tokens | Overlay Playwright spec | Remains meta HUD; ghost overlay uses this as anchor.
| Graph HUD / debug panel (future) | DOM HUD surface | ✅ once HUD exists | `.lw-graph-hud` planned | ✅ (HUD container) | HUD-specific `data-testid` | `graph.hud.*` handles | HUD tokens referencing graph palette | HUD Playwright tests | Still DOM; never touches Sigma primitives.
| Graph Sigma element (`graph.node.selected`) | Sigma element | ❌ | Graph View registry entry | ❌ | n/a | Policy identifiers | `graph.node.*` tokens via policies | Graph Visual Policy fixtures | Lives entirely in Graph View Element Registry.

### Explicit Rules (v24b)
1. **Major surfaces get `themeTargetId`** — only DOM containers listed in ThemeTargetRegistry should expose `data-lw-theme-target` and appear in UI Inspector.
2. **Component styles get `componentRoleId` / visual handles** — buttons, tabs, badges, sliders, dropdowns, panel headings, status chips, and debug rows share role IDs and `.lw-*` handles instead of new ThemeTargetIds.
3. **Specific controls use handleId / settingsKey / `data-testid`** — concrete toggles, sliders, dropdowns, QA tabs, and mission-control actions reference handle IDs for QA + settings persistence but remain role-based for styling.
4. **Static text sticks to text roles** — headings, labels, value text, descriptions, and status copy must map to canonical token paths (e.g., `text.primary`, `text.muted`). No per-string registrations.
5. **`data-lw-theme-target` is reserved for inspectable surfaces** — never apply it to nested buttons, spans, or rows just to satisfy UI Inspector. Instead, register the parent surface and document the component roles.
6. **Nested controls must not be registered ad hoc** — future ghost overlays should outline registered surfaces only, not every nested element lacking a theme target.
7. **Graph/Sigma elements stay in their own registry** — Sigma primitives continue to use the Graph View Element Registration Model + Graph Visual Policy tokens, never DOM markers.
8. **Ghost overlay + registered/unregistered warnings must consult this model** — only major surfaces (and any future HUD containers) should be outlined; warnings must ignore expected unregistered nested elements.
9. **Theme Mapping Panel will rely on componentRoleId + handleId** — when editable controls arrive, generated UI should reference these roles instead of inventing new theme targets per control.

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
