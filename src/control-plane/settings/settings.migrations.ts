import { defaultSettings } from "./settings.defaults";
import type { StarmapSettings } from "./settings.schema";

// Migration functions — one per version bump
// Each takes the previous state, returns updated state
const MIGRATIONS: Record<number,
  (s: Partial<StarmapSettings>) => Partial<StarmapSettings>
> = {
  // v1 → v2: added physics presets + community gravity + advanced FA2 params
  // deep merge handles new fields automatically
  2: (s) => ({
    ...s,
    physics: {
      ...defaultSettings.physics,
      ...(s.physics ?? {}),
      // Ensure new v2 fields exist
      physicsPreset: s.physics?.physicsPreset
        ?? defaultSettings.physics.physicsPreset,
      communityGravity: s.physics?.communityGravity
        ?? defaultSettings.physics.communityGravity,
      strongGravityMode: s.physics?.strongGravityMode
        ?? defaultSettings.physics.strongGravityMode,
      linLogMode: s.physics?.linLogMode
        ?? defaultSettings.physics.linLogMode,
      adjustSizes: s.physics?.adjustSizes
        ?? defaultSettings.physics.adjustSizes,
      barnesHutTheta: s.physics?.barnesHutTheta
        ?? defaultSettings.physics.barnesHutTheta,
    },
    graphView: {
      ...defaultSettings.graphView,
      ...(s.graphView ?? {}),
      neighborhoodDepth: s.graphView?.neighborhoodDepth
        ?? defaultSettings.graphView.neighborhoodDepth,
    },
  }),

  // v76 → v77: settings tab removal (v86a)
  77: (s) => {
    const ui = { ...(s.ui ?? {}) } as any;
    if (ui.leftPanelActiveTab === "settings") {
      ui.leftPanelActiveTab = "graph";
    }
    delete ui.settingsTabSections;
    if (Array.isArray(ui.tiledTabs)) {
      ui.tiledTabs = ui.tiledTabs.filter((t: string) => t !== "settings");
    }
    return { ...s, ui } as Partial<StarmapSettings>;
  },

  // v77 → v78: tile layout reshape (v86a)
  78: (s) => {
    const ui = { ...(s.ui ?? {}) } as any;
    const oldTabs = Array.isArray(ui.tiledTabs) ? ui.tiledTabs : [];
    ui.tileLayout = oldTabs.map((tabId: string, i: number) => ({
      id: `tile_legacy_${tabId}_${i}`,
      sectionKey: tabId,
      x: 200 + i * 30,
      y: 120 + i * 30,
      w: 320,
      h: 480,
      collapsed: false,
      z: 1,
    }));
    ui.tiledTabs = [];
    return { ...s, ui } as Partial<StarmapSettings>;
  },

  // v78 → v79: appearance defaults (v86a)
  79: (s) => {
    const appearance = { ...(s.appearance ?? {}) } as any;
    appearance.drama ??= "cranked";
    appearance.motionScale ??= 0.6;
    appearance.panelBlur ??= 16;
    appearance.nodeHum ??= 0.7;
    appearance.nodeFlowSpeed ??= 0.55;
    appearance.nodeGlow ??= 1.0;
    return { ...s, appearance } as Partial<StarmapSettings>;
  },

  // v79 → v80: performance preset coupling fields (v86b)
  80: (s) => {
    const appearance = { ...(s.appearance ?? {}) } as any;
    appearance.glitterDensity ??= "medium";
    appearance.edgePlasmaMode ??= "animated-overlay";
    appearance.backdropMotion ??= "half";
    const physics = { ...(s.physics ?? {}) } as any;
    physics.qualityPreset ??= defaultSettings.physics.qualityPreset;
    return { ...s, appearance, physics } as Partial<StarmapSettings>;
  },

  // v80 → v81: remove helix physics dialect (vP-physics-backbone-seed-fix)
  81: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    if (physics.physicsDialect === "helix") {
      physics.physicsDialect = "default";
    }
    return { ...s, physics } as Partial<StarmapSettings>;
  },
};

export function migrateSettings(
  saved: Partial<StarmapSettings>
): StarmapSettings {
  const savedVersion = saved.version ?? 1;
  const targetVersion = defaultSettings.version;

  let current = { ...saved };

  // Run each migration in order
  for (let v = savedVersion + 1; v <= targetVersion; v++) {
    if (MIGRATIONS[v]) {
      current = MIGRATIONS[v](current);
    }
  }

  // Final deep merge with defaults as safety net
  return {
    ...defaultSettings,
    ...current,
    version: targetVersion,
    physics: {
      ...defaultSettings.physics,
      ...(current.physics ?? {}),
    },
    graphView: {
      ...defaultSettings.graphView,
      ...(current.graphView ?? {}),
    },
    labels: {
      ...defaultSettings.labels,
      ...(current.labels ?? {}),
    },
    ui: {
      ...defaultSettings.ui,
      ...(current.ui ?? {}),
    },
    appearance: {
      ...defaultSettings.appearance,
      ...(current.appearance ?? {}),
    },
    general: {
      ...defaultSettings.general,
      ...(current.general ?? {}),
    },
    evidence: {
      ...defaultSettings.evidence,
      ...(current.evidence ?? {}),
    },
    sourceLinking: {
      ...defaultSettings.sourceLinking,
      ...(current.sourceLinking ?? {}),
    },
    performance: {
      ...defaultSettings.performance,
      ...(current.performance ?? {}),
    },
    developer: {
      ...defaultSettings.developer,
      ...(current.developer ?? {}),
    },
  };
}
