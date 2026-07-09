// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { registerAdapterConfigForm, type AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { CerebraSnapshotConfig } from "../baseSourceAdapter";

export function CerebraSnapshotConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<CerebraSnapshotConfig>): React.JSX.Element {
  return (
    <div className="lw-cerebra-snapshot-config">
      <label htmlFor="cerebra-snapshot-file-path" className="block text-xs text-gray-400 mb-1">
        File path
      </label>
      <input
        id="cerebra-snapshot-file-path"
        type="text"
        data-testid="adapter-config-cerebra-snapshot-file-path"
        value={config.filePath ?? ""}
        onChange={(e) => onChange({ filePath: e.target.value })}
        placeholder="/home/user/vault/.cerebra/graph.json"
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />
      <p className="mt-1 text-xs text-gray-500">
        Absolute path to a Cerebra graph snapshot. Typically{" "}
        <code className="text-gray-400">{"<vault>/.cerebra/graph.json"}</code>.
      </p>
    </div>
  );
}

registerAdapterConfigForm(
  "cerebra-snapshot",
  CerebraSnapshotConfigForm as React.FC<AdapterConfigFormProps>,
);
