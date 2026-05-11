 src
├──  accessibility
│  └──  motionSafetyRegistry.ts
├──  app
│  └──  AppShell.tsx
├──  assets
│  └── 󰕙 react.svg
├──  audio
│  ├──  audioSourceRegistry.ts
│  ├──  musicReactiveMappingRegistry.ts
│  └──  syntheticAudioSignal.ts
├──  control-plane
│  ├──  command-deck
│  │  ├──  CommandDeckPanel.tsx
│  │  └──  CommandDeckShell.tsx
│  ├──  commands
│  │  ├──  command-registry.ts
│  │  ├──  command.types.ts
│  │  └──  CommandPalette.tsx
│  ├──  contracts
│  │  ├──  controlSurfaceContract.registry.ts
│  │  ├──  controlSurfaceContract.types.ts
│  │  ├──  controlSurfaceContract.utils.ts
│  │  └──  index.ts
│  ├──  features
│  │  ├──  feature-flags.ts
│  │  └──  feature-registry.ts
│  ├──  graph
│  │  └──  GraphVisualInventoryPanel.tsx
│  ├──  handles
│  │  ├──  handleset.registry.ts
│  │  ├──  handleset.types.ts
│  │  ├──  handleset.utils.ts
│  │  └──  index.ts
│  ├──  modes
│  │  └──  controlPlaneModeRegistry.ts
│  ├──  panels
│  │  ├──  CollapsiblePanel.tsx
│  │  ├──  CollapsibleSection.tsx
│  │  ├──  ControlDock.tsx
│  │  ├──  FloatingTile.tsx
│  │  ├──  InspectorPanel.tsx
│  │  ├──  LeftTabPanel.tsx
│  │  ├──  panel.types.ts
│  │  ├──  ThemeMappingPanel.tsx
│  │  ├──  Tile.tsx
│  │  ├──  tile.types.ts
│  │  ├──  TileableSection.tsx
│  │  ├──  TileLayer.tsx
│  │  ├──  TileProvider.tsx
│  │  ├──  tileSectionRegistry.ts
│  │  └──  tileUtils.ts
│  ├──  perspectives
│  │  └──  perspectiveRegistry.ts
│  ├──  presets
│  ├──  qa
│  │  ├──  advisory-registry.ts
│  │  ├──  qa-registry.ts
│  │  ├──  qa.store.ts
│  │  ├──  qa.types.ts
│  │  └──  QaPanel.tsx
│  ├──  settings
│  │  ├──  __tests__
│  │  ├──  settings.defaults.ts
│  │  ├──  settings.migrations.ts
│  │  ├──  settings.registry.ts
│  │  ├──  settings.schema.ts
│  │  ├──  settings.store.ts
│  │  └──  SettingsPanel.tsx
│  └──  system-index
│     ├──  SystemIndexPanel.tsx
│     └──  systemIndexRegistry.ts
├──  fixtures
│  ├──  self-graph-adapter.ts
│  ├──  self-graph-generated.json
│  └──  types.ts
├──  graph
│  ├──  edges
│  │  └──  PlasmaOverlayEdge.tsx
│  ├──  ingest
│  │  ├──  loadGraphifySource.ts
│  │  └──  useGraphSourceSummary.ts
│  ├──  normalize
│  │  └──  normalizeGraphifyGraph.ts
│  ├──  overlay
│  │  ├──  __tests__
│  │  ├──  BookmarkLayer.tsx
│  │  ├──  bookmarkRegistry.ts
│  │  ├──  cameraController.ts
│  │  ├──  CameraHUD.tsx
│  │  ├──  ClickHalo.tsx
│  │  ├──  FloatingBookmark.tsx
│  │  ├──  GlitterField.tsx
│  │  ├──  Minimap.tsx
│  │  └──  SolarBackdrop.tsx
│  ├──  renderers
│  │  └──  sigma2d
│  │     ├──  buildGraphologyGraph.ts
│  │     ├──  labelPolicy.ts
│  │     ├──  NodeSphereProgram.ts
│  │     ├──  selectionNeighborhood.ts
│  │     └──  SigmaGraphView.tsx
│  ├──  schema
│  │  └──  graph.types.ts
│  ├──  visual
│  │  ├──  applyGraphLabelPolicyToGraphology.ts
│  │  ├──  dimmingPolicy.ts
│  │  ├──  graphLabelPolicy.ts
│  │  ├──  graphStylePolicy.ts
│  │  ├──  graphVisualTokens.ts
│  │  └──  graphVisualTypes.ts
│  ├──  graphViewElementRegistry.ts
│  └──  graphVisualThemeMappingRegistry.ts
├──  renderers
├──  source-adapter
│  ├──  SourceAdapterPanel.tsx
│  └──  sourceAdapterRegistry.ts
├──  styles
│  └──  lumaweave-visual-handles.css
├──  themes
│  ├──  applyTheme.ts
│  ├──  assetBank.types.ts
│  ├──  assetRegistry.ts
│  ├──  index.ts
│  ├──  inspectorSpokeRegistry.ts
│  ├──  registryContract.types.ts
│  ├──  theme.types.ts
│  ├──  themeOverrideStorage.ts
│  ├──  themePresets.ts
│  ├──  themeTargetHeuristics.ts
│  ├──  ThemeTargetInspectorOverlay.tsx
│  ├──  themeTargetInspectorTypes.ts
│  ├──  themeTargetRegistry.ts
│  ├──  themeTokenGovernance.ts
│  ├──  themeTokenPaths.ts
│  ├──  themeTokens.ts
│  ├──  tokenComponents.ts
│  ├──  tokenPrimitives.ts
│  └──  tokenSemantics.ts
├──  ui
├──  App.css
├──  App.tsx
├──  main.tsx
└──  vite-env.d.ts
