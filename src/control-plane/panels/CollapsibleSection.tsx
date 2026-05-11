import { ReactNode } from "react";
import { useTileContext } from "./TileProvider";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  testId?: string;
  accentColor?: string;
  borderColor?: string;
  tileableKey?: string;
}

const TILE_GRID = 16;

const snap = (v: number) => Math.round(v / TILE_GRID) * TILE_GRID;

export function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  testId,
  accentColor = "#22d3ee",
  borderColor = "rgba(34,211,238,0.1)",
  tileableKey,
}: CollapsibleSectionProps) {
  const { tileOut, isTiledOut, updateTile } = useTileContext();
  const tiledOut = tileableKey ? isTiledOut(tileableKey) : false;

  const handleTearOffMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tiledOut) return;
    if (!tileableKey) return;

    const startX = e.clientX, startY = e.clientY;
    let createdTileId: string | null = null;

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!createdTileId && Math.hypot(dx, dy) > 8) {
        // Threshold reached: create tile
        createdTileId = tileOut(tileableKey, {
          x: snap(ev.clientX - 60),
          y: snap(ev.clientY - 14)
        });
      }
      if (createdTileId) {
        // Continue dragging the created tile
        updateTile(createdTileId, {
          x: snap(ev.clientX - 60),
          y: snap(ev.clientY - 14)
        });
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      data-testid={testId}
      data-lw-theme-target="ignore"
      data-tiled-out={tiledOut ? "true" : undefined}
      style={{
        marginBottom: "8px",
        ...(tiledOut && {
          opacity: 0.5,
          border: "1px dashed rgba(34,211,238,0.3)",
          animation: "pulse 2s ease-in-out infinite",
          cursor: "not-allowed",
        }),
      }}
      onClickCapture={tiledOut ? (e) => { e.stopPropagation(); e.preventDefault(); } : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 8px", borderBottom: `1px solid ${borderColor}` }}>
        <button
          onClick={onToggle}
          disabled={tiledOut}
          aria-expanded={isOpen}
          data-testid={testId ? `${testId}-toggle` : undefined}
          style={{
            background: "transparent",
            border: "none",
            padding: "0",
            cursor: "pointer",
            color: accentColor,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flex: 1,
          }}
        >
          <span style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
            fontSize: "10px",
          }}>
            ▼
          </span>
          <span>{title}</span>
        </button>
        <span style={{ flex: "0 0 auto" }} />
        {tileableKey && (
          <button
            onMouseDown={handleTearOffMouseDown}
            disabled={tiledOut}
            style={{
              background: "transparent",
              border: "none",
              padding: "0",
              cursor: tiledOut ? "not-allowed" : "grab",
              fontSize: "12px",
              opacity: tiledOut ? 0.3 : 0.7,
              userSelect: "none",
            }}
            title={tiledOut ? "Already tiled out" : "Drag to tear off as tile"}
          >
            ⤴
          </button>
        )}
      </div>
      {!tiledOut && (
        <div
          style={{
            overflow: "hidden",
            maxHeight: isOpen ? "2000px" : "0px",
            transition: "max-height 0.2s ease",
          }}
        >
          <div style={{ padding: "12px 0" }}>
            {children}
          </div>
        </div>
      )}
      {tiledOut && (
        <div
          className="tile-ghost-indicator"
          style={{
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 12px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--lw-flare-gold, #f59e0b)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        >
          <span>Tiled out</span>
          <span
            className="tile-ghost-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--lw-flare-gold, #f59e0b)",
            }}
          />
        </div>
      )}
    </div>
  );
}
