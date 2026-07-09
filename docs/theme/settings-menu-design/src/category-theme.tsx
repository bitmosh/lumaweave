// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * category-theme.tsx
 *
 * The Theme category — the richest of the eight. Six working subcomponents:
 *
 *   1. ThemePickerGrid       — 6 theme cards with SVG thumbnails
 *   2. AccessibilityReadout  — 4 contrast pairs for the active theme
 *   3. OverrideList          — every active override with reset-per-row
 *   4. CrossfadeSlider       — theme transition duration
 *   5. DramaAndIntensity     — master Drama scalar + ordered intensity factors
 *   6. EffectsAndReduceMotion— mirrors of the topbar toggles
 *
 * All sub-sections live behind <SettingsSubSection> so their collapsed state
 * persists per-section across reloads.
 */

const SettingsSubSection = (window as any).LW_SettingsSubSection;
const { SettingsRow, ToggleRow, SliderRow, SegmentedRow, ButtonRow } = (window as any).LW_Rows;

/* ─── 1. Theme picker grid ────────────────────────────────────────────── */

interface ThemeThumbProps { theme: any }
const ThemeThumb: React.FC<ThemeThumbProps> = ({ theme }) => {
  // Procedural SVG thumbnail — a small constellation in the theme's palette.
  const nodes = [
    { cx: 30, cy: 32, r: 6 }, { cx: 64, cy: 18, r: 9 }, { cx: 110, cy: 30, r: 5 },
    { cx: 152, cy: 48, r: 8 }, { cx: 178, cy: 22, r: 4 }, { cx: 44, cy: 70, r: 4 },
    { cx: 96, cy: 76, r: 11 }, { cx: 138, cy: 88, r: 5 }, { cx: 22, cy: 96, r: 6 },
    { cx: 72, cy: 110, r: 4 }, { cx: 124, cy: 116, r: 7 }, { cx: 170, cy: 100, r: 5 },
  ];
  const edges: Array<[number, number]> = [
    [0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,3],[6,7],[7,11],[5,9],[6,10],[9,10],[8,5],[8,9],
  ];
  const id = 'th-' + theme.id;
  return (
    <svg className="lw-themecard-thumb" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={id} cx="50%" cy="55%" r="70%">
          <stop offset="0%" stopColor={theme.thumb.bg[0]} />
          <stop offset="100%" stopColor={theme.thumb.bg[1]} />
        </radialGradient>
        <filter id={id + '-glow'}>
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <rect width="200" height="130" fill={`url(#${id})`} />
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={theme.thumb.edge} strokeWidth="0.8"
        />
      ))}
      {nodes.map((n, i) => {
        const color = theme.thumb.nodes[i % theme.thumb.nodes.length];
        return (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r * 1.6} fill={color} opacity="0.35" filter={`url(#${id}-glow)`} />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill={color} />
          </g>
        );
      })}
    </svg>
  );
};

interface ThemePickerProps {
  themes: any[];
  activeId: string;
  onSelect: (id: string) => void;
}
const ThemePickerGrid: React.FC<ThemePickerProps> = ({ themes, activeId, onSelect }) => (
  <div className="lw-themegrid">
    {themes.map((t) => (
      <button
        key={t.id}
        type="button"
        className={'lw-themecard' + (t.id === activeId ? ' is-active' : '')}
        onClick={() => onSelect(t.id)}
      >
        <ThemeThumb theme={t} />
        <div className="lw-themecard-row">
          <span className="lw-themecard-name lw-text">{t.name}</span>
          <span className={'lw-themecard-wcag is-' + t.wcag}>{t.wcag}</span>
        </div>
        <div className="lw-themecard-mood">{t.mood}</div>
      </button>
    ))}
  </div>
);

/* ─── 2. Accessibility readout ────────────────────────────────────────── */
const AccessibilityReadout: React.FC<{ theme: any }> = ({ theme }) => (
  <div className="lw-a11y-table">
    {theme.contrastPairs.map((p: any) => (
      <div className="lw-a11y-row" key={p.label} title={`${p.fg} on ${p.bg}`}>
        <div>
          <div className="lw-text" style={{ fontSize: 12.5 }}>{p.label}</div>
          <div className="lw-a11y-pair" style={{ marginTop: 4 }}>
            <span className="lw-a11y-swatch" style={{ background: p.bg, color: p.fg, border: '1px solid rgba(255,255,255,0.08)' }}>Aa</span>
            <span className="lw-a11y-swatch" style={{ background: p.fg, color: p.bg }}>Aa</span>
            <code style={{ fontSize: 10, color: 'var(--lw-text-muted)' }}>{p.fg} on {p.bg}</code>
          </div>
        </div>
        <div className="lw-a11y-ratio">{p.ratio.toFixed(1)}:1</div>
        <div className={'lw-a11y-level is-' + p.level}>{p.level}</div>
      </div>
    ))}
  </div>
);

