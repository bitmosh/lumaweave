---
id: settings.panel.contract
title: Settings Panel Contract
type: contract
status: draft
domain: control-plane
subdomain: settings
cluster: violet
agent_readable: true
include_in_self_graph: true
last_updated: 2026-05-25
references:
  - protocol.registry.contract.patterns
  - theme.system.overview
  - tile.section.registry
tags:
  - contract
  - settings
  - panel
  - cmd-comma
  - localStorage
---

# Settings Panel Contract

> **Status:** Draft v2 — not yet accepted. Implementation may not begin until this contract is accepted by Ryan via `#approve-this`.
>
> **Predecessor:** The legacy inline `SettingsPanel.tsx` (3-category, lives at `src/control-plane/settings/SettingsPanel.tsx`) is currently unmounted (since v86a removed the Settings left-panel tab) and will be overwritten by this pass.

---

## Purpose

The Settings Panel is the central authoring surface for user-modifiable LumaWeave settings. It is a floating tile that renders categorized settings controls, supports search, persists its own geometry, and opens via the `Cmd+,` / `Ctrl+,` hotkey from the topbar's gear button.

This pass establishes the Settings Panel as a *floating system surface* separate from the tile section system. Tiles registered in `tileSectionRegistry` continue to behave as they do today (tear-off from the right-side control dock); the Settings Panel is a different surface accessed via hotkey.

---

## Architectural Model — Domain values, surface composition (Model B)

This contract follows **Model B** as the information architecture:

- **Domain categories own the values.** Theme settings live in Theme. Physics gravity lives in Graph. Font axes live in Typography. The Settings Panel renders the eight domain categories with their associated controls.
- **Surface composition is deferred.** A future "Tiles" category will own per-tile composition (dock location, content visibility checklists, display depth). That category lands in a later pass alongside the tile-system redo Ryan has scheduled (eliminating left and right side panels, tiles dock to edges with defined homes, dashed-border tear-off animation with amber-glow home spots).

**Bridge feature scaffolded in this pass (data shape only):** Each `SettingControl` gains an optional `tileVisibleByDefault` field, anticipating the future "Show in tile" toggle. This pass does not surface the toggle in the UI; it only locks down the data shape so the future Tiles category can read existing settings without a migration.

---

## Allowed Behavior

### Reading state

- May read all values from `useSettingsStore()` via the `settings` selector.
- May read tile context via `useTileContext()` (existing `TileContext`-based hook from `TileProvider`) only for the purpose of rendering tile-state indicators. Tile state itself lives at `settings.ui.tileLayout` and is owned by the tile system.
- May read the `settingsPanelCategoryRegistry` (introduced by this pass) to determine which categories exist.
- May read the `settingsRegistry` (existing) to determine which controls exist within a category.

### Writing state

- May write settings via `useSettingsStore.setState` calls **only** through the `setSetting(path, value)` action. No direct mutation of the settings object permitted.
- May write its own geometry to `localStorage` **only** at the key `lw.settings.panel.geometry.v1`. No other localStorage keys may be written from this component.

### Lifecycle

- May open in response to:
  - The `Cmd+,` (macOS) / `Ctrl+,` (Linux/Windows) hotkey, registered via direct `addEventListener` on `document` keydown (v97 will migrate to the hotkey registry; **not in scope for this pass**)
  - The topbar gear button's `onClick` (currently wired but no handler — this pass wires the handler)
- May close in response to:
  - The Escape key when the panel has focus
  - The close button in the panel chrome
  - `Cmd+,` / `Ctrl+,` again (toggle)

### Persistence

- Geometry persistence format (the **only** value written to the geometry localStorage key):
  ```typescript
  {
    left: number;
    top: number;
    width: number;
    height: number;
    minimized?: boolean;
    position?: 'floating' | 'docked-left' | 'docked-right';
  }
  ```
- Geometry is read on mount; defaults applied if absent or unparseable.
- Geometry is written on every drag end, resize end, dock change, and minimize toggle (debounced 150ms).

### Rendering

- Renders eight category sections in a sidebar nav, in the exact order defined in the registry below.
- Renders the active category's content in the main content area.
- Renders a search input that filters category match counts and individual control matches.
- Renders a status bar at the bottom with: current category, save state, and opacity slider.

---

## Forbidden Behavior

These are HARD rules. Any of these in the resulting code is grounds for rejecting the pass.

### Storage forbiddens

