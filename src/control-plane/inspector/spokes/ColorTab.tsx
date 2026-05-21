/**
 * Color Tab
 *
 * Inspector spoke for color editing. v86d.3a: display-only.
 * Shows target's bindings, palette primitives, hex input, eyedropper.
 */

import { useActiveThemePrimitives, getTargetBindings } from "../../../themes/paletteRuntime";
import type { TargetDescriptor } from "../inspector.types";
import { resolveForTarget } from "../../../themes/themeOverrideStorage";
import "../styles/color-tab.css";  // v86d.3a: Color tab styling

export interface ColorTabProps {
  targetDescriptor: TargetDescriptor;
  onClose?: () => void;
}

export function ColorTab({ targetDescriptor, onClose }: ColorTabProps) {
  const bindings = getTargetBindings(targetDescriptor.targetId);
  const primitives = useActiveThemePrimitives();
  const eyeDropperAvailable = typeof (window as any).EyeDropper === "function";

  return (
    <div className="lw-color-tab" data-testid="color-tab">
      <header className="lw-color-tab-header">
        <span className="lw-color-tab-target-id">
          {targetDescriptor.targetId}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="back"
            className="lw-color-tab-back-button"
          >
            ← back
          </button>
        )}
      </header>

      <section className="lw-color-tab-bindings" data-testid="color-bindings">
        {bindings.length === 0 ? (
          <p className="lw-color-tab-empty">
            No editable bindings for this target.
          </p>
        ) : (
          bindings.map((binding) => (
            <BindingRow
              key={binding.property}
              property={binding.property}
              tokenPath={binding.tokenPath}
              targetId={targetDescriptor.targetId}
            />
          ))
        )}
      </section>

      <section className="lw-color-tab-hex" data-testid="hex-input">
        <label>Hex</label>
        <input
          type="text"
          placeholder="#000000"
          disabled
          aria-label="hex input (disabled in v86d.3a)"
        />
      </section>

      <section className="lw-color-tab-eyedropper" data-testid="eyedropper">
        <button
          disabled={!eyeDropperAvailable}
          title={
            eyeDropperAvailable
              ? "Pick from screen (not yet active)"
              : "EyeDropper API not supported in this browser"
          }
        >
          🎨 Pick from screen
        </button>
      </section>

      <section className="lw-color-tab-palette" data-testid="palette">
        <h3>Palette</h3>
        <div className="lw-color-tab-palette-grid">
          {primitives.map((primitive) => (
            <button
              key={primitive.path}
              className="lw-color-tab-palette-swatch"
              style={{ backgroundColor: primitive.hex }}
              title={`${primitive.path} — ${primitive.hex}`}
              disabled
              aria-label={`palette ${primitive.path} (disabled in v86d.3a)`}
            />
          ))}
        </div>
      </section>

      <section className="lw-color-tab-recent" data-testid="recent-swatches">
        <h3>Recent</h3>
        <p className="lw-color-tab-empty">No recent colors yet.</p>
      </section>

      <section className="lw-color-tab-scope" data-testid="scope-picker">
        <h3>Apply to</h3>
        <div className="lw-color-tab-scope-buttons">
          <button className="active" aria-pressed="true">
            This
          </button>
          <button disabled title="Available in v89">
            Kind
          </button>
          <button disabled title="Available in v89">
            Cluster
          </button>
          <button>All</button>
        </div>
      </section>
    </div>
  );
}

function BindingRow({
  property,
  tokenPath,
  targetId,
}: {
  property: string;
  tokenPath: string;
  targetId: string;
}) {
  // Resolve the current value for display
  const resolvedHex = resolveForTarget(tokenPath as any, targetId);

  return (
    <div
      className="lw-color-tab-binding-row"
      data-testid={`binding-${property}`}
    >
      <span className="lw-color-tab-property-label">{property}</span>
      <span className="lw-color-tab-hex-display">{resolvedHex ?? "—"}</span>
      <button
        className="lw-color-tab-palette-trigger"
        disabled
        aria-label={`open palette for ${property} (disabled in v86d.3a)`}
      >
        🎨
      </button>
    </div>
  );
}
