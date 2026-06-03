/**
 * v86c Tile Utilities
 * Reference: (NEW)tile-system.jsx lines 134-204
 */

import type { TileLayoutEntry, TileGroup, TileAnchor } from "./tile.types";

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
export const MARGIN = 8;   // px — minimum gap between tile edge and viewport edge
export const GAP = 12;     // px — vertical gap between stacked docked tiles

// ─── v103.1.0: Pure viewport-relative resolution (docked/floating model) ───

export interface Viewport { width: number; height: number; }

/**
 * Clamps a floating tile's position into viewport bounds.
 * Pure — viewport passed in, NOT read from window (testable, no side effects).
 *
 * x ∈ [MARGIN, viewport.width  - w - MARGIN]
 * y ∈ [TOPBAR_HEIGHT, max(TOPBAR_HEIGHT, viewport.height - STATUS_BAR_HEIGHT - h - GAP)]
 */
export function clampToViewport(
  x: number,
  y: number,
  w: number,
  h: number,
  viewport: Viewport,
): { x: number; y: number } {
  const maxX = Math.max(MARGIN, viewport.width  - w - MARGIN);
  const maxY = Math.max(TOPBAR_HEIGHT, viewport.height - STATUS_BAR_HEIGHT - h - GAP);
  return {
    x: Math.max(MARGIN, Math.min(x, maxX)),
    y: Math.max(TOPBAR_HEIGHT, Math.min(y, maxY)),
  };
}

/**
 * Resolves a docked tile's position from its anchor + slot + viewport.
 *
 * Uses cumulative stacking (flush) — tiles on the same edge with lower slots are
 * measured by their actual height, so variable-height tiles stack without gaps beyond GAP.
 *
 * edgeTiles: all OTHER docked tiles on the same edge, sorted by slot ascending.
 *            Only tiles with slot < this tile's slot contribute to the y offset.
 *
 * Returns { x, y, h, overflowed } where:
 *   h         — possibly-capped tile height (capped to fairShare if edge overflows)
 *   overflowed — true when the stack exceeds availableH and h would fall below the min floor
 */
export function resolveDockedPosition(
  anchor: TileAnchor,
  w: number,
  requestedH: number,
  edgeTiles: Array<{ slot?: number; h: number; collapsed: boolean }>,
  viewport: Viewport,
): { x: number; y: number; h: number; overflowed: boolean } {
  const thisSlot = anchor.slot ?? 0;
  const isRight = anchor.edge === "right";
  const x = isRight ? viewport.width - w - MARGIN : MARGIN;

  // Cumulative y: sum heights of all lower-slot tiles + their gaps
  const tilesAbove = edgeTiles
    .filter((t) => (t.slot ?? 0) < thisSlot)
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0));

  let y = TOPBAR_HEIGHT;
  for (const t of tilesAbove) {
    const tileH = t.collapsed ? COLLAPSED_H : t.h;
    y += tileH + GAP;
  }

  // Height-cap: available vertical space on this edge
  const availableH = viewport.height - STATUS_BAR_HEIGHT - TOPBAR_HEIGHT;
  const MIN_TILE_FLOOR = COLLAPSED_H + 60;

  // Count total tiles on this edge (including this one) to compute fair share
  const totalEdgeTiles = edgeTiles.length + 1;
  const totalGaps = (totalEdgeTiles - 1) * GAP;
  const fairShare = Math.floor((availableH - totalGaps) / totalEdgeTiles);

  let h = requestedH;
  let overflowed = false;
  if (fairShare < MIN_TILE_FLOOR) {
    overflowed = true;
    h = requestedH; // caller scrolls; don't cap below floor
  } else if (requestedH > fairShare) {
    h = fairShare;
  }

  const clamped = clampToViewport(x, y, w, h, viewport);
  return { x: clamped.x, y: clamped.y, h, overflowed };
}

/**
 * Single entry-point: resolves the live render position for any tile.
 *
 * docked   → resolveDockedPosition (viewport-relative, cannot strand)
 * floating → clampToViewport (clamped to bounds, persisted x/y corrected)
 *
 * NOT wired to render this pass — defined + tested here; wired in v103.1.1.
 */
