import { ReactNode } from "react";
import { useTileContext } from "./TileProvider";
import { TiledOutIndicator } from "./TiledOutIndicator";

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
        // Create tile at pixel-precise position (no quantization)
        createdTileId = tileOut(tileableKey, {
          x: ev.clientX - 60,
          y: ev.clientY - 14
        });
      }
      if (createdTileId) {
        // Continue dragging with pixel-precise positioning
        updateTile(createdTileId, {
          x: ev.clientX - 60,
          y: ev.clientY - 14
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
      <div
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? "2000px" : "0px",
          transition: "max-height 0.2s ease",
        }}
      >
        <div style={{ padding: "12px 0" }}>
          {tiledOut ? (
            <TiledOutIndicator
              testId={testId ? `${testId}-tiled-indicator` : undefined}
            />
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
