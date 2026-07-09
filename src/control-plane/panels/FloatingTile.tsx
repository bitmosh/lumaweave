// SPDX-License-Identifier: Apache-2.0
/**
 * v86c Floating Tile
 * Reference: (NEW)tile-system.jsx lines 206-375
 * Uses window.addEventListener for mousemove/mouseup instead of setPointerCapture
 */

import { GripVertical, RotateCcw } from "lucide-react";
import type { TileLayoutEntry, TileGroup } from "./tile.types";
import { useTileContext } from "./TileProvider";
import { tileSectionRegistry } from "./tileSectionRegistry";
import { shouldFlipTile, isOffAnchor, findSnap, COLLAPSED_H, reconcileMembershipOnDrop, clampToViewport } from "./tileUtils";
import type { Rect } from "./tileUtils";

const TILE_GRID = 16;
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
  const tileLabel = sectionEntry?.label ?? tile.sectionKey;

  const anchor = tile.anchor ?? sectionEntry?.defaultAnchor;
  const offAnchor = anchor ? isOffAnchor(tile, anchor) : false;

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
    ctx.setDraggingTileId(tile.id);

    // v103.1.2: docked tile being dragged → flip to floating, seeding resolved x/y.
    // tile.x/y IS the resolved live position (from TileLayer's resolvedTilesArray).
    // Writing x/y alongside mode prevents the next render from clamping stale stored coords —
    // that was Bug 3: mode="floating" + stale x/y → tile jumped back to edge on next render.
    if (tile.mode === "docked") {
      ctx.updateTile(tile.id, { mode: "floating", x: tile.x, y: tile.y });
    }

    const startX = e.clientX, startY = e.clientY;
    const startTilePos = { x: tile.x, y: tile.y };
    let detached = ungroup;
    // Model B: body-drag moves only this tile, even if grouped.
    // Whole-group movement is the GroupBar's job. ⤴ (ungroup: true) still fires
    // the pull-away nudge via `detached` but no longer changes groupIds.
    const groupIds = [tile.id];
    const groupTiles = Array.from(ctx.tiles.values()).filter(t => groupIds.includes(t.id));
    const offsets = groupTiles.map(t => ({ id: t.id, dx: t.x - startTilePos.x, dy: t.y - startTilePos.y }));

    // Change-gate for snap guide: only call setSnapGuide when armed state or edge coord changes.
    let lastGuideKey = "";

    let moveCount = 0;
    const onMove = (ev: MouseEvent) => {
      moveCount++;
      // Pixel-precise position from cursor (no grid quantization)
      let nx = startTilePos.x + (ev.clientX - startX);
      let ny = startTilePos.y + (ev.clientY - startY);

      // Clamp to viewport (hard stop at status bar top, 40px from bottom)
      const tileH = tile.collapsed ? COLLAPSED_H : tile.h;
      nx = Math.max(8, Math.min(window.innerWidth - tile.w - 8, nx));
      ny = Math.max(60, Math.min(window.innerHeight - tileH - 40, ny));

      if (detached) {
        // first move after ungroup: pull away so we don't immediately re-snap to neighbors
        nx += 28;
        ny += 8;
        detached = false;
      }

      // Update positions (group movement preserves offsets)
      const dx = nx - startTilePos.x, dy = ny - startTilePos.y;
      offsets.forEach(o => {
        ctx.updateTile(o.id, {
          x: startTilePos.x + o.dx + dx,
          y: startTilePos.y + o.dy + dy,
        });
      });

      // Armed-only snap guide — reads live positions, fires setSnapGuide only on change.
      const guideTargets = ctx.getLiveTiles()
        .filter(t => !groupIds.includes(t.id))
        .map(t => ({ x: t.x, y: t.y, w: t.w, h: t.collapsed ? COLLAPSED_H : t.h } as Rect));

      let edgeX: number | null = null;
      let edgeY: number | null = null;
      let armed = false;

      if (groupTiles.length === 1) {
        const liveTile = ctx.getLiveTile(tile.id);
        if (liveTile) {
          const movingRect: Rect = { x: liveTile.x, y: liveTile.y, w: liveTile.w, h: liveTile.collapsed ? COLLAPSED_H : liveTile.h };
          const res = findSnap(movingRect, guideTargets);
          if (res) {
            armed = true;
            edgeX = res.x !== undefined ? (res.x > liveTile.x ? res.x + liveTile.w : res.x) : null;
            edgeY = res.y !== undefined ? res.y : null;
          }
        }
      } else {
        const liveMembers = groupIds.map(id => ctx.getLiveTile(id)).filter((t): t is NonNullable<typeof t> => t !== null && t !== undefined);
        if (liveMembers.length > 0) {
          const bx = Math.min(...liveMembers.map(t => t.x));
          const by = Math.min(...liveMembers.map(t => t.y));
          const bw = Math.max(...liveMembers.map(t => t.x + t.w)) - bx;
          const bh = Math.max(...liveMembers.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))) - by;
          const res = findSnap({ x: bx, y: by, w: bw, h: bh }, guideTargets);
          if (res) {
            armed = true;
            edgeX = res.x !== undefined ? (res.x > bx ? res.x + bw : res.x) : null;
            edgeY = res.y !== undefined ? res.y : null;
          }
        }
      }

      const guideKey = armed ? `${edgeX},${edgeY}` : "";
      if (guideKey !== lastGuideKey) {
        lastGuideKey = guideKey;
        ctx.setSnapGuide(armed ? { edgeX, edgeY } : null);
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointercancel", onPointerCancel);
      ctx.setSnapGuide(null);
      ctx.setDraggingTileId(null);

      // Snap on release — per-axis edge detection (v101.0.2a)
      // Uses getLiveTile/getLiveTiles (live store read) not ctx.tiles (stale render snapshot).
      const toRect = (t: TileLayoutEntry | undefined): Rect | null => {
        if (!t) return null;
        return { x: t.x, y: t.y, w: t.w, h: t.collapsed ? COLLAPSED_H : t.h };
      };
      const others = ctx.getLiveTiles().filter(t => !groupIds.includes(t.id));
      const targetRects = others.map(t => toRect(t)).filter((r): r is Rect => r !== null);

      if (groupTiles.length === 1) {
        // Single tile: snap live position to nearest adjacent edge
        const liveTile = ctx.getLiveTile(tile.id);
        const movingRect = toRect(liveTile);
        if (movingRect) {
          const res = findSnap(movingRect, targetRects);
          if (res) {
            ctx.updateTile(tile.id, { x: res.x ?? movingRect.x, y: res.y ?? movingRect.y });
          }
        }
      } else {
        // Group: snap bounding-box to nearest adjacent edge, shift all members rigidly
        const liveMembers = groupIds
          .map(id => ctx.getLiveTile(id))
          .filter((t): t is NonNullable<typeof t> => t !== null && t !== undefined);
        if (liveMembers.length > 0) {
          const bx = Math.min(...liveMembers.map(t => t.x));
          const by = Math.min(...liveMembers.map(t => t.y));
          const bw = Math.max(...liveMembers.map(t => t.x + t.w)) - bx;
          const bh = Math.max(...liveMembers.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))) - by;
          const res = findSnap({ x: bx, y: by, w: bw, h: bh }, targetRects);
          if (res) {
            const dx = (res.x ?? bx) - bx;
            const dy = (res.y ?? by) - by;
            if (dx !== 0 || dy !== 0) {
              liveMembers.forEach(m => ctx.updateTile(m.id, { x: m.x + dx, y: m.y + dy }));
            }
          }
        }
      }

      // Reconcile explicit group membership after positions are final (FORM/BREAK).
      reconcileMembershipOnDrop(groupIds, ctx.getLiveTiles(), ctx.updateTile);
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

      // v103.1.3: reflow group neighbors on resize release.
      // The RESIZED tile is the anchor (stays put). Neighbors slide flush to its new edges.
      // This is inverted from drag release (where the MOVING tile relocates to targets).
      if (tile.groupId) {
        const allLive = ctx.getLiveTiles();
        const resizedLive = allLive.find(t => t.id === tile.id);
        if (resizedLive) {
          const resizedRect: Rect = {
            x: resizedLive.x,
            y: resizedLive.y,
            w: resizedLive.w,
            h: resizedLive.collapsed ? COLLAPSED_H : resizedLive.h,
          };
          const viewport = { width: window.innerWidth, height: window.innerHeight };
          const neighbors = allLive.filter(t => t.groupId === tile.groupId && t.id !== tile.id);
          for (const neighbor of neighbors) {
            const neighborRect: Rect = {
              x: neighbor.x,
              y: neighbor.y,
              w: neighbor.w,
              h: neighbor.collapsed ? COLLAPSED_H : neighbor.h,
            };
            const snap = findSnap(neighborRect, [resizedRect]);
            if (snap) {
              const nx = snap.x ?? neighbor.x;
              const ny = snap.y ?? neighbor.y;
              // Clamp reflowed neighbor to viewport (resized tile growth mustn't push off-screen)
              const { x: cx, y: cy } = clampToViewport(nx, ny, neighbor.w, neighbor.h, viewport);
              ctx.updateTile(neighbor.id, { x: cx, y: cy });
            }
          }
          // Recompute group membership/bbox after reflow
          const groupIds = allLive
            .filter(t => t.groupId === tile.groupId)
            .map(t => t.id);
          reconcileMembershipOnDrop(groupIds, ctx.getLiveTiles(), ctx.updateTile);
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

  const inGroup = !!group;
  const showHeader = !inGroup;
  const showSlimStrip = inGroup;

  const realH = tile.collapsed ? COLLAPSED_H : tile.h;
  const flipped = shouldFlipTile({ y: tile.y, h: realH }, window.innerHeight);

  // Handle collapse/expand while preserving header screen position
  const handleToggleCollapsed = () => {
    const currentH = tile.collapsed ? COLLAPSED_H : tile.h;
    const currentlyFlipped = shouldFlipTile(
      { y: tile.y, h: currentH },
      window.innerHeight
    );
    // Where the user sees the header on screen
    const currentHeaderY = currentlyFlipped
      ? tile.y + currentH - COLLAPSED_H
      : tile.y;

    if (tile.collapsed) {
      // Expanding - restore previous height or use current h
      const newH = tile.prevH ?? tile.h;
      const willBeFlipped = shouldFlipTile(
        { y: tile.y, h: newH },
        window.innerHeight
      );
      // Position so header stays at currentHeaderY
      let newY = willBeFlipped
        ? currentHeaderY - newH + COLLAPSED_H
        : currentHeaderY;
      // Clamp to viewport (hard stop at status bar top, 40px from bottom)
      newY = Math.min(newY, window.innerHeight - newH - 40);
      ctx.updateTile(tile.id, {
        collapsed: false,
        h: newH,
        y: newY,
        prevH: undefined,
      });
    } else {
      // Collapsing - save current height before collapsing
      const newY = currentHeaderY;
      ctx.updateTile(tile.id, {
        collapsed: true,
        h: COLLAPSED_H,
        y: newY,
        prevH: tile.h,
      });
    }
  };

  return (
    <div
      className={`tile ${tile.collapsed ? "collapsed" : ""} ${inGroup ? "ingroup" : ""}`}
      data-flipped={flipped}
      data-tile-id={tile.id}
      style={{ left: tile.x, top: tile.y, width: tile.w, height: realH, zIndex: tile.z }}
      onMouseDown={() => ctx.bringToFront(tile.id)}
    >
      {flipped ? (
        <>
          {!tile.collapsed && (
            <div className="tile-body" data-testid={`tile-body-${tile.sectionKey}`}>
              {sectionContent}
            </div>
          )}
          {showHeader && (
            <div className="tile-head" onMouseDown={onHeaderDown}>
              <span className="tile-title">{tileLabel}</span>
              <span className="tile-head-divider" aria-hidden="true"/>
              <span className="tile-grip" title="Drag" onMouseDown={onHeaderDown}>
                <GripVertical size={14} />
              </span>
              <span className="tile-spacer"/>
              {offAnchor && (
                <button className="tile-btn" title="Return to dock" onClick={() => ctx.returnToAnchor(tile.id)}>
                  <RotateCcw size={12} />
                </button>
              )}
              <button className="tile-btn" title={tile.collapsed ? "Expand" : "Collapse"}
                      onClick={handleToggleCollapsed}>
                {tile.collapsed ? "▾" : "─"}
              </button>
              <button className="tile-btn" title="Hide" onClick={() => ctx.setTileVisibility(tile.id, false)}>×</button>
            </div>
          )}
          {showSlimStrip && (
            <div className="tile-slim">
              <span className="tile-grip" title="Drag to ungroup" onMouseDown={onUngroupDown}>
                <GripVertical size={14} />
              </span>
              <span className="tile-slim-title">{tileLabel}</span>
              <span className="tile-spacer"/>
              <button className="tile-btn slim" title={tile.collapsed ? "Expand" : "Collapse"}
                      onClick={handleToggleCollapsed}>
                {tile.collapsed ? "▾" : "─"}
              </button>
              <button className="tile-btn slim" title="Hide" onClick={() => ctx.setTileVisibility(tile.id, false)}>×</button>
            </div>
          )}
        </>
      ) : (
        <>
          {showHeader && (
            <div className="tile-head" onMouseDown={onHeaderDown}>
              <span className="tile-title">{tileLabel}</span>
              <span className="tile-head-divider" aria-hidden="true"/>
              <span className="tile-grip" title="Drag" onMouseDown={onHeaderDown}>
                <GripVertical size={14} />
              </span>
              <span className="tile-spacer"/>
              {offAnchor && (
                <button className="tile-btn" title="Return to dock" onClick={() => ctx.returnToAnchor(tile.id)}>
                  <RotateCcw size={12} />
                </button>
              )}
              <button className="tile-btn" title={tile.collapsed ? "Expand" : "Collapse"}
                      onClick={handleToggleCollapsed}>
                {tile.collapsed ? "▾" : "─"}
              </button>
              <button className="tile-btn" title="Hide" onClick={() => ctx.setTileVisibility(tile.id, false)}>×</button>
            </div>
          )}
          {showSlimStrip && (
            <div className="tile-slim">
              <span className="tile-grip" title="Drag to ungroup" onMouseDown={onUngroupDown}>
                <GripVertical size={14} />
              </span>
              <span className="tile-slim-title">{tileLabel}</span>
              <span className="tile-spacer"/>
              <button className="tile-btn slim" title={tile.collapsed ? "Expand" : "Collapse"}
                      onClick={handleToggleCollapsed}>
                {tile.collapsed ? "▾" : "─"}
              </button>
              <button className="tile-btn slim" title="Hide" onClick={() => ctx.setTileVisibility(tile.id, false)}>×</button>
            </div>
          )}
          {!tile.collapsed && (
            <div className="tile-body" data-testid={`tile-body-${tile.sectionKey}`}>
              {sectionContent}
            </div>
          )}
        </>
      )}
      {!tile.collapsed && <div className="tile-resize" onMouseDown={onResizeDown}/>}
    </div>
  );
}
