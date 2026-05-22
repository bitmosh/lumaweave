import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { GeometryTab } from "./GeometryTab";

export function registerGeometrySpoke(): void {
  inspectorSpokeRegistry.register({
    id: "geometry",
    name: "Geometry",
    label: "Geometry",
    category: "geometry",
    enabled: true,
    order: 1,
    status: "active",
    icon: "◉",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: ["node.geometry.preset"],
    tabComponent: GeometryTab,
  });
}
