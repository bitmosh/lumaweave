import type {
  BanditAdvisorySection,
} from "./qa.types";

// Default advisory content for v13 checklist
export const defaultAdvisoryV13: BanditAdvisorySection = {
  questions: [
    {
      id: "mission-control-primary-role",
      prompt: "Should Mission Control become the primary left-dock cockpit, or remain mostly QA-focused?",
      context: "Mission Control currently serves as QA panel. Consider whether it should expand to broader control plane operations.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "next-major-feature-priority",
      prompt: "Should the next major feature be Graph Inspector v0 or QA Contract Ledger v0?",
      context: "Graph Inspector would show read-only node/edge details. QA Contract Ledger would make accepted QA reports visible as baseline history.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "graph-selection-read-only",
      prompt: "Should graph selection details stay read-only for now?",
      context: "Currently selection details are displayed but not editable. Consider whether editing is needed or if read-only is sufficient.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "experimental-mode-gate",
      prompt: "Should future visual features require a separate 'experimental mode' toggle?",
      context: "This would protect unfinished/future controls from being accidentally enabled in production workflows.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "qa-baseline-ledger",
      prompt: "Should accepted QA reports become a visible baseline ledger?",
      context: "This would create a history of accepted baselines for reference and regression detection.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "docs-registry-relationship",
      prompt: "Should docs and runtime contract registry be kept separate, or should one generate the other later?",
      context: "Currently docs are manual markdown and registry is TypeScript. Consider whether to automate synchronization.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "playwright-coverage-priority",
      prompt: "Should Playwright coverage prioritize graph behavior or Mission Control workflows next?",
      context: "Graph behavior tests verify rendering and interaction. Mission Control workflow tests verify QA submission and history.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "theme-customization-preset-only",
      prompt: "Should theme customization remain preset-only until graph intelligence stabilizes?",
      context: "Custom theme editor is planned but could be deferred until graph intelligence features are more stable.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "control-plane-organization",
      prompt: "Should Control Plane settings be reorganized by task, by system, or by visual layer?",
      context: "Current organization is by category. Consider whether task-based, system-based, or visual-layer-based organization would be more intuitive.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "bandit-proposal-section",
      prompt: "Should Bandit include a proposal section at the end of every major pass?",
      context: "This would make Bandit's thinking more visible and provide structured proposal review.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "graph-inspector-v0",
      title: "Graph Inspector v0",
      summary: "Read-only selected node/edge details panel showing metadata and relationships.",
      rationale: "Users need to inspect node and edge properties without editing them. This provides a read-only view for investigation.",
      risk: "low",
      recommendedNextAction: "Add as next major feature after advisory channel stabilizes.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "qa-contract-ledger-v0",
      title: "QA Contract Ledger v0",
      summary: "Accepted QA reports as visible baseline history with diff comparison.",
      rationale: "Track accepted baselines over time to detect regressions and understand evolution of requirements.",
      risk: "low",
      recommendedNextAction: "Add after Graph Inspector v0 or in parallel.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "experimental-mode-gate",
      title: "Experimental Mode Gate",
      summary: "Protect unfinished/future controls with a separate experimental mode toggle.",
      rationale: "Prevent accidental enabling of incomplete features in production workflows.",
      risk: "low",
      recommendedNextAction: "Implement when first experimental control is added.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "handleset-drift-checker",
      title: "Handleset Drift Checker",
      summary: "Compare docs/registry/runtime coverage to detect drift between documentation and implementation.",
      rationale: "Ensure documentation stays in sync with actual runtime behavior to prevent confusion.",
      risk: "medium",
      recommendedNextAction: "Add as utility after contract registry stabilizes.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "theme-token-coverage-test",
      title: "Theme Token Coverage Test",
      summary: "Stronger automated coverage for all built-in theme tokens.",
      rationale: "Ensure all theme presets render correctly and tokens are applied consistently.",
      risk: "low",
      recommendedNextAction: "Expand existing theme tests to cover all token combinations.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "mission-control-report-export",
      title: "Mission Control Report Export",
      summary: "Copy/download QA reports cleanly in multiple formats (markdown, JSON).",
      rationale: "Enable easier sharing and archival of QA reports for documentation and handoff.",
      risk: "low",
      recommendedNextAction: "Add export options to existing copy functionality.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "graph-search-filter-v0",
      title: "Graph Search / Filter v0",
      summary: "Find nodes by name, type, or property in the graph.",
      rationale: "Large graphs become difficult to navigate without search/filter capabilities.",
      risk: "medium",
      recommendedNextAction: "Implement basic search after graph rendering stabilizes.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "source-link-readiness-audit",
      title: "Source Link Readiness Audit",
      summary: "Prepare for future open-in-editor links by auditing source file references.",
      rationale: "Before adding source file links, ensure all references are accurate and files exist.",
      risk: "low",
      recommendedNextAction: "Audit contract registry source file paths.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "label-preset-system",
      title: "Label Preset System",
      summary: "Save label visibility combinations as presets for quick switching.",
      rationale: "Users often switch between different label configurations (debug mode vs presentation mode).",
      risk: "low",
      recommendedNextAction: "Add after label controls stabilize.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "layout-lens-presets",
      title: "Layout Lens Presets",
      summary: "Switch between exploration views (constellation, district, pipeline, etc.).",
      rationale: "Different graph layouts are useful for different exploration tasks. Presets enable quick switching.",
      risk: "medium",
      recommendedNextAction: "Implement after basic layout engine stabilizes.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Graph Inspector v0",
      whyItMatters: "Users need to inspect node/edge details without editing. Foundation for future editing capabilities.",
      suggestedFutureBite: "Graph Inspector v0",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Experimental Mode Gate",
      whyItMatters: "Protect unfinished features from accidental production use.",
      suggestedFutureBite: "Experimental Mode Gate",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 3,
      title: "QA Contract Ledger v0",
      whyItMatters: "Track accepted baselines for regression detection and historical reference.",
      suggestedFutureBite: "QA Contract Ledger v0",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Handleset Drift Checker",
      whyItMatters: "Ensure docs/registry/runtime stay in sync to prevent confusion.",
      suggestedFutureBite: "Handleset Drift Checker",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Source Link Readiness Audit",
      whyItMatters: "Prepare for future open-in-editor links by verifying source references.",
      suggestedFutureBite: "Source Link Readiness Audit",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 6,
      title: "Theme Token Coverage Test",
      whyItMatters: "Ensure all theme presets render correctly across all tokens.",
      suggestedFutureBite: "Theme Token Coverage Test",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 7,
      title: "Mission Control Report Export",
      whyItMatters: "Enable easier sharing and archival of QA reports.",
      suggestedFutureBite: "Mission Control Report Export",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 8,
      title: "Graph Search / Filter v0",
      whyItMatters: "Large graphs need search/filter for navigation.",
      suggestedFutureBite: "Graph Search / Filter v0",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 9,
      title: "Label Preset System",
      whyItMatters: "Quick switching between label configurations for different workflows.",
      suggestedFutureBite: "Label Preset System",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 10,
      title: "Layout Lens Presets",
      whyItMatters: "Different layouts for different exploration tasks.",
      suggestedFutureBite: "Layout Lens Presets",
      risk: "medium",
      status: "candidate",
    },
  ],
};

