/**
 * v86c Tile Layer
 * Reference: (NEW)tile-system.jsx lines 474-495
 * Renders floating tiles, group bars, and group outlines
 */

import { useMemo } from "react";
import { useTileContext } from "./TileProvider";
import { FloatingTile } from "./FloatingTile";
import { deriveGroups, findSnap, COLLAPSED_H, reconcileMembershipOnDrop } from "./tileUtils";
import type { Rect } from "./tileUtils";
import type { TileGroup } from "./tile.types";

export function TileLayer() {
  const ctx = useTileContext();
  const tilesArray = Array.from(ctx.tiles.values());
  const { groups, tileToGroup } = useMemo(
    () => deriveGroups(tilesArray, { excludeFromGroups: ctx.draggingTileId ?? undefined }),
    [tilesArray, ctx.draggingTileId],
  );

  return (
    <div className="tile-layer" data-testid="tile-layer">
      {/* Render groups */}
      {groups.map(group => (
        <div key={group.tileIds.join("-")}>
          <GroupBar group={group} />
          <GroupOutline group={group} />
        </div>
      ))}

      {/* Render tiles (skip hidden tiles) */}
      {tilesArray.filter(t => t.visible !== false).map(tile => {
        const group = tileToGroup[tile.id] ? groups.find(g => g.tileIds.includes(tileToGroup[tile.id])) : null;
        return (
          <FloatingTile key={tile.id} tile={tile} group={group || null} />
        );
      })}

      <SnapGuideOverlay />
    </div>
  );
}

// --- Group bar: horizontal bar above top row of a group ----
// Reference: (NEW)tile-system.jsx lines 377-395
function GroupBar({ group }: { group: TileGroup }) {
  const ctx = useTileContext();
  const tilesArray = Array.from(ctx.tiles.values());
  const groupTiles = tilesArray.filter(t => group.tileIds.includes(t.id));

  // Compute whether all group tiles are currently collapsed
  const allCollapsed = groupTiles.every(t => t.collapsed);

  const onClose = () => ctx.closeGroup(group.tileIds);

  const onCollapseAll = () => {
    const next = !allCollapsed;
    groupTiles.forEach(t => {
      ctx.updateTile(t.id, { collapsed: next });
    });
  };

  // Only render if group has 2+ tiles
  if (group.tileIds.length < 2) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't initiate drag if click is on a button
    if ((e.target as HTMLElement).closest(".group-btn")) return;

    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startPositions = groupTiles.map(t => ({ id: t.id, x: t.x, y: t.y }));

    const onMove = (ev: MouseEvent) => {
      // Pixel-precise movement (no grid quantization during drag)
      const dx = ev.clientX - startX, dy = ev.clientY - startY;

      startPositions.forEach(pos => {
        ctx.updateTile(pos.id, {
          x: pos.x + dx,
          y: pos.y + dy,
        });
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointercancel", onPointerCancel);

      // Snap cluster bbox to nearest adjacent edge on release.
      // Uses live positions (getLiveTiles) — not the mousedown snapshot (stale-closure trap).
      const liveAll = ctx.getLiveTiles();
      const liveMembers = group.tileIds
        .map(id => liveAll.find(t => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

      if (liveMembers.length > 0) {
        const toRect = (t: typeof liveMembers[0]): Rect =>
          ({ x: t.x, y: t.y, w: t.w, h: t.collapsed ? COLLAPSED_H : t.h });
        const targets = liveAll
          .filter(t => !group.tileIds.includes(t.id))
          .map(toRect);
        const bx = Math.min(...liveMembers.map(t => t.x));
        const by = Math.min(...liveMembers.map(t => t.y));
        const bw = Math.max(...liveMembers.map(t => t.x + t.w)) - bx;
        const bh = Math.max(...liveMembers.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))) - by;
        const res = findSnap({ x: bx, y: by, w: bw, h: bh }, targets);
        if (res) {
          const dx = (res.x ?? bx) - bx;
          const dy = (res.y ?? by) - by;
          if (dx !== 0 || dy !== 0) {
            liveMembers.forEach(m => ctx.updateTile(m.id, { x: m.x + dx, y: m.y + dy }));
          }
        }
        // Reconcile group membership after final positions (cluster may have merged with another).
        reconcileMembershipOnDrop(group.tileIds, ctx.getLiveTiles(), ctx.updateTile);
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

  // Get max z of group + 1 so bar sits above tiles visually
  const groupZ = Math.max(...groupTiles.map(t => t.z)) + 1;

  const HEADER_H = 28;

  return (
    <div
      className="group-bar"
      style={{
        left: group.topX,
        top: group.topY - HEADER_H + 2,
        width: group.topW,
        zIndex: groupZ,
      }}
      onMouseDown={handleMouseDown}
      data-testid="group-bar"
    >
      <span className="group-grip">⠿</span>
      <span className="group-title">GROUP · {groupTiles.length} tiles</span>
      <span className="group-spacer" />
      <button
        className="group-btn"
        onClick={onCollapseAll}
        title={allCollapsed ? "Expand all" : "Collapse all"}
        data-testid="group-collapse-all"
      >
        {allCollapsed ? "▾▾" : "──"}
      </button>
      <button
        className="group-btn"
        onClick={onClose}
        title="Close group"
        data-testid="group-close"
      >
        ×
      </button>
    </div>
  );
}

// --- Group outline: per-tile outlines that merge at seams ----
// Reference: (NEW)tile-system.jsx lines 448-472
function GroupOutline({ group }: { group: TileGroup }) {
  const ctx = useTileContext();
  const tilesArray = Array.from(ctx.tiles.values());
  const groupTiles = tilesArray.filter(t => group.tileIds.includes(t.id));
  const COLLAPSED_H = 30;

  return (
    <>
      {groupTiles.map(tile => (
        <div
          key={`outline-${tile.id}`}
          className="group-outline-tile"
          style={{
            left: tile.x - 2,
            top: tile.y - 2,
            width: tile.w + 4,
            height: (tile.collapsed ? COLLAPSED_H : tile.h) + 4,
            border: "1px solid var(--lw-flare-gold, #f59e0b)",
            borderRadius: "10px",
            opacity: 0.55,
            pointerEvents: "none",
            zIndex: tile.z - 1,
            position: "absolute",
          }}
        />
      ))}
    </>
  );
}

// --- Snap guide overlay: shows preview rectangle and edge lines during drag ----
function SnapGuideOverlay() {
  const ctx = useTileContext();
  const guide = ctx.snapGuide;
  if (!guide) return null;

  return (
    <div className="snap-guide-overlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {guide.edgeX !== null && (
        <div
          className="snap-guide-line snap-guide-line-v"
          style={{
            position: 'absolute',
            left: guide.edgeX,
            top: 0,
            bottom: 0,
            width: 1,
          }}
        />
      )}
      {guide.edgeY !== null && (
        <div
          className="snap-guide-line snap-guide-line-h"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: guide.edgeY,
            height: 1,
          }}
        />
      )}
    </div>
  );
}
