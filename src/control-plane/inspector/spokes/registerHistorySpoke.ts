import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { HistoryTab } from "./HistoryTab";

export function registerHistorySpoke(): void {
  inspectorSpokeRegistry.register({
    id: "history",
    name: "History",
    label: "History",
    category: "appearance",
    enabled: true,
    order: 8,
    icon: "🕐",
    color: "inspector.radial.spokeColor",
    tabComponent: HistoryTab,
  });
}
