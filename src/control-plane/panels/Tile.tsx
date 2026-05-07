import { useState, useRef, useEffect } from "react";

interface TileProps {
  tabId: string;
  title: string;
  initialWidth: number;
  initialHeight: number;
  onClose: () => void;
  children: React.ReactNode;
}

export function Tile({
  tabId,
  title,
  initialWidth,
  initialHeight,
  onClose,
  children,
}: TileProps) {
  const [position, setPosition] = useState({
    x: window.innerWidth / 2 - initialWidth / 2,
    y: window.innerHeight / 2 - initialHeight / 2,
  });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [zIndex, setZIndex] = useState(1000);

  const tileRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const MIN_WIDTH = 240;
  const MIN_HEIGHT = 300;

  const bringToFront = () => {
    setZIndex((prev) => prev + 1);
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-tile-close]')) return;
    bringToFront();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  };

  // Handle mouse move (drag or resize)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      } else if (isResizing && resizeDirection) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(MIN_WIDTH, resizeStart.current.width + dx);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(MIN_WIDTH, resizeStart.current.width - dx);
          newX = position.x + dx;
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStart.current.height + dy);
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(MIN_HEIGHT, resizeStart.current.height - dy);
          newY = position.y + dy;
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDirection, position, size]);

  return (
    <div
      ref={tileRef}
      data-testid={`tile-${tabId}`}
      onClick={bringToFront}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        borderRadius: '0.75rem',
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleDragStart}
        style={{
          padding: '0.75rem',
          borderBottom: '1px solid #334155',
          backgroundColor: '#1e293b',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
        }}
      >
        <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.875rem' }}>
          {title}
        </span>
        <button
          data-tile-close
          onClick={onClose}
          data-testid={`tile-${tabId}-close`}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            fontSize: '1.25rem',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
        }}
      >
        {children}
      </div>

      {/* Resize handles */}
      <div
        onMouseDown={(e) => handleResizeStart(e, 'n')}
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '4px',
          cursor: 'ns-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 's')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '4px',
          cursor: 'ns-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '40px',
          cursor: 'ew-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '4px',
          height: '40px',
          cursor: 'ew-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '12px',
          height: '12px',
          cursor: 'nesw-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '12px',
          height: '12px',
          cursor: 'nwse-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '12px',
          height: '12px',
          cursor: 'nwse-resize',
        }}
      />
      <div
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '12px',
          height: '12px',
          cursor: 'nesw-resize',
        }}
      />
    </div>
  );
}
