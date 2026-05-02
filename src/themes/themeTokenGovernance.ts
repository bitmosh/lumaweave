import { builtInThemePresets } from "./themePresets";
import { themeTargetRegistry } from "./themeTargetRegistry";
import {
  CANONICAL_THEME_TOKEN_PATHS,
  PLANNED_THEME_TOKEN_PATHS,
  type ThemeTokenPath,
  validateThemeTokenPaths,
} from "./themeTokenPaths";
import { themeTokenMap } from "./themeTokens";

interface InvalidBinding {
  themeTargetId: string;
  property: string;
  tokenPath: string;
}

interface PlannedBindingUsage extends InvalidBinding {}

export interface ThemeTokenGovernanceResult {
  invalidBindings: InvalidBinding[];
  plannedTokenBindings: PlannedBindingUsage[];
  plannedTargetsWithBindings: string[];
  presetMissingTokenPaths: {
    themeId: string;
    missingPaths: ThemeTokenPath[];
  }[];
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

  return {
    invalidBindings,
    plannedTokenBindings,
    plannedTargetsWithBindings,
    presetMissingTokenPaths,
  };
}

export function assertThemeTokenGovernanceClean(): void {
  const result = runThemeTokenGovernanceChecks();

  if (
    result.invalidBindings.length === 0 &&
    result.plannedTokenBindings.length === 0 &&
    result.plannedTargetsWithBindings.length === 0 &&
    result.presetMissingTokenPaths.length === 0
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

  throw new Error(errors.join("\n"));
}
