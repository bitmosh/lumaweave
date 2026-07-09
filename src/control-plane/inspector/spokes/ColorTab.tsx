// SPDX-License-Identifier: Apache-2.0
/**
 * Color Tab (v86d.3b)
 *
 * Fully functional color editor for inspector spokes.
 * Active binding model: clicking a binding row makes it the target of controls.
 * Palette/hex/eyedropper commit immediately to the active binding.
 */

import { useEffect, useState } from "react";
import { useActiveThemePrimitives, getTargetBindings } from "../../../themes/paletteRuntime";
import type { TargetDescriptor } from "../inspector.types";
import { resolveForTarget } from "../../../themes/themeOverrideStorage";
import { getThemeTargetById } from "../../../themes/themeTargetRegistry";
import { notifyOverrideChange, useResolvedTargetColor } from "../../../themes/useResolvedTargetColor";
import {
  commitColorToBinding,
  applyToKind,
  getRecentSwatches,
  pushRecentSwatch,
  isValidHex,
} from "./colorTabUtils";
import { t } from "../../../i18n";
import "../styles/color-tab.css";

export interface ColorTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function ColorTab({ targetDescriptor, onClose }: ColorTabProps) {
  const bindings = getTargetBindings(targetDescriptor.targetId);
  const primitives = useActiveThemePrimitives();
  const eyeDropperAvailable = typeof (window as any).EyeDropper === "function";

  const [activeBindingId, setActiveBindingId] = useState<string | null>(null);
  const [hexInputValue, setHexInputValue] = useState("");
  const [currentScope, setCurrentScope] = useState<"this" | "all">("this");
  const [recentSwatches, setRecentSwatches] = useState<string[]>(getRecentSwatches());

  // Auto-active first binding when bindings load
  useEffect(() => {
    if (bindings.length > 0 && !activeBindingId) {
      setActiveBindingId(bindings[0].property);
    }
  }, [bindings, activeBindingId]);

  const activeBinding = bindings.find((b) => b.property === activeBindingId);
  const targetEntry = getThemeTargetById(targetDescriptor.targetId);
  const targetKind = targetEntry?.surface;

  const commitColor = (hex: string) => {
    if (!activeBinding) return;
    commitColorToBinding(targetDescriptor.targetId, activeBinding.tokenPath as any, hex, currentScope);
    pushRecentSwatch(hex);
    setRecentSwatches(getRecentSwatches());
    // Notify components that override has changed so they re-render with new color
    notifyOverrideChange();
  };

  const handleHexCommit = () => {
    if (!isValidHex(hexInputValue)) return;
    commitColor(hexInputValue);
    setHexInputValue("");
  };

  const handleEyedropper = async () => {
    if (typeof (window as any).EyeDropper !== "function") return;
    try {
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      commitColor(result.sRGBHex);
    } catch (err) {
      // User cancelled or other error — silently ignore
    }
  };

  const handleApplyToKind = () => {
    if (!activeBinding || !targetKind) return;
    const currentHex = resolveForTarget(activeBinding.tokenPath as any, targetDescriptor.targetId);
    if (!currentHex || typeof currentHex !== "string") return;
    applyToKind(targetKind, activeBinding.tokenPath as any, currentHex);
  };

  return (
    <div className="lw-color-tab" data-testid="color-tab">
      <header className="lw-color-tab-header">
        <span className="lw-color-tab-target-id">{targetDescriptor.targetId}</span>
        {onClose && (
          <button onClick={onClose} aria-label={t("inspector.backLabel")} className="lw-color-tab-back-button">
            {t("inspector.back")}
          </button>
        )}
      </header>

      {/* Hex + eyedropper immediately below header for quick access */}
      <div className="lw-color-tab-input-row">
        <input
          type="text"
          value={hexInputValue}
          onChange={(e) => setHexInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleHexCommit();
          }}
          placeholder="#000000"
          data-testid="hex-input"
          className="lw-color-tab-hex-field"
        />
        <button
          onClick={handleEyedropper}
          disabled={!eyeDropperAvailable}
          title={eyeDropperAvailable ? t("inspector.spokes.color.pickFromScreen") : t("inspector.spokes.color.eyedropperUnsupported")}
          data-testid="eyedropper-button"
          className="lw-color-tab-eyedropper-btn"
        >
          🎨
        </button>
      </div>

