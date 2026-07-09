// SPDX-License-Identifier: Apache-2.0
import type React from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapNavigationHandlers {
  onMouseDown: ((e: React.MouseEvent) => void) | undefined;
  onWheel: ((e: React.WheelEvent) => void) | undefined;
}

const MINIMAP_PAD = 10; // must match MinimapSnapshotCanvas pad constant

/**
 * Inverts a click in the snapshot area to raw graph coordinates.
 *
 * MinimapSnapshotCanvas (v104.0.6+) projects with Y-flip to match sigma Y↑:
 *   canvasX = offsetX + (graphX - minX) * scale
 *   canvasY = offsetY + (maxY - graphY) * scale   ← Y-flip
 *
 * Inverse (click canvas → graph):
 *   graphX = minX + (clickX - offsetX) / scale
 *   graphY = maxY - (clickY - offsetY) / scale    ← Y-flip inverse
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
    y: bounds.maxY - (clickY - offsetY) / scale, // Y-flip: minimap top = large raw Y (sigma top)
  };
}

/**
 * Compute the camera-space pan delta to center the view on a target raw graph coord.
 *
 * camera.getState().x/y are in sigma's NORMALIZED [0,1] space (not raw graph coords).
 * The normalization is: norm(raw) = 0.5 + (raw - graphCenter) / ratio_norm.
 * So delta in normalized space = delta in raw space / ratio_norm.
 *
 * ratio_norm = max(gW, gH) (from sigma's normalizationFunction source).
 * currentCenter = sigma.viewportToGraph(vpCenter) = raw graph coords at current view center.
 */
function computePanDelta(
  target: { x: number; y: number },
  bounds: MinimapBounds,
): { dx: number; dy: number } | null {
  const sigma = (window as any).__lwSigma;
  if (!sigma) return null;
  const dims = sigma.getDimensions?.() as { width: number; height: number } | undefined;
  if (!dims?.width || !dims?.height) return null;

  const currentCenter = sigma.viewportToGraph({ x: dims.width / 2, y: dims.height / 2 });
  const ratioNorm = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) || 1;

  return {
    dx: (target.x - currentCenter.x) / ratioNorm,
    dy: (target.y - currentCenter.y) / ratioNorm,
  };
}

/**
 * v104.0.6 — click-to-pan + drag-scrub + wheel-zoom via __lwCameraController.
 *
 * Fixes vs v104.0.1:
 * 1. invertToGraph Y-flip: clicking the top of the minimap now maps to large
 *    raw Y (sigma top), not small raw Y (was upside-down).
 * 2. Pan delta in camera (normalized) space: camera.x/y are sigma-normalized,
 *    NOT raw graph coords. Dividing by ratio_norm converts the raw graph delta
 *    to normalized camera space. The previous target-camState subtraction mixed
 *    raw graph and normalized spaces → fly-off.
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

    // Initial click: animated pan to center the clicked graph point.
    const initial = getClickLocal(e);
    const target = invertToGraph(initial.x, initial.y, areaW, areaH, bounds!);
    const delta = computePanDelta(target, bounds!);
    if (delta) {
      controller.pan(delta.dx, delta.dy, { animated: true });
    }

    // Drag-scrub: instant tracking on mousemove.
    const onMove = (ev: MouseEvent) => {
      const localMouse = getClickLocal(ev);
      const scrubTarget = invertToGraph(localMouse.x, localMouse.y, areaW, areaH, bounds!);
      const scrubDelta = computePanDelta(scrubTarget, bounds!);
      if (scrubDelta) {
        controller.pan(scrubDelta.dx, scrubDelta.dy, { animated: false });
      }
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
