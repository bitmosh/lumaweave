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
    icon: "</>",
    color: "inspector.radial.spokeColor",
    tabComponent: CodeTab,
  });
}
