/**
 * Geometry Tab (v89.4)
 *
 * Click-only preset picker for node.geometry.preset.
 * Thumbnails are 48×48 ImageBitmaps drawn to canvas elements.
 * Scope: "this" writes target override; "all" writes global override.
 */

import { useEffect, useRef, useState } from "react";
import type { TargetDescriptor } from "../inspector.types";
import { getThumbnail } from "../nodeProgramThumbnails";
import { setTargetOverride, setGlobalOverride, resolveForTarget } from "../../../themes/themeOverrideStorage";
import { notifyOverrideChange } from "../../../themes/useResolvedTargetColor";
import { useSettingsStore } from "../../settings/settings.store";
import type { NodeProgramId } from "../../../graph/nodePrograms/types";
import "../styles/geometry-tab.css";

const PRESETS: { id: NodeProgramId; label: string }[] = [
  { id: "sun", label: "Sun" },
  { id: "glass-sphere", label: "Glass" },
  { id: "crystal", label: "Crystal" },
  { id: "orb", label: "Orb" },
  { id: "pip", label: "Pip" },
];

export interface GeometryTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function GeometryTab({ targetDescriptor, onClose }: GeometryTabProps) {
  const themeId = useSettingsStore((state) => state.settings.appearance.theme);
  const [currentScope, setCurrentScope] = useState<"this" | "all">("this");
  const [activePreset, setActivePreset] = useState<string | undefined>(
    () => resolveForTarget("node.geometry.preset", targetDescriptor.targetId) as string | undefined,
  );

  const commitPreset = (presetId: NodeProgramId) => {
    if (currentScope === "this") {
      setTargetOverride(targetDescriptor.targetId, "node.geometry.preset", presetId);
    } else {
      setGlobalOverride("node.geometry.preset", presetId);
    }
    setActivePreset(presetId);
    notifyOverrideChange();
  };

  return (
    <div className="lw-geometry-tab" data-testid="geometry-tab">
      <header className="lw-geometry-tab-header">
        <span className="lw-geometry-tab-title">Geometry</span>
        {onClose && (
          <button onClick={onClose} aria-label="back" className="lw-geometry-tab-back">
            ← back
          </button>
        )}
      </header>

      <div className="lw-geometry-tab-grid" data-testid="geometry-preset-grid">
        {PRESETS.map(({ id, label }) => (
          <PresetThumbnail
            key={id}
            presetId={id}
            label={label}
            themeId={themeId}
            isActive={activePreset === id}
            onClick={() => commitPreset(id)}
          />
        ))}
      </div>

      <section className="lw-geometry-tab-scope" data-testid="geometry-scope-picker">
        <div className="lw-geometry-tab-scope-buttons">
          <button
            className={currentScope === "this" ? "active" : ""}
            aria-pressed={currentScope === "this"}
            onClick={() => setCurrentScope("this")}
          >
            This
          </button>
          <button
            className={currentScope === "all" ? "active" : ""}
            aria-pressed={currentScope === "all"}
            onClick={() => setCurrentScope("all")}
          >
            All
          </button>
        </div>
      </section>
    </div>
  );
}

function PresetThumbnail({
  presetId,
  label,
  themeId,
  isActive,
  onClick,
}: {
  presetId: NodeProgramId;
  label: string;
  themeId: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    getThumbnail(presetId, themeId).then((bitmap) => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 48, 48);
      ctx.drawImage(bitmap, 0, 0);
    });
    return () => { cancelled = true; };
  }, [presetId, themeId]);

  return (
    <button
      className={`lw-geometry-preset-btn${isActive ? " active" : ""}`}
      onClick={onClick}
      data-testid={`geometry-preset-${presetId}`}
      aria-pressed={isActive}
      title={label}
    >
      <canvas
        ref={canvasRef}
        width={48}
        height={48}
        className="lw-geometry-preset-canvas"
        aria-hidden="true"
      />
      <span className="lw-geometry-preset-label">{label}</span>
    </button>
  );
}
