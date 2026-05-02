# Theme Preset Model

## Overview

The theme preset model defines the structure for theme presets, which are named collections of visual token values.

## Theme Preset Interface

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

### Fields

- `id`: Unique identifier for the preset
- `name`: Human-readable name
- `description`: Optional description
- `isBuiltIn`: Whether this is a built-in preset (cannot be deleted)
- `tokens`: Graph visual token values
- `createdAt`: Timestamp when preset was created
- `updatedAt`: Timestamp when preset was last modified

## Graph Visual Tokens

The `tokens` field contains the graph visual token values:

```typescript
interface GraphVisualTokens {
  // Node colors
  nodeColorTokens: {
    default: string;
    selected: string;
    hovered: string;
  };

  // Edge colors
  edgeColorTokens: {
    default: string;
    selected: string;
    hovered: string;
  };

  // Label colors
  labelColorTokens: {
    default: string;
    selected: string;
    hovered: string;
  };

  // Node sizes
  nodeSizeMultipliers: {
    default: number;
    selected: number;
    hovered: number;
  };

  // Edge sizes
  edgeSizeTokens: {
    default: number;
    selected: number;
    hovered: number;
  };

  // Label font sizes
  labelFontSizeTokens: {
    node: number;
    edge: number;
  };

  // Label truncation
  labelTruncationTokens: {
    maxEdgeLabelLength: number;
  };
}
```

## Theme State

```typescript
interface ThemeState {
  activeThemePresetId: string;
  customThemePresets: ThemePreset[];
  builtInThemePresets: ThemePreset[];
}
```

### Fields

- `activeThemePresetId`: ID of the currently active theme preset
- `customThemePresets`: Array of user-created presets
- `builtInThemePresets`: Array of built-in presets (read-only)

## Built-in Presets

### Solar Plasma (Default)
```typescript
{
  id: "solar-plasma",
  name: "Solar Plasma",
  description: "Default solar plasma theme",
  isBuiltIn: true,
  tokens: {
    nodeColorTokens: {
      default: "#8b5cf6",
      selected: "#a78bfa",
      hovered: "#c4b5fd"
    },
    edgeColorTokens: {
      default: "#6b7280",
      selected: "#8b5cf6",
      hovered: "#d8b4fe"
    },
    labelColorTokens: {
      default: "#e5e7eb",
      selected: "#f3f4f6",
      hovered: "#ffffff"
    },
    nodeSizeMultipliers: {
      default: 1.0,
      selected: 1.3,
      hovered: 1.2
    },
    edgeSizeTokens: {
      default: 1.0,
      selected: 2.0,
      hovered: 4.0
    },
    labelFontSizeTokens: {
      node: 12,
      edge: 10
    },
    labelTruncationTokens: {
      maxEdgeLabelLength: 20
    }
  }
}
```

### Deep Space
```typescript
{
  id: "deep-space",
  name: "Deep Space",
  description: "Dark space theme",
  isBuiltIn: true,
  tokens: {
    // Dark blue/purple color scheme
  }
}
```

### Cyberpunk
```typescript
{
  id: "cyberpunk",
  name: "Cyberpunk",
  description: "Neon cyberpunk theme",
  isBuiltIn: true,
  tokens: {
    // Neon pink/cyan color scheme
  }
}
```

### Minimal
```typescript
{
  id: "minimal",
  name: "Minimal",
  description: "Minimal black and white theme",
  isBuiltIn: true,
  tokens: {
    // Grayscale color scheme
  }
}
```

### High Contrast
```typescript
{
  id: "high-contrast",
  name: "High Contrast",
  description: "High contrast for accessibility",
  isBuiltIn: true,
  tokens: {
    // High contrast color scheme
  }
}
```

## Custom Presets

Custom presets are user-created and stored in local storage.

### Creation
- User modifies token values
- User clicks "Save as Custom Theme"
- System prompts for name
- System generates unique ID
- System saves to custom presets

### Renaming
- User selects custom preset
- User clicks "Rename"
- System prompts for new name
- System updates preset

### Deletion
- User selects custom preset
- User clicks "Delete"
- System confirms deletion
- System removes from custom presets

### Export
- User selects custom preset
- User clicks "Export"
- System exports as JSON
- User saves file

### Import
- User clicks "Import"
- User selects JSON file
- System validates preset structure
- System adds to custom presets

## Token Value Ranges

### Colors
- Format: Hex color string (e.g., "#8b5cf6")
- Must be valid CSS color

### Sizes
- Node size multipliers: 0.5 to 3.0
- Edge sizes: 0.5 to 5.0

### Font Sizes
- Node label font size: 8 to 24
- Edge label font size: 6 to 18

### Truncation
- Max edge label length: 10 to 50

## Validation

### Preset Validation
- ID must be unique
- Name must be non-empty
- Tokens must match GraphVisualTokens interface
- Color values must be valid
- Size values must be in range

### Import Validation
- JSON must be valid
- Structure must match ThemePreset interface
- Tokens must be valid
- Built-in presets cannot be imported

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
