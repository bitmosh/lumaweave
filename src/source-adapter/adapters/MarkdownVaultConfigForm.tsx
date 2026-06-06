import React from "react";
import { registerAdapterConfigForm, type AdapterConfigFormProps } from "../adapterConfigFormRegistry";
import type { MarkdownVaultConfig } from "../baseSourceAdapter";

export function MarkdownVaultConfigForm({
  config,
  onChange,
}: AdapterConfigFormProps<MarkdownVaultConfig>): React.JSX.Element {
  return (
    <div className="lw-markdown-vault-config">
      <label htmlFor="lw-vault-root" className="block text-xs text-gray-400 mb-1">
        Vault root
      </label>
      <input
        id="lw-vault-root"
        type="text"
        data-testid="adapter-config-vault-root"
        value={config.vaultRoot ?? ""}
        onChange={(e) => onChange({ vaultRoot: e.target.value })}
        placeholder="/home/user/my-vault"
        className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs text-gray-100 placeholder-gray-500 focus:border-gray-400 focus:outline-none"
      />
      <p className="mt-1 text-xs text-gray-500">
        Absolute path to vault directory. Validation occurs on load.
      </p>
    </div>
  );
}

registerAdapterConfigForm("markdown-vault", MarkdownVaultConfigForm as React.FC<AdapterConfigFormProps>);
