// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";
import { useSettingsStore } from "../settings/settings.store";
import { invoke } from "../../lib/tauri-invoke";

type RegenerateState = "idle" | "running" | "success" | "error";

export function GraphSourcesTileContent() {
  const { summary } = useGraphSourceSummary();
  const refreshToken = useSettingsStore((s) => s.settings.sources.refreshToken);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const [regenState, setRegenState] = useState<RegenerateState>("idle");
  const [regenError, setRegenError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  async function handleRegenerate() {
    setRegenState("running");
    setRegenError(null);
    try {
      const result = await invoke<{ stdout: string; stderr: string; exit_code: number }>(
        "run_script",
        { script: "scripts/generate-self-graph.mjs", args: [] },
      );
      if (result.exit_code !== 0) {
        throw new Error(result.stderr || `Script exited with code ${result.exit_code}`);
      }
      setLastGenerated(new Date().toLocaleTimeString());
      setRegenState("success");
      setSetting("sources.refreshToken", refreshToken + 1);
      setTimeout(() => setRegenState("idle"), 2000);
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : String(err));
      setRegenState("error");
    }
  }

  const isRunning = regenState === "running";
  const isSuccess = regenState === "success";

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

          <div
            className="mt-3 flex items-center justify-between gap-2"
            data-testid="graph-sources-regenerate-row"
          >
            <button
              className="rounded border border-cyan-400/30 bg-slate-900 px-3 py-1 text-xs text-cyan-300 hover:bg-slate-800 disabled:cursor-default disabled:opacity-50"
              disabled={isRunning}
              onClick={handleRegenerate}
              data-testid="graph-sources-regenerate-btn"
            >
              {isRunning ? (
                <span data-testid="graph-sources-regenerate-status">Regenerating…</span>
              ) : isSuccess ? (
                "Done ✓"
              ) : regenState === "error" ? (
                "Retry"
              ) : (
                "Regenerate"
              )}
            </button>
            {lastGenerated && (
              <span
                className="text-xs text-slate-500"
                data-testid="graph-sources-last-generated"
              >
                {lastGenerated}
              </span>
            )}
          </div>

          {regenError && (
            <div
              className="mt-2 rounded border border-red-500/30 bg-red-950/40 px-2 py-1 text-xs text-red-400"
              data-testid="graph-sources-regenerate-error"
            >
              {regenError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