export function resolveLivePosition(
  tile: TileLayoutEntry,
  edgeTiles: Array<{ slot?: number; h: number; collapsed: boolean }>,
  viewport: Viewport,
): { x: number; y: number; h: number } {
  if (tile.mode === "docked" && tile.anchor) {
    const result = resolveDockedPosition(tile.anchor, tile.w, tile.h, edgeTiles, viewport);
    return { x: result.x, y: result.y, h: result.h };
  }
  // "floating" or undefined (back-compat: treat as floating)
  const clamped = clampToViewport(tile.x, tile.y, tile.w, tile.h, viewport);
  return { x: clamped.x, y: clamped.y, h: tile.h };
}

export type Rect = { x: number; y: number; w: number; h: number };
export type SnapResult = { x?: number; y?: number } | null;

// --- Group geometry: derive TileGroup shapes from explicit groupId membership ----
// BIG RULE: topRow width is computed from CONTIGUOUS top-row tiles, NOT bbox
// Membership (groupId on TileLayoutEntry) is the source of truth;
// this function only derives the geometry the UI needs.
export function deriveGroups(
  tiles: TileLayoutEntry[],
  opts?: { excludeFromGroups?: string },
): { groups: TileGroup[]; tileToGroup: Record<string, string> } {
  const excludeId = opts?.excludeFromGroups;

  // Bucket tiles by groupId, optionally excluding a dragging tile that has moved out of range.
  const buckets: Record<string, TileLayoutEntry[]> = {};
  for (const t of tiles) {
    if (!t.groupId) continue;
    // If this tile is being dragged and is the candidate to exclude, check if it's out of range.
    if (excludeId && t.id === excludeId && t.groupId) {
      const mates = tiles.filter(m => m.id !== excludeId && m.groupId === t.groupId);
      const stillNear = mates.some(m => minEdgeGap(t, m) <= BREAK_TOL);
      if (!stillNear) continue; // exclude from group rendering — visual preview only
    }
    (buckets[t.groupId] ||= []).push(t);
  }

  const groups: TileGroup[] = [];
  const tileToGroup: Record<string, string> = {};

  for (const [, ts] of Object.entries(buckets)) {
    if (ts.length < 2) continue; // lone tile with stale groupId — skip (treated as ungrouped)
    const minY = Math.min(...ts.map(t => t.y));
    const topRow = ts.filter(t => Math.abs(t.y - minY) < 10).sort((a, b) => a.x - b.x);
    const topX = Math.min(...ts.map(t => t.x));
    const topW = Math.max(...ts.map(t => t.x + t.w)) - topX;
    const bbox = {
      x: Math.min(...ts.map(t => t.x)),
      y: Math.min(...ts.map(t => t.y)),
      x2: Math.max(...ts.map(t => t.x + t.w)),
      y2: Math.max(...ts.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))),
    };
    groups.push({ tileIds: ts.map(t => t.id), topRow: topRow.map(t => t.id), topX, topW, topY: minY, bbox });
    ts.forEach(t => tileToGroup[t.id] = groups[groups.length - 1].tileIds[0]);
  }

  return { groups, tileToGroup };
}

// --- Adjacency helpers for FORM/BREAK ---

function tileH(t: TileLayoutEntry): number {
  return t.collapsed ? COLLAPSED_H : t.h;
}

/** True if tiles A and B are flush-adjacent (edge gap < 2px, perpendicular overlap). */
function isFlushAdjacent(a: TileLayoutEntry, b: TileLayoutEntry): boolean {
  const ah = tileH(a), bh = tileH(b);
  const hTouch = Math.abs((a.x + a.w) - b.x) < 2 || Math.abs((b.x + b.w) - a.x) < 2;
  const vTouch = Math.abs((a.y + ah) - b.y) < 2 || Math.abs((b.y + bh) - a.y) < 2;
  const yOverlap = a.y < b.y + bh && b.y < a.y + ah;
  const xOverlap = a.x < b.x + b.w && b.x < a.x + a.w;
  return (hTouch && yOverlap) || (vTouch && xOverlap);
}

/** Minimum edge-to-edge gap between two tiles (0 = touching/overlapping).
 *  Uses rectilinear hypot: per-axis separation (0 when ranges overlap), then hypot.
 *  Fixes the overlap-one-axis case where min(largeGap, 0) incorrectly returned 0. */
function minEdgeGap(a: TileLayoutEntry, b: TileLayoutEntry): number {
  const ah = tileH(a), bh = tileH(b);
  const xSep = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const ySep = Math.max(0, b.y - (a.y + ah), a.y - (b.y + bh));
  return Math.hypot(xSep, ySep);
}

