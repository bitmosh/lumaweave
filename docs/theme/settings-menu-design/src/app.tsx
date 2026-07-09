// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * app.tsx
 *
 * Demo host. Mounts the faux graph backdrop, topbar, system status bar,
 * and the floating Settings panel. State that the panel reads/writes lives
 * here (Bandit will move it to the real settings.store).
 *
 * Cmd+, opens the Settings panel from anywhere.
 */

const {
  LW_THEMES, LW_applyTheme,
  LW_SETTINGS_DATA: { SEED_OVERRIDES, DRAMA_FACTORS, FONT_FAMILIES, FEATURE_FLAGS, CATEGORIES },
  LW_FauxGraph: FauxGraph,
  LW_Topbar: Topbar, LW_SystemStatus: SystemStatus,
  LW_SettingsPanel: SettingsPanel,
  LW_SettingsSidebar: SettingsSidebar,
  LW_SettingsContent: SettingsContent,
  LW_SettingsSubSection: SubSection,
  LW_SettingsSearchBar: SettingsSearchBar,
  LW_SettingsStatusBar: SettingsStatusBar,
  LW_applyOpacityLayers: applyOpacityLayers,
  LW_CategoryTheme: CategoryTheme,
  LW_Categories: Categories,
} = window as any;

interface SettingsState {
  themeId: string;
  overrides: typeof SEED_OVERRIDES;
  crossfadeMs: number;
  drama: number;
  dramaFactors: typeof DRAMA_FACTORS;
  effects: boolean;
  reduceMotion: boolean;

  // typography
  fonts: typeof FONT_FAMILIES;

  // graph
  physicsGravity: number;
  edgeWeight: number;

  // inspector
  activationBinding: { modifiers: Array<'Ctrl'|'Alt'|'Shift'|'Meta'>; key: string | null; onClick?: boolean };
  dimGraph: boolean;
  persistSwatches: boolean;
  draggableInspector: boolean;

  // display mirrors
  panelBlur: number;
  glow: number;
  motionScale: number;

  // accessibility
  wcagLevel: 'AA-normal' | 'AAA-normal' | 'AA-large';
  contrastWarnings: boolean;

  // advanced
  probes: boolean;

  // graph dialect
  dialectId: string;
}

const DEFAULTS: SettingsState = {
  themeId: 'solar-plasma',
  overrides: SEED_OVERRIDES,
  crossfadeMs: 300,
  drama: 0.5,
  dramaFactors: DRAMA_FACTORS,
  effects: true,
  reduceMotion: false,

  fonts: FONT_FAMILIES,

  physicsGravity: 1.0,
  edgeWeight: 1.0,

  activationBinding: { modifiers: ['Alt', 'Shift'], key: null, onClick: true },
  dimGraph: true,
  persistSwatches: true,
  draggableInspector: true,

  panelBlur: 16,
  glow: 0.55,
  motionScale: 1.0,

  wcagLevel: 'AA-normal',
  contrastWarnings: true,

  probes: true,

  dialectId: 'radial-backbone',
};

