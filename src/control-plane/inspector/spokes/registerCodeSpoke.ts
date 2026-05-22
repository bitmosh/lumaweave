import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { makePlaceholderTab } from "./PlaceholderTab";

export function registerCodeSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "code",
    name: "Code",
    label: "Code",
    category: "code",
    enabled: true,
    order: 5,
    status: "placeholder",
    icon: "</>",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: undefined,
    placeholderMessage: "Coming in v98 (Code Spoke arc)",
    tabComponent: makePlaceholderTab("code"),
  });
}
