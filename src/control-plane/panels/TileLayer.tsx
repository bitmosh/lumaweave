/**
 * v86c Tile Layer
 * Renders floating tiles, group outlines, and group bars
 */

import { useTileContext } from "./TileProvider";
import { FloatingTile } from "./FloatingTile";
import type { TileGroup } from "./tile.types";

export function TileLayer() {
  const { tiles, groups } = useTileContext();

  const tileArray = Array.from(tiles.values());

  return (
    <div
      data-testid="tile-layer"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {/* Render group outlines */}
      {groups.map((group) => (
        <GroupOutline key={group.tileIds.join("-")} group={group} />
      ))}

      {/* Render floating tiles */}
      {tileArray.map((tile) => (
        <div key={tile.id} style={{ pointerEvents: "auto" }}>
          <FloatingTile
            tile={tile}
            otherTiles={tileArray.filter((t) => t.id !== tile.id)}
            onClose={() => {
              const { closeTile } = useTileContext();
              closeTile(tile.id);
            }}
            onUpdate={(updates) => {
              const { updateTile } = useTileContext();
              updateTile(tile.id, updates);
            }}
            onBringToFront={() => {
              const { bringToFront } = useTileContext();
              bringToFront(tile.id);
            }}
          >
            {/* Tile content will be rendered by the section renderer */}
            <div data-tile-content={tile.sectionKey}>
              {/* Content is injected by the section component */}
            </div>
          </FloatingTile>
        </div>
      ))}
    </div>
  );
}

interface GroupOutlineProps {
  group: TileGroup;
}

function GroupOutline({ group }: GroupOutlineProps) {
  return (
    <div
      data-testid="tile-group-outline"
      style={{
        position: "absolute",
        left: `${group.bbox.x}px`,
        top: `${group.bbox.y}px`,
        width: `${group.bbox.width}px`,
        height: `${group.bbox.height}px`,
        border: "2px dashed rgba(14, 165, 233, 0.4)",
        borderRadius: "8px",
        pointerEvents: "none",
      }}
    >
      {/* THE BIG RULE: Group bar matches top-row width only */}
      <div
        data-testid="tile-group-bar"
        style={{
          position: "absolute",
          top: "-8px",
          left: `${(group.bbox.width - group.topRowWidth) / 2}px`,
          width: `${group.topRowWidth}px`,
          height: "4px",
          backgroundColor: "rgba(14, 165, 233, 0.6)",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
