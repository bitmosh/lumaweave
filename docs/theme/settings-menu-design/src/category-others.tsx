/* IIFE-WRAPPED */
(() => {
/**
 * category-others.tsx
 *
 * The 7 non-Theme categories. Each has 1-3 working rows demonstrating the
 * row vocabulary, plus honest "Coming v[arc]" placeholder rows for the
 * features waiting on upstream arcs.
 *
 * Per CATEGORIES.md, full design of these comes in iteration 2+.
 */

const SubSection = (window as any).LW_SettingsSubSection;
const {
  SettingsRow: Row,
  ToggleRow: Toggle,
  SliderRow: Slider,
  SegmentedRow: Segmented,
  SelectRow: Select,
  ButtonRow: Btn,
  DisplayRow: Display,
  PlaceholderRow: Placeholder,
} = (window as any).LW_Rows;

/* ─── Typography ──────────────────────────────────────────────────────── */
interface TypographyState {
  fontWeights: Record<string, number>;
}
interface TypographyProps {
  fonts: any[];
  state: TypographyState;
  onAxisChange: (fontId: string, axisId: string, v: number) => void;
  matchSearch: (s: string) => boolean;
}
const CategoryTypography: React.FC<TypographyProps> = (p) => (
  <>
    <SubSection id="typo.playground" label="Variable-font playground" count={p.fonts.length}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '6px 2px' }}>
        {p.fonts.map((f: any) => {
          const axis = f.axes[0];
          const pct = ((axis.value - axis.min) / (axis.max - axis.min)) * 100;
          return (
            <div key={f.id} style={{ border: '1px solid color-mix(in oklab, var(--lw-panel-border) 50%, transparent)', borderRadius: 6, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div className="lw-text" style={{ fontFamily: f.cssFamily, fontWeight: axis.value, fontSize: 22, lineHeight: 1.2 }}>{f.sample}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--lw-text-muted)', marginTop: 4 }}>
                    {f.name} · role: {f.role}
                  </div>
                </div>
              </div>
              <div className="lw-slider-with-readout">
                <input
                  type="range"
                  className="lw-slider"
                  min={axis.min} max={axis.max} step={1} value={axis.value}
                  style={{ ['--p' as any]: pct + '%' } as React.CSSProperties}
                  onChange={(e) => p.onAxisChange(f.id, axis.id, parseInt(e.target.value, 10))}
                />
                <div className="lw-slider-readout lw-text">
                  {axis.value}<span className="lw-slider-readout-sub">{axis.label.toLowerCase()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SubSection>

    <SubSection id="typo.roles" label="Font role assignment">
      {p.fonts.map((f: any) => (
        <Display
          key={f.id}
          label={f.role.charAt(0).toUpperCase() + f.role.slice(1)}
          description={`Currently bound to ${f.name}.`}
          value={<><span style={{ fontFamily: f.cssFamily }}>{f.name}</span></>}
        />
      ))}
    </SubSection>

    <SubSection id="typo.deferred" label="Coming later">
      <Placeholder label="Per-token typography editing" description="Assign different families to display, body, mono via tokens." comingIn="v89" />
      <Placeholder label="Custom font import" description="Load font packs from disk or URL." comingIn="v88b" />
    </SubSection>
  </>
);

/* ─── Graph ───────────────────────────────────────────────────────────── */
const CategoryGraph: React.FC<any> = (p) => {
  // Read selectable dialects from the registry; experimentals stay visible
  // but show their status as a hint.
  const dialects = (window as any).LW_SETTINGS_DATA.GW_DIALECT_REGISTRY as any[];
  const active = dialects.find((d: any) => d.id === p.dialectId) ?? dialects[0];
  return (
    <>
      <SubSection id="graph.physics" label="gwells · physics defaults">
        <Select
          label="Dialect"
          description={active.description + (active.status === 'experimental' ? '  ·  Experimental.' : '')}
          value={p.dialectId} defaultValue="radial-backbone"
          options={dialects.map((d: any) => ({
            value: d.id,
            label: `${d.label}${d.status === 'experimental' ? '  ·  experimental' : ''}`,
          }))}
          onChange={(v: string) => p.onSet('dialectId', v)}
          isSearchMatch={p.matchSearch('dialect') || p.matchSearch('layout')}
        />
        <Slider
          label="Gravity" description="Outward pull on disconnected nodes."
          value={p.physicsGravity} defaultValue={1.0} min={0} max={5} step={0.05}
          onChange={(v: number) => p.onSet('physicsGravity', v)}
          isSearchMatch={p.matchSearch('gravity')}
        />
        <Slider
          label="Edge weight" description="Pull strength along connected edges."
          value={p.edgeWeight} defaultValue={1.0} min={0} max={3} step={0.05}
          onChange={(v: number) => p.onSet('edgeWeight', v)}
        />
      </SubSection>
      <SubSection id="graph.mirrors" label="Mirrors">
        <Toggle
          label="Reduce motion"
          description="Stop continuous physics when reduce-motion is on."
          value={p.reduceMotion} defaultValue={false}
          onChange={p.onReduceMotionChange}
        />
      </SubSection>
      <SubSection id="graph.coming" label="Coming later" defaultCollapsed>
        <Placeholder label="Edge styling" description="Per-edge color, weight, gradient bleed." comingIn="v91" />
        <Placeholder label="Render quality" description="Performance/fidelity tier picker for the node program." comingIn="v90" />
        <Placeholder label="Audio-reactive graph" description="Streams audio analysis into physics + appearance." comingIn="v92" />
        <Placeholder label="3D minimap" description="Volumetric overview." comingIn="v94" />
        <Placeholder label="Dialect authoring" description="Build your own gwells dialect from a config." comingIn="v95" />
      </SubSection>
    </>
  );
};

/* ─── Inspector ───────────────────────────────────────────────────────── */

/* ─── Inspector ───────────────────────────────────────────────────────── */
const CategoryInspector: React.FC<any> = (p) => {
  // Pull the rebuilt internals from window so the heavy components stay
  // in their own file (inspector-internals.tsx).
  const { InspectorPreview: LiveInspectorPreview, HotkeyRebindRow } = (window as any).LW_Inspector;
  const animationsActive = !!p.effects && !p.reduceMotion;

  // Render the live hotkey as a human-readable string for the preview overlay.
  const { formatBinding } = (window as any).LW_SETTINGS_DATA;
  const activationLabel = formatBinding(p.activationBinding);

  return (
    <>
      <SubSection id="inspector.preview" label="Preview">
        <LiveInspectorPreview
          activationHotkey={activationLabel}
          animationsActive={animationsActive}
        />
      </SubSection>

      <SubSection id="inspector.activation" label="Activation">
        <HotkeyRebindRow
          binding={p.activationBinding}
          registryId="radial.activate"
          onChange={p.onActivationBindingChange}
          isSearchMatch={p.matchSearch('activation') || p.matchSearch('hotkey') || p.matchSearch('radial')}
        />
      </SubSection>

      <SubSection id="inspector.behavior" label="Behavior" count="3">
        <Toggle
          label="Dim main graph when inspecting"
          description="Fade nodes outside the selected cluster to keep focus on the inspected element. Affects the canvas, not the inspector itself."
          value={p.dimGraph} defaultValue={true}
          onChange={(v: boolean) => p.onSet('dimGraph', v)}
          isSearchMatch={p.matchSearch('dim')}
        />
        <Toggle
          label="Persist recent swatches"
          description="Remember the last 8 colors you picked across sessions. Off = swatches reset each launch."
          value={p.persistSwatches} defaultValue={true}
          onChange={(v: boolean) => p.onSet('persistSwatches', v)}
          isSearchMatch={p.matchSearch('swatch')}
        />
        <Toggle
          label="Draggable inspector panel"
          description="Allow dragging the radial inspector by its title bar. When off, it stays pinned to its trigger point."
          value={p.draggableInspector} defaultValue={true}
          onChange={(v: boolean) => p.onSet('draggableInspector', v)}
          isSearchMatch={p.matchSearch('drag') || p.matchSearch('inspector')}
        />
      </SubSection>

      <SubSection id="inspector.coming" label="Coming later" defaultCollapsed>
        <Placeholder label="Per-spoke configuration" description="Show/hide individual radial spokes." comingIn="v89" />
        <Placeholder label="Default scope picker" description="Choose default scope (target/kind/cluster/global) for color edits." comingIn="v89" />
        <Placeholder label="Custom spoke order" description="Rearrange the 9 spokes." comingIn="v89" />
      </SubSection>
    </>
  );
};

/* ─── Data & Sources ──────────────────────────────────────────────────── */
const CategoryDataSources: React.FC<any> = (_p) => (
  <>
    <SubSection id="data.active" label="Active source">
      <Display label="Loaded graph" description="The currently mounted graph fixture."
        value={<><span style={{ color: 'var(--lw-accent)' }}>●</span> LumaWeave Self-Graph</>} />
      <Display label="Counts" description="Nodes and edges currently in memory." value="100 nodes · 110 edges" />
      <Display label="Source type" description="Adapter that loaded this source." value="graphify · v3.2" />
    </SubSection>
    <SubSection id="data.adapters" label="Registered adapters" count="3">
      <Row label={<>graphify <span className="lw-coming-pill" style={{ marginLeft: 6, color: 'var(--lw-accent)', borderColor: 'var(--lw-accent)' }}>ACTIVE</span></>} description="Reads provenance manifests from /src.">
        <code className="lw-text" style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--lw-text-muted)' }}>v3.2</code>
      </Row>
      <Row label="jsonl · stream" description="Streaming JSONL adapter for live sources.">
        <code className="lw-text" style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--lw-text-muted)' }}>idle</code>
      </Row>
      <Row label="cypher · bridge" description="Cypher query passthrough to Neo4j-compatible stores.">
        <code className="lw-text" style={{ fontFamily: 'IBM Plex Mono', fontSize: 11, color: 'var(--lw-text-muted)' }}>idle</code>
      </Row>
    </SubSection>
    <SubSection id="data.coming" label="Coming later">
      <Placeholder label="Adapter activation" description="Toggle adapters on/off without code changes." comingIn="v95" />
      <Placeholder label="Diff triage" description="Accept/reject per-change UI for stale sources." comingIn="v95" />
      <Placeholder label="Profile/vault switcher" description="Multiple workspaces with isolated state." comingIn="v97" />
    </SubSection>
  </>
);

/* ─── Display ─────────────────────────────────────────────────────────── */

/** Visual chip pinned to mirror rows showing the canonical setting path.
 *  Tells the user "this control is duplicated here for accessibility — it's
 *  the same setting as <origin>". */
const MirrorChip: React.FC<{ origin: string }> = ({ origin }) => (
  <span
    className="lw-mirror-chip"
    title={`Mirror of ${origin} — change here = change everywhere.`}
  >
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M3 1.5L7 5l-4 3.5" />
      <path d="M1 5h5" />
    </svg>
    {origin}
  </span>
);

/** Wraps the label text + mirror chip into a vertical stack so the chip
 *  sits on its own line below the label, regardless of available width. */
const MirrorLabel: React.FC<{ text: string; origin: string }> = ({ text, origin }) => (
  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
    <span>{text}</span>
    <MirrorChip origin={origin} />
  </span>
);

const CategoryDisplay: React.FC<any> = (p) => {
  const note = (
    <div style={{
      padding: '10px 12px',
      border: '1px solid color-mix(in oklab, var(--lw-panel-border-current, var(--lw-panel-border)) 60%, transparent)',
      borderRadius: 6,
      background: 'color-mix(in oklab, var(--lw-accent) 5%, transparent)',
      fontSize: 11.5,
      lineHeight: 1.5,
      color: 'var(--lw-text-muted)',
      marginBottom: 12,
    }}>
      <strong style={{ color: 'var(--lw-text-primary)' }}>About this category.</strong>{' '}
      Every control here is a <em style={{ color: 'var(--lw-accent)', fontStyle: 'normal' }}>mirror</em> — it
      binds to the same setting as its origin in another category. Change a value here and it propagates
      everywhere; resetting one resets the others.
    </div>
  );

  return (
    <>
      <SubSection id="display.mirrors" label="Mirrors" count="5">
        {note}

        <Toggle
          label={<MirrorLabel text="Effects" origin="Theme · Mirrors  /  Topbar" />}
          description="Master switch for continuous animations. Off = freeze all motion (particles, sphere hum, theme crossfade, panel transitions, Inspector preview ring). OR-gate with Reduce Motion: either toggle off quiets the app."
          value={p.effects} defaultValue={true}
          onChange={p.onEffectsChange}
          isSearchMatch={p.matchSearch('effects') || p.matchSearch('animation')}
        />

        <Toggle
          label={<MirrorLabel text="Reduce motion" origin="Theme · Mirrors  /  Topbar  /  OS pref" />}
          description="Accessibility-driven halt for all idle animation. Respects the OS prefers-reduced-motion query when set; this toggle overrides it for the session. OR-gate with Effects."
          value={p.reduceMotion} defaultValue={false}
          onChange={p.onReduceMotionChange}
          isSearchMatch={p.matchSearch('motion') || p.matchSearch('reduce')}
        />

        <Slider
          label={<MirrorLabel text="Panel blur" origin="Theme · Drama · panelBlur" />}
          description="Backdrop blur strength on glass tiles. Higher values feel softer; 0 is a hard glass edge."
          value={p.panelBlur} defaultValue={16} min={0} max={28} step={1}
          unit=" px" format={(v) => v.toString()}
          onChange={(v: number) => p.onSet('panelBlur', v)}
          isSearchMatch={p.matchSearch('blur')}
        />

        <Slider
          label={<MirrorLabel text="Glow intensity" origin="Theme · Drama · glowIntensity" />}
          description="Spread of accent halos and node bloom. Drama's master scalar multiplies this."
          value={p.glow} defaultValue={0.55} min={0} max={1} step={0.01}
          onChange={(v: number) => p.onSet('glow', v)}
          isSearchMatch={p.matchSearch('glow')}
        />

        <Slider
          label={<MirrorLabel text="Motion scale" origin="Theme · Drama · motionScale" />}
          description="Multiplier on all motion durations and amplitudes. 1.0 = base. 0 = snap-only."
          value={p.motionScale} defaultValue={1.0} min={0} max={1.5} step={0.05}
          unit="×"
          onChange={(v: number) => p.onSet('motionScale', v)}
          isSearchMatch={p.matchSearch('motion') || p.matchSearch('scale')}
        />
      </SubSection>

      <SubSection id="display.coming" label="Coming later" defaultCollapsed>
        <Placeholder label="Performance mode" description="Picker between fidelity tiers (auto / high / medium / low)." comingIn="v90" />
        <Placeholder label="Particle density" description="Adjust ambient particle counts and emission rate." comingIn="v92" />
        <Placeholder label="Detail level slider" description="Override LOD heuristics for the node program." comingIn="v90" />
        <Placeholder label="3D minimap controls" description="Camera, density, and overlay options for the volumetric minimap." comingIn="v94" />
      </SubSection>
    </>
  );
};

/* ─── Accessibility ───────────────────────────────────────────────────── */
const CategoryAccessibility: React.FC<any> = (p) => (
  <>
    <SubSection id="a11y.wcag" label="WCAG target">
      <Segmented
        label="Contrast target level"
        description="Determines what counts as 'passing' in theme accessibility readouts."
        value={p.wcagLevel} defaultValue="AA-normal"
        onChange={(v: any) => p.onSet('wcagLevel', v)}
        options={[
          { value: 'AA-normal',  label: 'AA · 4.5:1' },
          { value: 'AAA-normal', label: 'AAA · 7:1' },
          { value: 'AA-large',   label: 'AA Large · 3:1' },
        ]}
      />
      <Toggle label="Show contrast warnings"
        description="Flag themes that fail the active target level in the theme picker."
        value={p.contrastWarnings} defaultValue={true}
        onChange={(v: boolean) => p.onSet('contrastWarnings', v)} />
    </SubSection>
    <SubSection id="a11y.cb" label="Color-blind simulation">
      <Row
        label={<>Color-blind simulation <span className="lw-coming-pill" style={{ marginLeft: 6 }}>Coming v93</span></>}
        description="Preview the workspace through a color-blindness lens. UI rendered; engine arrives v93."
      >
        <button type="button" className="lw-toggle is-disabled" disabled aria-disabled />
      </Row>
      <div style={{ paddingLeft: 8, opacity: 0.5 }}>
        {(['deuteranopia','protanopia','tritanopia','achromatopsia'] as const).map((kind) => (
          <div className="lw-row" style={{ paddingLeft: 18 }} key={kind}>
            <div className="lw-row-meta">
              <div className="lw-row-label lw-text" style={{ fontSize: 12 }}>{kind}</div>
            </div>
            <div className="lw-row-control">
              <button type="button" className="lw-toggle is-disabled" disabled />
            </div>
            <span />
          </div>
        ))}
      </div>
    </SubSection>
    <SubSection id="a11y.coming" label="Coming later">
      <Placeholder label="APCA contrast targets" description="Beyond WCAG2 ratios." comingIn="v93" />
      <Placeholder label="Motion intensity floor" description="Minimum acceptable motion level." comingIn="v93" />
    </SubSection>
  </>
);

/* ─── Advanced ────────────────────────────────────────────────────────── */
const CategoryAdvanced: React.FC<any> = (p) => (
  <>
    <SubSection id="advanced.probes" label="Developer tools">
      <Toggle label="Expose __lw* window probes"
        description="Mount diagnostic probes on window. Always on in dev builds."
        value={p.probes} defaultValue={true}
        onChange={(v: boolean) => p.onSet('probes', v)} />
      <Btn label="Regenerate provenance manifest"
        description="Re-runs the provenance manifest generator. Useful after JSX edits."
        buttonLabel="Regenerate"
        onClick={() => alert('(Stub) Bandit will call regenerateProvenanceManifest().')} />
    </SubSection>

    <SubSection id="advanced.flags" label="Feature flags" count={p.flags.length}>
      {p.flags.map((f: any) => (
        <Row key={f.id} label={f.label} description={f.description}>
          <span className="lw-chip lw-text">
            <span className="lw-status-dot" style={{ background: f.on ? 'var(--lw-accent)' : 'var(--lw-text-muted)', boxShadow: f.on ? '0 0 8px var(--lw-glow)' : 'none' }} />
            {f.on ? 'on' : 'off'}
          </span>
        </Row>
      ))}
    </SubSection>

    <SubSection id="advanced.reset" label="Reset" defaultCollapsed>
      <Btn label="Clear all theme overrides"
        description="Wipes every entry in themeOverrideStorage. Confirm dialog before action."
        buttonLabel="Clear overrides"
        danger
        onClick={p.onClearAllOverrides} />
      <Btn label="Reset all settings to default"
        description="Restores every setting in the store. Theme presets are not deleted."
        buttonLabel="Reset all settings"
        danger
        onClick={() => { if (confirm('Reset every setting? Themes and overrides are untouched.')) p.onResetAll(); }} />
    </SubSection>

    <SubSection id="advanced.history" label="Announcement history" defaultCollapsed>
      <p style={{ fontSize: 11.5, color: 'var(--lw-text-muted)', margin: '4px 0 10px', lineHeight: 1.55 }}>
        Tier 3 announcements you've dismissed can be re-enabled here.
      </p>
      <Row label="Tile dock affordances"
        description="Introduced when the tile system shipped (v86c)."
      >
        <button type="button" className="lw-btn is-link" onClick={() => alert('(Stub) Re-arm the announcement.')}>Re-arm</button>
      </Row>
      <Row label="Override scopes"
        description="The four-level scope model (target/kind/cluster/global)."
      >
        <button type="button" className="lw-btn is-link" onClick={() => alert('(Stub) Re-arm the announcement.')}>Re-arm</button>
      </Row>
    </SubSection>
  </>
);

(window as any).LW_Categories = {
  Typography: CategoryTypography,
  Graph: CategoryGraph,
  Inspector: CategoryInspector,
  DataSources: CategoryDataSources,
  Display: CategoryDisplay,
  Accessibility: CategoryAccessibility,
  Advanced: CategoryAdvanced,
};

})();
