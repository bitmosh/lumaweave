/**
 * Control Plane Mode Registry
 *
 * Static/read-only registry defining Human Mode, Evidence Mode, and Debug Mode metadata.
 *
 * Purpose: Prepare for future mode-aware rendering without adding a runtime toggle,
 * hiding evidence, or changing existing UI behavior.
 *
 * Contract: docs/canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md (supersedes HUMAN_MODE_EVIDENCE_MODE_CONTRACT.md)
 */

export type ControlPlaneModeId = "human" | "evidence" | "debug";

export interface ControlPlaneModeMetadata {
  id: ControlPlaneModeId;
  label: string;
  summary: string;
  intendedAudience: string[];
  defaultUse: string;
  evidenceVisibility: "full" | "summary" | "diagnostic";
  debugVisibility: "full" | "partial" | "none";
  allowedDisclosure: string[];
  forbiddenBehavior: string[];
  futureUse: string;
  relatedContracts: string[];
  tags: string[];
}

export interface EvidencePolicy {
  requiresFullEvidence: boolean;
  allowsSummarization: boolean;
  requiresTestedHelpers: boolean;
  allowsLegacyCollapsing: boolean;
  forbiddenBoundaryVisibility: "always" | "summary" | "hidden";
}

export interface DebugPolicy {
  showsDiagnosticIds: boolean;
  showsDataTestIds: boolean;
  showsRegistryIds: boolean;
  showsRawLifecycle: boolean;
  showsValidatorOutputs: boolean;
  showsSourcePaths: boolean;
  intendedForInternalUse: boolean;
}

/**
 * Human Mode
 *
 * Overview-first, readable language, summary cards.
 * Progressive disclosure allowed only when full evidence remains reachable.
 * No evidence weakening, no dead controls.
 */
const HUMAN_MODE: ControlPlaneModeMetadata = {
  id: "human",
  label: "Human Mode",
  summary:
    "Overview-first presentation with readable language and summary cards. Progressive disclosure allowed only when full evidence remains reachable.",
  intendedAudience: ["daily operators", "non-technical stakeholders", "onboarding users"],
  defaultUse: "Daily operation and navigation, quick status checks, onboarding and exploration",
  evidenceVisibility: "summary",
  debugVisibility: "none",
  allowedDisclosure: [
    "grouped summaries",
    "category/kind/status/lifecycle counts",
    "friendly labels",
    "collapsible sections with stable open helpers",
  ],
  forbiddenBehavior: [
    "no evidence weakening",
    "no dead controls",
    "no legacy accepted evidence collapsed by default until tests are migrated",
    "no accepted evidence hiding without tested helpers",
    "no graph/Sigma mutation",
    "no audio input/playback/music runtime behavior",
    "no command execution",
    "no storage/persistence without contract",
    "no token promotion",
    "no CSS variable writes",
    "no test weakening or test skips",
  ],
  futureUse: "Mode-aware rendering for SystemIndexPanel and future control-plane surfaces",
  relatedContracts: [
    "docs/canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md",
  ],
  tags: ["overview", "readable", "progressive-disclosure"],
};

/**
 * Evidence Mode
 *
 * Full accepted evidence visible or directly reachable through tested helpers.
 * Source paths, test paths, QA keys, validators, forbidden boundaries.
 * Best for QA/Bandit review, default for validation-sensitive surfaces.
 */
const EVIDENCE_MODE: ControlPlaneModeMetadata = {
  id: "evidence",
  label: "Evidence Mode",
  summary:
    "Full accepted evidence visible or directly reachable through tested helpers. Source paths, test paths, QA keys, validators, forbidden boundaries.",
  intendedAudience: ["QA reviewers", "Bandit checkpoint verification", "contract compliance checking"],
  defaultUse:
    "QA validation and review, Bandit checkpoint verification, contract compliance checking, debugging accepted evidence failures",
  evidenceVisibility: "full",
  debugVisibility: "partial",
  allowedDisclosure: [
    "full field lists",
    "raw IDs and identifiers",
    "source paths",
    "test paths",
    "doc paths",
    "forbidden boundaries explicitly listed",
    "validator outputs and status",
  ],
  forbiddenBehavior: [
    "no evidence weakening",
    "no test weakening or test skips",
    "no graph/Sigma mutation",
    "no audio input/playback/music runtime behavior",
    "no command execution",
    "no storage/persistence without contract",
    "no token promotion",
    "no CSS variable writes",
    "no accepted evidence hiding without tested helpers",
  ],
  futureUse: "Default for validation-sensitive surfaces unless migrated to mode-aware rendering",
  relatedContracts: [
    "docs/canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md",
    "scripts/data/CONTRACT_TO_CODE_TRACE_MATRIX.md",
  ],
  tags: ["full-evidence", "qa-review", "contract-compliance"],
};

/**
 * Debug Mode
 *
 * Diagnostic IDs, data-testid values, registry IDs, raw status/lifecycle fields.
 * Validator outputs, source paths.
 * Intended for internal QA/debug, not polished user view.
 */
const DEBUG_MODE: ControlPlaneModeMetadata = {
  id: "debug",
  label: "Debug Mode",
  summary:
    "Diagnostic IDs, data-testid values, registry IDs, raw status/lifecycle fields. Validator outputs, source paths. Intended for internal QA/debug.",
  intendedAudience: ["internal QA", "Playwright test targeting", "validator output inspection"],
  defaultUse: "Internal QA debugging, Playwright test targeting, validator output inspection, registry state verification",
  evidenceVisibility: "diagnostic",
  debugVisibility: "full",
  allowedDisclosure: [
    "data-testid values",
    "raw registry IDs",
    "lifecycle fields",
    "validator outputs",
    "raw error messages",
    "source paths and test paths",
  ],
  forbiddenBehavior: [
    "no graph/Sigma mutation",
    "no audio input/playback/music runtime behavior",
    "no command execution",
    "no storage/persistence without contract",
    "no token promotion",
    "no CSS variable writes",
    "no accepted evidence hiding without tested helpers",
    "no test weakening or test skips",
  ],
  futureUse: "Internal QA/debug telemetry, Playwright test targeting, validator output inspection",
  relatedContracts: [
    "docs/canonical/CONTROL_PLANE_AND_SYSTEM_INDEX.md",
  ],
  tags: ["diagnostic", "internal-qa", "test-targeting"],
};