const App: React.FC = () => {
  const [s, setS] = React.useState<SettingsState>(DEFAULTS);
  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const [settingsOpen, setSettingsOpen] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<string>('theme');
  const [search, setSearch] = React.useState('');
  const [opacity, setOpacity] = React.useState(1);
  const [position, setPosition] = React.useState<'floating'|'docked-left'|'docked-right'|'minimized'>('floating');

  // Apply theme to :root.
  React.useEffect(() => { LW_applyTheme(s.themeId); }, [s.themeId]);

  // Apply opacity layers to the panel.
  React.useEffect(() => {
    const panel = document.querySelector<HTMLElement>('.lw-settings-panel');
    if (panel) applyOpacityLayers(panel, opacity);
  }, [opacity, settingsOpen]);

  // Cmd+, opens settings.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Mutators ──────────────────────────────────────────────────────────
  const resetOverride = (id: string) =>
    set('overrides', s.overrides.filter((o: any) => o.id !== id));
  const clearAllOverrides = () => {
    if (s.overrides.length === 0) return;
    if (confirm(`Clear all ${s.overrides.length} overrides? Tokens snap back to their theme defaults.`)) {
      set('overrides', []);
    }
  };
  const updateFactor = (id: string, value: number) => {
    set('dramaFactors', s.dramaFactors.map((f: any) => f.id === id ? { ...f, value } : f));
  };
  const updateFontAxis = (fontId: string, axisId: string, v: number) => {
    set('fonts', s.fonts.map((f: any) =>
      f.id === fontId
        ? { ...f, axes: f.axes.map((a: any) => a.id === axisId ? { ...a, value: v } : a) }
        : f
    ));
  };
  const resetAll = () => setS(DEFAULTS);

  // ─── Search infrastructure ─────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const matchSearch = (text: string) => q.length > 0 && text.toLowerCase().includes(q);
  // Per-category match counts for the sidebar badges. Heuristic — labels of
  // working subcomponents in each category. Bandit will replace with an
  // actual settings-index walk.
  const matchCounts = React.useMemo(() => {
    if (!q) return null;
    const corpus: Record<string, string[]> = {
      theme: [
        'theme preset','accessibility readout','overrides','crossfade duration','drama','motion scale',
        'panel blur','glow intensity','sphere hum','sphere flow speed','sphere glow','effects','reduce motion'
      ],
      typography: ['typography','font','weight','wght','space grotesk','ibm plex','playground'],
      graph: ['graph','physics','gravity','edge weight','reduce motion'],
      inspector: ['radial','activation','alt+shift','dim main graph','recent swatches','draggable inspector'],
      'data-sources': ['data','source','adapter','graphify','jsonl','cypher'],
      display: ['effects','reduce motion','panel blur','glow intensity','motion scale'],
      accessibility: ['wcag','contrast','color-blind','accessibility'],
      advanced: ['developer probes','provenance manifest','feature flags','clear overrides','reset','announcement'],
    };
    const counts: Record<string, number> = {};
    for (const [cat, list] of Object.entries(corpus)) {
      counts[cat] = list.filter((s) => s.includes(q)).length;
    }
    return counts;
  }, [q]);

  // ─── Render ────────────────────────────────────────────────────────────
  const activeCat = (CATEGORIES.find((c: any) => c.id === activeCategory) ?? CATEGORIES[0]) as any;

  // Save state mock — diff if any override is present, synced otherwise.
  const saveState = s.overrides.length > 0 ? 'diff' : 'synced';
  const saveDiff = { added: 2, removed: 0, changed: s.overrides.length };

  // Sidebar collapsed when docked.
  const sidebarCollapsed = position === 'docked-left' || position === 'docked-right';

  // Theme effects / reduceMotion mirrors are bound to the same state.
  const sharedToggles = {
    effects: s.effects,
    reduceMotion: s.reduceMotion,
    onEffectsChange: (v: boolean) => set('effects', v),
    onReduceMotionChange: (v: boolean) => set('reduceMotion', v),
  };

  return (
    <div className="lw-app">
      <div className="lw-graph-bg"><FauxGraph themeId={s.themeId} /></div>

      <Topbar
        themes={LW_THEMES} themeId={s.themeId}
        onSelectTheme={(id: string) => set('themeId', id)}
        {...sharedToggles}
        onOpenSettings={() => setSettingsOpen((v) => !v)}
        settingsOpen={settingsOpen}
        dialectId={s.dialectId}
        dialects={(window as any).LW_SETTINGS_DATA.GW_DIALECT_REGISTRY}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        subtitle={`${activeCat.label.toLowerCase()}`}
        onPositionChange={setPosition}
        opacity={opacity}
        headerSlot={<SettingsSearchBar value={search} onChange={setSearch} />}
        sidebarSlot={
          <SettingsSidebar
            categories={CATEGORIES}
            activeId={activeCategory}
            collapsed={sidebarCollapsed}
            matchCounts={matchCounts}
            onSelect={setActiveCategory}
          />
        }
        contentSlot={
          <SettingsContent title={activeCat.label} description={activeCat.description} search={q}>
            {activeCategory === 'theme' && (
              <CategoryTheme
                themes={LW_THEMES}
                activeThemeId={s.themeId}
                onSelectTheme={(id: string) => set('themeId', id)}
                overrides={s.overrides}
                onResetOverride={resetOverride}
                onClearAllOverrides={clearAllOverrides}
                crossfadeMs={s.crossfadeMs}
                onCrossfadeChange={(v: number) => set('crossfadeMs', v)}
                drama={s.drama}
                onDramaChange={(v: number) => set('drama', v)}
                dramaFactors={s.dramaFactors}
                onFactorChange={updateFactor}
                {...sharedToggles}
                matchSearch={matchSearch}
              />
            )}
            {activeCategory === 'typography' && (
              <Categories.Typography fonts={s.fonts} state={{}} onAxisChange={updateFontAxis} matchSearch={matchSearch} />
            )}
            {activeCategory === 'graph' && (
              <Categories.Graph
                physicsGravity={s.physicsGravity}
                edgeWeight={s.edgeWeight}
                dialectId={s.dialectId}
                reduceMotion={s.reduceMotion}
                onSet={set}
                onReduceMotionChange={sharedToggles.onReduceMotionChange}
                matchSearch={matchSearch}
              />
            )}
            {activeCategory === 'inspector' && (
              <Categories.Inspector
                activationBinding={s.activationBinding}
                onActivationBindingChange={(b: any) => set('activationBinding', b)}
                effects={s.effects}
                reduceMotion={s.reduceMotion}
                dimGraph={s.dimGraph}
                persistSwatches={s.persistSwatches}
                draggableInspector={s.draggableInspector}
                onSet={set}
                matchSearch={matchSearch}
              />
            )}
            {activeCategory === 'data-sources' && <Categories.DataSources />}
            {activeCategory === 'display' && (() => {
              // Display's blur/glow/motionScale mirrors share state with the
              // Theme · Drama factors (per brief: "mirrors bind to the same
              // setting paths"). We read from dramaFactors and write back via
              // updateFactor, so changing here updates Theme too.
              const get = (id: string) => s.dramaFactors.find((f: any) => f.id === id)?.value ?? 0;
              const setF = (id: string) => (v: number) => updateFactor(id, v);
              return (
                <Categories.Display
                  effects={s.effects}
                  reduceMotion={s.reduceMotion}
                  panelBlur={get('panelBlur')}
                  glow={get('glowIntensity')}
                  motionScale={get('motionScale')}
                  onSet={(k: any, v: any) => {
                    // map mirror keys → drama factor ids
                    if (k === 'panelBlur')   return setF('panelBlur')(v);
                    if (k === 'glow')        return setF('glowIntensity')(v);
                    if (k === 'motionScale') return setF('motionScale')(v);
                    return set(k, v);
                  }}
                  onEffectsChange={sharedToggles.onEffectsChange}
                  onReduceMotionChange={sharedToggles.onReduceMotionChange}
                  matchSearch={matchSearch}
                />
              );
            })()}
            {activeCategory === 'accessibility' && (
              <Categories.Accessibility
                wcagLevel={s.wcagLevel}
                contrastWarnings={s.contrastWarnings}
                onSet={set}
              />
            )}
            {activeCategory === 'advanced' && (
              <Categories.Advanced
                probes={s.probes}
                flags={FEATURE_FLAGS}
                onSet={set}
                onClearAllOverrides={clearAllOverrides}
                onResetAll={resetAll}
              />
            )}
          </SettingsContent>
        }
        statusBarSlot={
          <SettingsStatusBar
            position={position}
            saveState={saveState}
            saveDiff={saveDiff}
            opacity={opacity}
            onOpacityChange={setOpacity}
          />
        }
      />

      <SystemStatus themeId={s.themeId} themes={LW_THEMES}
        dialectId={s.dialectId}
        dialects={(window as any).LW_SETTINGS_DATA.GW_DIALECT_REGISTRY}
      />

      {/* Tier 3 announcement living example.
          ────────────────────────────────────────────────────────────────
          Bandit: this is a one-instance demo to show the visual treatment.
          To trigger it for a real feature:
            1. Register the feature id with the announcement system
               (post-v97 — for now hardcode the visible flag).
            2. The system fires <AnnouncementDialog feature="..." /> when:
                 - the user idles for 3s
                 - no other dialog is open
                 - no drag/slider interaction in progress
                 - not within 5s of another dismissal
            3. Dismissed dialogs are logged so Settings > Advanced >
               Announcement History can re-arm them.
          See PATTERNS.md Pattern 7 (Tier 3) for the suppression rules. */}
      <AnnouncementDemo />
    </div>
  );
};

const AnnouncementDemo: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [dontShow, setDontShow] = React.useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed', left: 16, bottom: 40,
          zIndex: 80,
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 10,
          letterSpacing: 0.08,
          textTransform: 'uppercase',
          padding: '6px 10px',
          border: '1px dashed var(--lw-text-muted)',
          borderRadius: 4,
          color: 'var(--lw-text-muted)',
          background: 'transparent',
          opacity: open ? 0.4 : 0.85,
        }}
      >
        demo: tier-3 announcement
      </button>
      {open && (
        <div className="lw-announcement lw-anim-in" role="dialog" aria-label="New feature">
          <div className="lw-announcement-head">
            <span className="lw-status-dot" />
            <span className="lw-announcement-title">Welcome to floating Settings</span>
          </div>
          <div className="lw-announcement-body">
            The Settings panel is a tile. Drag it. Resize it. Dock it left or right.
            Adjust its opacity from the status bar to see through to your graph.
          </div>
          <div className="lw-announcement-actions">
            <label className="lw-announcement-check">
              <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
              <span>Don't show this again</span>
            </label>
            <button type="button" className="lw-btn is-link">Tell me more</button>
            <button type="button" className="lw-btn" onClick={() => setOpen(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

})();
