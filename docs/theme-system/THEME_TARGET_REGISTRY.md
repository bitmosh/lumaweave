# Theme Target Registry (v20)

## Summary
The Theme Target Registry defines the canonical set of inspectable UI surfaces for LumaWeave. Each entry records a `themeTargetId`, surface classification, optional visual handle, canonical `themeTokenPath` bindings, and the editable properties that future Theme Mapping Mode may expose. v20 keeps the registry read-only and does not unlock editing controls.

## Relationship to Theme Token Path Map
- Registry entries reference the v19 canonical `ThemeTokenPath` names so future affordances cannot drift from the accepted vocabulary.
- Every active registry item maps only to resolvable runtime tokens; planned targets remain token-less placeholders.

## Relationship to Visual Handles
- Where possible, targets list the existing `lw-*` visual handle class (e.g., `lw-panel`, `lw-card`).
- Visual handles provide the CSS scaffolding that will eventually bind registry tokens to DOM styling.

## Relationship to Theme Mapping Mode
- Theme Mapping Mode will use `themeTargetId` as the binding between inspector overlay, generated controls, and token overrides.
- Registry entries act as the contract that the Ableton-style inspector must target; no target ID, no mapping.

## ThemeTargetContract Shape
```ts
export type ThemeTargetContract = {
  themeTargetId: string;
  label: string;
  surface: "shell" | "topbar" | "panel" | "mission-control" | "control" | "settings" | "graph";
  visualHandle?: string;
  tokenBindings: Partial<Record<ThemeEditableProperty, ThemeTokenPath>>;
  editableProperties: ThemeEditableProperty[];
  status: "active" | "planned" | "experimental";
  notes?: string;
};
```
- `ThemeEditableProperty` currently supports `background`, `border`, `text`, `accent`, `glow`, `opacity`, `radius`.
- `tokenBindings` are resolved Theme Token Path strings; entries remain empty for planned targets until a mapping is proven.

## Initial Active Targets
| themeTargetId | Surface | Visual Handle | Token Bindings |
| --- | --- | --- | --- |
| `app.shell` | shell | (none) | `background`, `glow` |
| `topbar.root` | topbar | (none) | `app.background`, `panel.border`, `text.primary`, `accent.primary` |
| `mission-control.panel` | mission-control | `lw-panel` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.question-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.proposal-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `mission-control.backlog-card` | mission-control | `lw-card` | `panel.background`, `panel.border`, `text.primary` |
| `settings.panel` | settings | `lw-panel` | `panel.background`, `panel.border`, `text.primary` |
| `graph.frame` | graph | (none) | `app.background`, `panel.border` |

These bindings drive the new `data-lw-theme-target` markers but do not alter runtime styling yet.

## Planned / Future Targets
| themeTargetId | Notes |
| --- | --- |
| `graph.node.default` | Pending Graph Visual Policy refresh; will bind to `graph.node.*` tokens. |
| `graph.node.selected` | Planned for interaction state mapping. |
| `graph.edge.default` | Planned for edge stroke tokens. |
| `graph.edge.selected` | Planned for selected edge styling. |
| `theme-mapping.panel` | Placeholder for Theme Mapping Panel container once UI exists. |
| `theme-mapping.control` | Placeholder for generated inspector controls. |

## Read-Only Inspector Overlay Behavior
- Toggled via `Ctrl+Alt+T` (debug-only hotkey).
- Disabled by default; overlay merely displays metadata for hovered `data-lw-theme-target` elements.
- Tooltip includes target label, ID, surface, status, visual handle, editable properties, and token bindings.
- Overlay never enables editing, never modifies layout, and uses `pointer-events: none` for the HUD.

## Non-Goals
- No Theme Mapping Panel UI.
- No color pickers or editable controls.
- No theme override storage or preset saving.
- No Sigma/Graphology renderer, layout, or visual policy changes.
- No glitter or broad restyle adjustments.
- No new settings-store schema.

## Validation / QA Expectations
- Typecheck + Playwright remain green with zero skipped tests.
- QA Debug tab shows Theme Target Registry summary counts and surface breakdown.
- `data-lw-theme-target` attributes exist only on safe containers (shell, top bar, mission control cards, settings panel, graph frame).
- Inspector overlay defaults OFF, toggles via hotkey, and remains read-only.
- Graph frame and mission control visuals remain unchanged outside of diagnostic markers.
