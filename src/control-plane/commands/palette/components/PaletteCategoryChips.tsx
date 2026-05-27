import type { CategoryFilter } from "../palette.types";
import { t } from "../../../../i18n";

const FILTER_VALUES: CategoryFilter[] = ["all", "view", "graph", "theme", "inspector", "physics", "labels", "debug"];

interface PaletteCategoryChipsProps {
  active: CategoryFilter;
  onChange: (f: CategoryFilter) => void;
}

export function PaletteCategoryChips({ active, onChange }: PaletteCategoryChipsProps) {
  return (
    <div className="palette-chips" data-testid="palette-category-chips">
      {FILTER_VALUES.map((value) => (
        <button
          key={value}
          className={`palette-chip${active === value ? " palette-chip--active" : ""}`}
          data-testid={`palette-chip-${value}`}
          onClick={() => onChange(value)}
          type="button"
        >
          {t(`palette.categories.${value}`)}
        </button>
      ))}
    </div>
  );
}