- ❌ Writing to **any** localStorage key other than `lw.settings.panel.geometry.v1`.
- ❌ Writing to sessionStorage at all.
- ❌ Reading or writing IndexedDB.
- ❌ Persisting settings values to localStorage from this component (the settings store owns its own persistence; the panel does not).

### Mutation forbiddens

- ❌ Direct mutation of `settings` object returned by `useSettingsStore()`.
- ❌ Calling `useSettingsStore.setState` directly with a state replacement. Use only the `setSetting(path, value)` action.
- ❌ Mutating `settingsRegistry` or `settingsPanelCategoryRegistry` at runtime. Both are `as const`-typed and read-only.
- ❌ Modifying or removing entries from `tileSectionRegistry`. The existing entries (`physics-section`, `appearance-section`, `labels-section`, `typography-playground-section`) MUST remain unchanged.

### Import forbiddens

The Settings Panel and its category content components may NOT import from:

- ❌ `src/graph/**` (panel reads settings, does not affect graph rendering)
- ❌ `src/audio/**` (settings authoring is orthogonal to audio runtime)
- ❌ `src/source-adapter/**` (data-sources category renders settings, not adapter internals)
- ❌ Any file with `*.test.ts`, `*.spec.ts`, or under `tests/` (no test imports in production)

The Settings Panel MAY import from:

- ✅ `src/control-plane/settings/**` (its own home)
- ✅ `src/control-plane/panels/**` (Tile system, CollapsiblePanel, CollapsibleSection, tile.types)
- ✅ `src/control-plane/topbar/**` (for the topbar gear button wiring)
- ✅ `src/themes/**` (for theme tokens used in chrome styling)
- ✅ `src/control-plane/contracts/**` (for control-surface contract references)
- ✅ `src/control-plane/commands/**` (for future migration to hotkey registry; not used in this pass but allowed)
- ✅ Standard React / Zustand / utility imports

### Style forbiddens

- ❌ Hardcoded color values (hex, `rgb(`, `rgba(`, `hsl(`) anywhere in JSX className or style. All colors via theme tokens.
- ❌ Inventing new theme token paths in this pass. If a needed color value has no existing token, leave it unstyled and flag in the pass completion report; do NOT create a new token entry.
- ❌ Inline `<style>` tags inside the component.
- ❌ Direct DOM manipulation (`document.querySelector`, etc.) outside the panel root element. Exception: `document.addEventListener('keydown', ...)` for the Cmd+, hotkey registration is permitted.

### Category content forbiddens

- ❌ Category content components creating their own settings store subscriptions outside the framework. Use only `useSettingsStore` hooks.
- ❌ Module-level side effects in category content files (no `console.log`, no DOM mutation, no fetch on import).
- ❌ Renaming any of the eight CategoryIds. The list is **frozen by this contract** at: `theme`, `typography`, `graph`, `inspector`, `data-sources`, `display`, `accessibility`, `advanced`.
- ❌ Adding a ninth category in this pass. A future "Tiles" category will land in a separate pass alongside the tile-system redo.
- ❌ Reordering categories arbitrarily. Order is **frozen by this contract** as defined in the registry below.

---

## Schema

### CategoryId enum (frozen)

```typescript
export type CategoryId =
  | 'theme'
  | 'typography'
  | 'graph'
  | 'inspector'
  | 'data-sources'
  | 'display'
  | 'accessibility'
  | 'advanced';
```

These eight values are the only valid CategoryIds for this pass. Adding, removing, renaming, or reordering requires a new contract. A future "Tiles" CategoryId will be added in the tile-redo pass with a separate contract.

### PanelPosition enum

```typescript
export type PanelPosition =
  | 'floating'
  | 'docked-left'
  | 'docked-right'
  | 'minimized';
```

### CategoryDef interface

```typescript
export interface CategoryDef {
  id: CategoryId;
  label: string;            // Display name, e.g. "Theme"
  description: string;      // One-sentence summary shown in content header
  iconPath: string;         // 16x16 SVG path data, no width/height/viewBox attributes
}
```

### Settings Panel Category Registry shape

```typescript
export const SETTINGS_PANEL_CATEGORIES: readonly CategoryDef[] = [
  { id: 'theme',         label: '...', description: '...', iconPath: '...' },
  { id: 'typography',    label: '...', description: '...', iconPath: '...' },
  { id: 'graph',         label: '...', description: '...', iconPath: '...' },
  { id: 'inspector',     label: '...', description: '...', iconPath: '...' },
  { id: 'data-sources',  label: '...', description: '...', iconPath: '...' },
  { id: 'display',       label: '...', description: '...', iconPath: '...' },
  { id: 'accessibility', label: '...', description: '...', iconPath: '...' },
  { id: 'advanced',      label: '...', description: '...', iconPath: '...' },
] as const;
```

