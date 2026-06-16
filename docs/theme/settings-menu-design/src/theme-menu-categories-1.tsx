/* IIFE-WRAPPED */
(() => {
/**
 * theme-menu-categories-1.tsx
 *
 * Browse + Active categories. The two heaviest cards.
 *
 *   Browse  — Card grid: every registered theme with a procedural thumbnail
 *             (themed graph sample), palette swatch row, WCAG badge, mood,
 *             and an Apply affordance. Highlights the active theme with the
 *             accent border + ring treatment.
 *
 *   Active  — Theme inspector. Shows the live theme's primitives (Tier 1),
 *             semantic tokens (Tier 2) with resolves-from chain, the
 *             expanded accessibility profile, and any per-target overrides
 *             that pin theme tokens to specific nodes/clusters.
 */

const SettingsSubSection = (window as any).LW_SettingsSubSection;
const { ButtonRow } = (window as any).LW_Rows;

/* ════════════════════════════════════════════════════════════════════════
 *  BROWSE
 * ════════════════════════════════════════════════════════════════════════ */

/* ─── Procedural theme thumbnail (graph sample) ───────────────────────── */
const ThemeGraphThumb: React.FC<{ theme: any; size?: 'sm'|'md'|'lg' }> = ({ theme, size = 'md' }) => {
  // Reuse the same node/edge constellation across cards so users compare
  // colour rather than layout.
  const nodes = [
    { cx: 30, cy: 32, r: 6 }, { cx: 64, cy: 18, r: 9 }, { cx: 110, cy: 30, r: 5 },
    { cx: 152, cy: 48, r: 8 }, { cx: 178, cy: 22, r: 4 }, { cx: 44, cy: 70, r: 4 },
    { cx: 96, cy: 76, r: 11 }, { cx: 138, cy: 88, r: 5 }, { cx: 22, cy: 96, r: 6 },
    { cx: 72, cy: 110, r: 4 }, { cx: 124, cy: 116, r: 7 }, { cx: 170, cy: 100, r: 5 },
  ];
  const edges: Array<[number, number]> = [
    [0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,3],[6,7],[7,11],[5,9],[6,10],[9,10],[8,5],[8,9],
  ];
  const id = 'tg-' + theme.id + '-' + size;
  const h = size === 'sm' ? 80 : size === 'lg' ? 130 : 110;
  return (
    <svg className="lw-themecard-thumb" viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice" style={{ height: h }}>
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

/* ─── Palette swatch row (5 swatches) ─────────────────────────────────── */
const PaletteSwatchRow: React.FC<{ theme: any; compact?: boolean }> = ({ theme, compact }) => {
  const swatches = [
    { token: 'accent',   value: theme.vars['--lw-accent'] },
    { token: 'flare',    value: theme.vars['--lw-color-flare-500'] },
    { token: 'magenta',  value: theme.vars['--lw-color-magenta-500'] },
    { token: 'purple',   value: theme.vars['--lw-color-purple-500'] },
    { token: 'gold',     value: theme.vars['--lw-color-gold-500'] },
  ];
  return (
    <div className={'lw-palette-row' + (compact ? ' is-compact' : '')}>
      {swatches.map((s) => (
        <span
          key={s.token}
          className="lw-palette-chip"
          style={{ background: s.value }}
          title={`${s.token} · ${s.value}`}
        />
      ))}
    </div>
  );
};

/* ─── Theme browse card ───────────────────────────────────────────────── */
interface ThemeBrowseCardProps {
  theme: any;
  isActive: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onApply: (id: string) => void;
}
const ThemeBrowseCard: React.FC<ThemeBrowseCardProps> = ({ theme, isActive, isHovered, onHover, onSelect, onApply }) => (
  <div
    className={'lw-tm-card' + (isActive ? ' is-active' : '') + (isHovered ? ' is-hover' : '')}
    onMouseEnter={() => onHover(theme.id)}
    onMouseLeave={() => onHover(null)}
    onClick={() => onSelect(theme.id)}
    onDoubleClick={() => onApply(theme.id)}
    role="button"
    tabIndex={0}
  >
    <div className="lw-tm-card-thumb-wrap">
      <ThemeGraphThumb theme={theme} />
      {isActive && (
        <div className="lw-tm-card-active-tag">
          <span className="lw-status-dot" />
          <span>active</span>
        </div>
      )}
    </div>
    <div className="lw-tm-card-body">
      <div className="lw-tm-card-row">
        <span className="lw-tm-card-name lw-text">{theme.name}</span>
        <span className={'lw-themecard-wcag is-' + theme.wcag}>{theme.wcag}</span>
      </div>
      <div className="lw-tm-card-mood">{theme.mood}</div>
      <PaletteSwatchRow theme={theme} />
      <div className="lw-tm-card-actions">
        <button
          type="button"
          className={'lw-btn is-link' + (isActive ? ' is-disabled' : '')}
          onClick={(e) => { e.stopPropagation(); if (!isActive) onApply(theme.id); }}
          disabled={isActive}
        >
          {isActive ? '✓ Applied' : 'Apply →'}
        </button>
        <span className="lw-tm-card-id">id · <code>{theme.id}</code></span>
      </div>
    </div>
  </div>
);

/* ─── Browse category root ────────────────────────────────────────────── */
interface BrowseProps {
  themes: any[];
  activeThemeId: string;
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
  onApplyTheme: (id: string) => void;
  matchSearch: (s: string) => boolean;
}
const CategoryBrowse: React.FC<BrowseProps> = (p) => {
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'AAA' | 'AA'>('all');
  const filtered = p.themes.filter((t) =>
    filter === 'all' ? true : t.wcag === filter
  );
  return (
    <>
      <SettingsSubSection id="tm.browse.toolbar" label="Browse" count={`${filtered.length}/${p.themes.length} themes`}>
        <div className="lw-tm-browse-toolbar">
          <div className="lw-segmented" role="tablist">
            <button type="button" className={filter === 'all' ? 'is-on' : ''} onClick={() => setFilter('all')}>All</button>
            <button type="button" className={filter === 'AAA' ? 'is-on' : ''} onClick={() => setFilter('AAA')}>AAA only</button>
            <button type="button" className={filter === 'AA'  ? 'is-on' : ''} onClick={() => setFilter('AA')}>AA only</button>
          </div>
          <span className="lw-tm-browse-hint">
            <kbd className="lw-kbd">click</kbd> select &nbsp;·&nbsp;
            <kbd className="lw-kbd">dbl-click</kbd> apply
          </span>
        </div>
        <div className="lw-tm-card-grid">
          {filtered.map((t) => (
            <ThemeBrowseCard
              key={t.id}
              theme={t}
              isActive={t.id === p.activeThemeId}
              isHovered={hoverId === t.id || (!hoverId && p.selectedThemeId === t.id)}
              onHover={setHoverId}
              onSelect={p.onSelectTheme}
              onApply={p.onApplyTheme}
            />
          ))}
        </div>
      </SettingsSubSection>

      <SettingsSubSection id="tm.browse.compare" label="Compare" defaultCollapsed count="side-by-side">
        <div className="lw-tm-compare-strip">
          {p.themes.slice(0, 4).map((t) => (
            <div key={t.id} className="lw-tm-compare-cell" title={t.name}>
              <ThemeGraphThumb theme={t} size="sm" />
              <span className="lw-tm-compare-label">{t.name}</span>
            </div>
          ))}
        </div>
        <p className="lw-tm-helper">
          Compare strip syncs to the live demo graph so palette differences read against the same layout.
          Drag the divider on each cell to focus a single theme.
        </p>
      </SettingsSubSection>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════════
 *  ACTIVE — theme inspector
 * ════════════════════════════════════════════════════════════════════════ */

const Tier1Strip: React.FC<{ theme: any; primitives: any[] }> = ({ theme, primitives }) => (
  <div className="lw-tm-tier1-grid">
    {primitives.map((p) => {
      const value = theme.vars[p.varName];
      return (
        <div className="lw-tm-tier1-cell" key={p.token} title={`${p.varName}: ${value}`}>
          <div className="lw-tm-tier1-chip" style={{ background: value }} />
          <div className="lw-tm-tier1-meta">
            <div className="lw-tm-tier1-token">{p.token}</div>
            <div className="lw-tm-tier1-value">{value}</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Tier2Table: React.FC<{ theme: any; mappings: any[] }> = ({ theme, mappings }) => (
  <div className="lw-tm-tier2-table">
    <div className="lw-tm-tier2-head">
      <span>Token</span>
      <span>Value</span>
      <span>Resolves from</span>
      <span>Surface</span>
    </div>
    {mappings.map((m) => {
      const value = theme.vars[m.varName];
      // Decide whether to render a colour chip. We render one for any hex-ish
      // or rgba value, skip for things like calc() / blur values (none here).
      const isColor = typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('oklch'));
      return (
        <div className="lw-tm-tier2-row" key={m.token}>
          <div className="lw-tm-tier2-name">
            <span className="lw-tm-tier2-label">{m.label}</span>
            <code className="lw-tm-tier2-token">--lw-{m.token}</code>
          </div>
          <div className="lw-tm-tier2-value">
            {isColor && <span className="lw-tm-tier2-chip" style={{ background: value }} />}
            <code>{value}</code>
          </div>
          <div className="lw-tm-tier2-resolves">
            <code>{m.resolvesFrom}</code>
          </div>
          <div className="lw-tm-tier2-surface">{m.surface}</div>
        </div>
      );
    })}
  </div>
);

const AccessibilityProfile: React.FC<{ theme: any }> = ({ theme }) => {
  const score = theme.contrastPairs.reduce((acc: number, p: any) => {
    if (p.level === 'AAA') return acc + 1;
    if (p.level === 'AA')  return acc + 0.85;
    if (p.level === 'AA-large') return acc + 0.55;
    return acc;
  }, 0) / theme.contrastPairs.length;
  const pct = Math.round(score * 100);

  return (
    <div className="lw-tm-a11y">
      <div className="lw-tm-a11y-summary">
        <div>
          <div className="lw-tm-a11y-summary-label">Overall</div>
          <div className="lw-tm-a11y-summary-value">
            <span className={'lw-themecard-wcag is-' + theme.wcag}>{theme.wcag}</span>
            <span className="lw-tm-a11y-score">{pct}<span>/100</span></span>
          </div>
        </div>
        <div className="lw-tm-a11y-ring">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="var(--lw-panel-border-current, var(--lw-panel-border))" strokeWidth="3" />
            <circle cx="30" cy="30" r="26" fill="none" stroke="var(--lw-accent)" strokeWidth="3"
                    strokeDasharray={`${(pct/100) * 163} 200`} transform="rotate(-90 30 30)" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="lw-a11y-table">
        {theme.contrastPairs.map((p: any) => (
          <div className="lw-a11y-row" key={p.label}>
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

      <p className="lw-tm-helper">
        Targets from <strong>Settings · Accessibility</strong>: WCAG AA-normal. Ratios are computed
        against this theme's primitives. Pairs below target appear in <span style={{ color: 'var(--lw-color-flare-500)' }}>flare</span>.
      </p>
    </div>
  );
};

const PerTargetOverridesList: React.FC<{ overrides: any[]; onReset: (id: string) => void; onClearAll: () => void }> = ({ overrides, onReset, onClearAll }) => {
  if (overrides.length === 0) {
    return (
      <div className="lw-overrides">
        <div style={{ padding: '18px 14px', color: 'var(--lw-text-muted)', fontSize: 12, textAlign: 'center' }}>
          No per-target overrides. The active theme renders unmodified across every node and cluster.
        </div>
      </div>
    );
  }
  return (
    <div className="lw-overrides">
      <div className="lw-tm-pto-head">
        <span>Token</span>
        <span>Tier</span>
        <span>Value</span>
        <span>Scope</span>
        <span />
      </div>
      {overrides.map((o) => (
        <div className="lw-tm-pto-row" key={o.id}>
          <div className="lw-override-path">{o.path}</div>
          <div><span className={'lw-tm-tier-pill is-' + o.tier}>{o.tier}</span></div>
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
        <span className="lw-overrides-count">{overrides.length} per-target override{overrides.length === 1 ? '' : 's'}</span>
        <button type="button" className="lw-btn is-danger" onClick={onClearAll}>Clear all</button>
      </div>
    </div>
  );
};

/* ─── Active category root ───────────────────────────────────────────── */
interface ActiveProps {
  theme: any;
  primitives: any[];
  semantics: any[];
  overrides: any[];
  onResetOverride: (id: string) => void;
  onClearAllOverrides: () => void;
  onOpenInWorkshop: () => void;
  onDuplicateToFork: () => void;
}
const CategoryActive: React.FC<ActiveProps> = (p) => {
  return (
    <>
      {/* Header card with thumbnail + actions */}
      <div className="lw-tm-active-head">
        <ThemeGraphThumb theme={p.theme} size="lg" />
        <div className="lw-tm-active-head-meta">
          <div className="lw-tm-active-head-tag">
            <span className="lw-status-dot" /> live
          </div>
          <h3 className="lw-tm-active-head-name">{p.theme.name}</h3>
          <div className="lw-tm-active-head-mood">{p.theme.mood}</div>
          <PaletteSwatchRow theme={p.theme} />
          <div className="lw-tm-active-head-actions">
            <button type="button" className="lw-btn" onClick={p.onDuplicateToFork}>Duplicate as fork</button>
            <button type="button" className="lw-btn" onClick={p.onOpenInWorkshop} disabled>
              Open in Workshop
              <span className="lw-coming-pill" style={{ marginLeft: 8 }}>v88</span>
            </button>
          </div>
        </div>
      </div>

      <SettingsSubSection id="tm.active.tier1" label="Tier 1 · Primitives" count={`${p.primitives.length} tokens`}>
        <p className="lw-tm-helper" style={{ margin: '0 0 10px' }}>
          Raw palette. Theme authors set these directly — every other token in the system resolves from one of these.
        </p>
        <Tier1Strip theme={p.theme} primitives={p.primitives} />
      </SettingsSubSection>

      <SettingsSubSection id="tm.active.tier2" label="Tier 2 · Semantic tokens" count={`${p.semantics.length} tokens`}>
        <p className="lw-tm-helper" style={{ margin: '0 0 10px' }}>
          Surface-level tokens. Components reference these — never Tier 1 — so a single theme switch updates everything.
        </p>
        <Tier2Table theme={p.theme} mappings={p.semantics} />
      </SettingsSubSection>

      <SettingsSubSection id="tm.active.a11y" label="Accessibility profile" count={p.theme.wcag}>
        <AccessibilityProfile theme={p.theme} />
      </SettingsSubSection>

      <SettingsSubSection id="tm.active.overrides" label="Per-target overrides" count={`${p.overrides.length} active`}>
        <PerTargetOverridesList overrides={p.overrides} onReset={p.onResetOverride} onClearAll={p.onClearAllOverrides} />
      </SettingsSubSection>
    </>
  );
};

(window as any).LW_ThemeMenuCategoriesA = { CategoryBrowse, CategoryActive, ThemeGraphThumb, PaletteSwatchRow };

})();
