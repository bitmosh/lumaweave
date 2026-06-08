import React from "react";
import { registerAdapterConfigForm, type AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { CytoscapeJsonConfig } from "../baseSourceAdapter";

export function CytoscapeJsonConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<CytoscapeJsonConfig>): React.JSX.Element {
  return (
    <div className="lw-cytoscape-config">
      <label htmlFor="cytoscape-file-path" className="block text-xs text-gray-400 mb-1">
        File path
      </label>
      <input
        id="cytoscape-file-path"
        type="text"
        data-testid="adapter-config-cytoscape-file-path"
        value={config.filePath ?? ""}
        onChange={(e) => onChange({ filePath: e.target.value })}
        placeholder="/home/user/exports/graph.json"
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />
      <p className="mt-1 text-xs text-gray-500">Absolute path to a Cytoscape.js JSON file.</p>
    </div>
  );
}

registerAdapterConfigForm("cytoscape-json", CytoscapeJsonConfigForm as React.FC<AdapterConfigFormProps>);
