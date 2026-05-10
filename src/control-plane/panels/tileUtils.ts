/**
 * v86c Tile System Utilities
 * Snap algorithm, group computation, pointer capture helpers
 */

import type { TileLayoutEntry, TileGroup } from "./tile.types";
import { SNAP_GRID_SIZE, EDGE_MAGNETISM_TOLERANCE } from "./tile.types";

/**
 * Snap a coordinate to the nearest grid point
 */
export function snapToGrid(value: number): number {
  return Math.round(value / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
}

/**
 * Apply edge magnetism to a position
 * Snaps to nearby tile edges within tolerance
 */
export function applyEdgeMagnetism(
  x: number,
  y: number,
  w: number,
  h: number,
  otherTiles: TileLayoutEntry[]
): { x: number; y: number } {
  let snappedX = x;
  let snappedY = y;

  for (const tile of otherTiles) {
    // Check horizontal edge snapping
    if (Math.abs(x - (tile.x + tile.w)) < EDGE_MAGNETISM_TOLERANCE) {
      snappedX = tile.x + tile.w;
    } else if (Math.abs((x + w) - tile.x) < EDGE_MAGNETISM_TOLERANCE) {
      snappedX = tile.x - w;
    } else if (Math.abs(x - tile.x) < EDGE_MAGNETISM_TOLERANCE) {
      snappedX = tile.x;
    }

    // Check vertical edge snapping
    if (Math.abs(y - (tile.y + tile.h)) < EDGE_MAGNETISM_TOLERANCE) {
      snappedY = tile.y + tile.h;
    } else if (Math.abs((y + h) - tile.y) < EDGE_MAGNETISM_TOLERANCE) {
      snappedY = tile.y - h;
    } else if (Math.abs(y - tile.y) < EDGE_MAGNETISM_TOLERANCE) {
      snappedY = tile.y;
    }
  }

  return { x: snappedX, y: snappedY };
}

/**
 * Check if two tiles are adjacent (touching or overlapping)
 */
function areAdjacent(a: TileLayoutEntry, b: TileLayoutEntry): boolean {
  const tolerance = EDGE_MAGNETISM_TOLERANCE;
  
  // Check if tiles touch or overlap
  const horizontalOverlap =
    a.x < b.x + b.w + tolerance &&
    a.x + a.w + tolerance > b.x;
  
  const verticalOverlap =
    a.y < b.y + b.h + tolerance &&
    a.y + a.h + tolerance > b.y;
  
  return horizontalOverlap && verticalOverlap;
}

/**
 * Compute connected components of tiles (groups)
 * Uses O(n²) algorithm - acceptable for ~20 tiles
 */
export function computeGroups(tiles: TileLayoutEntry[]): TileGroup[] {
  if (tiles.length === 0) {
    return [];
  }

  const visited = new Set<string>();
  const groups: TileGroup[] = [];

  for (const tile of tiles) {
    if (visited.has(tile.id)) {
      continue;
    }

    // BFS to find all connected tiles
    const groupTiles: TileLayoutEntry[] = [];
    const queue: TileLayoutEntry[] = [tile];
    visited.add(tile.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      groupTiles.push(current);

      for (const other of tiles) {
        if (!visited.has(other.id) && areAdjacent(current, other)) {
          visited.add(other.id);
          queue.push(other);
        }
      }
    }

    // Compute rectilinear hull (bounding box)
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const t of groupTiles) {
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x + t.w);
      maxY = Math.max(maxY, t.y + t.h);
    }

    // Compute top row width (THE BIG RULE)
    // Sort tiles by y, then group by y-coordinate
    const sortedByY = [...groupTiles].sort((a, b) => a.y - b.y);
    const topY = sortedByY[0].y;
    const topRowTiles = sortedByY.filter((t) => Math.abs(t.y - topY) < EDGE_MAGNETISM_TOLERANCE);
    
    // Find min and max x of top row
    let topRowMinX = Infinity;
    let topRowMaxX = -Infinity;
    for (const t of topRowTiles) {
      topRowMinX = Math.min(topRowMinX, t.x);
      topRowMaxX = Math.max(topRowMaxX, t.x + t.w);
    }
    const topRowWidth = topRowMaxX - topRowMinX;

    groups.push({
      tileIds: groupTiles.map((t) => t.id),
      bbox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      topRowWidth,
    });
  }

  return groups;
}

/**
 * Set pointer capture on an element
 * Ensures continuous event firing during drag
 */
export function setPointerCaptureSafe(element: HTMLElement): void {
  try {
    if (element.setPointerCapture) {
      element.setPointerCapture((element as any).pointerId || 0);
    }
  } catch (e) {
    // Gracefully handle if capture fails
    console.warn("Failed to set pointer capture:", e);
  }
}

/**
 * Release pointer capture on an element
 */
export function releasePointerCaptureSafe(element: HTMLElement): void {
  try {
    if (element.releasePointerCapture) {
      element.releasePointerCapture((element as any).pointerId || 0);
    }
  } catch (e) {
    // Gracefully handle if release fails
    console.warn("Failed to release pointer capture:", e);
  }
}

/**
 * Generate a unique tile ID
 */
export function generateTileId(sectionKey: string): string {
  return `tile_${sectionKey}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a point is within a tile's unsnap grip area
 * Grip is in the top-right corner, 20x20px
 */
export function isInUnsnapGrip(
  tileX: number,
  tileY: number,
  tileW: number,
  pointX: number,
  pointY: number
): boolean {
  const gripSize = 20;
  const gripX = tileX + tileW - gripSize;
  const gripY = tileY;
  
  return (
    pointX >= gripX &&
    pointX <= gripX + gripSize &&
    pointY >= gripY &&
    pointY <= gripY + gripSize
  );
}
