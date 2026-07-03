---
id: lumaweave.settings.menu.tech.notes
title: LumaWeave Settings Menu — Technical Notes
type: design-spec
status: design-ready
audience: claude-design
last_updated: 2026-05-22
---

# LumaWeave Settings Menu — Technical Notes

Technical constraints, conventions, and integration expectations. Important for transposability to Bandit's implementation.

## TypeScript-first

All components ship as `.tsx` with explicit prop interfaces. No implicit-any. Generic types where it makes sense (e.g., a `SettingRow<TValue>` that's generic over the setting's value type).

### Avoiding past pain

Earlier design prototypes were written in vanilla React with no types, then had to be translated to TypeScript. Don't repeat that. Start in TypeScript, declare props upfront, use generics where natural.

### Naming conventions

- Component files: `PascalCase.tsx`
- Hook files: `useCamelCase.ts`
- Utility files: `camelCase.ts`
- Type files: `kebab-case.types.ts` or co-located with components

Match LumaWeave's existing patterns.

## Component decomposition

Suggested top-level components for the Settings menu. Adjust as needed during design.

```
SettingsPanel/                          (the floating tile shell)
├── SettingsPanel.tsx                   (root component)
├── SettingsTitleBar.tsx                (drag-handle + minimize + close)
├── SettingsSidebar/
│   ├── SettingsSidebar.tsx             (category list)
│   ├── SettingsSidebarItem.tsx         (single category entry)
│   └── icons.tsx                       (category icons)
├── SettingsContent/
│   ├── SettingsContent.tsx             (selected category's content area)
│   ├── SettingsSubSection.tsx          (collapsible sub-section header + body)
│   └── SettingsSearchBar.tsx           (the search input)
├── SettingsRow/
│   ├── SettingsRow.tsx                 (generic row wrapper)
│   ├── ToggleSettingsRow.tsx           (boolean settings)
│   ├── SliderSettingsRow.tsx           (range settings)
│   ├── SelectSettingsRow.tsx           (enum/option settings)
│   ├── ColorSettingsRow.tsx            (color picker settings)
│   ├── ButtonSettingsRow.tsx           (action button)
│   ├── DisplaySettingsRow.tsx          (read-only display)
│   └── PlaceholderSettingsRow.tsx      ("coming later" placeholder)
├── SettingsStatusBar/
│   ├── SettingsStatusBar.tsx           (bottom bar shell)
│   ├── AccountStatusSection.tsx
│   ├── ProfileStatusSection.tsx
│   ├── PositionStatusSection.tsx
│   ├── SaveStateStatusSection.tsx
│   └── OpacityStatusSection.tsx        (slider with icon)
└── settings.css                        (or settings.module.css; styling)
```

This is suggested, not binding. Reorganize during design if a different structure makes more sense.

## CSS variables and theming

All colors, spacing, fonts, radii etc. reference LumaWeave's theme tokens via CSS variables. Never hardcode colors.

### Variables to use

```
--lw-app-background
--lw-panel-bg
--lw-panel-background
--lw-panel-border
--lw-text-primary
--lw-text-muted
--lw-accent
--lw-color-flare-500
--lw-color-magenta-500
--lw-color-purple-500
--lw-color-gold-500
--lw-font-display
--lw-font-body
--lw-font-mono
```

For opacity layering (per Pattern 2), introduce three new variables specific to the Settings panel:

```
--lw-settings-bg-opacity      (0-1)
--lw-settings-chrome-opacity  (0.6-1)
--lw-settings-text-opacity    (1, fixed)
```

These get updated from the opacity slider; CSS rules apply them to the relevant layers.

## State management

### Settings store

LumaWeave has an existing settings store (`src/control-plane/settings/settings.store.ts`). All settings the Settings menu controls already live (or will live) in this store. Settings menu components read from and write to this store.

You don't need to know the store's implementation — assume a hook like `useSettings()` returns `{ settings, setSetting }`. Bandit will wire this up.

### Tile system

The Settings panel is a tile. It registers with `tileSectionRegistry` (existing from v86c) at a known id ("settings-panel"). The tile system handles position, dock state, minimize/maximize, drag/resize.

You don't need to know the tile system's API in detail — assume the panel's outer container accepts the tile-system's props.

### Theme system

The active theme drives the panel's visual style via CSS variables. The crossfade from v87.4 animates these variables on theme switch — your panel will smoothly transition without explicit code.

You don't need to handle theme switching — the panel's CSS variables resolve to whatever theme is active.

### Override storage

For the override list in Theme category, read from `themeOverrideStorage` (existing from v86d.1). The storage exposes:
- `getAllOverrides()` → list of all current overrides across all targets
- `removeTargetOverride(targetId, tokenPath)` → reset a specific override
- `subscribe(listener)` → react to changes

You don't need to handle this — assume the override list component receives the data via props or a hook.

## Existing integrations to use

These all exist and the Settings menu should consume them, not duplicate them:

| What | Where | Status |
|---|---|---|
| Theme presets | `src/themes/themePresets.ts` | v86a + v88a hashes |
| Theme tokens | `src/themes/themeTokens.ts` | v87.1 populated |
| Theme accessibility profile | `src/themes/themeAccessibilityProfile.ts` | v87.3 |
| Theme thumbnails | `src/themes/themeThumbnail.ts` | v87.3 |
| Override storage | `src/themes/themeOverrideStorage.ts` | v86d.1 |
| Color suggestion engine | `src/themes/colorSuggestionEngine.ts` | v88b.0 |
| Font axis registry | `src/themes/fontAxisRegistry.ts` | v86e + v87.4 |
| Typography registry | `src/themes/typographyRegistry.ts` | v86e |
| Tile system | `src/control-plane/tiles/` | v86c |
| Settings store | `src/control-plane/settings/` | existing |
| WCAG contrast utility | `src/themes/wcagContrast.ts` | v87.3 |

When designing components, refer to these by name. Bandit knows how to wire them up.

## Performance budget

The Settings panel is mostly idle. When open, the only active rendering is the live preview area (the graph behind it). The panel itself re-renders on:
- Setting changes (instant, small DOM updates)
- Theme switches (CSS variable updates only, no React re-renders for theme)
- User interactions (focus changes, hover states, etc.)

No animations on every frame. Status bar updates (save state, FPS) happen at low frequency (every 1s or on event).

Design with this in mind — don't add expensive re-render triggers unnecessarily. Memoize component trees where the data doesn't change often.

## Responsive considerations (minimal)

LumaWeave is desktop-first. The Settings panel should work at:
- Large desktop (1920+ width)
- Standard desktop (1280-1920)
- Small desktop (1024-1280)
- Docked-to-tile-bank (300-500 width)

At dock width, the sidebar collapses to icons only. The content area uses tighter spacing. Status bar may stack vertically.

Below 1024 viewport width, panel scales down but doesn't break. Below 800 viewport width is out of scope for this design (mobile is a separate concern).

## Accessibility expectations

- All interactive elements keyboard-reachable
- Focus indicators visible in all themes (including light)
- Sufficient color contrast for text (validated against the active theme's accessibility profile)
- Screen reader friendly — semantic HTML (button for buttons, input for inputs, etc.)
- `aria-label` on icon-only buttons (close, minimize, etc.)
- `aria-describedby` linking to setting descriptions
- Sliders use the native `<input type="range">` for accessibility built-ins

## Anti-patterns to avoid

- Don't use modals or backdrops anywhere in the Settings panel
- Don't write inline styles for theme-related colors (use CSS variables)
- Don't duplicate state (settings live in the store; the panel reads/writes to it)
- Don't hide important settings behind "show advanced" toggles — the Advanced category does that organizationally
- Don't auto-save indicators ("Saved!") — live updates make this redundant
- Don't pop modal confirms for non-destructive changes — only destructive actions need confirms
- Don't use emoji in icons (use SVG or icon-font characters)
- Don't add tooltips to every control (Tier 2 hover tooltips are for non-obvious controls only)

## Bandit workflow context

Once you deliver the design, the prototype goes through a transposition phase where Bandit reads your output, maps it against LumaWeave's existing files, and writes the production TypeScript code. Bandit will:

- Read your component files
- Map your CSS variables to LumaWeave's existing token system
- Wire components to the settings store, tile system, theme system, override storage, etc.
- Add tests
- Land the code in a pass with approval gates

To make this transposition smooth:

- Use clear, descriptive component and prop names
- Use TypeScript types thoroughly (Bandit will respect them)
- Comment any non-obvious design decisions inline (e.g., why a particular pattern was chosen)
- Avoid clever React tricks; prefer straightforward composition
- Use CSS variables for everything theme-related
- Don't use libraries Bandit's codebase doesn't have access to (no MUI, no Chakra, no Tailwind plugins beyond what's there)

The cleaner your TypeScript and component structure, the smoother the transposition. We've found prototypes that try to be too "vanilla React with no types" require a translation step that loses fidelity. Designing in TypeScript from the start eliminates that step.

## Open questions for the user

If during design you have questions that aren't answered by these docs (e.g., "should sub-sections persist their collapsed state across reloads?"), surface them as you go. The user is available to settle ambiguity, and we'd rather resolve a question than build the wrong thing.

Some likely ambiguities to flag if they come up:
- Sub-section collapse state persistence (per-category or global?)
- Search history (does the search bar remember prior queries?)
- Multi-select for related settings (e.g., select multiple overrides to clear at once?)
- Keyboard shortcut to open Settings (Cmd+, like macOS? Cmd+K opens command deck — settings should be different)
- Animation preferences (does opening the panel animate? if so, respect reduce-motion?)

These weren't pre-decided because they're better resolved with the design in hand. Flag them; we'll resolve them.

---

End of technical notes. Companion docs: `SETTINGS_MENU_BRIEF.md`, `SETTINGS_MENU_CATEGORIES.md`, `SETTINGS_MENU_PATTERNS.md`.