The registry MUST have exactly 8 entries in this exact order. The validator enforces this.

### Geometry shape

```typescript
export interface SettingsPanelGeometry {
  left: number;
  top: number;
  width: number;
  height: number;
  minimized?: boolean;
  position?: PanelPosition;
}
```

### SettingsPanelProps interface

```typescript
export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;          // Defaults to 'Settings'
  subtitle?: string;       // Active category label
  initialRect?: SettingsPanelGeometry;
  onPositionChange?: (p: PanelPosition) => void;
  opacity: number;         // 0..1
  headerSlot?: React.ReactNode;   // Search bar
  sidebarSlot: React.ReactNode;   // Category nav
  contentSlot: React.ReactNode;   // Active category content
  statusBarSlot: React.ReactNode; // Bottom status row
}
```

### Settings registry type changes

The existing `SettingControl` discriminated union in `src/control-plane/settings/settings.registry.ts` has a `category: string` field. This pass narrows it to:

```typescript
export type SettingControl =
  | { /* boolean */ category: CategoryId; /* ...existing fields... */ }
  | { /* range */   category: CategoryId; /* ... */ }
  | { /* select */  category: CategoryId; /* ... */ }
  | { /* text */    category: CategoryId; /* ... */ };
```

ALL existing entries must have their `category` field updated to use the new typed values. Mapping from old to new:

| Old `category` string | New CategoryId | Reason |
|---|---|---|
| `"Physics"` | `'graph'` | Physics is a graph concern |
| `"Labels"` | `'graph'` | Labels are a graph concern |
| `"Graph View"` | `'graph'` | Graph view is a graph concern |

Any existing setting that doesn't fit `'graph'` requires explicit assignment during the pass. List all reassignments in the pass completion report.

### Forward-compat scaffold: `tileVisibleByDefault`

Each `SettingControl` variant gains an optional `tileVisibleByDefault?: boolean` field:

```typescript
type SettingControlBase = {
  category: CategoryId;
  tileVisibleByDefault?: boolean;  // NEW — scaffold for future Tiles category
  // ... existing fields ...
};
```

This pass does NOT render any UI for this field. It only adds the field to the type and accepts (but does not require) entries to populate it. The future Tiles category will read this field to seed the per-tile content checklist.

**Default behavior if undefined:** treated as `true` (visible in tile by default).

### localStorage key (frozen)

The exact string `lw.settings.panel.geometry.v1` is the **only** valid localStorage key for this component. Changing it requires a migration plan and a new contract.

---

## Naming Conventions (frozen)

### data-testid

The Settings Panel uses these `data-testid` patterns. All are lowercase, hyphen-separated, stable across refactors.

| Element | data-testid |
|---|---|
| Panel root element | `settings-panel-root` |
| Title bar | `settings-panel-titlebar` |
| Close button | `settings-panel-close` |
| Minimize button | `settings-panel-minimize` |
| Dock-left button | `settings-panel-dock-left` |
| Dock-right button | `settings-panel-dock-right` |
| Search input | `settings-panel-search` |
| Sidebar root | `settings-panel-sidebar` |
| Category nav item | `settings-category-nav-{id}` (where `{id}` is the CategoryId) |
| Content root | `settings-panel-content` |
| Status bar | `settings-panel-statusbar` |
| Opacity slider | `settings-panel-opacity` |
| Individual control | `setting-{path-with-dashes}` (existing pattern, e.g. `setting-appearance-glitter-enabled`) |
| Category content section | `settings-category-content-{id}` |

### File paths (frozen)

The accepting pass MUST place files at these exact paths:

