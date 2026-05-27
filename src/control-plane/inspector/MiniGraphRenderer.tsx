/**
 * Mini Graph Renderer
 *
 * SVG-based inspector radial. Renders root node + spoke nodes with physics.
 * ~30-line rAF physics tick: gravity to root + repulsion from siblings + damping.
 */

import { useEffect, useRef, useState } from "react";
import type { InspectorSpoke } from "../../themes/inspectorSpokeRegistry";
import type { TargetDescriptor } from "./inspector.types";
import { t } from "../../i18n";
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
  onClose?: () => void;
  targetDescriptor?: TargetDescriptor;
}

export function MiniGraphRenderer({
  targetLabel,
  anchorX,
  anchorY,
  spokes,
  onClose,
  targetDescriptor,
}: MiniGraphRendererProps) {
  // Clamp anchor so the 320×320 SVG container stays within the viewport.
  // Computed before hooks so effects and display both use the same origin.
  const svgSize = 320;
  const clampedAnchorX = Math.max(svgSize / 2, Math.min(window.innerWidth - svgSize / 2, anchorX));
  const clampedAnchorY = Math.max(svgSize / 2, Math.min(window.innerHeight - svgSize / 2, anchorY));

  const [spokePositions, setSpokePositions] = useState<SpokePosition[]>([]);
  const [expandedSpokeId, setExpandedSpokeId] = useState<string | null>(null);
  const rafId = useRef<number | null>(null);
  const positionsRef = useRef<SpokePosition[]>([]);

  // Initialize spoke positions in a circle around the clamped anchor
  useEffect(() => {
    const positions: SpokePosition[] = [];

    if (spokes.length > 0) {
      // Use registered spokes
      spokes.forEach((spoke, i) => {
        const angle = (2 * Math.PI * i) / spokes.length;
        positions.push({
          id: spoke.id,
          label: t(`inspector.spokes.${spoke.id}.label`),
          x: clampedAnchorX + RADIUS * Math.cos(angle),
          y: clampedAnchorY + RADIUS * Math.sin(angle),
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
          x: clampedAnchorX + RADIUS * Math.cos(rad),
          y: clampedAnchorY + RADIUS * Math.sin(rad),
          vx: 0,
          vy: 0,
        });
      });
    }

    positionsRef.current = positions;
    setSpokePositions(positions);
  }, [spokes, clampedAnchorX, clampedAnchorY]);

  // Physics tick
  useEffect(() => {
    if (spokePositions.length === 0) return;

    const tick = () => {
      const positions = positionsRef.current;
      let totalMovement = 0;

      for (let i = 0; i < positions.length; i++) {
        const spoke = positions[i];

        // Attraction to root (gravity + spring) — use clamped origin
        const dx = clampedAnchorX - spoke.x;
        const dy = clampedAnchorY - spoke.y;
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
  }, [clampedAnchorX, clampedAnchorY, spokePositions.length]);

  const svgLeft = clampedAnchorX - svgSize / 2;
  const svgTop = clampedAnchorY - svgSize / 2;

  // Convert page coordinates to SVG viewBox coordinates (relative to SVG's position)
  const anchorXInView = clampedAnchorX - svgLeft;
  const anchorYInView = clampedAnchorY - svgTop;

  // Get expanded spoke if any
  const expandedSpoke = expandedSpokeId ? spokes.find((s) => s.id === expandedSpokeId) : null;
  const TabComponent = expandedSpoke?.tabComponent;

  // If a spoke is expanded and has a tab component, show it
  if (expandedSpokeId && TabComponent && targetDescriptor) {
    return (
      <div
        data-testid="inspector-mini-graph"
        className="inspector-mini-graph-tab"
        style={{
          position: "fixed",
          left: svgLeft,
          top: svgTop,
          width: svgSize,
          height: svgSize,
          zIndex: 80,
          pointerEvents: "auto",
          overflow: "auto",
        }}
      >
        <TabComponent
          targetDescriptor={targetDescriptor}
          onClose={() => setExpandedSpokeId(null)}
        />
      </div>
    );
  }

  // Ring view (default)
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
          x1={anchorXInView}
          y1={anchorYInView}
          x2={spoke.x - svgLeft}
          y2={spoke.y - svgTop}
          stroke="rgba(255, 179, 71, 0.3)"
          strokeWidth="1"
          pointerEvents="none"
        />
      ))}

      {/* Root node */}
      <RootNode
        label={targetLabel}
        x={anchorXInView}
        y={anchorYInView}
        radius={20}
      />

      {/* Spoke nodes */}
      {spokePositions.map((spoke) => {
        const spokeEntry = spokes.find((s) => s.id === spoke.id);
        const isPlaceholder = spokeEntry?.status === "placeholder";
        return (
          <SpokeNode
            key={`spoke-${spoke.id}`}
            spokeId={spoke.id}
            label={spoke.label}
            x={spoke.x - svgLeft}
            y={spoke.y - svgTop}
            radius={14}
            isPlaceholder={isPlaceholder}
            onClick={() => {
              if (!spoke.id.startsWith("placeholder")) {
                setExpandedSpokeId(spoke.id);
              }
            }}
          />
        );
      })}
    </svg>
  );
}
