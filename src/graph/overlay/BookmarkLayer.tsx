/**
 * BookmarkLayer - v86b bookmark layer
 * 
 * Renders all bookmarks from bookmarkRegistry as FloatingBookmark components.
 * Consumes v86a tier model tokens.
 */
import { bookmarkRegistry } from "./bookmarkRegistry";
import { FloatingBookmark } from "./FloatingBookmark";

interface BookmarkLayerProps {
  // v86a tier model tokens
  alertColor?: string;
  pinnedColor?: string;
  refColor?: string;
}

export function BookmarkLayer({ alertColor, pinnedColor, refColor }: BookmarkLayerProps) {
  const bookmarks = bookmarkRegistry.getAll();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="pointer-events-auto">
          <FloatingBookmark
            bookmark={bookmark}
            alertColor={alertColor}
            pinnedColor={pinnedColor}
            refColor={refColor}
            onClick={() => {
              // Handle bookmark click - navigate to targetNodeId if present
              if (bookmark.targetNodeId) {
                console.log("Navigate to:", bookmark.targetNodeId);
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
