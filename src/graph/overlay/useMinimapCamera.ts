import { useState, useEffect, useRef } from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

export interface MinimapViewportRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MINIMAP_PAD = 10; // must match MinimapSnapshotCanvas pad constant

/**
 * v104.0.5: Rewritten to correctly project the sigma visible rect onto the
 * minimap snapshot canvas using the IDENTICAL projection formula.
 *
 * Key fixes vs v104.0.3:
 *
 * 1. Math.min/max for visMinX/Y, visMaxX/Y — handles sigma's Y-axis inversion.
 *    sigma.viewportToGraph({x:0, y:0}) returns the LARGE raw Y (sigma renders
 *    with Y↑: large Y = visual top). Math.min picks the correct "snapshot top"
 *    regardless of which viewport corner has which value.
 *
 * 2. sigma.getDimensions() instead of container.clientWidth — getDimensions()
 *    is sigma's own internal canvas size, always available after mount. The
 *    container.clientWidth can be 0 if the effect runs before DOM layout.
 *
 * 3. Bounds + areaSize stored in refs; sigma listener mounted ONCE (effect deps
 *    []). Previously deps=[bounds, areaSize] caused cleanup/setup on every
 *    bounds change during settle (every 150ms), and the initial compute() ran
 *    before sigma had re-rendered → stale/zero dimensions.
 *
 * The rect projection MUST be identical to MinimapSnapshotCanvas's:
 *   scale   = min((areaW - pad*2) / gW, (areaH - pad*2) / gH)  // uniform aspect-fit
 *   offsetX = (areaW - gW * scale) / 2                          // centered
 *   offsetY = (areaH - gH * scale) / 2
 *   canvasX = offsetX + (graphX - bounds.minX) * scale
 *   canvasY = offsetY + (graphY - bounds.minY) * scale           // NO Y-flip
 */
export function useMinimapCamera(
  bounds: MinimapBounds | null,
  areaSize: { width: number; height: number } | null,
): { rect: MinimapViewportRect | null } {
  const [rect, setRect] = useState<MinimapViewportRect | null>(null);

  // Refs so the sigma listener (mounted once) always reads the latest values
  // without being torn down and recreated on every bounds change.
  const boundsRef = useRef(bounds);
  const areaSizeRef = useRef(areaSize);

  boundsRef.current = bounds;
  areaSizeRef.current = areaSize;

  // Clear rect when required inputs become unavailable.
  useEffect(() => {
    if (!bounds || !areaSize) setRect(null);
  }, [bounds, areaSize]);

  // Main effect: mount sigma listener ONCE. Reads bounds/areaSize from refs.
  useEffect(() => {
    let rafId = 0;
    let dirty = false;
    let sigmaRef: unknown = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const compute = () => {
      const s = (window as any).__lwSigma;
      const b = boundsRef.current;
      const a = areaSizeRef.current;
      if (!s || !b || !a) { setRect(null); return; }

      // sigma.getDimensions() = sigma's internal canvas pixel size. Always
      // valid after mount; more reliable than getContainer().clientWidth.
      const dims = s.getDimensions?.() as { width: number; height: number } | undefined;
      const vpW = dims?.width ?? 0;
      const vpH = dims?.height ?? 0;
      if (!vpW || !vpH) return;

      // Visible graph rect via viewportToGraph. Math.min/max handles sigma's
      // Y↑ axis convention (top of viewport = LARGE raw Y = near maxY).
      const tl = s.viewportToGraph({ x: 0,   y: 0   });
      const br = s.viewportToGraph({ x: vpW, y: vpH });
      const visMinX = Math.min(tl.x, br.x);
      const visMaxX = Math.max(tl.x, br.x);
      const visMinY = Math.min(tl.y, br.y);
      const visMaxY = Math.max(tl.y, br.y);

      // Identical projection to MinimapSnapshotCanvas (same scale + offsets).
      const { width: areaW, height: areaH } = a;
      const gW = b.maxX - b.minX || 1;
      const gH = b.maxY - b.minY || 1;
      const scale   = Math.min((areaW - MINIMAP_PAD * 2) / gW, (areaH - MINIMAP_PAD * 2) / gH);
      const offsetX = (areaW - gW * scale) / 2;
      const offsetY = (areaH - gH * scale) / 2;

      const projX = (gx: number) => offsetX + (gx - b.minX) * scale;
      // Y-flip: sigma Y↑ → minimap canvas Y↓. Matches MinimapSnapshotCanvas.
      const projY = (gy: number) => offsetY + (b.maxY - gy) * scale;

      const leftPx  = projX(visMinX);
      const rightPx = projX(visMaxX);
      const topPx   = projY(visMaxY); // visMaxY → smallest canvas Y (top of minimap)
      const botPx   = projY(visMinY); // visMinY → largest canvas Y (bottom of minimap)

      setRect({
        left:   (leftPx  / areaW) * 100,
        top:    (Math.min(topPx, botPx) / areaH) * 100,
        width:  ((rightPx - leftPx) / areaW) * 100,
        height: (Math.abs(botPx - topPx)  / areaH) * 100,
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

    const attach = (s: unknown) => {
      sigmaRef = s;
      compute();
      (s as any).on("afterRender", onCameraUpdate);
    };

    if ((window as any).__lwSigma) {
      attach((window as any).__lwSigma);
    } else {
      pollTimer = setInterval(() => {
        if ((window as any).__lwSigma) {
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
          attach((window as any).__lwSigma);
        }
      }, 200);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      cancelAnimationFrame(rafId);
      try { (sigmaRef as any)?.off("afterRender", onCameraUpdate); } catch { /* ok */ }
    };
  }, []); // mount once — bounds/areaSize read from refs

  return { rect };
}
