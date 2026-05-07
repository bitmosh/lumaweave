/**
 * Theme Type Definitions
 * 
 * This file defines the core types for the theme preset system.
 */

import type { ThemeId } from "../control-plane/settings/settings.schema";

/**
 * Unique identifier for a theme preset
 */
export type ThemePresetId = string;

/**
 * Theme preset definition
 */
export interface ThemePreset {
  /** Unique preset identifier */
  id: ThemePresetId;
  /** Human-readable name */
  name: string;
  /** Description of the preset */
  description?: string;
  /** Whether this is a built-in preset (cannot be deleted) */
  builtIn: boolean;
  /** The theme ID this preset represents */
  themeId: ThemeId;
  /** Optional tags for categorization */
  tags?: string[];
  /** Additional notes */
  notes?: string;
}

/**
 * Theme preset registry
 */
export interface ThemePresetRegistry {
  /** All theme presets */
  presets: ThemePreset[];
  /** Registry version */
  version: string;
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * Theme runtime tokens
 * Defines visual values for app shell, panels, and graph elements
 */
export interface ThemeRuntimeTokens {
  /** App shell and panel styling */
  app: {
    background: string;
    panelBackground: string;
    panelBorder: string;
    textPrimary: string;
    textMuted: string;
    accent: string;
    glow: string;
  };
  /** Graph node colors */
  graph: {
    nodeDefault: string;
    nodeHover: string;
    nodeSelected: string;
    nodeSecondary: string;
    nodeTertiary: string;
    edgeDefault: string;
    edgeHover: string;
    edgeSelected: string;
    edgeSecondary: string;
    edgeTertiary: string;
    nodeLabel: string;
    nodeLabelHover: string;
    edgeLabel: string;
    edgeLabelHover: string;
    nodeColorScale: string[];
    edgeColorScale: string[];
  };
  /** Effect toggles */
  effects: {
    glitterEnabled: boolean;
    starfieldEnabled: boolean;
    glowIntensity: number;
  };
}
