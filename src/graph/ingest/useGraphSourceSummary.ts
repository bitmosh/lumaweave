import { useEffect, useRef, useState } from "react";
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

  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);
  const refreshToken = useSettingsStore((s) => s.settings.sources.refreshToken);

  const prevAdapterIdRef = useRef<string | null>(null);
  const causationIdRef = useRef<string | null>(null);

  // Listen for Cerebra GraphSnapshotAvailable events forwarded from the Rust watcher.
  // On receipt: stash causation_id, configure the cerebra-snapshot adapter, then
  // switch to it — the active-adapter change re-triggers the load effect below.
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<GsaPayload>("cerebra:snapshot-available", (ev) => {
          causationIdRef.current = ev.payload.causation_id;
          const { setSetting } = useSettingsStore.getState();
          setSetting("sources.configurations.cerebra-snapshot", {
            adapterId: "cerebra-snapshot",
            filePath: ev.payload.snapshot_ref,
          });
          setSetting("sources.active", "cerebra-snapshot");
        });
      } catch {
        // Not in Tauri environment — no-op
      }
    })();
    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const prevAdapterId = prevAdapterIdRef.current;
    prevAdapterIdRef.current = activeAdapterId;

    if (prevAdapterId !== null && prevAdapterId !== activeAdapterId && activeAdapterId) {
      invokeEmitSourceSwitched(prevAdapterId, activeAdapterId).catch(() => {});
    }

    async function loadSummary() {
      setSummary((prev) => ({ ...prev, status: "loading" }));
      setError(null);

      try {
        const result = await loadSource(activeAdapterId);
        if (isMounted) {
          setSummary(result);
          if (result.status === "error") {
            setError(result.error || "Unknown error");
            invokeEmitSourceLoadFailed(
              activeAdapterId ?? "",
              result.sourcePath,
              result.error ?? "unknown error",
            ).catch(() => {});
          } else {
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
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
          setSummary((prev) => ({
            ...prev,
            status: "error",
            error: errorMessage,
          }));
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

  return { summary, error };
}