/**
 * Called after snap commit. Reconciles explicit group membership:
 * - BREAK: moved tiles that are no longer within BREAK_TOL of any group mate leave the group.
 *   If a group shrinks to 1 remaining member, that member is dissolved too (no 1-tile groups).
 * - FORM: moved tiles that are now flush-adjacent to non-members join/create a group.
 *
 * `movedIds` = the tiles whose positions just changed.
 * `allTiles` = live tile list AFTER snap commit (use getLiveTiles()).
 * `updateFn` = ctx.updateTile — persists groupId changes.
 */
export function reconcileMembershipOnDrop(
  movedIds: string[],
  allTiles: TileLayoutEntry[],
  updateFn: (id: string, updates: Partial<TileLayoutEntry>) => void,
): void {
  // Local mirror so we can track in-flight mutations without waiting for store propagation.
  const local = new Map<string, TileLayoutEntry>(allTiles.map(t => [t.id, t]));
  const get = (id: string) => local.get(id);
  const set = (id: string, patch: Partial<TileLayoutEntry>) => {
    const t = local.get(id);
    if (t) local.set(id, { ...t, ...patch });
  };

  // === BREAK phase ===
  for (const movedId of movedIds) {
    const moved = get(movedId);
    if (!moved?.groupId) continue;
    const gid = moved.groupId;

    const mates = allTiles.filter(t => t.id !== movedId && t.groupId === gid);
    if (mates.length === 0) {
      updateFn(movedId, { groupId: undefined });
      set(movedId, { groupId: undefined });
      continue;
    }

    const stillNear = mates.some(m => minEdgeGap(moved, get(m.id) ?? m) <= BREAK_TOL);
    if (!stillNear) {
      updateFn(movedId, { groupId: undefined });
      set(movedId, { groupId: undefined });
      // Dissolve if only 1 member remains
      const remaining = mates.filter(m => (get(m.id) ?? m).groupId === gid);
      if (remaining.length === 1) {
        updateFn(remaining[0].id, { groupId: undefined });
        set(remaining[0].id, { groupId: undefined });
      }
    }
  }

  // === FORM phase ===
  for (const movedId of movedIds) {
    const moved = get(movedId);
    if (!moved) continue;

    // Find all non-member tiles that are now flush-adjacent
    const adjacent = allTiles.filter(t => {
      if (t.id === movedId || movedIds.includes(t.id)) return false;
      const tFresh = get(t.id) ?? t;
      if (moved.groupId && tFresh.groupId === moved.groupId) return false; // already same group
      return isFlushAdjacent(moved, tFresh);
    });

    if (adjacent.length === 0) continue;

    // Pick the groupId to use: prefer existing groups (largest wins), else mint new
    let newGroupId: string | undefined = moved.groupId;
    for (const adj of adjacent) {
      const adjFresh = get(adj.id) ?? adj;
      if (!adjFresh.groupId) continue;
      if (!newGroupId) {
        newGroupId = adjFresh.groupId;
      } else if (adjFresh.groupId !== newGroupId) {
        const curSize = allTiles.filter(t => (get(t.id) ?? t).groupId === newGroupId).length;
        const adjSize = allTiles.filter(t => (get(t.id) ?? t).groupId === adjFresh.groupId).length;
        if (adjSize > curSize) newGroupId = adjFresh.groupId;
      }
    }
    if (!newGroupId) {
      newGroupId = `grp_${crypto.randomUUID().slice(0, 8)}`;
    }

    // Apply to moved tile
    if (moved.groupId !== newGroupId) {
      updateFn(movedId, { groupId: newGroupId });
      set(movedId, { groupId: newGroupId });
    }

    // Apply to all adjacent non-members (and merge any old groups they were in)
    for (const adj of adjacent) {
      const adjFresh = get(adj.id) ?? adj;
      if (adjFresh.groupId === newGroupId) continue;
      if (adjFresh.groupId) {
        // Merge entire old group into newGroupId
        const oldGid = adjFresh.groupId;
        for (const t of allTiles) {
          if ((get(t.id) ?? t).groupId === oldGid) {
            updateFn(t.id, { groupId: newGroupId });
            set(t.id, { groupId: newGroupId });
          }
        }
      } else {
        updateFn(adj.id, { groupId: newGroupId });
        set(adj.id, { groupId: newGroupId });
      }
    }
  }
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


// Dev / Playwright probe — exposes resolution functions for browser-eval tests (v103.1.0)
if (typeof window !== "undefined" && (import.meta.env.DEV || (window as any).PLAYWRIGHT)) {
  (window as any).__lwTileDocking = { clampToViewport, resolveDockedPosition, resolveLivePosition };
}
