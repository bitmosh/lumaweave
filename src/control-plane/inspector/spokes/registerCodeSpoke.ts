// SPDX-License-Identifier: Apache-2.0
import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { CodeTab } from "./CodeTab";

export function registerCodeSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "code",
    name: "Code",
    label: "Code",
    category: "code",
    enabled: true,
    order: 5,
    iconPath: "M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16",
    color: "inspector.radial.spokeColor",
    tabComponent: CodeTab,
  });
}
