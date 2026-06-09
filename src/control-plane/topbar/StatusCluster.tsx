import { useState, useEffect } from "react";
import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";
import { t } from "../../i18n";

function useGraphStats() {
  const { summary } = useGraphSourceSummary();
  return {
    nodeCount: summary.normalizedNodeCount ?? 0,
    edgeCount: summary.normalizedEdgeCount ?? 0,
  };
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
  const fps = useFPSCounter();

  return (
    <div className="lw-status-cluster" data-lw-theme-target="topbar.statusCluster">
      <span className="lw-cluster-key">{t("topbar.statusCluster.graphLabel")}</span>
      <span className="lw-cluster-val">
        {graphStats.nodeCount}n · {graphStats.edgeCount}e
      </span>
      <span className="lw-cluster-sep">·</span>
      <span className="lw-cluster-key">{t("topbar.statusCluster.fpsLabel")}</span>
      <span
        className={`lw-cluster-val ${fps >= 50 ? "ok" : fps >= 30 ? "warn" : "bad"}`}
      >
        {fps}
      </span>
    </div>
  );
}
