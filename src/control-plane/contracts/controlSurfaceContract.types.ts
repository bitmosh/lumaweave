/**
 * Control Surface Contract Types
 * 
 * This file defines the type system for the active control contract registry.
 * The contract registry describes and validates the currently active control surface.
 * 
 * IMPORTANT: This does not yet drive UI. This is a contract map and validation aid only.
 */

export type ControlSurface = "topbar" | "graph" | "missionControl" | "settings";

export type ControlStatus = "active" | "partial" | "planned" | "stale" | "unknown";

export type ControlRisk = "low" | "medium" | "high";

export interface ControlContract {
  id: string;
  label: string;
  surface: ControlSurface;
  owner: string;
  settingsKey: string | null;
  noStorageReason?: string;
  runtimeBinding: {
    sourceFile: string;
    targetComponent: string;
    liveUpdate: boolean;
  };
  qa: {
    checklistKey?: string;
    hasQaCoverage: boolean;
    manualQaAccepted?: boolean;
  };
  playwright: {
    testFile?: string;
    hasCoverage: boolean;
  };
  docs: {
    location?: string;
    hasDocs: boolean;
  };
  status: ControlStatus;
  risk: ControlRisk;
  notes: string;
}

export interface ControlSurfaceContractRegistry {
  version: string;
  updatedAt: string;
  contracts: ControlContract[];
}

export interface ContractSummary {
  totalActive: number;
  withHandleId: number;
  missingHandleId: number;
  withSettingsKey: number;
  settingsKeyNull: number;
  missingSettingsKey: number;
  withRuntimeBinding: number;
  missingRuntimeBinding: number;
  withQaCoverage: number;
  withPlaywrightCoverage: number;
  missingDocs: number;
  missingQa: number;
  missingPlaywright: number;
  missingPlaywrightBySurface: Record<ControlSurface, ControlContract[]>;
  highRisk: number;
  bySurface: {
    topbar: number;
    graph: number;
    missionControl: number;
    settings: number;
  };
}
