# Theme System Overview

## Goals

The theme system allows users to customize the visual appearance of LumaWeave through:
- Theme presets (predefined color schemes)
- Custom theme creation and management
- Graph-only theme editing (initial scope)
- Full app theme editing (future scope)

## Current State

**Phase 1A Complete (Theme Runtime v0):**
- Theme runtime tokens defined: `src/themes/themeTokens.ts` with 4 built-in themes (Solar Plasma, Obsidian Aurora, Haunted Observatory, Glitter Goblin)

**Glitter Tsunami v1 Complete** - Theme integrity pass completed with:
- Fixed Haunted Observatory graph node color defect
- Added theme runtime guardrails (validateThemeTokens function)
- Mission Control OS polish (decision badge, history sorting)
- Handleset documentation updated to v10
- QA checklist v11 activated
- Playwright coverage expanded

**Implemented Features:**
- Theme runtime token model with app, graph, and effects sections
- 4 built-in theme presets (Solar Plasma, Obsidian Aurora, Haunted Observatory, Glitter Goblin)
- Theme tokens applied to app shell and graph visual styling
- Theme selector in top bar
- Glitter and reduce motion toggles in top bar
- Mission Control QA panel with theme-aware styling
- Graph color updates when theme changes (fixed defect)
- Theme validation function for runtime guardrails
- Mission Control decision badge in header
- Mission Control history sorted by most recent

**Outstanding Items (Future Phases):**
- Custom theme creation and management
- Save/rename/delete custom themes
- Import/export JSON
- Pop-out color picker
- Full app theme editor (panel colors, background/starfield, UI component colors)

## Architecture

### Graph Visual Tokens (Current)
Located in `src/graph/visual/graphVisualTokens.ts`:
- Node colors (default, selected, hovered)
- Edge colors (default, selected, hovered)
- Label colors (default, selected, hovered)
- Node sizes (default, selected, hovered)
- Edge sizes (default, selected, hovered)
- Label font sizes (node, edge)
- Label truncation values

### Theme Preset Model (Planned)
```typescript
interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  isBuiltIn: boolean;
  tokens: GraphVisualTokens;
  createdAt: number;
  updatedAt: number;
}
```

### Theme Store (Planned)
```typescript
interface ThemeState {
  activeThemePresetId: string;
  customThemePresets: ThemePreset[];
  builtInThemePresets: ThemePreset[];
}
```

## Scope

### Phase 1: Graph-Only Theme Editor (Initial)
- Edit graph visual tokens only
- Theme preset dropdown in top bar
- Save custom theme preset
- Rename custom theme preset
- Select saved preset
- No app-wide theming

### Phase 2: Full App Theme Editor (Future)
- Edit graph visual tokens
- Edit panel colors
- Edit background/starfield
- Edit UI component colors
- Pop-out color picker
- Import/export JSON

## Theme Presets

### Built-in Presets
- Solar Plasma (default)
- Deep Space
- Cyberpunk
- Minimal
- High Contrast

### Custom Presets
- User-created themes
- Stored in local storage
- Can be renamed
- Can be deleted
- Can be exported

## Top Bar Theme Controls

### Theme Preset Dropdown
- Located in top bar
- Shows all available presets
- Shows active preset
- Allows preset selection

### Save Custom Theme
- Button in top bar or theme editor
- Saves current token values as new preset
- Prompts for name
- Saves to custom presets

### Rename Custom Theme
- Context menu or edit button
- Renames custom preset
- Updates references

### Select Saved Preset
- Dropdown selection
- Applies preset tokens to graph
- Updates active preset ID

## Color Picker Roadmap

### Phase 1: Native Color Input
- Use HTML5 `<input type="color">`
- Simple, browser-native
- Limited customization

### Phase 2: Pop-out Color Picker (Future)
- Custom color picker component
- Hex, RGB, HSL support
- Recent colors
- Color palette
- Alpha channel support

## Handleset Integration

### Theme Handles
- `appearance.theme` - Theme selection
- `appearance.customThemePresets` - Custom presets array
- `appearance.activeThemePresetId` - Active preset ID

### Handleset Relationship
- Theme presets modify token values
- Handleset documents what can be themed
- No dead active controls
- Theme changes are live-updating

## Dependencies

- Graph visual tokens (current)
- Settings store (for theme state)
- Theme store (planned)
- Color picker (future)

## Risk Assessment

### Low Risk
- Theme preset model definition
- Handleset documentation
- Graph-only theme editor scope

### Medium Risk
- Top bar theme controls (UI change)
- Save/rename/select custom themes (state management)

### High Risk
- Full app theme editor (complex)
- Pop-out color picker (complex)
- Import/export JSON (complex)

## Timeline

- Phase 1 (Graph-only theme editor): 2-3 weeks
- Phase 2 (Full app theme editor): 3-4 weeks (very late)

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Start with graph-only scope
- Do not implement pop-out color picker yet
- Do not implement full app theme editor yet