      <section className="lw-color-tab-palette" data-testid="palette">
        <h3>{t("inspector.spokes.color.palette")}</h3>
        <div className="lw-color-tab-palette-grid">
          {primitives.map((primitive) => (
            <button
              key={primitive.path}
              className="lw-color-tab-palette-swatch"
              style={{ backgroundColor: primitive.hex }}
              title={`${primitive.path} — ${primitive.hex}`}
              onClick={() => commitColor(primitive.hex)}
              data-testid={`palette-swatch-${primitive.family}-${primitive.shade}`}
            />
          ))}
        </div>
      </section>

      <section className="lw-color-tab-bindings" data-testid="color-bindings">
        {bindings.length === 0 ? (
          <p className="lw-color-tab-empty">{t("inspector.spokes.color.noBindings")}</p>
        ) : (
          bindings.map((binding) => (
            <BindingRow
              key={binding.property}
              property={binding.property}
              tokenPath={binding.tokenPath}
              targetId={targetDescriptor.targetId}
              isActive={activeBindingId === binding.property}
              onClickRow={() => setActiveBindingId(binding.property)}
            />
          ))
        )}
      </section>

      <section className="lw-color-tab-recent" data-testid="recent-swatches">
        <h3>{t("inspector.spokes.color.recent")}</h3>
        {recentSwatches.length === 0 ? (
          <p className="lw-color-tab-empty">{t("inspector.spokes.color.noRecent")}</p>
        ) : (
          <div className="lw-color-tab-recent-grid">
            {recentSwatches.map((hex, i) => (
              <button
                key={`${hex}-${i}`}
                className="lw-color-tab-recent-swatch"
                style={{ backgroundColor: hex }}
                onClick={() => commitColor(hex)}
                title={hex}
                data-testid={`recent-swatch-${i}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="lw-color-tab-scope" data-testid="scope-picker">
        <h3>{t("inspector.spokes.color.applyTo")}</h3>
        <div className="lw-color-tab-scope-buttons">
          <button
            className={currentScope === "this" ? "active" : ""}
            aria-pressed={currentScope === "this"}
            onClick={() => setCurrentScope("this")}
          >
            {t("inspector.spokes.color.scopeThis")}
          </button>
          <button disabled title={t("inspector.spokes.color.scopeKindTitle")}>
            {t("inspector.spokes.color.scopeKind")}
          </button>
          <button disabled title={t("inspector.spokes.color.scopeKindTitle")}>
            {t("inspector.spokes.color.scopeCluster")}
          </button>
          <button
            className={currentScope === "all" ? "active" : ""}
            aria-pressed={currentScope === "all"}
            onClick={() => setCurrentScope("all")}
          >
            {t("inspector.spokes.color.scopeAll")}
          </button>
        </div>
      </section>

      {targetKind && activeBinding && (
        <section className="lw-color-tab-shortcuts" data-testid="shortcuts">
          <h3>{t("inspector.spokes.color.shortcuts")}</h3>
          <button onClick={handleApplyToKind} data-testid="apply-to-kind">
            {t("inspector.spokes.color.applyToKind", { property: activeBinding.property, kind: targetKind })}
          </button>
        </section>
      )}
    </div>
  );
}

function BindingRow({
  property,
  tokenPath,
  targetId,
  isActive,
  onClickRow,
}: {
  property: string;
  tokenPath: string;
  targetId: string;
  isActive: boolean;
  onClickRow: () => void;
}) {
  const resolvedHex = useResolvedTargetColor(targetId, tokenPath as any, "—");

  return (
    <div
      className={`lw-color-tab-binding-row ${isActive ? "active" : ""}`}
      onClick={onClickRow}
      data-testid={`binding-${property}`}
      data-active={isActive}
    >
      <span className="lw-color-tab-property-label">{property}</span>
      <span className="lw-color-tab-hex-display">
        <span
          className="lw-color-tab-hex-chip"
          style={{
            backgroundColor: resolvedHex !== "—" ? resolvedHex : "transparent",
          }}
          aria-hidden="true"
        />
        <span className="lw-color-tab-hex-text">{resolvedHex}</span>
      </span>
      <button
        className="lw-color-tab-palette-trigger"
        onClick={(e) => {
          e.stopPropagation();
          onClickRow();
        }}
        aria-label={`select ${property}`}
      >
        🎨
      </button>
    </div>
  );
}
