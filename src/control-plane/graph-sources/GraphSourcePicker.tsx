// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdapterConfigForm } from "../../source-adapter/AdapterConfigForm";
import { getAdapterConfigForm } from "../../source-adapter/adapterConfigFormRegistry";
import {
  getAllSourceAdapterEntries,
  getSourceAdapterEntryById,
  scanTarget,
  type AdapterCategory,
  type ScanCandidate,
  type SourceAdapterEntry,
} from "../../source-adapter/sourceAdapterRegistry";
import { useSettingsStore } from "../settings/settings.store";
import type { AdapterConfig } from "../../source-adapter/baseSourceAdapter";
import type { SourceEntry } from "../settings/settings.schema";
// GraphSourcePicker.css is imported by AppShell, not here — see the note at its import site.

// Importing sourceAdapterRegistry above is enough to pull in all adapter files
// and their config-form side effects transitively.

// SA-003b: match a typed path's extension against a glob-style inputPattern.pattern.
// Supports *.ext, **/*.ext, **/*.{a,b,c}, and exact basename matches (e.g. package.json).
function patternMatchesPath(pattern: string, filePath: string): boolean {
  const basename = filePath.split(/[\\/]/).pop() ?? filePath;
  // Expand brace alternatives: **/*.{json,yaml} → ["**/*.json", "**/*.yaml"]
  let patterns: string[];
  const braceMatch = pattern.match(/^(.*)\{([^}]+)\}(.*)$/);
  if (braceMatch) {
    const [, prefix, inner, suffix] = braceMatch;
    patterns = inner.split(",").map((s) => `${prefix}${s.trim()}${suffix}`);
  } else {
    patterns = [pattern];
  }
  return patterns.some((p) => {
    // Exact basename match (e.g. "package.json", "Cargo.toml")
    if (!p.includes("*")) return basename === p;
    // Extension glob: *.ext or **/*.ext
    const dotIdx = p.lastIndexOf(".");
    if (dotIdx >= 0) {
      const ext = p.slice(dotIdx); // e.g. ".json"
      return basename.endsWith(ext);
    }
    return false;
  });
}

function getExtensionSuggestions(
  path: string,
  allAdapters: readonly SourceAdapterEntry[],
): SourceAdapterEntry[] {
  const trimmed = path.trim();
  if (!trimmed || trimmed.length < 3) return [];
  return allAdapters.filter(
    (a) =>
      a.category === "file-based" &&
      a.status !== "candidate" &&
      patternMatchesPath(a.inputPattern.pattern, trimmed),
  );
}

// SA-003b / file-picker: open native OS file/folder dialog when running in Tauri.
async function openFilePicker(options: { directory: boolean }): Promise<string | null> {
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: options.directory, multiple: false });
    if (typeof result === "string") return result;
    return null;
  } catch {
    return null;
  }
}

// True when running inside Tauri (not Playwright / plain browser).
const isTauriRuntime =
  typeof window !== "undefined" &&
  !(window as any).PLAYWRIGHT &&
  !!(window as any).__TAURI_INTERNALS__;

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

const CATEGORY_ORDER: AdapterCategory[] = ["file-based", "directory-based", "database", "stream"];
const CATEGORY_LABELS: Record<AdapterCategory, string> = {
  "file-based": "File",
  "directory-based": "Directory",
  "database": "Database",
  "stream": "Stream",
};

function isConfigValid(
  adapterId: string,
  configurations: Record<string, AdapterConfig>,
  adapterStatus: string,
): boolean {
  if (adapterStatus === "candidate") return false;
  const config = configurations[adapterId] as any;
  const hasForm = !!getAdapterConfigForm(adapterId);
  if (!hasForm) return true; // no config form = no config needed
  if (!config) return false;
  switch (adapterId) {
    case "markdown-vault": return !!config.vaultRoot?.trim();
    case "cytoscape-json": return !!config.filePath?.trim();
    case "package-dependency": return !!config.projectPath?.trim();
    case "csv-edge-list": return !!config.filePath?.trim();
    case "cerebra-snapshot": return !!config.filePath?.trim();
    default: return Object.keys(config).length > 1;
  }
}

