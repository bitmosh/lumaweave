/**
 * Theme Override Storage (v34a)
 * 
 * Global-only theme override storage foundation.
 * Validates against canonical ThemeTokenPath values only.
 * Rejects planned/noncanonical token paths.
 * Base presets remain immutable.
 */

import { CANONICAL_THEME_TOKEN_PATHS, type ThemeTokenPath, type ThemeTokenValue } from "./themeTokenPaths";
import { getTargetKind } from "./themeTargetRegistry";

export type { ThemeTokenValue } from "./themeTokenPaths";

const STORAGE_KEY = "lumaweave-theme-overrides";
const STORAGE_VERSION = "1.0.0";

export interface OverrideScope {
  kind: "global" | "target" | "target-kind" | "cluster";
  targetId?: string; // for kind: "target"
  targetKind?: string; // for kind: "target-kind"
  clusterAnchor?: string; // for kind: "cluster"
}

export interface ThemeOverride {
  tokenPath: ThemeTokenPath;
  value: ThemeTokenValue;
  timestamp: number;
  scope: OverrideScope; // v86a: added scope field
}

export interface ThemeOverrideStorage {
  version: string;
  overrides: ThemeOverride[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a token path against canonical ThemeTokenPath values
 */
export function validateTokenPath(tokenPath: string): ValidationResult {
  if (CANONICAL_THEME_TOKEN_PATHS.includes(tokenPath as ThemeTokenPath)) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    error: `Token path "${tokenPath}" is not a canonical ThemeTokenPath. Planned tokens and noncanonical strings are not allowed.`,
  };
}

/**
 * Validate a token value (basic type check)
 */
export function validateTokenValue(value: unknown): ValidationResult {
  if (typeof value === "string" || typeof value === "number") {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    error: `Token value must be a string or number, received ${typeof value}`,
  };
}

/**
 * Load overrides from localStorage
 */
export function loadOverrides(): ThemeOverrideStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { version: STORAGE_VERSION, overrides: [] };
    }
    
    const parsed = JSON.parse(stored) as ThemeOverrideStorage;
    
    // Validate version and filter invalid overrides
    const validOverrides = parsed.overrides.filter((override) => {
      const pathValidation = validateTokenPath(override.tokenPath);
      const valueValidation = validateTokenValue(override.value);
      return pathValidation.isValid && valueValidation.isValid;
    });
    
    return {
      version: STORAGE_VERSION,
      overrides: validOverrides,
    };
  } catch (error) {
    console.error("Failed to load theme overrides:", error);
    return { version: STORAGE_VERSION, overrides: [] };
  }
}

/**
 * Save overrides to localStorage
 */
export function saveOverrides(storage: ThemeOverrideStorage): void {
  try {
    const serialized = JSON.stringify(storage);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Failed to save theme overrides:", error);
    throw new Error("Failed to save theme overrides to localStorage");
  }
}

/**
 * Set a global override for a canonical token path
 */
export function setGlobalOverride(tokenPath: ThemeTokenPath, value: ThemeTokenValue): void {
  const pathValidation = validateTokenPath(tokenPath);
  if (!pathValidation.isValid) {
    throw new Error(pathValidation.error);
  }
  
  const valueValidation = validateTokenValue(value);
  if (!valueValidation.isValid) {
    throw new Error(valueValidation.error);
  }
  
  const storage = loadOverrides();
  
  // Remove existing override for this token path if present
  const existingIndex = storage.overrides.findIndex((o) => o.tokenPath === tokenPath);
  if (existingIndex >= 0) {
    storage.overrides.splice(existingIndex, 1);
  }
  
  // Add new override
  storage.overrides.push({
    tokenPath,
    value,
    timestamp: Date.now(),
    scope: { kind: "global" }, // v86a: only global scope implemented
  });
  
  saveOverrides(storage);
}

/**
 * Get a global override for a token path
 * v86a: only checks global scope
 */
