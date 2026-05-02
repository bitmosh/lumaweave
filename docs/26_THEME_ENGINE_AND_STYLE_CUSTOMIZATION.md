# Theme Engine and Style Customization

## Goal

Document the future theme engine for LumaWeave to make theming first-class.

## Theme Scope

The theme system will control:

- App background
- Panel backgrounds and surfaces
- Borders and dividers
- Text colors (primary, secondary, muted)
- Font family
- Font scale
- Node colors (default, selected, endpoint, secondary)
- Edge colors (default, primary, secondary, warning)
- Selection colors
- Relationship colors (calls, imports, contains, references, unknown)
- Warning/error colors
- Graph background
- Label styling
- Debug panel styling
- Inspector panel styling
- Settings panel styling
- Particle/effect colors (future)

## Theme Token Architecture

### App Tokens
- `app.background` - Main app background color
- `app.surface` - Panel surface background
- `app.surfaceAlt` - Alternate panel background
- `app.border` - Border color
- `app.borderFocus` - Focused border color

### Text Tokens
- `text.primary` - Primary text color
- `text.secondary` - Secondary text color
- `text.muted` - Muted/disabled text color
- `text.accent` - Accent/emphasis text color
- `text.error` - Error text color
- `text.warning` - Warning text color

### Graph Node Tokens
- `graph.node.default` - Default node color
- `graph.node.selected` - Selected node color
- `graph.node.endpoint` - Relationship endpoint node color
- `graph.node.secondary` - Secondary/neighbor node color
- `graph.node.community` - Community-clustered node color

### Graph Edge Tokens
- `graph.edge.default` - Default edge color
- `graph.edge.primary` - Primary/selected edge color
- `graph.edge.secondary` - Secondary edge color
- `graph.edge.warning` - Warning/high-risk edge color
- `graph.arrow.default` - Default arrow color

### Selection Tokens
- `selection.node` - Selected node highlight
- `selection.edge` - Selected edge highlight
- `selection.neighbor` - Neighbor node highlight

### Relationship Type Tokens
- `relationship.calls` - Function call edges
- `relationship.imports` - Import edges
- `relationship.contains` - Contains/ownership edges
- `relationship.references` - Reference edges
- `relationship.unknown` - Unknown relationship edges

### Status Tokens
- `status.info` - Info status color
- `status.success` - Success status color
- `status.warning` - Warning status color
- `status.error` - Error status color

### Typography Tokens
- `font.family` - Font family
- `font.scale.base` - Base font scale
- `font.scale.small` - Small font scale
- `font.scale.large` - Large font scale

## Color Editor Concept

### UI Layout

A pop-out color selection panel with:

- **Hue slider** - 0-360 hue wheel
- **Saturation slider** - 0-100% saturation
- **Brightness/Value slider** - 0-100% brightness
- **Alpha slider** - 0-100% opacity
- **Black/White blend** - Tint/shade control
- **Contrast preview** - Show contrast ratio against current background
- **Reset token** - Reset token to default value
- **Copy/paste hex** - Copy hex code to clipboard
- **Save preset** - Save current theme as named preset
- **Compare against current background** - Preview on current app background

### Color Picker Features

- HSB/HSV color model
- Hex input/output
- RGB input/output
- Preset color swatches
- Recent colors history
- Contrast ratio checker (WCAG AA/AAA)
- Colorblind simulation preview

### Token Selection

- Token tree navigation
- Search by token name
- Group by category (app, text, graph, selection, relationship)
- Show current value vs default value
- Show usage locations (optional)

## Theme Presets

### LumaWeave Default
- Cyan/amber/purple accent palette
- Dark slate background
- Solar plasma aesthetic foundation

### Solar Plasma
- High-contrast plasma colors
- Solar flare effects
- Nebula gradients
- Star field background

### Obsidian Aurora
- Deep obsidian blacks
- Aurora borealis accents
- Glowing edge effects
- Crystalline highlights

### Blacklight Loom
- UV/blacklight palette
- Fluorescent highlights
- Dark purple base
- Glowing threads

### Deep Space Cathedral
- Cathedral-like structure
- Cosmic background
- Golden accents
- Celestial lighting

### Haunted Observatory
- Eerie dark blues
- Ghostly highlights
- Observed-but-unknown aesthetic
- Muted purples

### Blood Moon Debugger
- Red/blood moon palette
- High-contrast error states
- Debugger-focused
- Alert-heavy

### High Contrast
- Maximum contrast
- WCAG AAA compliant
- No subtle colors
- Clear boundaries

