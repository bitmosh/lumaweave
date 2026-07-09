// SPDX-License-Identifier: Apache-2.0
import React, { useState, useRef } from "react";
import { useShellContext } from "./MinimapShell";

// ── Glyphs ─────────────────────────────────────────────────
const CloseGlyph    = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6" /></svg>;
const CollapseGlyph = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M2 5h6" /></svg>;
const ExpandGlyph   = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 2v6M2 5h6" /></svg>;
const SnapGlyph     = () => <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1" y="1" width="8" height="8" rx="1" /><rect x="3" y="3" width="4" height="4" rx="0.5" fill="currentColor" /></svg>;
const OpacityGlyph  = () => <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2" /><path d="M5.5 1A4.5 4.5 0 0 1 5.5 10z" fill="currentColor" /></svg>;

// ── MinimapStatusDot ───────────────────────────────────────
export function MinimapStatusDot({ state = "fresh" }: { state?: "fresh" | "refreshing" | "idle" }) {
  const opacity = state === "fresh" ? 1 : state === "refreshing" ? 0.55 : 0.3;
  return (
    <span
      data-testid="minimap-status-dot"
      data-state={state}
      style={{
        width: 6,
        height: 6,
        borderRadius: 999,
        background: "var(--lw-accent)",
        boxShadow: "0 0 8px var(--lw-accent)",
        opacity,
        flexShrink: 0,
        transition: "opacity 200ms ease",
      }}
    />
  );
}

// ── MinimapIconButton ──────────────────────────────────────
export function MinimapIconButton({
  children,
  onClick,
  title,
  testId,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  testId?: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      data-testid={testId}
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        background: hover ? "oklch(from var(--lw-accent) l c h / 0.08)" : "transparent",
        border: 0,
        cursor: "pointer",
        color: hover ? "var(--lw-accent)" : "var(--lw-text-muted)",
        padding: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        transition: "color 120ms ease, background 120ms ease",
      }}
    >
      {children}
    </button>
  );
}

