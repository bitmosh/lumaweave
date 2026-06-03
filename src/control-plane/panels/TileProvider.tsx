/**
 * v86c Tile Provider
 * Context provider for tile state management
 * Reference: (NEW)tile-system.jsx lines 15-44
 */

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import { useSettingsStore } from "../settings/settings.store";
import type {
  TileLayoutEntry,
  TileContextState,
  TileContextActions,
  SnapGuide,
  TileAnchor,
} from "./tile.types";
import { tileSectionRegistry } from "./tileSectionRegistry";
import { computeAnchorPos, resolvedTilesArray } from "./tileUtils";

const TILE_GRID = 16;

const snap = (v: number) => Math.round(v / TILE_GRID) * TILE_GRID;

/**
 * v103.1.4: Single well-formed tile-creation path.
 *
 * Creates a TileLayoutEntry with ALL required fields: mode, anchor, visible.
 * Used by bootstrap, reconcile, and tileOut so no path creates a malformed tile.
 *
 * Default tiles (bootstrap/reconcile): deterministic id "tile_${section.id}", mode:"docked".
 * User-initiated (tileOut): randomId:true, mode depends on atPos.
 */
import type { TileSectionEntry } from "./tile.types";

function createDefaultTile(
  section: TileSectionEntry,
  z: number,
  opts?: { atPos?: { x: number; y: number }; randomId?: boolean },
): TileLayoutEntry {
  const id = opts?.randomId
    ? `tile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`
    : `tile_${section.id}`;

  // Use "floating" for now — the bootstrap/reconcile tiles work with offset-based anchor positions.
  // Full docking (mode:"docked" + slot) requires the docking arc's slot-assignment pass (.1.5+).
  // atPos-provided tiles are always floating (user placed them explicitly).
  const mode: "docked" | "floating" = "floating";

  const pos = opts?.atPos ?? computeAnchorPos(
    section.defaultAnchor,
    section.defaultWidth,
    section.defaultHeight,
  );

  return {
    id,
    sectionKey: section.id,
    mode,
    anchor: section.defaultAnchor,
    visible: true,
    x: pos.x,
    y: pos.y,
    w: section.defaultWidth,
    h: section.defaultHeight,
    collapsed: !section.defaultExpanded,
    z,
  };
}

const TileContext = createContext<(TileContextState & TileContextActions) | null>(null);

export function useTileContext() {
  const context = useContext(TileContext);
  if (!context) {
    throw new Error("useTileContext must be used within TileProvider");
  }
  return context;
}

interface TileProviderProps {
  children: ReactNode;
}

