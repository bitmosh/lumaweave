import { t } from "../../i18n";

interface HexLogoProps {
  size?: number;
}

export function HexLogo({ size = 34 }: HexLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label={t("topbar.hexLogo.ariaLabel")}
    >
      <defs>
        <linearGradient id="hexFill" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="var(--lw-color-flare-500)" />
          <stop offset="55%" stopColor="var(--lw-color-magenta-500)" />
          <stop offset="100%" stopColor="var(--lw-color-purple-500)" />
        </linearGradient>
        <radialGradient id="hexGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,179,71,0.55)" />
          <stop offset="100%" stopColor="rgba(255,179,71,0)" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#hexGlow)" />
      <polygon
        points="32,4 56,18 56,46 32,60 8,46 8,18"
        fill="none"
        stroke="url(#hexFill)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g stroke="url(#hexFill)" strokeWidth="1" strokeLinecap="round" opacity="0.95">
        <line x1="32" y1="14" x2="46" y2="22" />
        <line x1="32" y1="14" x2="18" y2="22" />
        <line x1="32" y1="14" x2="32" y2="32" />
        <line x1="46" y1="22" x2="46" y2="42" />
        <line x1="18" y1="22" x2="18" y2="42" />
        <line x1="46" y1="42" x2="32" y2="50" />
        <line x1="18" y1="42" x2="32" y2="50" />
        <line x1="32" y1="32" x2="46" y2="42" />
        <line x1="32" y1="32" x2="18" y2="42" />
      </g>
      <g fill="var(--lw-text-primary)">
        <circle cx="32" cy="14" r="2" />
        <circle cx="46" cy="22" r="2" />
        <circle cx="18" cy="22" r="2" />
        <circle cx="46" cy="42" r="2" />
        <circle cx="18" cy="42" r="2" />
        <circle cx="32" cy="50" r="2" />
        <circle cx="32" cy="32" r="2.5" fill="var(--lw-color-gold-500)" />
      </g>
    </svg>
  );
}
