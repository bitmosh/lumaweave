import { useState, useEffect } from "react";

const SNAPSHOT_DEBOUNCE_MS = 150;
// How long to poll for __lwSigma before giving up (sigma may mount after minimap).
const SIGMA_POLL_INTERVAL_MS = 200;
const SIGMA_POLL_MAX_ATTEMPTS = 30; // 6 seconds total

// Settle detection: stop afterRender-driven recomputes once bounds are stable.
const BOUNDS_EPSILON = 1.0;   // graph units — negligible positional drift
const STABLE_NEEDED  = 5;     // consecutive stable ticks × 150ms debounce ≈ 750ms quiet period

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

function areBoundsStable(a: MinimapBounds | null, b: MinimapBounds | null): boolean {
  if (!a || !b) return false;
  return (
    Math.abs(a.minX - b.minX) < BOUNDS_EPSILON &&
    Math.abs(a.minY - b.minY) < BOUNDS_EPSILON &&
    Math.abs(a.maxX - b.maxX) < BOUNDS_EPSILON &&
    Math.abs(a.maxY - b.maxY) < BOUNDS_EPSILON
  );
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
      const sigma = (window as any).__lwSigma;
      if (!sigma) return false;
      const graph = sigma.getGraph();
      if (!graph) return false;

      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }

      let pending = false;

      // Settle-detection state.
      let prevBoundsForStability: MinimapBounds | null = null;
      let stableCount = 0;
      let boundsSettled = false;

      const computeSnapshot = () => {
        // Re-fetch fresh each time — graph rebuild invalidates cached refs.
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

        // Delta-stability check: stop afterRender recomputes once positions settle.
        if (areBoundsStable(bounds, prevBoundsForStability)) {
          stableCount++;
          if (stableCount >= STABLE_NEEDED) {
            boundsSettled = true;
            // onAfterRender now bails early; no more per-frame recomputes until
            // a structural event (source reload, graph rebuild) resets this.
          }
        } else {
          stableCount = 0;
        }
        prevBoundsForStability = bounds;

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

      const markDirty = (fromStructural = false) => {
        if (fromStructural) {
          // Structural event (source reload, graph rebuild): reset settle state
          // so afterRender recomputes resume for the new layout.
          stableCount = 0;
          boundsSettled = false;
          prevBoundsForStability = null;
        }
        pending = true;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (!pending) return;
          pending = false;
          computeSnapshot();
        }, SNAPSHOT_DEBOUNCE_MS);
      };

      // afterRender: drives bounds recompute during layout settle.
      // Guard: if boundsSettled, skip — no perpetual per-frame recompute.
      const onAfterRender = () => {
        if (boundsSettled) return;
        markDirty(false);
      };

      // Initial compute.
      computeSnapshot();

      const STRUCTURAL_EVENTS = [
        "nodeAdded", "nodeDropped",
        "edgeAdded", "edgeDropped",
        "cleared",
      ];
      for (const ev of STRUCTURAL_EVENTS) {
        graph.on(ev, () => markDirty(true));
      }

      sigma.on("afterRender", onAfterRender);

      cleanup = () => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (refreshFlagTimer) clearTimeout(refreshFlagTimer);
        for (const ev of STRUCTURAL_EVENTS) {
          try { graph.off(ev, () => markDirty(true)); } catch { /* ok */ }
        }
        const freshSigma = (window as any).__lwSigma;
        if (freshSigma) {
          try { freshSigma.off("afterRender", onAfterRender); } catch { /* ok */ }
        }
      };

      return true;
    };

    if (!setup()) {
      pollTimer = setInterval(() => {
        attempts += 1;
        if (attempts >= SIGMA_POLL_MAX_ATTEMPTS) {
          clearInterval(pollTimer!);
          pollTimer = null;
          return;
        }
        setup();
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
