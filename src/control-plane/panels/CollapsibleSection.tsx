import { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  testId?: string;
  accentColor?: string;
  borderColor?: string;
}

export function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  testId,
  accentColor = "#22d3ee",
  borderColor = "rgba(34,211,238,0.1)",
}: CollapsibleSectionProps) {
  return (
    <div
      data-testid={testId}
      data-lw-theme-target="ignore"
      style={{ marginBottom: "8px" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        data-testid={testId ? `${testId}-toggle` : undefined}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${borderColor}`,
          cursor: "pointer",
          color: accentColor,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        <span>{title}</span>
        <span style={{
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.15s ease",
          fontSize: "10px",
        }}>
          ▼
        </span>
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: isOpen ? "2000px" : "0px",
          transition: "max-height 0.2s ease",
        }}
      >
        <div style={{ padding: "12px 0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
