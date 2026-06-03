import { useState, useEffect } from "react";

const SNAPSHOT_DEBOUNCE_MS = 120;
// How long to poll for __lwSigma before giving up (sigma may mount after minimap).
const SIGMA_POLL_INTERVAL_MS = 200;
const SIGMA_POLL_MAX_ATTEMPTS = 30; // 6 seconds total

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
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshFlagTimer: ReturnType<typeof setTimeout> | null = null;
    let cleanup: (() => void) | null = null;
    let attempts = 0;

    const setup = () => {
      // Always re-fetch sigma + graph fresh — never cache a stale ref.
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      if (!graph) return false;

      // Clear the sigma-readiness poll (no longer needed).
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }

      let lastNodeCount = -1; // sentinel: force initial compute
      let pending = false;

      const computeSnapshot = () => {
        // Re-fetch the CURRENT graph fresh each time — a graph rebuild swaps the
        // object out from under a cached reference.
        const freshSigma = (window as any).__lwSigma;
        if (!freshSigma) return;
        const freshGraph = freshSigma.getGraph();
        if (!freshGraph) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let nodeCount = 0;
        freshGraph.forEachNode((_id: string, attrs: Record<string, unknown>) => {
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

        lastNodeCount = nodeCount;

        setState((prev) => ({
          snapshotVersion: prev.snapshotVersion + 1,
          bounds,
          counts: { nodes: nodeCount, edges: freshGraph.size ?? 0 },
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

      // afterRender: only recompute when node count changes (0→N, or structural
      // change). This avoids over-refresh on camera moves (pan/zoom).
      const onAfterRender = () => {
        const freshSigma = (window as any).__lwSigma;
        if (!freshSigma) return;
        const freshGraph = freshSigma.getGraph();
        if (!freshGraph) return;
        const currentCount = freshGraph.order;
        if (currentCount !== lastNodeCount) {
          markDirty();
        }
      };

      // Initial compute — may be 0 if graph not yet built; afterRender will
      // trigger when it populates.
      computeSnapshot();

      // Structural events on the current graph for future live changes.
      const STRUCTURAL_EVENTS = [
        "nodeAdded", "nodeDropped",
        "edgeAdded", "edgeDropped",
        "cleared",
      ];
      for (const ev of STRUCTURAL_EVENTS) graph.on(ev, markDirty);

      // afterRender for initial population detection (sigma fires this once the
      // first frame is drawn with the graph fully built).
      sigma.on("afterRender", onAfterRender);

      cleanup = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (refreshFlagTimer) clearTimeout(refreshFlagTimer);
        for (const ev of STRUCTURAL_EVENTS) {
          // Use fresh graph in case it was rebuilt — try both.
          try { graph.off(ev, markDirty); } catch { /* already unsubscribed */ }
        }
        const freshSigma = (window as any).__lwSigma;
        if (freshSigma) {
          try { freshSigma.off("afterRender", onAfterRender); } catch { /* ok */ }
        }
      };

      return true;
    };

    // Try immediately; if sigma isn't ready yet, poll until it appears.
    if (!setup()) {
      pollTimer = setInterval(() => {
        attempts += 1;
        if (attempts >= SIGMA_POLL_MAX_ATTEMPTS) {
          clearInterval(pollTimer!);
          pollTimer = null;
          return;
        }
        if (setup()) {
          // setup() cleared the poll itself.
        }
      }, SIGMA_POLL_INTERVAL_MS);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (refreshFlagTimer) clearTimeout(refreshFlagTimer);
      cleanup?.();
    };
  }, []);

  return state;
}
