import { useState, useEffect } from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function useMinimapCamera(
  bounds: MinimapBounds | null,
): { rect: MinimapViewportRect | null } {
  const [rect, setRect] = useState<MinimapViewportRect | null>(null);

  useEffect(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma || !bounds) {
      setRect(null);
      return;
    }

    let rafId = 0;
    let dirty = false;

    const compute = () => {
      const cam = sigma.getCamera().getState();
      const graphW = bounds.maxX - bounds.minX || 1;
      const graphH = bounds.maxY - bounds.minY || 1;
      const w = Math.min(1, cam.ratio);
      const h = Math.min(1, cam.ratio);
      const cx = (cam.x - bounds.minX) / graphW;
      const cy = (cam.y - bounds.minY) / graphH;
      setRect({
        left:   Math.max(0, Math.min(1, cx - w / 2)) * 100,
        top:    Math.max(0, Math.min(1, cy - h / 2)) * 100,
        width:  Math.min(100, w * 100),
        height: Math.min(100, h * 100),
      });
    };

    const tick = () => {
      rafId = 0;
      if (!dirty) return;
      dirty = false;
      compute();
    };

    const onCameraUpdate = () => {
      dirty = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    compute();
    sigma.on("afterRender", onCameraUpdate);
    return () => {
      cancelAnimationFrame(rafId);
      sigma.off("afterRender", onCameraUpdate);
    };
  }, [bounds]);

  return { rect };
}
