/**
 * Mini Graph Renderer
 *
 * SVG-based inspector radial. Renders root node + spoke nodes with physics.
 * ~30-line rAF physics tick: gravity to root + repulsion from siblings + damping.
 */

import { useEffect, useRef, useState } from "react";
import type { InspectorSpoke } from "../../themes/inspectorSpokeRegistry";
import { RootNode } from "./RootNode";
import { SpokeNode } from "./SpokeNode";

// Physics constants
const RADIUS = 70;
const SPRING_K = 0.02;
const REPULSION_RADIUS = 60;
const REPULSION_K = 80;
const DAMPING = 0.85;
const VELOCITY_THRESHOLD = 0.5;

interface SpokePosition {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface MiniGraphRendererProps {
  targetLabel: string;
  anchorX: number;
  anchorY: number;
  spokes: InspectorSpoke[];
  onSpokeClick?: (spokeId: string) => void;
  onClose?: () => void;
}

export function MiniGraphRenderer({
  targetLabel,
  anchorX,
  anchorY,
  spokes,
  onSpokeClick,
  onClose,
}: MiniGraphRendererProps) {
  const [spokePositions, setSpokePositions] = useState<SpokePosition[]>([]);
  const rafId = useRef<number | null>(null);
  const positionsRef = useRef<SpokePosition[]>([]);

  // Initialize spoke positions in a circle
  useEffect(() => {
    const positions: SpokePosition[] = [];

    if (spokes.length > 0) {
      // Use registered spokes
      spokes.forEach((spoke, i) => {
        const angle = (2 * Math.PI * i) / spokes.length;
        positions.push({
          id: spoke.id,
          label: spoke.label ?? spoke.name,
          x: anchorX + RADIUS * Math.cos(angle),
          y: anchorY + RADIUS * Math.sin(angle),
          vx: 0,
          vy: 0,
        });
      });
    } else {
      // 4 placeholder slots: 0°, 90°, 180°, 270°
      [0, 90, 180, 270].forEach((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        positions.push({
          id: `placeholder-${i}`,
          label: "",
          x: anchorX + RADIUS * Math.cos(rad),
          y: anchorY + RADIUS * Math.sin(rad),
          vx: 0,
          vy: 0,
        });
      });
    }

    positionsRef.current = positions;
    setSpokePositions(positions);
  }, [spokes, anchorX, anchorY]);

  // Physics tick
  useEffect(() => {
    if (spokePositions.length === 0) return;

    const tick = () => {
      const positions = positionsRef.current;
      let totalMovement = 0;

      for (let i = 0; i < positions.length; i++) {
        const spoke = positions[i];

        // Attraction to root (gravity + spring)
        const dx = anchorX - spoke.x;
        const dy = anchorY - spoke.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const targetDist = RADIUS;

        if (dist > 0.01) {
          const springForce = (dist - targetDist) * SPRING_K;
          spoke.vx += (dx / dist) * springForce;
          spoke.vy += (dy / dist) * springForce;
        }

        // Repulsion from other spokes
        for (let j = 0; j < positions.length; j++) {
          if (i === j) continue;
          const other = positions[j];
          const odx = spoke.x - other.x;
          const ody = spoke.y - other.y;
          const odist = Math.sqrt(odx * odx + ody * ody);

          if (odist < REPULSION_RADIUS && odist > 0.01) {
            const force = REPULSION_K / (odist * odist);
            spoke.vx += (odx / odist) * force;
            spoke.vy += (ody / odist) * force;
          }
        }

        // Damping
        spoke.vx *= DAMPING;
        spoke.vy *= DAMPING;

        // Integrate
        spoke.x += spoke.vx;
        spoke.y += spoke.vy;

        totalMovement += Math.abs(spoke.vx) + Math.abs(spoke.vy);
      }

      setSpokePositions([...positions]);

      // Continue if movement exceeds threshold
      if (totalMovement > VELOCITY_THRESHOLD) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        rafId.current = null;
      }
    };

    rafId.current = requestAnimationFrame(tick);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [anchorX, anchorY, spokePositions.length]);

  // Clamp anchor to viewport bounds (keep radial visible)
  const clampedAnchorX = Math.max(RADIUS + 20, Math.min(window.innerWidth - RADIUS - 20, anchorX));
  const clampedAnchorY = Math.max(RADIUS + 20, Math.min(window.innerHeight - RADIUS - 20, anchorY));

  const svgSize = 320;
  const svgLeft = clampedAnchorX - svgSize / 2;
  const svgTop = clampedAnchorY - svgSize / 2;

  return (
    <svg
      data-testid="inspector-mini-graph"
      className="inspector-mini-graph"
      style={{
        position: "fixed",
        left: svgLeft,
        top: svgTop,
        width: svgSize,
        height: svgSize,
        zIndex: 80,
        pointerEvents: "auto",
      }}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      onClick={(e) => {
        // Clicking outside SVG content closes
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      {/* Spokes lines from root to each spoke */}
      {spokePositions.map((spoke) => (
        <line
          key={`line-${spoke.id}`}
          x1={clampedAnchorX}
          y1={clampedAnchorY}
          x2={spoke.x}
          y2={spoke.y}
          stroke="rgba(255, 179, 71, 0.3)"
          strokeWidth="1"
          pointerEvents="none"
        />
      ))}

      {/* Root node */}
      <RootNode
        label={targetLabel}
        x={clampedAnchorX}
        y={clampedAnchorY}
        radius={20}
      />

      {/* Spoke nodes */}
      {spokePositions.map((spoke) => (
        <SpokeNode
          key={`spoke-${spoke.id}`}
          spokeId={spoke.id}
          label={spoke.label}
          x={spoke.x}
          y={spoke.y}
          radius={14}
          onClick={() => {
            if (onSpokeClick && !spoke.id.startsWith("placeholder")) {
              onSpokeClick(spoke.id);
            }
          }}
        />
      ))}
    </svg>
  );
}
