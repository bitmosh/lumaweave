/**
 * v86c Tileable Section
 * Extends CollapsibleSection with tear-off handle
 */

import { ReactNode, MouseEvent } from "react";
import { CollapsibleSection } from "./CollapsibleSection";

interface TileableSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onTearOff?: (e: MouseEvent) => void;
  isTiledOut?: boolean;
  children: ReactNode;
  testId?: string;
  accentColor?: string;
  borderColor?: string;
  sectionKey?: string;
}

export function TileableSection({
  title,
  isOpen,
  onToggle,
  onTearOff,
  isTiledOut = false,
  children,
  testId,
  accentColor,
  borderColor,
  sectionKey,
}: TileableSectionProps) {
  const handleTearOff = (e: MouseEvent) => {
    e.stopPropagation();
    if (onTearOff) {
      onTearOff(e);
    }
  };

  return (
    <div
      data-section-key={sectionKey}
      data-tiled-out={isTiledOut ? "true" : undefined}
      style={{
        opacity: isTiledOut ? 0.4 : 1,
        pointerEvents: isTiledOut ? "none" : undefined,
        transition: "opacity 0.2s ease",
      }}
    >
      <CollapsibleSection
        title={title}
        isOpen={isOpen}
        onToggle={onToggle}
        testId={testId}
        accentColor={accentColor}
        borderColor={borderColor}
      >
        <div style={{ position: "relative" }}>
          {onTearOff && !isTiledOut && (
            <button
              data-testid={`tear-off-${sectionKey}`}
              onClick={handleTearOff}
              style={{
                position: "absolute",
                top: "-32px",
                right: "0",
                width: "24px",
                height: "24px",
                borderRadius: "4px",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "#94a3b8",
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                padding: 0,
                zIndex: 10,
              }}
              title="Tear off into floating tile"
            >
              ⊕
            </button>
          )}
          {children}
        </div>
      </CollapsibleSection>
    </div>
  );
}
