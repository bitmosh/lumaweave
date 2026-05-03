/**
 * Theme Override Storage (v34a)
 * 
 * Global-only theme override storage foundation.
 * Validates against canonical ThemeTokenPath values only.
 * Rejects planned/noncanonical token paths.
 * Base presets remain immutable.
 */

import { CANONICAL_THEME_TOKEN_PATHS, type ThemeTokenPath, type ThemeTokenValue } from "./themeTokenPaths";

export type { ThemeTokenValue } from "./themeTokenPaths";

const STORAGE_KEY = "lumaweave-theme-overrides";
const STORAGE_VERSION = "1.0.0";

export interface ThemeOverride {
  tokenPath: ThemeTokenPath;
  value: ThemeTokenValue;
  timestamp: number;
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
  });
  
  saveOverrides(storage);
}

/**
 * Get a global override for a token path
 */
export function getGlobalOverride(tokenPath: ThemeTokenPath): ThemeTokenValue | undefined {
  const storage = loadOverrides();
  const override = storage.overrides.find((o) => o.tokenPath === tokenPath);
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
