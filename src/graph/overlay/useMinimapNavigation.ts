import type React from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapNavigationHandlers {
  onMouseDown: ((e: React.MouseEvent) => void) | undefined;
  onWheel: ((e: React.WheelEvent) => void) | undefined;
}

const MINIMAP_PAD = 10; // must match MinimapSnapshotCanvas pad constant

/**
 * Inverts a click in the snapshot area to graph coordinates.
 *
 * MinimapSnapshotCanvas projects graph → canvas using a UNIFORM CENTERED scale:
 *   scale   = min((w - pad*2) / gW, (h - pad*2) / gH)   // aspect-fit
 *   offsetX = (w - gW * scale) / 2                       // centered
 *   offsetY = (h - gH * scale) / 2
 *   canvasX = offsetX + (graphX - minX) * scale
 *
 * Inversion: subtract offset, divide by scale.
 * A naive clickX/w * gW would ignore the centering offset + aspect ratio
 * and send pans to the wrong location near edges.
 */
function invertToGraph(
  clickX: number,
  clickY: number,
  areaW: number,
  areaH: number,
  bounds: MinimapBounds,
): { x: number; y: number } {
  const gW = bounds.maxX - bounds.minX || 1;
  const gH = bounds.maxY - bounds.minY || 1;
  const scale = Math.min(
    (areaW - MINIMAP_PAD * 2) / gW,
    (areaH - MINIMAP_PAD * 2) / gH,
  );
  const offsetX = (areaW - gW * scale) / 2;
  const offsetY = (areaH - gH * scale) / 2;
  return {
    x: bounds.minX + (clickX - offsetX) / scale,
    y: bounds.minY + (clickY - offsetY) / scale,
  };
}

/**
 * v104.0.1 — click-to-pan + drag-scrub + wheel-zoom via __lwCameraController.
 *
 * Coordinate space: camera.getState().x/y are in raw graphology node-attribute
 * space (same as MinimapBounds). No sigma.viewportToGraph conversion needed —
 * the inverted graph coords can be passed directly to controller.pan().
 *
 * Drag: listeners on window so scrub continues outside the minimap area.
 * Removed on mouseup — no listener leak.
 */
export function useMinimapNavigation(
  bounds: MinimapBounds | null,
  areaRef: React.RefObject<HTMLDivElement | null>,
): MinimapNavigationHandlers {
  if (!bounds) {
    return { onMouseDown: undefined, onWheel: undefined };
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const controller = (window as any).__lwCameraController;
    if (!controller) return;

    const area = areaRef.current;
    if (!area) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = area.getBoundingClientRect();
    const areaW = rect.width;
    const areaH = rect.height;

    const getClickLocal = (ev: { clientX: number; clientY: number }) => ({
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    });

    // Initial click: animated pan to the clicked graph point.
    const initial = getClickLocal(e);
    const target = invertToGraph(initial.x, initial.y, areaW, areaH, bounds!);
    const camState = controller.getState();
    controller.pan(
      target.x - camState.x,
      target.y - camState.y,
      { animated: true },
    );

    // Drag-scrub: instant tracking on mousemove (animated compounds and lags).
    const onMove = (ev: MouseEvent) => {
      const localMouse = getClickLocal(ev);
      const scrubTarget = invertToGraph(localMouse.x, localMouse.y, areaW, areaH, bounds!);
      const state = controller.getState();
      controller.pan(
        scrubTarget.x - state.x,
        scrubTarget.y - state.y,
        { animated: false },
      );
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const onWheel = (e: React.WheelEvent) => {
    const controller = (window as any).__lwCameraController;
    if (!controller) return;

    e.preventDefault();
    e.stopPropagation();

    // deltaY < 0 = scroll up = zoom in (ratio smaller); > 0 = zoom out.
    const factor = e.deltaY < 0 ? 0.85 : 1.18;
    controller.zoom(factor, { animated: false });
  };

  return { onMouseDown, onWheel };
}
