import { useState, useEffect } from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MINIMAP_PAD = 10; // must match MinimapSnapshotCanvas pad constant

/**
 * v104.0.3: Rewritten to use sigma.viewportToGraph on viewport corners.
 *
 * Previous approach used cam.ratio in Sigma's NORMALIZED space as the visible
 * fraction of raw graphology attribute bounds — mismatched coordinate systems
 * caused inverted Y, off-center alignment, and zoom not resizing the rect.
 *
 * This version:
 * 1. Gets the visible graph rectangle by projecting viewport corners through
 *    sigma.viewportToGraph, which returns raw attribute-space coords (same
 *    space as bounds). No ratio math, no normalization mismatch.
 * 2. Projects those corners through the SAME uniform-centered projection that
 *    MinimapSnapshotCanvas uses (same scale, same offsetX/offsetY, same pad).
 *    This aligns the rect with the drawn nodes exactly.
 * 3. areaSize (canvas area pixel dimensions) is passed from Minimap.tsx so
 *    scale + offsets match the snapshot's actual render size.
 */
export function useMinimapCamera(
  bounds: MinimapBounds | null,
  areaSize: { width: number; height: number } | null,
): { rect: MinimapViewportRect | null } {
  const [rect, setRect] = useState<MinimapViewportRect | null>(null);

  useEffect(() => {
    const sigma = (window as any).__lwSigma;
    if (!sigma || !bounds || !areaSize) {
      setRect(null);
      return;
    }

    let rafId = 0;
    let dirty = false;

    const compute = () => {
      const freshSigma = (window as any).__lwSigma;
      if (!freshSigma || !bounds || !areaSize) { setRect(null); return; }

      // Viewport corners → graph coords (raw attribute space, same as bounds).
      const container = freshSigma.getContainer();
      const vpW = container.clientWidth;
      const vpH = container.clientHeight;
      const tl = freshSigma.viewportToGraph({ x: 0, y: 0 });
      const br = freshSigma.viewportToGraph({ x: vpW, y: vpH });

      // Shared projection with MinimapSnapshotCanvas:
      //   scale = uniform aspect-fit, offsetX/offsetY = centered
      const { width: areaW, height: areaH } = areaSize;
      const gW = bounds.maxX - bounds.minX || 1;
      const gH = bounds.maxY - bounds.minY || 1;
      const scale = Math.min(
        (areaW - MINIMAP_PAD * 2) / gW,
        (areaH - MINIMAP_PAD * 2) / gH,
      );
      const offsetX = (areaW - gW * scale) / 2;
      const offsetY = (areaH - gH * scale) / 2;

      // Project visible corners and normalize to % of area.
      const rawLeft   = (offsetX + (tl.x - bounds.minX) * scale) / areaW * 100;
      const rawTop    = (offsetY + (tl.y - bounds.minY) * scale) / areaH * 100;
      const rawWidth  = Math.abs(br.x - tl.x) * scale / areaW * 100;
      const rawHeight = Math.abs(br.y - tl.y) * scale / areaH * 100;

      setRect({
        left:   Math.max(0, Math.min(100, rawLeft)),
        top:    Math.max(0, Math.min(100, rawTop)),
        width:  Math.min(100, rawWidth),
        height: Math.min(100, rawHeight),
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
  }, [bounds, areaSize]);

  return { rect };
}
