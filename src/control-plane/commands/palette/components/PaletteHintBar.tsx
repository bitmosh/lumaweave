interface PaletteHintBarProps {
  hasSelection: boolean;
}

export function PaletteHintBar({ hasSelection }: PaletteHintBarProps) {
  return (
    <div className="palette-hint-bar" data-testid="palette-hint-bar">
      {hasSelection && (
        <>
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> execute</span>
          <span><kbd>☆</kbd> pin</span>
        </>
      )}
      <span><kbd>Esc</kbd> close</span>
    </div>
  );
}
