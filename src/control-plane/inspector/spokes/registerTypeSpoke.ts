import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { makePlaceholderTab } from "./PlaceholderTab";

export function registerTypeSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "type",
    name: "Type",
    label: "Type",
    category: "typography",
    enabled: true,
    order: 2,
    status: "placeholder",
    iconPath: "M5 6h14M12 6v13M9 19h6",
    iconFill: false,
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: undefined,
    placeholderMessage: "Coming in future arc (Typography axis token wiring)",
    tabComponent: makePlaceholderTab("type"),
  });
}
