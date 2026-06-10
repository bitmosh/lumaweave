import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { TypeTab } from "./TypeTab";

export function registerTypeSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "type",
    name: "Type",
    label: "Type",
    category: "typography",
    enabled: true,
    order: 2,
    status: "active",
    iconPath: "M5 6h14M12 6v13M9 19h6",
    iconFill: false,
    color: "inspector.radial.spokeColor",
    placeholderMessage: "Typography controls are in development.",
    tabComponent: TypeTab,
  });
}
