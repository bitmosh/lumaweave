# Backend / Frontend Wiring v0

## TypeScript Handleset Scaffold

A machine-readable TypeScript handleset registry is available at:
- `src/control-plane/handles/handleset.registry.ts`

This registry contains all handles with their runtime bindings. The TypeScript scaffold does not yet drive UI - SettingsPanel still uses `settings.registry.ts`. The handleset registry is a machine-readable documentation/scaffold layer for now.

**Theme System Phase 1A Update:** Built-in theme preset dropdown is now implemented in AppShell.tsx top bar (appearance.theme and theme.presetDropdown are active). Custom theme save/rename remains planned.

## Overview from settings schema to UI renderer.

## Architecture Overview

```
settings.schema.ts (TypeScript interface)
    ↓
settings.defaults.ts (default values)
    ↓
settings.registry.ts (UI control definitions)
    ↓
SettingsPanel.tsx (UI rendering)
    ↓
settings.store.ts (Zustand state management)
    ↓
AppShell.tsx (prop passing)
    ↓
SigmaGraphView.tsx (renderer consumption)
```

## Data Flow Details

### 1. Schema Definition (settings.schema.ts)

**File:** `src/control-plane/settings/settings.schema.ts`

Defines the TypeScript interface for all settings:

```typescript
export interface StarmapSettings {
  version: number;
  general: { ... };
  appearance: { theme, accentIntensity, panelTransparency, glitterEnabled, reduceMotion, starfieldEnabled };
  graphView: { defaultRenderer, defaultLayout, showArrows, showIsolatedNodes, showLowConfidenceEdges, nodeSelectionStage, hoverNodeColor, hoverLabelColor, selectedNodeColor, defaultNodeColor, selectedEdgeColor };
  physics: { nodeSize, linkThickness, linkDistance, repelForce, centerForce, communityGravity, curveAmount, animationSoftness };
  labels: { nodeLabelMode, edgeLabelMode, maxEdgeLabelLength, showLabelsOnHover, zoomLabelThreshold, edgeLabelFontSize, nodeLabelFontSize, hoverLabelColor };
  evidence: { showSourceSnippets, snippetLineCount, showRawArtifactRefs, minimumConfidence };
  sourceLinking: { editorScheme, sourceRoot, openBehavior };
  performance: { qualityPreset, particleCap, maxVisibleLabels, largeGraphModeThreshold };
  developer: { showDebugPanel, showFps, logLevel };
}
```

### 2. Default Values (settings.defaults.ts)

**File:** `src/control-plane/settings/settings.defaults.ts`

Provides default values for all schema fields:

```typescript
export const defaultSettings: StarmapSettings = {
  version: 1,
  general: { startupProjectId: null, autosave: true, openLastProjectOnStartup: true },
  appearance: { theme: "solar-plasma", accentIntensity: 1, panelTransparency: 0.82, glitterEnabled: true, reduceMotion: false, starfieldEnabled: true },
  physics: { nodeSize: 1, linkThickness: 1, linkDistance: 120, repelForce: 100, centerForce: 40, communityGravity: 80, curveAmount: 45, animationSoftness: 60 },
  labels: { nodeLabelMode: "selected-neighborhood", edgeLabelMode: "selected-neighborhood", maxEdgeLabelLength: 48, showLabelsOnHover: true, zoomLabelThreshold: 1.15, edgeLabelFontSize: 13, nodeLabelFontSize: 13, hoverLabelColor: "#e0f2fe" },
  // ... other categories
};
```

### 3. UI Registry (settings.registry.ts)

**File:** `src/control-plane/settings/settings.registry.ts`

Defines UI controls for settings that should be user-visible:

```typescript
export type SettingControl =
  | { type: "boolean"; path: string; label: string; description?: string; category: string }
  | { type: "range"; path: string; label: string; description?: string; category: string; min: number; max: number; step: number }
  | { type: "select"; path: string; label: string; description?: string; category: string; options: Array<{ value: string; label: string }> }
  | { type: "text"; path: string; label: string; description?: string; category: string };

export const settingsRegistry: SettingControl[] = [
  // Only settings that should be visible in UI
  { type: "select", category: "Appearance", path: "appearance.theme", label: "Theme", options: [...] },
  { type: "boolean", category: "Appearance", path: "appearance.glitterEnabled", label: "Enable Glitter", description: "..." },
  { type: "range", category: "Physics", path: "physics.nodeSize", label: "Node Size", min: 0.25, max: 4, step: 0.05 },
  // ... more controls
];
```

**Note:** Not all schema fields are in the registry. Many fields (evidence, sourceLinking, performance, developer) are defined in schema but have no registry entry, meaning no UI control exists.

### 4. Settings Panel (SettingsPanel.tsx)

**File:** `src/control-plane/settings/SettingsPanel.tsx`

Renders UI controls from registry:

```typescript
export function SettingsPanel() {
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const categories = Array.from(new Set(settingsRegistry.map((setting) => setting.category)));

  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <section key={category}>
          <h3>{category}</h3>
          {settingsRegistry
            .filter((setting) => setting.category === category)
            .map((setting) => {
              const value = getNestedValue(settings, setting.path);
              // Render based on setting.type (boolean, range, select, text)
              if (setting.type === "boolean") return <checkbox />;
              if (setting.type === "range") return <input type="range" />;
              if (setting.type === "select") return <select />;
              if (setting.type === "text") return <input type="text" />;
            })}
        </section>
      ))}
    </div>
  );
}
```

