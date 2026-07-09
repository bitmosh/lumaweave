// SPDX-License-Identifier: Apache-2.0
import type { FC } from "react";
import type { AdapterConfig } from "./baseSourceAdapter";

export interface AdapterConfigFormProps<T extends AdapterConfig = AdapterConfig> {
  config: T;
  onChange: (next: Partial<T>) => void;
}

type AdapterConfigFormComponent = FC<AdapterConfigFormProps>;

const formRegistry = new Map<string, AdapterConfigFormComponent>();

export function registerAdapterConfigForm(
  adapterId: string,
  component: AdapterConfigFormComponent,
): void {
  formRegistry.set(adapterId, component);
}

export function getAdapterConfigForm(adapterId: string): AdapterConfigFormComponent | undefined {
  return formRegistry.get(adapterId);
}