/* ─── 3. Override list ────────────────────────────────────────────────── */
interface OverrideListProps {
  overrides: any[];
  onReset: (id: string) => void;
  onClearAll: () => void;
}
const OverrideList: React.FC<OverrideListProps> = ({ overrides, onReset, onClearAll }) => {
  if (overrides.length === 0) {
    return (
      <div className="lw-overrides">
        <div style={{ padding: '18px 14px', color: 'var(--lw-text-muted)', fontSize: 12, textAlign: 'center' }}>
          No overrides yet. Edit a token via the radial inspector to see it here.
        </div>
      </div>
    );
  }
  return (
    <div className="lw-overrides">
      {overrides.map((o) => (
        <div className="lw-override-row" key={o.id}>
          <div className="lw-override-path">{o.path}</div>
          <div className="lw-override-value">
            {o.chip ? <span className="lw-chip-color" style={{ background: o.chip }} /> : null}
            <code className="lw-text" style={{ fontFamily: 'IBM Plex Mono', fontSize: 11 }}>{o.value}</code>
          </div>
          <div className="lw-override-scope" title={o.scopeLabel}>{o.scopeLabel}</div>
          <button
            type="button"
            className="lw-row-reset"
            title={`Reset to ${o.defaultValue}`}
            onClick={() => onReset(o.id)}
            aria-label={`Reset ${o.path}`}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 5a3.5 3.5 0 1 1 1 2.5" />
              <path d="M2 2v3h3" />
            </svg>
          </button>
        </div>
      ))}
      <div className="lw-overrides-foot">
        <span className="lw-overrides-count">{overrides.length} active override{overrides.length === 1 ? '' : 's'}</span>
        <button type="button" className="lw-btn is-danger" onClick={onClearAll}>Clear all</button>
      </div>
    </div>
  );
};

/* ─── 4. Drama factors row (used inside DramaAndIntensity) ────────────── */
const DramaFactorRow: React.FC<{ factor: any; multiplier: number; onChange: (v: number) => void }> = ({ factor, multiplier, onChange }) => {
  const isMod = factor.value !== factor.default;
  const effective = factor.value * multiplier;
  const pct = ((factor.value - factor.range[0]) / (factor.range[1] - factor.range[0])) * 100;
  return (
    <div className="lw-row" style={{ borderBottom: '1px solid color-mix(in oklab, var(--lw-panel-border) 40%, transparent)' }}>
      <div className="lw-row-meta">
        <div className="lw-row-label lw-text">
          {factor.label}
          {factor.source ? (
            <span className="lw-coming-pill" style={{ marginLeft: 6, color: 'var(--lw-accent)', borderColor: 'var(--lw-accent)' }}>
              ← {factor.source}
            </span>
          ) : null}
        </div>
        <div className="lw-row-desc lw-text">{factor.description}</div>
      </div>
      <div className="lw-row-control is-wide">
        <div className="lw-slider-with-readout">
          <input
            type="range"
            className="lw-slider"
            min={factor.range[0]}
            max={factor.range[1]}
            step={(factor.range[1] - factor.range[0]) / 100}
            value={factor.value}
            style={{ ['--p' as any]: pct + '%' } as React.CSSProperties}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
          <div className="lw-slider-readout lw-text">
            {factor.value.toFixed(2)}{factor.unit ? <span className="lw-slider-readout-sub">{factor.unit}</span> : null}
            <div style={{ fontSize: 9.5, color: 'var(--lw-text-muted)', marginTop: 2 }}>
              eff {effective.toFixed(2)}{factor.unit}
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Reset to default"
        className={'lw-row-reset' + (isMod ? '' : ' is-hidden')}
        onClick={() => onChange(factor.default)}
        title="Reset to default"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5a3.5 3.5 0 1 1 1 2.5" />
          <path d="M2 2v3h3" />
        </svg>
      </button>
    </div>
  );
};

