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
│  ├──  inspector
│  │  ├──  spokes
│  │  │  ├──  ApplyTab.tsx
│  │  │  ├──  ColorTab.tsx
│  │  │  ├──  colorTabUtils.ts
│  │  │  ├──  GeometryTab.tsx
│  │  │  ├──  HistoryTab.tsx
│  │  │  ├──  IdeTab.tsx
│  │  │  ├──  PlaceholderTab.tsx
│  │  │  ├──  registerApplySpoke.ts
│  │  │  ├──  registerCodeSpoke.ts
│  │  │  ├──  registerColorSpoke.ts
│  │  │  ├──  registerGeometrySpoke.ts
│  │  │  ├──  registerHistorySpoke.ts
│  │  │  ├──  registerIdeSpoke.ts
│  │  │  ├──  registerLayoutSpoke.ts
│  │  │  ├──  registerMotionSpoke.ts
│  │  │  └──  registerTypeSpoke.ts
│  │  ├──  styles
│  │  │  ├──  color-tab.css
│  │  │  ├──  geometry-tab.css
│  │  │  └──  placeholder-tab.css
│  │  ├──  inspector.types.ts
│  │  ├──  InspectorMiniGraph.tsx
│  │  ├──  MiniGraphRenderer.tsx
│  │  ├──  nodeProgramThumbnails.ts
│  │  ├──  RootNode.tsx
│  │  └──  SpokeNode.tsx
│  ├──  modes
│  │  └──  controlPlaneModeRegistry.ts
│  ├──  panels
│  │  ├──  AppearanceSectionContent.tsx
│  │  ├──  CollapsiblePanel.tsx
│  │  ├──  CollapsibleSection.tsx
│  │  ├──  ControlDock.tsx
│  │  ├──  FloatingTile.tsx
│  │  ├──  HelixTwistSliders.tsx
│  │  ├──  InspectorPanel.tsx
│  │  ├──  LabelsSectionContent.tsx
│  │  ├──  LeftTabPanel.tsx
│  │  ├──  panel.types.ts
│  │  ├──  PhysicsSectionContent.tsx
│  │  ├──  ThemeMappingPanel.tsx
│  │  ├──  Tile.tsx
│  │  ├──  tile.types.ts
│  │  ├──  TiledOutIndicator.tsx
│  │  ├──  TileLayer.tsx
│  │  ├──  TileProvider.tsx
│  │  ├──  tileSectionRegistry.ts
│  │  ├──  tileUtils.ts
│  │  ├──  typographyPlayground.css
│  │  └──  TypographyPlaygroundSection.tsx
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
│  ├──  system-index
│  │  ├──  SystemIndexPanel.tsx
│  │  └──  systemIndexRegistry.ts
│  └──  topbar
│     ├──  HexLogo.tsx
│     ├──  StatusCluster.tsx
│     ├──  StatusPill.tsx
│     ├──  topbar.css
│     ├──  Topbar.tsx
│     └──  WordmarkBlock.tsx
├──  fixtures
│  ├──  GRAPH_REPORT.md
│  ├──  self-graph-adapter.ts
│  ├──  self-graph-generated.json
│  ├──  self-graph-manifest.json
│  └──  types.ts
├──  graph
│  ├──  edgePrograms
│  │  ├──  shaders
│  │  │  ├──  plasma.frag.glsl
│  │  │  └──  plasma.vert.glsl
│  │  └──  PlasmaEdgeProgram.ts
│  ├──  edges
│  │  ├──  edgeStyleRegistry.ts
│  │  └──  v91-Edge_Plasma_Shaders.html
│  ├──  ingest
│  │  ├──  loadGraphifySource.ts
│  │  └──  useGraphSourceSummary.ts
│  ├──  nodePrograms
│  │  ├──  shaders
│  │  │  ├──  crystal.frag.glsl
│  │  │  ├──  glass-sphere.frag.glsl
│  │  │  ├──  orb.frag.glsl
│  │  │  ├──  pip.frag.glsl
│  │  │  └──  sun.frag.glsl
│  │  ├──  CrystalProgram.ts
│  │  ├──  GlassSphereProgram.ts
│  │  ├──  nodeProgramRegistry.ts
│  │  ├──  OrbProgram.ts
│  │  ├──  PipProgram.ts
│  │  ├──  SunProgram.ts
│  │  └──  types.ts
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
│  ├──  physics
│  │  └──  physicsDialectRegistry.ts
│  ├──  renderers
│  │  └──  sigma2d
│  │     ├──  buildGraphologyGraph.ts
│  │     ├──  gwellsProbe.ts
│  │     ├──  labelPolicy.ts
│  │     ├──  selectionNeighborhood.ts
│  │     └──  SigmaGraphView.tsx
│  ├──  rendering
│  │  └──  graphRendererInterface.ts
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
├──  lens
│  └──  lensRegistry.ts
├──  motion
│  └──  animationPrimitiveRegistry.ts
├──  physics
│  └──  gwells
│     ├──  seeders
│     │  ├──  parallelSpines.ts
│     │  └──  radialBackbone.ts
│     ├──  dialects.ts
│     ├──  engine.ts
│     ├──  index.ts
│     ├──  interactions.ts
│     ├──  package.json
│     ├──  README.md
│     ├──  seederHelpers.ts
│     ├──  seedFunctions.ts
│     ├──  types.ts
│     └──  wellTypes.ts
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
│  ├──  colorInterpolation.ts
│  ├──  colorSuggestionEngine.ts
│  ├──  defineTheme.ts
│  ├──  fontAxisRegistry.ts
│  ├──  index.ts
│  ├──  inspectorSpokeRegistry.ts
│  ├──  paletteGeneration.ts
│  ├──  paletteRuntime.ts
│  ├──  provenance-manifest.json
│  ├──  provenanceRegistry.ts
│  ├──  registryContract.types.ts
│  ├──  theme.types.ts
│  ├──  themeAccessibilityProfile.ts
│  ├──  themeCrossfade.ts
│  ├──  themeHash.ts
│  ├──  themeLineage.ts
│  ├──  themeOverrideStorage.ts
│  ├──  themePresets.ts
│  ├──  themeSelectableColors.ts
│  ├──  themeTargetHeuristics.ts
│  ├──  ThemeTargetInspectorOverlay.tsx
│  ├──  themeTargetInspectorTypes.ts
│  ├──  themeTargetRegistry.ts
│  ├──  themeThumbnail.ts
│  ├──  themeTokenGovernance.ts
│  ├──  themeTokenPaths.ts
│  ├──  themeTokens.ts
│  ├──  tokenComponents.ts
│  ├──  tokenPrimitives.ts
│  ├──  tokenSemantics.ts
│  ├──  typographyRegistry.ts
│  ├──  useResolvedTargetColor.ts
│  └──  wcagContrast.ts
├──  ui
├──  App.css
├──  App.tsx
├──  main.tsx
└──  vite-env.d.ts
