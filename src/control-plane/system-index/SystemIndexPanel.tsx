/**
 * System Index Panel
 *
 * A passive/read-only UI surface that displays the System Index Registry.
 *
 * This panel is read-only and does not control any runtime systems.
 * It displays system index metadata for evidence and inspection only.
 *
 * v72d: Passive Registry Explorer Surface - read-only display of system index entries.
 */

import React from "react";
import {
  getAllSystemIndexEntries,
  getSystemIndexEntriesByCategory,
  type SystemIndexEntry,
} from "./systemIndexRegistry";

export function SystemIndexPanel(): React.JSX.Element {
  const entries = getAllSystemIndexEntries();
  const entriesByCategory = getSystemIndexEntriesByCategory;

  // Calculate summary counts
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kindCounts = entries.reduce((acc, entry) => {
    acc[entry.kind] = (acc[entry.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lifecycleCounts = entries.reduce((acc, entry) => {
    acc[entry.lifecycle] = (acc[entry.lifecycle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique categories for grouping
  const categories = Array.from(new Set(entries.map((e) => e.category))).sort();

  // Helper to create slug for test IDs
  const slugify = (id: string): string => id.replace(/\./g, "-").replace(/_/g, "-");

  return (
    <div className="p-4" data-testid="system-index-panel">
      <div className="mb-6">
        <h2 className="text-lg font-semibold" data-testid="system-index-panel-title">
          System Index Registry
        </h2>
        <p className="text-sm text-gray-600" data-testid="system-index-panel-description">
          Read-only registry of LumaWeave systems, contracts, registries, validators, and future concepts
        </p>
      </div>

      {/* Summary Counts */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="system-index-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="system-index-summary-title">
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500" data-testid="system-index-entry-count-label">
              Total Entries
            </div>
            <div className="text-lg font-semibold" data-testid="system-index-entry-count">
              {entries.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500" data-testid="system-index-category-count-label">
              Categories
            </div>
            <div className="text-lg font-semibold" data-testid="system-index-category-count">
              {categories.length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="system-index-category-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="system-index-category-summary-title">
          By Category
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="text-sm">
              <span className="text-gray-600">{category}:</span>{" "}
              <span className="font-semibold" data-testid={`system-index-category-${slugify(category)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kind Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="system-index-kind-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="system-index-kind-summary-title">
          By Kind
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(kindCounts).map(([kind, count]) => (
            <div key={kind} className="text-sm">
              <span className="text-gray-600">{kind}:</span>{" "}
              <span className="font-semibold" data-testid={`system-index-kind-${slugify(kind)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="system-index-status-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="system-index-status-summary-title">
          By Status
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-sm">
              <span className="text-gray-600">{status}:</span>{" "}
              <span className="font-semibold" data-testid={`system-index-status-${slugify(status)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="system-index-lifecycle-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="system-index-lifecycle-summary-title">
          By Lifecycle
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(lifecycleCounts).map(([lifecycle, count]) => (
            <div key={lifecycle} className="text-sm">
              <span className="text-gray-600">{lifecycle}:</span>{" "}
              <span className="font-semibold" data-testid={`system-index-lifecycle-${slugify(lifecycle)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Entries Grouped by Category */}
      {categories.map((category) => (
        <div key={category} className="mb-6" data-testid={`system-index-category-section-${slugify(category)}`}>
          <h3 className="text-sm font-semibold mb-3" data-testid={`system-index-category-header-${slugify(category)}`}>
            {category}
          </h3>
          <div className="space-y-4">
            {entriesByCategory(category as any).map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({ entry }: { entry: SystemIndexEntry }): React.JSX.Element {
  const slugify = (id: string): string => id.replace(/\./g, "-").replace(/_/g, "-");

  return (
    <div
      className="p-4 border border-gray-200 rounded bg-white"
      data-testid={`system-index-entry-${slugify(entry.id)}`}
    >
      <div className="mb-2">
        <h4 className="font-semibold text-sm" data-testid={`system-index-entry-title-${slugify(entry.id)}`}>
          {entry.title}
        </h4>
        <div className="text-xs text-gray-500" data-testid={`system-index-entry-id-${slugify(entry.id)}`}>
          ID: {entry.id}
        </div>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Category:</span>{" "}
          <span className="font-medium" data-testid={`system-index-entry-category-${slugify(entry.id)}`}>
            {entry.category}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Kind:</span>{" "}
          <span className="font-medium" data-testid={`system-index-entry-kind-${slugify(entry.id)}`}>
            {entry.kind}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>{" "}
          <span className="font-medium" data-testid={`system-index-entry-status-${slugify(entry.id)}`}>
            {entry.status}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Lifecycle:</span>{" "}
          <span className="font-medium" data-testid={`system-index-entry-lifecycle-${slugify(entry.id)}`}>
            {entry.lifecycle}
          </span>
        </div>
      </div>


      {entry.sourcePaths.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Source Paths:</span>
          <div className="mt-1 space-y-1">
            {entry.sourcePaths.map((path) => (
              <div key={path} className="text-gray-700 font-mono text-xs">
                {path}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.testPaths.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Test Paths:</span>
          <div className="mt-1 space-y-1">
            {entry.testPaths.map((path) => (
              <div key={path} className="text-gray-700 font-mono text-xs">
                {path}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.validators.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Validators:</span>
          <div className="mt-1 space-y-1">
            {entry.validators.map((validator) => (
              <div key={validator} className="text-gray-700 font-mono text-xs">
                {validator}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.evidenceSurfaces.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Evidence Surfaces:</span>
          <div className="mt-1 space-y-1">
            {entry.evidenceSurfaces.map((surface) => (
              <div key={surface} className="text-gray-700 text-xs">
                {surface}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.forbiddenBoundaries.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Forbidden Boundaries:</span>
          <div
            className="mt-1 space-y-1"
            data-testid={`system-index-entry-forbidden-boundaries-${slugify(entry.id)}`}
          >
            {entry.forbiddenBoundaries.map((boundary) => (
              <div key={boundary} className="text-red-700 text-xs">
                {boundary}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.relatedSystems.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Related Systems:</span>
          <div className="mt-1 space-y-1">
            {entry.relatedSystems.map((related) => (
              <div key={related} className="text-gray-700 font-mono text-xs">
                {related}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Tags:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {entry.futureImplementationStatus && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Future Status:</span>
          <div className="mt-1 text-purple-700 text-xs">
            {entry.futureImplementationStatus}
          </div>
        </div>
      )}

      {entry.notes && (
        <div className="mb-2 text-xs">
          <span className="text-gray-500">Notes:</span>
          <div className="mt-1 text-gray-700 text-xs">
            {entry.notes}
          </div>
        </div>
      )}
    </div>
  );
}
