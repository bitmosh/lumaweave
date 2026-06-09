import React from "react";
import { registerAdapterConfigForm, type AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { CsvEdgeListConfig } from "../baseSourceAdapter";

export function CsvEdgeListConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<CsvEdgeListConfig>): React.JSX.Element {
  const hasHeader = config.hasHeader ?? true;

  return (
    <div className="lw-csv-edge-list-config">
      <label htmlFor="csv-file-path" className="block text-xs text-gray-400 mb-1">
        File path
      </label>
      <input
        id="csv-file-path"
        type="text"
        data-testid="adapter-config-csv-edge-list-filePath"
        value={config.filePath ?? ""}
        onChange={(e) => onChange({ filePath: e.target.value })}
        placeholder="/home/user/edges.csv"
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />

      <label className="flex items-center gap-2 mt-3 text-xs text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          data-testid="adapter-config-csv-edge-list-hasHeader"
          checked={hasHeader}
          onChange={(e) => onChange({ hasHeader: e.target.checked })}
        />
        First row is header
      </label>

      <label htmlFor="csv-delimiter" className="block text-xs text-gray-400 mt-3 mb-1">
        Delimiter
      </label>
      <input
        id="csv-delimiter"
        type="text"
        data-testid="adapter-config-csv-edge-list-delimiter"
        value={config.delimiter ?? ","}
        onChange={(e) => onChange({ delimiter: e.target.value })}
        placeholder=","
        maxLength={4}
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />

      <label htmlFor="csv-source-col" className="block text-xs text-gray-400 mt-3 mb-1">
        Source column{!hasHeader && <span className="text-gray-500 ml-1">(index)</span>}
      </label>
      <input
        id="csv-source-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-sourceColumn"
        value={config.sourceColumn ?? ""}
        onChange={(e) => onChange({ sourceColumn: e.target.value })}
        placeholder={hasHeader ? "source" : "0"}
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />

      <label htmlFor="csv-target-col" className="block text-xs text-gray-400 mt-3 mb-1">
        Target column{!hasHeader && <span className="text-gray-500 ml-1">(index)</span>}
      </label>
      <input
        id="csv-target-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-targetColumn"
        value={config.targetColumn ?? ""}
        onChange={(e) => onChange({ targetColumn: e.target.value })}
        placeholder={hasHeader ? "target" : "1"}
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />

      <label htmlFor="csv-label-col" className="block text-xs text-gray-400 mt-3 mb-1">
        Label column <span className="text-gray-500">(optional)</span>
      </label>
      <input
        id="csv-label-col"
        type="text"
        data-testid="adapter-config-csv-edge-list-labelColumn"
        value={config.labelColumn ?? ""}
        onChange={(e) => onChange({ labelColumn: e.target.value || undefined })}
        placeholder={hasHeader ? "relationship" : "2"}
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />
    </div>
  );
}

registerAdapterConfigForm(
  "csv-edge-list",
  CsvEdgeListConfigForm as React.FC<AdapterConfigFormProps>,
);
