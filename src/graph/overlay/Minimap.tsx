// SPDX-License-Identifier: Apache-2.0
/**
 * v104.0.0: Minimap — overlay panel with snapshot canvas + viewport rect.
 * Navigation (click-to-pan, drag-scrub, wheel-zoom) ships in v104.0.1.
 */

import { useRef } from "react";
import { useMinimapSettings, useSetMinimapSetting } from "./useMinimapSettings";
import { useMinimapSnapshot } from "./useMinimapSnapshot";
import { useMinimapCamera } from "./useMinimapCamera";
import { useMinimapNavigation } from "./useMinimapNavigation";
import { MinimapShell, useShellContext, toggleMinimapCollapsed, positionFromAnchor } from "./MinimapShell";
import { MinimapSnapshotCanvas } from "./MinimapSnapshotCanvas";
import { MinimapViewportRect } from "./MinimapViewportRect";
import { MinimapHeader, MinimapFooter, MinimapResizeGrip } from "./MinimapChrome";
import type { MinimapSettings } from "../../control-plane/settings/settings.schema";

// Header=28px, footer=24px — must match MinimapChrome + Minimap.tsx layout.
const MINIMAP_HEADER_H = 28;
const MINIMAP_FOOTER_H = 24;

export function Minimap() {
  const settings = useMinimapSettings();
  const setSetting = useSetMinimapSetting();
  const { snapshotVersion, bounds, counts, isRefreshing } = useMinimapSnapshot();
  const areaSize = {
    width: settings.size.width,
    height: settings.size.height - MINIMAP_HEADER_H - MINIMAP_FOOTER_H,
  };
  const { rect } = useMinimapCamera(bounds, areaSize);

  if (!settings.visible) return null;

  return (
    <MinimapShell status={isRefreshing ? "refresh" : "idle"}>
      <MinimapBody
        snapshotVersion={snapshotVersion}
        bounds={bounds}
        viewportRect={rect}
        counts={counts}
        isRefreshing={isRefreshing}
        settings={settings}
        setSetting={setSetting}
      />
    </MinimapShell>
  );
}

function MinimapBody({
  snapshotVersion,
  bounds,
  viewportRect,
  counts,
  isRefreshing,
  settings,
  setSetting,
}: {
  snapshotVersion: number;
  bounds: ReturnType<typeof useMinimapSnapshot>["bounds"];
  viewportRect: ReturnType<typeof useMinimapCamera>["rect"];
  counts: ReturnType<typeof useMinimapSnapshot>["counts"];
  isRefreshing: boolean;
  settings: MinimapSettings;
  setSetting: ReturnType<typeof useSetMinimapSetting>;
}) {
  const { flipped, collapsed } = useShellContext();
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const nav = useMinimapNavigation(bounds, canvasAreaRef);

  const onCollapseToggle = () => toggleMinimapCollapsed(settings, setSetting, flipped);
  const onClose = () => setSetting("visible", false);
  const onSnap = () =>
    setSetting({
      position: positionFromAnchor(settings.anchor, settings.size),
      size: { width: 300, height: 200 },
      collapsed: false,
    });

  return (
    <>
      <MinimapHeader
        breadcrumb="radial backbone"
        status={isRefreshing ? "refreshing" : "fresh"}
        collapsed={collapsed}
        flipped={flipped}
        onCollapse={onCollapseToggle}
        onClose={onClose}
        onSnap={onSnap}
      />

      {!collapsed && (
        <>
          <div
            ref={canvasAreaRef}
            data-testid="minimap-canvas-area"
            onMouseDown={nav.onMouseDown}
            onWheel={nav.onWheel}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: flipped ? 24 : 28,
              bottom: flipped ? 28 : 24,
              overflow: "hidden",
              cursor: "crosshair",
            }}
          >
            <MinimapSnapshotCanvas
              snapshotVersion={snapshotVersion}
              bounds={bounds}
              size={{
                width: settings.size.width,
                height: settings.size.height - 28 - 24,
              }}
            />
            {settings.showViewport && <MinimapViewportRect rect={viewportRect} />}
            <MinimapResizeGrip />
          </div>

          <MinimapFooter
            opacity={settings.opacity}
            onOpacityChange={(v) => setSetting("opacity", v)}
            counts={counts}
            flipped={flipped}
          />
        </>
      )}
    </>
  );
}
