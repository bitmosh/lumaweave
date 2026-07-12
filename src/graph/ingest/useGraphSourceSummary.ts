// SPDX-License-Identifier: Apache-2.0
import { useEffect } from "react";
import { create } from "zustand";
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

/**
 * The source lifecycle has exactly one owner.
 *
 * It used to be a plain hook with local useState, instantiated four times (AppShell, the
 * Graph Sources tile, StatusCluster, GraphInspectorTileContent). Four copies of the state
 * meant four independent loads per switch — eight under StrictMode — and, worse, four
 * different answers to "what am I looking at". `cancelLoad` flipped one of the four refs, so
 * cancelling muted the tile while the canvas and the topbar happily finished loading the
 * graph you had just cancelled. The tile owned the controls for a lifecycle it did not own
 * the state of.
 *
 * Now: one Zustand store, one `useGraphSourceLifecycle()` (mounted once, in AppShell), and
 * `useGraphSourceSummary()` as a read-only view that every consumer — including AppShell —
 * subscribes to.
 */
interface GraphSourceState {
  summary: GraphSourceSummary;
  error: string | null;
  isLoading: boolean;
  cancelLoad: () => void;
}

// Lifecycle bookkeeping. Module-level is safe *because* there is exactly one lifecycle — but
// it must survive React StrictMode, which mounts, cleans up, and mounts every effect again in
// dev (and dev is what Playwright runs). Anything here that a second invocation could consume
// or corrupt has to be idempotent. See `skipLoadFor`.
let prevSummary: GraphSourceSummary = idleState;
let prevAdapterId: string | null = null;
let causationId: string | null = null;

// The adapter that produced `prevSummary` — i.e. the one cancelLoad must return to.
//
// This is NOT prevAdapterId. That is overwritten with the *incoming* adapter the moment a
// load starts, so by the time the user hits Cancel it already names the adapter being
// cancelled, and reverting to it is a no-op. The restore point has to be captured alongside
// the summary it belongs to, at the same instant, under the same status guard.
let restoreAdapterId: string | null = null;

// Bumped by cancelLoad. An in-flight load captures the value at its start and discards its
// own result if the sequence has moved on. Replaces the old per-instance `cancelledRef`.
let cancelSeq = 0;

// Set by cancelLoad when it reverts sources.active, so that the revert does not itself kick
// off a fresh load of the source we just returned to.
//
// Keyed on (adapterId, refreshToken) rather than being a boolean, and deliberately never
// cleared: a boolean would be consumed by StrictMode's first effect invocation and let the
// second one load anyway. A stale key is harmless — every real commit path goes through
// commitSource(), which always bumps refreshToken, so a genuine load can never match it.
let skipLoadFor: { adapterId: string | null; refreshToken: number } | null = null;

export const useGraphSourceStore = create<GraphSourceState>((set) => ({
  summary: idleState,
  error: null,
  isLoading: false,

  cancelLoad: () => {
    // Not a true abort: loadSource() takes no AbortSignal, so the in-flight read runs to
    // completion and its result is discarded. Cancelling is therefore about restoring the
    // user's world, not about stopping the disk. Making it a real abort means threading a
    // signal through every adapter's load(config) — a separate change.
    cancelSeq += 1;

    const { settings, setSetting } = useSettingsStore.getState();

    // Revert the active adapter as well. Restoring the previous summary while sources.active
    // still points at the adapter we just cancelled leaves the store and the screen telling
    // two different stories — the source switch would have "happened" despite the cancel.
    if (settings.sources.active !== restoreAdapterId) {
      skipLoadFor = {
        adapterId: restoreAdapterId,
        refreshToken: settings.sources.refreshToken,
      };
      setSetting("sources.active", restoreAdapterId);
    }

    set({ summary: prevSummary, isLoading: false, error: null });
  },
}));

/**
 * Read-only view of the source lifecycle. Safe to call from any number of components.
 */
export function useGraphSourceSummary() {
  const summary = useGraphSourceStore((s) => s.summary);
  const error = useGraphSourceStore((s) => s.error);
  const isLoading = useGraphSourceStore((s) => s.isLoading);
  const cancelLoad = useGraphSourceStore((s) => s.cancelLoad);
  return { summary, error, isLoading, cancelLoad };
}

/**
 * Drives the lifecycle. Must be mounted exactly once — AppShell does it.
 */
export function useGraphSourceLifecycle() {
  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);
  const refreshToken = useSettingsStore((s) => s.settings.sources.refreshToken);

  // Listen for Cerebra GraphSnapshotAvailable events forwarded from the Rust watcher.
  // On receipt: stash causation_id, then commit the new snapshot as the active source.
  // commitSource bumps refreshToken, so a *second* snapshot arriving while cerebra-snapshot
  // is already active still re-triggers the load effect below.
  useEffect(() => {
    let unlisten: (() => void) | null = null;
    (async () => {
      try {
        const { listen } = await import("@tauri-apps/api/event");
        unlisten = await listen<GsaPayload>("cerebra:snapshot-available", (ev) => {
          causationId = ev.payload.causation_id;
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

  useEffect(() => {
    if (
      skipLoadFor &&
      skipLoadFor.adapterId === activeAdapterId &&
      skipLoadFor.refreshToken === refreshToken
    ) {
      prevAdapterId = activeAdapterId;
      return;
    }

    let isMounted = true;
    const seq = cancelSeq;
    const live = () => isMounted && seq === cancelSeq;

    const from = prevAdapterId;
    prevAdapterId = activeAdapterId;

    if (from !== null && from !== activeAdapterId && activeAdapterId) {
      invokeEmitSourceSwitched(from, activeAdapterId).catch(() => {});
    }

    async function loadSummary() {
      const current = useGraphSourceStore.getState().summary;

      // Capture the restore point: the summary on screen right now, and the adapter that
      // produced it. `from` — not prevAdapterId, which we already advanced to the incoming
      // adapter above.
      //
      // The status guard does double duty. It stops StrictMode's second invocation from
      // capturing the first invocation's {status: "loading"} as "the state to go back to",
      // and it stops a rapid second switch from overwriting a good restore point with an
      // in-flight one.
      if (current.status !== "loading") {
        prevSummary = current;
        restoreAdapterId = from;
      }

      // The {...current} spread is load-bearing: it RETAINS normalizedNodes, so a load over
      // an existing graph keeps that graph on screen (and keeps AppShell's fixture gate from
      // flipping and flashing the built-in self-graph mid-switch). Do not "clean this up".
      useGraphSourceStore.setState({
        summary: { ...current, status: "loading" },
        isLoading: true,
        error: null,
      });

      try {
        const result = await loadSource(activeAdapterId);
        if (!live()) return;

        useGraphSourceStore.setState({ summary: result, isLoading: false });

        if (result.status === "error") {
          useGraphSourceStore.setState({ error: result.error || "Unknown error" });
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
          const cid = causationId;
          causationId = null;
          invokeEmitSourceLoaded(
            activeAdapterId ?? "",
            result.sourcePath,
            result.nodeCount,
            result.edgeCount,
            cid,
          ).catch(() => {});
        }
      } catch (err) {
        if (!live()) return;

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        useGraphSourceStore.setState((s) => ({
          summary: { ...s.summary, status: "error", error: errorMessage },
          error: errorMessage,
          isLoading: false,
        }));
        invokeEmitSourceLoadFailed(activeAdapterId ?? "", "", errorMessage).catch(() => {});
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  // refreshToken is bumped by commitSource (and by Regenerate / Try again) to re-trigger.
  }, [activeAdapterId, refreshToken]);
}
