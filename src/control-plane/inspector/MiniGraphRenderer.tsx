// SPDX-License-Identifier: Apache-2.0
/**
 * Mini Graph Renderer (bb-design)
 *
 * HTML div-based radial inspector. 320×320 stage, spokes positioned by CSS,
 * animated decorative rings, submenu panel alongside the ring (no physics).
 * Spokes are placed by sorted array index — immune to gaps in order values.
 */

import { useState } from "react";
import type { InspectorSpoke } from "../../themes/inspectorSpokeRegistry";
import type { TargetDescriptor } from "./inspector.types";

const STAGE = 320;
const CENTER = STAGE / 2;
const RING_R = 118;
const RING_BTN = 60;
const SUB_OFFSET = 47;
const SUBMENU_W = 240;
const SUBMENU_MAX_H = 320;
const VP_MARGIN = 8;
// Keeps the ring center below the topbar chrome (~44px) so top spokes never spawn behind it.
const TOPBAR_H = 44;

const angleFor = (index: number, total: number) => (index / total) * 360 - 90;

function SpokeIcon({ spoke, size = 18 }: { spoke: InspectorSpoke; size?: number }) {
  if (!spoke.iconPath) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={spoke.iconFill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={spoke.iconPath} />
    </svg>
  );
}

interface MiniGraphRendererProps {
  targetLabel: string;
  anchorX: number;
  anchorY: number;
  spokes: InspectorSpoke[];
  animationsActive: boolean;
  onClose?: () => void;
  targetDescriptor?: TargetDescriptor;
}

