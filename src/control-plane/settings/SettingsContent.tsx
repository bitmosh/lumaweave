import { useState } from 'react';

interface ContentProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsContent({ title, description, children }: ContentProps) {
  return (
    <main data-testid="settings-panel-content" className="lw-content" role="tabpanel">
      <div className="lw-content-head">
        <h2 className="lw-content-title lw-text">{title}</h2>
        <p className="lw-content-desc lw-text">{description}</p>
      </div>
      <div>{children}</div>
    </main>
  );
}

interface SubSectionProps {
  id: string;
  label: string;
  defaultCollapsed?: boolean;
  count?: string | number;
  children: React.ReactNode;
}

export function SettingsSubSection({ id: _id, label, defaultCollapsed, count, children }: SubSectionProps) {
  const [collapsed, setCollapsed] = useState(!!defaultCollapsed);
  const toggle = () => setCollapsed((c) => !c);

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
}