export function getGlobalOverride(tokenPath: ThemeTokenPath): ThemeTokenValue | undefined {
  const storage = loadOverrides();
  const override = storage.overrides.find((o) => o.tokenPath === tokenPath && o.scope.kind === "global");
  return override?.value;
}

/**
 * Remove a global override for a token path
 */
export function removeGlobalOverride(tokenPath: ThemeTokenPath): void {
  const storage = loadOverrides();
  const filteredOverrides = storage.overrides.filter((o) => o.tokenPath !== tokenPath);
  
  if (filteredOverrides.length !== storage.overrides.length) {
    storage.overrides = filteredOverrides;
    saveOverrides(storage);
  }
}

/**
 * Reset all global overrides
 */
export function resetAllOverrides(): void {
  const storage: ThemeOverrideStorage = {
    version: STORAGE_VERSION,
    overrides: [],
  };
  saveOverrides(storage);
}

/**
 * Get all current global overrides
 */
export function getAllOverrides(): ThemeOverride[] {
  const storage = loadOverrides();
  return storage.overrides;
}

/**
 * Check if any overrides exist
 */
export function hasOverrides(): boolean {
  const storage = loadOverrides();
  return storage.overrides.length > 0;
}

/**
 * Export global theme override bundle (v34c1)
 * 
 * Exports current validated global overrides in a structured bundle format.
 * Only canonical ThemeTokenPath entries are included.
 * Invalid/noncanonical/planned tokens are filtered out.
 * Does not mutate storage or base presets.
 */
export interface ThemeOverrideBundle {
  version: number;
  kind: "lumaweave.themeOverrideBundle";
  scope: "global";
  overrides: Array<{
    tokenPath: ThemeTokenPath;
    value: ThemeTokenValue;
  }>;
}

export function exportGlobalThemeOverrideBundle(): ThemeOverrideBundle {
  const storage = loadOverrides();
  
  // Filter to only canonical, validated overrides
  const validOverrides = storage.overrides
    .filter((override) => {
      const pathValidation = validateTokenPath(override.tokenPath);
      const valueValidation = validateTokenValue(override.value);
      return pathValidation.isValid && valueValidation.isValid;
    })
    .map((override) => ({
      tokenPath: override.tokenPath,
      value: override.value,
    }));
  
  return {
    version: 1,
    kind: "lumaweave.themeOverrideBundle",
    scope: "global",
    overrides: validOverrides,
  };
}

// --- Target-kind-scoped overrides (v89.2) ---

/**
 * Set a target-kind-scoped override.
 * `targetKind` is the target's surface field (panel, topbar, shell, etc.).
 * All targets with matching surface resolve through this override unless
 * they have a more specific target-scope override.
 */
export function setTargetKindOverride(
  targetKind: string,
  tokenPath: ThemeTokenPath,
  value: ThemeTokenValue,
): void {
  const pathValidation = validateTokenPath(tokenPath);
  if (!pathValidation.isValid) {
    throw new Error(pathValidation.error);
  }
  const valueValidation = validateTokenValue(value);
  if (!valueValidation.isValid) {
    throw new Error(valueValidation.error);
  }

  const storage = loadOverrides();
  const existingIndex = storage.overrides.findIndex(
    (o) => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind && o.tokenPath === tokenPath,
  );
  if (existingIndex >= 0) {
    storage.overrides.splice(existingIndex, 1);
  }
  storage.overrides.push({
    tokenPath,
    value,
    timestamp: Date.now(),
    scope: { kind: "target-kind", targetKind },
  });
  saveOverrides(storage);
}

export function getTargetKindOverride(
  targetKind: string,
  tokenPath: ThemeTokenPath,
): ThemeTokenValue | undefined {
  const storage = loadOverrides();
  const override = storage.overrides.find(
    (o) => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind && o.tokenPath === tokenPath,
  );
  return override?.value;
}

