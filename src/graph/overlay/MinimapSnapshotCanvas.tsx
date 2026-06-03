import { useRef, useEffect } from "react";
import type { MinimapBounds } from "./useMinimapSnapshot";

interface MinimapSnapshotCanvasProps {
  snapshotVersion: number;
  bounds: MinimapBounds | null;
  size: { width: number; height: number };
}

export function MinimapSnapshotCanvas({ snapshotVersion, bounds, size }: MinimapSnapshotCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const { width, height } = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const sigma = (window as any).__lwSigma;
    if (!sigma || !bounds) return;
    const graph = sigma.getGraph();
    if (!graph) return;

    const styles = getComputedStyle(canvas);
    const nodeFill = styles.getPropertyValue("--lw-graph-node-fill").trim() || "rgba(255,200,160,0.85)";
    const edgeStroke = styles.getPropertyValue("--lw-graph-edge-stroke").trim() || "rgba(255,200,160,0.16)";

    const pad = 10;
    const gW = bounds.maxX - bounds.minX || 1;
    const gH = bounds.maxY - bounds.minY || 1;
    const scale = Math.min((width - pad * 2) / gW, (height - pad * 2) / gH);
    const offsetX = (width - gW * scale) / 2;
    const offsetY = (height - gH * scale) / 2;

    // Y-flip: sigma renders with Y↑ (large raw Y = visual top). Flip here so
    // the minimap snapshot has the same orientation as the main sigma view.
    const project = (x: number, y: number) => ({
      x: offsetX + (x - bounds.minX) * scale,
      y: offsetY + (bounds.maxY - y) * scale,
    });

    ctx.lineWidth = 0.6;
    ctx.strokeStyle = edgeStroke;
    graph.forEachEdge((_id: string, _attrs: unknown, src: string, tgt: string) => {
      const a = graph.getNodeAttributes(src);
      const b = graph.getNodeAttributes(tgt);
      if (!a || !b || a.x == null || b.x == null) return;
      const pa = project(a.x as number, a.y as number);
      const pb = project(b.x as number, b.y as number);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    });

    ctx.fillStyle = nodeFill;
    graph.forEachNode((_id: string, attrs: Record<string, unknown>) => {
      if (attrs?.x == null) return;
      const p = project(attrs.x as number, attrs.y as number);
      const r = Math.max(1.1, Math.min(2.6, ((attrs.size as number ?? 1)) * 0.55));
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [snapshotVersion, bounds, size.width, size.height]);

  return (
    <canvas
      ref={ref}
      data-testid="minimap-snapshot-canvas"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
