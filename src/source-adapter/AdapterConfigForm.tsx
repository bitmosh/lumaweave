// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useSettingsStore } from "../control-plane/settings/settings.store";
import { getAdapterConfigForm } from "./adapterConfigFormRegistry";
import type { AdapterConfig } from "./baseSourceAdapter";

interface AdapterConfigFormHostProps {
  adapterId: string;
  /**
   * Controlled ("draft") mode: the caller owns the config and receives every edit.
   * Nothing is written to persisted settings — that is the caller's job, on commit.
   * GraphSourcePicker uses this so Cancel can genuinely discard.
   *
   * Omit both props for store-backed mode, where edits persist immediately.
   * SourceAdapterPanel (dev registry browser) relies on that.
   */
  config?: AdapterConfig;
  onChange?: (next: AdapterConfig) => void;
}

export function AdapterConfigForm({
  adapterId,
  config: controlledConfig,
  onChange: controlledOnChange,
}: AdapterConfigFormHostProps): React.JSX.Element {
  const storedConfig = useSettingsStore(
    (s) => s.settings.sources.configurations[adapterId],
  );
  const isControlled = controlledOnChange !== undefined;
  const source = isControlled ? controlledConfig : storedConfig;
  const config = source ?? ({ adapterId } as AdapterConfig);
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
    if (controlledOnChange) {
      controlledOnChange(merged);
      return;
    }
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
