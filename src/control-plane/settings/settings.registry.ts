import type { CategoryId } from './settingsPanel.types';

export type SettingControl =
  | {
      type: "boolean";
      path: string;
      label: string;
      description?: string;
      category: CategoryId;
      tileVisibleByDefault?: boolean;
      testId?: string;
    }
  | {
      type: "range";
      path: string;
      label: string;
      description?: string;
      category: CategoryId;
      tileVisibleByDefault?: boolean;
      min: number;
      max: number;
      step: number;
      testId?: string;
    }
  | {
      type: "select";
      path: string;
      label: string;
      description?: string;
      category: CategoryId;
      tileVisibleByDefault?: boolean;
      options: Array<{ value: string; label: string }>;
      testId?: string;
    }
  | {
      type: "text";
      path: string;
      label: string;
      description?: string;
      category: CategoryId;
      tileVisibleByDefault?: boolean;
      testId?: string;
    };

export const settingsRegistry: SettingControl[] = [
  {
    type: "select",
    category: "graph",
    path: "physics.dialectId",
    label: "Gwells Dialect",
    description: "Gwells physics dialect for graph layout.",
    testId: "dialect-select",
    options: [
      { value: "gwells.dialect.radial-backbone", label: "Radial Backbone" },
      { value: "gwells.dialect.parallel-spines", label: "Parallel Spines" },
    ],
  },
  {
    type: "select",
    category: "graph",
    path: "labels.nodeLabelMode",
    label: "Node Label Mode",
    options: [
      { value: "off", label: "Off" },
      { value: "selected-neighborhood", label: "Selected Neighborhood" },
      { value: "important-only", label: "Important Only" },
      { value: "all", label: "All" },
    ],
  },
  {
    type: "select",
    category: "graph",
    path: "labels.edgeLabelMode",
    label: "Edge Label Mode",
    options: [
      { value: "off", label: "Off" },
      { value: "selected-neighborhood", label: "Selected Neighborhood" },
      { value: "important-only", label: "Important Only" },
      { value: "all-short", label: "All Short" },
      { value: "all-medium", label: "All Medium" },
    ],
  },
  {
    type: "range",
    category: "graph",
    path: "labels.maxEdgeLabelLength",
    label: "Max Edge Label Length",
    min: 10,
    max: 100,
    step: 1,
  },
  {
    type: "boolean",
    category: "graph",
    path: "labels.showLabelsOnHover",
    label: "Show Labels On Hover",
    description: "Show node label when hovering over a node.",
  },
  {
    type: "range",
    category: "graph",
    path: "labels.edgeLabelFontSize",
    label: "Edge Label Font Size",
    description: "Controls rendered relationship/edge label text size.",
    min: 8,
    max: 24,
    step: 1,
  },
  {
    type: "range",
    category: "graph",
    path: "labels.nodeLabelFontSize",
    label: "Node Label Font Size",
    description: "Controls rendered node label text size.",
    min: 8,
    max: 28,
    step: 1,
  },
  {
    type: "range",
    category: "graph",
    path: "graphView.neighborhoodDepth",
    label: "Neighborhood Depth",
    description: "Depth of neighborhood shown when selecting a node. Fractional values fade between depths.",
    min: 1,
    max: 4,
    step: 0.1,
  },
  {
    type: "text",
    category: "graph",
    path: "graphView.hoverNodeColor",
    label: "Hover Node Color",
    description: "Hex color for node hover highlight. Example: #ffffff",
  },

  // Theme category — 7 entries (v87.2)
  // These sit dormant until v89 ControlDock rebuild renders by category.
  {
    type: "select",
    category: "theme",
    path: "appearance.theme",
    label: "Theme Preset",
    description: "Active theme.",
    options: [
      { value: "solar-plasma",    label: "Solar Plasma" },
      { value: "obsidian-aurora", label: "Obsidian Aurora" },
      { value: "midnight-loom",   label: "Midnight Loom" },
      { value: "void-circuit",    label: "Void Circuit" },
      { value: "agartha-dream",   label: "Agartha Dream" },
      { value: "agartha-dusk",    label: "Agartha Dusk" },
    ],
  },
  {
    type: "select",
    category: "theme",
    path: "appearance.drama",
    label: "Drama",
    description: "Solar Plasma mood preset — multiplier on glow + motion intensity.",
    options: [
      { value: "quiet",   label: "Quiet" },
      { value: "cranked", label: "Cranked" },
      { value: "extreme", label: "Extreme" },
    ],
  },
  {
    type: "range",
    category: "theme",
    path: "appearance.motionScale",
    label: "Motion Scale",
    description: "Master multiplier on backdrop and effect motion. 0 = still.",
    min: 0, max: 1.5, step: 0.05,
  },
  {
    type: "range",
    category: "theme",
    path: "appearance.panelBlur",
    label: "Panel Blur",
    description: "backdrop-filter blur amount on dock and panels.",
    min: 0, max: 28, step: 1,
  },
  {
    type: "range",
    category: "theme",
    path: "appearance.nodeHum",
    label: "Sphere Hum",
    description: "Node interior fade rate.",
    min: 0, max: 2, step: 0.05,
  },
  {
    type: "range",
    category: "theme",
    path: "appearance.nodeFlowSpeed",
    label: "Sphere Flow Speed",
    description: "Node interior rotational flow speed.",
    min: 0, max: 2, step: 0.05,
  },
  {
    type: "range",
    category: "theme",
    path: "appearance.nodeGlow",
    label: "Sphere Glow",
    description: "Node halo glow strength.",
    min: 0.2, max: 2, step: 0.05,
  },
];
