/**
 * FloatingBookmark - v86b floating bookmark component
 * 
 * Displays a bookmark (alert, pinned, or ref) at viewport-relative position.
 * Consumes v86a tier model tokens.
 */

import type { BookmarkEntry } from "./bookmarkRegistry";

interface FloatingBookmarkProps {
  bookmark: BookmarkEntry;
  onClick: () => void;
  // v86a tier model tokens
  alertColor?: string;
  pinnedColor?: string;
  refColor?: string;
}

export function FloatingBookmark({ bookmark, onClick, alertColor = "#ef4444", pinnedColor = "#f59e0b", refColor = "#3b82f6" }: FloatingBookmarkProps) {
  const typeColors: Record<string, string> = {
    alert: alertColor,
    pinned: pinnedColor,
    ref: refColor,
  };

  return (
    <div
      className="absolute cursor-pointer rounded-lg px-3 py-2 shadow-lg backdrop-blur-sm border"
      style={{
        left: `${bookmark.position.x * 100}%`,
        top: `${bookmark.position.y * 100}%`,
        backgroundColor: typeColors[bookmark.type] + "33",
        borderColor: typeColors[bookmark.type],
        color: "#fff",
        fontSize: 12,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <div className="font-semibold">{bookmark.label}</div>
      {bookmark.sub && <div className="text-xs opacity-75">{bookmark.sub}</div>}
    </div>
  );
}
