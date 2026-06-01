/**
 * v86c Tile Utilities
 * Reference: (NEW)tile-system.jsx lines 134-204
 */

import type { TileLayoutEntry, TileGroup, TileAnchor } from "./tile.types";
import { defaultFeatureFlags } from "../features/feature-flags";

const STATUS_BAR_HEIGHT = 40;
const TOPBAR_HEIGHT = 64;

export function computeAnchorPos(
  anchor: TileAnchor,
  w: number,
  h: number,
): { x: number; y: number } {
  const offset = anchor.offset ?? 80;
  const maxY = Math.max(TOPBAR_HEIGHT, window.innerHeight - STATUS_BAR_HEIGHT - h - 8);
  const clampY = (y: number) => Math.max(TOPBAR_HEIGHT, Math.min(y, maxY));
  const clampX = (x: number) => Math.max(8, Math.min(x, window.innerWidth - w - 8));
  switch (anchor.edge) {
    case "left":
      return { x: 8, y: clampY(offset) };
    case "right":
      return { x: clampX(window.innerWidth - w - 8), y: clampY(offset) };
    case "top":
      return { x: clampX(offset), y: TOPBAR_HEIGHT };
    case "bottom":
      return { x: clampX(offset), y: clampY(window.innerHeight - h - STATUS_BAR_HEIGHT - 8) };
    case "free":
      return { x: clampX(anchor.x ?? 100), y: clampY(anchor.y ?? 100) };
    default:
      return { x: 100, y: 100 };
  }
}

export function isOffAnchor(
  tile: TileLayoutEntry,
  anchor: TileAnchor,
): boolean {
  const pos = computeAnchorPos(anchor, tile.w, tile.h);
  return Math.abs(tile.x - pos.x) > 4 || Math.abs(tile.y - pos.y) > 4;
}

export const COLLAPSED_H = 30;
export const SNAP_TOL = 15;   // px — per-axis edge detection (replaces 75px hypot)
export const BREAK_TOL = SNAP_TOL * 2; // 30px — used by group-break (v101.0.3+)

export type Rect = { x: number; y: number; w: number; h: number };
export type SnapResult = { x?: number; y?: number } | null;

// --- Group computation: tiles snapped edge-to-edge form a group ----
// BIG RULE: topRow width is computed from CONTIGUOUS top-row tiles, NOT bbox
// Reference: (NEW)tile-system.jsx lines 134-184
export function computeGroups(tiles: TileLayoutEntry[]): { groups: TileGroup[]; tileToGroup: Record<string, string> } {
  // Tile grouping disabled via feature flag
  if (!defaultFeatureFlags.tileGrouping) {
    return { groups: [], tileToGroup: {} };
  }

  // skip collapsed-state — group the bbox you SEE
  const rect = (t: TileLayoutEntry) => ({ x: t.x, y: t.y, w: t.w, h: t.collapsed ? COLLAPSED_H : t.h });
  const adj = (a: TileLayoutEntry, b: TileLayoutEntry) => {
    const ar = rect(a), br = rect(b);
    const horizontalTouch = Math.abs((ar.x + ar.w) - br.x) < 2 || Math.abs((br.x + br.w) - ar.x) < 2;
    const verticalTouch = Math.abs((ar.y + ar.h) - br.y) < 2 || Math.abs((br.y + br.h) - ar.y) < 2;
    const yOverlap = ar.y < br.y + br.h && br.y < ar.y + ar.h;
    const xOverlap = ar.x < br.x + br.w && br.x < ar.x + ar.w;
    return (horizontalTouch && yOverlap) || (verticalTouch && xOverlap);
  };
  // union-find
  const parent: Record<string, string> = {};
  const find = (x: string): string => parent[x] === x ? x : parent[x] = find(parent[x]);
  const union = (a: string, b: string) => { parent[find(a)] = find(b); };
  tiles.forEach(t => parent[t.id] = t.id);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (adj(tiles[i], tiles[j])) union(tiles[i].id, tiles[j].id);
    }
  }
  const buckets: Record<string, TileLayoutEntry[]> = {};
  tiles.forEach(t => {
    const r = find(t.id);
    (buckets[r] ||= []).push(t);
  });
  const groups: TileGroup[] = [];
  const tileToGroup: Record<string, string> = {};
  Object.entries(buckets).forEach(([, ts]) => {
    if (ts.length < 2) return; // single tile → no group bar
    const minY = Math.min(...ts.map(t => t.y));
    // top row = tiles whose y is close to minY (within 10px) so minor drift doesn't split rows
    const topRow = ts.filter(t => Math.abs(t.y - minY) < 10).sort((a, b) => a.x - b.x);
    // group bar spans entire group width (not just top row) so it visually connects to all tiles
    const topX = Math.min(...ts.map(t => t.x));
    const topW = Math.max(...ts.map(t => t.x + t.w)) - topX;
    const bbox = {
      x: Math.min(...ts.map(t => t.x)),
      y: Math.min(...ts.map(t => t.y)),
      x2: Math.max(...ts.map(t => t.x + t.w)),
      y2: Math.max(...ts.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))),
    };
    groups.push({ tileIds: ts.map(t => t.id), topRow: topRow.map(t => t.id),
                  topX, topW, topY: minY, bbox });
    ts.forEach(t => tileToGroup[t.id] = groups[groups.length - 1].tileIds[0]);
  });
  return { groups, tileToGroup };
}