### Reduced Motion / Low FX
- Muted colors
- No gradients
- Flat design
- Accessibility-focused

## Theme Storage

### Phase 1: Settings Store
- Theme stored in Zustand settings store
- Preset selection
- Custom token overrides
- Persisted to localStorage

### Phase 2: Persistent Settings
- `settings.json` file
- Full theme export/import
- Version tracking
- Migration support

### Phase 3: SQLite (Optional)
- Per-project themes
- Theme history
- Shared theme libraries
- Cloud sync support

### Export/Import Format

```json
{
  "version": 1,
  "name": "Custom Theme",
  "basePreset": "solar-plasma",
  "tokens": {
    "app.background": "#0f172a",
    "text.primary": "#f1f5f9",
    "graph.node.default": "#22d3ee",
    ...
  },
  "metadata": {
    "created": "2026-04-30T00:00:00Z",
    "modified": "2026-04-30T00:00:00Z",
    "author": "user"
  }
}
```

## Safety Features

### Accessibility
- Contrast ratio warnings (WCAG AA/AAA)
- Colorblind-friendly preset
- Font size warnings
- Readability preview

### Reduce Motion
- Disable animated theme transitions
- Disable particle effects
- Disable glow/flares
- Flat color mode

### Error Prevention
- Contrast ratio minimum enforcement
- Color validation
- Token type checking
- Reset to defaults button
- Backup before applying

### Visual Safety
- No flashing effects
- No rapid color cycling
- Seizure-safe palettes
- Motion sickness considerations

## Implementation Phases

### Phase T0: Document Theme Token Structure
- Define token taxonomy
- Document token categories
- Establish naming conventions
- Create token reference

### Phase T1: Centralize Selection Colors into Theme Tokens
- Move selectionColors.ts into theme tokens
- Update SigmaGraphView to use theme tokens
- Create theme store structure
- Add theme selector to settings

### Phase T2: App Shell Colors from Theme Tokens
- Move hardcoded app colors to tokens
- Update AppShell to use theme tokens
- Update panel components to use theme tokens
- Theme-aware borders and surfaces

### Phase T3: Node/Edge Relationship Colors from Theme Tokens
- Move relationship type colors to tokens
- Update edge rendering to use relationship tokens
- Update node rendering to use node tokens
- Relationship legend from theme tokens

### Phase T4: Theme Editor Panel
- Create theme editor component
- Implement color picker UI
- Add token navigation
- Add preset management
- Add export/import

### Phase T5: Import/Export Custom Themes
- Implement theme JSON export
- Implement theme JSON import
- Add theme sharing UI
- Add theme validation

### Phase T6: Animated/Effect Theme Tokens
- Add animation tokens
- Add effect tokens
- Particle system integration
- Glitter/flares from theme
- Solar plasma effects from theme

## Integration Points

### Settings System
- Theme preset selection in settings registry
- Custom token overrides in settings store
- Theme version migration
- Settings panel integration

### Renderer System
- Sigma 2D renderer uses graph tokens
- Future 3D renderer uses graph tokens
- Label system uses text tokens
- Effect system uses effect tokens

### Component System
- Panels use app/surface tokens
- Inspector uses text tokens
- Debug panel uses status tokens
- Settings panel uses app tokens

## Migration Path

### Current State
- Hardcoded colors in components
- selectionColors.ts for selection
- No theme system

### Step 1: Theme Store
- Create theme store (Zustand)
- Define token structure
- Add default preset
- Add preset selection

### Step 2: Selection Colors Migration
- Move selectionColors to theme tokens
- Update SigmaGraphView
- Update settings registry
- Remove selectionColors.ts

### Step 3: App Colors Migration
- Identify hardcoded app colors
- Create app tokens
- Update components
- Add theme switcher

### Step 4: Graph Colors Migration
- Identify hardcoded graph colors
- Create graph tokens
- Update renderers
- Add relationship tokens

### Step 5: Theme Editor
- Build color picker
- Build token editor
- Build preset manager
- Add export/import

## Future Considerations

### Dynamic Themes
- Time-based theme switching
- Project-based themes
- Context-aware themes
- AI-generated themes

### Theme Marketplace
- Community themes
- Theme ratings
- Theme previews
- Theme subscriptions

### Advanced Customization
- Custom fonts
- Custom spacing
- Custom borders
- Custom animations

### Performance
- Theme lazy loading
- Token caching
- Optimized re-renders
- GPU-accelerated transitions

## References

- WCAG 2.1 Contrast Requirements
- Tailwind CSS Color System
- Material Design 3 Theming
- CSS Custom Properties
- Design Tokens Community Group