export function removeTargetKindOverride(targetKind: string, tokenPath: ThemeTokenPath): void {
  const storage = loadOverrides();
  const filtered = storage.overrides.filter(
    (o) => !(o.scope.kind === "target-kind" && o.scope.targetKind === targetKind && o.tokenPath === tokenPath),
  );
  if (filtered.length !== storage.overrides.length) {
    storage.overrides = filtered;
    saveOverrides(storage);
  }
}

export function getTargetKindOverrides(targetKind: string): ThemeOverride[] {
  const storage = loadOverrides();
  return storage.overrides.filter(
    (o) => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind,
  );
}

// --- Cluster-scoped overrides (v89.2) ---

/**
 * Set a cluster-scoped override.
 * `clusterAnchor` is a target id or node id whose neighborhood defines the cluster.
 * For non-graph targets, cluster scope may not be meaningful at resolution time.
 */
export function setClusterOverride(
  clusterAnchor: string,
  tokenPath: ThemeTokenPath,
  value: ThemeTokenValue,
): void {
  const pathValidation = validateTokenPath(tokenPath);
  if (!pathValidation.isValid) {
    throw new Error(pathValidation.error);
  }
  const valueValidation = validateTokenValue(value);
  if (!valueValidation.isValid) {
    throw new Error(valueValidation.error);
  }

  const storage = loadOverrides();
  const existingIndex = storage.overrides.findIndex(
    (o) => o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor && o.tokenPath === tokenPath,
  );
  if (existingIndex >= 0) {
    storage.overrides.splice(existingIndex, 1);
  }
  storage.overrides.push({
    tokenPath,
    value,
    timestamp: Date.now(),
    scope: { kind: "cluster", clusterAnchor },
  });
  saveOverrides(storage);
}

export function getClusterOverride(
  clusterAnchor: string,
  tokenPath: ThemeTokenPath,
): ThemeTokenValue | undefined {
  const storage = loadOverrides();
  const override = storage.overrides.find(
    (o) => o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor && o.tokenPath === tokenPath,
  );
  return override?.value;
}

export function removeClusterOverride(clusterAnchor: string, tokenPath: ThemeTokenPath): void {
  const storage = loadOverrides();
  const filtered = storage.overrides.filter(
    (o) => !(o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor && o.tokenPath === tokenPath),
  );
  if (filtered.length !== storage.overrides.length) {
    storage.overrides = filtered;
    saveOverrides(storage);
  }
}

export function getClusterOverrides(clusterAnchor: string): ThemeOverride[] {
  const storage = loadOverrides();
  return storage.overrides.filter(
    (o) => o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor,
  );
}

// --- Target-scoped overrides (v86d.1) ---

/**
 * Set a target-scoped override for a canonical token path
 * v86d.1: target scope only; target-kind/cluster defer to v89
 */
export function setTargetOverride(
  targetId: string,
  tokenPath: ThemeTokenPath,
  value: ThemeTokenValue,
): void {
  const pathValidation = validateTokenPath(tokenPath);
  if (!pathValidation.isValid) {
    throw new Error(pathValidation.error);
  }

  const valueValidation = validateTokenValue(value);
  if (!valueValidation.isValid) {
    throw new Error(valueValidation.error);
  }

  const storage = loadOverrides();

  // Remove existing target override for this target+path
  const existingIndex = storage.overrides.findIndex(
    (o) => o.scope.kind === "target" && o.scope.targetId === targetId && o.tokenPath === tokenPath,
  );
  if (existingIndex >= 0) {
    storage.overrides.splice(existingIndex, 1);
  }

  // Add new target override
  storage.overrides.push({
    tokenPath,
    value,
    timestamp: Date.now(),
    scope: { kind: "target", targetId },
  });

  saveOverrides(storage);
}

/**
 * Get a target-scoped override for a token path
 */
export function getTargetOverride(
  targetId: string,
  tokenPath: ThemeTokenPath,
): ThemeTokenValue | undefined {
  const storage = loadOverrides();
  const override = storage.overrides.find(
    (o) => o.scope.kind === "target" && o.scope.targetId === targetId && o.tokenPath === tokenPath,
  );
  return override?.value;
}

