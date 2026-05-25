/* IIFE-WRAPPED */
(() => {
/**
 * SettingsRows.tsx
 *
 * The atomic vocabulary of the content area. One SettingsRow per setting.
 * Reset affordance appears only when value !== default (per design decision —
 * doubles as a "show me what I've changed" signal across the panel).
 *
 * For Bandit: each row variant is independently exported. The generic
 * SettingsRow is composition glue — accept label/desc/control and render
 * the standard 3-column grid. Specialized rows (ToggleRow, SliderRow, etc.)
 * compose SettingsRow with their input.
 */

interface SettingsRowBaseProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** True when the value differs from the default — shows the reset glyph. */
  isModified?: boolean;
  /** Click handler for the Reset glyph. */
  onReset?: () => void;
  /** Optional: highlight when this row matches the active search query. */
  isSearchMatch?: boolean;
  /** Control(s) rendered in the right column. */
  children: React.ReactNode;
  /** Make the row a single full-width block (use for grids, override lists). */
  block?: boolean;
  /** True for "ships later" placeholders. */
  placeholder?: boolean;
}

const ResetGlyph = ({ onClick, hidden }: { onClick?: () => void; hidden?: boolean }) => (
  <button
    type="button"
    aria-label="Reset to default"
    className={'lw-row-reset' + (hidden ? ' is-hidden' : '')}
    onClick={onClick}
    title={hidden ? '' : 'Reset to default'}
  >
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5a3.5 3.5 0 1 1 1 2.5" />
      <path d="M2 2v3h3" />
    </svg>
  </button>
);

const SettingsRow: React.FC<SettingsRowBaseProps> = ({
  label, description, children, isModified, onReset, isSearchMatch, block, placeholder,
}) => {
  return (
    <div
      className={
        'lw-row' +
        (block ? ' is-block' : '') +
        (placeholder ? ' is-placeholder' : '') +
        (isSearchMatch ? ' is-active-search-match' : '')
      }
    >
      <div className="lw-row-meta">
        <div className="lw-row-label lw-text">{label}</div>
        {description ? <div className="lw-row-desc lw-text">{description}</div> : null}
      </div>
      {!block && (
        <>
          <div className="lw-row-control">{children}</div>
          <ResetGlyph onClick={onReset} hidden={!isModified} />
        </>
      )}
      {block && (
        <div style={{ gridColumn: '1 / -1' }}>{children}</div>
      )}
    </div>
  );
};

/* ─── Toggle ──────────────────────────────────────────────────────────── */
interface ToggleRowProps extends Omit<SettingsRowBaseProps, 'children'> {
  value: boolean;
  defaultValue?: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
const ToggleRow: React.FC<ToggleRowProps> = (p) => {
  const isMod = p.defaultValue !== undefined && p.value !== p.defaultValue;
  return (
    <SettingsRow
      label={p.label}
      description={p.description}
      isModified={isMod}
      onReset={() => p.defaultValue !== undefined && p.onChange(p.defaultValue)}
      isSearchMatch={p.isSearchMatch}
      placeholder={p.placeholder}
    >
      <button
        type="button"
        role="switch"
        aria-checked={p.value}
        disabled={p.disabled}
        className={'lw-toggle' + (p.value ? ' is-on' : '') + (p.disabled ? ' is-disabled' : '')}
        onClick={() => !p.disabled && p.onChange(!p.value)}
      />
    </SettingsRow>
  );
};

/* ─── Slider ──────────────────────────────────────────────────────────── */
interface SliderRowProps extends Omit<SettingsRowBaseProps, 'children'> {
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  /** Format the numeric value for display (overrides default fixed-2 formatting). */
  format?: (v: number) => string;
  onChange: (v: number) => void;
}
const SliderRow: React.FC<SliderRowProps> = (p) => {
  const step = p.step ?? (p.max - p.min) / 100;
  const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
  const formatted = p.format
    ? p.format(p.value)
    : Number.isInteger(step) && step >= 1
      ? p.value.toString()
      : p.value.toFixed(2);
  return (
    <SettingsRow
      label={p.label}
      description={p.description}
      isModified={p.value !== p.defaultValue}
      onReset={() => p.onChange(p.defaultValue)}
      isSearchMatch={p.isSearchMatch}
    >
      <div className="lw-row-control is-wide">
        <div className="lw-slider-with-readout">
          <input
            type="range"
            className="lw-slider"
            min={p.min} max={p.max} step={step} value={p.value}
            style={{ ['--p' as any]: pct + '%' } as React.CSSProperties}
            onChange={(e) => p.onChange(parseFloat(e.target.value))}
          />
          <div className="lw-slider-readout lw-text">
            {formatted}{p.unit ? <span className="lw-slider-readout-sub">{p.unit}</span> : null}
          </div>
        </div>
      </div>
    </SettingsRow>
  );
};

/* ─── Segmented ──────────────────────────────────────────────────────── */
interface SegmentedRowProps<T extends string> extends Omit<SettingsRowBaseProps, 'children'> {
  value: T;
  defaultValue: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}
function SegmentedRow<T extends string>(p: SegmentedRowProps<T>) {
  return (
    <SettingsRow
      label={p.label}
      description={p.description}
      isModified={p.value !== p.defaultValue}
      onReset={() => p.onChange(p.defaultValue)}
      isSearchMatch={p.isSearchMatch}
    >
      <div className="lw-segmented">
        {p.options.map((o) => (
          <button
            type="button"
            key={o.value}
            className={o.value === p.value ? 'is-on' : ''}
            onClick={() => p.onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </SettingsRow>
  );
}

/* ─── Select ──────────────────────────────────────────────────────────── */
interface SelectRowProps extends Omit<SettingsRowBaseProps, 'children'> {
  value: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}
const SelectRow: React.FC<SelectRowProps> = (p) => (
  <SettingsRow
    label={p.label}
    description={p.description}
    isModified={p.value !== p.defaultValue}
    onReset={() => p.onChange(p.defaultValue)}
    isSearchMatch={p.isSearchMatch}
  >
    <select className="lw-select" value={p.value} onChange={(e) => p.onChange(e.target.value)}>
      {p.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </SettingsRow>
);

/* ─── Button row (actions) ────────────────────────────────────────────── */
interface ButtonRowProps extends Omit<SettingsRowBaseProps, 'children' | 'isModified' | 'onReset'> {
  buttonLabel: string;
  danger?: boolean;
  onClick: () => void;
}
const ButtonRow: React.FC<ButtonRowProps> = (p) => (
  <SettingsRow
    label={p.label}
    description={p.description}
    isModified={false}
    isSearchMatch={p.isSearchMatch}
  >
    <button type="button" className={'lw-btn' + (p.danger ? ' is-danger' : '')} onClick={p.onClick}>
      {p.buttonLabel}
    </button>
  </SettingsRow>
);

/* ─── Display row (read-only) ─────────────────────────────────────────── */
interface DisplayRowProps extends Omit<SettingsRowBaseProps, 'children' | 'isModified' | 'onReset'> {
  value: React.ReactNode;
}
const DisplayRow: React.FC<DisplayRowProps> = (p) => (
  <SettingsRow
    label={p.label}
    description={p.description}
    isModified={false}
    isSearchMatch={p.isSearchMatch}
  >
    <div className="lw-chip lw-text">{p.value}</div>
  </SettingsRow>
);

/* ─── Placeholder row ─────────────────────────────────────────────────── */
interface PlaceholderRowProps extends Omit<SettingsRowBaseProps, 'children' | 'isModified' | 'onReset' | 'placeholder'> {
  comingIn: string; // e.g. "v95"
}
const PlaceholderRow: React.FC<PlaceholderRowProps> = (p) => (
  <SettingsRow
    label={p.label}
    description={p.description}
    isModified={false}
    isSearchMatch={p.isSearchMatch}
    placeholder
  >
    <span className="lw-coming-pill" title={`Coming in ${p.comingIn}`}>Coming {p.comingIn}</span>
  </SettingsRow>
);

(window as any).LW_Rows = {
  SettingsRow, ToggleRow, SliderRow, SegmentedRow, SelectRow, ButtonRow, DisplayRow, PlaceholderRow,
};

})();
