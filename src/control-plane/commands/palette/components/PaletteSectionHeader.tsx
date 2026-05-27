interface PaletteSectionHeaderProps {
  label: string;
}

export function PaletteSectionHeader({ label }: PaletteSectionHeaderProps) {
  return (
    <div className="palette-section-header" data-testid="palette-section-header">
      {label}
    </div>
  );
}
