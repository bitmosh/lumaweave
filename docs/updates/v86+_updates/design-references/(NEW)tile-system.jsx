/* global React, SP */
const { useState: useStateT, useRef: useRefT, useEffect: useEffectT, useMemo: useMemoT, useCallback: useCallbackT } = React;

const TILE_GRID = 16;       // snap step (px)
const SNAP_TOLERANCE = 22;  // tiles within this distance auto-snap edge-to-edge
const COLLAPSED_H = 30;
const HEADER_H = 28;
const MIN_W = 200, MIN_H = 110;

const snap = (v) => Math.round(v / TILE_GRID) * TILE_GRID;

// --- TileContext: registry of "tilable" sections + tile state machine ----
const TileCtx = React.createContext(null);

function TileProvider({ children, registry }) {
  // registry: { [sectionKey]: { title, content: ()=>JSX, originPanel: "left"|"right" } }
  const [tiles, setTiles] = useStateT([]); // {id, sectionKey, x, y, w, h, collapsed, z}
  const zCounter = useRefT(10);

  // Tile out: convert a section into a floating tile. Returns true if added.
  const tileOut = useCallbackT((sectionKey, atPos) => {
    if (tiles.find(t => t.sectionKey === sectionKey)) return false;
    const id = `tile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
    const x = atPos?.x ?? snap(window.innerWidth / 2 - 160);
    const y = atPos?.y ?? snap(120 + tiles.length * 30);
    setTiles(prev => [...prev, {
      id, sectionKey, x, y, w: 320, h: 220, collapsed: false, z: ++zCounter.current
    }]);
    return true;
  }, [tiles]);

  const closeTile = useCallbackT((id) => setTiles(prev => prev.filter(t => t.id !== id)), []);
  const closeGroup = useCallbackT((groupIds) => setTiles(prev => prev.filter(t => !groupIds.includes(t.id))), []);
  const updateTile = useCallbackT((id, patch) => setTiles(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)), []);
  const bring = useCallbackT((id) => setTiles(prev => prev.map(t => t.id === id ? { ...t, z: ++zCounter.current } : t)), []);

  const isTiledOut = useCallbackT((sectionKey) => !!tiles.find(t => t.sectionKey === sectionKey), [tiles]);

  return (
    <TileCtx.Provider value={{ tiles, registry, tileOut, closeTile, closeGroup, updateTile, bring, isTiledOut }}>
      {children}
    </TileCtx.Provider>
  );
}
const useTiles = () => React.useContext(TileCtx);

// --- TileableSection wrapper for left/right panel sections ----
function TileableSection({ sectionKey, title, children, accent = SP.flareGold, defaultOpen = true }) {
  const ctx = useTiles();
  const [open, setOpen] = useStateT(defaultOpen);
  const ref = useRefT(null);
  const tiledOut = ctx?.isTiledOut(sectionKey);

  const startTearOff = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (tiledOut) return;
    const startX = e.clientX, startY = e.clientY;
    let dragging = false;
    const onMove = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!dragging && Math.hypot(dx, dy) > 8) {
        dragging = true;
        // tear off at cursor pos
        ctx.tileOut(sectionKey, { x: snap(ev.clientX - 60), y: snap(ev.clientY - 14) });
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={`tsec ${tiledOut ? "tiled" : ""}`} ref={ref}>
      <div className="tsec-head">
        <button className="tsec-toggle" onClick={() => setOpen(o => !o)}
                style={{ color: accent }} disabled={tiledOut}>
          <span className="tsec-caret">{open ? "▾" : "▸"}</span>
          <span className="tsec-title">{title}</span>
        </button>
        <span className="tsec-spacer"/>
        <button className="tsec-tear" title={tiledOut ? "Already tiled out" : "Drag to tear off as tile"}
                onMouseDown={startTearOff} disabled={tiledOut}>
          <span className="tsec-tear-glyph">⤴</span>
        </button>
      </div>
      {open && !tiledOut && <div className="tsec-body">{children}</div>}
      {tiledOut && (
        <div className="tsec-ghost">
          <span>Tiled out</span>
          <span className="tsec-ghost-dot"/>
        </div>
      )}
      <style>{`
        .tsec { margin-bottom: 8px; border: 1px solid rgba(255,179,71,0.10);
                background: rgba(11,4,22,0.50); border-radius: 8px; overflow: hidden; }
        .tsec.tiled { opacity: 0.42; border-style: dashed; background: rgba(11,4,22,0.20); }
        .tsec-head { display: flex; align-items: center; gap: 6px;
                     padding: 6px 8px; border-bottom: 1px solid rgba(255,179,71,0.08); }
        .tsec-toggle { background: transparent; border: none; padding: 0; cursor: pointer;
                       display: flex; align-items: center; gap: 6px;
                       font-family: "Space Grotesk", system-ui, sans-serif;
                       font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
        .tsec-toggle:disabled { cursor: not-allowed; }
        .tsec-caret { font-size: 9px; opacity: 0.7; }
        .tsec-spacer { flex: 1; }
        .tsec-tear { background: transparent; border: 1px solid transparent;
                     padding: 2px 6px; border-radius: 6px; cursor: grab;
                     color: ${SP.muted}; font-size: 12px; }
        .tsec-tear:hover:not(:disabled) {
                     border-color: rgba(255,179,71,0.25); color: ${SP.flareGold};
                     background: rgba(255,179,71,0.06); }
        .tsec-tear:disabled { opacity: 0.3; cursor: not-allowed; }
        .tsec-tear-glyph { display: inline-block; }
        .tsec-tear:active:not(:disabled) { cursor: grabbing; }
        .tsec-body { padding: 8px; }
        .tsec-ghost { padding: 12px; text-align: center;
                     font-family: "IBM Plex Mono", ui-monospace, monospace;
                     font-size: 9.5px; letter-spacing: 0.18em;
                     color: ${SP.muted};
                     display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tsec-ghost-dot { width: 6px; height: 6px; border-radius: 50%;
                          background: ${SP.flareGold}; opacity: 0.5;
                          animation: ghostPulse 2s ease-in-out infinite; }
        @keyframes ghostPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );
}

// --- Group computation: tiles snapped edge-to-edge form a group ----
// Returns { groups: [{id, tileIds, topRow: {x,w}, bbox}], tileToGroup: {tileId: groupId} }
function computeGroups(tiles) {
  // skip collapsed-state — group the bbox you SEE
  const rect = (t) => ({ x: t.x, y: t.y, w: t.w, h: t.collapsed ? COLLAPSED_H : t.h });
  const adj = (a, b) => {
    const ar = rect(a), br = rect(b);
    const horizontalTouch = Math.abs((ar.x + ar.w) - br.x) < 2 || Math.abs((br.x + br.w) - ar.x) < 2;
    const verticalTouch = Math.abs((ar.y + ar.h) - br.y) < 2 || Math.abs((br.y + br.h) - ar.y) < 2;
    const yOverlap = ar.y < br.y + br.h && br.y < ar.y + ar.h;
    const xOverlap = ar.x < br.x + br.w && br.x < ar.x + ar.w;
    return (horizontalTouch && yOverlap) || (verticalTouch && xOverlap);
  };
  // union-find
  const parent = {};
  const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
  const union = (a, b) => { parent[find(a)] = find(b); };
  tiles.forEach(t => parent[t.id] = t.id);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (adj(tiles[i], tiles[j])) union(tiles[i].id, tiles[j].id);
    }
  }
  const buckets = {};
  tiles.forEach(t => {
    const r = find(t.id);
    (buckets[r] ||= []).push(t);
  });
  const groups = [];
  const tileToGroup = {};
  Object.entries(buckets).forEach(([root, ts]) => {
    if (ts.length < 2) return; // single tile → no group bar
    const minY = Math.min(...ts.map(t => t.y));
    // top row = tiles whose y is at minY (within 2px)
    const topRow = ts.filter(t => Math.abs(t.y - minY) < 3).sort((a, b) => a.x - b.x);
    // top row bar spans from leftmost x to rightmost x+w of CONTIGUOUS top-row tiles
    const topX = Math.min(...topRow.map(t => t.x));
    const topW = Math.max(...topRow.map(t => t.x + t.w)) - topX;
    const bbox = {
      x: Math.min(...ts.map(t => t.x)),
      y: Math.min(...ts.map(t => t.y)),
      x2: Math.max(...ts.map(t => t.x + t.w)),
      y2: Math.max(...ts.map(t => t.y + (t.collapsed ? COLLAPSED_H : t.h))),
    };
    const id = `grp_${root}`;
    groups.push({ id, tileIds: ts.map(t => t.id), topRow: topRow.map(t => t.id),
                  topX, topW, topY: minY, bbox });
    ts.forEach(t => tileToGroup[t.id] = id);
  });
  return { groups, tileToGroup };
}

// --- Find nearest snap target during drag ----
function findSnap(movingTile, others) {
  let best = null;
  const r = { x: movingTile.x, y: movingTile.y, w: movingTile.w, h: movingTile.collapsed ? COLLAPSED_H : movingTile.h };
  others.forEach(o => {
    const or = { x: o.x, y: o.y, w: o.w, h: o.collapsed ? COLLAPSED_H : o.h };
    // check 4 sides, snap edge-to-edge if close
    // left of o
    const tryL = { x: or.x - r.w, y: or.y };
    const tryR = { x: or.x + or.w, y: or.y };
    const tryT = { x: or.x, y: or.y - r.h };
    const tryB = { x: or.x, y: or.y + or.h };
    [tryL, tryR, tryT, tryB].forEach(p => {
      const d = Math.hypot(p.x - r.x, p.y - r.y);
      if (d < SNAP_TOLERANCE && (!best || d < best.d)) best = { ...p, d };
    });
  });
  return best;
}

// --- Single Tile ----
function FloatingTile({ tile, group }) {
  const ctx = useTiles();
  const reg = ctx.registry[tile.sectionKey];
  if (!reg) return null;

  const dragRef = useRefT(null);

  const startTileDrag = (e, { ungroup = false } = {}) => {
    if (e.target.closest(".tile-btn")) return;
    e.preventDefault();
    e.stopPropagation();
    ctx.bring(tile.id);
    const startX = e.clientX, startY = e.clientY;
    const startTilePos = { x: tile.x, y: tile.y };
    let detached = ungroup;
    const others = ctx.tiles.filter(t => t.id !== tile.id);
    const groupIds = (group && !ungroup) ? group.tileIds : [tile.id];
    const groupTiles = ctx.tiles.filter(t => groupIds.includes(t.id));
    const offsets = groupTiles.map(t => ({ id: t.id, dx: t.x - startTilePos.x, dy: t.y - startTilePos.y }));

    const onMove = (ev) => {
      let nx = snap(startTilePos.x + (ev.clientX - startX));
      let ny = snap(startTilePos.y + (ev.clientY - startY));
      nx = Math.max(8, Math.min(window.innerWidth - tile.w - 8, nx));
      ny = Math.max(60, Math.min(window.innerHeight - 80, ny));
      if (detached) {
        // first move after ungroup: pull away so we don't immediately re-snap to neighbors
        nx = nx + 28;
        ny = ny + 8;
        detached = false;
      }
      if (groupTiles.length === 1) {
        const movingPreview = { ...tile, x: nx, y: ny };
        const snapTo = findSnap(movingPreview, others);
        if (snapTo) { nx = snapTo.x; ny = snapTo.y; }
      }
      const dx = nx - startTilePos.x, dy = ny - startTilePos.y;
      offsets.forEach(o => {
        ctx.updateTile(o.id, { x: snap(startTilePos.x + o.dx + dx), y: snap(startTilePos.y + o.dy + dy) });
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const onHeaderDown = (e) => startTileDrag(e);
  const onUngroupDown = (e) => startTileDrag(e, { ungroup: true });

  const onResizeDown = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (tile.collapsed) return;
    const startX = e.clientX, startY = e.clientY;
    const startW = tile.w, startH = tile.h;
    const onMove = (ev) => {
      const w = Math.max(MIN_W, snap(startW + (ev.clientX - startX)));
      const h = Math.max(MIN_H, snap(startH + (ev.clientY - startY)));
      ctx.updateTile(tile.id, { w, h });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const inGroup = !!group;
  // when in a group, hide own header for tiles that are NOT the leftmost top-row tile
  // (that one shares the group bar). Other tiles still get a slim per-tile collapse/close strip.
  const isLeftmostTopRow = inGroup && group.topRow[0] === tile.id;

  const showHeader = !inGroup;
  const showSlimStrip = inGroup;

  const realH = tile.collapsed ? COLLAPSED_H : tile.h;

  return (
    <div className={`tile ${tile.collapsed ? "collapsed" : ""} ${inGroup ? "ingroup" : ""}`}
         style={{ left: tile.x, top: tile.y, width: tile.w, height: realH, zIndex: tile.z }}
         onMouseDown={() => ctx.bring(tile.id)}>
      {showHeader && (
        <div className="tile-head" onMouseDown={onHeaderDown}>
          <span className="tile-grip">⠿</span>
          <span className="tile-title">{reg.title}</span>
          <span className="tile-spacer"/>
          <button className="tile-btn" title={tile.collapsed ? "Expand" : "Collapse"}
                  onClick={() => ctx.updateTile(tile.id, { collapsed: !tile.collapsed })}>
            {tile.collapsed ? "▾" : "─"}
          </button>
          <button className="tile-btn" title="Close" onClick={() => ctx.closeTile(tile.id)}>×</button>
        </div>
      )}
      {showSlimStrip && (
        <div className="tile-slim" onMouseDown={onHeaderDown}>
          <span className="tile-ungroup" title="Drag to ungroup" onMouseDown={onUngroupDown}>⧉</span>
          <span className="tile-slim-title">{reg.title}</span>
          <span className="tile-spacer"/>
          <button className="tile-btn slim" title={tile.collapsed ? "Expand" : "Collapse"}
                  onClick={() => ctx.updateTile(tile.id, { collapsed: !tile.collapsed })}>
            {tile.collapsed ? "▾" : "─"}
          </button>
          <button className="tile-btn slim" title="Close" onClick={() => ctx.closeTile(tile.id)}>×</button>
        </div>
      )}
      {!tile.collapsed && (
        <div className="tile-body">
          {reg.content()}
        </div>
      )}
      {!tile.collapsed && <div className="tile-resize" onMouseDown={onResizeDown}/>}
      <style>{`
        .tile { position: absolute;
                background: linear-gradient(180deg, rgba(34,12,52,0.88), rgba(11,4,22,0.92));
                border: 1px solid ${SP.goldBorder};
                border-radius: 12px;
                backdrop-filter: blur(16px) saturate(140%);
                box-shadow: 0 0 0 1px rgba(255,179,71,0.12) inset,
                            0 12px 32px rgba(0,0,0,0.55),
                            0 0 24px rgba(255,107,26,0.10);
                overflow: hidden;
                display: flex; flex-direction: column;
                transition: box-shadow 200ms ease; }
        .tile.ingroup { border-color: rgba(255,179,71,0.10); border-radius: 8px; box-shadow: none; }
        .tile-head { display: flex; align-items: center; gap: 6px;
                     padding: 0 8px; height: ${HEADER_H}px; flex-shrink: 0;
                     border-bottom: 1px solid rgba(255,179,71,0.18);
                     cursor: grab; user-select: none;
                     background: linear-gradient(180deg, rgba(255,107,26,0.10), transparent); }
        .tile-head:active { cursor: grabbing; }
        .tile-grip { font-size: 11px; color: ${SP.flareGold}; opacity: 0.7; }
        .tile-title { font-family: "Space Grotesk", system-ui, sans-serif;
                      font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase;
                      color: ${SP.flareGold}; }
        .tile-slim { display: flex; align-items: center; gap: 4px;
                     padding: 0 6px; height: 22px; flex-shrink: 0;
                     border-bottom: 1px solid rgba(255,179,71,0.08);
                     cursor: grab; user-select: none; }
        .tile-slim:active { cursor: grabbing; }
        .tile-slim-title { font-family: "IBM Plex Mono", ui-monospace, monospace;
                           font-size: 9px; letter-spacing: 0.14em; color: ${SP.muted}; }
        .tile-ungroup { font-size: 12px; color: ${SP.flareGold}; cursor: grab;
                        padding: 0 4px; opacity: 0.65; line-height: 1; }
        .tile-ungroup:hover { opacity: 1; background: rgba(255,179,71,0.10);
                              border-radius: 3px; }
        .tile-ungroup:active { cursor: grabbing; }
        .tile-spacer { flex: 1; }
        .tile-btn { background: transparent; border: 1px solid transparent;
                    color: ${SP.muted}; cursor: pointer; padding: 0 6px;
                    font-size: 12px; line-height: 1; height: 20px; border-radius: 4px; }
        .tile-btn.slim { font-size: 10px; height: 16px; padding: 0 4px; }
        .tile-btn:hover { color: ${SP.ink}; border-color: rgba(255,179,71,0.25);
                          background: rgba(255,179,71,0.08); }
        .tile-body { flex: 1; min-height: 0; padding: 10px; overflow: auto; }
        .tile-resize { position: absolute; right: 0; bottom: 0; width: 14px; height: 14px;
                       cursor: nwse-resize;
                       background:
                         linear-gradient(135deg, transparent 0%, transparent 50%,
                                                 ${SP.flareGold}88 50%, ${SP.flareGold}88 60%,
                                                 transparent 60%, transparent 70%,
                                                 ${SP.flareGold}55 70%, ${SP.flareGold}55 80%,
                                                 transparent 80%);
                       opacity: 0.6; }
      `}</style>
    </div>
  );
}

// --- Group bar (top-row-width, with group close/collapse) ----
function GroupBar({ group }) {
  const ctx = useTiles();
  const groupTiles = useMemoT(() => ctx.tiles.filter(t => group.tileIds.includes(t.id)), [ctx.tiles, group]);
  const allCollapsed = groupTiles.every(t => t.collapsed);

  const onCollapseAll = () => {
    const next = !allCollapsed;
    groupTiles.forEach(t => ctx.updateTile(t.id, { collapsed: next }));
  };
  const onCloseGroup = () => ctx.closeGroup(group.tileIds);

  // dragging the group bar drags ALL tiles
  const onBarDown = (e) => {
    if (e.target.closest(".gbar-btn")) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const starts = groupTiles.map(t => ({ id: t.id, x: t.x, y: t.y }));
    const onMove = (ev) => {
      const dx = snap(ev.clientX - startX);
      const dy = snap(ev.clientY - startY);
      starts.forEach(s => ctx.updateTile(s.id, { x: s.x + dx, y: s.y + dy }));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // get max z of group + 1 so bar sits above
  const z = Math.max(...groupTiles.map(t => t.z)) + 1;

  return (
    <div className="gbar" style={{ left: group.topX, top: group.topY - HEADER_H + 2,
                                    width: group.topW, zIndex: z }}
         onMouseDown={onBarDown}>
      <span className="gbar-grip">⠿</span>
      <span className="gbar-title">GROUP · {groupTiles.length} tiles</span>
      <span className="gbar-spacer"/>
      <button className="gbar-btn" onClick={onCollapseAll} title={allCollapsed ? "Expand all" : "Collapse all"}>
        {allCollapsed ? "▾▾" : "──"}
      </button>
      <button className="gbar-btn" onClick={onCloseGroup} title="Close group">×</button>
      <style>{`
        .gbar { position: absolute; height: ${HEADER_H}px;
                display: flex; align-items: center; gap: 6px; padding: 0 10px;
                background: linear-gradient(180deg, rgba(255,107,26,0.18), rgba(34,12,52,0.92));
                border: 1px solid ${SP.goldBorderHot};
                border-bottom: none;
                border-radius: 12px 12px 0 0;
                backdrop-filter: blur(14px);
                cursor: grab; user-select: none;
                box-shadow: 0 -4px 18px rgba(255,107,26,0.18); }
        .gbar:active { cursor: grabbing; }
        .gbar-grip { color: ${SP.flareGold}; font-size: 11px; opacity: 0.8; }
        .gbar-title { font-family: "Space Grotesk", system-ui, sans-serif;
                      font-size: 10.5px; letter-spacing: 0.20em; color: ${SP.flareGold};
                      text-transform: uppercase; font-weight: 600; }
        .gbar-spacer { flex: 1; }
        .gbar-btn { background: transparent; border: 1px solid rgba(255,179,71,0.25);
                    color: ${SP.flareGold}; padding: 1px 8px; border-radius: 4px;
                    cursor: pointer; font-size: 11px; height: 20px; }
        .gbar-btn:hover { background: rgba(255,107,26,0.20); border-color: ${SP.flareGold}; }
      `}</style>
    </div>
  );
}

// --- Group outline (custom shape) ----
function GroupOutline({ group, tiles }) {
  const groupTiles = tiles.filter(t => group.tileIds.includes(t.id));
  const z = Math.min(...groupTiles.map(t => t.z)) - 1;
  // draw individual rect outlines around each tile (since shape is custom)
  return (
    <>
      {groupTiles.map(t => {
        const h = t.collapsed ? COLLAPSED_H : t.h;
        return (
          <div key={t.id} className="goutline"
               style={{ left: t.x - 2, top: t.y - 2, width: t.w + 4, height: h + 4, zIndex: z }}/>
        );
      })}
      <style>{`
        .goutline { position: absolute; pointer-events: none;
                    border: 1px solid ${SP.flareGold};
                    border-radius: 10px;
                    box-shadow: 0 0 0 2px rgba(255,179,71,0.10),
                                0 0 18px rgba(255,179,71,0.18);
                    opacity: 0.55; }
      `}</style>
    </>
  );
}

// --- Tile layer (renders all floating tiles) ----
function TileLayer() {
  const ctx = useTiles();
  if (!ctx) return null;
  const { groups, tileToGroup } = useMemoT(() => computeGroups(ctx.tiles), [ctx.tiles]);
  const groupMap = useMemoT(() => Object.fromEntries(groups.map(g => [g.id, g])), [groups]);

  return (
    <div className="tile-layer">
      {groups.map(g => <GroupOutline key={`o-${g.id}`} group={g} tiles={ctx.tiles}/>)}
      {ctx.tiles.map(t => {
        const g = tileToGroup[t.id] ? groupMap[tileToGroup[t.id]] : null;
        return <FloatingTile key={t.id} tile={t} group={g}/>;
      })}
      {groups.map(g => <GroupBar key={g.id} group={g}/>)}
      <style>{`
        .tile-layer { position: fixed; inset: 0; pointer-events: none; z-index: 50; }
        .tile-layer > * { pointer-events: auto; }
      `}</style>
    </div>
  );
}

window.TileProvider = TileProvider;
window.TileableSection = TileableSection;
window.TileLayer = TileLayer;
window.useTiles = useTiles;
