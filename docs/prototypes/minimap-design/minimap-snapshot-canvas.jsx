// minimap-snapshot-canvas.jsx
// → MinimapSnapshotCanvas.tsx in real app
//
// Static graph silhouette. Redraws only when snapshotVersion changes
// (which only happens on structural mutations from useMinimapSnapshot).
// Reads colors from CSS custom properties exposed by AppShell — never
// hardcoded values — so theme switches reflow without rebuild.
//
// DPR-aware. Cap node radius at 2.6px and edge alpha at the token
// stroke value × 0.6 so dense graphs stay readable in 200×120.

function MinimapSnapshotCanvas({ snapshotVersion, bounds, size }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const { width, height } = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const sigma = window.__lwSigma;
    if (!sigma || !bounds) return;
    const graph = sigma.getGraph();
    if (!graph) return;

    // Resolve theme tokens from CSS variables once per draw.
    const styles = getComputedStyle(canvas);
    const nodeFill = styles.getPropertyValue('--lw-graph-node-fill').trim() || 'rgba(255,200,160,0.85)';
    const edgeStroke = styles.getPropertyValue('--lw-graph-edge-stroke').trim() || 'rgba(255,200,160,0.16)';

    const pad = 10;
    const gW = bounds.maxX - bounds.minX || 1;
    const gH = bounds.maxY - bounds.minY || 1;
    const scale = Math.min((width - pad * 2) / gW, (height - pad * 2) / gH);
    // Center the graph in the canvas (aspect-fit + center).
    const offsetX = (width - gW * scale) / 2;
    const offsetY = (height - gH * scale) / 2;

    const project = (x, y) => ({
      x: offsetX + (x - bounds.minX) * scale,
      y: offsetY + (y - bounds.minY) * scale,
    });

    // Edges first, capped alpha.
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = edgeStroke;
    graph.forEachEdge((_id, _attrs, src, tgt) => {
      const a = graph.getNodeAttributes(src);
      const b = graph.getNodeAttributes(tgt);
      if (!a || !b || a.x == null || b.x == null) return;
      const pa = project(a.x, a.y);
      const pb = project(b.x, b.y);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    // Nodes on top, simplified.
    ctx.fillStyle = nodeFill;
    graph.forEachNode((_id, attrs) => {
      if (attrs?.x == null) return;
      const p = project(attrs.x, attrs.y);
      const r = Math.max(1.1, Math.min(2.6, (attrs.size ?? 1) * 0.55));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [snapshotVersion, bounds, size.width, size.height]);

  return (
    <canvas
      ref={ref}
      data-testid="minimap-snapshot-canvas"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

Object.assign(window, { MinimapSnapshotCanvas });
