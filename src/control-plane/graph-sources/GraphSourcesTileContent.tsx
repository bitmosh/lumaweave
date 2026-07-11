// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { EmptyPane } from "./EmptyPane";
import { GraphSourcePicker } from "./GraphSourcePicker";
import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";
import { useSettingsStore } from "../settings/settings.store";
import { invoke } from "../../lib/tauri-invoke";

type RegenerateState = "idle" | "running" | "success" | "error";

interface PickerState {
  open: boolean;
  initialTab: "recent" | "open-new";
  initialAdapterId?: string;
}

const CLOSED_PICKER: PickerState = { open: false, initialTab: "open-new" };

export function GraphSourcesTileContent() {
  const { summary, isLoading, cancelLoad } = useGraphSourceSummary();
  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);
  const recents = useSettingsStore((s) => s.settings.sources.library.recent);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const [picker, setPicker] = useState<PickerState>(CLOSED_PICKER);
  const [regenState, setRegenState] = useState<RegenerateState>("idle");
  const [regenError, setRegenError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const isSelfGraph = activeAdapterId === "self-graph-yaml-frontmatter";

  function openPicker(tab: "recent" | "open-new" = "open-new", adapterId?: string) {
    setPicker({ open: true, initialTab: tab, initialAdapterId: adapterId });
  }

  function handleTryAgain() {
    const { settings } = useSettingsStore.getState();
    setSetting("sources.refreshToken", settings.sources.refreshToken + 1);
  }

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
      const { settings } = useSettingsStore.getState();
      setSetting("sources.refreshToken", settings.sources.refreshToken + 1);
      setTimeout(() => setRegenState("idle"), 2000);
    } catch (err) {
      setRegenError(err instanceof Error ? err.message : String(err));
      setRegenState("error");
    }
  }

  const isRunning = regenState === "running";
  const isSuccess = regenState === "success";

  // --- State machine ---
  const isEmpty = !activeAdapterId;
  const isErrorState = !isEmpty && !isLoading && summary.status === "error";
  const isLoadedState = !isEmpty && !isLoading && summary.status === "loaded";

  return (
    <div className="lw-graph-sources-tile" data-testid="graph-sources-tile-content">
      {picker.open && (
        <GraphSourcePicker
          onClose={() => setPicker(CLOSED_PICKER)}
          initialTab={picker.initialTab}
          initialAdapterId={picker.initialAdapterId}
        />
      )}

      {isEmpty && (
        <EmptyPane
          onOpenPicker={() => openPicker("open-new")}
          hasRecents={recents.length > 0}
          onOpenRecent={() => openPicker("recent")}
        />
      )}

      {!isEmpty && isLoading && (
        <div className="space-y-3 p-1">
          <div className="rounded-xl border border-cyan-400/20 bg-slate-950/70 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="animate-pulse text-cyan-400">●</span>
              Loading…
            </div>
            <div className="mt-1 text-xs text-slate-500">{summary.label || activeAdapterId}</div>
            <button
              className="mt-3 rounded border border-slate-600/40 bg-slate-900 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800"
              onClick={cancelLoad}
              data-testid="graph-sources-cancel-load-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isErrorState && (
        <div className="space-y-3 p-1">
          <div className="rounded-xl border border-red-500/30 bg-slate-950/70 p-3">
            <div className="text-sm text-red-400">Load failed</div>
            <div className="mt-2 text-xs text-red-300/70">{summary.error}</div>
            <div
              className="mt-3 flex flex-col gap-2"
              data-testid="graph-sources-error-escapes"
            >
              <button
                className="rounded border border-cyan-400/30 bg-slate-900 px-3 py-1 text-xs text-cyan-300 hover:bg-slate-800"
                onClick={handleTryAgain}
                data-testid="graph-sources-try-again-btn"
              >
                Try again
              </button>
              <button
                className="rounded border border-slate-600/40 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                onClick={() => openPicker("open-new", activeAdapterId ?? undefined)}
                data-testid="graph-sources-different-config-btn"
              >
                Different config
              </button>
              <button
                className="rounded border border-slate-600/40 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
                onClick={() => openPicker("open-new")}
                data-testid="graph-sources-different-adapter-btn"
              >
                Different adapter
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoadedState && (
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

            <button
              className="mt-3 rounded border border-slate-600/40 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800"
              onClick={() => openPicker("open-new")}
              data-testid="graph-sources-change-source-btn"
            >
              Change source
            </button>

            {isSelfGraph && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
