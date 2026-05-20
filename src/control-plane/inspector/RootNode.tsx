/**
 * Root Node Component
 *
 * Displays the root node of the inspector mini-graph.
 * Anchored at the clicked target's position.
 */

interface RootNodeProps {
  label: string;
  x: number;
  y: number;
  radius?: number;
}

export function RootNode({ label, x, y, radius = 20 }: RootNodeProps) {
  return (
    <g data-lw-theme-target="inspector.root">
      {/* Root node circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="var(--lw-inspector-radial-root-color, #FFB347)"
        opacity="0.9"
      />
      {/* Root node border */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="none"
        stroke="var(--lw-inspector-radial-root-border, rgba(255, 179, 71, 0.6))"
        strokeWidth="1.5"
      />
      {/* Root label */}
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize="9"
        fontWeight="500"
        fill="var(--lw-inspector-radial-text, #FFB347)"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {label}
      </text>
    </g>
  );
}
