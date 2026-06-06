import { useSettingsStore } from "../../control-plane/settings/settings.store";
import type { AdapterConfig } from "../../source-adapter/baseSourceAdapter";

export function buildAdapterConfig(adapterId: string): AdapterConfig {
  const { configurations } = useSettingsStore.getState().settings.sources;
  const storedConfig = configurations[adapterId] ?? {};
  return { ...storedConfig, adapterId } as AdapterConfig;
}
