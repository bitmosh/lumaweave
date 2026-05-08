/**
 * Minimap - v86b minimap overlay
 * 
 * Small overview of the graph in bottom-right corner.
 * Shows current viewport rectangle.
 */

interface MinimapProps {
  graphBounds: { minX: number; minY: number; maxX: number; maxY: number };
  viewportBounds: { x: number; y: number; ratio: number };
}

export function Minimap({ graphBounds, viewportBounds }: MinimapProps) {
  const width = 120;
  const height = 120;

  const graphWidth = graphBounds.maxX - graphBounds.minX;
  const graphHeight = graphBounds.maxY - graphBounds.minY;

  const scaleX = width / graphWidth;
  const scaleY = height / graphHeight;

  const viewportX = ((viewportBounds.x - graphBounds.minX) / graphWidth) * width;
  const viewportY = ((viewportBounds.y - graphBounds.minY) / graphHeight) * height;
  const viewportW = (width / viewportBounds.ratio) * scaleX;
  const viewportH = (height / viewportBounds.ratio) * scaleY;

  return (
    <div
      className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg"
      style={{ width, height }}
    >
      <div className="relative w-full h-full">
        {/* Graph bounds */}
        <div className="absolute inset-0 border border-slate-600" />
        
        {/* Viewport rectangle */}
        <div
          className="absolute border-2 border-cyan-400 bg-cyan-400/10"
          style={{
            left: viewportX,
            top: viewportY,
            width: Math.min(viewportW, width),
            height: Math.min(viewportH, height),
          }}
        />
      </div>
    </div>
  );
}
