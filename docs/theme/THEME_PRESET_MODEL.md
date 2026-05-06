---
id: model.theme.preset
title: Theme Preset Model
type: manual
status: accepted
version: v73c
domain: theme
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
governs:
  - src/themes/themePresets.ts
  - src/themes/themeTokens.ts
tags: [theme, preset, model, tokens, graph, visual, accepted]
---

# Theme Preset Model

---

## ThemePreset Interface

```typescript
interface ThemePreset {
  id: string;           // "solar-plasma"
  name: string;         // "Solar Plasma"
  description?: string;
  isBuiltIn: boolean;   // true = cannot be deleted
  tokens: GraphVisualTokens;
  createdAt: number;
  updatedAt: number;
}
```

---

## GraphVisualTokens

```typescript
interface GraphVisualTokens {
  nodeColorTokens: {
    default: string;   // hex
    selected: string;
    hovered: string;
  };
  edgeColorTokens: {
    default: string;
    selected: string;
    hovered: string;
  };
  labelColorTokens: {
    default: string;
    selected: string;
    hovered: string;
  };
  nodeSizeMultipliers: {
    default: number;   // 1.0
    selected: number;  // 1.3
    hovered: number;   // 1.2
  };
  edgeSizeTokens: {
    default: number;   // 1.0
    selected: number;  // 2.0
    hovered: number;   // 4.0
  };
  labelFontSizeTokens: {
    node: number;      // 12
    edge: number;      // 10
  };
  labelTruncationTokens: {
    maxEdgeLabelLength: number; // 20
  };
}
```

---

## Built-in Presets (4 current)

### Solar Plasma (default)
```
id: "solar-plasma"
nodeColorTokens.default: "#8b5cf6"  (purple)
nodeColorTokens.selected: "#a78bfa"
nodeColorTokens.hovered: "#c4b5fd"
edgeColorTokens.default: "#6b7280"
labelColorTokens.default: "#e5e7eb"
```

### Obsidian Aurora
```
id: "obsidian-aurora"
Dark blue/purple color scheme with aurora accents.
```

### Haunted Observatory
```
id: "haunted-observatory"
Eerie dark blues, ghostly highlights.
IMPORTANT: Graph nodes are GREEN in this preset (historic defect fix).
```

### Glitter Goblin
```
id: "glitter-goblin"
Warm, sparkle-heavy palette. Pink/gold tones.
```

---

## ThemeState

```typescript
interface ThemeState {
  activeThemePresetId: string;       // "solar-plasma"
  customThemePresets: ThemePreset[]; // user-created
  builtInThemePresets: ThemePreset[]; // read-only
}
```

---

## Token Value Constraints

```
Colors:          Valid CSS hex string (e.g. "#8b5cf6")
Node multipliers: 0.5 – 3.0
Edge sizes:       0.5 – 5.0
Node label size:  8 – 24 px
Edge label size:  6 – 18 px
Max edge label:   10 – 50 chars
```

---

## Custom Preset Lifecycle (Planned)

```
Create:  User modifies tokens → Save As → name → unique ID generated → added to customPresets
Rename:  Select custom preset → Rename → update name
Delete:  Select custom preset → Delete → confirm → removed (built-ins cannot be deleted)
Export:  Select any preset → Export → JSON file with version + metadata
Import:  Import button → select JSON → validate structure → add to customPresets
```

Not yet implemented. Requires Phase 2 of theme system.
