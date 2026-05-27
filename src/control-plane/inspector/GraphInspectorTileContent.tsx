import { useGraphSourceSummary } from "../../graph/ingest/useGraphSourceSummary";
import { InspectorPanel } from "../panels/InspectorPanel";

export function GraphInspectorTileContent() {
  const { summary } = useGraphSourceSummary();

  const graphSummary = {
    source: summary.label ?? "unknown",
    rawNodeCount: summary.nodeCount ?? 0,
    rawEdgeCount: summary.edgeCount ?? 0,
    normalizedNodeCount: summary.normalizedNodeCount ?? 0,
    normalizedEdgeCount: summary.normalizedEdgeCount ?? 0,
    renderer: "sigma2d",
    layout: "settling",
    status: summary.status ?? "idle",
  };

  return (
    <div data-testid="graph-inspector-tile-content">
      <InspectorPanel selectedNode={null} graphSummary={graphSummary} />
    </div>
  );
}
