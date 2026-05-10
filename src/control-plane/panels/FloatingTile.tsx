/**
 * v86c Floating Tile
 * Floating tile with snap-to-grid and edge magnetism
 */

import { ReactNode, useRef, useState, useEffect } from "react";
import type { TileLayoutEntry } from "./tile.types";
import {
  snapToGrid,
  applyEdgeMagnetism,
  setPointerCaptureSafe,
  releasePointerCaptureSafe,
  isInUnsnapGrip,
} from "./tileUtils";

interface FloatingTileProps {
  tile: TileLayoutEntry;
  otherTiles: TileLayoutEntry[];
  onClose: () => void;
  onUpdate: (updates: Partial<TileLayoutEntry>) => void;
  onBringToFront: () => void;
  children: ReactNode;
}

export function FloatingTile({
  tile,
  otherTiles,
  onClose,
  onUpdate,
  onBringToFront,
  children,
}: FloatingTileProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: tile.x, y: tile.y });
  const [size, setSize] = useState({ w: tile.w, h: tile.h });
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeOffset = useRef({ x: 0, y: 0 });
  const tileRef = useRef<HTMLDivElement>(null);

  // Sync with tile prop changes (e.g., from external updates)
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setPosition({ x: tile.x, y: tile.y });
      setSize({ w: tile.w, h: tile.h });
    }
  }, [tile.x, tile.y, tile.w, tile.h, isDragging, isResizing]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on unsnap grip (top-right corner)
    if (isInUnsnapGrip(position.x, position.y, size.w, e.clientX, e.clientY)) {
      e.stopPropagation();
      onClose();
      return;
    }

    // Check if clicking on close button
    if (target.closest('[data-tile-close]')) {
      return;
    }

    // Check if clicking on resize handle (bottom-right corner)
    if (target.closest('[data-tile-resize]')) {
      e.stopPropagation();
      setIsResizing(true);
      resizeOffset.current = {
        x: e.clientX - size.w,
        y: e.clientY - size.h,
      };
      setPointerCaptureSafe(e.currentTarget as HTMLElement);
      return;
    }

    // Start drag
    e.stopPropagation();
    onBringToFront();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setPointerCaptureSafe(e.currentTarget as HTMLElement);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const newW = e.clientX - resizeOffset.current.x;
      const newH = e.clientY - resizeOffset.current.y;
      setSize({
        w: Math.max(200, newW),
        h: Math.max(150, newH),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      // Apply edge magnetism
      const magnetized = applyEdgeMagnetism(
        position.x,
        position.y,
        size.w,
        size.h,
        otherTiles
      );
      
      // Snap to grid
      const snappedX = snapToGrid(magnetized.x);
      const snappedY = snapToGrid(magnetized.y);
      
      setPosition({ x: snappedX, y: snappedY });
      onUpdate({ x: snappedX, y: snappedY });
    } else if (isResizing) {
      // Snap size to grid
      const snappedW = snapToGrid(size.w);
      const snappedH = snapToGrid(size.h);
      setSize({ w: snappedW, h: snappedH });
      onUpdate({ w: snappedW, h: snappedH });
    }

    setIsDragging(false);
    setIsResizing(false);
    releasePointerCaptureSafe(e.currentTarget as HTMLElement);
  };

  return (
    <div
      ref={tileRef}
      data-tile-id={tile.id}
      style={{
        position: "absolute",
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.w}px`,
        height: `${size.h}px`,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: "8px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
        zIndex: tile.z,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "default",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          backgroundColor: "rgba(30, 41, 59, 0.8)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#e2e8f0",
          }}
        >
          {tile.sectionKey}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {/* Unsnap grip (top-right corner) */}
          <div
            data-tile-unsnap
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "2px",
              backgroundColor: "rgba(148, 163, 184, 0.2)",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#94a3b8",
            }}
            title="Return to panel"
          >
            ⊗
          </div>
          {/* Close button */}
          <button
            data-tile-close
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "2px",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              backgroundColor: "rgba(148, 163, 184, 0.1)",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              padding: 0,
            }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px",
        }}
      >
        {children}
      </div>

      {/* Resize handle */}
      <div
        data-tile-resize
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          width: "16px",
          height: "16px",
          cursor: "nwse-resize",
          background: "linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.4) 50%)",
          borderTopLeftRadius: "4px",
        }}
      />
    </div>
  );
}
