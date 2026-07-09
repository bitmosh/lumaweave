// SPDX-License-Identifier: Apache-2.0
import type { MinimapViewportRect as MinimapViewportRectType } from "./useMinimapCamera";

interface MinimapViewportRectProps {
  rect: MinimapViewportRectType | null;
}

export function MinimapViewportRect({ rect }: MinimapViewportRectProps) {
  if (!rect) return null;
  return (
    <div
      data-testid="minimap-viewport-rect"
      data-lw-theme-target="minimap.viewport-rect"
      style={{
        position: "absolute",
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        border: "1px solid var(--lw-accent)",
        background: "oklch(from var(--lw-accent) l c h / 0.10)",
        boxShadow:
          "0 0 10px oklch(from var(--lw-accent) l c h / 0.45)," +
          " inset 0 0 0 1px rgba(255,255,255,0.12)",
        pointerEvents: "none",
        borderRadius: 2,
        transition: "left 100ms linear, top 100ms linear, width 100ms linear, height 100ms linear",
        boxSizing: "border-box",
      }}
    >
      {([
        { top: -2, left: -2 },
        { top: -2, right: -2 },
        { bottom: -2, left: -2 },
        { bottom: -2, right: -2 },
      ] as React.CSSProperties[]).map((c, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width: 5,
            height: 5,
            background: "var(--lw-accent)",
            borderRadius: 1,
            ...c,
          }}
        />
      ))}
    </div>
  );
}
