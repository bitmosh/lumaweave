import { useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SettingsSearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
        data-testid="settings-panel-search"
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
}
