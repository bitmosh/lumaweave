import type { StarmapSettings } from "./settings.schema";
import { defaultSettings } from "./settings.defaults";

/**
 * Migrate saved settings to current schema version.
 * Called when loading settings from persistent storage.
 * Adds missing fields with defaults rather than
 * resetting everything on schema changes.
 */
export function migrateSettings(
  saved: Partial<StarmapSettings>
): StarmapSettings {
  return {
    ...defaultSettings,
    ...saved,
    // Deep merge nested sections so missing fields
    // get defaults without overwriting saved values
    general: { ...defaultSettings.general, ...saved.general },
    appearance: { ...defaultSettings.appearance, ...saved.appearance },
    graphView: { ...defaultSettings.graphView, ...saved.graphView },
    physics: { ...defaultSettings.physics, ...saved.physics },
    labels: { ...defaultSettings.labels, ...saved.labels },
    evidence: { ...defaultSettings.evidence, ...saved.evidence },
    sourceLinking: { ...defaultSettings.sourceLinking, ...saved.sourceLinking },
    performance: { ...defaultSettings.performance, ...saved.performance },
    developer: { ...defaultSettings.developer, ...saved.developer },
    ui: {
      ...defaultSettings.ui,
      ...saved.ui,
      // Deep merge ui subsections
      graphTabSections: {
        ...defaultSettings.ui.graphTabSections,
        ...saved.ui?.graphTabSections,
      },
      qaTabSections: {
        ...defaultSettings.ui.qaTabSections,
        ...saved.ui?.qaTabSections,
      },
      evidenceTabSections: {
        ...defaultSettings.ui.evidenceTabSections,
        ...saved.ui?.evidenceTabSections,
      },
      debugTabSections: {
        ...defaultSettings.ui.debugTabSections,
        ...saved.ui?.debugTabSections,
      },
      settingsTabSections: {
        ...defaultSettings.ui.settingsTabSections,
        ...saved.ui?.settingsTabSections,
      },
      controlDockSections: {
        ...defaultSettings.ui.controlDockSections,
        ...saved.ui?.controlDockSections,
      },
      tiledTabs: saved.ui?.tiledTabs ?? defaultSettings.ui.tiledTabs,
    },
    version: defaultSettings.version,
  };
}
