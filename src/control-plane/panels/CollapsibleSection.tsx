import { ReactNode, useRef } from "react";
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
  const { tiles, tearOff } = useTileContext();
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const isTiledOut = Array.from(tiles.values()).some((t) => t.sectionKey === tileableKey);

  const handleTearOffPointerDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTearOffPointerMove = (e: React.MouseEvent) => {
    if (!dragStartPos.current) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance >= 8 && tileableKey) {
      tearOff(tileableKey, e.clientX, e.clientY);
      dragStartPos.current = null;
    }
  };

  const handleTearOffPointerUp = () => {
    dragStartPos.current = null;
  };

  return (
    <div
      data-testid={testId}
      data-lw-theme-target="ignore"
      data-tiled-out={isTiledOut ? "true" : undefined}
      style={{
        marginBottom: "8px",
        ...(isTiledOut && {
          opacity: 0.5,
          border: "1px dashed rgba(34,211,238,0.3)",
          animation: "pulse 2s infinite",
        }),
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid={testId ? `${testId}-toggle` : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${borderColor}`,
          cursor: "pointer",
          color: accentColor,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {tileableKey && (
            <span
              onPointerDown={handleTearOffPointerDown}
              onPointerMove={handleTearOffPointerMove}
              onPointerUp={handleTearOffPointerUp}
              onPointerLeave={handleTearOffPointerUp}
              style={{
                fontSize: "12px",
                cursor: "grab",
                userSelect: "none",
                opacity: 0.7,
              }}
              title="Tear off as tile"
            >
              ⤴
            </span>
          )}
          <span style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.15s ease",
            fontSize: "10px",
          }}>
            ▼
          </span>
        </div>
      </button>
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
    </div>
  );
}
