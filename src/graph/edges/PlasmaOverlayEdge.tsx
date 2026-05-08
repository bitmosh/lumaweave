/**
 * PlasmaOverlayEdge - v86b SVG overlay for animated plasma flow
 * 
 * v86b: SVG overlay over static Sigma edges. Intentionally throwaway.
 * v91 replaces this with full Sigma EdgeProgram.
 * 
 * IMPORTANT: This is a temporary solution. Do not extend this.
 * The overlay paints animated flow on top of static Sigma edges.
 * In large-graph and potato presets, edgePlasmaMode = "static" disables this.
 */

import { useEffect, useState } from "react";
import type Sigma from "sigma";

interface PlasmaOverlayEdgeProps {
  sigma: Sigma;
  edges: Array<{ id: string; source: string; target: string }>;
  motionScale: number;
  flowSpeed: number;
  edgePlasmaMode: "static" | "animated-overlay";
}

interface EdgePath {
  id: string;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

export function PlasmaOverlayEdge({
  sigma,
  edges,
  motionScale,
  flowSpeed,
  edgePlasmaMode,
}: PlasmaOverlayEdgeProps) {
  const [paths, setPaths] = useState<EdgePath[]>([]);

  useEffect(() => {
    if (edgePlasmaMode === "static") {
      setPaths([]);
      return;
    }

    const update = () => {
      const newPaths: EdgePath[] = [];
      edges.forEach((edge) => {
        const a = sigma.getNodeDisplayData(edge.source);
        const b = sigma.getNodeDisplayData(edge.target);
        if (a && b) {
          const sa = sigma.graphToViewport(a);
          const sb = sigma.graphToViewport(b);
          newPaths.push({
            id: edge.id,
            sx: sa.x,
            sy: sa.y,
            tx: sb.x,
            ty: sb.y,
          });
        }
      });
      setPaths(newPaths);
    };

    sigma.on("afterRender", update);
    update();
    return () => {
      sigma.off("afterRender", update);
    };
  }, [sigma, edges, edgePlasmaMode]);

  if (edgePlasmaMode === "static" || paths.length === 0) {
    return null;
  }

  return (
    <svg
      className="plasma-overlay"
      data-testid="plasma-overlay"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <defs>
        <linearGradient id="plasma-flow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.3)" />
        </linearGradient>
      </defs>
      {paths.map((p) => (
        <line
          key={p.id}
          x1={p.sx}
          y1={p.sy}
          x2={p.tx}
          y2={p.ty}
          stroke="url(#plasma-flow)"
          strokeWidth="2"
          style={{
            strokeDasharray: "4 8",
            animation: motionScale > 0
              ? `flow ${4 / flowSpeed}s linear infinite`
              : "none",
          }}
        />
      ))}
    </svg>
  );
}
