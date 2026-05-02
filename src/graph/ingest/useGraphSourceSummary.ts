/**
 * LumaWeave Graph Source Summary Hook
 * React hook to load and manage graph source summary state
 */

import { useEffect, useState } from "react";
import type { GraphSourceSummary } from "../schema/graph.types";
import { loadGraphifySource } from "./loadGraphifySource";

export function useGraphSourceSummary() {
  const [summary, setSummary] = useState<GraphSourceSummary>({
    sourceId: "ai-lab",
    label: "AI Lab",
    sourcePath: "/home/boop/Projects/ai-lab/graphify-out",
    publicBaseUrl: "/examples/ai-lab/graphify-out",
    status: "idle",
    graphPresent: false,
    manifestPresent: false,
    reportPresent: false,
    nodeCount: 0,
    edgeCount: 0,
    normalizedNodeCount: 0,
    normalizedEdgeCount: 0,
    warnings: [],
    normalizedNodes: [],
    normalizedEdges: [],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setSummary((prev) => ({ ...prev, status: "loading" }));
      setError(null);

      try {
        const result = await loadGraphifySource();
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
  }, []);

  return { summary, error };
}
