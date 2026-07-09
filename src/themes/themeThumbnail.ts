// SPDX-License-Identifier: Apache-2.0
import { getThemeRuntimeTokens } from "./themeTokens";
import type { ThemeId } from "../control-plane/settings/settings.schema";

const W = 200;
const H = 140;

const cache = new Map<ThemeId, string>();

/**
 * Generate an SVG thumbnail for a theme from its runtime tokens.
 * Layout: header bar + panel block + accent button + text lines.
 * Cached in memory after first call.
 */
export function generateThumbnail(themeId: ThemeId): string {
  if (cache.has(themeId)) return cache.get(themeId)!;

  const { app } = getThemeRuntimeTokens(themeId);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${themeId} theme preview">
  <rect width="${W}" height="${H}" fill="${app.background}" />
  <rect x="0" y="0" width="${W}" height="20" fill="${app.background}" stroke="${app.panelBorder}" stroke-width="0.5" />
  <circle cx="14" cy="10" r="3" fill="${app.accent}" />
  <rect x="22" y="7" width="40" height="6" fill="${app.textPrimary}" opacity="0.9" rx="1" />
  <rect x="10" y="30" width="180" height="80" fill="${app.panelBackground}" stroke="${app.panelBorder}" stroke-width="1" rx="3" />
  <rect x="20" y="42" width="120" height="4" fill="${app.textPrimary}" opacity="0.85" rx="1" />
  <rect x="20" y="52" width="160" height="3" fill="${app.textMuted}" opacity="0.7" rx="1" />
  <rect x="20" y="60" width="140" height="3" fill="${app.textMuted}" opacity="0.7" rx="1" />
  <rect x="20" y="68" width="100" height="3" fill="${app.textMuted}" opacity="0.7" rx="1" />
  <rect x="20" y="84" width="50" height="14" fill="${app.accent}" rx="2" />
  <circle cx="45" cy="91" r="20" fill="${app.accent}" opacity="0.15" />
  <rect x="10" y="120" width="180" height="10" fill="${app.background}" opacity="0.6" />
  <rect x="20" y="124" width="30" height="2" fill="${app.textMuted}" opacity="0.5" rx="1" />
</svg>`.trim();

  cache.set(themeId, svg);
  return svg;
}

export function clearThumbnailCache(themeId?: ThemeId): void {
  if (themeId) cache.delete(themeId);
  else cache.clear();
}

if (
  typeof window !== "undefined" &&
  (import.meta.env.DEV || (window as any).PLAYWRIGHT)
) {
  (window as any).__lwThemeThumbnail = { generateThumbnail, clearThumbnailCache };
}
