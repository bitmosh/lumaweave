import type React from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapNavigationHandlers {
  onMouseDown: ((e: React.MouseEvent) => void) | undefined;
  onWheel: ((e: React.WheelEvent) => void) | undefined;
}

/**
 * v104.0.0 stub — returns no-op handlers. Full implementation (click-to-pan,
 * drag-scrub, wheel-zoom via __lwCameraController) ships in v104.0.1.
 */
export function useMinimapNavigation(
  _bounds: MinimapBounds | null,
  _areaRef: React.RefObject<HTMLDivElement | null>,
): MinimapNavigationHandlers {
  return { onMouseDown: undefined, onWheel: undefined };
}
