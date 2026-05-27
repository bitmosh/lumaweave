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
import { computeAnchorPos } from "./tileUtils";

const TILE_GRID = 16;

const snap = (v: number) => Math.round(v / TILE_GRID) * TILE_GRID;

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
    const newTiles: TileLayoutEntry[] = [];

    for (const entry of tileSectionRegistry.list()) {
      if (!entry.defaultVisible) continue;
      if (currentTiles.find((t) => t.sectionKey === entry.id)) continue;

      const pos = computeAnchorPos(
        entry.defaultAnchor,
        entry.defaultWidth,
        entry.defaultHeight,
      );

      newTiles.push({
        id: `tile_${entry.id}`,
        sectionKey: entry.id,
        x: pos.x,
        y: pos.y,
        w: entry.defaultWidth,
        h: entry.defaultHeight,
        collapsed: !entry.defaultExpanded,
        z: ++zCounterRef.current,
        anchor: entry.defaultAnchor,
      });
    }

    if (newTiles.length > 0) {
      writeTiles([...currentTiles, ...newTiles]);
    }
    localStorage.setItem(BOOTSTRAP_KEY, "1");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [snapGuide, setSnapGuide] = useState<SnapGuide | null>(null);

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

      const id = `tile_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 5)}`;
      const x = atPos?.x ?? snap(window.innerWidth / 2 - 160);
      const y = atPos?.y ?? snap(120 + currentTiles.length * 30);

      const newTile: TileLayoutEntry = {
        id,
        sectionKey,
        x,
        y,
        w: section.defaultWidth,
        h: section.defaultHeight,
        collapsed: false,
        z: ++zCounterRef.current,
      };
      writeTiles([...currentTiles, newTile]);
      return id;
    },
    [writeTiles],
  );

  const closeTile = useCallback(
    (id: string) => {
      writeTiles(getCurrentTiles().filter((t) => t.id !== id));
    },
    [writeTiles],
  );

  const closeGroup = useCallback(
    (groupIds: string[]) => {
      writeTiles(getCurrentTiles().filter((t) => !groupIds.includes(t.id)));
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
  };

  return (
    <TileContext.Provider value={contextValue}>
      {children}
    </TileContext.Provider>
  );
}
