import { useEffect, useRef } from "react";

interface PaletteSearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onEscape: () => void;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onEnter: () => void;
}

export function PaletteSearchInput({
  value,
  onChange,
  onEscape,
  onArrowDown,
  onArrowUp,
  onEnter,
}: PaletteSearchInputProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <input
      ref={ref}
      data-testid="palette-search-input"
      className="palette-search-input"
      type="text"
      placeholder="Type a command..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Escape") { e.preventDefault(); onEscape(); }
        else if (e.key === "ArrowDown") { e.preventDefault(); onArrowDown(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); onArrowUp(); }
        else if (e.key === "Enter") { e.preventDefault(); onEnter(); }
      }}
      autoComplete="off"
      spellCheck={false}
    />
  );
}
