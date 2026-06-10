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
    iconPath: "M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: undefined,
    placeholderMessage: "Physics layout controls are in development.",
    tabComponent: makePlaceholderTab("layout"),
  });
}
