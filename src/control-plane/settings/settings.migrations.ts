import { defaultSettings } from "./settings.defaults";
import type { StarmapSettings } from "./settings.schema";

// Migration functions — one per version bump
// Each takes the previous state, returns updated state
const MIGRATIONS: Record<number,
  (s: Partial<StarmapSettings>) => Partial<StarmapSettings>
> = {
  // v1 → v2: added gwells dialectId (vP-physics-gwells-integration)
  // deep merge handles new fields automatically
  2: (s) => ({
    ...s,
    physics: {
      ...defaultSettings.physics,
      ...(s.physics ?? {}),
      // Ensure v2 field exists
      dialectId: s.physics?.dialectId ?? defaultSettings.physics.dialectId,
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
    return { ...s, appearance } as Partial<StarmapSettings>;
  },

  // v79 → v80: performance preset coupling fields (v86b)
  80: (s) => {
    const appearance = { ...(s.appearance ?? {}) } as any;
    appearance.glitterDensity ??= "medium";
    appearance.edgePlasmaMode ??= "animated-overlay";
    appearance.backdropMotion ??= "half";
    return { ...s, appearance } as Partial<StarmapSettings>;
  },

  // v80 → v81: remove helix physics dialect (vP-physics-backbone-seed-fix)
  81: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    if (physics.physicsDialect === "helix") {
      physics.physicsDialect = "default";
    }
    return { ...s, physics } as Partial<StarmapSettings>;
  },

  // v81 → v82: remove FA2 fields and add gwells dialectId (Pass C3)
  82: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    // Remove all FA2 fields except qualityPreset and nodeSize (C3.1.1 fix)
    delete physics.physicsPreset;
    delete physics.linkDistance;
    delete physics.repelForce;
    delete physics.centerForce;
    delete physics.communityGravity;
    delete physics.physicsDialect;
    delete physics.strongGravityMode;
    delete physics.linLogMode;
    delete physics.adjustSizes;
    delete physics.barnesHutTheta;
    // Add dialectId with default (will be renamed below)
    physics.dialectId = physics.dialectId ?? "gwells.dialect.horizontal-linear";

    // Move nodeSize from physics to graphView (preserved, not deleted)
    const graphView = { ...(s.graphView ?? {}) } as any;
    if (physics.nodeSize !== undefined && graphView.nodeSize === undefined) {
      graphView.nodeSize = physics.nodeSize;
    }
    // Ensure nodeSize exists
    if (graphView.nodeSize === undefined) {
      graphView.nodeSize = 1;
    }
    // Delete nodeSize from physics after moving to graphView
    delete physics.nodeSize;

    // Apply dialect rename (from old v83)
    if (physics.dialectId === "gwells.dialect.horizontal-linear") {
      physics.dialectId = "gwells.dialect.radial-backbone";
    }
    if (physics.dialectId === "gwells.dialect.vertical-parallel" ||
        physics.dialectId === "gwells.dialect.helix-dual") {
      physics.dialectId = "gwells.dialect.parallel-spines";
    }
    // Ensure a valid dialect ID
    if (physics.dialectId !== "gwells.dialect.radial-backbone" &&
        physics.dialectId !== "gwells.dialect.parallel-spines") {
      physics.dialectId = "gwells.dialect.radial-backbone";
    }

    return { ...s, physics, graphView } as Partial<StarmapSettings>;
  },

  // v82 → v83: add seedParamOverrides field for live tuning (Pass C4)
  83: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    if (physics.seedParamOverrides === undefined) {
      physics.seedParamOverrides = {};
    }
    return { ...s, physics };
  },

  // v83 → v84: pin storage for Pass C9.1
  84: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    physics.pins ??= {};
    return { ...s, physics } as Partial<StarmapSettings>;
  },

  // v84 → v85: pinnedHighlightActive field added in Pass C9.3,
  // migration backfilling added in Pass C9.4
  85: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    physics.pinnedHighlightActive ??= false;
    return { ...s, physics } as Partial<StarmapSettings>;
  },

  // v85 → v86: strip FA2-era physics fields (chore/post-gwells-hygiene)
  // Safety net migration - v82 already removed these fields, but this
  // ensures any edge cases or skipped migrations are cleaned up.
  86: (s) => {
    const physics = { ...(s.physics ?? {}) } as any;
    delete physics.physicsDialect;
    delete physics.linkDistance;
    delete physics.repelForce;
    delete physics.centerForce;
    delete physics.communityGravity;
    delete physics.strongGravityMode;
    delete physics.linLogMode;
    delete physics.adjustSizes;
    delete physics.barnesHutTheta;
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
