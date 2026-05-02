/**
 * Control Surface Contract Registry
 * 
 * This file contains the active control contract registry.
 * It describes and validates the currently active control surface.
 * 
 * IMPORTANT: This does not yet drive UI. This is a contract map and validation aid only.
 */

import type { ControlSurfaceContractRegistry } from "./controlSurfaceContract.types";

export const controlSurfaceContractRegistry: ControlSurfaceContractRegistry = {
  version: "0.1.0",
  updatedAt: new Date().toISOString(),
  contracts: [
    // === Top Bar Controls ===

    {
      id: "topbar.themeSelector",
      label: "Theme Selector",
      surface: "topbar",
      owner: "settings.store.ts",
      settingsKey: "appearance.theme",
      runtimeBinding: {
        sourceFile: "src/app/AppShell.tsx",
        targetComponent: "Top bar theme selector",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "theme-mission-control-integrity-v11",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/theme-selector.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Built-in theme preset selector in top bar (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin)",
    },

    {
      id: "topbar.glitterToggle",
      label: "Glitter Toggle",
      surface: "topbar",
      owner: "settings.store.ts",
      settingsKey: "appearance.glitterEnabled",
      runtimeBinding: {
        sourceFile: "src/app/AppShell.tsx",
        targetComponent: "Top bar glitter checkbox",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "theme-mission-control-integrity-v11",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/theme-selector.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Glitter effects toggle in top bar (not yet fully wired to renderer)",
    },

    {
      id: "topbar.reduceMotionToggle",
      label: "Reduce Motion Toggle",
      surface: "topbar",
      owner: "settings.store.ts",
      settingsKey: "appearance.reduceMotion",
      runtimeBinding: {
        sourceFile: "src/app/AppShell.tsx",
        targetComponent: "Top bar reduce motion checkbox",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "theme-mission-control-integrity-v11",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/theme-selector.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Reduce motion toggle in top bar (animation smoothness)",
    },

    // === Graph Controls ===

    {
      id: "graph.nodeLabelMode",
      label: "Node Label Mode",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.nodeLabelMode",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphLabelPolicy.ts",
        targetComponent: "applyNodeLabelPolicy",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/settings-label-controls.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls node label visibility mode (off, all, selected-neighborhood, important-only)",
    },

    {
      id: "graph.edgeLabelMode",
      label: "Edge Label Mode",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.edgeLabelMode",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphLabelPolicy.ts",
        targetComponent: "applyEdgeLabelPolicy",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/settings-label-controls.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls edge label visibility mode (off, all-short, all-medium, selected-neighborhood, important-only)",
    },

    {
      id: "graph.showLabelsOnHover",
      label: "Show Labels On Hover",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.showLabelsOnHover",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphLabelPolicy.ts",
        targetComponent: "applyNodeLabelPolicy / applyEdgeLabelPolicy",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/settings-label-controls.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "When enabled, hovering nodes/edges shows their labels temporarily",
    },

    {
      id: "graph.nodeLabelFontSize",
      label: "Node Label Font Size",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.nodeLabelFontSize",
      runtimeBinding: {
        sourceFile: "src/graph/renderers/sigma2d/SigmaGraphView.tsx",
        targetComponent: "sigma.setSetting('labelSize')",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/settings-label-controls.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls node label font size (8-28)",
    },

    {
      id: "graph.edgeLabelFontSize",
      label: "Edge Label Font Size",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.edgeLabelFontSize",
      runtimeBinding: {
        sourceFile: "src/graph/renderers/sigma2d/SigmaGraphView.tsx",
        targetComponent: "sigma.setSetting('edgeLabelSize')",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/settings-label-controls.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls edge label font size (8-24)",
    },

    {
      id: "graph.maxEdgeLabelLength",
      label: "Max Edge Label Length",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "labels.maxEdgeLabelLength",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphLabelPolicy.ts",
        targetComponent: "applyEdgeLabelPolicy truncation",
        liveUpdate: true,
      },
      qa: {
        hasQaCoverage: false,
      },
      playwright: {
        testFile: "tests/e2e/edge-label-truncation.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls maximum edge label length before truncation (10-100)",
    },

    {
      id: "graph.neighborhoodDepth",
      label: "Neighborhood Depth",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "graphView.nodeSelectionStage",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphLabelPolicy.ts",
        targetComponent: "applyNodeLabelPolicy / applyEdgeLabelPolicy depth logic",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v7",
        hasQaCoverage: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Controls neighborhood depth for selected-neighborhood mode (1/2/3)",
    },

    {
      id: "graph.hoverNodeColor",
      label: "Hover Node Color",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "graphView.hoverNodeColor",
      runtimeBinding: {
        sourceFile: "src/graph/visual/graphStylePolicy.ts",
        targetComponent: "applyHoverStyles",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v4",
        hasQaCoverage: true,
        manualQaAccepted: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Color for hovered nodes (hex color)",
    },

    {
      id: "graph.nodeSize",
      label: "Node Size",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "physics.nodeSize",
      runtimeBinding: {
        sourceFile: "src/graph/renderers/sigma2d/buildGraphologyGraph.ts",
        targetComponent: "force layout node size multiplier",
        liveUpdate: false,
      },
      qa: {
        hasQaCoverage: true,
        manualQaAccepted: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Node size multiplier for force layout (not live-update, requires graph rebuild)",
    },

    {
      id: "graph.linkDistance",
      label: "Link Distance",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "physics.linkDistance",
      runtimeBinding: {
        sourceFile: "src/graph/renderers/sigma2d/buildGraphologyGraph.ts",
        targetComponent: "force layout link distance",
        liveUpdate: false,
      },
      qa: {
        hasQaCoverage: true,
        manualQaAccepted: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Edge length multiplier for force layout (not live-update, requires graph rebuild)",
    },

    {
      id: "graph.repelForce",
      label: "Repel Force",
      surface: "graph",
      owner: "settings.store.ts",
      settingsKey: "physics.repelForce",
      runtimeBinding: {
        sourceFile: "src/graph/renderers/sigma2d/buildGraphologyGraph.ts",
        targetComponent: "force layout repulsion",
        liveUpdate: false,
      },
      qa: {
        hasQaCoverage: true,
        manualQaAccepted: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/handleset/01_ACTIVE_HANDLES.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Repulsion force for force layout (not live-update, requires graph rebuild)",
    },

    // === Mission Control Controls ===

    {
      id: "missionControl.tabs",
      label: "Mission Control Tabs",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Mission Control tab selection is local QA state",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Tab switching (Checklist/Last Report/History/Debug)",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v0",
        hasQaCoverage: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Mission Control panel view tabs",
    },

    {
      id: "missionControl.checklistNavigation",
      label: "QA Checklist Navigation",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Checklist navigation index lives in QA panel state",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Next/Previous buttons",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v0",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/qa-navigation.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Next/Previous navigation buttons for QA checklist",
    },

    {
      id: "missionControl.statusSelectors",
      label: "QA Status Selectors",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Per-check status values live in QA panel state",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Pass/Fail/Not Applicable radio buttons",
        liveUpdate: true,
      },
      qa: {
        hasQaCoverage: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Pass/Fail/Not Applicable status selection for each check",
    },

    {
      id: "missionControl.notesField",
      label: "QA Notes Field",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Notes fields persist via QA panel local storage only",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Notes textarea",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v0",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/qa-navigation.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Notes field for each QA check",
    },

    {
      id: "missionControl.submitReport",
      label: "QA Submit Report",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Submit button operates on QA history, no settings key",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Submit button",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "baseline-b-consolidation-followup-v0",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/qa-submit.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Submit button generates report and clears working form",
    },

    {
      id: "missionControl.copyLastSubmission",
      label: "Copy Last Submission",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Copy action reads last submission only",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Copy Last Submission button",
        liveUpdate: true,
      },
      qa: {
        hasQaCoverage: true,
      },
      playwright: {
        hasCoverage: false,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Copy last submission markdown to clipboard",
    },

    {
      id: "missionControl.decisionBadge",
      label: "Mission Control Decision Badge",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "Decision badge reflects submission history, no setting",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "Decision badge in header",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "theme-mission-control-integrity-v11",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/theme-selector.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "Shows ACCEPT/INCOMPLETE/BLOCKED status in header",
    },

    {
      id: "missionControl.history",
      label: "Mission Control History",
      surface: "missionControl",
      owner: "qa.store.ts",
      settingsKey: null,
      noStorageReason: "History tab reads QA submissions, no settings key",
      runtimeBinding: {
        sourceFile: "src/control-plane/qa/QaPanel.tsx",
        targetComponent: "History tab",
        liveUpdate: true,
      },
      qa: {
        checklistKey: "theme-mission-control-integrity-v11",
        hasQaCoverage: true,
      },
      playwright: {
        testFile: "tests/e2e/theme-selector.spec.ts",
        hasCoverage: true,
      },
      docs: {
        location: "docs/mission-control/00_MISSION_CONTROL_OVERVIEW.md",
        hasDocs: true,
      },
      status: "active",
      risk: "low",
      notes: "History tab shows submissions sorted by most recent first",
    },
  ],
};
