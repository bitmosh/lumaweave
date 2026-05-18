/**
 * Gwells Runtime Probe
 *
 * Installs window.__lwGetGwellsState() for Playwright testing and runtime inspection.
 * Returns the current gwells physics state from the graph attribute.
 */

import type Graph from "graphology";
import type { GWPhysicsState } from "../../../physics/gwells";

export function installGwellsProbeGlobal(graph: Graph): () => void {
  const getGwellsState = (): GWPhysicsState | null => {
    if (!graph.hasAttribute("__gwellsState")) {
      return null;
    }
    return graph.getAttribute("__gwellsState") as GWPhysicsState;
  };

  (window as any).__lwGetGwellsState = getGwellsState;

  // Return cleanup function
  return () => {
    delete (window as any).__lwGetGwellsState;
  };
}