export function MiniGraphRenderer({
  targetLabel,
  anchorX,
  anchorY,
  spokes,
  animationsActive,
  onClose,
  targetDescriptor,
}: MiniGraphRendererProps) {
  const clampedX = Math.max(STAGE / 2, Math.min(window.innerWidth - STAGE / 2, anchorX));
  const clampedY = Math.max(STAGE / 2 + TOPBAR_H, Math.min(window.innerHeight - STAGE / 2, anchorY));

  const [activeSpokeId, setActiveSpokeId] = useState<string | null>(null);

  const activeSpokeIndex = activeSpokeId ? spokes.findIndex((s) => s.id === activeSpokeId) : -1;
  const activeSpoke = activeSpokeIndex >= 0 ? spokes[activeSpokeIndex] : null;
  const TabComponent = activeSpoke?.tabComponent ?? null;
  const ringSpinning = animationsActive && !activeSpoke;

  const handleStageClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (
      t.closest(".lw-radial-spoke") ||
      t.closest(".lw-radial-submenu") ||
      t.closest(".lw-radial-center")
    )
      return;
    if (activeSpokeId) {
      setActiveSpokeId(null);
    } else {
      onClose?.();
    }
  };

  return (
    <div
      data-testid="inspector-mini-graph"
      style={{
        position: "fixed",
        left: clampedX - STAGE / 2,
        top: clampedY - STAGE / 2,
        width: STAGE,
        height: STAGE,
        zIndex: 1100,
        pointerEvents: "auto",
        background: [
          "radial-gradient(circle at 50% 45%, color-mix(in oklab, var(--lw-color-magenta-500) 18%, transparent), transparent 52%)",
          "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--lw-color-purple-500) 14%, transparent), transparent 62%)",
          "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--lw-app-background, #0b0416) 42%, transparent) 0%, transparent 72%)",
        ].join(", "),
      }}
      onClick={handleStageClick}
    >
      <div className="lw-radial-stage" style={{ width: STAGE, height: STAGE }}>
        {/* Decorative rings + crosshairs */}
        <svg
          className={"lw-radial-rings" + (ringSpinning ? " is-spinning" : "")}
          width={STAGE}
          height={STAGE}
          viewBox={`0 0 ${STAGE} ${STAGE}`}
        >
          <g stroke="var(--lw-accent)" strokeWidth="1" fill="none">
            <circle cx={CENTER} cy={CENTER} r={RING_R} strokeDasharray="3 6" opacity="0.55" />
            <circle cx={CENTER} cy={CENTER} r={RING_R - 8} strokeDasharray="2 8" opacity="0.35" />
            {[0, 90, 180, 270].map((deg) => {
              const a = (deg * Math.PI) / 180;
              const r1 = 25, r2 = 42;
              return (
                <line
                  key={deg}
                  x1={CENTER + r1 * Math.cos(a)}
                  y1={CENTER + r1 * Math.sin(a)}
                  x2={CENTER + r2 * Math.cos(a)}
                  y2={CENTER + r2 * Math.sin(a)}
                  strokeDasharray="2 3"
                  opacity="0.55"
                />
              );
            })}
          </g>
        </svg>

        {/* Center button */}
        <button
          type="button"
          className={"lw-radial-center" + (activeSpoke ? " is-active" : "")}
          aria-label={activeSpoke ? "Close" : targetLabel}
          title={activeSpoke ? "Close" : "Click any spoke"}
          onClick={() => (activeSpoke ? setActiveSpokeId(null) : onClose?.())}
          style={{ left: CENTER, top: CENTER }}
        >
          {activeSpoke ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="8" cy="8" r="2.4" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Spoke buttons — indexed for even spacing regardless of order gaps */}
        {spokes.map((spoke, index) => {
          const isOpen = spoke.id === activeSpokeId;
          const isDim = !!activeSpoke && !isOpen;
          const a = (angleFor(index, spokes.length) * Math.PI) / 180;
          const x = CENTER + RING_R * Math.cos(a);
          const y = CENTER + RING_R * Math.sin(a);

          return (
            <button
              type="button"
              key={spoke.id}
              data-spoke-id={spoke.id}
              data-lw-theme-target="inspector.spoke"
              data-placeholder={spoke.status === "placeholder" ? "true" : undefined}
              className={
                "lw-radial-spoke" +
                (isOpen ? " is-open" : "") +
                (isDim ? " is-dim" : "") +
                (spoke.status === "beta" ? " is-beta" : "") +
                (spoke.status === "placeholder" ? " is-placeholder" : "")
              }
              style={{ left: x, top: y, width: RING_BTN, height: RING_BTN }}
              onClick={() => setActiveSpokeId(isOpen ? null : spoke.id)}
              title={(spoke.label ?? spoke.name) + (spoke.status === "beta" ? " · beta" : "")}
            >
              <SpokeIcon spoke={spoke} />
              <span className="lw-radial-spoke-label">{spoke.label ?? spoke.name}</span>
              {spoke.status === "beta" && <span className="lw-radial-spoke-tag">β</span>}
            </button>
          );
        })}

        {/* Submenu panel — viewport-clamped, no transform */}
        {activeSpoke && TabComponent && targetDescriptor && (() => {
          const a = (angleFor(activeSpokeIndex, spokes.length) * Math.PI) / 180;
          const cosA = Math.cos(a);
          const sinA = Math.sin(a);
          const containerLeft = clampedX - STAGE / 2;
          const containerTop = clampedY - STAGE / 2;

          // Anchor point in viewport coords — SUB_OFFSET outward from the spoke center
          const anchorVx = containerLeft + CENTER + (RING_R + SUB_OFFSET) * cosA;
          const anchorVy = containerTop + CENTER + (RING_R + SUB_OFFSET) * sinA;

          // Desired viewport left/top: align the near edge of the submenu with the anchor
          const desiredLeft = anchorVx + ((-50 + cosA * 50) / 100) * SUBMENU_W;
          const desiredTop = anchorVy + ((-50 + sinA * 50) / 100) * SUBMENU_MAX_H;

          // Clamp to viewport
          let subLeft = Math.max(VP_MARGIN, Math.min(window.innerWidth - SUBMENU_W - VP_MARGIN, desiredLeft));
          let subTop = Math.max(VP_MARGIN, Math.min(window.innerHeight - SUBMENU_MAX_H - VP_MARGIN, desiredTop));

          // Spoke clearance: if clamping pushed the submenu back over the active spoke button, nudge it below
          const spokeVy = containerTop + CENTER + RING_R * sinA;
          const spokeClearBot = spokeVy + RING_BTN / 2 + 6;
          if (subTop < spokeClearBot) {
            subTop = Math.min(window.innerHeight - SUBMENU_MAX_H - VP_MARGIN, spokeClearBot);
          }

          return (
            <div
              className="lw-radial-submenu"
              style={{
                left: subLeft - containerLeft,
                top: subTop - containerTop,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lw-radial-submenu-head">
                <SpokeIcon spoke={activeSpoke} size={13} />
                <span>{activeSpoke.label ?? activeSpoke.name}</span>
              </div>
              <div className="lw-radial-submenu-body">
                <TabComponent
                  targetDescriptor={targetDescriptor}
                  onClose={() => setActiveSpokeId(null)}
                />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
