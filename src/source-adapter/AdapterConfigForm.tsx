// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useSettingsStore } from "../control-plane/settings/settings.store";
import { getAdapterConfigForm } from "./adapterConfigFormRegistry";
import type { AdapterConfig } from "./baseSourceAdapter";

interface AdapterConfigFormHostProps {
  adapterId: string;
}

export function AdapterConfigForm({ adapterId }: AdapterConfigFormHostProps): React.JSX.Element {
  const storedConfig = useSettingsStore(
    (s) => s.settings.sources.configurations[adapterId],
  );
  const config = storedConfig ?? ({ adapterId } as AdapterConfig);
  const FormComponent = getAdapterConfigForm(adapterId);

  if (!FormComponent) {
    return (
      <div
        data-testid="adapter-config-empty"
        className="lw-adapter-config-empty text-xs text-gray-500"
      >
        No configuration required for this adapter.
      </div>
    );
  }

  const handleChange = (next: Partial<AdapterConfig>) => {
    const merged = { ...config, ...next, adapterId } as AdapterConfig;
    useSettingsStore.getState().setSetting("sources.configurations", {
      ...useSettingsStore.getState().settings.sources.configurations,
      [adapterId]: merged,
    });
  };

  return (
    <div data-testid={`adapter-config-${adapterId}`} className="lw-adapter-config-form">
      <FormComponent config={config} onChange={handleChange} />
    </div>
  );
}
