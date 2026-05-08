import { builtInThemePresets } from "./themePresets";
import { themeTargetRegistry } from "./themeTargetRegistry";
import {
  CANONICAL_THEME_TOKEN_PATHS,
  PLANNED_THEME_TOKEN_PATHS,
  type ThemeTokenPath,
  validateThemeTokenPaths,
} from "./themeTokenPaths";
import { themeTokenMap } from "./themeTokens";
import { components } from "./tokenComponents";
import { themeSemantics } from "./tokenSemantics";
import { themePrimitives } from "./tokenPrimitives";

interface InvalidBinding {
  themeTargetId: string;
  property: string;
  tokenPath: string;
}

interface PlannedBindingUsage extends InvalidBinding {}

interface TierWalkViolation {
  tier: number;
  path: string;
  reason: string;
}

export interface ThemeTokenGovernanceResult {
  invalidBindings: InvalidBinding[];
  plannedTokenBindings: PlannedBindingUsage[];
  plannedTargetsWithBindings: string[];
  presetMissingTokenPaths: {
    themeId: string;
    missingPaths: ThemeTokenPath[];
  }[];
  tierWalkViolations: TierWalkViolation[];
}

/**
 * Resolves a dotted path into a nested object
 * e.g. "surface.background.deep" → obj.surface.background.deep
 */
function resolvePath(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * Checks if a reference resolves to a valid primitive
 * Handles both direct paths and theme-scoped paths
 */
function resolvesPrimitive(ref: string, themeId?: string): boolean {
  // Remove { and } if present
  const cleanRef = ref.replace(/[{}]/g, "");
  
  // Check if it's a theme-scoped reference (e.g., "color.gold.500")
  // For now, we check against all theme primitives since semantics are theme-specific
  if (themeId) {
    const primitives = themePrimitives[themeId];
    if (primitives) {
      const resolved = resolvePath(primitives, cleanRef);
      return resolved !== undefined;
    }
  }
  
  // Check against all themes if no theme specified
  for (const primitives of Object.values(themePrimitives)) {
    const resolved = resolvePath(primitives, cleanRef);
    if (resolved !== undefined) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detects tier-walk violations in the token system
 * Tier 3 (components) must reference Tier 2 (semantics)
 * Tier 2 (semantics) must reference Tier 1 (primitives)
 * Inline values in Tier 2 or 3 are violations
 */
function detectTierWalkViolations(): TierWalkViolation[] {
  const violations: TierWalkViolation[] = [];

  // Tier 3 must reference Tier 2
  function walkComponents(obj: any, path: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === "object" && value !== null) {
        walkComponents(value, currentPath);
      } else if (typeof value === "string") {
        // Check if it's a reference (starts with {)
        if (value.startsWith("{")) {
          const cleanRef = value.replace(/[{}]/g, "");
          // Check if this semantic exists in any theme
          let found = false;
          for (const semantics of Object.values(themeSemantics)) {
            if (resolvePath(semantics, cleanRef) !== undefined) {
              found = true;
              break;
            }
          }
          if (!found) {
            violations.push({
              tier: 3,
              path: currentPath,
              reason: `references "${cleanRef}" which is not a Tier 2 semantic`,
            });
          }
        } else {
          violations.push({
            tier: 3,
            path: currentPath,
            reason: "inline value (must reference Tier 2 semantic)",
          });
        }
      } else {
        violations.push({
          tier: 3,
          path: currentPath,
          reason: "inline value (must reference Tier 2 semantic)",
        });
      }
    }
  }
  
  walkComponents(components, "components");

  // Tier 2 must reference Tier 1
  for (const [themeId, semantics] of Object.entries(themeSemantics)) {
    function walkSemantics(obj: any, path: string = "") {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === "object" && value !== null) {
          walkSemantics(value, currentPath);
        } else if (typeof value === "string") {
          // Check if it's a reference (starts with {)
          if (value.startsWith("{")) {
            const cleanRef = value.replace(/[{}]/g, "");
            // Handle opacity modifiers like " / 82%"
            const refPath = cleanRef.split(" / ")[0];
            if (!resolvesPrimitive(refPath, themeId)) {
              violations.push({
                tier: 2,
                path: `${themeId}.${currentPath}`,
                reason: `references "${refPath}" which is not a Tier 1 primitive`,
              });
            }
          } else {
            violations.push({
              tier: 2,
              path: `${themeId}.${currentPath}`,
              reason: "inline value (must reference Tier 1 primitive)",
            });
          }
        } else {
          violations.push({
            tier: 2,
            path: `${themeId}.${currentPath}`,
            reason: "inline value (must reference Tier 1 primitive)",
          });
        }
      }
    }
    
    walkSemantics(semantics, themeId);
  }

  return violations;
}

