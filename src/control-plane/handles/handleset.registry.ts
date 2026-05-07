/**
 * Handleset Registry
 * 
 * This file contains the machine-readable handleset registry.
 * It serves as documentation and scaffolding for future tooling.
 * 
 * IMPORTANT: This does not yet drive UI. SettingsPanel still uses settings.registry.ts.
 * This is a documentation/scaffold layer only.
 */

import type { HandlesetRegistry } from "./handleset.types";

export const handlesetRegistry: HandlesetRegistry = {
  version: "0.1.0",
  updatedAt: new Date().toISOString(),
  entries: [
    // === Active Handles ===

    {
      handle: "labels.nodeLabelMode",
      label: "Node Label Mode",
      category: "Labels",
      defaultValue: "all",
      controlType: "select",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphLabelPolicy.ts applyNodeLabelVisibility",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/label-controls.spec.ts",
      },
      notes: "Controls node label visibility mode (off, all, selected-neighborhood, important-only)",
    },

    {
      handle: "labels.edgeLabelMode",
      label: "Edge Label Mode",
      category: "Labels",
      defaultValue: "all-short",
      controlType: "select",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphLabelPolicy.ts applyEdgeLabelVisibility",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/label-controls.spec.ts",
      },
      notes: "Controls edge label visibility mode (off, all-short, all-medium, selected-neighborhood, important-only)",
    },

    {
      handle: "labels.nodeLabelFontSize",
      label: "Node Label Font Size",
      category: "Labels",
      defaultValue: 12,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphVisualTokens.ts labelFontSizeTokens.node",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/label-controls.spec.ts",
      },
      notes: "Controls node label font size (8-24)",
    },

    {
      handle: "labels.edgeLabelFontSize",
      label: "Edge Label Font Size",
      category: "Labels",
      defaultValue: 10,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphVisualTokens.ts labelFontSizeTokens.edge",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/label-controls.spec.ts",
      },
      notes: "Controls edge label font size (6-18)",
    },

    {
      handle: "labels.maxEdgeLabelLength",
      label: "Max Edge Label Length",
      category: "Labels",
      defaultValue: 20,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphVisualTokens.ts labelTruncationTokens.maxEdgeLabelLength",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/edge-label-truncation.spec.ts",
      },
      notes: "Controls maximum edge label length before truncation",
    },

    {
      handle: "labels.showLabelsOnHover",
      label: "Show Labels On Hover",
      category: "Labels",
      defaultValue: false,
      controlType: "checkbox",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphLabelPolicy.ts showLabelsOnHover option",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/qa-panel.spec.ts",
      },
      notes: "When enabled, hovering nodes/edges shows their labels temporarily",
    },

    {
      handle: "graphView.nodeSelectionStage",
      label: "Neighborhood Depth",
      category: "Graph View",
      defaultValue: 1,
      controlType: "select",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphLabelPolicy.ts neighborhoodDepth state",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v7",
        playwrightTest: "tests/e2e/qa-panel.spec.ts",
      },
      notes: "Controls neighborhood depth for selected-neighborhood mode (1/2/3)",
    },

    {
      handle: "graphView.hoverNodeColor",
      label: "Hover Node Color",
      category: "Graph View",
      defaultValue: "#c4b5fd",
      controlType: "color",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/graph/visual/graphVisualTokens.ts nodeColorTokens.hovered",
        liveUpdate: true,
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v4",
        manualQA: "Manual QA accepted - hover color works correctly",
      },
      notes: "Color for hovered nodes",
    },

    {
      handle: "appearance.theme",
      label: "Theme",
      category: "Appearance",
      defaultValue: "solar-plasma",
      controlType: "select",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "src/app/AppShell.tsx top bar theme selector",
        liveUpdate: true,
        notes: "Theme selector in top bar switches between built-in theme presets",
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v8",
        playwrightTest: "tests/e2e/theme-selector.spec.ts",
      },
      notes: "Built-in theme preset selector in top bar (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin)",
    },

    {
      handle: "appearance.glitterEnabled",
      label: "Glitter Enabled",
      category: "Appearance",
      defaultValue: false,
      controlType: "checkbox",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "Not yet wired to renderer",
        liveUpdate: false,
        notes: "Glitter effects not yet implemented",
      },
      qa: {
        manualQA: "Glitter effects not yet implemented - no QA needed",
      },
      notes: "Enable visual glitter effects (not yet implemented)",
    },

    {
      handle: "physics.nodeSize",
      label: "Node Size",
      category: "Graph View",
      defaultValue: 1.0,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "Not yet wired to Sigma layout",
        liveUpdate: false,
        notes: "Physics controls not yet wired to Sigma",
      },
      qa: {
        manualQA: "Physics controls not yet wired - no QA needed",
      },
      notes: "Node size multiplier (not yet wired to Sigma layout)",
    },

    {
      handle: "physics.linkDistance",
      label: "Simulation Speed",
      category: "Graph View",
      defaultValue: 1.0,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "Not yet wired to Sigma layout",
        liveUpdate: false,
        notes: "Physics controls not yet wired to Sigma",
      },
      qa: {
        manualQA: "Physics controls not yet wired - no QA needed",
      },
      notes: "Edge length multiplier (not yet wired to Sigma layout)",
    },

    {
      handle: "physics.repelForce",
      label: "Repel Force",
      category: "Graph View",
      defaultValue: 1.0,
      controlType: "range",
      status: "active",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "Not yet wired to Sigma layout",
        liveUpdate: false,
        notes: "Physics controls not yet wired to Sigma",
      },
      qa: {
        manualQA: "Physics controls not yet wired - no QA needed",
      },
      notes: "Node repulsion force (not yet wired to Sigma layout)",
    },

    // === Internal Handles ===

    {
      handle: "hoveredNodeId",
      label: "Hovered Node ID",
      category: "Internal",
      defaultValue: null,
      controlType: "internal",
      status: "internal",
      binding: {
        sourceFile: "src/graph/renderers/sigma2d/SigmaGraphView.tsx",
        runtimeTarget: "Internal state in SigmaGraphView",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Internal state - no QA needed",
      },
      notes: "Internal state tracking currently hovered node ID",
    },

    {
      handle: "hoveredEdgeId",
      label: "Hovered Edge ID",
      category: "Internal",
      defaultValue: null,
      controlType: "internal",
      status: "internal",
      binding: {
        sourceFile: "src/graph/renderers/sigma2d/SigmaGraphView.tsx",
        runtimeTarget: "Internal state in SigmaGraphView",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Internal state - no QA needed",
      },
      notes: "Internal state tracking currently hovered edge ID",
    },

    {
      handle: "selectedNodeId",
      label: "Selected Node ID",
      category: "Internal",
      defaultValue: null,
      controlType: "internal",
      status: "internal",
      binding: {
        sourceFile: "src/app/AppShell.tsx",
        runtimeTarget: "Internal state in AppShell",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Internal state - no QA needed",
      },
      notes: "Internal state tracking currently selected node ID",
    },

    {
      handle: "selectedEdgeId",
      label: "Selected Edge ID",
      category: "Internal",
      defaultValue: null,
      controlType: "internal",
      status: "internal",
      binding: {
        sourceFile: "src/app/AppShell.tsx",
        runtimeTarget: "Internal state in AppShell",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Internal state - no QA needed",
      },
      notes: "Internal state tracking currently selected edge ID",
    },

    // === Partial/Planned Handles ===

    {
      handle: "labels.zoomLabelThreshold",
      label: "Zoom Label Threshold",
      category: "Labels",
      defaultValue: 0.5,
      controlType: "range",
      status: "partial",
      binding: {
        sourceFile: "src/control-plane/settings/settings.schema.ts",
        runtimeTarget: "Not wired to renderer",
        liveUpdate: false,
        notes: "Hidden from UI, not wired to renderer",
      },
      qa: {
        manualQA: "Partial - not wired to renderer",
      },
      notes: "Zoom-based label visibility threshold (hidden from UI, not wired)",
    },

    {
      handle: "missionControl.activeChecklistId",
      label: "Active Checklist ID",
      category: "Mission Control",
      defaultValue: "baseline-b-consolidation-followup-v0",
      controlType: "text",
      status: "partial",
      binding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        runtimeTarget: "QA panel state",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Partial - represented in QA panel but not as a settings handle",
      },
      notes: "Active QA checklist ID (represented in QA panel, not as settings handle)",
    },

    {
      handle: "missionControl.lastSubmittedReport",
      label: "Last Submitted Report",
      category: "Mission Control",
      defaultValue: null,
      controlType: "internal",
      status: "partial",
      binding: {
        sourceFile: "src/control-plane/qa/qa.store.ts",
        runtimeTarget: "QA store getLastSubmission()",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Partial - represented in QA store but not as a settings handle",
      },
      notes: "Last submitted QA report (represented in QA store, not as settings handle)",
    },

    {
      handle: "missionControl.submissionHistory",
      label: "Submission History",
      category: "Mission Control",
      defaultValue: [],
      controlType: "internal",
      status: "partial",
      binding: {
        sourceFile: "src/control-plane/qa/qa.store.ts",
        runtimeTarget: "QA store submissionHistory",
        liveUpdate: true,
      },
      qa: {
        manualQA: "Partial - represented in QA store but not as a settings handle",
      },
      notes: "Submission history array (represented in QA store, not as settings handle)",
    },

    {
      handle: "theme.presetDropdown",
      label: "Theme Preset Dropdown",
      category: "Theme",
      defaultValue: "solar-plasma",
      controlType: "select",
      status: "active",
      binding: {
        sourceFile: "src/app/AppShell.tsx",
        runtimeTarget: "Top bar theme selector",
        liveUpdate: true,
        notes: "Built-in theme preset selector in top bar",
      },
      qa: {
        checklistId: "baseline-b-consolidation-followup-v8",
        playwrightTest: "tests/e2e/theme-selector.spec.ts",
      },
      notes: "Theme preset dropdown in top bar (built-in presets only, custom themes not yet supported)",
    },

    {
      handle: "theme.customThemePresets",
      label: "Custom Theme Presets",
      category: "Theme",
      defaultValue: [],
      controlType: "internal",
      status: "planned",
      binding: {
        sourceFile: "Not yet created",
        runtimeTarget: "Not yet created",
        liveUpdate: false,
        notes: "Theme system not yet implemented",
      },
      qa: {
        manualQA: "Planned - not yet implemented",
      },
      notes: "Custom theme presets array (planned)",
    },

    {
      handle: "agentChat.enabled",
      label: "Agent Chat Enabled",
      category: "Mission Control",
      defaultValue: false,
      controlType: "checkbox",
      status: "planned",
      binding: {
        sourceFile: "Not yet created",
        runtimeTarget: "Not yet created",
        liveUpdate: false,
        notes: "Agent Chat not yet implemented",
      },
      qa: {
        manualQA: "Planned - not yet implemented",
      },
      notes: "Agent Chat toggle (planned - requires AI infrastructure)",
    },

    {
      handle: "graphIntelligence.clusterGravity",
      label: "Cluster Gravity",
      category: "Graph View",
      defaultValue: false,
      controlType: "checkbox",
      status: "planned",
      binding: {
        sourceFile: "Not yet created",
        runtimeTarget: "Not yet created",
        liveUpdate: false,
        notes: "Cluster Gravity not yet implemented",
      },
      qa: {
        manualQA: "Planned - not yet implemented",
      },
      notes: "Cluster gravity / color-coded neighborhoods (planned)",
    },

    {
      handle: "graphIntelligence.progressiveDepthSlider",
      label: "Progressive Depth Slider",
      category: "Graph View",
      defaultValue: 1.0,
      controlType: "range",
      status: "planned",
      binding: {
        sourceFile: "Not yet created",
        runtimeTarget: "Not yet created",
        liveUpdate: false,
        notes: "Progressive depth not yet implemented",
      },
      qa: {
        manualQA: "Planned - not yet implemented",
      },
      notes: "Decimal depth slider (planned - requires stable integer depth first)",
    },
  ],
};
