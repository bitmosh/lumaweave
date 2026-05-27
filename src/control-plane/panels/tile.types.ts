/**
 * v86c Tile System Type Definitions
 * Extended in post-v97 pass 1 with anchor system types.
 */

import type { ReactNode } from "react";
import type { RegistryContract } from "../../themes/registryContract.types";

/** Which viewport edge a tile is anchored to, or "free" for explicit coords. */
export type TileAnchorEdge = "left" | "right" | "top" | "bottom" | "free";

/**
 * Describes where a tile lives when "returned to anchor".
 * Edge anchors use an offset from the top (left/right) or left (top/bottom).
 * Free anchors use explicit x/y viewport coords.
 */
export interface TileAnchor {
  edge: TileAnchorEdge;
  /** Pixel offset from the top of the viewport (left/right edges) or left (top/bottom). */
  offset?: number;
  /** Used when edge === "free" — explicit horizontal position. */
  x?: number;
  /** Used when edge === "free" — explicit vertical position. */
  y?: number;
}

/**
 * Tile section registry entry
 * Defines a section that can be torn off into a floating tile
 */
export interface TileSectionEntry {
  /** Unique identifier for the section */
  id: string;
  /** Display label for the section */
  label: string;
  /** Category for grouping/filtering */
  category: "left-panel" | "control-dock" | "right-panel";
  /** Default width when torn off */
  defaultWidth: number;
  /** Default height when torn off */
  defaultHeight: number;
  /** Whether the section is collapsible */
  collapsible: boolean;
  /**
   * Render function for the tile body. Called by FloatingTile
   * when this section is tiled out. v86c-B onward.
   */
  content?: () => ReactNode;

  /**
   * Testid that must be visible inside the tile body when this
   * section's content() is called. The regression test in
   * v86c-tile-system.spec.ts asserts this testid is visible
   * after tear-off. REQUIRED to be set when content is wired.
   * Undefined for sections whose content() is not yet wired.
   */
  contentTestId?: string;

  /**
   * Testid of the source slot's outer container in the docked
   * (not-tiled-out) state. Used by tests to locate the tear-off
   * handle and verify the slot's tiled-out indicator state.
   * Should be set for all entries in this registry.
   */
  sourceTestId?: string;

  /** Where the tile sits when "returned to anchor". */
  defaultAnchor: TileAnchor;
  /** Whether the tile appears on first app load. Toggleable via Tiles popover. */
  defaultVisible: boolean;
  /** Whether the tile body is expanded (vs. collapsed to title bar) on first load. */
  defaultExpanded: boolean;
  /** Glyph shown in the Tiles popover checkbox list. */
  iconGlyph?: string;
}

/**
 * Snap guide state (shown during drag as visual feedback)
 * Displays a preview rectangle and edge lines showing where tile will snap
 */
export interface SnapGuide {
  /** X position of preview rectangle */
  previewX: number;
  /** Y position of preview rectangle */
  previewY: number;
  /** Width of preview rectangle */
  previewW: number;
  /** Height of preview rectangle */
  previewH: number;
  /** X coordinate of vertical edge line (null if no horizontal snap) */
  edgeX: number | null;
  /** Y coordinate of horizontal edge line (null if no vertical snap) */
  edgeY: number | null;
}

/**
 * Tile group (runtime-computed, not persisted)
 * Represents a group of snapped-together tiles
 * Reference: (NEW)tile-system.jsx lines 134-184
 */
export interface TileGroup {
  /** Array of tile IDs in this group */
  tileIds: string[];
  /** Array of tile IDs in the top row (for THE BIG RULE) */
  topRow: string[];
  /** X position of the top row bar */
  topX: number;
  /** Width of the top row bar (CONTIGUOUS top-row tiles, NOT bbox) */
  topW: number;
  /** Y position of the top row */
  topY: number;
  /** Bounding box of the entire group (rectilinear hull) */
  bbox: {
    x: number;
    y: number;
    x2: number;
    y2: number;
  };
}

/**
 * Tile context state
 */
export interface TileContextState {
  /** Map of tile ID to tile layout entry */
  tiles: Map<string, TileLayoutEntry>;
  /** Current z-index counter for bring-to-front */
  maxZ: number;
  /** Computed groups (runtime only) */
  groups: TileGroup[];
  /** Active snap guide (shown during drag) */
  snapGuide: SnapGuide | null;
}

/**
 * Tile context actions
 * Reference: (NEW)tile-system.jsx lines 40-43
 */
export interface TileContextActions {
  /** Tile out: convert a section into a floating tile. Returns tile ID if added, null otherwise. */
  tileOut: (sectionKey: string, atPos?: { x: number; y: number }) => string | null;
  /** Close a tile (return to original slot) */
  closeTile: (tileId: string) => void;
  /** Close a group of tiles */
  closeGroup: (groupIds: string[]) => void;
  /** Update tile position/size during drag */
  updateTile: (tileId: string, updates: Partial<TileLayoutEntry>) => void;
  /** Bring a tile to front */
  bringToFront: (tileId: string) => void;
  /** Toggle tile collapsed state */
  toggleCollapsed: (tileId: string) => void;
  /** Check if a section is currently tiled out */
  isTiledOut: (sectionKey: string) => boolean;
  /** Set snap guide state (shown during drag as visual feedback) */
  setSnapGuide: (guide: SnapGuide | null) => void;
  /** Show or hide a tile without removing it from the layout. */
  setTileVisibility: (tileId: string, visible: boolean) => void;
  /** Update the tile's persisted anchor to its current position (free anchor). */
  setTileAnchor: (tileId: string) => void;
  /** Slide the tile to its anchor position with a transition. */
  returnToAnchor: (tileId: string) => void;
  /** Legacy alias for tileOut (for backward compatibility) */
  tearOff?: (sectionKey: string, initialX: number, initialY: number) => void;
}

/**
 * Tile layout entry (persisted in settings)
 * This is already defined in settings.schema.ts but re-exported here for convenience
 */
export interface TileLayoutEntry {
  id: string;
  sectionKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  collapsed: boolean;
  z: number;
  prevH?: number;
  /** Whether the tile is visible in the viewport (false = hidden until re-enabled via Tiles popover). */
  visible?: boolean;
  /** Persisted anchor position. Defaults to the registry entry's defaultAnchor on first open. */
  anchor?: TileAnchor;
}

/**
 * Tile section registry type
 */
export type TileSectionRegistry = RegistryContract<TileSectionEntry, Partial<TileSectionEntry>>;

/**
 * Snap constants
 */
export const SNAP_GRID_SIZE = 16; // px
export const EDGE_MAGNETISM_TOLERANCE = 75; // px (strong magnetic snap)