export function runThemeTokenGovernanceChecks(): ThemeTokenGovernanceResult {
  const canonicalSet = new Set(CANONICAL_THEME_TOKEN_PATHS);
  const plannedSet = new Set(PLANNED_THEME_TOKEN_PATHS);

  const invalidBindings: InvalidBinding[] = [];
  const plannedTokenBindings: PlannedBindingUsage[] = [];
  const plannedTargetsWithBindings: string[] = [];

  for (const target of themeTargetRegistry.targets) {
    const bindingEntries = Object.entries(target.tokenBindings ?? {});

    if (target.status === "planned" && bindingEntries.length > 0) {
      plannedTargetsWithBindings.push(target.themeTargetId);
    }

    if (target.status !== "active") {
      continue;
    }

    for (const [property, tokenPath] of bindingEntries) {
      if (!tokenPath) {
        continue;
      }

      if (!canonicalSet.has(tokenPath)) {
        invalidBindings.push({
          themeTargetId: target.themeTargetId,
          property,
          tokenPath,
        });
      }

      if (plannedSet.has(tokenPath as typeof PLANNED_THEME_TOKEN_PATHS[number])) {
        plannedTokenBindings.push({
          themeTargetId: target.themeTargetId,
          property,
          tokenPath,
        });
      }
    }
  }

  const presetMissingTokenPaths = builtInThemePresets.map((preset) => {
    const tokens = themeTokenMap[preset.themeId];
    const missingPaths = tokens ? validateThemeTokenPaths(tokens) : [...CANONICAL_THEME_TOKEN_PATHS];
    return {
      themeId: preset.themeId,
      missingPaths,
    };
  }).filter((entry) => entry.missingPaths.length > 0);

  const tierWalkViolations = detectTierWalkViolations();

  return {
    invalidBindings,
    plannedTokenBindings,
    plannedTargetsWithBindings,
    presetMissingTokenPaths,
    tierWalkViolations,
  };
}

export function assertThemeTokenGovernanceClean(): void {
  const result = runThemeTokenGovernanceChecks();

  if (
    result.invalidBindings.length === 0 &&
    result.plannedTokenBindings.length === 0 &&
    result.plannedTargetsWithBindings.length === 0 &&
    result.presetMissingTokenPaths.length === 0 &&
    result.tierWalkViolations.length === 0
  ) {
    return;
  }

  const errors: string[] = [];

  if (result.invalidBindings.length > 0) {
    errors.push(
      `Active targets contain non-canonical token paths: ${result.invalidBindings
        .map((entry) => `${entry.themeTargetId}.${entry.property} -> ${entry.tokenPath}`)
        .join(", ")}`,
    );
  }

  if (result.plannedTokenBindings.length > 0) {
    errors.push(
      `Active targets reference planned-only paths: ${result.plannedTokenBindings
        .map((entry) => `${entry.themeTargetId}.${entry.property} -> ${entry.tokenPath}`)
        .join(", ")}`,
    );
  }

  if (result.plannedTargetsWithBindings.length > 0) {
    errors.push(
      `Planned targets should not declare tokenBindings yet: ${result.plannedTargetsWithBindings.join(", ")}`,
    );
  }

  if (result.presetMissingTokenPaths.length > 0) {
    errors.push(
      `Built-in presets missing canonical token paths: ${result.presetMissingTokenPaths
        .map((entry) => `${entry.themeId} -> ${entry.missingPaths.join(", ")}`)
        .join("; ")}`,
    );
  }

  if (result.tierWalkViolations.length > 0) {
    errors.push(
      `Tier-walk violations: ${result.tierWalkViolations
        .map((v) => `T${v.tier} ${v.path}: ${v.reason}`)
        .join("; ")}`,
    );
  }

  throw new Error(errors.join("\n"));
}
