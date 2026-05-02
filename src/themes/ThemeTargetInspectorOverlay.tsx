import { useEffect, useState } from "react";
import { getThemeTargetById, type ThemeTargetContract } from "./themeTargetRegistry";

interface HoverState {
  themeTargetId: string;
  clientX: number;
  clientY: number;
  rect: DOMRect;
  metadata?: ThemeTargetContract;
}

const HOTKEY_LABEL = "Ctrl+Alt+T";

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

  const tokenBindingEntries = hoverState?.metadata
    ? Object.entries(hoverState.metadata.tokenBindings)
    : [];
  const hasTokenBindings = tokenBindingEntries.length > 0;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "t" || !event.ctrlKey || !event.altKey) {
        return;
      }

      const targetElement = (event.target as HTMLElement | null) ?? null;
      const activeElement = (document.activeElement as HTMLElement | null) ?? null;
      if (isEditableElement(targetElement) || isEditableElement(activeElement)) {
        return;
      }

      event.preventDefault();
      setEnabled((prev) => !prev);
      setHoverState(null);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
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
      const rect = targetElement.getBoundingClientRect();
      setHoverState({
        themeTargetId,
        clientX: event.clientX,
        clientY: event.clientY,
        rect,
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
        Inspector: {enabled ? "ON" : "OFF"} ({HOTKEY_LABEL})
      </div>

      <div data-testid="theme-target-inspector-overlay" style={{ pointerEvents: "none" }}>
        {enabled && hoverState && (
          <div
            data-testid="theme-target-inspector-tooltip"
            style={{
              position: "fixed",
              top: hoverState.clientY + 16,
              left: hoverState.clientX + 16,
              zIndex: 6000,
              backgroundColor: "rgba(2, 6, 23, 0.9)",
              color: "#e2e8f0",
              border: "1px solid rgba(14, 165, 233, 0.4)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              width: "18rem",
              maxWidth: "calc(100vw - 2rem)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 10px 30px rgba(8, 47, 73, 0.45)",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              {hoverState.metadata?.label ?? hoverState.themeTargetId}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
              {hoverState.themeTargetId} · surface {hoverState.metadata?.surface ?? "unknown"}
            </div>

            <dl style={{ fontSize: "0.7rem", lineHeight: 1.4 }}>
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
        )}
      </div>
    </>
  );
}
