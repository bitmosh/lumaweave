import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { IdeTab } from "./IdeTab";

export function registerIdeSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "ide",
    name: "IDE",
    label: "IDE",
    category: "appearance",
    enabled: true,
    order: 2,
    icon: "📄",
    color: "inspector.radial.spokeColor",
    tabComponent: IdeTab,
  });
}
