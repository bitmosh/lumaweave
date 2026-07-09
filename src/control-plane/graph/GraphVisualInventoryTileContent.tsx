// SPDX-License-Identifier: Apache-2.0
import { GraphVisualInventoryPanel } from "./GraphVisualInventoryPanel";

export function GraphVisualInventoryTileContent() {
  return (
    <div className="lw-graph-visual-inventory-tile-content" data-testid="graph-visual-inventory-panel">
      <GraphVisualInventoryPanel />
    </div>
  );
}
