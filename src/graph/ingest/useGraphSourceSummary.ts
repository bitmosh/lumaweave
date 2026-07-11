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

export function useGraphSourceSummary() {
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
  }, []);

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

    if (prevAdapterId !== null && prevAdapterId !== activeAdapterId && activeAdapterId) {
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
            invokeEmitSourceLoadFailed(
              activeAdapterId ?? "",
              result.sourcePath,
              result.error ?? "unknown error",
            ).catch(() => {});
          } else {
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
          invokeEmitSourceLoadFailed(
            activeAdapterId ?? "",
            "",
            errorMessage,
          ).catch(() => {});
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  // refreshToken is incremented by Regenerate button to re-trigger after script runs
  }, [activeAdapterId, refreshToken]);

  return { summary, error, isLoading, cancelLoad };
}
