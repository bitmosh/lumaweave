import { useState, useEffect } from "react";
import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";

function useGraphStats() {
  const { summary } = useGraphSourceSummary();
  return {
    nodeCount: summary.normalizedNodeCount ?? 0,
    edgeCount: summary.normalizedEdgeCount ?? 0,
  };
}

function useLayoutState(): string {
  // v87.2 known limitation: FA2 supervisor state not yet exposed.
  // Returns a static placeholder until layout state store is wired (v89+).
  return "settling";
}

function useFPSCounter(): number {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let lastTime = performance.now();
    const frames: number[] = [];
    let rafId: number;

    function tick() {
      const now = performance.now();
      const delta = now - lastTime;
      const instantFps = 1000 / delta;
      frames.push(instantFps);
      if (frames.length > 60) frames.shift();
      const avgFps = Math.round(
        frames.reduce((a, b) => a + b, 0) / frames.length
      );
      lastTime = now;
      setFps(avgFps);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return fps;
}

export function StatusCluster() {
  const graphStats = useGraphStats();
  const layoutState = useLayoutState();
  const fps = useFPSCounter();

  return (
    <div className="lw-status-cluster" data-lw-theme-target="topbar.statusCluster">
      <span className="lw-cluster-key">graph</span>
      <span className="lw-cluster-val">
        {graphStats.nodeCount}n · {graphStats.edgeCount}e
      </span>
      <span className="lw-cluster-sep">·</span>
      <span className="lw-cluster-key">layout</span>
      <span className="lw-cluster-val">{layoutState}</span>
      <span className="lw-cluster-sep">·</span>
      <span className="lw-cluster-key">fps</span>
      <span
        className={`lw-cluster-val ${fps >= 50 ? "ok" : fps >= 30 ? "warn" : "bad"}`}
      >
        {fps}
      </span>
    </div>
  );
}