| File | Path |
|---|---|
| Contract doc | `docs/control-plane/settings/SETTINGS_PANEL_CONTRACT.md` |
| Category registry | `src/control-plane/settings/settingsPanelCategoryRegistry.ts` |
| Category types | `src/control-plane/settings/settingsPanel.types.ts` |
| Validator | `scripts/validate-settings-panel.mjs` |
| Panel shell | `src/control-plane/settings/SettingsPanel.tsx` (replaces legacy) |
| Panel host | `src/control-plane/settings/SettingsPanelHost.tsx` |
| Sidebar | `src/control-plane/settings/SettingsSidebar.tsx` |
| Content shell | `src/control-plane/settings/SettingsContent.tsx` |
| Status bar | `src/control-plane/settings/SettingsStatusBar.tsx` |
| Search bar | `src/control-plane/settings/SettingsSearchBar.tsx` |
| Theme category | `src/control-plane/settings/categories/CategoryTheme.tsx` |
| Typography category | `src/control-plane/settings/categories/CategoryTypography.tsx` |
| Graph category | `src/control-plane/settings/categories/CategoryGraph.tsx` |
| Inspector category | `src/control-plane/settings/categories/CategoryInspector.tsx` |
| Data-sources category | `src/control-plane/settings/categories/CategoryDataSources.tsx` |
| Display category | `src/control-plane/settings/categories/CategoryDisplay.tsx` |
| Accessibility category | `src/control-plane/settings/categories/CategoryAccessibility.tsx` |
| Advanced category | `src/control-plane/settings/categories/CategoryAdvanced.tsx` |
| Playwright tests | `tests/e2e/settings-panel.spec.ts` |

File names use PascalCase for components, camelCase for non-component TS. No alternate spellings.

### Symbol names (frozen)

- The exported registry must be named exactly `SETTINGS_PANEL_CATEGORIES`.
- The exported type must be named exactly `CategoryDef` (not `CategoryDefinition`, not `SettingsPanelCategory`, not `Category`).
- The exported component must be named exactly `SettingsPanel` (named export, matching prototype convention).
- The store hook must be `useSettingsStore` (existing — do not rename).
- The action must be `setSetting` (existing — do not rename).
- The tile context hook must be `useTileContext` (existing from `TileProvider` — do not rename or shadow).

---

## Order of Operations

The accepting pass executes in this exact sequence. Skipping or reordering steps fails the pass.

1. **Contract acceptance.** This doc reviewed and accepted by Ryan via `#approve-this`. No code work begins before acceptance.

2. **Type file.** Create `src/control-plane/settings/settingsPanel.types.ts` with `CategoryId`, `CategoryDef`, `PanelPosition`, `SettingsPanelGeometry`, `SettingsPanelProps`. Commit.

3. **Registry.** Create `src/control-plane/settings/settingsPanelCategoryRegistry.ts` exporting `SETTINGS_PANEL_CATEGORIES` with all 8 entries in correct order. Commit.

4. **Validator.** Create `scripts/validate-settings-panel.mjs` that:
   - Verifies the registry has exactly 8 entries.
   - Verifies the order matches the contract.
   - Verifies all required fields are present and non-empty.
   - Verifies all `id` values are valid CategoryIds.
   - Verifies the settings registry has no `category: string` values that are NOT valid CategoryIds.
   - Exits 0 on pass, 1 on failure.
   - Added to QA bundle if there is a QA bundle script; otherwise standalone.
   - Run locally: `node scripts/validate-settings-panel.mjs` must exit 0. Commit.

5. **Settings registry migration.** Update `SettingControl` type in `src/control-plane/settings/settings.registry.ts`:
   - Narrow `category: string` to `category: CategoryId` (import CategoryId from `settingsPanel.types.ts`).
   - Add optional `tileVisibleByDefault?: boolean` field to all variants.
   - Update all existing entries' `category` field to use new CategoryId values per the mapping table.
   - Run `npm run typecheck` — must pass clean. Commit.

6. **Settings schema migration (conditional).** If new settings fields are introduced by this pass (e.g., `settings.ui.settingsPanelOpacity`):
   - Add field to `settings.schema.ts`.
   - Add default to `settings.defaults.ts`.
   - Bump `CURRENT_SCHEMA_VERSION` from 86 to **87** in `settings.store.ts`.
   - Add migration v87 to `settings.migrations.ts` (idempotent default-setting pattern matching existing migrations).
   - Commit.
   - **If no new settings fields are needed, skip this step entirely.** Do NOT bump the version without a backing field change.

7. **Panel shell.** Port `SettingsPanel.tsx` from the project knowledge prototype to `src/control-plane/settings/SettingsPanel.tsx`. This is the floating-tile shell with drag/resize/minimize/dock and the four slots. Strip the IIFE wrapper. Use real React imports. Commit.

8. **Subcomponents.** Port `SettingsSidebar.tsx`, `SettingsContent.tsx`, `SettingsStatusBar.tsx`, `SettingsSearchBar.tsx` from the prototype. Each as its own commit.

