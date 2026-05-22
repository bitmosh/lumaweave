/**
 * Node Program Thumbnails (v89.4)
 *
 * Generates 48×48 ImageBitmap thumbnails for each node program preset.
 * Uses OffscreenCanvas with 2D context — draws visual character of each
 * program with radial gradients rather than exact shader replay.
 *
 * Cache: module-level Map keyed `${presetId}:${themeId}`.
 * Invalidation: Zustand settings store selector subscription on appearance.theme.
 */

import type { NodeProgramId } from "../../graph/nodePrograms/types";
import { getThemeRuntimeTokens } from "../../themes/themeTokens";
import type { ThemeId } from "../../control-plane/settings/settings.schema";

const THUMB_SIZE = 48;
const cache = new Map<string, ImageBitmap>();

function cacheKey(presetId: NodeProgramId, themeId: string): string {
  return `${presetId}:${themeId}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const val = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  return [(val >> 16) & 255, (val >> 8) & 255, val & 255];
}

function drawSun(ctx: OffscreenCanvasRenderingContext2D, nodeColor: string): void {
  const cx = THUMB_SIZE / 2;
  const cy = THUMB_SIZE / 2;
  const r = THUMB_SIZE / 2;
  const [nr, ng, nb] = hexToRgb(nodeColor);

  // Outer corona glow
  const corona = ctx.createRadialGradient(cx, cy, r * 0.38, cx, cy, r * 0.95);
  corona.addColorStop(0, `rgba(${nr},${ng},${nb},0.55)`);
  corona.addColorStop(0.5, `rgba(${nr},${ng},${nb},0.20)`);
  corona.addColorStop(1, `rgba(${nr},${ng},${nb},0.0)`);
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Sphere body
  const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.4);
  body.addColorStop(0, `rgba(255,252,230,1.0)`);
  body.addColorStop(0.3, `rgba(255,235,180,1.0)`);
  body.addColorStop(0.7, `rgba(${nr},${ng},${nb},1.0)`);
  body.addColorStop(1, `rgba(${nr},${ng},${nb},1.0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlassSphere(ctx: OffscreenCanvasRenderingContext2D, nodeColor: string): void {
  const cx = THUMB_SIZE / 2;
  const cy = THUMB_SIZE / 2;
  const r = THUMB_SIZE * 0.42;
  const [nr, ng, nb] = hexToRgb(nodeColor);

  // Subtle outer glow
  const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.35);
  glow.addColorStop(0, `rgba(${nr},${ng},${nb},0.25)`);
  glow.addColorStop(1, `rgba(${nr},${ng},${nb},0.0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fill();

  // Sphere body
  const body = ctx.createRadialGradient(cx * 0.7, cy * 0.7, 0, cx, cy, r);
  body.addColorStop(0, `rgba(255,255,255,0.9)`);
  body.addColorStop(0.2, `rgba(${nr},${ng},${nb},0.95)`);
  body.addColorStop(1, `rgba(${Math.max(0, nr - 40)},${Math.max(0, ng - 40)},${Math.max(0, nb - 40)},1.0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlight
  const spec = ctx.createRadialGradient(cx * 0.72, cy * 0.72, 0, cx * 0.72, cy * 0.72, r * 0.38);
  spec.addColorStop(0, `rgba(255,255,255,0.75)`);
  spec.addColorStop(1, `rgba(255,255,255,0.0)`);
  ctx.fillStyle = spec;
  ctx.beginPath();
  ctx.arc(cx * 0.72, cy * 0.72, r * 0.38, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrystal(ctx: OffscreenCanvasRenderingContext2D, nodeColor: string): void {
  const cx = THUMB_SIZE / 2;
  const cy = THUMB_SIZE / 2;
  const r = THUMB_SIZE * 0.42;
  const [nr, ng, nb] = hexToRgb(nodeColor);

  // Strong ring glow
  const ringGlow = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.5);
  ringGlow.addColorStop(0, `rgba(${nr},${ng},${nb},0.65)`);
  ringGlow.addColorStop(0.4, `rgba(${nr},${ng},${nb},0.30)`);
  ringGlow.addColorStop(1, `rgba(${nr},${ng},${nb},0.0)`);
  ctx.fillStyle = ringGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Bright saturated body
  const sat = Math.min(255, Math.round(nr * 0.2 + 205));
  const body = ctx.createRadialGradient(cx * 0.68, cy * 0.68, 0, cx, cy, r);
  body.addColorStop(0, `rgba(255,255,255,1.0)`);
  body.addColorStop(0.15, `rgba(${sat},${Math.min(255, ng + 60)},${Math.min(255, nb + 60)},1.0)`);
  body.addColorStop(0.7, `rgba(${nr},${ng},${nb},1.0)`);
  body.addColorStop(1, `rgba(${Math.max(0, nr - 20)},${Math.max(0, ng - 20)},${Math.max(0, nb - 20)},1.0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrb(ctx: OffscreenCanvasRenderingContext2D, nodeColor: string): void {
  const cx = THUMB_SIZE / 2;
  const cy = THUMB_SIZE / 2;
  const r = THUMB_SIZE * 0.42;
  const [nr, ng, nb] = hexToRgb(nodeColor);
  const dr = Math.max(0, nr - 60);
  const dg = Math.max(0, ng - 60);
  const db = Math.max(0, nb - 60);

  // Soft diffuse glow
  const glow = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.3);
  glow.addColorStop(0, `rgba(${nr},${ng},${nb},0.18)`);
  glow.addColorStop(1, `rgba(${nr},${ng},${nb},0.0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Muted deep body
  const body = ctx.createRadialGradient(cx * 0.78, cy * 0.78, 0, cx, cy, r);
  body.addColorStop(0, `rgba(${Math.min(255, nr + 30)},${Math.min(255, ng + 30)},${Math.min(255, nb + 30)},0.85)`);
  body.addColorStop(0.5, `rgba(${nr},${ng},${nb},0.95)`);
  body.addColorStop(1, `rgba(${dr},${dg},${db},1.0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawPip(ctx: OffscreenCanvasRenderingContext2D, nodeColor: string): void {
  const cx = THUMB_SIZE / 2;
  const cy = THUMB_SIZE / 2;
  const r = THUMB_SIZE * 0.28;
  const [nr, ng, nb] = hexToRgb(nodeColor);

  // Tight minimal glow
  const glow = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.4);
  glow.addColorStop(0, `rgba(${nr},${ng},${nb},0.20)`);
  glow.addColorStop(1, `rgba(${nr},${ng},${nb},0.0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Clean tight sphere
  const body = ctx.createRadialGradient(cx * 0.75, cy * 0.75, 0, cx, cy, r);
  body.addColorStop(0, `rgba(255,255,255,0.7)`);
  body.addColorStop(0.25, `rgba(${nr},${ng},${nb},1.0)`);
  body.addColorStop(1, `rgba(${Math.max(0, nr - 30)},${Math.max(0, ng - 30)},${Math.max(0, nb - 30)},1.0)`);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

async function renderThumbnail(presetId: NodeProgramId, themeId: string): Promise<ImageBitmap> {
  const tokens = getThemeRuntimeTokens(themeId as ThemeId);
  const nodeColor = tokens.graph.nodeDefault;

  const canvas = new OffscreenCanvas(THUMB_SIZE, THUMB_SIZE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("nodeProgramThumbnails: OffscreenCanvas 2D context unavailable");

  ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);

  switch (presetId) {
    case "sun":         drawSun(ctx, nodeColor);         break;
    case "glass-sphere": drawGlassSphere(ctx, nodeColor); break;
    case "crystal":     drawCrystal(ctx, nodeColor);     break;
    case "orb":         drawOrb(ctx, nodeColor);         break;
    case "pip":         drawPip(ctx, nodeColor);         break;
  }

  return canvas.transferToImageBitmap();
}

export async function getThumbnail(presetId: NodeProgramId, themeId: string): Promise<ImageBitmap> {
  const key = cacheKey(presetId, themeId);
  const cached = cache.get(key);
  if (cached) return cached;

  const bitmap = await renderThumbnail(presetId, themeId);
  cache.set(key, bitmap);
  return bitmap;
}

export function getCacheSize(): number {
  return cache.size;
}

// Invalidate on theme switch via Zustand state subscription
if (typeof window !== "undefined") {
  import("../../control-plane/settings/settings.store").then(({ useSettingsStore }) => {
    useSettingsStore.subscribe((state, prevState) => {
      const newThemeId = state.settings.appearance.theme;
      const oldThemeId = prevState.settings.appearance.theme;
      if (newThemeId === oldThemeId) return;
      for (const key of cache.keys()) {
        if (!key.endsWith(`:${newThemeId}`)) cache.delete(key);
      }
    });
  });
}
