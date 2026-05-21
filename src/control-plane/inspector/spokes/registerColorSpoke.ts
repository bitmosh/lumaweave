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
    icon: "🎨",
    color: "inspector.radial.spokeColor",
    tabComponent: ColorTab,
  });
}
