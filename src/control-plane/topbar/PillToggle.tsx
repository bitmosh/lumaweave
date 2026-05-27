interface PillToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  glyphOn?: string;
  glyphOff?: string;
  testId?: string;
}

export function PillToggle({
  label,
  value,
  onChange,
  glyphOn = "◉",
  glyphOff = "○",
  testId,
}: PillToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`lw-pill-toggle ${value ? "is-on" : "is-off"}`}
      data-testid={testId}
    >
      <span className="lw-pill-toggle-glyph">{value ? glyphOn : glyphOff}</span>
      <span className="lw-pill-toggle-label">{label}</span>
    </button>
  );
}
