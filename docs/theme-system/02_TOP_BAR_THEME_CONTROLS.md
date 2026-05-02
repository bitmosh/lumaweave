# Top Bar Theme Controls

## Overview

The top bar contains theme customization controls for quick access to theme presets and basic theme operations.

## Status

**Built-in theme preset dropdown:** IMPLEMENTED (Theme System Phase 1A)
**Custom theme save/rename/delete/import/export:** PLANNED

## Location

Located in the top bar of the LumaWeave app shell:
- Left side: LumaWeave Observatory title, active project
- Right side: theme preset dropdown, glitter toggle, reduce motion toggle

## Theme Preset Dropdown

### Implementation Status

**Implemented:** Built-in theme preset selector in top bar (src/app/AppShell.tsx, lines 86-95)

**Built-in presets:**
- Solar Plasma (default)
- Obsidian Aurora
- Haunted Observatory
- Glitter Goblin

**Not yet implemented:**
- Custom theme presets
- Save custom theme
- Rename custom theme
- Delete custom theme
- Import/export themes

### UI Component
```typescript
<select
  value={settings.appearance.theme}
  onChange={(e) => setSetting("appearance.theme", e.target.value)}
  className="rounded-lg border border-cyan-400/20 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 hover:border-cyan-400/40 focus:outline-none focus:border-cyan-400/60 transition-colors"
>
  <option value="solar-plasma">Solar Plasma</option>
  <option value="obsidian-aurora">Obsidian Aurora</option>
  <option value="haunted-observatory">Haunted Observatory</option>
  <option value="glitter-goblin">Glitter Goblin</option>
</select>
```

### Behavior
- Shows all available built-in presets
- Shows active preset as selected value
- Changing selection applies new theme immediately
- Custom presets not yet supported

### Accessibility
- Keyboard navigation (up/down arrows)
- Screen reader support
- Focus management

## Save Custom Theme Button

### UI Component
```typescript
<button onClick={handleSaveCustomTheme}>
  Save Custom Theme
</button>
```

### Behavior
- Opens modal dialog
- Prompts for theme name
- Validates name (non-empty, unique)
- Saves current token values as new preset
- Adds to custom presets list
- Selects new preset as active

### Modal Dialog
- Title: "Save Custom Theme"
- Input: Theme name
- Buttons: Cancel, Save
- Validation: Name required, unique

## Rename Custom Theme Button

### UI Component
```typescript
{selectedPreset && !selectedPreset.isBuiltIn && (
  <button onClick={handleRenameCustomTheme}>
    Rename
  </button>
)}
```

### Behavior
- Only visible when custom preset is selected
- Opens modal dialog
- Prompts for new name
- Validates new name (non-empty, unique)
- Updates preset name
- Refreshes dropdown

### Modal Dialog
- Title: "Rename Theme"
- Input: New theme name
- Buttons: Cancel, Save
- Validation: Name required, unique

## Delete Custom Theme Button

### UI Component
```typescript
{selectedPreset && !selectedPreset.isBuiltIn && (
  <button onClick={handleDeleteCustomTheme}>
    Delete
  </button>
)}
```

### Behavior
- Only visible when custom preset is selected
- Opens confirmation dialog
- Confirms deletion
- Removes from custom presets list
- Switches to default preset if deleted preset was active

### Confirmation Dialog
- Title: "Delete Theme"
- Message: "Are you sure you want to delete '{preset.name}'?"
- Buttons: Cancel, Delete

## Export Theme Button

### UI Component
```typescript
{selectedPreset && (
  <button onClick={handleExportTheme}>
    Export
  </button>
)}
```

### Behavior
- Exports current preset as JSON
- Downloads file to user's computer
- Filename: `{preset.name}.json`

### JSON Format
```json
{
  "id": "custom-theme-1",
  "name": "My Custom Theme",
  "description": "My custom theme description",
  "isBuiltIn: false,
  "tokens": { ... },
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

## Import Theme Button

### UI Component
```typescript
<button onClick={handleImportTheme}>
  Import Theme
</button>
```

### Behavior
- Opens file picker dialog
- Accepts .json files
- Validates preset structure
- Adds to custom presets list
- Shows success/error message

### Validation
- JSON must be valid
- Structure must match ThemePreset interface
- Tokens must be valid
- Built-in presets cannot be imported (show error)

## Layout in Top Bar

### Recommended Layout
```
[LumaWeave Observatory] [Active Project] ... [Theme Preset ▼] [Layout ▼] [Renderer ▼] [Save] [Rename] [Delete] [Export] [Import]
```

### Grouping
- Theme controls grouped together
- Layout/view controls grouped together
- Renderer controls grouped together

## Responsive Behavior

### Desktop
- All controls visible
- Full labels

### Tablet
- Theme preset dropdown visible
- Save/Rename/Delete/Export/Import in overflow menu

### Mobile
- Theme preset dropdown visible
- Other controls in overflow menu

## State Management

### Theme Store
```typescript
interface ThemeStore {
  activeThemePresetId: string;
  customThemePresets: ThemePreset[];
  setActiveThemePresetId: (id: string) => void;
  saveCustomTheme: (name: string, tokens: GraphVisualTokens) => void;
  renameCustomTheme: (id: string, name: string) => void;
  deleteCustomTheme: (id: string) => void;
  exportTheme: (id: string) => void;
  importTheme: (json: string) => void;
}
```

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Start with theme preset dropdown only
- Add Save/Rename/Delete/Export/Import incrementally
