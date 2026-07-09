// SPDX-License-Identifier: Apache-2.0
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
import {
  setGlobalOverride,
  getGlobalOverride,
  setTargetOverride,
  getTargetOverride,
} from "../../../themes/themeOverrideStorage";
import { notifyOverrideChange } from "../../../themes/useResolvedTargetColor";
import { useSettingsStore } from "../../settings/settings.store";
import type { NodeProgramId } from "../../../graph/nodePrograms/types";
import { t } from "../../../i18n";
import "../styles/geometry-tab.css";

const PRESET_IDS: NodeProgramId[] = ["sun", "glass-sphere", "crystal", "orb", "pip"];

export interface GeometryTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function GeometryTab({ targetDescriptor, onClose }: GeometryTabProps) {
  const themeId = useSettingsStore((state) => state.settings.appearance.theme);
  const [scope, setScope] = useState<"all" | "this">("all");
  const [activePreset, setActivePreset] = useState<string | undefined>(
    () => getGlobalOverride("node.geometry.preset") as string | undefined,
  );

  const getActiveForScope = (s: "all" | "this") =>
    s === "all"
      ? (getGlobalOverride("node.geometry.preset") as string | undefined)
      : (getTargetOverride(targetDescriptor.targetId, "node.geometry.preset") as string | undefined);

  const handleScopeChange = (s: "all" | "this") => {
    setScope(s);
    setActivePreset(getActiveForScope(s));
  };

  const commitPreset = (presetId: NodeProgramId) => {
    if (scope === "all") {
      setGlobalOverride("node.geometry.preset", presetId);
    } else {
      setTargetOverride(targetDescriptor.targetId, "node.geometry.preset", presetId);
    }
    setActivePreset(presetId);
    notifyOverrideChange();
  };

  return (
    <div className="lw-geometry-tab" data-testid="geometry-tab">
      <header className="lw-geometry-tab-header">
        <span className="lw-geometry-tab-title">{t("inspector.spokes.geometry.title")}</span>
        {onClose && (
          <button onClick={onClose} aria-label={t("inspector.backLabel")} className="lw-geometry-tab-back">
            {t("inspector.back")}
          </button>
        )}
      </header>

      <div className="lw-geometry-tab-grid" data-testid="geometry-preset-grid">
        {PRESET_IDS.map((id) => (
          <PresetThumbnail
            key={id}
            presetId={id}
            label={t(`inspector.spokes.geometry.presets.${id}`)}
            themeId={themeId}
            isActive={activePreset === id}
            onClick={() => commitPreset(id)}
          />
        ))}
      </div>

      <div className="lw-geometry-tab-scope" data-testid="geometry-scope-picker">
        <div className="lw-geometry-tab-scope-buttons">
          <button
            aria-pressed={scope === "this"}
            className={scope === "this" ? "active" : ""}
            onClick={() => handleScopeChange("this")}
          >
            This
          </button>
          <button
            aria-pressed={scope === "all"}
            className={scope === "all" ? "active" : ""}
            onClick={() => handleScopeChange("all")}
          >
            All
          </button>
        </div>
      </div>
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
