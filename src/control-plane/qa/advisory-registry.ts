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

export const advisoryV30b: BanditAdvisorySection = {
  questions: [
    {
      id: "v30b-empty-state",
      prompt: "Does the Theme Mapping Panel render a clear empty state when no target is pinned?",
      context: "Panel must coach operators to use Alt+Shift+P without implying editing is available.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-registered-metadata",
      prompt: "Does a pinned registered target display label, themeTargetId, surface, status, handle, editable props, and token bindings?",
      context: "Registered surfaces need the full contract visible before we ever enable editing.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-candidate-metadata-only",
      prompt: "Does a pinned candidate display descriptor/testId + signals without showing editable controls?",
      context: "Candidates are diagnostic only until they complete ThemeTargetRegistry review.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-no-editable-controls",
      prompt: "Are candidate/unknown targets kept from generating editable controls while registered targets show disabled controls only?",
      context: "Bridge must prove we can distinguish future-control rows without enabling them.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-storage-locked",
      prompt: "Do all rendered controls include a clear read-only + storage-locked notice?",
      context: "Theme Mapping storage contract is still blocked; shell must remind operators of that fact.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-no-runtime-mutation",
      prompt: "Did this pass avoid token mutation, color pickers, override storage, preset save, and settings schema changes?",
      context: "Shell-only work must not leak editing semantics into runtime yet.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v30b-inspector-invariants",
      prompt: "Did UI Inspector pin/unpin, ghost overlay, warning badges, and graph renderer behavior remain unchanged?",
      context: "Bridge consumers must never regress the inspector stack or Sigma exclusions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "visual-handles-cite-token-paths",
      title: "Visual handles cite token paths",
      summary: "Document handle → ThemeTokenPath references so generated controls inherit canonical bindings.",
      rationale: "Mapping shell exposed the need for trustworthy handle/token alignment before generation.",
      risk: "medium",
      recommendedNextAction: "Update UI Surface & Handle Inventory + Mission Control Debug to cite token paths per handle.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "generated-readonly-controls",
      title: "Generated read-only Theme Mapping controls",
      summary: "Emit deterministic disabled controls per editable property once handles cite tokens.",
      rationale: "Ensures UI scaffolding exists before override storage and editing semantics ship.",
      risk: "medium",
      recommendedNextAction: "Prototype generated disabled controls referencing the handle/token table after v30b.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Theme Mapping Panel v0",
      whyItMatters:
        "Complete the Theme Mapping dependency ladder: entry contract (v28), lock/pin bridge (v29/v30a), read-only shell (v30b). Next steps require modular pockets ready for other control-plane sections.",
      suggestedFutureBite:
        "Architecture note: keep Mission Control panels modular so Theme Mapping, physics settings, label controls, inspector evidence, graph lenses, and QA workflows can share reusable pockets.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme override/storage contract",
      whyItMatters: "Editable controls cannot ship without a formal override data model and governance.",
      suggestedFutureBite: "Define override schema, lifecycle, and QA evidence before any runtime mutation.",
      risk: "high",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Once overrides exist, presets and persistence unlock practical workflows.",
      suggestedFutureBite: "Implement storage backend, preset save/load, reset/revert, and QA hooks after contract approval.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Command Deck / Hotkey Registry planning",
      whyItMatters: "Future hotkeys (e.g., Alt+Shift+P) need a formal registry before more diagnostic shortcuts appear.",
      suggestedFutureBite: "Design Command Deck scaffolding and governance before additional shortcuts ship.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Graph behavior must remain stable while Mission Control gains more panels.",
      suggestedFutureBite: "Add coverage for physics sliders/toggles to guard against future control-plane changes.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV34b: BanditAdvisorySection = {
  questions: [
    {
      id: "v34b-single-control-enabled",
      prompt: "Is exactly one control enabled for panel.background on mission-control.panel?",
      context: "v34b should enable only the panel.background control on mission-control.panel. All other controls must remain disabled.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34b-control-wired",
      prompt: "Is the enabled control wired to v34a global override storage?",
      context: "Editing the control should write a validated global override via setGlobalOverride. The value should persist across page reloads.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34b-reset-works",
      prompt: "Does the reset button clear the override?",
      context: "Clicking reset should call removeGlobalOverride and clear the stored value. The input should revert to empty.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34b-others-disabled",
      prompt: "Do all other controls remain disabled?",
      context: "Only panel.background on mission-control.panel should be enabled. All other rows on all other targets must remain disabled.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34b-candidates-no-editing",
      prompt: "Do candidate targets show no editing controls?",
      context: "Candidate/unregistered targets should remain diagnostic only with no enabled editing controls.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v34c-preset-export",
      title: "v34c Preset Save/Export Capability",
      summary: "Add the smallest safe preset save/export capability based on accepted override storage",
      rationale: "After editing controls are working, users may want to save custom theme configurations as presets for reuse.",
      risk: "medium",
      recommendedNextAction: "Implement in v34c after v34b is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v34c Preset Save/Export Capability",
      whyItMatters: "Users may want to save custom theme configurations as presets for reuse.",
      suggestedFutureBite: "Export current overrides as JSON",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Enable additional narrow controls",
      whyItMatters: "After panel.background control is stable, enable more controls incrementally.",
      suggestedFutureBite: "Enable panel.border or text.primary for mission-control.panel",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Expand to target-scoped overrides",
      whyItMatters: "Global-only is the smallest safe scope. Target-scoped overrides enable per-surface customization.",
      suggestedFutureBite: "Add target-scoped storage after global-only is stable",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV36c: BanditAdvisorySection = {
  questions: [
    {
      id: "v36c-command-registry-visible",
      prompt: "Is the Command Registry visible in the Command Deck?",
      context: "Command Deck shell should display a Command Registry section showing command metadata.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36c-command-metadata-displayed",
      prompt: "Is command metadata displayed correctly?",
      context: "Commands should show title, description, category, and status.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36c-read-only-notice-displayed",
      prompt: "Is the read-only notice displayed?",
      context: "Shell should show 'Command registry is read-only. No commands can be executed.'",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v36d-command-execution",
      title: "v36d Command Execution",
      summary: "Add command execution capability to Command Deck",
      rationale: "After command metadata is displayed, users may want to execute commands from the Command Deck.",
      risk: "high",
      recommendedNextAction: "Implement in v36d or later after v36c is accepted and contract is updated",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "v36e-command-palette",
      title: "v36e Command Palette Integration",
      summary: "Add keyboard-driven command palette for accessing commands",
      rationale: "Users may want a keyboard-driven interface for discovering and executing commands.",
      risk: "medium",
      recommendedNextAction: "Implement in v36e or later after v36c is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v36d Command Execution",
      whyItMatters: "Users may want to execute commands from the Command Deck.",
      suggestedFutureBite: "Add command execution with proper governance and testing",
      risk: "high",
      status: "candidate",
    },
    {
      rank: 2,
      title: "v36e Command Palette Integration",
      whyItMatters: "Users may want to access commands via a keyboard-driven command palette.",
      suggestedFutureBite: "Add command palette with fuzzy search and keyboard navigation",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV38: BanditAdvisorySection = {
  questions: [
    {
      id: "v38-perspective-registry-exists",
      prompt: "Does the perspective registry exist with typed metadata?",
      context: "src/control-plane/perspectives/perspectiveRegistry.ts should exist with Perspective interface and perspectiveRegistry export.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v38-perspective-panel-visible",
      prompt: "Is the Perspective System section visible in Command Deck Shell?",
      context: "Command Deck shell should display a Perspective System section showing built-in perspectives.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v38-built-in-perspectives-listed",
      prompt: "Are the built-in perspectives listed correctly?",
      context: "Default Architecture, Theme Mapping, Command Deck, QA Evidence should be displayed with title, description, category, status.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v38-future-perspectives-labeled",
      prompt: "Are future perspectives labeled as locked?",
      context: "Graph Physics and Source Adapter perspectives should show 'Locked in v38 - requires explicit contract' label.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v38-read-only-passive",
      prompt: "Is the perspective registry read-only?",
      context: "Panel should show 'Perspective registry is read-only. No perspective switching.'",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v39-graph-physics-playwright",
      title: "v39 Graph Physics Playwright Coverage Expansion",
      summary: "Expand Playwright coverage for graph physics sliders/toggles",
      rationale: "Before adding perspective-based graph physics, we need stable test coverage for existing physics controls.",
      risk: "medium",
      recommendedNextAction: "Implement in v39 after v38 is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v39 Graph Physics Playwright Coverage",
      whyItMatters: "Stabilize physics sliders/toggles before adding perspective-based graph physics.",
      suggestedFutureBite: "Add Playwright tests for graph physics behavior",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "v40 Graph View Element Registry",
      whyItMatters: "Refresh Graph View Element Registry and Graph Visual Policy before adding perspective-based graph filtering.",
      suggestedFutureBite: "Update registry and policy for graph visual behavior",
      risk: "high",
      status: "candidate",
    },
  ],
};

export const advisoryV36b: BanditAdvisorySection = {
  questions: [
    {
      id: "v36b-hotkey-registry-visible",
      prompt: "Is the Hotkey Registry visible in the Command Deck?",
      context: "Command Deck shell should display a Hotkey Registry section showing accepted hotkeys.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36b-accepted-hotkeys-displayed",
      prompt: "Are the accepted hotkeys displayed correctly?",
      context: "Alt+Shift+I (Inspector Toggle) and Alt+Shift+P (Pin/Unpin) should be shown with descriptions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36b-governance-policy-displayed",
      prompt: "Is the governance policy displayed?",
      context: "Shell should show 'No new hotkeys may be added without registry approval'.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v36c-command-metadata",
      title: "v36c Command Registry Metadata",
      summary: "Add command registry metadata display in Command Deck shell",
      rationale: "After the Hotkey Registry inventory exists, users need to see command metadata (name, description, category).",
      risk: "low",
      recommendedNextAction: "Implement in v36c after v36b is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v36c Command Registry Metadata",
      whyItMatters: "Users need to see command metadata in the Command Deck.",
      suggestedFutureBite: "Add command registry metadata display with name, description, category",
      risk: "low",
      status: "candidate",
    },
  ],
};

export const advisoryV36a: BanditAdvisorySection = {
  questions: [
    {
      id: "v36a-shell-visible",
      prompt: "Is the Command Deck shell visible in Mission Control?",
      context: "Command Deck panel should appear in the left sidebar below the QA panel.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36a-shell-readonly",
      prompt: "Does the shell display read-only status correctly?",
      context: "Shell should show 'Read-Only Shell' status and locked/deferred execution message.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36a-no-execution-controls",
      prompt: "Are there no command execution controls in the shell?",
      context: "Shell must have no enabled buttons or execution handlers - it is a discovery surface only.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v36a-no-new-hotkeys",
      prompt: "Were no new hotkeys added?",
      context: "v36a must not add any new keyboard shortcuts. Only existing Alt+Shift+I and Alt+Shift+P should remain.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v36b-hotkey-inventory",
      title: "v36b Hotkey Registry Inventory",
      summary: "Add read-only Hotkey Registry inventory showing accepted hotkeys and banned hotkey policy",
      rationale: "After the Command Deck shell exists, users need to see which hotkeys are registered and which are banned.",
      risk: "low",
      recommendedNextAction: "Implement in v36b after v36a is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v36b Hotkey Registry Inventory",
      whyItMatters: "Users need visibility into the hotkey registry and banned hotkey policy.",
      suggestedFutureBite: "Add read-only inventory panel showing Alt+Shift+I, Alt+Shift+P, and banned hotkey list",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "v36c Command Registry Metadata",
      whyItMatters: "Users need to see command metadata (name, description, category) in the Command Deck.",
      suggestedFutureBite: "Add command registry metadata display in Command Deck shell",
      risk: "low",
      status: "candidate",
    },
  ],
};

export const advisoryV34c1: BanditAdvisorySection = {
  questions: [
    {
      id: "v34c1-export-empty-works",
      prompt: "Does export work correctly when no overrides exist?",
      context: "exportGlobalThemeOverrideBundle should return a valid bundle with empty overrides array when storage is empty.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34c1-export-valid-overrides",
      prompt: "Does export include only canonical token path overrides?",
      context: "Export should only include validated canonical ThemeTokenPath entries. Invalid/noncanonical/planned tokens must be filtered out.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34c1-export-sanitizes-invalid",
      prompt: "Does export sanitize invalid data from localStorage?",
      context: "If localStorage contains invalid manual junk, export should filter/reject it according to v33/v34a validation rules.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34c1-export-does-not-mutate",
      prompt: "Does export mutate storage or base presets?",
      context: "exportGlobalThemeOverrideBundle must be read-only. It should not mutate localStorage or base preset files.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34c1-export-format-correct",
      prompt: "Does export return the correct bundle format?",
      context: "Export should return { version: 1, kind: \"lumaweave.themeOverrideBundle\", scope: \"global\", overrides: [...] }",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v34c2-preset-import",
      title: "v34c2 Preset Import/Apply Capability",
      summary: "Add the smallest safe preset import/apply capability based on accepted export format",
      rationale: "After export is working, users may want to import previously exported theme configurations.",
      risk: "medium",
      recommendedNextAction: "Implement in v34c2 after v34c1 is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v34c2 Preset Import/Apply Capability",
      whyItMatters: "Users may want to import previously exported theme configurations.",
      suggestedFutureBite: "Import override bundle and apply to storage",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Enable additional narrow controls",
      whyItMatters: "After panel.background control is stable, enable more controls incrementally.",
      suggestedFutureBite: "Enable panel.border or text.primary for mission-control.panel",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Expand to target-scoped overrides",
      whyItMatters: "Global-only is the smallest safe scope. Target-scoped overrides enable per-surface customization.",
      suggestedFutureBite: "Add target-scoped storage after global-only is stable",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV34a: BanditAdvisorySection = {
  questions: [
    {
      id: "v34a-storage-validation",
      prompt: "Does the storage module correctly validate canonical token paths and reject planned/noncanonical strings?",
      context: "Storage must only accept canonical ThemeTokenPath values. Planned tokens and noncanonical strings should be rejected with clear error messages.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34a-reset-remove",
      prompt: "Do reset and remove behaviors work correctly?",
      context: "Storage must support removeGlobalOverride for individual paths and resetAllOverrides for clearing all overrides.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34a-persistence",
      prompt: "Does storage persist correctly across page reloads?",
      context: "localStorage should persist overrides across browser sessions. Test this by setting an override, reloading, and verifying it persists.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34a-base-preset-immutable",
      prompt: "Do base presets remain immutable?",
      context: "Storage should not mutate built-in preset definitions. Verify preset files are unchanged and overrides are stored separately.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v34a-controls-readonly",
      prompt: "Do Theme Mapping Panel controls remain read-only?",
      context: "v34a is storage-only. Controls should still be disabled. v34b will enable editing UI.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v34b-narrow-control",
      title: "v34b Enable One Narrow Theme Mapping Control",
      summary: "Enable exactly one narrow editing path in the Theme Mapping Panel using v34a global override storage",
      rationale: "After storage foundation is stable, enable one minimal control to prove the editing path works. Start with a single canonical token path like panel.background.",
      risk: "low",
      recommendedNextAction: "Implement in v34b after v34a is accepted",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v34b Enable One Narrow Theme Mapping Control",
      whyItMatters: "After storage foundation is stable, enable one minimal control to prove the editing path works.",
      suggestedFutureBite: "Enable panel.background control with text input",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 2,
      title: "v34c Preset Save/Export Capability",
      whyItMatters: "Users may want to save custom theme configurations as presets for reuse.",
      suggestedFutureBite: "Export current overrides as JSON",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Expand to target-scoped overrides",
      whyItMatters: "Global-only is the smallest safe scope. Target-scoped overrides enable per-surface customization.",
      suggestedFutureBite: "Add target-scoped storage after global-only is stable",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV33: BanditAdvisorySection = {
  questions: [
    {
      id: "v33-smallest-safe-scope",
      prompt: "Should v34 start with global-only overrides, or include target-scoped overrides from the start?",
      context: "The contract proposes global, theme target, and visual handle scopes. Starting with global-only is the smallest safe initial scope, but target-scoped may be more useful.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v33-reset-semantics",
      prompt: "Should reset/remove semantics be per-scope or global?",
      context: "Users may want to reset all overrides, or reset only specific scopes (e.g., reset target overrides while keeping global overrides).",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v33-validation-migration",
      prompt: "How strict should validation and migration requirements be for v34?",
      context: "Storage must validate token paths and support migration for schema changes. Should migration be automatic or require user confirmation?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v33-preset-save-split",
      prompt: "Should preset save remain deferred to v34b, or be included in v34?",
      context: "The contract suggests preset save is a separate capability. v34 could implement override-only storage first, then add preset save in v34b.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v33-storage-evidence",
      prompt: "How should storage evidence be exposed in QA Debug/Mission Control?",
      context: "Once v34 implements storage, users and QA need visibility into stored overrides. Should this be in the Debug tab, Mission Control, or both?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v33-contract-completeness",
      prompt: "Does the v33 contract adequately define the override model for v34 implementation?",
      context: "Review the contract doc for completeness: definitions, scope model, eligible tokens, storage boundary, preset relationship, validation requirements, and preconditions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "v34-global-only-storage",
      title: "v34 Global-Only Override Storage",
      summary: "Implement theme override storage with global scope only in v34",
      rationale: "Global-only scope is the smallest safe initial scope. It simplifies storage, validation, and reset behavior. Target-scoped and visual handle-scoped overrides can be added in v34b or later.",
      risk: "low",
      recommendedNextAction: "Implement in v34 after v33 contract acceptance",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "v34-target-scoped-storage",
      title: "v34 Target-Scoped Override Storage",
      summary: "Implement theme override storage with both global and target-scoped overrides in v34",
      rationale: "Target-scoped overrides enable per-surface customization, which is more useful than global-only. However, it adds complexity to storage, validation, and reset behavior.",
      risk: "medium",
      recommendedNextAction: "Consider for v34b after global-only storage is stable",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "v34 Theme Override Storage Implementation",
      whyItMatters: "Storage is required before any editing behavior can be implemented in the Theme Mapping Panel.",
      suggestedFutureBite: "Implement override storage with global scope only",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Enable Theme Mapping Panel Controls",
      whyItMatters: "After storage is implemented, the disabled controls can be enabled to allow actual theme editing.",
      suggestedFutureBite: "Wire controls to storage read/write operations",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Preset Save/Export Capability",
      whyItMatters: "Users may want to save custom theme configurations as presets for reuse.",
      suggestedFutureBite: "Implement preset save/export after override storage is stable",
      risk: "low",
      status: "candidate",
    },
  ],
};

export const advisoryV32: BanditAdvisorySection = {
  questions: [
    {
      id: "v32-registered-shows-generated-rows",
      prompt: "Do registered pinned targets show generated read-only control rows?",
      context: "When a registered Theme Target is pinned, the Theme Mapping Panel should display disabled control rows for each editable property derived from the target's metadata.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v32-rows-show-canonical-token",
      prompt: "Do generated rows display canonical token paths?",
      context: "Each control row should show the canonical token path from THEME_TOKEN_PATH_MAP.md (e.g., 'Canonical Token: panel.background').",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v32-rows-show-visual-handle",
      prompt: "Do generated rows show visual handle relationship?",
      context: "Control rows should display the visual handle when known (e.g., 'Visual Handle: lw-panel').",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v32-rows-are-disabled",
      prompt: "Are generated rows rendered as disabled/read-only?",
      context: "Control rows should be rendered as disabled div elements with no input behavior, not as editable form controls.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v32-candidate-no-controls",
      prompt: "Do candidate targets not show generated controls?",
      context: "Pinned candidate targets should show diagnostic metadata only, not generated control rows.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v32-no-editing",
      prompt: "Is this pass read-only with no editing/storage changes?",
      context: "Panel remains read-only; no schema/storage mutations. Only generated disabled control rows are added.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "theme-override-storage",
      title: "Theme Override Storage",
      summary: "Implement override storage and preset saving for Theme Mapping Panel",
      rationale: "The Theme Mapping Panel currently shows generated read-only controls. To enable actual editing, we need storage for theme overrides and preset saving.",
      risk: "medium",
      recommendedNextAction: "Defer to v33–v34 after v32 acceptance",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Design theme override storage schema",
      whyItMatters: "Storage schema is foundational for v33–v34 storage work.",
      suggestedFutureBite: "Draft storage schema proposal in docs",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Enable Theme Mapping Panel controls",
      whyItMatters: "This is the final step in the Theme Mapping Panel arc.",
      suggestedFutureBite: "Implement after v33–v34 storage work",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV31: BanditAdvisorySection = {
  questions: [
    {
      id: "v31-visual-handle-docs-updated",
      prompt: "Does the Visual Handle Library doc cite v31 and include canonical token paths for active handles?",
      context: "Active handles (lw-panel, lw-card, lw-badge, lw-divider, lw-control-grid) must cite canonical token paths matching Theme Target Registry bindings.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v31-active-handles-cite-correct-paths",
      prompt: "Do lw-panel, lw-card, lw-badge, lw-divider cite the correct canonical token paths?",
      context: "lw-panel should cite panel.background, panel.border, text.primary. lw-card should cite panel.background, panel.border, text.primary. lw-badge should cite accent.primary, text.primary. lw-divider should cite panel.border.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v31-scaffolded-handles-cite-planned-paths",
      prompt: "Do scaffolded handles cite only canonical token paths (not planned tokens)?",
      context: "lw-button should cite only text.primary, accent.primary (control.background/control.border are planned and not promoted). lw-node-glow should cite graph.node.fill, effects.glow.intensity. lw-edge-glow should cite graph.edge.stroke, effects.glow.intensity.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v31-no-planned-tokens-promoted",
      prompt: "Are no planned-only token paths promoted to canonical in this pass?",
      context: "control.background, control.border, and other planned tokens must remain in the planned section of THEME_TOKEN_PATH_MAP.md and not be cited as canonical in visual handle docs.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v31-token-paths-match-registry",
      prompt: "Do visual handle token paths align with Theme Target Registry surface bindings?",
      context: "lw-panel paths should match mission-control.panel and settings.panel bindings. lw-card paths should match mission-control.*card bindings. All cited paths must exist in THEME_TOKEN_PATH_MAP.md.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v31-no-runtime-changes",
      prompt: "Did this pass avoid CSS, component, or runtime code changes (docs-only)?",
      context: "v31 is a docs/contract/QA pass to prevent drift between visual handles and canonical tokens. No runtime changes should occur.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "generated-readonly-controls",
      title: "Generated read-only Theme Mapping controls",
      summary: "Emit deterministic disabled controls per editable property now that handles cite tokens.",
      rationale: "Visual handles now cite canonical token paths, enabling trustworthy control generation scaffolding.",
      risk: "medium",
      recommendedNextAction: "Prototype generated disabled controls referencing the handle/token table after v31.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Generated read-only Theme Mapping controls",
      whyItMatters: "Now that handles cite canonical token paths, we can generate trustworthy disabled controls per editable property.",
      suggestedFutureBite: "Emit deterministic disabled controls per editable property referencing the handle/token table.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme override/storage contract",
      whyItMatters: "Editable controls cannot ship without a formal override data model and governance.",
      suggestedFutureBite: "Define override schema, lifecycle, and QA evidence before any runtime mutation.",
      risk: "high",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Once overrides exist, presets and persistence unlock practical workflows.",
      suggestedFutureBite: "Implement storage backend, preset save/load, reset/revert, and QA hooks after contract approval.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV29: BanditAdvisorySection = {
  questions: [
    {
      id: "pin-hotkey",
      prompt: "Does Alt+Shift+P pin/unpin the current inspector entity without adding new hotkeys?",
      context: "Lock/pin must remain a debugger-only behavior sharing the same discipline as Alt+Shift+I.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-registered-flow",
      prompt: "Can registered surfaces be pinned, remain visible after hover leaves, and unpin cleanly?",
      context: "Lock/pin needs to stabilize the metadata panel for real targets before Theme Mapping.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-candidate-flow",
      prompt: "Do >=3-signal warning candidates show diagnostic metadata when pinned?",
      context: "Candidates must stay badge-only but pinning should aid manual review.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-clear-behavior",
      prompt: "Can pinned entities be cleared via second Alt+Shift+P or inspector toggle?",
      context: "Pinned state must stay lightweight and reversible.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-scope-guardrails",
      prompt: "Do unknown/never-warn/overlay/Sigma elements remain unpinnable?",
      context: "Lock/pin is limited to registered or >=3-signal candidates only.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-storage-block",
      prompt: "Does documentation emphasize that pinned state is read-only with zero storage/preset impact?",
      context: "Pinned identity is diagnostic only until Theme Mapping + override contract exist.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "pin-theme-mapping-bridge",
      prompt: "Is lock/pin documented as the bridge into Theme Mapping Panel entry contract?",
      context: "This pass must prepare Theme Mapping without jumping into runtime editors.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "theme-mapping-panel-v0-plan",
      title: "Plan Theme Mapping Panel runtime scope",
      summary: "Translate entry contract + lock/pin evidence into the first read-only Theme Mapping Panel design.",
      rationale: "Need UX + QA plan before implementing v30 shell.",
      risk: "medium",
      recommendedNextAction: "Draft panel wireframe, QA checklist, and dependencies on lock/pin + entry contract.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "visual-handle-token-mapping",
      title: "Document visual handle → token mappings",
      summary: "Publish definitive map so component roles inherit canonical ThemeTokenPaths before generated controls.",
      rationale: "Ensures Theme Mapping Panel reuses existing vocabulary without inventing new tokens.",
      risk: "medium",
      recommendedNextAction: "Update UI Surface & Handle Inventory + QA Debug evidence to enumerate handle/token pairs.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Now that lock/pin exists, we can safely render read-only Theme Mapping controls before storage.",
      suggestedFutureBite:
        "Dependencies: token governance accepted, inspector stack through v29, entry contract accepted, storage work scheduled separately.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Visual handles cite token paths",
      whyItMatters: "Component role editing depends on a canonical handle → token reference before UI generation.",
      suggestedFutureBite:
        "Publish handle/token table in docs + QA evidence; wire into Mission Control Debug.",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Editable controls will eventually need persistence; storage must be designed separately.",
      suggestedFutureBite: "Define override data model, preset save/import, reset/revert semantics, QA coverage.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Graph controls must stay deterministic before Theme Mapping integrates graph HUDs.",
      suggestedFutureBite:
        "Add Playwright fixtures for physics sliders/toggles, ensuring they stay unaffected by inspector work.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV28: BanditAdvisorySection = {
  questions: [
    {
      id: "entry-contract-source",
      prompt: "Does docs/theme-system/THEME_MAPPING_PANEL_ENTRY_CONTRACT.md cite every inspector dependency?",
      context: "Entry contract must inherit toggle, metadata panel, ghost overlay, runtime probe, warning badges, token governance, and ThemeTargetRegistry context.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "registered-surface-flow",
      prompt: "Is the registered surface path documented from registry → DOM → inspector → badges → future controls?",
      context: "Editable controls must start with accepted surfaces only; doc must show the entire chain.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "candidate-review-path",
      prompt: "Do candidate badges flow through manual review + registry proposal before mapping mode?",
      context: "Badges must stay diagnostic until promoted; contract must block auto-editing.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "unknown-path-visible",
      prompt: "Does the contract keep unknown (<3-signal) entries invisible and control-free?",
      context: "Unknowns should remain debug-only until they meet candidate requirements.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "component-text-role-guardrails",
      prompt: "Are component roles + text roles explicitly kept out of ThemeTargetRegistry until future role contracts?",
      context: "Prevent per-instance IDs; Theme Mapping Panel must stay role-driven for nested controls/text.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "graph-sigma-exclusion",
      prompt: "Does the contract ensure Sigma primitives remain outside DOM mapping?",
      context: "Only DOM HUD surfaces can flow through ThemeTargetRegistry; Sigma stays governed by Graph Visual Policy.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "storage-block-restate",
      prompt: "Is storage/preset/override behavior explicitly blocked until future passes?",
      context: "Theme Mapping Panel entry contract must keep controls read-only until storage model ships.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "qa-evidence-plan",
      prompt: "Do QA expectations cover registered-only controls, candidate/unknown exclusion, and typecheck/Playwright gates?",
      context: "Future runtime pass must cite this plan before enabling controls.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "lock-pin-behavior-plan",
      title: "Scope lock/pin selected target behavior",
      summary: "Document UX + QA contract for pinning a target once badges + entry contract are proven.",
      rationale: "Lock/pin remains the next inspector hardening milestone before any Theme Mapping UI.",
      risk: "medium",
      recommendedNextAction: "Outline pin/unpin flows, keyboard access, QA hooks, and dependencies on entry contract + badges.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "theme-mapping-panel-v0-plan",
      title: "Plan Theme Mapping Panel runtime scope",
      summary: "Translate entry contract into UI/QA requirements for the actual editable panel without implementing it yet.",
      rationale: "Need a design/QA plan that respects lock/pin + storage dependencies before runtime work.",
      risk: "medium",
      recommendedNextAction: "Produce UX wireframe + QA checklist draft referencing entry contract constraints.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Editable controls depend on an accepted entry contract plus lock/pin to avoid mis-targeting surfaces.",
      suggestedFutureBite:
        "Dependencies: token governance accepted, inspector stack through v27b follow-up, v28 entry contract accepted, lock/pin behavior ready, storage work scheduled separately.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme override storage + save preset",
      whyItMatters: "Once Theme Mapping exists, designers need persistent overrides/presets; storage stays blocked until its own pass.",
      suggestedFutureBite: "Define override data model, preset save/import, reset/revert semantics, QA evidence.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Graph controls need deterministic evidence before inspector-driven editing touches graph surfaces.",
      suggestedFutureBite:
        "Add Playwright coverage for physics sliders/toggles so Theme Mapping inherits stable graph behavior.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle docs must cite canonical ThemeTokenPath mappings before Mapping Panel surfaces become editable.",
      suggestedFutureBite:
        "Publish handle → ThemeTokenPath mapping in docs + QA Debug so downstream systems inherit the vocabulary.",
      risk: "low",
      status: "candidate",
    },
  ],
};

export const advisoryV27b: BanditAdvisorySection = {
  questions: [
    {
      id: "warning-layer-gated",
      prompt: "Do warning badges appear only when the UI Inspector is ON and disappear immediately when it is OFF?",
      context: "Badges must remain diagnostic overlays gated by the inspector state, never a persistent HUD.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "warning-candidates-proof",
      prompt: "Does Playwright prove >=3-signal candidates receive badges with readable copy/signals?",
      context: "Only result.candidates[] (never unknown[]) should earn a badge, and the badge copy should stay calm.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "warning-unknown-default",
      prompt: "Do <3-signal unknown surfaces remain badge-free while still logging as unknown[]?",
      context: "Unknown entries must remain invisible diagnostics so QA does not over-warn borderline cases.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "warning-never-warn-proof",
      prompt: "Do never-warn categories (buttons, tabs, QA tabs, layout shims, overlay DOM, Sigma primitives) remain unbadged?",
      context: "v26 never-warn doctrine still applies; v27b badges cannot regress those exclusions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "warning-pointer-events",
      prompt: "Is the warning layer pointer-events none and read-only so it never blocks Mission Control interactions?",
      context: "Badges must feel like annotations, not controls; pointer-events none protects primary workflows.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "lock-pin-behavior-plan",
      title: "Scope lock/pin selected target behavior",
      summary: "Define UX + QA contract for pinning a target once badges prove the heuristic is trustworthy.",
      rationale: "Lock/pin relies on badges being accurate so pinned targets represent high-confidence surfaces.",
      risk: "medium",
      recommendedNextAction: "Outline pin/unpin flows, keyboard access, and QA evidence requirements that build on v27b badges.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "theme-mapping-panel-plan",
      title: "Plan Theme Mapping Panel entry",
      summary: "Document how warning badges + runtime probe feed into Theme Mapping UI once lock/pin is ready.",
      rationale: "Theme Mapping must inherit the diagnostic layer so editing starts from proven signals.",
      risk: "medium",
      recommendedNextAction: "Capture dependencies (v27b badges + lock/pin) and list governance/QA hooks needed for editing.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Badge work completes the diagnostic stack so future lock/pin + Theme Mapping features inherit a stable overlay.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle (completed v24)\n- UI Part / Component Role Registration Model (completed v24a/v24b)\n- Ghost overlay registered-surface layer (completed v25)\n- Registered/unregistered heuristic planning (completed v26)\n- Registered/unregistered heuristic runtime probe (accepted v27a)\n- Visible conservative warning badges (accepted v27b)\n- Warning badge viewport-safe placement (current pass)\n- Lock/pin selected target behavior (future candidate)",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Editable controls depend on warning badges + lock/pin to avoid editing the wrong target.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening through v27b + lock/pin. Includes governance polish so badge evidence feeds Theme Mapping mode.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Once Theme Mapping exists, designers need persistent overrides/presets.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics + governance policy.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Graph physics controls need deterministic evidence before expanding inspector-driven affordances.",
      suggestedFutureBite:
        "Add Playwright coverage for physics sliders/toggles so inspector + Theme Mapping work inherit stable graph evidence.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle docs must cite canonical ThemeTokenPath mappings so inspector + Theme Mapping stay aligned.",
      suggestedFutureBite:
        "Publish handle → ThemeTokenPath mapping in docs + QA Debug so downstream systems inherit the proven vocabulary.",
      risk: "low",
      status: "candidate",
    },
  ],
};

export const advisoryV27a: BanditAdvisorySection = {
  questions: [
    {
      id: "runtime-probe-helper-proof",
      prompt: "Does QA evidence show window.__lwRunThemeTargetProbe exists, records timestamps, and is verified through Playwright or QA Debug?",
      context: "v27a ships the runtime probe helper behind the scenes; we must prove the helper exists before badges ship.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-three-signal-proof",
      prompt: "Do probe results list per-element candidate signals and enforce the >=3 rule before surfacing candidates?",
      context: "Conservative heuristic means no single DOM hint is enough; QA should cite structured signals in probe output.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-unknown-default",
      prompt: "Are <3-signal elements routed to unknown[] with status 'unknown / do not warn'?",
      context: "Default fallback must remain 'unknown' instead of warning when the heuristic is unsure.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-never-warn-exclusions",
      prompt: "Do buttons, tabs, sliders, badges, layout shims, QA tabs, and handleId/settingsKey controls stay out of candidates[] and unknown[]?",
      context: "Never-warn categories were locked in during v26; runtime probe must honor the same exclusions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-overlay-exclusion",
      prompt: "Do UI Inspector HUD + ghost overlay DOM nodes remain excluded even when the inspector is ON?",
      context: "The runtime probe cannot self-trigger by scanning the overlay it lives in.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-sigma-exclusion",
      prompt: "Does evidence show graph viewport canvases/Sigma nodes stay out of both candidates[] and unknown[]?",
      context: "Sigma primitives remain governed by the Graph View registry; DOM probe must ignore them entirely.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-no-visible-badges",
      prompt: "Is the UI unchanged (no warning badges, no new HUD) even when probe candidates exist?",
      context: "v27a is runtime instrumentation only; warning badges arrive in v27b.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "probe-no-theme-mapping",
      prompt: "Did the pass avoid Theme Mapping panels, lock/pin behavior, or override storage while adding the probe?",
      context: "Inspector overlay hardening must stay sequenced: runtime probe now, badges next, lock/pin later.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "visible-warning-badges-plan",
      title: "Plan visible warning badges (v27b)",
      summary: "Define how runtime probe output feeds conservative warning badges (placement, gating, QA evidence) without regressing ghost overlay.",
      rationale: "Once probe data is trustworthy, the next step is surfacing it visually while staying conservative.",
      risk: "medium",
      recommendedNextAction: "Design badge contract (DOM anchors, severity, QA hooks) and map probe fields to UI copy before implementing.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "lock-pin-behavior-plan",
      title: "Scope lock/pin selected target behavior",
      summary: "Document UX + QA contract for pinning a target *after* runtime probe + warning badges stabilize.",
      rationale: "Lock/pin depends on trustworthy heuristics; it should not ship until v27b proves badge quality.",
      risk: "medium",
      recommendedNextAction: "Outline escape behavior, keyboard support, and evidence needed once badges exist.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Ghost overlay + runtime probe must stay sequenced so Theme Mapping and lock/pin inherit a stable inspector stack.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle (completed v24)\n- UI Part / Component Role Registration Model (completed v24a/v24b)\n- Ghost overlay registered-surface layer (completed v25)\n- Registered/unregistered heuristic planning (completed v26)\n- Registered/unregistered heuristic runtime probe (accepted v27a)\n- Visible warning badges (in progress v27b)\n- Lock/pin selected target behavior (future candidate)",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Editable controls must wait until runtime warnings exist; Theme Mapping inherits probe/badge evidence.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening through v27b + warning badges. Includes governance polish so registry context shows up in QA evidence.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Editing flows require durable storage before UI is exposed to operators.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain lightly tested; coverage is required before exposing more graph controls.",
      suggestedFutureBite: "Add focused Playwright coverage for physics controls once selectors stabilize.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV26: BanditAdvisorySection = {
  questions: [
    {
      id: "heuristic-signal-proof",
      prompt: "Does documentation define the candidate major-surface signals (structural handle, landmark data-testid, layout footprint, control aggregation, graph HUD, registry proximity) and require >=3 before flagging?",
      context: "v26 is a planning pass; we need a conservative heuristic before any runtime warnings exist.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "heuristic-never-warn-proof",
      prompt: "Do the docs explicitly list never-warn categories (buttons, tabs, sliders, dropdowns, labels, values, badges, icons, text, nested wrappers, Sigma primitives)?",
      context: "QA must ensure the heuristic never targets component roles, specific controls, or Sigma elements.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "sigma-separation-proof",
      prompt: "Does the Graph View registry doc reiterate that Sigma nodes/edges/labels remain out-of-scope for DOM heuristics?",
      context: "We cannot derive warnings from Sigma internals; DOM and Sigma registries stay separate.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "no-warning-runtime-change",
      prompt: "Did we confirm no runtime overlay files changed while defining the heuristic?",
      context: "Planning must not sneak in warning UI or overlay mutations.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "warning-badge-implementation-plan",
      title: "Plan warning badge implementation",
      summary: "Translate the heuristic into runtime signals (data collection, diffing, QA evidence) without shipping UI yet.",
      rationale: "After planning, we need a blueprint for instrumentation + badge rendering before v27+ work.",
      risk: "medium",
      recommendedNextAction: "Outline data sources (ThemeTargetRegistry, DOM scan) and QA hooks for badge implementation.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "lock-pin-behavior-plan",
      title: "Plan lock/pin selected target behavior",
      summary: "Define UX + QA contract for pinning a target once heuristics & warnings exist.",
      rationale: "Pinning depends on reliable warning context and must not regress Mission Control tasks.",
      risk: "medium",
      recommendedNextAction: "Document escape behaviors, keyboard flow, and QA instrumentation for lock mode.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Ghost overlay exists and the heuristic was planned in v26; runtime probe (v27a) and badges (v27b) must land before lock/pin or Theme Mapping.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle (completed v24)\n- UI Part / Component Role Registration Model (completed v24a/v24b)\n- Ghost overlay registered-surface layer (completed v25)\n- Registered/unregistered heuristic planning (current v26)\n- Registered/unregistered heuristic runtime probe (next v27a)\n- Visible warning badges (future v27b candidate)\n- Lock/pin selected target behavior (future candidate)",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Editing controls depend on overlay hardening + heuristics before exposing token editing.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening + warning heuristic proof. Includes governance polish so registry context shows up in QA evidence.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Editing flows require durable storage before UI is exposed to operators.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain lightly tested; coverage is required before exposing more graph controls.",
      suggestedFutureBite: "Add focused Playwright coverage for physics controls once selectors stabilize.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV25: BanditAdvisorySection = {
  questions: [
    {
      id: "ghost-layer-visual-proof",
      prompt: "Did we capture evidence that ghost outlines appear only when the UI Inspector is ON?",
      context: "v25 introduces the registered-surface ghost layer; QA must show it remains gated by the inspector toggle/hotkey.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "nested-control-outline-guard",
      prompt: "Do nested controls (buttons/tabs/sliders/dropdowns/text) remain outline-free despite the ghost layer?",
      context: "Ghost overlays must respect the UI Part / Component Role model and avoid ad-hoc nested registrations.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "ghost-layer-pointer-events-none-proof",
      prompt: "Is the ghost overlay verified as pointer-events:none so Mission Control remains fully interactive?",
      context: "Outlines must remain read-only diagnostics; they cannot interfere with QA or settings interactions.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "ghost-layer-graph-separation",
      prompt: "Do QA artifacts prove Sigma-rendered graph primitives remain untouched by the ghost overlay?",
      context: "DOM overlays must never be misinterpreted as Sigma registration; Graph View registry remains separate.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "registered-unregistered-heuristic-plan",
      title: "Plan registered/unregistered heuristic",
      summary: "Define the heuristic + evidence path for warning users about unregistered surfaces without flagging component roles.",
      rationale: "Ghost overlay unlocked the visualization layer; the next pass must decide how to highlight missing registrations responsibly.",
      risk: "medium",
      recommendedNextAction: "Outline heuristic inputs (ThemeTargetRegistry, UI Part model, QA signals) and add QA coverage expectations.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "inspector-lock-mode-plan",
      title: "Scope lock/pin selected target behavior",
      summary: "After heuristics, define how operators can pin one inspected surface without disrupting Mission Control tasks.",
      rationale: "Pinning requires stable overlay + heuristics to avoid confusing multi-surface outlines.",
      risk: "medium",
      recommendedNextAction: "Document UX + QA contract for lock mode, including escape behaviors and keyboard requirements.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Ghost overlay is now in place; we must immediately sequence heuristics before exposing editing controls.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle (completed v24)\n- UI Part / Component Role Registration Model (completed v24a/v24b)\n- Ghost overlay registered-surface layer (completed v25)\n- Registered/unregistered heuristic (next candidate)\n- Lock/pin selected target behavior (future candidate)",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Editing controls depend on ghost overlay + heuristics before exposing token editing.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening + registered/unregistered heuristic proof. Includes governance polish so registry context shows up in QA evidence.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Editing flows require durable storage before UI is exposed to operators.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain lightly tested; coverage is required before exposing more graph controls.",
      suggestedFutureBite: "Add focused Playwright coverage for physics controls once selectors stabilize.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV24: BanditAdvisorySection = {
  questions: [
    {
      id: "mission-control-toggle-accessibility",
      prompt: "Did we capture QA evidence showing the Mission Control UI Inspector toggle can be used without keyboard shortcuts?",
      context: "v24 ships the first visible toggle. Manual QA must prove it works for non-keyboard testers before shipping further inspector features.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "inspector-toggle-hotkey-parity",
      prompt: "Do the Mission Control button and Alt+Shift+I hotkey stay synchronized in state + logging?",
      context: "Future passes depend on one source of truth. Any desync would make overlay hardening noisy.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "inspector-toggle-readonly-proof",
      prompt: "Does enabling the toggle keep the UI Inspector read-only with pointer-events:none HUD?",
      context: "Toggle must not regress the read-only contract while ghost overlay / editing work remain pending.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "ui-part-role-model-doc",
      prompt: "Was the UI Part / Component Role Registration Model documented before starting ghost overlay work?",
      context: "v24a requires a precision plan so future overlays highlight the correct DOM surfaces without sprinkling ad-hoc markers.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "ghost-overlay-next-step",
      title: "Plan ghost overlay registered surface layer",
      summary: "Scope v25 ghost overlay implementation, including registered/unregistered outlines and QA evidence.",
      rationale: "Toggle unlocks manual QA; the next pass should visualize registered surfaces before editing flows arrive.",
      risk: "medium",
      recommendedNextAction: "Design lightweight outline rendering tied to themeTargetId metadata and document QA evidence hooks.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "registered-heuristic-plan",
      title: "Document registered/unregistered heuristic",
      summary: "Before v26, define how UI Inspector identifies unregistered nodes + badges without mislabeling planned targets.",
      rationale: "Ghost overlay + heuristic work must agree on contract before enabling warnings.",
      risk: "medium",
      recommendedNextAction: "Draft heuristic doc covering DOM markers, registry lookups, and QA instrumentation.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Overlay infrastructure must be stable before Theme Mapping Panel work can begin. v24a/v24b delivered the UI Part / Component Role Registration Model so ghost overlays can proceed without ad-hoc registrations.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle (completed v24)\n- UI Part / Component Role Registration Model (completed v24b)\n- Ghost overlay registered-surface layer (planned v25)\n- Registered/unregistered heuristic\n- Lock/pin selected target behavior",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Needs stable inspector + governance before exposing editing controls.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening + accepted token governance. Includes governance polish: publish token path governance report in QA Debug or CI logs.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Editing flows require durable storage before UI is exposed to operators.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain lightly tested; coverage is required before exposing more graph controls.",
      suggestedFutureBite: "Add focused Playwright coverage for physics controls once selectors stabilize.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Future candidate dependent on accepted token governance; document handle -> token bindings in visual handle library.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV22: BanditAdvisorySection = {
  questions: [
    {
      id: "canonical-token-vocab-proof",
      prompt: "Was a governance report captured proving active tokenBindings only use canonical ThemeTokenPath values?",
      context: "Theme Target Registry must stay aligned with the canonical vocabulary. Capture evidence this pass enforces it.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "planned-token-usage-check",
      prompt: "Did any planned-only ThemeTokenPath names accidentally land in active bindings?",
      context: "Planned vocabulary must remain dormant until explicitly promoted. Record the governance finding.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "preset-coverage-proof",
      prompt: "Do all built-in presets resolve every canonical token path with no missing values?",
      context: "Token path governance requires presets to stay in lockstep with canonical paths.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "token-path-governance-reporting",
      title: "Publish token path governance report",
      summary: "Capture governance check output in QA Debug or CI logs so future passes can trace vocabulary drift quickly.",
      rationale: "Governance only helps when its signal is visible in QA evidence.",
      risk: "low",
      recommendedNextAction: "Add QA Debug tab entry summarizing governance result or attach logs to QA report.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "planned-token-promotion-policy",
      title: "Document promotion policy for planned tokens",
      summary: "Before any planned token becomes canonical, define the minimal checklist (docs, presets, QA) required to promote it.",
      rationale: "Prevents ad-hoc vocabulary expansion.",
      risk: "medium",
      recommendedNextAction: "Add policy note to THEME_TOKEN_PATH_MAP.md describing promotion steps.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters:
        "Overlay remains read-only but needs additional safety and visibility work before future editing modes.",
      suggestedFutureBite:
        "Child tasks:\n- Mission Control UI Inspector toggle\n- Ghost overlay registered-surface layer\n- Registered/unregistered heuristic\n- Lock/pin selected target behavior",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters:
        "Need a minimal read-only mapping UI that consumes canonical tokens once overlay hardening + governance are in place.",
      suggestedFutureBite:
        "Dependencies: Inspector overlay hardening + accepted token governance. Includes governance polish: publish token path governance report in QA Debug or CI logs.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Inspector adjustments require durable storage before exposing editing flows.",
      suggestedFutureBite: "Dependency: Theme Mapping Panel semantics.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain a large untested area and need a dedicated graph-safety pass.",
      suggestedFutureBite: "Add focused Playwright coverage for physics controls once selectors stabilize.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle metadata should reference canonical tokens once governance is in place to avoid drift.",
      suggestedFutureBite: "Future candidate dependent on accepted token governance; document handle -> token bindings in visual handle library.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV21a: BanditAdvisorySection = {
  questions: [
    {
      id: "fixed-panel-viewport-proof",
      prompt: "Has the fixed metadata panel been manually verified on Ubuntu/resizable windows so it never clips near bottom/right edges?",
      context: "v21a replaced the cursor-following tooltip with a fixed panel. Manual QA must prove it stays visible on common viewport sizes before shipping beyond devs.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "fixed-panel-pointer-policy",
      prompt: "Does the fixed panel keep pointer-events:none so it cannot block Mission Control controls?",
      context: "The panel must remain read-only and non-intercepting even as we add richer overlay hints.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "fixed-panel-next-priority",
      prompt: "Should the next overlay bite prioritize ghost outlines for registered/unregistered surfaces or the Mission Control toggle?",
      context: "Option B roadmap offers both. Pick which unlocks the most QA signal immediately after v21a.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "mission-control-overlay-toggle",
      title: "Add Mission Control inspector toggle",
      summary: "Expose a visible toggle button in Mission Control Debug for the inspector overlay while keeping Alt+Shift+I hotkey.",
      rationale: "Gives non-keyboard QA a way to verify overlay behavior without memorizing shortcuts.",
      risk: "low",
      recommendedNextAction: "Add read-only toggle button with data-testid=theme-inspector-toggle-button tied to existing state.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "ghost-overlay-option-b",
      title: "Ghost overlay registered-surface layer",
      summary: "Render lightweight outlines for registered targets plus warning state for unregistered elements when inspector is enabled.",
      rationale: "Completes Option B by making registered/unregistered state visible without enabling editing.",
      risk: "medium",
      recommendedNextAction: "Plan ghost layer rendering contract and QA evidence surfaces before enabling.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters: "Need lock mode, registered/unregistered indicators, and QA evidence before exposing overlay broadly.",
      suggestedFutureBite:
        "Mini backlog: (1) Reposition fixed metadata panel away from Mission Control while staying lower + viewport-safe, (2) add Mission Control Debug toggle for inspector activation, (3) add ghost overlay registered-surface layer, (4) define registered/unregistered indicator heuristic, (5) add lock/pin selected target behavior later",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Actual Ableton-style controls require generating UI from Theme Target Registry entries.",
      suggestedFutureBite: "Generate read-write controls for mission-control.panel targets",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Inspector adjustments need durable storage before they can ship to users.",
      suggestedFutureBite: "Design override schema mapping themeTargetId + tokenPath -> value",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain the largest chunk of missing UI coverage.",
      suggestedFutureBite: "Add e2e coverage once stable selectors exist for sliders",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV20: BanditAdvisorySection = {
  questions: [
    {
      id: "theme-target-registry-source-of-truth",
      prompt: "Should Theme Target Registry become the source of truth for future inspectable UI surfaces?",
      context: "Registry now exists; decide if all future Theme Mapping work must register targets here first.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "require-data-lw-theme-target",
      prompt: "Should data-lw-theme-target be required for every theme-editable DOM node?",
      context: "Inspector overlay depends on stable markers. Decide whether future editable surfaces must declare them before shipping.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "inspector-overlay-scope",
      prompt: "Should the inspector overlay stay dev/debug-only until Theme Mapping Panel exists?",
      context: "Overlay v0 is read-only. Determine whether it should remain hidden from operators until editing features land.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "graph-targets-planned",
      prompt: "Should graph node/edge theme targets stay planned until Graph Visual Policy refresh?",
      context: "Registry includes planned graph entries without bindings; confirm if that remains acceptable until policy is updated.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v21-focus-choice",
      prompt: "Should v21 focus on inspector overlay hardening, Theme Mapping Panel v0, or Theme Override Storage?",
      context: "Next pass needs a clear priority now that registry + overlay exist.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "unregistered-target-handling",
      prompt: "Should unregistered UI elements be ignored in inspector mode or show as unregistered for debugging?",
      context: "Decide how the overlay should treat DOM nodes lacking themeTargetId markers in future iterations.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "visual-handles-token-binding",
      title: "Require visual handles to cite token paths",
      summary: "Add metadata to the Visual Handle Library so each handle lists canonical token paths once Theme Target Registry bindings go live.",
      rationale: "Prevents drift between CSS primitives and canonical vocabulary before Theme Mapping Panel ships.",
      risk: "medium",
      recommendedNextAction: "Extend docs/handleset/09_VISUAL_HANDLE_LIBRARY.md with tokenPath annotations and plan runtime bindings.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "token-path-governance",
      title: "Add token path governance check",
      summary: "Introduce a lint/validation command that flags unknown themeTokenPath usage across the repo.",
      rationale: "Keeps the vocabulary compact and prevents speculative tokens from entering runtime code.",
      risk: "low",
      recommendedNextAction: "Prototype npm run qa:contracts (or similar) scan that compares token strings against registry",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Inspector overlay hardening",
      whyItMatters: "Need lock mode, registered/unregistered indicators, and QA evidence before exposing to more users.",
      suggestedFutureBite: "Add lock mode + unregistered target warnings",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Theme Mapping Panel v0",
      whyItMatters: "Actual Ableton-style controls require generating UI from Theme Target Registry entries.",
      suggestedFutureBite: "Generate read-write controls for mission-control.panel targets",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme override storage + save preset",
      whyItMatters: "Inspector adjustments need durable storage before they can ship to users.",
      suggestedFutureBite: "Design override schema mapping themeTargetId + tokenPath -> value",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain the largest chunk of missing UI coverage.",
      suggestedFutureBite: "Add e2e coverage once stable selectors exist for sliders",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle documentation must list canonical token paths once governance is enforced.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
  ],
};

export const advisoryV19: BanditAdvisorySection = {
  questions: [
    {
      id: "token-path-required-vocab",
      prompt: "Should canonical Theme Token Paths become the required vocabulary for Theme Mapping Mode?",
      context: "v19 introduces Theme Token Path Map + resolver. Decide if all future Theme Mapping prompts must reference these canonical strings instead of ad-hoc labels.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "visual-handle-token-declaration",
      prompt: "Should every future visual handle declare which token paths it consumes?",
      context: "Visual handles currently rely on fallback CSS variables. Should new handles explicitly bind to canonical token paths before shipping?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "graph-token-mapping-boundary",
      prompt: "Should graph visual tokens stay separate but mapped to canonical token paths?",
      context: "Graph runtime already has its own token object. Decide whether to keep it standalone with mapping, or collapse it directly into the canonical list.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "planned-token-path-doc-priority",
      prompt: "Should planned/future token paths be documented before implementation begins?",
      context: "v19 documents control/motion/visualHandle tokens as planned. Determine if documentation must precede any runtime work for those paths.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "css-overrides-vs-token-paths",
      prompt: "Should arbitrary CSS overrides be forbidden in favor of token-path overrides?",
      context: "Theme Mapping Mode will rely on canonical token paths. Decide whether ad-hoc CSS changes should be blocked in future phases.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v20-focus-decision",
      prompt: "Should v20 prioritize Theme Target Registry or Debug UI Inspector Overlay?",
      context: "Token path map is done; next steps could be registry wiring or overlay instrumentation. Pick the higher leverage follow-up.",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "visual-handles-token-binding",
      title: "Require visual handles to cite token paths",
      summary: "Add metadata to the Visual Handle Library so each handle lists the canonical token paths it uses once Theme Target Registry exists.",
      rationale: "Prevents drift between CSS primitives and canonical vocabulary before Theme Mapping Panel ships.",
      risk: "medium",
      recommendedNextAction: "Extend docs/handleset/09_VISUAL_HANDLE_LIBRARY.md with tokenPath annotations and plan runtime bindings for v20.",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "token-path-governance",
      title: "Add token path governance check",
      summary: "Add a lint/validation step ensuring any new theme affordance references a canonical path or adds to the planned list with rationale.",
      rationale: "Keeps the vocabulary compact and prevents speculative tokens from slipping into runtime.",
      risk: "low",
      recommendedNextAction: "Design small tooling hook (lint or script) that scans for tokenPath strings and compares against canonical lists.",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Theme Target Registry",
      whyItMatters: "Canonical theme targets must exist before Theme Mapping Mode can emit editable controls.",
      suggestedFutureBite: "Author registry schema + seed entries for Mission Control panels and graph surfaces.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Debug UI Inspector Overlay",
      whyItMatters: "Read-only overlay is needed to expose themeTargetId + visualHandle bindings for QA evidence.",
      suggestedFutureBite: "Ship hover highlight + info panel driven by Theme Target Registry entries.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain untested and are highlighted as missing coverage in Debug.",
      suggestedFutureBite: "Add e2e coverage once stable data-testid hooks exist for link distance / repel / node size.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 4,
      title: "Visual handles cite token paths",
      whyItMatters: "Visual handle metadata should reference canonical tokens once governance is in place to avoid drift.",
      suggestedFutureBite: "Document handle -> token bindings in the visual handle library and plan runtime bindings.",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 5,
      title: "Mission Control coverage instrumentation",
      whyItMatters: "Persisting coverage totals in QA reports gives auditors durable evidence for zero-missing state.",
      suggestedFutureBite: "Include coverage snapshot + counts in QA report markdown and Debug tab.",
      risk: "low",
      status: "candidate",
    },
  ],
};

// Advisory content for v18 - Control Handle / Settings Key Alignment
export const advisoryV18: BanditAdvisorySection = {
  questions: [
    {
      id: "handle-settings-separation",
      prompt: "Should handleId stay separate from settingsKey even when they map 1:1?",
      context: "v18 aligned contract metadata so every handle records a settings key or no-storage rationale. Do we keep both fields for traceability?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "playwright-coverage-threshold",
      prompt: "Should missing Playwright coverage block acceptance or remain advisory?",
      context: "Eight controls still lack browser tests. Should acceptance require zero missing coverage, or is surfacing the gaps enough?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "no-storage-rationale",
      prompt: "Should every stateless control include an explicit noStorageReason?",
      context: "Mission Control buttons now set settingsKey: null with rationale. Should this be mandatory before new controls ship?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "debug-summary-permanence",
      prompt: "Should the Missing Playwright Coverage list stay visible in Debug after v18?",
      context: "The new grouped summary helps QA spot debt quickly. Should we keep it permanently even after coverage hits zero?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "contract-registry-gate",
      prompt: "Should future control launches be blocked unless they have a contract entry first?",
      context: "v18 requires every active control to appear in controlSurfaceContract.registry. Should this become a hard release gate?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
    {
      id: "v19-priority",
      prompt: "What should v19 focus on: Theme Token Path Map or Graph Visual State Policy refresh?",
      context: "Next pass options include extending theme token coverage or tightening graph visual policy. Which gives more leverage immediately after v18?",
      responseType: "choice",
      userResponse: "",
      status: "unanswered",
    },
  ],
  proposals: [
    {
      id: "graph-physics-playwright",
      title: "Add Playwright coverage for graph physics sliders",
      summary: "Author a Playwright spec that exercises node size, link distance, and repel force to prove runtime wiring.",
      rationale: "Physics controls remain untested and are the largest chunk of missing coverage surfaced in v18.",
      risk: "medium",
      recommendedNextAction: "Design data-testid hooks for sliders, add tests under tests/e2e/graph-physics-controls.spec.ts",
      userDecision: "unreviewed",
      userNotes: "",
    },
    {
      id: "mission-control-debug-coverage",
      title: "Mission Control coverage snapshot",
      summary: "Persist snapshot of coverage counts into session log whenever QA report is generated.",
      rationale: "Keeps evidence that zero-missing counts were verified at submit time.",
      risk: "low",
      recommendedNextAction: "Extend report markdown with coverage totals from contract summary",
      userDecision: "unreviewed",
      userNotes: "",
    },
  ],
  backlog: [
    {
      rank: 1,
      title: "Graph physics Playwright coverage",
      whyItMatters: "Physics sliders remain untested and are highlighted as missing in Debug.",
      suggestedFutureBite: "Add e2e coverage once data-testid hooks exist",
      risk: "medium",
      status: "candidate",
    },
    {
      rank: 2,
      title: "Mission Control coverage instrumentation",
      whyItMatters: "Persisting coverage totals in reports would give auditors durable evidence",
      suggestedFutureBite: "Include coverage snapshot in QA report markdown",
      risk: "low",
      status: "candidate",
    },
    {
      rank: 3,
      title: "Theme token path map",
      whyItMatters: "Future theme editor work depends on a canonical mapping between handles and token paths",
      suggestedFutureBite: "Document token path map for top bar + mission control controls",
      risk: "medium",
      status: "promoted",
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
export function getAdvisoryForChecklist(featureId: string, qaVersion: number, checklistKey: string): BanditAdvisorySection {
  if (featureId === "theme-override-bundle-export-v34c1" || qaVersion === 35 || checklistKey === "v34c1") {
    return advisoryV34c1;
  }
  if (featureId === "narrow-theme-mapping-edit-control-v34b" || qaVersion === 34 || checklistKey === "v34b") {
    return advisoryV34b;
  }
  if (featureId === "global-theme-override-storage-foundation-v34a" || qaVersion === 34 || checklistKey === "v34a") {
    return advisoryV34a;
  }
  if (featureId === "theme-override-storage-contract-v33" || qaVersion === 33 || checklistKey === "v33") {
    return advisoryV33;
  }
  if (featureId === "generated-readonly-theme-mapping-controls-v32" || qaVersion === 32 || checklistKey === "v32") {
    return advisoryV32;
  }
  if (featureId === "visual-handles-cite-token-paths-v31" || qaVersion === 31 || checklistKey === "v31") {
    return advisoryV31;
  }
  if (featureId === "theme-mapping-panel-shell-v30b" && (qaVersion === 30 || checklistKey === "v30b")) {
    return advisoryV30b;
  }
  if (featureId === "lock-pin-selected-target-v29" && qaVersion === 29) {
    return advisoryV29;
  }
  if (featureId === "registered-unregistered-heuristic-runtime-probe-v27a" && qaVersion === 27) {
    return advisoryV27a;
  }
  if (featureId === "registered-unregistered-heuristic-planning-v26" && qaVersion === 26) {
    return advisoryV26;
  }
  if (checklistKey === "graph-state-preservation-and-advisory-rotation-v16c:v18") {
    return advisoryV16c;
  }

  if (featureId === "control-handle-settings-alignment-v18" && qaVersion === 18) {
    return advisoryV18;
  }

  if (featureId === "theme-token-path-map-v19" && qaVersion === 19) {
    return advisoryV19;
  }

  if (featureId === "theme-target-registry-v20" && qaVersion === 20) {
    return advisoryV20;
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
  if (qaKey === "v34c1") {
    return advisoryV34c1;
  }
  if (qaKey === "v36c") {
    return advisoryV36c;
  }
  if (qaKey === "v38") {
    return advisoryV38;
  }
  if (qaKey === "v36b") {
    return advisoryV36b;
  }
  if (qaKey === "v36a") {
    return advisoryV36a;
  }
  if (qaKey === "v34b") {
    return advisoryV34b;
  }
  if (qaKey === "v34a") {
    return advisoryV34a;
  }
  if (qaKey === "v33") {
    return advisoryV33;
  }
  if (qaKey === "v32") {
    return advisoryV32;
  }
  if (qaKey === "v31") {
    return advisoryV31;
  }
  if (qaKey === "v30b") {
    return advisoryV30b;
  }
  if (qaKey === "v29") {
    return advisoryV29;
  }
  if (qaKey === "v28") {
    return advisoryV28;
  }
  if (qaKey === "v27b") {
    return advisoryV27b;
  }
  if (qaKey === "v27a") {
    return advisoryV27a;
  }
  if (qaKey === "v26") {
    return advisoryV26;
  }
  if (qaKey === "v25") {
    return advisoryV25;
  }
  if (qaKey === "v24") {
    return advisoryV24;
  }
  if (qaKey === "v22") {
    return advisoryV22;
  }
  if (qaKey === "v21a") {
    return advisoryV21a;
  }
  if (qaKey === "v20") {
    return advisoryV20;
  }
  if (qaKey === "v19") {
    return advisoryV19;
  }
  if (qaKey === "v18") {
    return advisoryV18;
  }
  if (qaKey === "v16d") {
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
