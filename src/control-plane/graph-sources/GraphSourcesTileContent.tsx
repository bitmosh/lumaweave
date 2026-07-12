// SPDX-License-Identifier: Apache-2.0
import { useState } from "react";
import { EmptyPane } from "./EmptyPane";
import { GraphSourcePicker } from "./GraphSourcePicker";
import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";
import { useSettingsStore } from "../settings/settings.store";
import { invoke } from "../../lib/tauri-invoke";
import type { SourceEntry } from "../settings/settings.schema";

const ADAPTER_DISPLAY_NAMES: Record<string, string> = {
  "self-graph-yaml-frontmatter": "Self Graph",
  "markdown-vault": "Markdown Vault",
  "cytoscape-json": "Cytoscape JSON",
  "package-dependency": "Package Dependencies",
  "csv-edge-list": "CSV Edge List",
  "cerebra-snapshot": "Cerebra Snapshot",
  "git-codebase": "Git Codebase",
  "website-url": "Website URL",
  "openapi-spec": "OpenAPI Spec",
  "database-schema": "Database Schema",
  "cloud-infrastructure": "Cloud Infrastructure",
  "issue-tracker": "Issue Tracker",
};

function formatRelativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type RegenerateState = "idle" | "running" | "success" | "error";

interface PickerState {
  open: boolean;
  initialTab: "recent" | "open-new";
  initialAdapterId?: string;
  reinterpretEntry?: SourceEntry;
}

const CLOSED_PICKER: PickerState = { open: false, initialTab: "open-new" };

interface LibraryEntryCardProps {
  entry: SourceEntry;
  isPinned: boolean;
  pendingDeleteId: string | null;
  onPin: () => void;
  onUnpin: () => void;
  onReinterpret: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onLoad: () => void;
  onRename: (label: string) => void;
}

