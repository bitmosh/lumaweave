import React, { createContext, useContext, useState, useEffect } from "react";
import { useMinimapSettings, useSetMinimapSetting } from "./useMinimapSettings";

const MIN_W = 200;
const MIN_H = 120;
const MAX_W = 520;
const MAX_H = 360;
export const MINIMAP_COLLAPSED_H = 30;
const SNAP_GRID = 16;
const EDGE_MARGIN = 8;
const STATUS_BAR_MARGIN = 40;
const TOP_MARGIN = 68;

const snap = (v: number) => Math.round(v / SNAP_GRID) * SNAP_GRID;

export function positionFromAnchor(
  anchor: { edge?: string; offset?: number; x?: number; y?: number } | null | undefined,
  size: { width: number; height: number },
): { x: number; y: number } {
  if (!anchor || anchor.edge === "free") {
    return {
      x: anchor?.x ?? window.innerWidth - size.width - 18,
      y: anchor?.y ?? window.innerHeight - size.height - STATUS_BAR_MARGIN - 18,
    };
  }
  const offset = anchor.offset ?? 18;
  switch (anchor.edge) {
    case "right":  return { x: window.innerWidth - size.width - offset, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    case "left":   return { x: offset, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    case "top":    return { x: window.innerWidth - size.width - 18, y: offset };
    case "bottom": return { x: window.innerWidth - size.width - 18, y: window.innerHeight - size.height - STATUS_BAR_MARGIN - offset };
    default:       return { x: 18, y: 18 };
  }
}

export function shouldFlipMinimap(
  position: { x: number; y: number },
  size: { width: number; height: number },
  collapsed: boolean,
  viewportH: number,
): boolean {
  const h = collapsed ? MINIMAP_COLLAPSED_H : size.height;
  return position.y + h > viewportH * 0.75;
}

export function toggleMinimapCollapsed(
  settings: { collapsed: boolean; position: { x: number; y: number }; size: { width: number; height: number } },
  setSetting: (keyOrPatch: string | Record<string, unknown>, value?: unknown) => void,
  flipped: boolean,
) {
  if (settings.collapsed) {
    if (flipped) {
      const newY = Math.max(TOP_MARGIN, settings.position.y - (settings.size.height - MINIMAP_COLLAPSED_H));
      setSetting({ collapsed: false, position: { x: settings.position.x, y: newY } });
    } else {
      setSetting("collapsed", false);
    }
  } else {
    if (flipped) {
      const newY = settings.position.y + settings.size.height - MINIMAP_COLLAPSED_H;
      setSetting({ collapsed: true, position: { x: settings.position.x, y: newY } });
    } else {
      setSetting("collapsed", true);
    }
  }
}

// ── ShellContext ──────────────────────────────────────────
interface ShellContextValue {
  startDrag: (e: React.MouseEvent) => void;
  startResize: (e: React.MouseEvent) => void;
  flipped: boolean;
  collapsed: boolean;
}

const ShellContext = createContext<ShellContextValue>({
  startDrag: () => {},
  startResize: () => {},
  flipped: false,
  collapsed: false,
});

export function useShellContext() {
  return useContext(ShellContext);
}

// ── MinimapShell ──────────────────────────────────────────
export function MinimapShell({
  children,
}: {
  status?: string;
  children: React.ReactNode;
}) {
  const settings = useMinimapSettings();
  const setSetting = useSetMinimapSetting();

  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Hydrate position from anchor on first mount (position is {0,0}).
  useEffect(() => {
    if (settings.position.x === 0 && settings.position.y === 0) {
      setSetting("position", positionFromAnchor(settings.anchor, settings.size));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clamp on viewport resize.
  useEffect(() => {
    const onResize = () => {
      const h = settings.collapsed ? MINIMAP_COLLAPSED_H : settings.size.height;
      const x = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - settings.size.width - EDGE_MARGIN, settings.position.x));
      const y = Math.max(TOP_MARGIN, Math.min(window.innerHeight - h - STATUS_BAR_MARGIN, settings.position.y));
      if (x !== settings.position.x || y !== settings.position.y) {
        setSetting("position", { x, y });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.position, settings.size, settings.collapsed]);

  const flipped = shouldFlipMinimap(settings.position, settings.size, settings.collapsed, vh);

  const [interactionStatus, setStatus] = useState<"idle" | "drag" | "resize">("idle");
  const isActive = interactionStatus !== "idle";

  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest?.("[data-testid='minimap-snap'],[data-testid='minimap-collapse'],[data-testid='minimap-close']")) return;
    e.preventDefault();
    setStatus("drag");
    const startX = e.clientX, startY = e.clientY;
    const startPos = settings.position;
    const h = settings.collapsed ? MINIMAP_COLLAPSED_H : settings.size.height;

    const onMove = (ev: MouseEvent) => {
      let nx = startPos.x + (ev.clientX - startX);
      let ny = startPos.y + (ev.clientY - startY);
      nx = Math.max(EDGE_MARGIN, Math.min(window.innerWidth - settings.size.width - EDGE_MARGIN, nx));
      ny = Math.max(TOP_MARGIN, Math.min(window.innerHeight - h - STATUS_BAR_MARGIN, ny));
      setSetting("position", { x: nx, y: ny });
    };
    const onUp = () => {
      setStatus("idle");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (settings.collapsed) return;
    setStatus("resize");
    const startX = e.clientX, startY = e.clientY;
    const startSize = settings.size;

    const onMove = (ev: MouseEvent) => {
      const w = Math.max(MIN_W, Math.min(MAX_W, snap(startSize.width + (ev.clientX - startX))));
      const h = Math.max(MIN_H, Math.min(MAX_H, snap(startSize.height + (ev.clientY - startY))));
      setSetting("size", { width: w, height: h });
    };
    const onUp = () => {
      setStatus("idle");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const borderColor = isActive
    ? "oklch(from var(--lw-accent) l c h / 0.95)"
    : "var(--lw-panel-border)";

  const glow = isActive
    ? [
        "inset 0 0 0 1px oklch(from var(--lw-accent) l c h / 0.30)",
        "0 0 34px oklch(from var(--lw-accent) l c h / 0.32)",
        "0 22px 60px rgba(0, 0, 0, 0.55)",
      ].join(", ")
    : [
        "inset 0 0 0 1px oklch(from var(--lw-panel-border) l c h / 0.18)",
        "0 0 22px oklch(from var(--lw-accent) l c h / 0.20)",
        "0 14px 40px rgba(0, 0, 0, 0.45)",
      ].join(", ");

  const bg = [
    "radial-gradient(60% 60% at 18% 20%, oklch(from var(--lw-accent) l c h / 0.18), transparent 55%)",
    "radial-gradient(60% 60% at 82% 80%, oklch(from var(--lw-accent) l c h / 0.18), transparent 65%)",
    "var(--lw-panel-background)",
  ].join(", ");

  const h = settings.collapsed ? MINIMAP_COLLAPSED_H : settings.size.height;

  return (
    <ShellContext.Provider value={{ startDrag, startResize, flipped, collapsed: settings.collapsed }}>
      <div
        data-testid="minimap-panel"
        data-lw-theme-target="minimap.root"
        data-active={isActive}
        data-collapsed={settings.collapsed}
        data-flipped={flipped}
        style={{
          position: "fixed",
          left: settings.position.x,
          top: settings.position.y,
          width: settings.size.width,
          height: h,
          borderRadius: 14,
          border: `1px solid ${borderColor}`,
          background: bg,
          backdropFilter: "blur(var(--lw-panel-blur, 14px)) saturate(1.3)",
          WebkitBackdropFilter: "blur(var(--lw-panel-blur, 14px)) saturate(1.3)",
          boxShadow: glow,
          overflow: "hidden",
          userSelect: "none",
          opacity: settings.opacity,
          transition: "box-shadow 160ms ease, border-color 160ms ease, opacity 120ms ease",
          cursor: interactionStatus === "drag" ? "grabbing" : undefined,
          zIndex: 80,
          boxSizing: "border-box",
        } as React.CSSProperties}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(115deg, rgba(255,255,255,0.07), transparent 30%, transparent 75%, rgba(255,255,255,0.03))" }} />
        {children}
      </div>
    </ShellContext.Provider>
  );
}
