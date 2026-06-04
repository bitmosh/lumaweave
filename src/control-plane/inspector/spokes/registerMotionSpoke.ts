import { inspectorSpokeRegistry } from "../../../themes/inspectorSpokeRegistry";
import { makePlaceholderTab } from "./PlaceholderTab";

export function registerMotionSpoke(): void {
  inspectorSpokeRegistry.register({
    id: "motion",
    name: "Motion",
    label: "Motion",
    category: "motion",
    enabled: true,
    order: 3,
    status: "placeholder",
    iconPath: "M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8",
    color: "inspector.radial.spokeColor",
    intendedTokenPaths: ["motion.reduce"],
    placeholderMessage: "Coming in v92 (Audio Reactivity arc)",
    tabComponent: makePlaceholderTab("motion"),
  });
}
