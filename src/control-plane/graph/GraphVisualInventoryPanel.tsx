/**
 * Graph Visual Inventory Panel
 *
 * A passive/read-only UI surface that displays the Graph View Element Registry.
 *
 * This panel is read-only and does not control Sigma or graph rendering.
 * It displays registry metadata for evidence and inspection only.
 */

import React from "react";
import { getAllGraphViewElements, type GraphViewElement } from "../../graph/graphViewElementRegistry";

export function GraphVisualInventoryPanel(): React.JSX.Element {
  const elements = getAllGraphViewElements();

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold" data-testid="graph-visual-inventory-title">
          Graph Visual Inventory
        </h2>
        <p className="text-sm text-gray-600" data-testid="graph-visual-inventory-description">
          Read-only inventory of graph visual elements
        </p>
      </div>

      {/* Passive Runtime Probe Section (v46) */}
      <div
        className="mb-4 p-3 border border-blue-200 rounded bg-blue-50"
        data-testid="graph-runtime-probe-section"
      >
        <h3 className="text-sm font-semibold text-blue-900 mb-2" data-testid="graph-runtime-probe-title">
          Graph Runtime Probe (v46)
        </h3>
        <p className="text-xs text-blue-700 mb-3" data-testid="graph-runtime-probe-description">
          Passive readout of graph container/evidence status. No mutation.
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Registry entries:</span>
            <span className="font-mono text-blue-800" data-testid="graph-runtime-probe-registry-count">
              {elements.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Runtime mutation status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-runtime-probe-mutation-status">
              locked/deferred
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sigma mutation status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-runtime-probe-sigma-status">
              forbidden in v46
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Physics mutation status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-runtime-probe-physics-status">
              forbidden in v46
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2" data-testid="graph-visual-inventory-list">
        {elements.map((element) => (
          <GraphVisualInventoryRow key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
}

interface GraphVisualInventoryRowProps {
  element: GraphViewElement;
}

function GraphVisualInventoryRow({ element }: GraphVisualInventoryRowProps): React.JSX.Element {
  const statusColor = getStatusColor(element.status);

  return (
    <div
      className="border border-gray-200 rounded p-3 bg-gray-50"
      data-testid={`graph-visual-inventory-row-${element.id}`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium text-sm" data-testid={`graph-visual-inventory-row-title-${element.id}`}>
          {element.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded ${statusColor}`}
          data-testid={`graph-visual-inventory-row-status-${element.id}`}
        >
          {element.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-2" data-testid={`graph-visual-inventory-row-description-${element.id}`}>
        {element.description}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span data-testid={`graph-visual-inventory-row-category-${element.id}`}>
          Category: {element.category}
        </span>
        <span>•</span>
        <span data-testid={`graph-visual-inventory-row-evidence-${element.id}`}>
          Evidence: {element.evidenceKind}
        </span>
      </div>

      {element.sigmaBoundary && (
        <div className="mt-2 text-xs text-gray-500 italic" data-testid={`graph-visual-inventory-row-sigma-boundary-${element.id}`}>
          Sigma Boundary: {element.sigmaBoundary}
        </div>
      )}

      {element.policyNote && (
        <div className="mt-1 text-xs text-gray-500 italic" data-testid={`graph-visual-inventory-row-policy-${element.id}`}>
          Policy: {element.policyNote}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "future":
      return "bg-yellow-100 text-yellow-800";
    case "locked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
