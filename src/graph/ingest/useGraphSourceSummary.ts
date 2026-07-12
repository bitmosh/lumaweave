// SPDX-License-Identifier: Apache-2.0
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettingsStore } from "../../control-plane/settings/settings.store";
import {
  invokeEmitSourceLoadFailed,
  invokeEmitSourceLoaded,
  invokeEmitSourceSwitched,
} from "../../lib/tauri-invoke";
import type { GraphSourceSummary } from "../schema/graph.types";
import { loadSource } from "./loadSource";

interface GsaPayload {
  snapshot_ref: string;
  lineage_id: string;
  graph_version: number;
  causation_id: string;
}

const idleState: GraphSourceSummary = {
  sourceId: "",
  label: "",
  sourcePath: "",
  publicBaseUrl: "",
  status: "idle",
  graphPresent: false,
  manifestPresent: false,
  reportPresent: false,
  nodeCount: 0,
  edgeCount: 0,
  normalizedNodeCount: 0,
  normalizedEdgeCount: 0,
  warnings: [],
};

interface UseGraphSourceSummaryOptions {
  /**
   * Exactly one consumer must be the owner. The owner — and only the owner — fires this
   * hook's side effects: pushing to the source library, emitting the Tauri source events,
   * and listening for Cerebra snapshots.
   *
   * This hook is instantiated four times in the default layout (AppShell, the Graph Sources
   * tile, StatusCluster, GraphInspectorTileContent), and each instance holds its own state
   * and its own effects. Unguarded, that means one load emits sourceLoaded four times and
   * pushes the same library entry four times, and — worst — a single Cerebra snapshot event
   * is received by four listeners, each calling commitSource(), each bumping refreshToken,
   * producing a reload storm. (That last one was latent while an unchanged sources.active
   * silently no-opped; giving commitSource a real refreshToken bump armed it.)
   *
   * AppShell is the owner. The remaining consumers are read-only views of the summary.
   *
   * Note this does NOT yet dedupe loadSource() itself — four instances still each read the
   * source. That is wasteful but not incorrect (it is a pure read), and collapsing it
   * requires hoisting the state to a single owner, which is the follow-up refactor.
   */
  owner?: boolean;
}

export function useGraphSourceSummary({ owner = false }: UseGraphSourceSummaryOptions = {}) {
  const [summary, setSummary] = useState<GraphSourceSummary>(idleState);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);
  const refreshToken = useSettingsStore((s) => s.settings.sources.refreshToken);

  const prevAdapterIdRef = useRef<string | null>(null);
  const causationIdRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);
  const prevSummaryRef = useRef<GraphSourceSummary>(idleState);

  // Listen for Cerebra GraphSnapshotAvailable events forwarded from the Rust watcher.
  // On receipt: stash causation_id, then commit the new snapshot as the active source.
  // commitSource bumps refreshToken, so a *second* snapshot arriving while
  // cerebra-snapshot is already active still re-triggers the load effect below.
  useEffect(() => {
    if (!owner) return;
    let unlisten: (() => void) | null = null;
    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<GsaPayload>("cerebra:snapshot-available", (ev) => {
          causationIdRef.current = ev.payload.causation_id;
          useSettingsStore.getState().commitSource("cerebra-snapshot", {
            adapterId: "cerebra-snapshot",
            filePath: ev.payload.snapshot_ref,
          });
        });
      } catch {
        // Not in Tauri environment — no-op
      }
    })();
    return () => {
      unlisten?.();
    };
  }, [owner]);

  const cancelLoad = useCallback(() => {
    cancelledRef.current = true;
    setSummary(prevSummaryRef.current);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    cancelledRef.current = false;

    const prevAdapterId = prevAdapterIdRef.current;
    prevAdapterIdRef.current = activeAdapterId;

    if (owner && prevAdapterId !== null && prevAdapterId !== activeAdapterId && activeAdapterId) {
      invokeEmitSourceSwitched(prevAdapterId, activeAdapterId).catch(() => {});
    }

    async function loadSummary() {
      // Capture prev summary atomically before transitioning to loading
      setSummary((prev) => {
        prevSummaryRef.current = prev;
        return { ...prev, status: "loading" };
      });
      setIsLoading(true);
      setError(null);

      try {
        const result = await loadSource(activeAdapterId);
        if (isMounted && !cancelledRef.current) {
          setSummary(result);
          setIsLoading(false);
          if (result.status === "error") {
            setError(result.error || "Unknown error");
            if (owner) {
              invokeEmitSourceLoadFailed(
                activeAdapterId ?? "",
                result.sourcePath,
                result.error ?? "unknown error",
              ).catch(() => {});
            }
          } else if (owner) {
            // SA-009: push SourceEntry to library on successful load
            if (activeAdapterId) {
              const { settings, pushLibraryEntry } = useSettingsStore.getState();
              pushLibraryEntry({
                adapterId: activeAdapterId,
                config: settings.sources.configurations[activeAdapterId] ?? { adapterId: activeAdapterId },
                label: result.label,
                loadedAt: new Date().toISOString(),
                nodeCount: result.normalizedNodeCount,
                edgeCount: result.normalizedEdgeCount,
              });
            }
            const causationId = causationIdRef.current;
            causationIdRef.current = null;
            invokeEmitSourceLoaded(
              activeAdapterId ?? "",
              result.sourcePath,
              result.nodeCount,
              result.edgeCount,
              causationId,
            ).catch(() => {});
          }
        }
      } catch (err) {
        if (isMounted && !cancelledRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
          setSummary((prev) => ({
            ...prev,
            status: "error",
            error: errorMessage,
          }));
          setIsLoading(false);
          if (owner) {
            invokeEmitSourceLoadFailed(
              activeAdapterId ?? "",
              "",
              errorMessage,
            ).catch(() => {});
          }
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  // refreshToken is incremented by Regenerate button to re-trigger after script runs
  }, [activeAdapterId, refreshToken, owner]);

  return { summary, error, isLoading, cancelLoad };
}
