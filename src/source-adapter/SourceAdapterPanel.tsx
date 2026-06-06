/**
 * Source Adapter Panel
 *
 * Displays the Source Adapter Registry. Registered adapters can be set as the
 * active source via the "Set as active" button; candidate adapters are read-only.
 *
 * v74c: Passive Source Adapter Evidence Surface - read-only display of source adapter entries.
 * v107.0.3: Added set-active selector for registered adapters.
 */

import React from "react";
import {
  getAllSourceAdapterEntries,
  type SourceAdapterEntry,
} from "./sourceAdapterRegistry";
import { useSettingsStore } from "../control-plane/settings/settings.store";
import { AdapterConfigForm } from "./AdapterConfigForm";

export function SourceAdapterPanel(): React.JSX.Element {
  const entries = getAllSourceAdapterEntries();
  const activeAdapterId = useSettingsStore((s) => s.settings.sources.active);

  const typeCounts = entries.reduce((acc, entry) => {
    acc[entry.adapterType] = (acc[entry.adapterType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const versionCounts = entries.reduce((acc, entry) => {
    acc[entry.adapterVersion] = (acc[entry.adapterVersion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const adapterTypes = Array.from(new Set(entries.map((e) => e.adapterType))).sort();
  const slugify = (id: string): string => id.replace(/\./g, "-").replace(/_/g, "-");

  return (
    <div className="p-4" data-testid="source-adapter-panel">
      <div className="mb-6">
        <h2 className="text-lg font-semibold" data-testid="source-adapter-panel-title">
          Source Adapter Registry
        </h2>
        <p className="text-sm text-gray-600" data-testid="source-adapter-panel-description">
          Read-only registry of source adapter types, schemas, and safety requirements
        </p>
      </div>

      {/* Summary Counts */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="source-adapter-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="source-adapter-summary-title">
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500" data-testid="source-adapter-entry-count-label">
              Total Adapters
            </div>
            <div className="text-lg font-semibold" data-testid="source-adapter-entry-count">
              {entries.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500" data-testid="source-adapter-type-count-label">
              Adapter Types
            </div>
            <div className="text-lg font-semibold" data-testid="source-adapter-type-count">
              {adapterTypes.length}
            </div>
          </div>
        </div>
      </div>

      {/* Type Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="source-adapter-type-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="source-adapter-type-summary-title">
          By Adapter Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type} className="text-sm">
              <span className="text-gray-600">{type}:</span>{" "}
              <span className="font-semibold" data-testid={`source-adapter-type-${slugify(type)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="source-adapter-status-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="source-adapter-status-summary-title">
          By Status
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="text-sm">
              <span className="text-gray-600">{status}:</span>{" "}
              <span className="font-semibold" data-testid={`source-adapter-status-${slugify(status)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Version Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50" data-testid="source-adapter-version-summary">
        <h3 className="text-sm font-semibold mb-3" data-testid="source-adapter-version-summary-title">
          By Version
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(versionCounts).map(([version, count]) => (
            <div key={version} className="text-sm">
              <span className="text-gray-600">{version}:</span>{" "}
              <span className="font-semibold" data-testid={`source-adapter-version-${slugify(version)}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Entries Grouped by Adapter Type */}
      {adapterTypes.map((adapterType) => (
        <div key={adapterType} className="mb-6" data-testid={`source-adapter-type-section-${slugify(adapterType)}`}>
          <h3 className="text-sm font-semibold mb-3" data-testid={`source-adapter-type-header-${slugify(adapterType)}`}>
            {adapterType}
          </h3>
          <div className="space-y-4">
            {entries
              .filter((entry) => entry.adapterType === adapterType)
              .map((entry) => (
                <EntryCard
                  key={entry.adapterId}
                  entry={entry}
                  activeAdapterId={activeAdapterId}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({
  entry,
  activeAdapterId,
}: {
  entry: SourceAdapterEntry;
  activeAdapterId: string | null;
}): React.JSX.Element {
  const slugify = (id: string): string => id.replace(/\./g, "-").replace(/_/g, "-");
  const isActive = entry.adapterId === activeAdapterId;
  const isRegistered = entry.status === "registered";

  function handleSetActive() {
    useSettingsStore.getState().setSetting("sources.active", entry.adapterId);
  }

  return (
    <div
      className="p-4 border border-gray-200 rounded bg-white"
      data-testid={`source-adapter-entry-${slugify(entry.adapterId)}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-sm" data-testid={`source-adapter-entry-title-${slugify(entry.adapterId)}`}>
            {entry.adapterId}
            {isActive && (
              <span
                className="ms-2 text-xs font-normal text-green-600"
                data-testid={`source-adapter-active-indicator-${slugify(entry.adapterId)}`}
              >
                active
              </span>
            )}
          </h4>
          <div className="text-xs text-gray-500" data-testid={`source-adapter-entry-version-${slugify(entry.adapterId)}`}>
            Version: {entry.adapterVersion}
          </div>
        </div>
        {isRegistered && (
          <button
            className="shrink-0 text-xs px-2 py-1 rounded border border-gray-300 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-default"
            disabled={isActive}
            onClick={handleSetActive}
            data-testid={`source-adapter-set-active-${slugify(entry.adapterId)}`}
          >
            {isActive ? "Active" : "Set as active"}
          </button>
        )}
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">Type:</span>{" "}
          <span className="font-medium" data-testid={`source-adapter-entry-type-${slugify(entry.adapterId)}`}>
            {entry.adapterType}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Status:</span>{" "}
          <span className="font-medium" data-testid={`source-adapter-entry-status-${slugify(entry.adapterId)}`}>
            {entry.status}
          </span>
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">Input Pattern:</span>
        <div className="mt-1 text-gray-700 font-mono text-xs">
          {entry.inputPattern.type}: {entry.inputPattern.pattern}
        </div>
        {entry.inputPattern.examples.length > 0 && (
          <div className="mt-1 space-y-1">
            {entry.inputPattern.examples.map((example) => (
              <div key={example} className="text-gray-600 font-mono text-xs ps-2">
                {example}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">Translation Set:</span>
        <div className="mt-1 space-y-1">
          <div className="text-gray-700 text-xs">
            <span className="font-medium">Node Mappings:</span>
            <div className="mt-1 ps-2 font-mono text-xs">
              {Object.entries(entry.translationSet.nodeMappings).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
              ))}
            </div>
          </div>
          <div className="text-gray-700 text-xs">
            <span className="font-medium">Edge Mappings:</span>
            <div className="mt-1 ps-2 font-mono text-xs">
              {Object.entries(entry.translationSet.edgeMappings).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
              ))}
            </div>
          </div>
          <div className="text-gray-700 text-xs">
            <span className="font-medium">Default Confidence:</span> {entry.translationSet.defaultConfidence}
          </div>
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">Limits:</span>
        <div className="mt-1 space-y-1">
          {Object.entries(entry.limits).map(([key, value]) => (
            <div key={key} className="text-gray-700 text-xs">
              <span className="font-medium">{key}:</span> {String(value)}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">QA Report Format:</span>
        <div className="mt-1 text-gray-700 font-mono text-xs">
          Required fields: {entry.qaReportFormat.requiredFields.join(", ")}
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">Contract Version:</span>
        <div className="mt-1 text-gray-700 font-mono text-xs">
          {entry.contractVersion}
        </div>
      </div>

      <div className="mb-2 text-xs">
        <span className="text-gray-500">Last Updated:</span>
        <div className="mt-1 text-gray-700 text-xs">
          {entry.lastUpdated}
        </div>
      </div>

      {isActive && (
        <div className="mt-4 border-t border-gray-100 pt-4" data-testid="adapter-config-section">
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Configuration</h4>
          <AdapterConfigForm adapterId={entry.adapterId} />
        </div>
      )}
    </div>
  );
}
