# Theme Handleset Integration

## Overview

Theme customization must be integrated with the handleset system to ensure:
- Theme controls are documented
- Theme handles are classified (active/partial/planned)
- No dead active controls
- Theme changes are live-updating

## Theme Handles

### appearance.theme
- **Handle Path:** appearance.theme
- **Label:** Theme Preset
- **Category:** Appearance
- **Default Value:** "solar-plasma"
- **UI Control Type:** select (theme preset dropdown)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (activeThemePresetId)
- **Live Update Behavior:** Yes - theme changes apply immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Selects active theme preset from built-in or custom presets.

### appearance.customThemePresets
- **Handle Path:** appearance.customThemePresets
- **Label:** Custom Theme Presets
- **Category:** Appearance
- **Default Value:** []
- **UI Control Type:** array (managed by theme editor)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (customThemePresets)
- **Live Update Behavior:** Yes - custom presets update immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Array of user-created theme presets. Managed by theme editor, not directly exposed in settings panel.

### appearance.activeThemePresetId
- **Handle Path:** appearance.activeThemePresetId
- **Label:** Active Theme Preset ID
- **Category:** Appearance
- **Default Value:** "solar-plasma"
- **UI Control Type:** string (internal state)
- **Source File:** src/control-plane/settings/settings.schema.ts (planned)
- **Runtime Target:** Theme store (activeThemePresetId)
- **Live Update Behavior:** Yes - active preset updates immediately
- **Status:** planned
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Internal state tracking the currently active theme preset ID. Updated by theme preset dropdown.

## Graph Visual Token Handles

### graphVisualTokens.nodeColorTokens.default
- **Handle Path:** graphVisualTokens.nodeColorTokens.default
- **Label:** Node Default Color
- **Category:** Visual Tokens
- **Default Value:** "#8b5cf6"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph node default color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Default color for unselected, unhovered nodes. Modified by theme presets.

### graphVisualTokens.nodeColorTokens.selected
- **Handle Path:** graphVisualTokens.nodeColorTokens.selected
- **Label:** Node Selected Color
- **Category:** Visual Tokens
- **Default Value:** "#a78bfa"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph node selected color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for selected nodes. Modified by theme presets.

### graphVisualTokens.nodeColorTokens.hovered
- **Handle Path:** graphVisualTokens.nodeColorTokens.hovered
- **Label:** Node Hovered Color
- **Category:** Visual Tokens
- **Default Value:** "#c4b5fd"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph node hovered color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for hovered nodes. Modified by theme presets.

### graphVisualTokens.edgeColorTokens.default
- **Handle Path:** graphVisualTokens.edgeColorTokens.default
- **Label:** Edge Default Color
- **Category:** Visual Tokens
- **Default Value:** "#6b7280"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph edge default color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Default color for unselected, unhovered edges. Modified by theme presets.

### graphVisualTokens.edgeColorTokens.selected
- **Handle Path:** graphVisualTokens.edgeColorTokens.selected
- **Label:** Edge Selected Color
- **Category:** Visual Tokens
- **Default Value:** "#8b5cf6"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph edge selected color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for selected edges. Modified by theme presets.

### graphVisualTokens.edgeColorTokens.hovered
- **Handle Path:** graphVisualTokens.edgeColorTokens.hovered
- **Label:** Edge Hovered Color
- **Category:** Visual Tokens
- **Default Value:** "#d8b4fe"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph edge hovered color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for hovered edges. Modified by theme presets.

### graphVisualTokens.labelColorTokens.default
- **Handle Path:** graphVisualTokens.labelColorTokens.default
- **Label:** Label Default Color
- **Category:** Visual Tokens
- **Default Value:** "#e5e7eb"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph label default color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Default color for unselected, unhovered labels. Modified by theme presets.

### graphVisualTokens.labelColorTokens.selected
- **Handle Path:** graphVisualTokens.labelColorTokens.selected
- **Label:** Label Selected Color
- **Category:** Visual Tokens
- **Default Value:** "#f3f4f6"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph label selected color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for selected labels. Modified by theme presets.

### graphVisualTokens.labelColorTokens.hovered
- **Handle Path:** graphVisualTokens.labelColorTokens.hovered
- **Label:** Label Hovered Color
- **Category:** Visual Tokens
- **Default Value:** "#ffffff"
- **UI Control Type:** color (theme editor)
- **Source File:** src/graph/visual/graphVisualTokens.ts
- **Runtime Target:** Graph label hovered color
- **Live Update Behavior:** Yes - color changes apply immediately
- **Status:** planned (theme editor)
- **Related Playwright Tests:** None
- **Related QA Checklist:** Theme System v0 (future)
- **Notes:** Color for hovered labels. Modified by theme presets.

## Handleset Relationship

### Theme Presets Modify Token Values
- Theme presets contain token values
- Applying a preset updates all tokens
- Token changes are live-updating
- No need to restart app

### Handleset Documents What Can Be Themed
- All theme handles documented in handleset
- Classification: planned (theme editor not implemented yet)
- No dead active controls
- Clear status for each handle

### No Dead Active Controls
- Theme handles marked as planned until implemented
- Visual tokens marked as internal until theme editor
- Theme preset dropdown marked as planned until implemented
- Save/Rename/Delete/Export/Import marked as planned until implemented

## Settings Schema Integration

### Theme Settings
```typescript
interface ThemeSettings {
  appearance: {
    theme: string; // "solar-plasma" | "deep-space" | etc.
    customThemePresets: ThemePreset[];
    activeThemePresetId: string;
  };
}
```

### Settings Registry
Theme settings will be added to settings.registry.ts when implemented:
- Theme preset dropdown (select)
- Save custom theme button (button)
- Rename custom theme button (button)
- Delete custom theme button (button)
- Export theme button (button)
- Import theme button (button)

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- Theme handles marked as planned
- Visual tokens marked as internal until theme editor
