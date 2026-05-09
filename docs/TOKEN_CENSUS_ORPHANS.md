# Token Census: ORPHANS

Patterns that look like token paths but are not declared.

| Pattern | Location | Context |
|---|---|---|
| accent.secondary | src/themes/themeTokenPaths.ts:60, src/themes/themeTokenPaths.ts:128 | | "accent.secondary"; "accent.secondary", |
| agentChat.enabled | src/control-plane/handles/handleset.registry.ts:456 | handle: "agentChat.enabled", |
| api.endpoint | src/source-adapter/sourceAdapterRegistry.ts:243 | "endpoint": "api.endpoint", |
| api.method | src/source-adapter/sourceAdapterRegistry.ts:245 | "method": "api.method", |
| api.schema | src/source-adapter/sourceAdapterRegistry.ts:244 | "schema": "api.schema", |
| app.shell | src/app/AppShell.tsx:334, src/themes/themeTargetRegistry.ts:36 | data-lw-theme-target="app.shell"; themeTargetId: "app.shell", |
| app.surface | src/themes/themeTokenPaths.ts:57, src/themes/themeTokenPaths.ts:125 | | "app.surface"; "app.surface", |
| appearance.glitterEnabled | src/app/AppShell.tsx:391, src/control-plane/contracts/controlSurfaceContract.registry.ts:51, src/control-plane/handles/handleset.registry.ts:192 | onChange={(e) => setSetting("appearance.glitterEnabled", e.currentTarget.checked)}; settingsKey: "appearance.glitterEnabled",; handle: "appearance.glitterEnabled", |
| appearance.reduceMotion | src/app/AppShell.tsx:407, src/control-plane/contracts/controlSurfaceContract.registry.ts:79 | onChange={(e) => setSetting("appearance.reduceMotion", e.currentTarget.checked)}; settingsKey: "appearance.reduceMotion", |
| appearance.theme | src/app/AppShell.tsx:364, src/control-plane/contracts/controlSurfaceContract.registry.ts:23, src/control-plane/handles/handleset.registry.ts:172 | onChange={(e) => setSetting("appearance.theme", e.target.value)}; settingsKey: "appearance.theme",; handle: "appearance.theme", |
| audio.source.registry | src/control-plane/system-index/systemIndexRegistry.ts:205, src/control-plane/system-index/systemIndexRegistry.ts:342 | "audio.source.registry",; id: "audio.source.registry", |
| calm.state.indicator | src/audio/musicReactiveMappingRegistry.ts:31, src/audio/musicReactiveMappingRegistry.ts:327 | | "calm.state.indicator";; graphTarget: "calm.state.indicator", |
| code.commit | src/source-adapter/sourceAdapterRegistry.ts:137 | "commit": "code.commit", |
| code.file | src/fixtures/self-graph-adapter.ts:32, src/source-adapter/sourceAdapterRegistry.ts:134 | "code.file": 8,; "file": "code.file", |
| code.function | src/source-adapter/sourceAdapterRegistry.ts:135 | "function": "code.function", |
| code.license | src/source-adapter/sourceAdapterRegistry.ts:317 | "license": "code.license", |
| code.package | src/source-adapter/sourceAdapterRegistry.ts:315 | "package": "code.package", |
| code.script | src/fixtures/self-graph-adapter.ts:35 | "code.script": 6, |
| code.symbol | src/source-adapter/sourceAdapterRegistry.ts:136 | "class": "code.symbol", |
| code.system | src/fixtures/self-graph-adapter.ts:30 | "code.system": 18, |
| code.test | src/fixtures/self-graph-adapter.ts:34 | "code.test": 6, |
| code.version | src/source-adapter/sourceAdapterRegistry.ts:316 | "version": "code.version", |
| contract.trace.matrix | src/control-plane/system-index/systemIndexRegistry.ts:115, src/control-plane/system-index/systemIndexRegistry.ts:120, src/control-plane/system-index/systemIndexRegistry.ts:153 | relatedSystems: ["contract.trace.matrix", "contract.trace.validator"],; id: "contract.trace.matrix",; relatedSystems: ["contract.trace.matrix"], |
| contract.trace.validator | src/control-plane/system-index/systemIndexRegistry.ts:115, src/control-plane/system-index/systemIndexRegistry.ts:131, src/control-plane/system-index/systemIndexRegistry.ts:134, src/control-plane/system-index/systemIndexRegistry.ts:139 | relatedSystems: ["contract.trace.matrix", "contract.trace.validator"],; validators: ["contract.trace.validator"],; relatedSystems: ["contract.trace.validator"],; id: "contract.trace.validator", |
| control.active | src/themes/themeTokenPaths.ts:63, src/themes/themeTokenPaths.ts:131 | | "control.active"; "control.active", |
| control.background | src/themes/themeTokenPaths.ts:61, src/themes/themeTokenPaths.ts:129 | | "control.background"; "control.background", |
| control.border | src/themes/themeTokenPaths.ts:62, src/themes/themeTokenPaths.ts:130 | | "control.border"; "control.border", |
| db.column | src/source-adapter/sourceAdapterRegistry.ts:280 | "column": "db.column", |
| db.constraint | src/source-adapter/sourceAdapterRegistry.ts:282 | "constraint": "db.constraint", |
| db.index | src/source-adapter/sourceAdapterRegistry.ts:281 | "index": "db.index", |
| db.table | src/source-adapter/sourceAdapterRegistry.ts:279 | "table": "db.table", |
| doc.contract | src/source-adapter/sourceAdapterRegistry.ts:99 | "markdown-file": "doc.contract", |
| doc.metadata | src/source-adapter/sourceAdapterRegistry.ts:100 | "yaml-frontmatter": "doc.metadata", |
| docs.file | src/fixtures/self-graph-adapter.ts:33 | "docs.file": 8, |
| docs.folder | src/fixtures/self-graph-adapter.ts:31 | "docs.folder": 12, |
| graph.camera.breathing | src/audio/musicReactiveMappingRegistry.ts:25 | | "graph.camera.breathing" |
| graph.cluster.aura | src/audio/musicReactiveMappingRegistry.ts:22, src/audio/musicReactiveMappingRegistry.ts:219 | | "graph.cluster.aura"; graphTarget: "graph.cluster.aura", |
| graph.controls | src/graph/graphViewElementRegistry.ts:113 | id: "graph.controls", |
| graph.depth.architecture | src/audio/musicReactiveMappingRegistry.ts:27, src/audio/musicReactiveMappingRegistry.ts:266 | | "graph.depth.architecture"; graphTarget: "graph.depth.architecture", |
| graph.depth.leaf | src/audio/musicReactiveMappingRegistry.ts:29, src/audio/musicReactiveMappingRegistry.ts:296 | | "graph.depth.leaf"; graphTarget: "graph.depth.leaf", |
| graph.depth.module | src/audio/musicReactiveMappingRegistry.ts:28, src/audio/musicReactiveMappingRegistry.ts:281 | | "graph.depth.module"; graphTarget: "graph.depth.module", |
| graph.edge.current | src/audio/musicReactiveMappingRegistry.ts:21, src/audio/musicReactiveMappingRegistry.ts:173 | | "graph.edge.current"; graphTarget: "graph.edge.current", |
| graph.edge.default | src/themes/themeTargetRegistry.ts:156 | themeTargetId: "graph.edge.default", |
| graph.edge.selected | src/themes/themeTargetRegistry.ts:164 | themeTargetId: "graph.edge.selected", |
| graph.edgeLabelFontSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:217 | id: "graph.edgeLabelFontSize", |
| graph.edgeLabelMode | src/control-plane/contracts/controlSurfaceContract.registry.ts:133 | id: "graph.edgeLabelMode", |
| graph.edges | src/graph/graphViewElementRegistry.ts:73, src/graph/graphVisualThemeMappingRegistry.ts:109, src/graph/graphVisualThemeMappingRegistry.ts:117, src/graph/graphVisualThemeMappingRegistry.ts:125, src/graph/graphVisualThemeMappingRegistry.ts:133 | id: "graph.edges",; graphElementId: "graph.edges",; graphElementId: "graph.edges",; graphElementId: "graph.edges",; graphElementId: "graph.edges", |
| graph.fit | src/control-plane/commands/command-registry.ts:12 | id: "graph.fit", |
| graph.frame | src/app/AppShell.tsx:793, src/graph/graphViewElementRegistry.ts:41, src/graph/graphVisualThemeMappingRegistry.ts:53, src/graph/graphVisualThemeMappingRegistry.ts:61, src/themes/themeTargetRegistry.ts:126 | data-lw-theme-target="graph.frame"; id: "graph.frame",; graphElementId: "graph.frame",; graphElementId: "graph.frame",; themeTargetId: "graph.frame", |
| graph.frame.border | src/audio/musicReactiveMappingRegistry.ts:19 | | "graph.frame.border" |
| graph.hoverNodeColor | src/control-plane/contracts/controlSurfaceContract.registry.ts:299 | id: "graph.hoverNodeColor", |
| graph.hud | src/graph/graphViewElementRegistry.ts:103 | id: "graph.hud", |
| graph.label.glow | src/audio/musicReactiveMappingRegistry.ts:23, src/audio/musicReactiveMappingRegistry.ts:204 | | "graph.label.glow"; graphTarget: "graph.label.glow", |
| graph.labels | src/graph/graphViewElementRegistry.ts:83, src/graph/graphVisualThemeMappingRegistry.ts:141, src/graph/graphVisualThemeMappingRegistry.ts:149 | id: "graph.labels",; graphElementId: "graph.labels",; graphElementId: "graph.labels", |
| graph.linkDistance | src/control-plane/contracts/controlSurfaceContract.registry.ts:354 | id: "graph.linkDistance", |
| graph.links | src/graph/normalize/normalizeGraphifyGraph.ts:252, src/graph/normalize/normalizeGraphifyGraph.ts:336 | edgePath: "graph.links",; edgePath: "graph.links", |
| graph.maxEdgeLabelLength | src/control-plane/contracts/controlSurfaceContract.registry.ts:245 | id: "graph.maxEdgeLabelLength", |
| graph.minimap | src/graph/graphViewElementRegistry.ts:135 | id: "graph.minimap", |
| graph.neighborhoodDepth | src/control-plane/contracts/controlSurfaceContract.registry.ts:272 | id: "graph.neighborhoodDepth", |
| graph.node.default | src/themes/themeTargetRegistry.ts:139 | themeTargetId: "graph.node.default", |
| graph.node.halo | src/audio/musicReactiveMappingRegistry.ts:20, src/audio/musicReactiveMappingRegistry.ts:158 | | "graph.node.halo"; graphTarget: "graph.node.halo", |
| graph.node.selected | src/themes/themeTargetRegistry.ts:148 | themeTargetId: "graph.node.selected", |
| graph.nodeLabelFontSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:189 | id: "graph.nodeLabelFontSize", |
| graph.nodeLabelMode | src/control-plane/contracts/controlSurfaceContract.registry.ts:105 | id: "graph.nodeLabelMode", |
| graph.nodes | src/graph/graphViewElementRegistry.ts:63, src/graph/graphVisualThemeMappingRegistry.ts:77, src/graph/graphVisualThemeMappingRegistry.ts:85, src/graph/graphVisualThemeMappingRegistry.ts:93, src/graph/graphVisualThemeMappingRegistry.ts:101, src/graph/normalize/normalizeGraphifyGraph.ts:251, src/graph/normalize/normalizeGraphifyGraph.ts:335 | id: "graph.nodes",; graphElementId: "graph.nodes",; graphElementId: "graph.nodes",; graphElementId: "graph.nodes",; graphElementId: "graph.nodes",; nodePath: "graph.nodes",; nodePath: "graph.nodes", |
| graph.nodeSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:327 | id: "graph.nodeSize", |
| graph.overlay | src/graph/graphViewElementRegistry.ts:93 | id: "graph.overlay", |
| graph.overlay.particles | src/audio/musicReactiveMappingRegistry.ts:24, src/audio/musicReactiveMappingRegistry.ts:188 | | "graph.overlay.particles"; graphTarget: "graph.overlay.particles", |
| graph.path.highlight | src/audio/musicReactiveMappingRegistry.ts:26, src/audio/musicReactiveMappingRegistry.ts:235, src/audio/musicReactiveMappingRegistry.ts:250 | | "graph.path.highlight"; graphTarget: "graph.path.highlight",; graphTarget: "graph.path.highlight", |
| graph.physics | src/graph/graphViewElementRegistry.ts:124 | id: "graph.physics", |
| graph.repelForce | src/control-plane/contracts/controlSurfaceContract.registry.ts:381 | id: "graph.repelForce", |
| graph.resetView | src/control-plane/commands/command-registry.ts:19 | id: "graph.resetView", |
| graph.runtime.boundary | src/control-plane/system-index/systemIndexRegistry.ts:211 | id: "graph.runtime.boundary", |
| graph.shell.glow | src/audio/musicReactiveMappingRegistry.ts:17, src/audio/musicReactiveMappingRegistry.ts:127 | | "graph.shell.glow"; graphTarget: "graph.shell.glow", |
| graph.shell.pulse | src/audio/musicReactiveMappingRegistry.ts:18, src/audio/musicReactiveMappingRegistry.ts:142 | | "graph.shell.pulse"; graphTarget: "graph.shell.pulse", |
| graph.showLabelsOnHover | src/control-plane/contracts/controlSurfaceContract.registry.ts:161 | id: "graph.showLabelsOnHover", |
| graph.surface | src/graph/graphViewElementRegistry.ts:52, src/graph/graphVisualThemeMappingRegistry.ts:69 | id: "graph.surface",; graphElementId: "graph.surface", |
| graph.theme.mapping.registry | src/control-plane/system-index/systemIndexRegistry.ts:201, src/control-plane/system-index/systemIndexRegistry.ts:230 | "graph.theme.mapping.registry",; id: "graph.theme.mapping.registry", |
| graph.view.element.registry | src/control-plane/system-index/systemIndexRegistry.ts:200 | "graph.view.element.registry", |
| graph.visual.inventory | src/control-plane/system-index/systemIndexRegistry.ts:182 | id: "graph.visual.inventory", |
| graphIntelligence.clusterGravity | src/control-plane/handles/handleset.registry.ts:475 | handle: "graphIntelligence.clusterGravity", |
| graphIntelligence.progressiveDepthSlider | src/control-plane/handles/handleset.registry.ts:494 | handle: "graphIntelligence.progressiveDepthSlider", |
| graphView.hoverNodeColor | src/control-plane/contracts/controlSurfaceContract.registry.ts:303, src/control-plane/handles/handleset.registry.ts:153, src/control-plane/settings/settings.registry.ts:217 | settingsKey: "graphView.hoverNodeColor",; handle: "graphView.hoverNodeColor",; path: "graphView.hoverNodeColor", |
| graphView.neighborhoodDepth | src/control-plane/settings/settings.registry.ts:207 | path: "graphView.neighborhoodDepth", |
| graphView.nodeSelectionStage | src/control-plane/contracts/controlSurfaceContract.registry.ts:276, src/control-plane/handles/handleset.registry.ts:134 | settingsKey: "graphView.nodeSelectionStage",; handle: "graphView.nodeSelectionStage", |
| infra.container | src/source-adapter/sourceAdapterRegistry.ts:352 | "container": "infra.container", |
| infra.role | src/source-adapter/sourceAdapterRegistry.ts:354 | "role": "infra.role", |
| infra.service | src/source-adapter/sourceAdapterRegistry.ts:351 | "service": "infra.service", |
| infra.storage | src/source-adapter/sourceAdapterRegistry.ts:353 | "bucket": "infra.storage", |
| infrastructure.yaml | src/source-adapter/sourceAdapterRegistry.ts:347 | examples: ["main.tf", "infrastructure.yaml"], |
| issue.tracker.epic | src/source-adapter/sourceAdapterRegistry.ts:389 | "epic": "issue.tracker.epic", |
| issue.tracker.issue | src/source-adapter/sourceAdapterRegistry.ts:388 | "issue": "issue.tracker.issue", |
| issue.tracker.milestone | src/source-adapter/sourceAdapterRegistry.ts:390 | "milestone": "issue.tracker.milestone", |
| issue.tracker.owner | src/source-adapter/sourceAdapterRegistry.ts:391 | "owner": "issue.tracker.owner", |
| labels.edgeLabelFontSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:221, src/control-plane/handles/handleset.registry.ts:77, src/control-plane/settings/settings.registry.ts:187 | settingsKey: "labels.edgeLabelFontSize",; handle: "labels.edgeLabelFontSize",; path: "labels.edgeLabelFontSize", |
| labels.edgeLabelMode | src/control-plane/contracts/controlSurfaceContract.registry.ts:137, src/control-plane/handles/handleset.registry.ts:39, src/control-plane/settings/settings.registry.ts:158 | settingsKey: "labels.edgeLabelMode",; handle: "labels.edgeLabelMode",; path: "labels.edgeLabelMode", |
| labels.maxEdgeLabelLength | src/control-plane/contracts/controlSurfaceContract.registry.ts:249, src/control-plane/handles/handleset.registry.ts:96, src/control-plane/settings/settings.registry.ts:171 | settingsKey: "labels.maxEdgeLabelLength",; handle: "labels.maxEdgeLabelLength",; path: "labels.maxEdgeLabelLength", |
| labels.nodeLabelFontSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:193, src/control-plane/handles/handleset.registry.ts:58, src/control-plane/settings/settings.registry.ts:197 | settingsKey: "labels.nodeLabelFontSize",; handle: "labels.nodeLabelFontSize",; path: "labels.nodeLabelFontSize", |
| labels.nodeLabelMode | src/control-plane/contracts/controlSurfaceContract.registry.ts:109, src/control-plane/handles/handleset.registry.ts:20, src/control-plane/handles/handleset.types.ts:58, src/control-plane/settings/settings.registry.ts:146 | settingsKey: "labels.nodeLabelMode",; handle: "labels.nodeLabelMode",; /** Unique handle identifier (e.g., "labels.nodeLabelMode") */; path: "labels.nodeLabelMode", |
| labels.showLabelsOnHover | src/control-plane/contracts/controlSurfaceContract.registry.ts:165, src/control-plane/handles/handleset.registry.ts:115, src/control-plane/settings/settings.registry.ts:180 | settingsKey: "labels.showLabelsOnHover",; handle: "labels.showLabelsOnHover",; path: "labels.showLabelsOnHover", |
| labels.zoomLabelThreshold | src/control-plane/handles/handleset.registry.ts:344 | handle: "labels.zoomLabelThreshold", |
| lumaweave.themeOverrideBundle | src/themes/themeOverrideStorage.ts:204, src/themes/themeOverrideStorage.ts:229 | kind: "lumaweave.themeOverrideBundle";; kind: "lumaweave.themeOverrideBundle", |
| main.tf | src/source-adapter/sourceAdapterRegistry.ts:347 | examples: ["main.tf", "infrastructure.yaml"], |
| markdown.heading | src/source-adapter/sourceAdapterRegistry.ts:208 | "heading": "markdown.heading", |
| markdown.note | src/source-adapter/sourceAdapterRegistry.ts:207 | "note": "markdown.note", |
| markdown.tag | src/source-adapter/sourceAdapterRegistry.ts:209 | "tag": "markdown.tag", |
| missionControl.activeChecklistId | src/control-plane/handles/handleset.registry.ts:363 | handle: "missionControl.activeChecklistId", |
| missionControl.checklistNavigation | src/control-plane/contracts/controlSurfaceContract.registry.ts:438 | id: "missionControl.checklistNavigation", |
| missionControl.copyLastSubmission | src/control-plane/contracts/controlSurfaceContract.registry.ts:552 | id: "missionControl.copyLastSubmission", |
| missionControl.decisionBadge | src/control-plane/contracts/controlSurfaceContract.registry.ts:579 | id: "missionControl.decisionBadge", |
| missionControl.history | src/control-plane/contracts/controlSurfaceContract.registry.ts:608 | id: "missionControl.history", |
| missionControl.lastSubmittedReport | src/control-plane/handles/handleset.registry.ts:381 | handle: "missionControl.lastSubmittedReport", |
| missionControl.notesField | src/control-plane/contracts/controlSurfaceContract.registry.ts:494 | id: "missionControl.notesField", |
| missionControl.statusSelectors | src/control-plane/contracts/controlSurfaceContract.registry.ts:467 | id: "missionControl.statusSelectors", |
| missionControl.submissionHistory | src/control-plane/handles/handleset.registry.ts:399 | handle: "missionControl.submissionHistory", |
| missionControl.submitReport | src/control-plane/contracts/controlSurfaceContract.registry.ts:523 | id: "missionControl.submitReport", |
| missionControl.tabs | src/control-plane/contracts/controlSurfaceContract.registry.ts:410 | id: "missionControl.tabs", |
| motion.reduce | src/themes/themeTokenPaths.ts:66, src/themes/themeTokenPaths.ts:134 | | "motion.reduce"; "motion.reduce", |
| openapi.json | src/source-adapter/sourceAdapterRegistry.ts:239 | examples: ["openapi.json", "api-spec.yaml"], |
| package.json | src/source-adapter/sourceAdapterRegistry.ts:311 | examples: ["package.json", "Cargo.toml"], |
| panel.card.background | src/themes/themeTokenPaths.ts:64, src/themes/themeTokenPaths.ts:132 | | "panel.card.background"; "panel.card.background", |
| panel.card.border | src/themes/themeTokenPaths.ts:65, src/themes/themeTokenPaths.ts:133 | | "panel.card.border"; "panel.card.border", |
| physics.adjustSizes | src/control-plane/settings/settings.registry.ts:119 | path: "physics.adjustSizes", |
| physics.barnesHutTheta | src/control-plane/settings/settings.registry.ts:126 | path: "physics.barnesHutTheta", |
| physics.centerForce | src/control-plane/settings/settings.registry.ts:94 | path: "physics.centerForce", |
| physics.communityGravity | src/control-plane/settings/settings.registry.ts:136 | path: "physics.communityGravity", |
| physics.linkDistance | src/control-plane/contracts/controlSurfaceContract.registry.ts:358, src/control-plane/handles/handleset.registry.ts:230, src/control-plane/settings/settings.registry.ts:75 | settingsKey: "physics.linkDistance",; handle: "physics.linkDistance",; path: "physics.linkDistance", |
| physics.linLogMode | src/control-plane/settings/settings.registry.ts:112 | path: "physics.linLogMode", |
| physics.nodeSize | src/control-plane/contracts/controlSurfaceContract.registry.ts:331, src/control-plane/handles/handleset.registry.ts:211, src/control-plane/settings/settings.registry.ts:66 | settingsKey: "physics.nodeSize",; handle: "physics.nodeSize",; path: "physics.nodeSize", |
| physics.physicsDialect | src/control-plane/settings/settings.registry.ts:54 | path: "physics.physicsDialect", |
| physics.physicsPreset | src/control-plane/settings/settings.registry.ts:39 | path: "physics.physicsPreset", |
| physics.qualityPreset | src/app/AppShell.tsx:189 | setSetting("physics.qualityPreset", "custom"); |
| physics.repelForce | src/control-plane/contracts/controlSurfaceContract.registry.ts:385, src/control-plane/handles/handleset.registry.ts:249, src/control-plane/settings/settings.registry.ts:85 | settingsKey: "physics.repelForce",; handle: "physics.repelForce",; path: "physics.repelForce", |
| physics.strongGravityMode | src/control-plane/settings/settings.registry.ts:105 | path: "physics.strongGravityMode", |
| qa.bundle.validator | src/control-plane/system-index/systemIndexRegistry.ts:97 | id: "qa.bundle.validator", |
| qa.store.ts | src/control-plane/contracts/controlSurfaceContract.registry.ts:413, src/control-plane/contracts/controlSurfaceContract.registry.ts:441, src/control-plane/contracts/controlSurfaceContract.registry.ts:470, src/control-plane/contracts/controlSurfaceContract.registry.ts:497, src/control-plane/contracts/controlSurfaceContract.registry.ts:526, src/control-plane/contracts/controlSurfaceContract.registry.ts:555, src/control-plane/contracts/controlSurfaceContract.registry.ts:582, src/control-plane/contracts/controlSurfaceContract.registry.ts:611 | owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts",; owner: "qa.store.ts", |
| schema.prisma | src/source-adapter/sourceAdapterRegistry.ts:275 | examples: ["schema.sql", "schema.prisma"], |
| schema.sql | src/source-adapter/sourceAdapterRegistry.ts:275 | examples: ["schema.sql", "schema.prisma"], |
| settings.open | src/control-plane/commands/command-registry.ts:5 | id: "settings.open", |
| settings.panel | src/control-plane/panels/ControlDock.tsx:242, src/themes/themeTargetRegistry.ts:113 | <div className="space-y-4" data-testid="settings-panel" data-lw-theme-target="settings.panel">; themeTargetId: "settings.panel", |
| settings.store.ts | src/control-plane/contracts/controlSurfaceContract.registry.ts:22, src/control-plane/contracts/controlSurfaceContract.registry.ts:50, src/control-plane/contracts/controlSurfaceContract.registry.ts:78, src/control-plane/contracts/controlSurfaceContract.registry.ts:108, src/control-plane/contracts/controlSurfaceContract.registry.ts:136, src/control-plane/contracts/controlSurfaceContract.registry.ts:164, src/control-plane/contracts/controlSurfaceContract.registry.ts:192, src/control-plane/contracts/controlSurfaceContract.registry.ts:220, src/control-plane/contracts/controlSurfaceContract.registry.ts:248, src/control-plane/contracts/controlSurfaceContract.registry.ts:275, src/control-plane/contracts/controlSurfaceContract.registry.ts:302, src/control-plane/contracts/controlSurfaceContract.registry.ts:330, src/control-plane/contracts/controlSurfaceContract.registry.ts:357, src/control-plane/contracts/controlSurfaceContract.registry.ts:384 | owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts",; owner: "settings.store.ts", |
| static.signal.readout | src/audio/musicReactiveMappingRegistry.ts:30, src/audio/musicReactiveMappingRegistry.ts:312 | | "static.signal.readout"; graphTarget: "static.signal.readout", |
| surface.background.deep | src/themes/themeTokenGovernance.ts:41 | * e.g. "surface.background.deep" → obj.surface.background.deep |
| system.index.registry | src/control-plane/system-index/systemIndexRegistry.ts:177, src/control-plane/system-index/systemIndexRegistry.ts:463 | relatedSystems: ["system.index.registry"],; relatedSystems: ["system.index.registry"], |
| system.index.registry.contract | src/control-plane/system-index/systemIndexRegistry.ts:158 | id: "system.index.registry.contract", |
| test.skip | src/control-plane/qa/qa-registry.ts:2499, src/control-plane/qa/qa-registry.ts:2763 | steps: ["Run grep -R 'test.skip' -n tests/e2e and verify no results"],; steps: ["Run grep -R 'test.skip' -n tests/e2e and verify no results"], |
| text.inverse | src/themes/themeTokenPaths.ts:59, src/themes/themeTokenPaths.ts:127 | | "text.inverse"; "text.inverse", |
| text.warning | src/themes/themeTokenPaths.ts:58, src/themes/themeTokenPaths.ts:126 | | "text.warning"; "text.warning", |
| theme.customThemePresets | src/control-plane/handles/handleset.registry.ts:437 | handle: "theme.customThemePresets", |
| theme.presetDropdown | src/control-plane/handles/handleset.registry.ts:417 | handle: "theme.presetDropdown", |
| themeTokenPaths.ts | src/graph/graphVisualThemeMappingRegistry.ts:33 | tokenSource: "THEME_TOKEN_PATH_MAP.md" | "themeTokenPaths.ts"; |
| topbar.glitterToggle | src/control-plane/contracts/controlSurfaceContract.registry.ts:47 | id: "topbar.glitterToggle", |
| topbar.reduceMotionToggle | src/control-plane/contracts/controlSurfaceContract.registry.ts:75 | id: "topbar.reduceMotionToggle", |
| topbar.root | src/app/AppShell.tsx:343, src/themes/themeTargetRegistry.ts:48 | data-lw-theme-target="topbar.root"; themeTargetId: "topbar.root", |
| topbar.themeSelector | src/control-plane/contracts/controlSurfaceContract.registry.ts:19 | id: "topbar.themeSelector", |
| visualHandle.button.background | src/themes/themeTokenPaths.ts:68, src/themes/themeTokenPaths.ts:136 | | "visualHandle.button.background";; "visualHandle.button.background", |
| visualHandle.panel.background | src/themes/themeTokenPaths.ts:67, src/themes/themeTokenPaths.ts:135 | | "visualHandle.panel.background"; "visualHandle.panel.background", |
| website.asset | src/source-adapter/sourceAdapterRegistry.ts:174 | "link": "website.asset", |
| website.heading | src/source-adapter/sourceAdapterRegistry.ts:173 | "heading": "website.heading", |
| website.page | src/source-adapter/sourceAdapterRegistry.ts:172 | "html-page": "website.page", |
