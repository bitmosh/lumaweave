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
    icon: "T",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: undefined,
    placeholderMessage: "Coming in future arc (Typography axis token wiring)",
    tabComponent: makePlaceholderTab("type"),
  });
}