/**
 * Remove a target-scoped override for a token path
 */
export function removeTargetOverride(targetId: string, tokenPath: ThemeTokenPath): void {
  const storage = loadOverrides();
  const filteredOverrides = storage.overrides.filter(
    (o) => !(o.scope.kind === "target" && o.scope.targetId === targetId && o.tokenPath === tokenPath),
  );

  if (filteredOverrides.length !== storage.overrides.length) {
    storage.overrides = filteredOverrides;
    saveOverrides(storage);
  }
}

/**
 * Get all overrides for a specific target
 */
export function getTargetOverrides(targetId: string): ThemeOverride[] {
  const storage = loadOverrides();
  return storage.overrides.filter((o) => o.scope.kind === "target" && o.scope.targetId === targetId);
}

/**
 * Resolve a token value for a target with priority fallthrough
 * Priority: target > target-kind > cluster > global
 * v86d.1: implements target and global; target-kind/cluster defer to v89
 */
export function resolveForTarget(
  tokenPath: ThemeTokenPath,
  targetId: string,
  targetKind?: string,
  clusterAnchor?: string,
): ThemeTokenValue | undefined {
  const storage = loadOverrides();

  // Priority 1: target scope
  const targetOverride = storage.overrides.find(
    (o) => o.scope.kind === "target" && o.scope.targetId === targetId && o.tokenPath === tokenPath,
  );
  if (targetOverride) return targetOverride.value;

  // Priority 2: target-kind scope (v89)
  if (targetKind) {
    const targetKindOverride = storage.overrides.find(
      (o) => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind && o.tokenPath === tokenPath,
    );
    if (targetKindOverride) return targetKindOverride.value;
  }

  // Priority 3: cluster scope (v89)
  if (clusterAnchor) {
    const clusterOverride = storage.overrides.find(
      (o) => o.scope.kind === "cluster" && o.scope.clusterAnchor === clusterAnchor && o.tokenPath === tokenPath,
    );
    if (clusterOverride) return clusterOverride.value;
  }

  // Priority 4: global scope
  const globalOverride = storage.overrides.find((o) => o.scope.kind === "global" && o.tokenPath === tokenPath);
  if (globalOverride) return globalOverride.value;

  return undefined;
}

// v89.3: Cluster scope deliberately omitted. Cluster anchor
// is selection-derived, not per-target-static. A selection-aware
// cluster indicator requires a "given targetId, what cluster
// anchor currently applies" primitive that v89.2 did not ship.
// Deferred to a future pass alongside that primitive.
export function getAllScopeIndicatorState(targetId: string): {
  hasGlobal: boolean;
  hasTarget: boolean;
  hasTargetKind: boolean;
} {
  const storage = loadOverrides();
  const hasGlobal = storage.overrides.some((o) => o.scope.kind === "global");
  const hasTarget = storage.overrides.some(
    (o) => o.scope.kind === "target" && o.scope.targetId === targetId,
  );
  const targetKind = getTargetKind(targetId);
  const hasTargetKind =
    targetKind !== undefined &&
    storage.overrides.some(
      (o) => o.scope.kind === "target-kind" && o.scope.targetKind === targetKind,
    );
  return { hasGlobal, hasTarget, hasTargetKind };
}

// Expose storage API for testing in DEV/PLAYWRIGHT mode
if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwThemeOverrideStorage = {
    setGlobalOverride,
    getGlobalOverride,
    removeGlobalOverride,
    setTargetOverride,
    getTargetOverride,
    removeTargetOverride,
    getTargetOverrides,
    resetAllOverrides,
    resolveForTarget,
    loadOverrides,
    saveOverrides,
    // v89.2
    setTargetKindOverride,
    getTargetKindOverride,
    removeTargetKindOverride,
    getTargetKindOverrides,
    setClusterOverride,
    getClusterOverride,
    removeClusterOverride,
    getClusterOverrides,
    // v89.3
    getAllScopeIndicatorState,
  };
}