9. **Category components, one at a time, in this order:**
   - `CategoryTheme.tsx` — full content from prototype
   - `CategoryTypography.tsx` — full content from prototype
   - `CategoryGraph.tsx` — reuses settings from `settingsRegistry` filtered by `category === 'graph'`, may also include richer content from prototype if available
   - `CategoryInspector.tsx` — content from prototype
   - `CategoryDataSources.tsx` — stub OK (category header + brief description + "settings coming in v95")
   - `CategoryDisplay.tsx` — stub OK or basic content if prototype has it
   - `CategoryAccessibility.tsx` — stub OK or basic content if prototype has it
   - `CategoryAdvanced.tsx` — stub OK or basic content if prototype has it

   Each category as its own commit. Stub categories still render the category header, description, and a placeholder message. They do NOT need to render the full settings filtered by category until follow-up passes.

10. **Panel host.** Create `SettingsPanelHost.tsx` that:
    - Subscribes to `Cmd+,` / `Ctrl+,` hotkey via `document.addEventListener('keydown', ...)`.
    - Manages `open`, `activeCategory`, `search`, `opacity` state via `useState`.
    - Wires the panel into `AppShell.tsx` as a child component.
    - Renders `<SettingsPanel />` with all slots populated.
    - On `keydown`, calls `event.preventDefault()` for Cmd+, only when the panel handles it.
    - Includes a comment: `// v97: migrate hotkey registration to hotkey registry`.
    Commit.

11. **Topbar gear button wiring.** Update `src/control-plane/topbar/Topbar.tsx` to accept an `onOpenSettings` callback prop and call it from the gear button's `onClick`. Update `AppShell.tsx` to pass the handler down. The gear button's existing label, icon, and `Cmd+,` kbd hint stay as-is. Commit.

12. **Mount in AppShell.** Add `<SettingsPanelHost />` to `src/app/AppShell.tsx` at an appropriate top-level position. Commit.

13. **Geometry persistence.** Wire `localStorage` read on mount, debounced write on geometry changes. Use exactly the key `lw.settings.panel.geometry.v1`. Commit.

14. **Remove legacy SettingsPanel.** Verify no other files import the old `SettingsPanel.tsx` shape. The file is overwritten by step 7's port; this step is the cleanup pass for orphan imports. The `categoryToTileKey` Record from the old panel is removed (the new panel uses the category registry instead). Commit.

15. **Playwright tests.** Create `tests/e2e/settings-panel.spec.ts` covering:
    - Panel opens via `Cmd+,` (test env: use `Ctrl+,` on Linux/Windows test runner via `await page.keyboard.press('Control+Comma')`)
    - Each of the 8 categories renders (verify by `data-testid="settings-category-nav-{id}"` presence for all 8 ids)
    - Switching category updates `settings-panel-content` testid to match `settings-category-content-{id}`
    - Search filter affects sidebar category match counts (visible on relevant nav items)
    - Drag, resize, minimize all function
    - Geometry persists across page reload (verify localStorage write, reload, verify position restored)
    - Close button closes panel
    - Escape closes panel when focused
    - Topbar gear button opens panel
    Commit.

16. **Final gates.**
    - `npm run typecheck` — clean
    - `npm run qa:e2e` — current baseline holds, no new failures, no skipped tests added
    - `node scripts/validate-settings-panel.mjs` — exit 0
    - Manual smoke test: open panel via Cmd+,, click through all 8 categories, drag/dock/resize, reload, verify state restored
    - Verify the existing tileable sections (physics-section, appearance-section, labels-section, typography-playground-section) still tear off correctly from the right-side control dock — they are NOT broken by this pass
    Report results to `#current-task`. Request final approval via `#approve-this`.

17. **Merge to main.** After approval.

---

## Evidence Required

For the pass to be accepted:

- `scripts/validate-settings-panel.mjs` exits 0.
- `tests/e2e/settings-panel.spec.ts` covers all 9 evidence cases listed in step 15.
- `npm run qa:e2e` baseline holds (no new failures, no skipped tests added).
- `npm run typecheck` clean.
- Manual smoke test confirms all behaviors documented in Allowed Behavior section.
- Manual confirmation that existing tileable sections still work.
- No imports from forbidden directories (grep verification).
- No `localStorage` writes outside the documented key (grep verification).
- No hardcoded colors in settings panel code (grep verification: no hex, no `rgb(`, no `rgba(`, no `hsl(` in the panel source).