function formatRelativeTime(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface GraphSourcePickerProps {
  onClose: () => void;
  initialTab?: "recent" | "open-new";
  initialAdapterId?: string;
  reinterpretEntry?: SourceEntry;
}

export function GraphSourcePicker({ onClose, initialTab, initialAdapterId, reinterpretEntry }: GraphSourcePickerProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "open-new">(initialTab ?? "open-new");
  const [selectedAdapterId, setSelectedAdapterId] = useState<string | null>(
    reinterpretEntry?.adapterId ?? initialAdapterId ?? null,
  );
  const [scanPath, setScanPath] = useState("");
  const [scanState, setScanState] = useState<"idle" | "running" | "done">("idle");
  const [scanResults, setScanResults] = useState<ScanCandidate[]>([]);
  const [showAllAdapters, setShowAllAdapters] = useState(false);
  const [extSuggestions, setExtSuggestions] = useState<SourceAdapterEntry[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [renamingRecentId, setRenamingRecentId] = useState<string | null>(null);
  const [renamingLabel, setRenamingLabel] = useState("");

  const recents = useSettingsStore((s) => s.settings.sources.library.recent);
  const devMode = useSettingsStore((s) => s.settings.developer.devMode);
  const commitSource = useSettingsStore((s) => s.commitSource);
  const renameLibraryEntry = useSettingsStore((s) => s.renameLibraryEntry);

  // Draft config layer. Every edit in this modal — typing in a config form, picking a scan
  // candidate, pre-filling for reinterpret — lands here and NOWHERE else. Persisted settings
  // are only touched by commitSource() on Load. That is what makes Cancel/✕/Escape true:
  // closing the picker discards the drafts with the component, leaving the working source
  // exactly as the user found it.
  //
  // Seeded from the store so an existing config is visible for editing. SA-024 reinterpret
  // seeds the entry's own config instead, so the path survives the adapter swap.
  const [draftConfigs, setDraftConfigs] = useState<Record<string, AdapterConfig>>(() => {
    const seed = { ...useSettingsStore.getState().settings.sources.configurations };
    if (reinterpretEntry) seed[reinterpretEntry.adapterId] = reinterpretEntry.config;
    return seed;
  });

  const backdropRef = useRef<HTMLDivElement>(null);

  function updateDraft(adapterId: string, next: AdapterConfig) {
    setDraftConfigs((prev) => ({ ...prev, [adapterId]: next }));
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  function handleLoad() {
    if (!selectedAdapterId) return;
    commitSource(selectedAdapterId, draftConfigs[selectedAdapterId]);
    onClose();
  }

  function handleLoadRecent(entry: SourceEntry) {
    commitSource(entry.adapterId, entry.config);
    onClose();
  }

  function handleScanPathChange(value: string) {
    setScanPath(value);
    setExtSuggestions(getExtensionSuggestions(value, allAdapters));
  }

  async function handleScan() {
    const t = scanPath.trim();
    if (!t) return;
    setScanState("running");
    setScanResults([]);
    setShowAllAdapters(false);
    setExtSuggestions([]);
    try {
      const results = await scanTarget(t);
      setScanResults(results);
    } catch {
      setScanResults([]);
    }
    setScanState("done");
  }

  async function handleBrowseFile() {
    const result = await openFilePicker({ directory: false });
    if (result) {
      handleScanPathChange(result);
    }
  }

  async function handleBrowseDirectory() {
    const result = await openFilePicker({ directory: true });
    if (result) {
      handleScanPathChange(result);
    }
  }

  function handleSelectCandidate(candidate: ScanCandidate) {
    updateDraft(candidate.adapterId, {
      ...draftConfigs[candidate.adapterId],
      ...candidate.suggestedConfig,
      adapterId: candidate.adapterId,
    } as AdapterConfig);
    setSelectedAdapterId(candidate.adapterId);
    // Deliberately NOT clearing scanResults/scanState: the ranked candidate list stays on
    // screen so the user can compare, reconsider, and pick the runner-up without re-scanning.
    // "Automated decisions are inspectable — selection reversible" (GRAPH_SOURCE_UX.md).
  }

  const allAdapters = getAllSourceAdapterEntries();

  const selectedEntry = selectedAdapterId
    ? getSourceAdapterEntryById(selectedAdapterId)
    : undefined;

  // Validate the draft — that is what Load commits. Reading the store here would enable
  // Load on a stale persisted config the user has since edited away.
  const canLoad =
    !!selectedAdapterId &&
    !!selectedEntry &&
    isConfigValid(selectedAdapterId, draftConfigs, selectedEntry.status);

  return createPortal(
    <div
      className="lw-picker__backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      data-testid="graph-source-picker-backdrop"
    >
      <div className="lw-picker__modal" role="dialog" aria-modal="true" aria-label="Select graph source">
        <div className="lw-picker__header">
          <span className="lw-picker__title">Select Graph Source</span>
          <button
            className="lw-picker__close"
            onClick={onClose}
            aria-label="Close"
            data-testid="graph-source-picker-close"
          >
            ✕
          </button>
        </div>

        <div className="lw-picker__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "recent"}
            className={`lw-picker__tab${activeTab === "recent" ? " lw-picker__tab--active" : ""}`}
            onClick={() => { setActiveTab("recent"); setScanState("idle"); setScanResults([]); }}
            data-testid="graph-source-picker-tab-recent"
          >
            Recent
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "open-new"}
            className={`lw-picker__tab${activeTab === "open-new" ? " lw-picker__tab--active" : ""}`}
            onClick={() => setActiveTab("open-new")}
            data-testid="graph-source-picker-tab-open-new"
          >
            Open new
          </button>
        </div>

        <div className="lw-picker__body">
          {activeTab === "recent" && (
            <div className="lw-picker__recents">
              {recents.length === 0 ? (
                <p className="lw-picker__empty-recents">No recent sources yet.</p>
              ) : (
                recents.map((entry) => (
                  <div key={entry.id} className="lw-picker__recent-row">
                    {renamingRecentId === entry.id ? (
                      <input
                        className="lw-picker__recent-rename-input"
                        value={renamingLabel}
                        autoFocus
                        onChange={(e) => setRenamingLabel(e.target.value)}
                        onBlur={() => {
                          const trimmed = renamingLabel.trim();
                          if (trimmed && trimmed !== entry.label) renameLibraryEntry(entry.id, trimmed);
                          setRenamingRecentId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const trimmed = renamingLabel.trim();
                            if (trimmed && trimmed !== entry.label) renameLibraryEntry(entry.id, trimmed);
                            setRenamingRecentId(null);
                          }
                          if (e.key === "Escape") setRenamingRecentId(null);
                        }}
                        data-testid={`graph-source-recent-rename-input-${entry.id}`}
                      />
                    ) : (
                      <button
                        className="lw-picker__recent-entry"
                        onClick={() => handleLoadRecent(entry)}
                        data-testid={`graph-source-recent-${entry.id}`}
                      >
                        <span className="lw-picker__recent-label">{entry.label}</span>
                        <span className="lw-picker__recent-meta">
                          {ADAPTER_DISPLAY_NAMES[entry.adapterId] ?? entry.adapterId}
                          {entry.nodeCount !== undefined && (
                            <> · {entry.nodeCount} nodes</>
                          )}
                          · {formatRelativeTime(entry.loadedAt)}
                        </span>
                      </button>
                    )}
                    <button
                      className="lw-picker__recent-rename-btn"
                      title="Rename"
                      onClick={(e) => { e.stopPropagation(); setRenamingLabel(entry.label); setRenamingRecentId(entry.id); }}
                      data-testid={`graph-source-recent-rename-${entry.id}`}
                    >
                      ✎
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "open-new" && (
            <div className="lw-picker__open-new">
              {/* Scan row */}
              <div className="lw-picker__scan">
                <input
                  className="lw-picker__scan-input"
                  type="text"
                  placeholder="Paste a file or directory path to scan…"
                  value={scanPath}
                  onChange={(e) => handleScanPathChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && scanPath.trim()) void handleScan(); }}
                  data-testid="graph-source-scan-input"
                />
                <button
                  className="lw-picker__scan-btn"
                  onClick={() => void handleScan()}
                  disabled={!scanPath.trim() || scanState === "running"}
                  data-testid="graph-source-scan-btn"
                >
                  {scanState === "running" ? "Scanning…" : "Scan"}
                </button>
              </div>
              {isTauriRuntime && (
                <div className="lw-picker__browse-row">
                  <button
                    className="lw-picker__browse-btn"
                    onClick={() => void handleBrowseFile()}
                    data-testid="graph-source-browse-file-btn"
                  >
                    Browse file…
                  </button>
                  <button
                    className="lw-picker__browse-btn"
                    onClick={() => void handleBrowseDirectory()}
                    data-testid="graph-source-browse-dir-btn"
                  >
                    Browse folder…
                  </button>
                </div>
              )}

              {/* SA-003b: extension-based adapter suggestions */}
              {extSuggestions.length > 0 && scanState === "idle" && (
                <div className="lw-picker__ext-suggestions" data-testid="graph-source-ext-suggestions">
                  <span className="lw-picker__ext-suggestions-label">Detected:</span>
                  {extSuggestions.map((adapter) => (
                    <button
                      key={adapter.adapterId}
                      className="lw-picker__ext-suggestion-chip"
                      onClick={() => setSelectedAdapterId(adapter.adapterId)}
                      data-testid={`graph-source-ext-suggestion-${adapter.adapterId}`}
                    >
                      {ADAPTER_DISPLAY_NAMES[adapter.adapterId] ?? adapter.adapterId}
                    </button>
                  ))}
                </div>
              )}

              {/* Scan results */}
              {scanState === "done" && scanResults.length > 0 && (
                <div className="lw-picker__scan-results" data-testid="graph-source-scan-results">
                  <div className="lw-picker__scan-results-header">
                    Scan results for <code className="lw-picker__scan-path-preview">{scanPath}</code>
                  </div>
                  {scanResults.map((candidate) => {
                    const isSelected = selectedAdapterId === candidate.adapterId;
                    return (
                      <div
                        key={candidate.adapterId}
                        className={`lw-picker__scan-candidate-row${isSelected ? " lw-picker__scan-candidate-row--selected" : ""}`}
                      >
                        {/* The row is a div so the config form can live outside the button —
                            nesting form controls inside a <button> is invalid and breaks input. */}
                        <button
                          className="lw-picker__scan-candidate"
                          aria-pressed={isSelected}
                          onClick={() => handleSelectCandidate(candidate)}
                          data-testid={`graph-source-scan-candidate-${candidate.adapterId}`}
                        >
                          <div className="lw-picker__scan-candidate-header">
                            <span className="lw-picker__scan-candidate-name">
                              {ADAPTER_DISPLAY_NAMES[candidate.adapterId] ?? candidate.adapterId}
                            </span>
                            <span className={`lw-picker__score-badge lw-picker__score-badge--${candidate.scoreLabel.replace(/ /g, "-")}`}>
                              {candidate.scoreLabel}
                            </span>
                          </div>
                          <span className="lw-picker__scan-candidate-reason">{candidate.reason}</span>
                        </button>
                        {isSelected && (
                          <div
                            className="lw-picker__config-area"
                            data-testid={`graph-source-scan-candidate-config-${candidate.adapterId}`}
                          >
                            <AdapterConfigForm
                              adapterId={candidate.adapterId}
                              config={draftConfigs[candidate.adapterId]}
                              onChange={(next) => updateDraft(candidate.adapterId, next)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {!showAllAdapters && (
                    <button
                      className="lw-picker__show-all-btn"
                      onClick={() => setShowAllAdapters(true)}
                      data-testid="graph-source-show-all-adapters-btn"
                    >
                      Different type ↓
                    </button>
                  )}
                </div>
              )}

              {scanState === "done" && scanResults.length === 0 && (
                <p className="lw-picker__scan-no-match" data-testid="graph-source-scan-no-match">
                  No adapter recognized this path — pick one manually
                </p>
              )}

              {/* Adapter list — shown when: scan idle, no results, or "Different type" expanded */}
              {(scanState !== "done" || scanResults.length === 0 || showAllAdapters) && (
                <div className="lw-picker__adapter-list">
                  {CATEGORY_ORDER.map((category) => {
                    const group = allAdapters.filter((a) => a.category === category);
                    if (group.length === 0) return null;
                    return (
                      <div key={category} className="lw-picker__category">
                        <div className="lw-picker__category-label">
                          {CATEGORY_LABELS[category]}
                        </div>
                        {group.map((adapter) => {
                          const isCandidate = adapter.status === "candidate";
                          const isSelected = selectedAdapterId === adapter.adapterId;
                          return (
                            <div
                              key={adapter.adapterId}
                              className={[
                                "lw-picker__adapter-card",
                                isSelected ? "lw-picker__adapter-card--selected" : "",
                                isCandidate ? "lw-picker__adapter-card--candidate" : "",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                              onClick={() => !isCandidate && setSelectedAdapterId(adapter.adapterId)}
                              data-testid={`graph-source-adapter-card-${adapter.adapterId}`}
                            >
                              <div className="lw-picker__adapter-card-header">
                                <span className="lw-picker__adapter-name">
                                  {ADAPTER_DISPLAY_NAMES[adapter.adapterId] ?? adapter.adapterId}
                                </span>
                                {isCandidate && (
                                  <span className="lw-picker__adapter-badge">Coming soon</span>
                                )}
                              </div>
                              {adapter.formatHint && (
                                <p className="lw-picker__adapter-hint">{adapter.formatHint}</p>
                              )}
                              {isSelected && !isCandidate && (
                                <div className="lw-picker__config-area">
                                  <AdapterConfigForm
                                    adapterId={adapter.adapterId}
                                    config={draftConfigs[adapter.adapterId]}
                                    onChange={(next) => updateDraft(adapter.adapterId, next)}
                                  />
                                  {devMode && (
                                    <div className="lw-picker__advanced" data-testid="graph-source-picker-advanced">
                                      <button
                                        className="lw-picker__advanced-toggle"
                                        onClick={(e) => { e.stopPropagation(); setAdvancedOpen((v) => !v); }}
                                        data-testid="graph-source-picker-advanced-toggle"
                                      >
                                        Advanced {advancedOpen ? "▲" : "▼"}
                                      </button>
                                      {advancedOpen && (
                                        <pre className="lw-picker__advanced-json" data-testid="graph-source-picker-advanced-json">
                                          {JSON.stringify(
                                            {
                                              adapterId: adapter.adapterId,
                                              inputPattern: adapter.inputPattern,
                                              // The draft — i.e. what Load would actually commit.
                                              config: draftConfigs[adapter.adapterId] ?? {},
                                            },
                                            null,
                                            2,
                                          )}
                                        </pre>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lw-picker__footer">
          <button
            className="lw-picker__cancel-btn"
            onClick={onClose}
            data-testid="graph-source-picker-cancel"
          >
            Cancel
          </button>
          {activeTab === "open-new" && (
            <button
              className="lw-picker__load-btn"
              onClick={handleLoad}
              disabled={!canLoad}
              data-testid="graph-source-picker-load"
            >
              {reinterpretEntry ? "Load with this adapter" : "Load"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
