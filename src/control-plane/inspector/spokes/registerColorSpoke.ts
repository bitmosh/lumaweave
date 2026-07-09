// SPDX-License-Identifier: Apache-2.0
/**
 * Register Color Spoke
 *
 * Registers the Color spoke in the inspector spoke registry.
 * v86d.3a: Displays active theme's Tier 1 primitives and target bindings.
 */

import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { ColorTab } from "./ColorTab";

export function registerColorSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "color",
    name: "Color",
    label: "Color",
    category: "appearance",
    enabled: true,
    order: 0,
    iconPath: "M12 3a4 4 0 1 1-4 4c0-1.5.6-2.5 2-3.5C11.4 2.6 11.6 3 12 3Zm5 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-3 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-3 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM7 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
    color: "inspector.radial.spokeColor",
    tabComponent: ColorTab,
  });
}