// Advisory content for v15 - Mission Control Advisory Channel
export const advisoryV15: BanditAdvisorySection = {
  questions: [
    {
      id: "mission-control-advisory-channel-v15",
      prompt: "Should Mission Control Advisory Channel become the primary left-dock cockpit?",
      context: "Mission Control currently serves as QA panel. Consider whether it should expand to broader control plane operations.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [],
  backlog: [],
};

// Advisory content for v16c - Graph State Preservation + Advisory Rotation
export const advisoryV16c: BanditAdvisorySection = {
  questions: [
    {
      id: "graph-state-preservation-priority",
      prompt: "Should graph interaction state (selection, styling) be preserved during settings changes?",
      context: "Currently, changing sliders like Node Size or Link Distance can reset visual state. Preserving selection during settings changes would improve UX.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "camera-preserve-priority",
      prompt: "Should camera position and zoom be preserved during settings changes?",
      context: "Camera is currently reset only once on initial load. Should it remain stable during all slider changes?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "advisory-question-rotation-model",
      prompt: "Should Bandit Advisory Questions be generated per QA checklist instead of static?",
      context: "Current questions are static v13 questions. Per-checklist questions would be more relevant to each pass.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "graph-state-preservation-v0",
      title: "Graph State Preservation v0",
      summary: "Preserve selected node/edge styling during settings changes by applying selection policy before Sigma initialization.",
      rationale: "Selection styling was applied in a separate useEffect after Sigma render, causing visual reset. Applying before render eliminates the timing gap.",
      risk: "low",
      recommendedNextAction: "Implement selection policy application before Sigma init in main rebuild effect.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "per-checklist-advisory-questions",
      title: "Per-Checklist Advisory Questions",
      summary: "Make Bandit Questions registry-driven per checklist instead of static v13 questions.",
      rationale: "Static questions become stale across passes. Per-checklist questions stay relevant to current pass context.",
      risk: "low",
      recommendedNextAction: "Implement advisory lookup function based on active checklist featureId/version.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Graph State Preservation v0",
      whyItMatters: "Settings changes should not reset visual state - this is jarring and breaks user workflow.",
      suggestedFutureBite: "Apply selection policy before Sigma initialization",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Per-Checklist Advisory Questions",
      whyItMatters: "Static questions become stale. Per-pass questions improve advisory relevance.",
      suggestedFutureBite: "Implement advisory lookup by checklist key",
      risk: "low",
      status: "candidate",
    },
  ],
};

// Advisory content for v16d - QA Advisory Protocol + Binding
export const advisoryV16d: BanditAdvisorySection = {
  questions: [
    {
      id: "checklist-identity-rejection",
      prompt: "Should QA reports reject submission when header/dropdown/report checklist identity disagree?",
      context: "Currently, checklist identity drift can occur between UI state and submitted report. Rejecting on drift would enforce consistency.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "report-based-question-generation",
      prompt: "Should Bandit Questions be generated from the final report of the current pass?",
      context: "Static questions become stale. Generating from final report would make questions context-aware and pass-specific.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "proposal-decision-persistence",
      prompt: "Should proposal decisions persist globally while proposal notes reset per report?",
      context: "Decisions represent durable roadmap choices. Notes are per-report context. Separating persistence makes sense.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "stale-question-auto-hide",
      prompt: "Should stale advisory questions be hidden automatically after a new active checklist is created?",
      context: "Old questions clog the feedback loop. Auto-hiding would keep the advisory stream current.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "mandatory-typecheck-playwright",
      prompt: "Should Typecheck and Playwright remain mandatory checks in every checklist?",
      context: "These ensure code quality and test coverage. Making them mandatory prevents regression.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "checklist-identity-hard-blocker",
      prompt: "Should checklist identity drift be promoted to a hard blocker?",
      context: "Drift between UI state and report key indicates a bug. Promoting to hard blocker would catch this earlier.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "roadmap-ledger",
      prompt: "Should accepted advisory decisions appear in a compact roadmap ledger?",
      context: "Accepted decisions represent roadmap commitments. A ledger would make these visible and trackable.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "advisory-set-key-debug",
      prompt: "Should QA reports include an \"Advisory Set Key\" for debugging?",
      context: "Knowing which advisory set was used helps debug stale question issues and version tracking.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "manual-qa-risks-report",
      prompt: "Should Bandit include \"open manual QA risks\" in every final report?",
      context: "Manual QA identifies risks that automated tests miss. Including these in reports ensures they're tracked.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pass-specific-user-questions",
      prompt: "Should each major pass include a short \"questions for user\" section generated from changed files and final report?",
      context: "Context-aware questions help the user reflect on the current pass. Generated from pass context would be more relevant.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "checklist-identity-validation",
      title: "Checklist Identity Validation",
      summary: "Validate that header badge, dropdown, report key, and advisory content all agree on the same checklist.",
      rationale: "Identity drift causes confusion and stale questions. Validation would catch this early.",
      risk: "low",
      recommendedNextAction: "Add identity validation in submitQaReport, reject if mismatch detected.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "per-checklist-advisory-registry",
      title: "Per-Checklist Advisory Registry",
      summary: "Ensure every checklist has its own advisory content via getAdvisoryForChecklist.",
      rationale: "Per-checklist advisory prevents question staleness and keeps feedback loop current.",
      risk: "low",
      recommendedNextAction: "Create advisoryV15, advisoryV16d, and update getAdvisoryForChecklist.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Checklist Identity Validation",
      whyItMatters: "Identity drift causes stale questions and confusion. Validation enforces consistency.",
      suggestedFutureBite: "Add identity check in submitQaReport",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Report-Based Question Generation",
      whyItMatters: "Static questions become stale. Generated questions stay relevant to current pass.",
      suggestedFutureBite: "Implement AI question generation from final report",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Roadmap Ledger",
      whyItMatters: "Accepted decisions need to be visible and trackable. A ledger provides this visibility.",
      suggestedFutureBite: "Create roadmap ledger component",
      risk: "low",
      status: "candidate",
    },
  ],
};

// Small fallback advisory for checklists without specific advisory content
export const fallbackAdvisory: BanditAdvisorySection = {
  questions: [
    {
      id: "fallback-no-questions",
      prompt: "This checklist has no specific advisory questions. Should we add pass-specific questions?",
      context: "Pass-specific questions improve advisory relevance. Consider adding questions for this checklist.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [],
  backlog: [],
};

// Advisory content for v16e (Checklist Identity Validation)
export const advisoryV16e: BanditAdvisorySection = {
  questions: [
    {
      id: "identity-validation-hard-blocker",
      prompt: "Should checklist identity validation remain a hard blocker for submission?",
      context: "Submission is blocked when header badge, dropdown, report key, and advisory set disagree. This prevents inconsistent reports.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "identity-diagnostics-visibility",
      prompt: "Should identity diagnostics remain visible in the Debug tab for troubleshooting?",
      context: "Debug tab shows Active Checklist, Dropdown Selection, Report Key, Advisory Set Key, and Identity Valid status.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "checklist-identity-validation",
      title: "Checklist Identity Validation",
      summary: "Validate that header badge, dropdown, report key, and advisory content all agree on the same checklist.",
      rationale: "Identity drift causes confusion and stale questions. Validation would catch this early.",
      risk: "low",
      recommendedNextAction: "Add identity validation in submitQaReport, reject if mismatch detected.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "per-checklist-advisory-registry",
      title: "Per-Checklist Advisory Registry",
      summary: "Ensure every checklist has its own advisory content via getAdvisoryForChecklist.",
      rationale: "Per-checklist advisory prevents question staleness and keeps feedback loop current.",
      risk: "low",
      recommendedNextAction: "Create advisoryV15, advisoryV16d, and update getAdvisoryForChecklist.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Checklist Identity Validation",
      whyItMatters: "Identity drift causes stale questions and confusion. Validation enforces consistency.",
      suggestedFutureBite: "Add identity check in submitQaReport",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Report-Based Question Generation",
      whyItMatters: "Static questions become stale. Generated questions stay relevant to current pass.",
      suggestedFutureBite: "Implement AI question generation from final report",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Roadmap Ledger",
      whyItMatters: "Accepted decisions need to be visible and trackable. A ledger provides this visibility.",
      suggestedFutureBite: "Create roadmap ledger component",
      risk: "low",
      status: "candidate",
    },
  ],
};

// Advisory content for v17a - QA Key Binding Recovery
export const advisoryV17a: BanditAdvisorySection = {
  questions: [
    {
      id: "sub-pass-qa-keys",
      prompt: "Should sub-pass QA keys use suffixes like v17a/v17b before moving to v18?",
      context: "v17a is a repair pass inside the v17 family. Sub-pass tags allow for repairs/continuations without moving to a new major version.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "obsolete-playwright-tests",
      prompt: "Should obsolete Playwright tests be deleted/replaced instead of skipped?",
      context: "Current test suite has 12 skipped tests. Deleting obsolete tests reduces confusion about test debt.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "qa-report-fail-on-skipped",
      prompt: "Should a QA report fail if Playwright has skipped tests?",
      context: "The v17 checklist expected 0 skipped but Playwright reported 12 skipped. Should this block acceptance?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "proposal-decisions-persist-all",
      prompt: "Should proposal decisions persist across all qaKey changes unless manually reset?",
      context: "Proposal decisions represent durable roadmap choices. They should persist unless explicitly changed.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "report-include-next-qaKey",
      prompt: "Should every future final report include the next suggested qaKey?",
      context: "This would help track the evolution of QA passes and suggest the next step in the sequence.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "report-based-question-generation",
      prompt: "Should report-based question generation wait until qaKey/checkId/reportId are stable?",
      context: "Generating questions from reports requires stable identity. Should this wait until after the current identity is locked?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "sub-pass-qa-key-model",
      title: "Sub-Pass QA Key Model",
      summary: "Define v17a/v17b/v17c as repair passes within v17 family, move to v18 for next major topic.",
      rationale: "Allows for repairs and continuations without version number inflation.",
      risk: "low",
      recommendedNextAction: "Update QA advisory protocol to define sub-pass version tag model",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "delete-obsolete-playwright-tests",
      title: "Delete Obsolete Playwright Tests",
      summary: "Remove v15/v16d tests that are no longer relevant to the current system.",
      rationale: "Obsolete tests create confusion about test debt. Clearing them makes the test suite more accurate.",
      risk: "low",
      recommendedNextAction: "Delete 11 obsolete v15/v16d tests, replace with v17a equivalents where needed",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Sub-Pass QA Key Model",
      whyItMatters: "Allows repairs and continuations without version number inflation. Makes QA evolution clearer.",
      suggestedFutureBite: "Update QA advisory protocol with sub-pass version tag model",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Delete Obsolete Playwright Tests",
      whyItMatters: "Obsolete tests create confusion about test debt. Clearing them makes the test suite more accurate.",
      suggestedFutureBite: "Delete 11 obsolete v15/v16d tests",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Report-Based Question Generation",
      whyItMatters: "Generating questions from reports makes them context-aware and pass-specific.",
      suggestedFutureBite: "Implement AI question generation from final report",
      risk: "medium",
      status: "candidate",
    },
  ],
};

// Advisory lookup function - returns appropriate advisory based on qaKey
export function getAdvisoryForChecklist(featureId: string, qaVersion: number): BanditAdvisorySection {
  const checklistKey = `${featureId}:v${qaVersion}`;
  
  // v16c has its own advisory set
  if (checklistKey === "graph-state-preservation-and-advisory-rotation-v16c:v18") {
    return advisoryV16c;
  }
  
  // v16d has its own advisory set
  if (checklistKey === "qa-advisory-protocol-and-binding-v16d:v16") {
    return advisoryV16d;
  }

  // v16e has its own advisory set
  if (checklistKey === "checklist-identity-validation-v16e:v17") {
    return advisoryV16e;
  }

  // v15 has its own advisory set
  if (featureId === "mission-control-advisory-channel" && qaVersion === 15) {
    return advisoryV15;
  }
  
  // v13 and older use default advisory
  if (qaVersion === 13) {
    return defaultAdvisoryV13;
  }
  
  // Fallback to small clearly-labeled fallback for unknown checklists
  return fallbackAdvisory;
}

// Advisory lookup function keyed by canonical qaKey
export function getAdvisoryForQaKey(qaKey: string): BanditAdvisorySection {
  // v17a has its own advisory set
  if (qaKey === "v17a") {
    return advisoryV17a;
  }
  
  // v17 has its own advisory set
  if (qaKey === "v17") {
    return advisoryV16e;
  }
  
  // v18 (v16c) has its own advisory set
  if (qaKey === "v18") {
    return advisoryV16c;
  }
  
  // v16 (v16d) has its own advisory set
  if (qaKey === "v16") {
    return advisoryV16d;
  }
  
  // v15 has its own advisory set
  if (qaKey === "v15") {
    return advisoryV15;
  }
  
  // v13 uses default advisory
  if (qaKey === "v13") {
    return defaultAdvisoryV13;
  }
  
  // Fallback to small clearly-labeled fallback for unknown qaKeys
  return {
    questions: [
      {
        id: "fallback-no-advisory",
        prompt: "No advisory questions found for this QA key",
        context: `The QA key "${qaKey}" does not have specific advisory questions configured.`,
        responseType: "choice",
        userResponse: "",
        status: "unanswered",
      },
    ],
    proposals: [],
    backlog: [],
  };
}
