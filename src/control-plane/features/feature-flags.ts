export type FeatureFlagId =
  | "sigma2dRenderer"
  | "cosmographRenderer"
  | "three3dRenderer"
  | "solarPlasmaTheme"
  | "semanticGlitter"
  | "graphDiff"
  | "agentBeacons"
  | "worldMode"
  | "helixLayouts"
  | "qaPanel";

export const defaultFeatureFlags: Record<FeatureFlagId, boolean> = {
  sigma2dRenderer: true,
  cosmographRenderer: false,
  three3dRenderer: false,
  solarPlasmaTheme: true,
  semanticGlitter: false,
  graphDiff: false,
  agentBeacons: false,
  worldMode: false,
  helixLayouts: false,
  qaPanel: true,
};