import type { StarmapPanel } from "./panel.types";

export const panelRegistry: StarmapPanel[] = [
  {
    id: "sources",
    title: "Sources",
    zone: "left",
    defaultOpen: true,
    order: 10,
  },
  {
    id: "lenses",
    title: "Lenses",
    zone: "left",
    defaultOpen: true,
    order: 20,
  },
  {
    id: "inspector",
    title: "Inspector",
    zone: "right",
    defaultOpen: true,
    order: 10,
  },
  {
    id: "evidence",
    title: "Evidence",
    zone: "right",
    defaultOpen: true,
    order: 20,
  },
  {
    id: "physics",
    title: "Physics",
    zone: "right",
    defaultOpen: false,
    order: 30,
  },
  {
    id: "logs",
    title: "Logs",
    zone: "bottom",
    defaultOpen: true,
    order: 10,
  },
  {
    id: "qa",
    title: "QA",
    zone: "bottom",
    featureFlag: "qaPanel",
    defaultOpen: false,
    order: 20,
  },
];