export function TileProvider({ children }: TileProviderProps) {
  // CRITICAL: Each useSettingsStore call uses its own selector.
  // This is the SAME pattern SettingsPanel uses and that pattern
  // works. If your previous attempts used destructuring or selected
  // a nested path, they were not following this pattern.
  const settings = useSettingsStore((state) => state.settings);
  const setSetting = useSettingsStore((state) => state.setSetting);

  const tiles: TileLayoutEntry[] = settings.ui?.tileLayout ?? [];

  // Read the latest tiles from the store directly via getState().
  // Bypasses React's render cycle so we get the post-setSetting
  // value within the same synchronous turn. Critical for callers
  // that do create-and-immediately-update (e.g. CollapsibleSection's
  // onMove handler which calls tileOut and updateTile in the same
  // JS turn).
  const getCurrentTiles = (): TileLayoutEntry[] =>
    useSettingsStore.getState().settings.ui?.tileLayout ?? [];

  const zCounterRef = useRef<number>(
    Math.max(...tiles.map((t) => t.z), 10),
  );

  useEffect(() => {
    const maxZ = Math.max(...tiles.map((t) => t.z), 10);
    if (maxZ > zCounterRef.current) {
      zCounterRef.current = maxZ;
    }
  }, [tiles]);

  // First-mount auto-populate from registry defaultVisible entries.
  // Runs once per browser session (localStorage flag prevents re-populate
  // after the user closes tiles and reloads).
  useEffect(() => {
    const BOOTSTRAP_KEY = "lumaweave-tiles-bootstrapped";
    if (localStorage.getItem(BOOTSTRAP_KEY)) return;

    const currentTiles = getCurrentTiles();
    const newTiles = tileSectionRegistry.list()
      .filter(entry => entry.defaultVisible)
      .filter(entry => !currentTiles.some(t => t.sectionKey === entry.id))
      .map(entry => createDefaultTile(entry, ++zCounterRef.current));

    if (newTiles.length > 0) {
      writeTiles([...currentTiles, ...newTiles]);
    }
    localStorage.setItem(BOOTSTRAP_KEY, "1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // v103.1.4: Reconcile missing default-visible tiles each load (NOT one-time guarded).
  // Handles registry entries added AFTER the browser's first bootstrap (e.g. graph-sources,
  // graph-inspector). CRITICAL: only creates tiles with NO entry. An entry with visible:false
  // (user deliberately closed) is NOT touched — close=hide must be respected.
  useEffect(() => {
    const currentTiles = getCurrentTiles();
    const missing = tileSectionRegistry.list()
      .filter(entry => entry.defaultVisible)
      .filter(entry => !currentTiles.some(t => t.sectionKey === entry.id));

    if (missing.length > 0) {
      const newTiles = missing.map(entry => createDefaultTile(entry, ++zCounterRef.current));
      writeTiles([...currentTiles, ...newTiles]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [snapGuide, setSnapGuide] = useState<SnapGuide | null>(null);
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null);

  const writeTiles = useCallback(
    (newTiles: TileLayoutEntry[]) => {
      setSetting("ui.tileLayout", newTiles);
    },
    [setSetting],
  );

  const tileOut = useCallback(
    (sectionKey: string, atPos?: { x: number; y: number }): string | null => {
      const currentTiles = getCurrentTiles();
      if (currentTiles.find((t) => t.sectionKey === sectionKey)) return null;
      const section = tileSectionRegistry.getById(sectionKey);
      if (!section) return null;

      // v103.1.4: use createDefaultTile — well-formed with mode/anchor/visible.
      // randomId:true for user-initiated tiles (not idempotent by design).
      // atPos provided → floating; no atPos → docked (if section has defaultAnchor).
      const effectiveAtPos = atPos ?? (section.defaultAnchor ? undefined : {
        x: snap(window.innerWidth / 2 - 160),
        y: snap(120 + currentTiles.length * 30),
      });
      const newTile = createDefaultTile(section, ++zCounterRef.current, {
        atPos: effectiveAtPos,
        randomId: true,
      });
      writeTiles([...currentTiles, newTile]);
      return newTile.id;
    },
    [writeTiles],
  );

  // v103.1.2: close = HIDE (visible:false), not remove.
  // Keeps the entry so the popover checkbox can reflect real state and re-show the tile.
  const closeTile = useCallback(
    (id: string) => {
      writeTiles(getCurrentTiles().map((t) => t.id === id ? { ...t, visible: false } : t));
    },
    [writeTiles],
  );

  const closeGroup = useCallback(
    (groupIds: string[]) => {
      writeTiles(getCurrentTiles().map((t) => groupIds.includes(t.id) ? { ...t, visible: false } : t));
    },
    [writeTiles],
  );

  const updateTile = useCallback(
    (id: string, patch: Partial<TileLayoutEntry>) => {
      writeTiles(
        getCurrentTiles().map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [writeTiles],
  );

  const bring = useCallback(
    (id: string) => {
      writeTiles(
        getCurrentTiles().map((t) =>
          t.id === id ? { ...t, z: ++zCounterRef.current } : t,
        ),
      );
    },
    [writeTiles],
  );

  const isTiledOut = useCallback(
    (sectionKey: string) =>
      !!getCurrentTiles().find((t) => t.sectionKey === sectionKey),
    [],
  );

  const setTileVisibility = useCallback(
    (id: string, visible: boolean) => {
      writeTiles(
        getCurrentTiles().map((t) => (t.id === id ? { ...t, visible } : t)),
      );
    },
    [writeTiles],
  );

  const setTileAnchor = useCallback(
    (id: string) => {
      const tile = getCurrentTiles().find((t) => t.id === id);
      if (!tile) return;
      const freeAnchor: TileAnchor = { edge: "free", x: tile.x, y: tile.y };
      writeTiles(
        getCurrentTiles().map((t) =>
          t.id === id ? { ...t, anchor: freeAnchor } : t,
        ),
      );
    },
    [writeTiles],
  );

  const returnToAnchor = useCallback(
    (id: string) => {
      const tile = getCurrentTiles().find((t) => t.id === id);
      if (!tile) return;
      const section = tileSectionRegistry.getById(tile.sectionKey);
      const anchor = tile.anchor ?? section?.defaultAnchor;
      if (!anchor) return;
      const pos = computeAnchorPos(anchor, tile.w, tile.h);
      writeTiles(
        getCurrentTiles().map((t) =>
          t.id === id ? { ...t, x: pos.x, y: pos.y } : t,
        ),
      );
    },
    [writeTiles],
  );

  const contextValue: TileContextState & TileContextActions = {
    tiles: new Map(tiles.map((t) => [t.id, t])),
    maxZ: Math.max(...tiles.map((t) => t.z), 10),
    groups: [],
    tileToGroup: {},
    snapGuide,
    tileOut,
    closeTile,
    closeGroup,
    updateTile,
    bringToFront: bring,
    toggleCollapsed: (id: string) => {
      const tile = getCurrentTiles().find((t) => t.id === id);
      if (!tile) return;
      updateTile(id, { collapsed: !tile.collapsed });
    },
    isTiledOut,
    setSnapGuide,
    setTileVisibility,
    setTileAnchor,
    returnToAnchor,
    // v103.1.1: resolve positions so event handlers (snap/group drag) see live coords.
    // viewport read at call time — correct for event handlers, which fire synchronously.
    getLiveTiles: () => resolvedTilesArray(
      getCurrentTiles(),
      { width: window.innerWidth, height: window.innerHeight },
    ),
    getLiveTile: (id: string) => resolvedTilesArray(
      getCurrentTiles(),
      { width: window.innerWidth, height: window.innerHeight },
    ).find(t => t.id === id),
    draggingTileId,
    setDraggingTileId,
  };

  return (
    <TileContext.Provider value={contextValue}>
      {children}
    </TileContext.Provider>
  );
}
