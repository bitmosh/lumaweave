// SPDX-License-Identifier: Apache-2.0
import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { HistoryTab } from "./HistoryTab";

export function registerHistorySpoke(): void {
  inspectorSpokeRegistry.register({
    id: "history",
    name: "History",
    label: "History",
    category: "appearance",
    enabled: true,
    order: 7,
    iconPath: "M3 12a9 9 0 1 1 3 6.7M3 19v-6h6M12 7v5l4 2",
    color: "inspector.radial.spokeColor",
    tabComponent: HistoryTab,
  });
}