// --- Find nearest snap target during drag ----
// Per-axis, adjacency-only detection. No Math.hypot, no cross-axis coupling.
// X-axis candidates gated by Y-overlap; Y-axis candidates gated by X-overlap.
// Alignment pairings (same-row Y snap) deferred to v101.0.4 per design §7.1.
export function findSnap(moving: Rect, targets: Rect[]): SnapResult {
  let bestX: { coord: number; gap: number } | null = null;
  let bestY: { coord: number; gap: number } | null = null;

  const overlaps = (a0: number, a1: number, b0: number, b1: number) =>
    a0 < b1 + SNAP_TOL && b0 < a1 + SNAP_TOL;

  for (const t of targets) {
    const mLeft = moving.x, mRight = moving.x + moving.w;
    const mTop = moving.y, mBot = moving.y + moving.h;
    const tLeft = t.x, tRight = t.x + t.w;
    const tTop = t.y, tBot = t.y + t.h;

    // X candidates — require vertical overlap
    if (overlaps(mTop, mBot, tTop, tBot)) {
      bestX = snapCandidate(bestX, mRight, tLeft, tLeft - moving.w);
      bestX = snapCandidate(bestX, mLeft, tRight, tRight);
    }
    // Y candidates — require horizontal overlap
    if (overlaps(mLeft, mRight, tLeft, tRight)) {
      bestY = snapCandidate(bestY, mBot, tTop, tTop - moving.h);
      bestY = snapCandidate(bestY, mTop, tBot, tBot);
    }
  }

  const out: { x?: number; y?: number } = {};
  if (bestX !== null) out.x = bestX.coord;
  if (bestY !== null) out.y = bestY.coord;
  return (out.x !== undefined || out.y !== undefined) ? out : null;
}

function snapCandidate(
  best: { coord: number; gap: number } | null,
  edge: number,
  targetEdge: number,
  correctedOrigin: number,
): { coord: number; gap: number } | null {
  const gap = Math.abs(edge - targetEdge);
  if (gap < SNAP_TOL && (best === null || gap < best.gap)) {
    return { coord: correctedOrigin, gap };
  }
  return best;
}

// --- Flip-on-overflow mechanic ----
// Tiles render flipped (header at bottom, content above) when within 80px threshold of status bar
export function shouldFlipTile(
  tile: { y: number; h: number },
  viewportHeight: number
): boolean {
  const statusBarHeight = 40;
  const flipThreshold = viewportHeight - statusBarHeight - 80; // 80px threshold window before status bar
  const inFlipZone = tile.y + tile.h > flipThreshold;
  const hasRoomAbove = tile.y >= tile.h;
  return inFlipZone && hasRoomAbove;
}
