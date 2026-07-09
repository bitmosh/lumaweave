// SPDX-License-Identifier: Apache-2.0
export type PanelZone = "left" | "right" | "bottom";

export type LumaWeavePanel = {
  id: string;
  title: string;
  zone: PanelZone;
  featureFlag?: string;
  defaultOpen: boolean;
  order: number;
};