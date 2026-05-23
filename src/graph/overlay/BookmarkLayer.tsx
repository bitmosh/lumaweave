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
  // Pass C9.2: toggle callback for pinned highlight mode
  onTogglePinnedHighlight?: () => void;
}

export function BookmarkLayer({ alertColor, pinnedColor, refColor, onTogglePinnedHighlight }: BookmarkLayerProps) {
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
              // Pass C9.2: Toggle pinned highlight mode for pinned bookmarks
              if (bookmark.type === "pinned" && onTogglePinnedHighlight) {
                onTogglePinnedHighlight();
                return;
              }
              // Existing behavior for alert/ref bookmarks
              if (bookmark.targetNodeId) {
                // TODO: navigate to targetNodeId when graph navigation is implemented
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
