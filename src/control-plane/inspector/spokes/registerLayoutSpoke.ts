import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { makePlaceholderTab } from "./PlaceholderTab";

export function registerLayoutSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "layout",
    name: "Layout",
    label: "Layout",
    category: "layout",
    enabled: true,
    order: 4,
    status: "placeholder",
    icon: "⊞",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: undefined,
    placeholderMessage: "Coming in v93 (Physics Dialect arc)",
    tabComponent: makePlaceholderTab("layout"),
  });
}
