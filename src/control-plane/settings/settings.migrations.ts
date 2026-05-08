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