/* ─── 5. Drama & Intensity ────────────────────────────────────────────── */
interface DramaProps {
  /** 0..1.5 — master scalar. */
  drama: number;
  onDramaChange: (v: number) => void;
  factors: any[];
  onFactorChange: (id: string, v: number) => void;
}
const DramaAndIntensity: React.FC<DramaProps> = ({ drama, onDramaChange, factors, onFactorChange }) => {
  const dramaLabel =
    drama < 0.5 ? 'quiet' : drama < 1.1 ? 'cranked' : 'extreme';
  return (
    <div className="lw-drama">
      <aside className="lw-drama-master">
        <h3 className="lw-drama-title lw-text">Drama</h3>
        <p className="lw-drama-readout lw-text">
          Master scalar — multiplies every intensity factor on the right.
          <br/><br/>Currently <em>{dramaLabel}</em> · ×{drama.toFixed(2)}
        </p>
        <input
          type="range"
          className="lw-slider"
          min={0} max={1.5} step={0.01} value={drama}
          style={{ ['--p' as any]: (drama / 1.5 * 100) + '%' } as React.CSSProperties}
          onChange={(e) => onDramaChange(parseFloat(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono', fontSize: 9.5, color: 'var(--lw-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span>quiet</span><span>cranked</span><span>extreme</span>
        </div>
      </aside>

      <div className="lw-drama-factors">
        {factors.map((f) => (
          <DramaFactorRow
            key={f.id}
            factor={f}
            multiplier={drama / 0.5}
            onChange={(v) => onFactorChange(f.id, v)}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Category root ───────────────────────────────────────────────────── */
interface CategoryThemeProps {
  themes: any[];
  activeThemeId: string;
  onSelectTheme: (id: string) => void;
  overrides: any[];
  onResetOverride: (id: string) => void;
  onClearAllOverrides: () => void;
  crossfadeMs: number;
  onCrossfadeChange: (v: number) => void;
  drama: number;
  onDramaChange: (v: number) => void;
  dramaFactors: any[];
  onFactorChange: (id: string, v: number) => void;
  effects: boolean;
  reduceMotion: boolean;
  onEffectsChange: (v: boolean) => void;
  onReduceMotionChange: (v: boolean) => void;
  /** matcher: returns true if a setting label matches the current search */
  matchSearch: (s: string) => boolean;
}

const CategoryTheme: React.FC<CategoryThemeProps> = (p) => {
  const activeTheme = p.themes.find((t) => t.id === p.activeThemeId) ?? p.themes[0];
  return (
    <>
      <SettingsSubSection id="theme.preset" label="Preset" count={`${p.themes.length} themes`}>
        <ThemePickerGrid themes={p.themes} activeId={p.activeThemeId} onSelect={p.onSelectTheme} />
      </SettingsSubSection>

      <SettingsSubSection id="theme.accessibility" label="Accessibility" count={activeTheme.wcag}>
        <AccessibilityReadout theme={activeTheme} />
      </SettingsSubSection>

      <SettingsSubSection id="theme.overrides" label="Overrides" count={`${p.overrides.length} active`}>
        <OverrideList overrides={p.overrides} onReset={p.onResetOverride} onClearAll={p.onClearAllOverrides} />
      </SettingsSubSection>

      <SettingsSubSection id="theme.transitions" label="Transitions" defaultCollapsed>
        <SliderRow
          label="Crossfade duration"
          description="Theme transition animation length. 0 = snap, 300 = default. Consumed by v87.4 crossfade."
          value={p.crossfadeMs} defaultValue={300}
          min={0} max={1000} step={10}
          unit=" ms"
          format={(v) => v.toString()}
          onChange={p.onCrossfadeChange}
          isSearchMatch={p.matchSearch('crossfade')}
        />
      </SettingsSubSection>

      <SettingsSubSection id="theme.intensity" label="Drama & intensity" count={`${p.dramaFactors.length} factors`}>
        <DramaAndIntensity
          drama={p.drama} onDramaChange={p.onDramaChange}
          factors={p.dramaFactors} onFactorChange={p.onFactorChange}
        />
        <p style={{ fontSize: 11, color: 'var(--lw-text-muted)', margin: '12px 0 0', lineHeight: 1.55 }}>
          <strong style={{ color: 'var(--lw-text-primary)' }}>To plug in a live source</strong> (e.g. audio
          tempo) — push records onto <code>DRAMA_FACTORS</code> in <code>settings-data.ts</code> with a
          non-null <code>source</code>. The slider UI generates one row per factor automatically; live
          streams replace user-set values via <code>setDramaFactor(id, value)</code>.
        </p>
      </SettingsSubSection>

      <SettingsSubSection id="theme.mirrors" label="Mirrors">
        <ToggleRow
          label="Effects"
          description="Continuous animations across the workspace — particles, sphere hum, theme crossfade, panel transitions, the Inspector preview ring. When off, everything freezes. Acts as an OR gate with Reduce Motion: either toggle off quiets the app."
          value={p.effects} defaultValue={true}
          onChange={p.onEffectsChange}
          isSearchMatch={p.matchSearch('effects') || p.matchSearch('animation')}
        />
        <ToggleRow
          label="Reduce motion"
          description="Accessibility-driven halt for all idle animation. Respects the OS prefers-reduced-motion query when set. OR-gate with Effects: either toggle off freezes the app."
          value={p.reduceMotion} defaultValue={false}
          onChange={p.onReduceMotionChange}
          isSearchMatch={p.matchSearch('motion') || p.matchSearch('reduce')}
        />
      </SettingsSubSection>
    </>
  );
};

(window as any).LW_CategoryTheme = CategoryTheme;

})();
