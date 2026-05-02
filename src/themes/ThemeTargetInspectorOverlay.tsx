import { useEffect, useState } from "react";
import { getThemeTargetById, type ThemeTargetContract } from "./themeTargetRegistry";

interface HoverState {
  themeTargetId: string;
  metadata?: ThemeTargetContract;
}

interface GraphViewportOffsets {
  right: number;
  bottom: number;
}

const HOTKEY_LABEL = "Alt+Shift+I";
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='graph-viewport']";
const PANEL_MARGIN_PX = 24;

const isEditableElement = (element: Element | null): boolean => {
  if (!element) {
    return false;
  }

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    return true;
  }

  if (element instanceof HTMLElement && element.isContentEditable) {
    return true;
  }

  return false;
};

export function ThemeTargetInspectorOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const [graphViewportOffsets, setGraphViewportOffsets] = useState<GraphViewportOffsets | null>(null);

  const tokenBindingEntries = hoverState?.metadata
    ? Object.entries(hoverState.metadata.tokenBindings)
    : [];
  const hasTokenBindings = tokenBindingEntries.length > 0;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "i" || !event.altKey || !event.shiftKey) {
        return;
      }

      const targetElement = (event.target as HTMLElement | null) ?? null;
      const activeElement = (document.activeElement as HTMLElement | null) ?? null;
      const focusIsEditable = isEditableElement(targetElement) || isEditableElement(activeElement);

      if (!enabled && focusIsEditable) {
        return;
      }

      event.preventDefault();
      setEnabled((prev) => !prev);
      setHoverState(null);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [enabled]);

  useEffect(() => {
    const updateOffsets = () => {
      const graphViewportElement = document.querySelector<HTMLElement>(GRAPH_VIEWPORT_SELECTOR);
      if (!graphViewportElement) {
        setGraphViewportOffsets(null);
        return;
      }

      const rect = graphViewportElement.getBoundingClientRect();
      setGraphViewportOffsets({
        right: Math.max(window.innerWidth - rect.right + PANEL_MARGIN_PX, PANEL_MARGIN_PX),
        bottom: Math.max(window.innerHeight - rect.bottom + PANEL_MARGIN_PX, PANEL_MARGIN_PX),
      });
    };

    updateOffsets();
    window.addEventListener("resize", updateOffsets);
    window.addEventListener("scroll", updateOffsets, true);

    const graphViewportElement = document.querySelector<HTMLElement>(GRAPH_VIEWPORT_SELECTOR);
    const resizeObserver = typeof ResizeObserver !== "undefined" && graphViewportElement
      ? new ResizeObserver(updateOffsets)
      : null;
    if (resizeObserver && graphViewportElement) {
      resizeObserver.observe(graphViewportElement);
    }

    return () => {
      window.removeEventListener("resize", updateOffsets);
      window.removeEventListener("scroll", updateOffsets, true);
      if (resizeObserver && graphViewportElement) {
        resizeObserver.unobserve(graphViewportElement);
        resizeObserver.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHoverState(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const targetElement = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-lw-theme-target]");
      if (!targetElement) {
        setHoverState(null);
        return;
      }

      const themeTargetId = targetElement.getAttribute("data-lw-theme-target");
      if (!themeTargetId) {
        setHoverState(null);
        return;
      }

      const metadata = getThemeTargetById(themeTargetId) ?? undefined;
      setHoverState({
        themeTargetId,
        metadata,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled]);

  return (
    <>
      <div
        data-testid="theme-target-inspector-toggle-state"
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 5000,
          padding: "0.4rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          backgroundColor: enabled ? "rgba(34, 197, 94, 0.12)" : "rgba(15, 23, 42, 0.7)",
          color: enabled ? "#4ade80" : "#94a3b8",
          border: `1px solid ${enabled ? "rgba(34, 197, 94, 0.5)" : "rgba(148, 163, 184, 0.35)"}`,
          pointerEvents: "none",
        }}
      >
        UI Inspector: {enabled ? "ON" : "OFF"} ({HOTKEY_LABEL})
      </div>

      <div data-testid="theme-target-inspector-overlay" style={{ pointerEvents: "none" }}>
        {enabled && hoverState && (
          <div
            data-testid="theme-target-inspector-panel"
            style={{
              position: "fixed",
              bottom: graphViewportOffsets?.bottom ?? "4.5rem",
              right: graphViewportOffsets?.right ?? "1rem",
              zIndex: 6000,
              maxWidth: "min(24rem, calc(100vw - 2rem))",
              width: "22rem",
              pointerEvents: "none",
            }}
          >
            <div
              data-testid="theme-target-inspector-tooltip"
              style={{
                backgroundColor: "rgba(2, 6, 23, 0.92)",
                color: "#e2e8f0",
                border: "1px solid rgba(14, 165, 233, 0.4)",
                borderRadius: "0.65rem",
                padding: "0.85rem 1rem",
                backdropFilter: "blur(6px)",
                boxShadow: "0 18px 36px rgba(2, 6, 23, 0.55)",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {hoverState.metadata?.label ?? hoverState.themeTargetId}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.65rem" }}>
                {hoverState.themeTargetId} · surface {hoverState.metadata?.surface ?? "unknown"}
              </div>

              <dl style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                {hoverState.metadata?.status && (
                  <div>
                    <dt style={{ color: "#94a3b8" }}>Status</dt>
                    <dd>{hoverState.metadata.status}</dd>
                  </div>
                )}

                {hoverState.metadata?.visualHandle && (
                  <div style={{ marginTop: "0.35rem" }}>
                    <dt style={{ color: "#94a3b8" }}>Visual Handle</dt>
                    <dd>{hoverState.metadata.visualHandle}</dd>
                  </div>
                )}

                {hoverState.metadata?.editableProperties.length ? (
                  <div style={{ marginTop: "0.35rem" }}>
                    <dt style={{ color: "#94a3b8" }}>Editable Props</dt>
                    <dd>{hoverState.metadata.editableProperties.join(", ")}</dd>
                  </div>
                ) : null}

                {hasTokenBindings ? (
                  <div style={{ marginTop: "0.35rem" }}>
                    <dt style={{ color: "#94a3b8" }}>Token Bindings</dt>
                    <dd>
                      <ul style={{ paddingLeft: "1rem", margin: 0 }}>
                        {tokenBindingEntries.map(([property, path]) => (
                          <li key={property}>
                            {property}: {path}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : (
                  <div style={{ marginTop: "0.35rem", color: "#fbbf24" }}>No token bindings recorded</div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