### 5. State Management (settings.store.ts)

**File:** `src/control-plane/settings/settings.store.ts`

Zustand store for runtime settings state:

```typescript
interface SettingsState {
  settings: StarmapSettings;
  setSetting: (path: string, value: any) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  setSetting: (path, value) => set((state) => {
    const newSettings = { ...state.settings };
    setNestedValue(newSettings, path, value);
    return { settings: newSettings };
  }),
}));
```

### 6. AppShell Prop Passing (AppShell.tsx)

**File:** `src/app/AppShell.tsx`

Passes settings to SigmaGraphView as props:

```typescript
export function AppShell() {
  const settings = useSettingsStore((state) => state.settings);
  const nodeSelectionStage = Number(settings.graphView.nodeSelectionStage) as 1 | 2 | 3;

  return (
    <SigmaGraphView
      nodes={summary.normalizedNodes}
      edges={summary.normalizedEdges}
      nodeSize={settings.physics.nodeSize}
      linkDistance={settings.physics.linkDistance}
      repelForce={settings.physics.repelForce}
      selectedNodeId={selectedNodeId}
      selectedEdgeId={selectedEdgeId}
      nodeSelectionStage={nodeSelectionStage}
      nodeLabelMode={settings.labels.nodeLabelMode}
      edgeLabelMode={settings.labels.edgeLabelMode}
      maxEdgeLabelLength={settings.labels.maxEdgeLabelLength}
      showLabelsOnHover={settings.labels.showLabelsOnHover}
      zoomLabelThreshold={settings.labels.zoomLabelThreshold}
      edgeLabelFontSize={settings.labels.edgeLabelFontSize}
      nodeLabelFontSize={settings.labels.nodeLabelFontSize}
      hoverNodeColor={settings.graphView.hoverNodeColor}
      onSelectNode={...}
      onSelectEdge={...}
      onClearSelection={...}
    />
  );
}
```

**Note:** Only settings used by SigmaGraphView are passed. Appearance settings (theme, glitter) are used elsewhere in AppShell.

### 7. Renderer Consumption (SigmaGraphView.tsx)

**File:** `src/graph/renderers/sigma2d/SigmaGraphView.tsx`

Consumes props and applies to Sigma renderer:

```typescript
export function SigmaGraphView({
  nodes,
  edges,
  nodeSize,
  linkDistance,
  repelForce,
  nodeLabelMode,
  edgeLabelMode,
  maxEdgeLabelLength,
  showLabelsOnHover,
  edgeLabelFontSize,
  nodeLabelFontSize,
  hoverNodeColor,
  // ...
}: SigmaGraphViewProps) {
  // Physics settings passed to buildGraphologyGraph
  const settings: LayoutSettings = { nodeSize, linkDistance, repelForce };

  // Label settings used in label policy
  const labelOptions: LegacyLabelPolicyOptions = {
    maxEdgeLabelLength,
    showLabelsOnHover,
    hoverLabelColor: "#0f172a",
  };

  // Style options for policy
  const styleOptions: StylePolicyOptions = {
    hoverNodeColor,
    edgeLabelFontSize,
  };

  // Live update effects for font sizes
  useEffect(() => {
    sigma.setSetting("edgeLabelSize", edgeLabelFontSize);
    sigma.refresh();
  }, [edgeLabelFontSize]);

  useEffect(() => {
    sigma.setSetting("labelSize", nodeLabelFontSize);
    sigma.refresh();
  }, [nodeLabelFontSize]);

  // Sigma config uses font sizes and visual tokens
  const sigma = new Sigma(graph, containerRef.current, {
    labelSize: nodeLabelFontSize,
    edgeLabelSize: edgeLabelFontSize,
    labelColor: { attribute: "labelColor", color: graphVisualTokens.nodeLabelColor.default },
    edgeLabelColor: { color: graphVisualTokens.edgeLabelColor.default },
    // ...
  });
}
```

## Key Observations

### Active Wiring Paths

1. **Physics controls:** schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView → buildGraphologyGraph
2. **Label modes:** schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView → applyNodeLabelPolicy/applyEdgeLabelPolicy
3. **Label font sizes:** schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView → sigma.setSetting (live update)
4. **Hover node color:** schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView → graphStylePolicy
5. **Neighborhood depth:** schema → defaults → registry → SettingsPanel → store → AppShell → SigmaGraphView → graphStylePolicy

### Missing Wiring

1. **Appearance settings:** theme and glitterEnabled are used in AppShell top bar directly, not passed to SigmaGraphView
2. **Planned physics controls:** centerForce, communityGravity, curveAmount, animationSoftness have no wiring to renderer
3. **Planned color controls:** selectedNodeColor, defaultNodeColor, selectedEdgeColor have no wiring to visual tokens
4. **Evidence/SourceLinking/Performance/Developer:** No registry entries, no UI controls, no wiring

### Duplicate Settings

- `labels.hoverLabelColor` and `graphView.hoverLabelColor` both exist with same default and description
