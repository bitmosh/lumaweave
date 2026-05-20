/**
 * v86c Floating Tile
 * Reference: (NEW)tile-system.jsx lines 206-375
 * Uses window.addEventListener for mousemove/mouseup instead of setPointerCapture
 */

import type { TileLayoutEntry, TileGroup } from "./tile.types";
import { useTileContext } from "./TileProvider";
import { tileSectionRegistry } from "./tileSectionRegistry";

const TILE_GRID = 16;
const SNAP_TOLERANCE = 22;
const COLLAPSED_H = 30;
const MIN_W = 200, MIN_H = 110;

const snap = (v: number) => Math.round(v / TILE_GRID) * TILE_GRID;

interface FloatingTileProps {
  tile: TileLayoutEntry;
  group?: TileGroup | null;
}

export function FloatingTile({ tile, group }: FloatingTileProps) {
  const ctx = useTileContext();
  const reg = ctx.tiles.get(tile.id);
  if (!reg) return null;

  const sectionEntry = tileSectionRegistry.getById(tile.sectionKey);

  let sectionContent: React.ReactNode = null;
  try {
    sectionContent = sectionEntry?.content?.();
  } catch (e) {
    // Section content failed to render
  }

  const startTileDrag = (e: React.MouseEvent, { ungroup = false } = {}) => {
    if ((e.target as HTMLElement).closest(".tile-btn")) return;
    e.preventDefault();
    e.stopPropagation();
    ctx.bringToFront(tile.id);
    const startX = e.clientX, startY = e.clientY;
    const startTilePos = { x: tile.x, y: tile.y };
    let detached = ungroup;
    const groupIds = (group && !ungroup) ? group.tileIds : [tile.id];
    const groupTiles = Array.from(ctx.tiles.values()).filter(t => groupIds.includes(t.id));
    const offsets = groupTiles.map(t => ({ id: t.id, dx: t.x - startTilePos.x, dy: t.y - startTilePos.y }));

    let moveCount = 0;
    const onMove = (ev: MouseEvent) => {
      moveCount++;
      // Pixel-precise position from cursor (no grid quantization)
      let nx = startTilePos.x + (ev.clientX - startX);
      let ny = startTilePos.y + (ev.clientY - startY);
      if (moveCount % 10 === 0) console.log("[FloatingTile.drag]", tile.id, "moveCount:", moveCount, "pos:", {nx, ny}, "groupTiles.length:", groupTiles.length);

      // Clamp to viewport
      nx = Math.max(8, Math.min(window.innerWidth - tile.w - 8, nx));
      ny = Math.max(60, Math.min(window.innerHeight - 80, ny));

      if (detached) {
        // first move after ungroup: pull away so we don't immediately re-snap to neighbors
        nx += 28;
        ny += 8;
        detached = false;
      }

      // Snap disabled during drag for smooth movement.
      // Snap will engage on mouseup if close to another tile.
      // This prevents the "jumpy" 22px increments during dragging.

      // Update positions (group movement preserves offsets)
      const dx = nx - startTilePos.x, dy = ny - startTilePos.y;
      offsets.forEach(o => {
        ctx.updateTile(o.id, {
          x: startTilePos.x + o.dx + dx,
          y: startTilePos.y + o.dy + dy,
        });
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointercancel", onPointerCancel);

      // Snap on release if single tile (not in group)
      if (groupTiles.length === 1) {
        const currentTiles = Array.from(ctx.tiles.values());
        const currentTile = currentTiles.find(t => t.id === tile.id);
        if (currentTile) {
          const otherTiles = currentTiles.filter(t => t.id !== tile.id);
          const snapTo = findSnap(currentTile, otherTiles);
          if (snapTo) {
            ctx.updateTile(tile.id, { x: snapTo.x, y: snapTo.y });
          }
        }
      }
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onUp();
    };
    const onPointerCancel = () => {
      onUp();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointercancel", onPointerCancel);
  };
  const onHeaderDown = (e: React.MouseEvent) => startTileDrag(e);
  const onUngroupDown = (e: React.MouseEvent) => startTileDrag(e, { ungroup: true });

  const onResizeDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (tile.collapsed) return;
    const startX = e.clientX, startY = e.clientY;
    const startW = tile.w, startH = tile.h;
    const onMove = (ev: MouseEvent) => {
      const w = Math.max(MIN_W, snap(startW + (ev.clientX - startX)));
      const h = Math.max(MIN_H, snap(startH + (ev.clientY - startY)));
      ctx.updateTile(tile.id, { w, h });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointercancel", onPointerCancel);
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") onUp();
    };
    const onPointerCancel = () => {
      onUp();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointercancel", onPointerCancel);
  };

  const inGroup = !!group;
  // when in a group, hide own header for tiles that are NOT the leftmost top-row tile
  // (that one shares the group bar). Other tiles still get a slim per-tile collapse/close strip.
  const showHeader = !inGroup;
  const showSlimStrip = inGroup;

  const realH = tile.collapsed ? COLLAPSED_H : tile.h;

  return (
    <div
      className={`tile ${tile.collapsed ? "collapsed" : ""} ${inGroup ? "ingroup" : ""}`}
      style={{ left: tile.x, top: tile.y, width: tile.w, height: realH, zIndex: tile.z }}
      onMouseDown={() => ctx.bringToFront(tile.id)}
    >
      {showHeader && (
        <div className="tile-head" onMouseDown={onHeaderDown}>
          <span className="tile-grip">⠿</span>
          <span className="tile-title">{tile.sectionKey}</span>
          <span className="tile-spacer"/>
          <button className="tile-btn" title={tile.collapsed ? "Expand" : "Collapse"}
                  onClick={() => ctx.updateTile(tile.id, { collapsed: !tile.collapsed })}>
            {tile.collapsed ? "▾" : "─"}
          </button>
          <button className="tile-btn" title="Close" onClick={() => ctx.closeTile(tile.id)}>×</button>
        </div>
      )}
      {showSlimStrip && (
        <div className="tile-slim">
          <span className="tile-ungrip" title="Drag to ungroup" onMouseDown={onUngroupDown}>⤴</span>
          <span className="tile-slim-title">{tile.sectionKey}</span>
          <span className="tile-spacer"/>
          <button className="tile-btn slim" title={tile.collapsed ? "Expand" : "Collapse"}
                  onClick={() => ctx.updateTile(tile.id, { collapsed: !tile.collapsed })}>
            {tile.collapsed ? "▾" : "─"}
          </button>
          <button className="tile-btn slim" title="Close" onClick={() => ctx.closeTile(tile.id)}>×</button>
        </div>
      )}
      {!tile.collapsed && (
        <div className="tile-body" data-testid={`tile-body-${tile.sectionKey}`}>
          {sectionContent}
        </div>
      )}
      {!tile.collapsed && <div className="tile-resize" onMouseDown={onResizeDown}/>}
    </div>
  );
}

// --- Find nearest snap target during drag ----
function findSnap(movingTile: TileLayoutEntry, others: TileLayoutEntry[]): { x: number; y: number } | null {
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
  });
  if (snapCandidates.length === 0) return null;
  const best = snapCandidates.reduce((a, b) => a.d < b.d ? a : b);
  return { x: best.x, y: best.y };
}
