/**
 * v86c Tile Provider
 * Context provider for tile state management
 * Reference: (NEW)tile-system.jsx lines 15-44
 */

import { createContext, useContext, ReactNode, useCallback, useRef, useState, useEffect } from "react";
import { useSettingsStore } from "../settings/settings.store";
import type { TileLayoutEntry, TileContextState, TileContextActions } from "./tile.types";
import { tileSectionRegistry } from "./tileSectionRegistry";

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
  const { settings, setSetting } = useSettingsStore();
  const { ui } = settings;
  const tileLayout = ui.tileLayout || [];
  const [tiles, setTiles] = useState<TileLayoutEntry[]>(tileLayout);
  const zCounter = useRef(Math.max(...tileLayout.map(t => t.z), 10));

  // Persist tiles to settings store on any change
  useEffect(() => {
    setSetting("ui.tileLayout", tiles);
  }, [tiles, setSetting]);

  // Tile out: convert a section into a floating tile. Returns tile ID if added.
  const tileOut = useCallback((sectionKey: string, atPos?: { x: number; y: number }): string | null => {
    let createdId: string | null = null;
    setTiles(prev => {
      if (prev.find(t => t.sectionKey === sectionKey)) return prev;
      const section = tileSectionRegistry.getById(sectionKey);
      if (!section) return prev;
      const id = `tile_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}`;
      const x = atPos?.x ?? snap(window.innerWidth / 2 - 160);
      const y = atPos?.y ?? snap(120 + prev.length * 30);
      const newTile = { id, sectionKey, x, y, w: section.defaultWidth, h: section.defaultHeight, collapsed: false, z: ++zCounter.current };
      createdId = id;
      return [...prev, newTile];
    });
    return createdId;
  }, []);  // ← empty deps, stable forever
  
  const closeTile = useCallback((id: string) => {
    setTiles(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const closeGroup = useCallback((groupIds: string[]) => {
    setTiles(prev => prev.filter(t => !groupIds.includes(t.id)));
  }, []);
  
  const updateTile = useCallback((id: string, patch: Partial<TileLayoutEntry>) => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);
  
  const bring = useCallback((id: string) => {
    setTiles(prev => prev.map(t => t.id === id ? { ...t, z: ++zCounter.current } : t));
  }, []);

  const isTiledOut = useCallback((sectionKey: string) => !!tiles.find(t => t.sectionKey === sectionKey), [tiles]);

  const contextValue: TileContextState & TileContextActions = {
    tiles: new Map(tiles.map(t => [t.id, t])),
    maxZ: Math.max(...tiles.map(t => t.z), 10),
    groups: [], // Will be computed in TileLayer
    tileOut,
    closeTile,
    closeGroup,
    updateTile,
    bringToFront: bring,
    toggleCollapsed: (id: string) => {
      const tile = tiles.find(t => t.id === id);
      if (!tile) return;
      updateTile(id, { collapsed: !tile.collapsed });
    },
    isTiledOut,
  };

  return (
    <TileContext.Provider value={contextValue}>
      {children}
    </TileContext.Provider>
  );
}