---

## Forbidden Boundaries

Cross-cutting boundaries that this pass MUST NOT cross:

- ❌ Modifying the graph rendering or Sigma layer.
- ❌ Modifying the theme runtime or `applyTheme.ts`.
- ❌ Adding new theme tokens.
- ❌ Adding categories beyond the eight listed.
- ❌ Modifying entries in `tileSectionRegistry` (the existing four entries must remain functional and unchanged).
- ❌ Implementing the Theme Menu redesign (that's a separate subsequent pass).
- ❌ Implementing the future "Tiles" category (lands with tile-system redo, separate pass).
- ❌ Implementing the "Show in tile" UI toggle (data shape only this pass).
- ❌ Implementing v92 Audio Reactivity controls.
- ❌ Modifying the migration chain pre-v87.
- ❌ Renaming any settings paths that already exist in `settings.registry.ts`.

---

## Acceptance Criteria

This contract is **accepted** when Ryan approves via `#approve-this`. After acceptance:

- Bandit may execute the Order of Operations above.
- This doc moves from `status: draft` to `status: accepted` (single-line edit in the front matter).
- `last_updated` field updates to acceptance date.

The Pass is **accepted** when:

- All 17 steps in Order of Operations are complete.
- All Evidence Required items pass.
- All Forbidden Boundaries are respected.
- Ryan confirms acceptance via `#approve-this`.
- The accepting commit message references this contract by id (`settings.panel.contract`).

---

## Out of scope (explicit non-goals)

The following are EXPLICITLY out of scope for the accepting pass. Mentioning them in the pass commits is fine; implementing them is not.

- Theme Menu reuse (next pass after this one — reuses panel shell with tweaks)
- Tile-system redo (eliminate side panels, dock to edges, defined homes — separate later pass)
- "Tiles" category in Settings (lands with tile redo)
- "Show in tile" UI toggles on individual settings (lands with Tiles category)
- Workshop UI (v88, deferred to post-v92/v93)
- Audio reactivity controls (v92)
- OKLCH color migration (v93)
- Provenance UI (v98)
- Time-travel history scrubbing (v99)
- Real-time collaboration scaffolding (v100)
- Hotkey registry migration (v97; Cmd+, uses direct addEventListener for this pass)

---

## Tiles category future-compat notes

Forward-compatibility considerations baked into this pass to ease the future Tiles category landing:

1. **`tileVisibleByDefault` field on SettingControl** — scaffold lets the future Tiles category seed its content checklists without re-migrating data.
2. **CategoryId enum is openable for extension** — adding a `'tiles'` value requires a new contract but does not break existing code.
3. **Settings panel does NOT register with tileSectionRegistry** — the Settings panel itself is a system surface, not a tearable tile. The future Tiles category will manage tile composition, not turn Settings into a tile.
4. **Existing tileable sections continue to live in tileSectionRegistry independently** — they will be referenced by the future Tiles category but their registration shape stays as-is.

When the tile-system redo lands (later pass), the work will include:
- Adding `'tiles'` to CategoryId enum (new contract)
- Building `TileConfig` type with dock location, home position, visibility, content checklist
- Building Tiles category UI with search + grouped accordion (Design 4 pattern)
- Wiring inline "Show in tile" toggles on individual settings as a bridge UX
- Migrating tileable sections to use the new TileConfig shape

This is documented here so the data shape decisions in this pass are visibly intentional.

---

## Migration / Rollback

If the pass needs to be rolled back:

1. `git revert` the merge commit.
2. The legacy inline `SettingsPanel.tsx` (3-category) is preserved in git history at the previous commit and can be restored.
3. The `Cmd+,` hotkey can be left unbound or rebound to a no-op.
4. The `lw.settings.panel.geometry.v1` localStorage key is orphaned but harmless (users' browsers retain it; it's read only when the new panel mounts).
5. The settings registry's narrowed `category: CategoryId` type reverts to `category: string`. No data is lost.

---

## Related Documents

- `protocol.registry.contract.patterns` — the Standard Ladder this pass follows
- `theme.system.overview` — for the upcoming Theme Menu pass that reuses this shell
- (Future) `tile.section.redo.contract` — for the tile-system redo that introduces Tiles category

---

*Draft v2 authored by planning Claude, 2026-05-25. Incorporates codebase corrections from src tree audit and Model B information architecture. Awaits Ryan acceptance via `#approve-this` before code work begins.*
