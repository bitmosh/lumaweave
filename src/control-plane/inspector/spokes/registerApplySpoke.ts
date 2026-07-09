// SPDX-License-Identifier: Apache-2.0
import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { ApplyTab } from "./ApplyTab";

export function registerApplySpoke(): void {
  inspectorSpokeRegistry.register({
    id: "apply",
    name: "Apply",
    label: "Apply",
    category: "appearance",
    enabled: true,
    order: 6,
    iconPath: "M5 12a7 7 0 1 1 14 0M5 12v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5M9 12l3 3 3-3",
    color: "inspector.radial.spokeColor",
    tabComponent: ApplyTab,
  });
}
