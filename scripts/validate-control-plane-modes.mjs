#!/usr/bin/env node

/**
 * Control Plane Mode Registry Validator v0
 *
 * Read-only validator that checks the Mode Metadata Registry stays aligned
 * with the v73a Human Mode vs Evidence Mode Contract.
 *
 * Contract: docs/control-plane/HUMAN_MODE_EVIDENCE_MODE_CONTRACT.md
 * Registry: src/control-plane/modes/controlPlaneModeRegistry.ts
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_PATH = join(__dirname, "../src/control-plane/modes/controlPlaneModeRegistry.ts");

const REQUIRED_MODE_IDS = ["human", "evidence", "debug"];

const REQUIRED_HELPER_FUNCTIONS = [
  "getAllControlPlaneModes",
  "getControlPlaneModeById",
  "getDefaultControlPlaneMode",
  "getQaRecommendedControlPlaneMode",
  "getModeEvidencePolicy",
  "getModeDebugPolicy",
];

const REQUIRED_FORBIDDEN_BEHAVIORS = [
  "no graph/Sigma mutation",
  "no audio input/playback/music runtime behavior",
  "no command execution",
  "no storage/persistence",
  "no token promotion",
  "no CSS variable writes",
  "accepted evidence hiding",
  "no test weakening or test skips",
];

const V69_RETRY_MARKERS = [
  "v69a",
  "v69b",
  "v69c",
  "v69d",
  "deferred",
  "sliced",
  "cascade",
];

let errors = [];
let warnings = [];

function checkRegistryFileExists() {
  if (!existsSync(REGISTRY_PATH)) {
    errors.push(`Registry file not found: ${REGISTRY_PATH}`);
    return false;
  }
  return true;
}

function checkRequiredModeIds(content) {
  const missingModeIds = REQUIRED_MODE_IDS.filter((id) => !content.includes(`"${id}"`));
  if (missingModeIds.length > 0) {
    errors.push(`Missing required mode IDs: ${missingModeIds.join(", ")}`);
    return false;
  }
  return true;
}

function checkRequiredHelperFunctions(content) {
  const missingFunctions = REQUIRED_HELPER_FUNCTIONS.filter(
    (func) => !content.includes(func),
  );
  if (missingFunctions.length > 0) {
    errors.push(`Missing required helper functions: ${missingFunctions.join(", ")}`);
    return false;
  }
  return true;
}

function checkDefaultMode(content) {
  // Check that getDefaultControlPlaneMode returns EVIDENCE_MODE
  const defaultModeFunction = content.match(
    /export function getDefaultControlPlaneMode\(\)[^}]+return\s+(\w+)/s,
  );
  if (!defaultModeFunction) {
    errors.push("getDefaultControlPlaneMode function not found");
    return false;
  }

  const returnedValue = defaultModeFunction[1];
  if (!content.includes(`const ${returnedValue}`)) {
    errors.push(`getDefaultControlPlaneMode returns undefined variable: ${returnedValue}`);
    return false;
  }

  // Check that the returned mode is EVIDENCE_MODE
  const evidenceModeDeclaration = content.match(
    /const EVIDENCE_MODE[^}]+id:\s*"evidence"/s,
  );
  if (!evidenceModeDeclaration) {
    errors.push("EVIDENCE_MODE declaration not found or does not have id: 'evidence'");
    return false;
  }

  // Check that the function returns EVIDENCE_MODE
  if (!content.includes("getDefaultControlPlaneMode") || !content.includes("return EVIDENCE_MODE")) {
    errors.push("getDefaultControlPlaneMode does not return EVIDENCE_MODE");
    return false;
  }

  return true;
}

function checkQaRecommendedMode(content) {
  // Check that getQaRecommendedControlPlaneMode returns EVIDENCE_MODE
  if (!content.includes("getQaRecommendedControlPlaneMode") || !content.includes("return EVIDENCE_MODE")) {
    errors.push("getQaRecommendedControlPlaneMode does not return EVIDENCE_MODE");
    return false;
  }
  return true;
}

function checkHumanModePolicy(content) {
  const humanModeSection = content.match(/const HUMAN_MODE[^}]+}/s);
  if (!humanModeSection) {
    errors.push("HUMAN_MODE declaration not found");
    return false;
  }

  const sectionContent = humanModeSection[0];

  // Check for allowsSummarization=true in getModeEvidencePolicy for human mode
  const humanEvidencePolicy = content.match(
    /case "human":[^}]+allowsSummarization:\s*true/s,
  );
  if (!humanEvidencePolicy) {
    errors.push("Human Mode evidence policy does not have allowsSummarization=true");
    return false;
  }

  // Check for requiresTestedHelpers=true in getModeEvidencePolicy for human mode
  const humanTestedHelpers = content.match(
    /case "human":[^}]+requiresTestedHelpers:\s*true/s,
  );
  if (!humanTestedHelpers) {
    errors.push("Human Mode evidence policy does not have requiresTestedHelpers=true");
    return false;
  }

  // Check for allowsLegacyCollapsing=false in getModeEvidencePolicy for human mode
  const humanLegacyCollapsing = content.match(
    /case "human":[^}]+allowsLegacyCollapsing:\s*false/s,
  );
  if (!humanLegacyCollapsing) {
    errors.push("Human Mode evidence policy does not have allowsLegacyCollapsing=false");
    return false;
  }

  // Check for "no evidence weakening" in forbiddenBehavior
  if (!sectionContent.includes("no evidence weakening")) {
    errors.push("Human Mode forbiddenBehavior does not include 'no evidence weakening'");
    return false;
  }

  // Check for "no dead controls" in forbiddenBehavior
  if (!sectionContent.includes("no dead controls")) {
    errors.push("Human Mode forbiddenBehavior does not include 'no dead controls'");
    return false;
  }

  return true;
}

function checkEvidenceModePolicy(content) {
  const evidenceModeSection = content.match(/const EVIDENCE_MODE[^}]+}/s);
  if (!evidenceModeSection) {
    errors.push("EVIDENCE_MODE declaration not found");
    return false;
  }

  const sectionContent = evidenceModeSection[0];

  // Check for requiresFullEvidence=true in getModeEvidencePolicy for evidence mode
  const evidenceFullEvidence = content.match(
    /case "evidence":[^}]+requiresFullEvidence:\s*true/s,
  );
  if (!evidenceFullEvidence) {
    errors.push("Evidence Mode evidence policy does not have requiresFullEvidence=true");
    return false;
  }

  // Check for allowsSummarization=false in getModeEvidencePolicy for evidence mode
  const evidenceSummarization = content.match(
    /case "evidence":[^}]+allowsSummarization:\s*false/s,
  );
  if (!evidenceSummarization) {
    errors.push("Evidence Mode evidence policy does not have allowsSummarization=false");
    return false;
  }

  // Check for forbiddenBoundaryVisibility="always" in getModeEvidencePolicy for evidence mode
  const evidenceBoundaryVisibility = content.match(
    /case "evidence":[^}]+forbiddenBoundaryVisibility:\s*"always"/s,
  );
  if (!evidenceBoundaryVisibility) {
    errors.push("Evidence Mode evidence policy does not have forbiddenBoundaryVisibility='always'");
    return false;
  }

  // Check for source paths, test paths, QA keys, validators, forbidden boundaries
  const requiredFields = ["source paths", "test paths", "validators", "forbidden boundaries"];
  const missingFields = requiredFields.filter((field) => !sectionContent.includes(field));
  if (missingFields.length > 0) {
    errors.push(`Evidence Mode does not include required fields: ${missingFields.join(", ")}`);
    return false;
  }

  return true;
}

function checkDebugModePolicy(content) {
  const debugModeSection = content.match(/const DEBUG_MODE[^}]+}/s);
  if (!debugModeSection) {
    errors.push("DEBUG_MODE declaration not found");
    return false;
  }

  const sectionContent = debugModeSection[0];

  // Check for diagnostic IDs, data-testid values, registry IDs, raw lifecycle/status fields, validator outputs, source paths
  const requiredFields = [
    "diagnostic IDs",
    "data-testid",
    "registry IDs",
    "lifecycle",
    "validator outputs",
    "source paths",
  ];
  const missingFields = requiredFields.filter((field) => !sectionContent.toLowerCase().includes(field.toLowerCase()));
  if (missingFields.length > 0) {
    errors.push(`Debug Mode does not include required fields: ${missingFields.join(", ")}`);
    return false;
  }

  // Check for intendedForInternalUse=true in getModeDebugPolicy for debug mode
  const debugInternalUse = content.match(
    /case "debug":[^}]+intendedForInternalUse:\s*true/s,
  );
  if (!debugInternalUse) {
    errors.push("Debug Mode debug policy does not have intendedForInternalUse=true");
    return false;
  }

  return true;
}

function checkForbiddenBehavior(content) {
  // Check that each mode includes forbidden behavior language
  const modes = ["HUMAN_MODE", "EVIDENCE_MODE", "DEBUG_MODE"];

  for (const mode of modes) {
    const modeSection = content.match(new RegExp(`const ${mode}[^}]+}`, "s"));
    if (!modeSection) {
      errors.push(`${mode} declaration not found`);
      continue;
    }

    const sectionContent = modeSection[0];
    const missingBehaviors = REQUIRED_FORBIDDEN_BEHAVIORS.filter(
      (behavior) => !sectionContent.includes(behavior),
    );

    if (missingBehaviors.length > 0) {
      errors.push(
        `${mode} forbiddenBehavior is missing: ${missingBehaviors.join(", ")}`,
      );
    }
  }

  // Also check that there's a shared forbidden behavior section or that each mode has it
  if (!content.includes("forbiddenBehavior")) {
    errors.push("No forbiddenBehavior field found in registry");
    return false;
  }

  return true;
}

function checkV69RetryMarkers(content) {
  // Check that registry mentions v69 retry/deferred status and sliced plan
  const missingMarkers = V69_RETRY_MARKERS.filter((marker) => !content.toLowerCase().includes(marker.toLowerCase()));

  if (missingMarkers.length > 0) {
    warnings.push(
      `Registry may be missing v69 retry markers: ${missingMarkers.join(", ")}`,
    );
  }

  // Check for "deferred" status
  if (!content.includes("deferred")) {
    warnings.push("Registry does not explicitly mark v69 retry as 'deferred'");
  }

  // Check for sliced pass strategy mentions
  if (!content.includes("sliced") || !content.includes("pass")) {
    warnings.push("Registry does not mention sliced pass strategy for v69 retry");
  }

  return true;
}

function main() {
  console.log("Validating Control Plane Mode Registry...\n");

  // Check registry file exists
  if (!checkRegistryFileExists()) {
    console.error("❌ Validation failed: Registry file not found");
    process.exit(1);
  }

  const content = readFileSync(REGISTRY_PATH, "utf-8");

  // Run all checks
  checkRequiredModeIds(content);
  checkRequiredHelperFunctions(content);
  checkDefaultMode(content);
  checkQaRecommendedMode(content);
  checkHumanModePolicy(content);
  checkEvidenceModePolicy(content);
  checkDebugModePolicy(content);
  checkForbiddenBehavior(content);
  checkV69RetryMarkers(content);

  // Report results
  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ All checks passed");
    console.log(`\nRegistry: ${REGISTRY_PATH}`);
    console.log("Required mode IDs: human, evidence, debug ✓");
    console.log("Required helpers: 6 functions ✓");
    console.log("Default mode: Evidence Mode ✓");
    console.log("QA recommended mode: Evidence Mode ✓");
    console.log("Human Mode policy: allowsSummarization=true, requiresTestedHelpers=true, allowsLegacyCollapsing=false ✓");
    console.log("Evidence Mode policy: requiresFullEvidence=true, allowsSummarization=false, forbiddenBoundaryVisibility='always' ✓");
    console.log("Debug Mode policy: includes diagnostic data, intendedForInternalUse=true ✓");
    console.log("Forbidden behavior: all required behaviors present ✓");
    console.log("v69 retry markers: present ✓");
    process.exit(0);
  }

  if (errors.length > 0) {
    console.error("❌ Validation failed with errors:\n");
    errors.forEach((error) => console.error(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  Warnings:\n");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    process.exit(1);
  }

  console.log("\n✅ Validation passed with warnings");
  process.exit(0);
}

main();
