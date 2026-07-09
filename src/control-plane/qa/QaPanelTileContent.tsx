// SPDX-License-Identifier: Apache-2.0
import { QaPanel } from "./QaPanel";
import { useThemeInspectorStore } from "../../themes/themeInspectorStore";

export function QaPanelTileContent() {
  const enabled = useThemeInspectorStore((s) => s.enabled);
  const toggle = useThemeInspectorStore((s) => s.toggle);
  return (
    <div className="lw-qa-panel-tile-content" data-testid="qa-panel-tile-content">
      <QaPanel themeInspectorEnabled={enabled} onThemeInspectorToggle={toggle} />
    </div>
  );
}
