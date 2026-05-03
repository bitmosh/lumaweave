/**
 * Graph Visual Theme Mapping Registry
 *
 * A passive/read-only registry that defines the governance relationship
 * between graph visual elements and canonical theme token paths.
 *
 * This registry is metadata only. It does not apply styles to Sigma,
 * does not mutate graph renderer, and does not change node/edge styles.
 *
 * v50: Passive Graph Theme Mapping Inventory
 */

/**
 * Graph Visual Theme Mapping
 *
 * Defines the intended relationship between a graph visual element
 * and its canonical theme token path.
 *
 * This is governance metadata for inspection only.
 * No runtime theme application occurs in v50.
 */
export interface GraphVisualThemeMapping {
  /** Graph visual element ID (from Graph View Element Registry) */
  graphElementId: string;

  /** Visual role description */
  visualRole: string;

  /** Canonical theme token path (from THEME_TOKEN_PATH_MAP.md) */
  canonicalTokenPath: string;

  /** Token source documentation */
  tokenSource: "THEME_TOKEN_PATH_MAP.md" | "themeTokenPaths.ts";

  /** Mapping status */
  status: "active" | "planned" | "deferred";

  /** Boundary notes explaining why this mapping is governance-only */
  boundaryNote: string;
}

/**
 * Graph Visual Theme Mapping Registry
 *
 * Static typed inventory of graph visual element to canonical theme
 * token relationships.
 *
 * This registry is read-only and passive. It does not apply styles,
 * does not access Sigma, and does not mutate graph behavior.
 */
export const graphVisualThemeMappingRegistry: GraphVisualThemeMapping[] = [
  {
    graphElementId: "graph.frame",
    visualRole: "Container frame/border for graph viewport",
    canonicalTokenPath: "panel.border",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not apply border to Sigma canvas.",
  },
  {
    graphElementId: "graph.frame",
    visualRole: "Container background for graph viewport",
    canonicalTokenPath: "panel.background",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not apply background to Sigma canvas.",
  },
  {
    graphElementId: "graph.surface",
    visualRole: "Graph background surface",
    canonicalTokenPath: "app.background",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not apply background to Sigma canvas.",
  },
  {
    graphElementId: "graph.nodes",
    visualRole: "Node fill color",
    canonicalTokenPath: "graph.node.fill",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma node styles.",
  },
  {
    graphElementId: "graph.nodes",
    visualRole: "Node hover fill color",
    canonicalTokenPath: "graph.node.hoverFill",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma node styles.",
  },
  {
    graphElementId: "graph.nodes",
    visualRole: "Node selected fill color",
    canonicalTokenPath: "graph.node.selectedFill",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma node styles.",
  },
  {
    graphElementId: "graph.nodes",
    visualRole: "Node label color",
    canonicalTokenPath: "graph.node.label",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma node styles.",
  },
  {
    graphElementId: "graph.edges",
    visualRole: "Edge stroke color",
    canonicalTokenPath: "graph.edge.stroke",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma edge styles.",
  },
  {
    graphElementId: "graph.edges",
    visualRole: "Edge hover stroke color",
    canonicalTokenPath: "graph.edge.hoverStroke",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma edge styles.",
  },
  {
    graphElementId: "graph.edges",
    visualRole: "Edge selected stroke color",
    canonicalTokenPath: "graph.edge.selectedStroke",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma edge styles.",
  },
  {
    graphElementId: "graph.edges",
    visualRole: "Edge label color",
    canonicalTokenPath: "graph.edge.label",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma edge styles.",
  },
  {
    graphElementId: "graph.labels",
    visualRole: "Primary text color",
    canonicalTokenPath: "text.primary",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma label styles.",
  },
  {
    graphElementId: "graph.labels",
    visualRole: "Muted text color",
    canonicalTokenPath: "text.muted",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not mutate Sigma label styles.",
  },
  {
    graphElementId: "graph.glow/effects",
    visualRole: "Glow intensity",
    canonicalTokenPath: "effects.glow.intensity",
    tokenSource: "THEME_TOKEN_PATH_MAP.md",
    status: "active",
    boundaryNote: "Governance mapping only. Does not apply effects to Sigma canvas.",
  },
];

/**
 * Get all graph visual theme mappings
 *
 * Returns the complete registry for inspection.
 * This is read-only and does not trigger any runtime changes.
 */
export function getAllGraphVisualThemeMappings(): GraphVisualThemeMapping[] {
  return graphVisualThemeMappingRegistry;
}

/**
 * Get theme mappings for a specific graph element
 *
 * Returns mappings for the given graph element ID.
 * This is read-only and does not trigger any runtime changes.
 */
export function getThemeMappingsForGraphElement(
  graphElementId: string
): GraphVisualThemeMapping[] {
  return graphVisualThemeMappingRegistry.filter(
    (mapping) => mapping.graphElementId === graphElementId
  );
}

/**
 * Get active theme mappings
 *
 * Returns only mappings with status "active".
 * This is read-only and does not trigger any runtime changes.
 */
export function getActiveThemeMappings(): GraphVisualThemeMapping[] {
  return graphVisualThemeMappingRegistry.filter(
    (mapping) => mapping.status === "active"
  );
}
