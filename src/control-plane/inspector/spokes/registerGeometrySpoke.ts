// SPDX-License-Identifier: Apache-2.0
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
    iconPath: "M12 3l8 9-8 9-8-9z",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: ["node.geometry.preset"],
    tabComponent: GeometryTab,
  });
}
