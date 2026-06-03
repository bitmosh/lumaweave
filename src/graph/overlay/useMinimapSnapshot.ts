import { useState, useEffect } from "react";

const SNAPSHOT_DEBOUNCE_MS = 120;

export interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface MinimapSnapshotState {
  snapshotVersion: number;
  bounds: MinimapBounds | null;
  counts: { nodes: number; edges: number };
  isRefreshing: boolean;
}

export function useMinimapSnapshot(): MinimapSnapshotState {
  const [state, setState] = useState<MinimapSnapshotState>(() => ({
    snapshotVersion: 0,
    bounds: null,
    counts: { nodes: 0, edges: 0 },
    isRefreshing: false,
  }));

  useEffect(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma) return;
    const graph = sigma.getGraph();
    if (!graph) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshFlagTimer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;

    const computeSnapshot = () => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let nodeCount = 0;
      graph.forEachNode((_id: string, attrs: Record<string, unknown>) => {
        nodeCount += 1;
        if (attrs?.x == null || attrs?.y == null) return;
        const x = attrs.x as number, y = attrs.y as number;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });
      const bounds = Number.isFinite(minX)
        ? { minX, minY, maxX, maxY }
        : null;

      setState((prev) => ({
        snapshotVersion: prev.snapshotVersion + 1,
        bounds,
        counts: { nodes: nodeCount, edges: graph.size ?? 0 },
        isRefreshing: true,
      }));

      if (refreshFlagTimer) clearTimeout(refreshFlagTimer);
      refreshFlagTimer = setTimeout(() => {
        setState((prev) => ({ ...prev, isRefreshing: false }));
      }, 400);
    };

    const markDirty = () => {
      pending = true;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!pending) return;
        pending = false;
        computeSnapshot();
      }, SNAPSHOT_DEBOUNCE_MS);
    };

    computeSnapshot();

    const STRUCTURAL_EVENTS = [
      "nodeAdded", "nodeDropped",
      "edgeAdded", "edgeDropped",
      "cleared",
    ];
    for (const ev of STRUCTURAL_EVENTS) graph.on(ev, markDirty);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (refreshFlagTimer) clearTimeout(refreshFlagTimer);
      for (const ev of STRUCTURAL_EVENTS) graph.off(ev, markDirty);
    };
  }, []);

  return state;
}
