/**
 * v86c Tile Provider
 * Context provider for tile state management
 */

import { createContext, useContext, ReactNode, useCallback, useMemo } from "react";
import { useSettingsStore } from "../settings/settings.store";
import type { TileLayoutEntry, TileContextState, TileContextActions } from "./tile.types";
import { generateTileId, computeGroups } from "./tileUtils";
import { tileSectionRegistry } from "./tileSectionRegistry";

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
  const tileLayout = settings.ui.tileLayout;

  // Convert array to Map for easier lookup
  const tilesMap = useMemo(() => {
    const map = new Map<string, TileLayoutEntry>();
    for (const tile of tileLayout) {
      map.set(tile.id, tile);
    }
    return map;
  }, [tileLayout]);

  // Compute max z-index
  const maxZ = useMemo(() => {
    if (tileLayout.length === 0) return 100;
    return Math.max(...tileLayout.map((t) => t.z), 100);
  }, [tileLayout]);

  // Compute groups
  const groups = useMemo(() => {
    return computeGroups(tileLayout);
  }, [tileLayout]);

  // Tear off a section into a floating tile
  const tearOff = useCallback((sectionKey: string, initialX: number, initialY: number) => {
    const section = tileSectionRegistry.getById(sectionKey);
    if (!section) {
      console.warn(`Section not found: ${sectionKey}`);
      return;
    }

    const newTile: TileLayoutEntry = {
      id: generateTileId(sectionKey),
      sectionKey,
      x: initialX,
      y: initialY,
      w: section.defaultWidth,
      h: section.defaultHeight,
      collapsed: false,
      z: maxZ + 1,
    };

    const updatedLayout = [...tileLayout, newTile];
    setSetting("ui.tileLayout", updatedLayout);
  }, [tileLayout, maxZ, setSetting]);

  // Close a tile (return to original slot)
  const closeTile = useCallback((tileId: string) => {
    const updatedLayout = tileLayout.filter((t) => t.id !== tileId);
    setSetting("ui.tileLayout", updatedLayout);
  }, [tileLayout, setSetting]);

  // Update tile position/size during drag
  const updateTile = useCallback((tileId: string, updates: Partial<TileLayoutEntry>) => {
    const tile = tilesMap.get(tileId);
    if (!tile) return;

    const updatedTile = { ...tile, ...updates };
    const updatedLayout = tileLayout.map((t) => (t.id === tileId ? updatedTile : t));
    setSetting("ui.tileLayout", updatedLayout);
  }, [tilesMap, tileLayout, setSetting]);

  // Bring a tile to front
  const bringToFront = useCallback((tileId: string) => {
    const updatedLayout = tileLayout.map((t) => ({
      ...t,
      z: t.id === tileId ? maxZ + 1 : t.z,
    }));
    setSetting("ui.tileLayout", updatedLayout);
  }, [tileLayout, maxZ, setSetting]);

  // Toggle tile collapsed state
  const toggleCollapsed = useCallback((tileId: string) => {
    const tile = tilesMap.get(tileId);
    if (!tile) return;

    const updatedTile = { ...tile, collapsed: !tile.collapsed };
    const updatedLayout = tileLayout.map((t) => (t.id === tileId ? updatedTile : t));
    setSetting("ui.tileLayout", updatedLayout);
  }, [tilesMap, tileLayout, setSetting]);

  const contextValue: TileContextState & TileContextActions = {
    tiles: tilesMap,
    maxZ,
    groups,
    tearOff,
    closeTile,
    updateTile,
    bringToFront,
    toggleCollapsed,
  };

  return (
    <TileContext.Provider value={contextValue}>
      {children}
    </TileContext.Provider>
  );
}
