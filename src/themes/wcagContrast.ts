/**
 * WCAG 2.1 luminance-based contrast ratio computation.
 * v87.3: WCAG only. APCA defers to v93.
 */

export type WCAGLevel = "AAA" | "AA" | "AA-large" | "fail";

export interface WCAGResult {
  ratio: number;
  level: WCAGLevel;
}

function getLuminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const sv = v / 255;
    return sv <= 0.03928 ? sv / 12.92 : Math.pow((sv + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseColor(color: string): [number, number, number] | null {
  const trimmed = color.trim();

  const hexMatch = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  const rgbaMatch = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/
  );
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    const alpha = a !== undefined ? parseFloat(a) : 1;
    return [
      Math.round(parseInt(r, 10) * alpha),
      Math.round(parseInt(g, 10) * alpha),
      Math.round(parseInt(b, 10) * alpha),
    ];
  }

  return null;
}

export function computeContrastRatio(fg: string, bg: string): number {
  const lumFg = getLuminance(fg);
  const lumBg = getLuminance(bg);
  const lighter = Math.max(lumFg, lumBg);
  const darker = Math.min(lumFg, lumBg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function computeWCAGResult(fg: string, bg: string): WCAGResult {
  const ratio = computeContrastRatio(fg, bg);
  let level: WCAGLevel;
  if (ratio >= 7) level = "AAA";
  else if (ratio >= 4.5) level = "AA";
  else if (ratio >= 3) level = "AA-large";
  else level = "fail";
  return { ratio, level };
}
