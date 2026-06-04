/**
 * Spoke Node Component
 *
 * Displays a spoke node in the inspector mini-graph radial.
 * In v86d.2, these are placeholders (empty circle + label).
 * v86d.3+ replaces with real content via the registry.
 */

interface SpokeNodeProps {
  spokeId?: string;
  label?: string;
  x: number;
  y: number;
  radius?: number;
  onClick?: () => void;
  color?: string;
  isPlaceholder?: boolean;
}

export function SpokeNode({
  spokeId,
  label,
  x,
  y,
  radius = 14,
  onClick,
  color,
  isPlaceholder = false,
}: SpokeNodeProps) {
  const spokeColor = color ?? "var(--lw-inspector-radial-spoke-color, rgba(255, 179, 71, 0.6))";
  const isClickable = !!onClick;
  const nodeOpacity = isPlaceholder ? 0.4 : 0.7;
  const strokeOpacity = isPlaceholder ? 0.25 : 0.5;

  const handleClick = () => {
    onClick?.();
  };

  return (
    <g
      data-lw-theme-target="inspector.spoke"
      data-spoke-id={spokeId}
      data-placeholder={isPlaceholder ? "true" : undefined}
      onClick={handleClick}
      style={{ cursor: isClickable ? "pointer" : "default" }}
    >
      {/* Spoke node circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={spokeColor}
        opacity={nodeOpacity}
      />
      {/* Spoke node border/halo */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke={spokeColor}
        strokeWidth="1"
        opacity={strokeOpacity}
      />
      {/* Spoke label (if provided) */}
      {label && (
        <text
          x={x}
          y={y + 3}
          textAnchor="middle"
          fontSize="8"
          fontWeight="400"
          fill="var(--lw-inspector-radial-text, #FFB347)"
          opacity={isPlaceholder ? 0.45 : 0.85}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}
