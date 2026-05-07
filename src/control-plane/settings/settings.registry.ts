export type SettingControl =
  | {
      type: "boolean";
      path: string;
      label: string;
      description?: string;
      category: string;
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
    }
  | {
      type: "select";
      path: string;
      label: string;
      description?: string;
      category: string;
      options: Array<{ value: string; label: string }>;
    }
  | {
      type: "text";
      path: string;
      label: string;
      description?: string;
      category: string;
    };

export const settingsRegistry: SettingControl[] = [
  // Theme and glitter controls moved to top bar for quick access
  // {
  //   type: "select",
  //   category: "Appearance",
  //   path: "appearance.theme",
  //   label: "Theme",
  //   options: [
  //     { value: "solar-plasma", label: "Solar Plasma" },
  //     { value: "obsidian-aurora", label: "Obsidian Aurora" },
  //     { value: "haunted-observatory", label: "Haunted Observatory" },
  //     { value: "glitter-goblin", label: "Glitter Goblin" },
  //   ],
  // },
  // {
  //   type: "boolean",
  //   category: "Appearance",
  //   path: "appearance.glitterEnabled",
  //   label: "Enable Glitter",
  //   description: "Turns semantic sparkle, flare, and plasma effects on or off.",
  // },
  // Reduce Motion moved to top bar for quick access
  // {
  //   type: "boolean",
  //   category: "Accessibility",
  //   path: "appearance.reduceMotion",
  //   label: "Reduce Motion",
  //   description: "Disables or softens animations.",
  // },
  {
    type: "select",
    category: "Physics",
    path: "physics.physicsPreset",
    label: "Physics Preset",
    description: "Quick preset configurations for common graph layouts.",
    options: [
      { value: "custom", label: "Custom" },
      { value: "balanced", label: "Balanced" },
      { value: "spread", label: "Spread Out" },
      { value: "tight", label: "Tight Clusters" },
      { value: "organic", label: "Organic Flow" },
      { value: "performance", label: "Performance" },
    ],
  },
  {
    type: "select",
    category: "Physics",
    path: "physics.physicsDialect",
    label: "Physics Dialect",
    description: "Layout algorithm and shape",
    options: [
      { value: "default", label: "Default (Force-Directed)" },
      { value: "helix", label: "Helix (Brand Shape)" },
    ],
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.nodeSize",
    label: "Node Size",
    min: 0.25,
    max: 4,
    step: 0.05,
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.linkDistance",
    label: "Simulation Speed",
    min: 1,
    max: 20,
    step: 0.5,
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.repelForce",
    label: "Repel Force",
    min: 0,
    max: 500,
    step: 5,
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.centerForce",
    label: "Center Force",
    description: "Controls attraction to graph center.",
    min: 0,
    max: 200,
    step: 5,
  },
  // ForceAtlas2 advanced parameters
  {
    type: "boolean",
    category: "Physics",
    path: "physics.strongGravityMode",
    label: "Strong Gravity Mode",
    description: "Enables stronger gravity force for more compact layouts.",
  },
  {
    type: "boolean",
    category: "Physics",
    path: "physics.linLogMode",
    label: "Lin-Log Mode",
    description: "Uses logarithmic attraction for better edge distribution.",
  },
  {
    type: "boolean",
    category: "Physics",
    path: "physics.adjustSizes",
    label: "Adjust Sizes",
    description: "Allows FA2 to adjust node sizes during simulation.",
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.barnesHutTheta",
    label: "Barnes-Hut Theta",
    description: "Accuracy/performance tradeoff for Barnes-Hut approximation.",
    min: 0.1,
    max: 1.2,
    step: 0.05,
  },
  {
    type: "range",
    category: "Physics",
    path: "physics.communityGravity",
    label: "Community Gravity",
    description: "Extra gravitational pull toward cluster centroid. Tightens neighborhoods.",
    min: 0,
    max: 5,
    step: 0.1,
  },
  // Planned physics settings hidden until wired to force layout
  // {
  //   type: "range",
  //   category: "Physics",
  //   path: "physics.centerForce",
  //   label: "Center Force (Planned)",
  //   description: "Controls attraction to graph center. Planned for force layout v1.",
  //   min: 0,
  //   max: 200,
  //   step: 5,
  // },
  // {
  //   type: "range",
  //   category: "Physics",
  //   path: "physics.communityGravity",
  //   label: "Community Gravity (Planned)",
  //   description: "Controls intra-community clustering. Planned for force layout v1.",
  //   min: 0,
  //   max: 200,
  //   step: 5,
  // },
  // {
  //   type: "range",
  //   category: "Physics",
  //   path: "physics.curveAmount",
  //   label: "Edge Curve (Planned)",
  //   description: "Controls edge curvature. Planned for visual polish.",
  //   min: 0,
  //   max: 100,
  //   step: 5,
  // },
  // {
  //   type: "range",
  //   category: "Physics",
  //   path: "physics.animationSoftness",
  //   label: "Animation Softness (Planned)",
  //   description: "Controls transition smoothness. Planned for force layout v1.",
  //   min: 0,
  //   max: 100,
  //   step: 5,
  // },
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
  // Planned label settings hidden until wired to renderer
  // {
  //   type: "range",
  //   category: "Labels",
  //   path: "labels.zoomLabelThreshold",
  //   label: "Zoom Label Threshold (Planned)",
  //   description: "Minimum zoom level to show labels. Planned for future implementation.",
  //   min: 0.5,
  //   max: 3,
  //   step: 0.05,
  // },
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
  // {
  //   type: "text",
  //   category: "Labels",
  //   path: "labels.hoverLabelColor",
  //   label: "Hover Label Color (Planned)",
  //   description: "Hex color for hover label text. Per-node hover label color is not yet implemented. Planned for future label color customization.",
  // },
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
  // Planned settings hidden until wired to renderer
  // {
  //   type: "text",
  //   category: "Graph View",
  //   path: "graphView.selectedNodeColor",
  //   label: "Selected Node Color (Planned)",
  //   description: "Hex color for selected node highlight. Planned for future theme customization.",
  // },
  // {
  //   type: "text",
  //   category: "Graph View",
  //   path: "graphView.defaultNodeColor",
  //   label: "Default Node Color (Planned)",
  //   description: "Hex color for default node fill. Planned for future theme customization.",
  // },
  // {
  //   type: "text",
  //   category: "Graph View",
  //   path: "graphView.selectedEdgeColor",
  //   label: "Selected Edge Color (Planned)",
  //   description: "Hex color for selected edge stroke. Planned for future theme customization.",
  // },
];