/**
 * Readonly mode registry entries
 */
export const CONTROL_PLANE_MODES: readonly ControlPlaneModeMetadata[] = [
  HUMAN_MODE,
  EVIDENCE_MODE,
  DEBUG_MODE,
] as const;

/**
 * Get all control plane modes
 */
export function getAllControlPlaneModes(): readonly ControlPlaneModeMetadata[] {
  return CONTROL_PLANE_MODES;
}

/**
 * Get control plane mode by ID
 */
export function getControlPlaneModeById(
  id: ControlPlaneModeId,
): ControlPlaneModeMetadata | undefined {
  return CONTROL_PLANE_MODES.find((mode) => mode.id === id);
}

/**
 * Get default control plane mode
 *
 * Default is Evidence Mode for validation-sensitive surfaces.
 * Future mode-aware rendering may use Human Mode as default for overview surfaces.
 */
export function getDefaultControlPlaneMode(): ControlPlaneModeMetadata {
  return EVIDENCE_MODE;
}

/**
 * Get QA-recommended control plane mode
 *
 * QA/Bandit review should use Evidence Mode for full evidence visibility.
 */
export function getQaRecommendedControlPlaneMode(): ControlPlaneModeMetadata {
  return EVIDENCE_MODE;
}

/**
 * Get evidence policy for a mode
 */
export function getModeEvidencePolicy(id: ControlPlaneModeId): EvidencePolicy {
  const mode = getControlPlaneModeById(id);
  if (!mode) {
    throw new Error(`Unknown control plane mode: ${id}`);
  }

  switch (id) {
    case "human":
      return {
        requiresFullEvidence: false,
        allowsSummarization: true,
        requiresTestedHelpers: true,
        allowsLegacyCollapsing: false,
        forbiddenBoundaryVisibility: "summary",
      };
    case "evidence":
      return {
        requiresFullEvidence: true,
        allowsSummarization: false,
        requiresTestedHelpers: false,
        allowsLegacyCollapsing: false,
        forbiddenBoundaryVisibility: "always",
      };
    case "debug":
      return {
        requiresFullEvidence: true,
        allowsSummarization: false,
        requiresTestedHelpers: false,
        allowsLegacyCollapsing: false,
        forbiddenBoundaryVisibility: "always",
      };
    default:
      const _exhaustiveCheck: never = id;
      throw new Error(`Unknown control plane mode: ${_exhaustiveCheck}`);
  }
}

/**
 * Get debug policy for a mode
 */
export function getModeDebugPolicy(id: ControlPlaneModeId): DebugPolicy {
  const mode = getControlPlaneModeById(id);
  if (!mode) {
    throw new Error(`Unknown control plane mode: ${id}`);
  }

  switch (id) {
    case "human":
      return {
        showsDiagnosticIds: false,
        showsDataTestIds: false,
        showsRegistryIds: false,
        showsRawLifecycle: false,
        showsValidatorOutputs: false,
        showsSourcePaths: false,
        intendedForInternalUse: false,
      };
    case "evidence":
      return {
        showsDiagnosticIds: false,
        showsDataTestIds: false,
        showsRegistryIds: true,
        showsRawLifecycle: true,
        showsValidatorOutputs: true,
        showsSourcePaths: true,
        intendedForInternalUse: false,
      };
    case "debug":
      return {
        showsDiagnosticIds: true,
        showsDataTestIds: true,
        showsRegistryIds: true,
        showsRawLifecycle: true,
        showsValidatorOutputs: true,
        showsSourcePaths: true,
        intendedForInternalUse: true,
      };
    default:
      const _exhaustiveCheck: never = id;
      throw new Error(`Unknown control plane mode: ${_exhaustiveCheck}`);
  }
}

/**
 * v69 Retry Relationship
 *
 * v69 retry is future/deferred. Mode registry explicitly marks v69 retry as
 * future/deferred with sliced pass strategy:
 *
 * - v69a: Overview Grid / Summary Cards Only (no collapsing legacy evidence)
 * - v69b: Section Metadata Registry + Test Helper Contract
 * - v69c: Collapse One Legacy Evidence Section at a Time (after validation)
 * - v69d: Repeat Section-by-Section with Cascade Stop Rule
 *
 * Stop conditions:
 * - Any test fails
 * - Evidence becomes unreachable
 * - Helpers do not work
 * - Forbidden boundaries become hidden
 * - Accepted evidence is weakened
 * - Test skips are introduced
 */
export const V69_RETRY_STATUS = {
  status: "deferred" as const,
  reason:
    "v69 retry deferred until mode-aware rendering and helper contracts are stable",
  slicedPassStrategy: [
    "v69a: Overview Grid / Summary Cards Only (no collapsing legacy evidence)",
    "v69b: Section Metadata Registry + Test Helper Contract",
    "v69c: Collapse One Legacy Evidence Section at a Time (after validation)",
    "v69d: Repeat Section-by-Section with Cascade Stop Rule",
  ],
  stopConditions: [
    "any test fails",
    "evidence becomes unreachable",
    "helpers do not work",
    "forbidden boundaries become hidden",
    "accepted evidence is weakened",
    "test skips are introduced",
  ],
};