// ── MinimapHeader (drag handle) ────────────────────────────
export function MinimapHeader({
  breadcrumb,
  status,
  collapsed,
  flipped,
  onCollapse,
  onClose,
  onSnap,
}: {
  breadcrumb?: string;
  status?: string;
  collapsed: boolean;
  flipped: boolean;
  onCollapse: () => void;
  onClose: () => void;
  onSnap: () => void;
}) {
  const { startDrag } = useShellContext();
  return (
    <div
      data-testid="minimap-header"
      data-lw-theme-target="minimap.header"
      onMouseDown={startDrag}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [flipped ? "bottom" : "top"]: 0,
        zIndex: 3,
        height: 28,
        padding: "0 8px 0 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "grab",
        background:
          `linear-gradient(${flipped ? "0deg" : "180deg"},` +
          " oklch(from var(--lw-panel-background) l c h / 0.74)," +
          " oklch(from var(--lw-panel-background) l c h / 0.28))",
        [flipped ? "borderTop" : "borderBottom"]: "1px solid oklch(from var(--lw-panel-border) l c h / 0.28)",
        userSelect: "none",
        boxSizing: "border-box",
      } as React.CSSProperties}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <MinimapStatusDot state={(status === "refreshing" ? "refreshing" : "fresh") as "fresh" | "refreshing"} />
        <span style={{ fontSize: 9.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--lw-text-primary)", fontFamily: "var(--lw-font-mono)", fontWeight: 500 }}>
          map
        </span>
        {breadcrumb && (
          <>
            <span style={{ fontSize: 9, color: "var(--lw-text-muted)" }}>·</span>
            <span style={{ fontSize: 9.5, letterSpacing: "0.10em", color: "var(--lw-text-muted)", fontFamily: "var(--lw-font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {breadcrumb}
            </span>
          </>
        )}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <MinimapIconButton title="Snap to corner" onClick={onSnap} testId="minimap-snap"><SnapGlyph /></MinimapIconButton>
        <MinimapIconButton title={collapsed ? "Expand" : "Collapse"} onClick={onCollapse} testId="minimap-collapse">
          {collapsed ? <ExpandGlyph /> : <CollapseGlyph />}
        </MinimapIconButton>
        <MinimapIconButton title="Close" onClick={onClose} testId="minimap-close"><CloseGlyph /></MinimapIconButton>
      </span>
    </div>
  );
}

// ── MinimapOpacitySlider ───────────────────────────────────
export function MinimapOpacitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLSpanElement>(null);

  const handlePointer = (e: MouseEvent | React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onChange(0.30 + pct * 0.70);
  };

  const onDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePointer(e);
    const move = (ev: MouseEvent) => handlePointer(ev);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const pct = (value - 0.30) / 0.70;

  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }} onMouseDown={(e) => e.stopPropagation()}>
      <span style={{ display: "flex", color: "var(--lw-text-muted)" }}><OpacityGlyph /></span>
      <span
        ref={trackRef}
        data-testid="minimap-opacity-slider"
        onMouseDown={onDown}
        style={{ position: "relative", height: 3, flex: 1, minWidth: 32, background: "oklch(from var(--lw-accent) l c h / 0.18)", borderRadius: 999, cursor: "pointer" }}
      >
        <span style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct * 100}%`, background: "var(--lw-accent)", borderRadius: 999, boxShadow: "0 0 6px var(--lw-accent)", pointerEvents: "none" }} />
        <span style={{ position: "absolute", top: "50%", left: `${pct * 100}%`, width: 8, height: 8, borderRadius: 999, background: "oklch(from var(--lw-text-primary) l c h / 0.90)", transform: "translate(-50%, -50%)", boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 0 6px oklch(from var(--lw-accent) l c h / 0.60)", pointerEvents: "none" }} />
      </span>
      <span style={{ fontSize: 10, fontVariantNumeric: "tabular-nums", color: "var(--lw-numeric-accent, var(--lw-text-primary))", minWidth: 28, textAlign: "right", fontFamily: "var(--lw-font-mono)" }}>
        {Math.round(value * 100)}%
      </span>
    </span>
  );
}

// ── MinimapFooter ──────────────────────────────────────────
export function MinimapFooter({
  opacity,
  onOpacityChange,
  counts,
  flipped,
}: {
  opacity: number;
  onOpacityChange: (v: number) => void;
  counts: { nodes: number; edges: number };
  flipped: boolean;
}) {
  return (
    <div
      data-testid="minimap-footer"
      data-lw-theme-target="minimap.footer"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        [flipped ? "top" : "bottom"]: 0,
        zIndex: 3,
        height: 24,
        padding: "0 10px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background:
          `linear-gradient(${flipped ? "180deg" : "0deg"},` +
          " oklch(from var(--lw-panel-background) l c h / 0.78)," +
          " oklch(from var(--lw-panel-background) l c h / 0.22))",
        [flipped ? "borderBottom" : "borderTop"]: "1px solid oklch(from var(--lw-panel-border) l c h / 0.28)",
        fontSize: 9,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--lw-text-muted)",
        fontFamily: "var(--lw-font-mono)",
        boxSizing: "border-box",
      } as React.CSSProperties}
    >
      <MinimapOpacitySlider value={opacity} onChange={onOpacityChange} />
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>n</span>
        <span style={{ color: "var(--lw-numeric-accent, var(--lw-text-primary))", fontVariantNumeric: "tabular-nums" }}>{counts.nodes}</span>
      </span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>e</span>
        <span style={{ color: "var(--lw-numeric-accent, var(--lw-text-primary))", fontVariantNumeric: "tabular-nums" }}>{counts.edges}</span>
      </span>
    </div>
  );
}

// ── MinimapResizeGrip ──────────────────────────────────────
export function MinimapResizeGrip() {
  const { startResize } = useShellContext();
  return (
    <span
      data-testid="minimap-resize-grip"
      onMouseDown={startResize}
      style={{ position: "absolute", right: 4, bottom: 4, width: 14, height: 14, cursor: "nwse-resize", color: "var(--lw-tile-handle, var(--lw-text-muted))", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", zIndex: 4 }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <circle cx="10" cy="2" r="0.9" opacity="0.55" />
        <circle cx="10" cy="6" r="0.9" opacity="0.75" />
        <circle cx="6" cy="6" r="0.9" opacity="0.55" />
        <circle cx="10" cy="10" r="0.9" />
        <circle cx="6" cy="10" r="0.9" opacity="0.75" />
        <circle cx="2" cy="10" r="0.9" opacity="0.55" />
      </svg>
    </span>
  );
}
