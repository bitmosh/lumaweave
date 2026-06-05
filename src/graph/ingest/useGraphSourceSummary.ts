import { useEffect, useState } from "react";
import { useSettingsStore } from "../../control-plane/settings/settings.store";
import type { GraphSourceSummary } from "../schema/graph.types";
import { loadSource } from "./loadSource";

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
  const inputPath = useSettingsStore(
    (s) =>
      s.settings.sources.configurations[activeAdapterId ?? ""]?.inputPath ?? "",
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setSummary((prev) => ({ ...prev, status: "loading" }));
      setError(null);

      try {
        const result = await loadSource(activeAdapterId, inputPath);
        if (isMounted) {
          setSummary(result);
          if (result.status === "error") {
            setError(result.error || "Unknown error");
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
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [activeAdapterId, inputPath]);

  return { summary, error };
}
