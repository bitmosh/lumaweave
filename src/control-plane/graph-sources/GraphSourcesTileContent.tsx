import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";

export function GraphSourcesTileContent() {
  const { summary } = useGraphSourceSummary();

  return (
    <div className="lw-graph-sources-tile" data-testid="graph-sources-tile-content">
      <div className="space-y-3 p-1">
        <div className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-3">
          <div className="text-sm text-slate-200">{summary.label}</div>
          {summary.sourcePath && (
            <div className="mt-1 text-xs text-slate-500">{summary.sourcePath}</div>
          )}
          <div
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs"
            style={{ background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}
          >
            {summary.status}
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Raw nodes:</span>
              <span className="text-cyan-400">{summary.nodeCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Raw edges:</span>
              <span className="text-cyan-400">{summary.edgeCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Normalized nodes:</span>
              <span className="text-cyan-400">{summary.normalizedNodeCount ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Normalized edges:</span>
              <span className="text-cyan-400">{summary.normalizedEdgeCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