function LibraryEntryCard({
  entry,
  isPinned,
  pendingDeleteId,
  onPin,
  onUnpin,
  onReinterpret,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  onLoad,
  onRename,
}: LibraryEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState("");

  const isPending = pendingDeleteId === entry.id;
  const adapterName = ADAPTER_DISPLAY_NAMES[entry.adapterId] ?? entry.adapterId;

  function startEdit() {
    setEditLabel(entry.label);
    setIsEditing(true);
  }

  function commitEdit() {
    const trimmed = editLabel.trim();
    if (trimmed && trimmed !== entry.label) onRename(trimmed);
    setIsEditing(false);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  return (
    <div
      className="rounded-lg border border-slate-700/40 bg-slate-950/50 px-3 py-2"
      data-testid={`library-entry-${entry.id}`}
    >
      {entry.thumbnailDataUrl && (
        <img
          src={entry.thumbnailDataUrl}
          alt=""
          aria-hidden
          className="mb-2 w-full rounded object-cover"
          style={{ height: "60px" }}
          data-testid={`library-entry-thumbnail-${entry.id}`}
        />
      )}
      <div className="flex items-start gap-2">
        {isEditing ? (
          <input
            className="min-w-0 flex-1 rounded border border-cyan-400/40 bg-slate-900 px-1.5 py-0.5 text-xs text-slate-200 outline-none focus:border-cyan-400/70"
            value={editLabel}
            autoFocus
            onChange={(e) => setEditLabel(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            data-testid={`library-entry-rename-input-${entry.id}`}
          />
        ) : (
          <button
            className="min-w-0 flex-1 text-start"
            onClick={onLoad}
            data-testid={`library-entry-load-${entry.id}`}
          >
            <div className="truncate text-xs font-medium text-slate-200">{entry.label}</div>
            <div className="mt-0.5 text-xs text-slate-500">
              {adapterName}
              {entry.nodeCount !== undefined ? ` · ${entry.nodeCount}n` : ""}
              {entry.edgeCount !== undefined ? ` / ${entry.edgeCount}e` : ""}
              {" · "}
              {formatRelativeTime(entry.loadedAt)}
            </div>
          </button>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <button
            className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-slate-300"
            onClick={startEdit}
            title="Rename"
            data-testid={`library-entry-rename-${entry.id}`}
          >
            ✎
          </button>
          {isPinned ? (
            <button
              className="rounded px-1.5 py-0.5 text-xs text-amber-400/70 hover:text-amber-300"
              onClick={onUnpin}
              title="Unpin"
              data-testid={`library-entry-unpin-${entry.id}`}
            >
              ★
            </button>
          ) : (
            <button
              className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-amber-400"
              onClick={onPin}
              title="Pin"
              data-testid={`library-entry-pin-${entry.id}`}
            >
              ☆
            </button>
          )}
          <button
            className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-cyan-400"
            onClick={onReinterpret}
            title="Reinterpret as…"
            data-testid={`library-entry-reinterpret-${entry.id}`}
          >
            ⇄
          </button>
          <button
            className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:text-red-400"
            onClick={onDeleteRequest}
            title="Remove from library"
            data-testid={`library-entry-delete-${entry.id}`}
          >
            ×
          </button>
        </div>
      </div>

      {isPending && (
        <div
          className="mt-2 flex items-center gap-2 rounded border border-red-500/20 bg-red-950/30 px-2 py-1 text-xs"
          data-testid={`library-entry-delete-confirm-${entry.id}`}
        >
          <span className="flex-1 text-red-300/80">Remove from library?</span>
          <button
            className="font-medium text-red-400 hover:text-red-300"
            onClick={onDeleteConfirm}
            data-testid={`library-entry-delete-yes-${entry.id}`}
          >
            Remove
          </button>
          <button
            className="text-slate-400 hover:text-slate-300"
            onClick={onDeleteCancel}
            data-testid={`library-entry-delete-cancel-${entry.id}`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export function GraphSourcesTileContent() {
  const { summary, isLoading, cancelLoad } = useGraphSourceSummary();
  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);
  const pinned = useSettingsStore((s) => s.settings.sources.library.pinned);
  const recents = useSettingsStore((s) => s.settings.sources.library.recent);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const commitSource = useSettingsStore((s) => s.commitSource);
  const pinLibraryEntry = useSettingsStore((s) => s.pinLibraryEntry);
  const unpinLibraryEntry = useSettingsStore((s) => s.unpinLibraryEntry);
  const removeLibraryEntry = useSettingsStore((s) => s.removeLibraryEntry);
  const renameLibraryEntry = useSettingsStore((s) => s.renameLibraryEntry);

  const [picker, setPicker] = useState<PickerState>(CLOSED_PICKER);
  const [regenState, setRegenState] = useState<RegenerateState>("idle");
  const [regenError, setRegenError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const isSelfGraph = activeAdapterId === "self-graph-yaml-frontmatter";
  const hasLibrary = pinned.length > 0 || recents.length > 0;

  function openPicker(tab: "recent" | "open-new" = "open-new", adapterId?: string) {
    setPicker({ open: true, initialTab: tab, initialAdapterId: adapterId });
  }

  function openPickerReinterpret(entry: SourceEntry) {
    setPicker({ open: true, initialTab: "open-new", initialAdapterId: entry.adapterId, reinterpretEntry: entry });
  }

  function handleTryAgain() {
    const { settings } = useSettingsStore.getState();
    setSetting("sources.refreshToken", settings.sources.refreshToken + 1);
  }

  function handleLoadEntry(entry: SourceEntry) {
    commitSource(entry.adapterId, entry.config);
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
          reinterpretEntry={picker.reinterpretEntry}
        />
      )}

      {isEmpty && !hasLibrary && (
        <EmptyPane
          onOpenPicker={() => openPicker("open-new")}
          hasRecents={false}
          onOpenRecent={() => openPicker("recent")}
        />
      )}

      {isEmpty && hasLibrary && (
        <div className="p-1">
          <button
            className="mb-3 w-full rounded border border-cyan-400/30 bg-slate-900 px-3 py-1.5 text-xs text-cyan-300 hover:bg-slate-800"
            onClick={() => openPicker("open-new")}
            data-testid="graph-sources-open-new-btn"
          >
            + Open a graph source
          </button>
        </div>
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

      {/* SA-010: Library sections — always visible when entries exist */}
      {hasLibrary && (
        <div className="mt-1 space-y-3 px-1 pb-2" data-testid="graph-sources-library">
          {pinned.length > 0 && (
            <div data-testid="graph-sources-library-pinned">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Pinned
              </div>
              <div className="space-y-1.5">
                {pinned.map((entry) => (
                  <LibraryEntryCard
                    key={entry.id}
                    entry={entry}
                    isPinned
                    pendingDeleteId={pendingDeleteId}
                    onLoad={() => handleLoadEntry(entry)}
                    onPin={() => {}}
                    onUnpin={() => unpinLibraryEntry(entry.id)}
                    onReinterpret={() => openPickerReinterpret(entry)}
                    onDeleteRequest={() => setPendingDeleteId(entry.id)}
                    onDeleteConfirm={() => { removeLibraryEntry(entry.id); setPendingDeleteId(null); }}
                    onDeleteCancel={() => setPendingDeleteId(null)}
                    onRename={(label) => renameLibraryEntry(entry.id, label)}
                  />
                ))}
              </div>
            </div>
          )}

          {recents.length > 0 && (
            <div data-testid="graph-sources-library-recent">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Recent
              </div>
              <div className="space-y-1.5">
                {recents.map((entry) => (
                  <LibraryEntryCard
                    key={entry.id}
                    entry={entry}
                    isPinned={false}
                    pendingDeleteId={pendingDeleteId}
                    onLoad={() => handleLoadEntry(entry)}
                    onPin={() => pinLibraryEntry(entry.id)}
                    onUnpin={() => {}}
                    onReinterpret={() => openPickerReinterpret(entry)}
                    onDeleteRequest={() => setPendingDeleteId(entry.id)}
                    onDeleteConfirm={() => { removeLibraryEntry(entry.id); setPendingDeleteId(null); }}
                    onDeleteCancel={() => setPendingDeleteId(null)}
                    onRename={(label) => renameLibraryEntry(entry.id, label)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
