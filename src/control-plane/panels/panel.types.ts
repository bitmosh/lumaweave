export type PanelZone = "left" | "right" | "bottom";

export type StarmapPanel = {
  id: string;
  title: string;
  zone: PanelZone;
  featureFlag?: string;
  defaultOpen: boolean;
  order: number;
};