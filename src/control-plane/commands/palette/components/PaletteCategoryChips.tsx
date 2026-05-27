import type { CategoryFilter } from "../palette.types";

const FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "View", value: "view" },
  { label: "Graph", value: "graph" },
  { label: "Theme", value: "theme" },
  { label: "Inspector", value: "inspector" },
  { label: "Physics", value: "physics" },
  { label: "Labels", value: "labels" },
  { label: "Debug", value: "debug" },
];

interface PaletteCategoryChipsProps {
  active: CategoryFilter;
  onChange: (f: CategoryFilter) => void;
}

export function PaletteCategoryChips({ active, onChange }: PaletteCategoryChipsProps) {
  return (
    <div className="palette-chips" data-testid="palette-category-chips">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          className={`palette-chip${active === f.value ? " palette-chip--active" : ""}`}
          data-testid={`palette-chip-${f.value}`}
          onClick={() => onChange(f.value)}
          type="button"
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
