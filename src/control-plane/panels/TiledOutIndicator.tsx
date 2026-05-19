/**
 * TiledOutIndicator — slim placeholder shown in a section's body
 * when its content is currently torn off as a floating tile.
 *
 * Renders a small "Tiled out" label with a pulsing amber dot.
 * Color comes from var(--lw-flare-gold, #f59e0b) so it picks up
 * theme overrides automatically.
 *
 * Used by CollapsibleSection when tileableKey is set and the
 * section is currently tiled out. Each tiled section renders its
 * own indicator in its own body space — multiple tiled-out
 * sections produce multiple indicators, one per section slot.
 */
interface TiledOutIndicatorProps {
  /** Optional test id for verification */
  testId?: string;
}

export function TiledOutIndicator({ testId }: TiledOutIndicatorProps) {
  return (
    <div
      className="tiled-out-indicator"
      data-testid={testId}
      data-lw-theme-target="ignore"
    >
      <span className="tiled-out-indicator-label">Tiled out</span>
      <span className="tiled-out-indicator-dot" aria-hidden="true" />
    </div>
  );
}
