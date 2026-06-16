// use-minimap-snapshot.jsx
// → useMinimapSnapshot.ts in real app
//
// Subscribes to structural graph mutations. Bumps a `snapshotVersion`
// counter (debounced) every time the graph fundamentally changes, and
// recomputes the graph bounds + node/edge counts at the same time.
//
// Subscription rule: ONLY structural events. Camera moves and label
// changes are explicitly excluded — those go through useMinimapCamera.
//
// Real-app boundary:
//   - graph from (window as any).__lwSigma?.getGraph()
//   - events from graphology: nodeAdded, nodeDropped, edgeAdded,
//     edgeDropped, cleared
// Prototype boundary:
//   - same window.__lwSigma access (set by SigmaProvider on mount)
//
// The hook is identical between prototype and production; only the
// install site for window.__lwSigma differs.

const SNAPSHOT_DEBOUNCE_MS = 120;

function useMinimapSnapshot() {
  const [state, setState] = React.useState(() => ({
    snapshotVersion: 0,
    bounds: null,    // {minX, minY, maxX, maxY} or null when graph empty
    counts: { nodes: 0, edges: 0 },
    isRefreshing: false,
  }));

  React.useEffect(() => {
    const sigma = window.__lwSigma;
    if (!sigma) return;
    const graph = sigma.getGraph();
    if (!graph) return;

    let debounceTimer = null;
    let refreshFlagTimer = null;
    let pending = false;

    const computeSnapshot = () => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let nodeCount = 0;
      graph.forEachNode((_id, attrs) => {
        nodeCount += 1;
        if (attrs?.x == null || attrs?.y == null) return;
        if (attrs.x < minX) minX = attrs.x;
        if (attrs.y < minY) minY = attrs.y;
        if (attrs.x > maxX) maxX = attrs.x;
        if (attrs.y > maxY) maxY = attrs.y;
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

      // Clear the refresh-flag after a brief moment so the status
      // dot returns to "fresh" (purely visual signal).
      clearTimeout(refreshFlagTimer);
      refreshFlagTimer = setTimeout(() => {
        setState((prev) => ({ ...prev, isRefreshing: false }));
      }, 400);
    };

    const markDirty = () => {
      pending = true;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!pending) return;
        pending = false;
        computeSnapshot();
      }, SNAPSHOT_DEBOUNCE_MS);
    };

    // Initial snapshot (no debounce — we want the first paint right).
    computeSnapshot();

    const STRUCTURAL_EVENTS = [
      'nodeAdded', 'nodeDropped',
      'edgeAdded', 'edgeDropped',
      'cleared',
    ];
    for (const ev of STRUCTURAL_EVENTS) graph.on(ev, markDirty);

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(refreshFlagTimer);
      for (const ev of STRUCTURAL_EVENTS) graph.off(ev, markDirty);
    };
  }, []);

  return state;
}

Object.assign(window, { useMinimapSnapshot });
