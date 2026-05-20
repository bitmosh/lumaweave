/**
 * v86c Tile Utilities
 * Reference: (NEW)tile-system.jsx lines 134-204
 */

import type { TileLayoutEntry, TileGroup } from "./tile.types";

const SNAP_TOLERANCE = 22;
const COLLAPSED_H = 30;
const TILE_GRID = 16;

// --- Group computation: tiles snapped edge-to-edge form a group ----
// BIG RULE: topRow width is computed from CONTIGUOUS top-row tiles, NOT bbox
// Reference: (NEW)tile-system.jsx lines 134-184
export function computeGroups(tiles: TileLayoutEntry[]): { groups: TileGroup[]; tileToGroup: Record<string, string> } {
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
    // snap top bar y to grid for stable, predictable placement
    const topY = Math.round(minY / TILE_GRID) * TILE_GRID;
    const bbox = {
      x: Math.min(...ts.map(t => t.x)),
      y: Math.min(...ts.map(t => t.y)),
      x2: Math.max(...ts.map(t => t.x + t.w)),
      y2: Math.max(...ts.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))),
    };
    groups.push({ tileIds: ts.map(t => t.id), topRow: topRow.map(t => t.id),
                  topX, topW, topY, bbox });
    ts.forEach(t => tileToGroup[t.id] = groups[groups.length - 1].tileIds[0]);
  });
  return { groups, tileToGroup };
}

// --- Find nearest snap target during drag ----
// Reference: (NEW)tile-system.jsx lines 186-204
export function findSnap(movingTile: TileLayoutEntry, others: TileLayoutEntry[]): { x: number; y: number } | null {
  const snapCandidates: { x: number; y: number; d: number }[] = [];
  const r = { x: movingTile.x, y: movingTile.y, w: movingTile.w, h: movingTile.collapsed ? COLLAPSED_H : movingTile.h };
  others.forEach(o => {
    const or = { x: o.x, y: o.y, w: o.w, h: o.collapsed ? COLLAPSED_H : o.h };
    // check 4 sides, snap edge-to-edge if close
    const tryL = { x: or.x - r.w, y: or.y };
    const tryR = { x: or.x + or.w, y: or.y };
    const tryT = { x: or.x, y: or.y - r.h };
    const tryB = { x: or.x, y: or.y + or.h };
    [tryL, tryR, tryT, tryB].forEach(p => {
      const d = Math.hypot(p.x - r.x, p.y - r.y);
      if (d < SNAP_TOLERANCE) snapCandidates.push({ ...p, d });
    });

    // Row-alignment: when tile is horizontally nearby and y-aligned, snap y to match
    // This creates magnetic horizontal binding for tiles in the same row
    const yDiff = Math.abs(r.y - or.y);
    const hNear = r.x < or.x + or.w + 120 && or.x < r.x + r.w + 120;
    if (yDiff > 0 && yDiff < SNAP_TOLERANCE && hNear) {
      snapCandidates.push({ x: r.x, y: or.y, d: yDiff * 0.7 }); // weight y-align aggressively
    }
  });
  if (snapCandidates.length === 0) return null;
  const best = snapCandidates.reduce((a, b) => a.d < b.d ? a : b);
  return { x: best.x, y: best.y };
}
