export type SettingControl =
  | {
      type: "boolean";
      path: string;
      label: string;
      description?: string;
      category: string;
      testId?: string;
    }
  | {
      type: "range";
      path: string;
      label: string;
      description?: string;
      category: string;
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
      category: string;
      options: Array<{ value: string; label: string }>;
      testId?: string;
    }
  | {
      type: "text";
      path: string;
      label: string;
      description?: string;
      category: string;
      testId?: string;
    };

export const settingsRegistry: SettingControl[] = [
  {
    type: "select",
    category: "Physics",
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
    category: "Labels",
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
    category: "Labels",
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
    category: "Labels",
    path: "labels.maxEdgeLabelLength",
    label: "Max Edge Label Length",
    min: 10,
    max: 100,
    step: 1,
  },
  {
    type: "boolean",
    category: "Labels",
    path: "labels.showLabelsOnHover",
    label: "Show Labels On Hover",
    description: "Show node label when hovering over a node.",
  },
  {
    type: "range",
    category: "Labels",
    path: "labels.edgeLabelFontSize",
    label: "Edge Label Font Size",
    description: "Controls rendered relationship/edge label text size.",
    min: 8,
    max: 24,
    step: 1,
  },
  {
    type: "range",
    category: "Labels",
    path: "labels.nodeLabelFontSize",
    label: "Node Label Font Size",
    description: "Controls rendered node label text size.",
    min: 8,
    max: 28,
    step: 1,
  },
  {
    type: "range",
    category: "Graph View",
    path: "graphView.neighborhoodDepth",
    label: "Neighborhood Depth",
    description: "Depth of neighborhood shown when selecting a node. Fractional values fade between depths.",
    min: 1,
    max: 4,
    step: 0.1,
  },
  {
    type: "text",
    category: "Graph View",
    path: "graphView.hoverNodeColor",
    label: "Hover Node Color",
    description: "Hex color for node hover highlight. Example: #ffffff",
  },
];