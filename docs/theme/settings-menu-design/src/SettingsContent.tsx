// SPDX-License-Identifier: Apache-2.0
/* IIFE-WRAPPED */
(() => {
/**
 * SettingsContent.tsx
 *
 * The content rail next to the sidebar. Renders the selected category's
 * subcomponents inside an outer scroll container.
 *
 * SettingsSubSection is the collapsible group inside a category.
 * Collapsed state is per-category and persists across reloads (per the
 * resolved open question E).
 */

interface ContentProps {
  title: string;
  description: string;
  search: string;
  children: React.ReactNode;
}

const SettingsContent: React.FC<ContentProps> = ({ title, description, children }) => (
  <main className="lw-content" role="tabpanel">
    <div className="lw-content-head">
      <h2 className="lw-content-title lw-text">{title}</h2>
      <p className="lw-content-desc lw-text">{description}</p>
    </div>
    <div>{children}</div>
  </main>
);

interface SubSectionProps {
  id: string;
  label: string;
  /** Force-collapsed by default. */
  defaultCollapsed?: boolean;
  /** Optional small count rendered to the right of the section title. */
  count?: string | number;
  children: React.ReactNode;
}

const STORE_KEY = 'lw.settings.subsection.collapsed.v1';

function readCollapsedMap(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
}
function writeCollapsedMap(m: Record<string, boolean>) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(m)); } catch { /* swallow */ }
}

const SettingsSubSection: React.FC<SubSectionProps> = ({ id, label, defaultCollapsed, count, children }) => {
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    const map = readCollapsedMap();
    if (id in map) return map[id];
    return !!defaultCollapsed;
  });
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    const map = readCollapsedMap();
    map[id] = next;
    writeCollapsedMap(map);
  };
  return (
    <section className={'lw-subsection' + (collapsed ? ' is-collapsed' : '')}>
      <header
        className="lw-subsection-head"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
      >
        <span className="lw-subsection-chevron" />
        <span className="lw-subsection-label">{label}</span>
        {count != null ? <span className="lw-subsection-count">{count}</span> : null}
      </header>
      <div className="lw-subsection-body">{children}</div>
    </section>
  );
};

/* ─── Search bar ─────────────────────────────────────────────────────── */
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}
const SettingsSearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return (
    <div className="lw-searchbar">
      <input
        ref={inputRef}
        type="text"
        className="lw-searchbar-input"
        placeholder="Search settings…  e.g. blur, contrast, font weight"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') onChange(''); }}
      />
      {value
        ? <button type="button" className="lw-searchbar-clear" onClick={() => onChange('')}>clear · esc</button>
        : <span className="lw-searchbar-hint">⌘F to search</span>}
    </div>
  );
};

(window as any).LW_SettingsContent = SettingsContent;
(window as any).LW_SettingsSubSection = SettingsSubSection;
(window as any).LW_SettingsSearchBar = SettingsSearchBar;

})();
