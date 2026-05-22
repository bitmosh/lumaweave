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
    icon: "🎯",
    color: "inspector.radial.spokeColor",
    tabComponent: ApplyTab,
  });
}
