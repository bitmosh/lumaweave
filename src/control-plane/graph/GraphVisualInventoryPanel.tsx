/**
 * Graph Visual Inventory Panel
 *
 * A passive/read-only UI surface that displays the Graph View Element Registry.
 *
 * This panel is read-only and does not control Sigma or graph rendering.
 * It displays registry metadata for evidence and inspection only.
 *
 * v48: Added Graph Evidence Detail Mode - a non-persistent UI mode that switches
 * displayed evidence text between Summary and Detailed.
 */

import React, { useState } from "react";
import { getAllGraphViewElements, type GraphViewElement } from "../../graph/graphViewElementRegistry";
import { getAllGraphVisualThemeMappings, type GraphVisualThemeMapping } from "../../graph/graphVisualThemeMappingRegistry";

export function GraphVisualInventoryPanel(): React.JSX.Element {
  const elements = getAllGraphViewElements();
  const themeMappings = getAllGraphVisualThemeMappings();
  const [detailMode, setDetailMode] = useState<"summary" | "detailed">("summary");
  const [themeEvidenceMode, setThemeEvidenceMode] = useState<boolean>(false);
  const [themeApplicationMode, setThemeApplicationMode] = useState<boolean>(false);

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

      {/* Graph Evidence Detail Mode (v48) */}
      <div
        className="mb-4 p-3 border border-purple-200 rounded bg-purple-50"
        data-testid="graph-evidence-detail-mode"
      >
        <h3 className="text-sm font-semibold text-purple-900 mb-2" data-testid="graph-evidence-detail-mode-title">
          Graph Evidence Detail Mode (v48)
        </h3>
        <p className="text-xs text-purple-700 mb-3" data-testid="graph-evidence-detail-mode-description">
          Non-persistent UI mode: switch between Summary and Detailed evidence display
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDetailMode("summary")}
            aria-pressed={detailMode === "summary"}
            data-testid="graph-evidence-mode-summary"
            className={`px-3 py-1 text-xs rounded ${
              detailMode === "summary"
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-700 border border-purple-300"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setDetailMode("detailed")}
            aria-pressed={detailMode === "detailed"}
            data-testid="graph-evidence-mode-detailed"
            className={`px-3 py-1 text-xs rounded ${
              detailMode === "detailed"
                ? "bg-purple-600 text-white"
                : "bg-white text-purple-700 border border-purple-300"
            }`}
          >
            Detailed
          </button>
          <span
            className="text-xs font-mono text-purple-800"
            data-testid="graph-evidence-detail-readout"
          >
            Mode: {detailMode}
          </span>
        </div>
      </div>

      {/* Graph Theme Mapping Inventory (v50) */}
      <div
        className="mb-4 p-3 border border-green-200 rounded bg-green-50"
        data-testid="graph-theme-mapping-inventory-section"
      >
        <h3 className="text-sm font-semibold text-green-900 mb-2" data-testid="graph-theme-mapping-inventory-title">
          Graph Theme Mapping Inventory (v50)
        </h3>
        <p className="text-xs text-green-700 mb-3" data-testid="graph-theme-mapping-inventory-description">
          Passive inventory of graph visual element to canonical theme token relationships. No runtime application.
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Mapping entries:</span>
            <span className="font-mono text-green-800" data-testid="graph-theme-mapping-count">
              {themeMappings.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Runtime application status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-mapping-application-status">
              forbidden in v50
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sigma mutation status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-mapping-sigma-status">
              forbidden in v50
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Node/edge styling status:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-mapping-styling-status">
              forbidden in v50
            </span>
          </div>
        </div>
      </div>

      {/* Graph Theme Evidence Wrapper Mode (v52) */}
      <div
        className="mb-4 p-3 border border-orange-200 rounded bg-orange-50"
        data-testid="graph-theme-evidence-wrapper-mode-section"
      >
        <h3 className="text-sm font-semibold text-orange-900 mb-2" data-testid="graph-theme-evidence-wrapper-mode-title">
          Graph Theme Evidence Wrapper Mode (v52)
        </h3>
        <p className="text-xs text-orange-700 mb-3" data-testid="graph-theme-evidence-wrapper-mode-description">
          Wrapper-level theme evidence state toggle. Does not apply token values to Sigma or graph.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setThemeEvidenceMode(!themeEvidenceMode)}
            aria-pressed={themeEvidenceMode}
            data-testid="graph-theme-evidence-toggle"
            className={`px-3 py-1 text-xs rounded ${
              themeEvidenceMode
                ? "bg-orange-600 text-white"
                : "bg-white text-orange-700 border border-orange-300"
            }`}
          >
            {themeEvidenceMode ? "Active" : "Inactive"}
          </button>
          <span
            className="text-xs font-mono text-orange-800"
            data-testid="graph-theme-evidence-status"
          >
            Theme evidence: {themeEvidenceMode ? "active" : "inactive"}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Canonical token paths (metadata only):</span>
            <span className="font-mono text-orange-800" data-testid="graph-theme-evidence-token-paths">
              {themeMappings.map((m) => m.canonicalTokenPath).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Token value application:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-evidence-token-value-status">
              forbidden in v52
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sigma mutation:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-evidence-sigma-status">
              forbidden in v52
            </span>
          </div>
        </div>
      </div>

      {/* Graph Theme Token Value Preview (v54) */}
      <div
        className="mb-4 p-3 border border-teal-200 rounded bg-teal-50"
        data-testid="graph-theme-token-preview-section"
      >
        <h3 className="text-sm font-semibold text-teal-900 mb-2" data-testid="graph-theme-token-preview-title">
          Graph Theme Token Value Preview (v54)
        </h3>
        <p className="text-xs text-teal-700 mb-3" data-testid="graph-theme-token-preview-description">
          Read-only preview of canonical theme token values for graph theme mappings. Does not apply values to Sigma or graph.
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Preview status:</span>
            <span className="font-mono text-teal-800" data-testid="graph-theme-token-preview-status">
              metadata only (value preview deferred)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Token value application:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-token-preview-application-status">
              forbidden in v54
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">CSS variable writes:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-token-preview-css-status">
              forbidden in v54
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sigma mutation:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-token-preview-sigma-status">
              forbidden in v54
            </span>
          </div>
        </div>
      </div>

      {/* Graph Shell Theme Evidence Application (v56) */}
      <div
        className="mb-4 p-3 border border-indigo-200 rounded bg-indigo-50"
        data-testid="graph-theme-application-section"
      >
        <h3 className="text-sm font-semibold text-indigo-900 mb-2" data-testid="graph-theme-application-title">
          Graph Shell Theme Evidence Application (v56)
        </h3>
        <p className="text-xs text-indigo-700 mb-3" data-testid="graph-theme-application-description">
          DOM-only wrapper theme application evidence. Applies data attribute to graph shell. Does not apply token values to Sigma or graph.
        </p>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => setThemeApplicationMode(!themeApplicationMode)}
            aria-pressed={themeApplicationMode}
            aria-label="Toggle graph shell theme application evidence"
            data-testid="graph-theme-application-toggle"
            className={`px-3 py-1 text-xs rounded ${
              themeApplicationMode
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-700 border border-indigo-300"
            }`}
          >
            {themeApplicationMode ? "Active" : "Inactive"}
          </button>
          <span
            className="text-xs font-mono text-indigo-800"
            data-testid="graph-theme-application-status"
          >
            Graph theme application: {themeApplicationMode ? "active" : "inactive"}
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Canonical token paths (metadata only):</span>
            <span className="font-mono text-indigo-800" data-testid="graph-theme-application-token-paths">
              {themeMappings.map((m) => m.canonicalTokenPath).join(", ")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Token value application:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-application-token-value-status">
              forbidden in v56
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sigma mutation:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-application-sigma-status">
              forbidden in v56
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">CSS variable writes:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-application-css-status">
              forbidden in v56
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Node/edge styling:</span>
            <span className="font-mono text-red-600 font-semibold" data-testid="graph-theme-application-styling-status">
              forbidden in v56
            </span>
          </div>
        </div>
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
          <GraphVisualInventoryRow key={element.id} element={element} detailMode={detailMode} />
        ))}
      </div>

      {/* Graph Theme Mapping Rows (v50) */}
      <div className="mt-4 space-y-2" data-testid="graph-theme-mapping-list">
        {themeMappings.map((mapping, index) => (
          <GraphThemeMappingRow key={`${mapping.graphElementId}-${mapping.canonicalTokenPath}-${index}`} mapping={mapping} />
        ))}
      </div>
    </div>
  );
}

interface GraphVisualInventoryRowProps {
  element: GraphViewElement;
  detailMode: "summary" | "detailed";
}

function GraphVisualInventoryRow({ element, detailMode }: GraphVisualInventoryRowProps): React.JSX.Element {
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

      {detailMode === "detailed" && element.sigmaBoundary && (
        <div className="mt-2 text-xs text-gray-500 italic" data-testid={`graph-visual-inventory-row-sigma-boundary-${element.id}`}>
          Sigma Boundary: {element.sigmaBoundary}
        </div>
      )}

      {detailMode === "detailed" && element.policyNote && (
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

interface GraphThemeMappingRowProps {
  mapping: GraphVisualThemeMapping;
}

function GraphThemeMappingRow({ mapping }: GraphThemeMappingRowProps): React.JSX.Element {
  const statusColor = mapping.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  const elementId = mapping.graphElementId.replace(/\./g, "-");
  const tokenId = mapping.canonicalTokenPath.replace(/\./g, "-");
  const rowId = `${elementId}-${tokenId}`;

  return (
    <div
      className="border border-gray-200 rounded p-3 bg-gray-50"
      data-testid={`graph-theme-mapping-row-${rowId}`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium text-sm" data-testid={`graph-theme-mapping-row-element-${rowId}`}>
          {mapping.graphElementId}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded ${statusColor}`}
          data-testid={`graph-theme-mapping-row-status-${rowId}`}
        >
          {mapping.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-2" data-testid={`graph-theme-mapping-row-role-${rowId}`}>
        {mapping.visualRole}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <span data-testid={`graph-theme-mapping-row-token-${rowId}`}>
          Token: {mapping.canonicalTokenPath}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
        <span data-testid={`graph-theme-mapping-row-source-${rowId}`}>
          Source: {mapping.tokenSource}
        </span>
      </div>

      <div className="mt-2 text-xs text-gray-500 italic" data-testid={`graph-theme-mapping-row-boundary-${rowId}`}>
        {mapping.boundaryNote}
      </div>
    </div>
  );
}
