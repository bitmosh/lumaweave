// use-minimap-camera.jsx
// → useMinimapCamera.ts in real app
//
// Subscribes to Sigma camera updates and translates camera state
// into a minimap-local viewport rectangle expressed as percentages
// of the snapshot bounds. Returns null when bounds are missing
// (empty graph) — the caller renders no rectangle in that case.
//
// Real-app boundary:
//   - (window as any).__lwSigma.on('afterRender', ...)
//   - sigma.getCamera().getState() returns { x, y, ratio }
//   - x/y are camera CENTER in graph coords; ratio is zoom (smaller
//     = more zoomed in; the camera "sees" a window of size 1/ratio
//     in the [0,1] graph-coord system Sigma normalizes to).
//
// Camera updates are high-frequency — we throttle via rAF rather than
// rerendering on every event.

function useMinimapCamera(bounds) {
  const [rect, setRect] = React.useState(null);

  React.useEffect(() => {
    const sigma = window.__lwSigma;
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
      // Sigma camera "ratio" semantics: viewport covers an area of
      // approximately (ratio × graphW) by (ratio × graphH) centered
      // at (cam.x, cam.y). For minimap-local %, divide by graph size.
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
    sigma.on('afterRender', onCameraUpdate);
    return () => {
      cancelAnimationFrame(rafId);
      sigma.off('afterRender', onCameraUpdate);
    };
  }, [bounds]);

  return { rect };
}

Object.assign(window, { useMinimapCamera });
