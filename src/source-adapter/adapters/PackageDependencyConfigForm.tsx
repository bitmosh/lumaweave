import React from "react";
import { registerAdapterConfigForm, type AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { PackageDependencyConfig } from "../baseSourceAdapter";

export function PackageDependencyConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<PackageDependencyConfig>): React.JSX.Element {
  return (
    <div className="lw-package-dep-config">
      <label htmlFor="pkg-project-path" className="block text-xs text-gray-400 mb-1">
        Project path
      </label>
      <input
        id="pkg-project-path"
        type="text"
        data-testid="adapter-config-package-project-path"
        value={config.projectPath ?? ""}
        onChange={(e) => onChange({ projectPath: e.target.value })}
        placeholder="/home/user/my-project"
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />
      <p className="mt-1 mb-2 text-xs text-gray-500">Absolute path to the project root directory.</p>
      <label htmlFor="pkg-manifest-type" className="block text-xs text-gray-400 mb-1">
        Manifest type
      </label>
      <select
        id="pkg-manifest-type"
        data-testid="adapter-config-package-manifest-type"
        value={config.manifestType ?? "package.json"}
        onChange={(e) =>
          onChange({ manifestType: e.target.value as "package.json" | "pyproject.toml" })
        }
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 focus:border-gray-400 focus:outline-none"
      >
        <option value="package.json">package.json (npm / yarn / pnpm)</option>
        <option value="pyproject.toml" disabled>pyproject.toml (Python — not yet supported)</option>
      </select>
    </div>
  );
}

registerAdapterConfigForm(
  "package-dependency",
  PackageDependencyConfigForm as React.FC<AdapterConfigFormProps>,
);
