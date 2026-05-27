import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { getThemeTargetById } from "./themeTargetRegistry";
import { getAllScopeIndicatorState } from "./themeOverrideStorage";
import {
  installThemeTargetProbeGlobal,
  runAndRecordThemeTargetProbe,
  THEME_TARGET_PROBE_EVENT,
  type ThemeTargetProbeResult,
  type ThemeTargetCandidateSignal,
} from "./themeTargetHeuristics";
import {
  type ThemeTargetInspectorEntity,
  THEME_TARGET_PIN_EVENT,
} from "./themeTargetInspectorTypes";

interface GraphViewportOffsets {
  right: number;
  bottom: number;
}

interface GhostOutline {
  themeTargetId: string;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface WarningBadge {
  descriptor: string;
  top: number;
  left: number;
  width: number;
  height: number;
  signals: ThemeTargetCandidateSignal[];
}

installThemeTargetProbeGlobal();

const HOTKEY_LABEL = "Alt+Shift+I";
const PIN_HOTKEY_LABEL = "Alt+Shift+P";
const GRAPH_VIEWPORT_SELECTOR = "[data-testid='self-graph-fixture-loaded']";
const SIGMA_ELEMENT_SELECTOR = `${GRAPH_VIEWPORT_SELECTOR} canvas, ${GRAPH_VIEWPORT_SELECTOR} svg, ${GRAPH_VIEWPORT_SELECTOR} [data-sigma-element]`;
const REGISTERED_TARGET_SELECTOR = "[data-lw-theme-target]";
const OVERLAY_ROOT_SELECTOR = "[data-testid='theme-target-inspector-overlay']";
const PANEL_MARGIN_PX = 24;
const WARNING_LAYER_PADDING_PX = 12;
const BADGE_HORIZONTAL_OFFSET_PX = 20;
const BADGE_VERTICAL_OFFSET_PX = 18;
const BADGE_APPROX_WIDTH_PX = 180;
const BADGE_APPROX_HEIGHT_PX = 56;

const isWithinOverlay = (node: Node | null): boolean =>
  node instanceof HTMLElement && Boolean(node.closest(OVERLAY_ROOT_SELECTOR));

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

interface ThemeTargetInspectorOverlayProps {
  enabled: boolean;
  onEnabledChange: (nextEnabled: boolean) => void;
}

const describeElementForMatching = (element: HTMLElement | null): string | null => {
  if (!element) {
    return null;
  }
  const tag = element.tagName.toLowerCase();
  const idPart = element.id ? `#${element.id}` : "";
  const classes = Array.from(element.classList).slice(0, 2);
  const classPart = classes.length ? `.${classes.join(".")}` : "";
  const testId = element.getAttribute("data-testid");
  const testIdPart = testId ? `[${testId}]` : "";
  return `${tag}${idPart}${classPart}${testIdPart}`;
};

const inspectorEntitiesAreEqual = (a: ThemeTargetInspectorEntity | null, b: ThemeTargetInspectorEntity | null): boolean => {
  if (!a || !b) {
    return false;
  }
  if (a.kind !== b.kind) {
    return false;
  }
  if (a.kind === "registered" && b.kind === "registered") {
    return a.themeTargetId === b.themeTargetId;
  }
  if (a.kind === "candidate" && b.kind === "candidate") {
    return a.descriptor === b.descriptor;
  }
  return false;
};

export function ThemeTargetInspectorOverlay({ enabled, onEnabledChange }: ThemeTargetInspectorOverlayProps) {
  const [hoverEntity, setHoverEntity] = useState<ThemeTargetInspectorEntity | null>(null);
  const hoverEntityRef = useRef<ThemeTargetInspectorEntity | null>(null);
  const [pinnedEntity, setPinnedEntity] = useState<ThemeTargetInspectorEntity | null>(null);
  const [latestProbeResult, setLatestProbeResult] = useState<ThemeTargetProbeResult | null>(null);
  const candidateLookupRef = useRef<Map<string, ThemeTargetProbeResult["candidates"][number]>>(new Map());
  const [graphViewportOffsets, setGraphViewportOffsets] = useState<GraphViewportOffsets | null>(null);
  const [ghostOutlines, setGhostOutlines] = useState<GhostOutline[]>([]);
  const [warningBadges, setWarningBadges] = useState<WarningBadge[]>([]);
  const [overrideVersion, setOverrideVersion] = useState(0);

  // Sync hoverEntityRef with hoverEntity state (for pin handler to read latest value)
  useEffect(() => {
    hoverEntityRef.current = hoverEntity;
  }, [hoverEntity]);

  const displayEntity = pinnedEntity ?? hoverEntity;
  const tokenBindingEntries =
    displayEntity?.kind === "registered" && displayEntity.metadata
      ? Object.entries(displayEntity.metadata.tokenBindings)
      : [];
  const hasTokenBindings = tokenBindingEntries.length > 0;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Alt+Shift+I: toggle discovery overlay
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
      onEnabledChange(!enabled);
      setHoverEntity(null);
      setPinnedEntity(null);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [enabled, onEnabledChange]);

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

  // Helper function to resolve entity from event target (used by both effects)
  const resolveEntityFromEventTarget = (rawTarget: EventTarget | null): ThemeTargetInspectorEntity | null => {
    let current = rawTarget instanceof HTMLElement ? rawTarget : null;
    if (current && current.matches(SIGMA_ELEMENT_SELECTOR)) {
      return null;
    }
    while (current) {
      if (isWithinOverlay(current)) {
        return null;
      }
      if (current.matches(REGISTERED_TARGET_SELECTOR)) {
        const themeTargetId = current.getAttribute("data-lw-theme-target");
        if (themeTargetId) {
          return {
            kind: "registered",
            themeTargetId,
            metadata: getThemeTargetById(themeTargetId) ?? undefined,
          };
        }
      }
      const descriptor = describeElementForMatching(current);
      if (descriptor && candidateLookupRef.current.has(descriptor)) {
        const candidate = candidateLookupRef.current.get(descriptor)!;
        if (candidate.status === "candidate") {
          return {
            kind: "candidate",
            descriptor: candidate.descriptor,
            dataTestId: candidate.dataTestId,
            signals: candidate.signals,
          };
        }
      }
      current = current.parentElement;
    }
    return null;
  };

  // Always-on: Alt+Shift+click listener for inspector:open event (v86d.1)
  // This runs regardless of enabled state, per packet spec
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Dispatch inspector:open event when Alt+Shift+click on registered target
      // Use event.altKey and event.shiftKey directly for reliable state detection
      if (!(event as any).altKey || !(event as any).shiftKey) {
        return;
      }

      const entity = resolveEntityFromEventTarget(event.target);
      if (!entity || entity.kind !== "registered") {
        return;
      }

      const target = getThemeTargetById(entity.themeTargetId);
      if (!target) {
        return;
      }

      // Get anchor position from target element's bounding rect
      const targetElement = event.target as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const anchorX = rect.left + rect.width / 2;
      const anchorY = rect.top + rect.height / 2;

      // Dispatch custom event with target information and anchor position
      window.dispatchEvent(
        new CustomEvent("inspector:open", {
          detail: {
            targetId: entity.themeTargetId,
            label: target.label,
            surface: target.surface,
            status: target.status,
            anchorX,
            anchorY,
          },
        }),
      );
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHoverEntity(null);
      setPinnedEntity(null);
      setGhostOutlines([]);
      setWarningBadges([]);
      setLatestProbeResult(null);
      candidateLookupRef.current = new Map();
      return;
    }

    const runProbe = () => runAndRecordThemeTargetProbe();

    const handleMouseMove = (event: MouseEvent) => {
      const entity = resolveEntityFromEventTarget(event.target);
      setHoverEntity(entity);
    };

    const scheduleGhostOutlineUpdate = (() => {
      let raf: number | null = null;
      const measure = () => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>(REGISTERED_TARGET_SELECTOR));
        const outlines = nodes
          .map((node) => {
            const rect = node.getBoundingClientRect();
            if (!rect.width || !rect.height) {
              return null;
            }
            const themeTargetId = node.getAttribute("data-lw-theme-target");
            if (!themeTargetId) {
              return null;
            }
            return {
              themeTargetId,
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            } satisfies GhostOutline;
          })
          .filter((outline): outline is GhostOutline => Boolean(outline));
        setGhostOutlines(outlines);
      };

      return () => {
        if (raf) {
          cancelAnimationFrame(raf);
        }
        raf = requestAnimationFrame(measure);
      };
    })();

    const handleResizeOrScroll = () => {
      scheduleGhostOutlineUpdate();
      runProbe();
    };

    scheduleGhostOutlineUpdate();
    runProbe();
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);

    // Poll at 500ms so override indicator state stays fresh when localStorage changes
    const overridePollInterval = setInterval(() => {
      scheduleGhostOutlineUpdate();
      setOverrideVersion((v) => v + 1);
    }, 500);

    const mutationObserver = typeof MutationObserver !== "undefined"
      ? new MutationObserver((mutations) => {
          if (!mutations.length) {
            return;
          }
          const shouldUpdate = mutations.some((mutation) => {
            if (isWithinOverlay(mutation.target)) {
              return false;
            }
            if (mutation.type === "childList") {
              return true;
            }
            if (mutation.type === "attributes") {
              return (
                mutation.attributeName === "data-lw-theme-target" ||
                mutation.attributeName === "class" ||
                mutation.attributeName === "style"
              );
            }
            return false;
          });
          if (shouldUpdate) {
            scheduleGhostOutlineUpdate();
            runProbe();
          }
        })
      : null;

    if (mutationObserver) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-lw-theme-target", "class", "style"],
      });
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
      clearInterval(overridePollInterval);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!enabled) {
      setWarningBadges([]);
      return;
    }

    const mapResultToBadges = (result: ThemeTargetProbeResult | null) => {
      if (!result) {
        setWarningBadges([]);
        setLatestProbeResult(null);
        candidateLookupRef.current = new Map();
        return;
      }
      const unique = new Map<string, WarningBadge>();
      for (const candidate of result.candidates) {
        if (!candidate.bounds || !candidate.signals.length) {
          continue;
        }
        unique.set(candidate.descriptor, {
          descriptor: candidate.descriptor,
          top: candidate.bounds.top,
          left: candidate.bounds.left,
          width: candidate.bounds.width,
          height: candidate.bounds.height,
          signals: candidate.signals,
        });
      }
      setWarningBadges(Array.from(unique.values()));
      setLatestProbeResult(result);
      candidateLookupRef.current = new Map(result.candidates.map((candidate) => [candidate.descriptor, candidate]));
    };

    const handleProbe = (event: Event) => {
      const { detail } = event as CustomEvent<ThemeTargetProbeResult>;
      mapResultToBadges(detail);
    };

    window.addEventListener(THEME_TARGET_PROBE_EVENT, handleProbe as EventListener);
    mapResultToBadges(window.__lwLastThemeTargetProbeResult ?? null);

    return () => {
      window.removeEventListener(THEME_TARGET_PROBE_EVENT, handleProbe as EventListener);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handlePinToggle = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "p" || !event.altKey || !event.shiftKey) {
        return;
      }

      const targetElement = (event.target as HTMLElement | null) ?? null;
      const activeElement = (document.activeElement as HTMLElement | null) ?? null;
      const focusIsEditable = isEditableElement(targetElement) || isEditableElement(activeElement);
      if (focusIsEditable) {
        return;
      }

      event.preventDefault();
      setPinnedEntity((current) => {
        const currentHover = hoverEntityRef.current;
        if (current && currentHover && !inspectorEntitiesAreEqual(current, currentHover)) {
          return currentHover;
        }
        if (current) {
          return null;
        }
        return currentHover;
      });
    };

    window.addEventListener("keydown", handlePinToggle);
    return () => window.removeEventListener("keydown", handlePinToggle);
  }, [enabled, hoverEntity]);

  useEffect(() => {
    if (!pinnedEntity) {
      return;
    }
    if (pinnedEntity.kind === "registered") {
      const exists = Boolean(
        typeof document !== "undefined"
          ? document.querySelector<HTMLElement>(`[data-lw-theme-target='${pinnedEntity.themeTargetId}']`)
          : null,
      );
      if (!exists) {
        setPinnedEntity(null);
      }
      return;
    }
    if (!latestProbeResult) {
      setPinnedEntity(null);
      return;
    }
    const stillExists = latestProbeResult.candidates.some((candidate) => candidate.descriptor === pinnedEntity.descriptor);
    if (!stillExists) {
      setPinnedEntity(null);
    }
  }, [pinnedEntity, latestProbeResult]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.__lwPinnedInspectorEntity = pinnedEntity ?? null;
    const pinEvent = new CustomEvent(THEME_TARGET_PIN_EVENT, { detail: pinnedEntity ?? null });
    window.dispatchEvent(pinEvent);
  }, [pinnedEntity]);

  const showInspectorPanel = enabled && Boolean(displayEntity);

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
        {enabled ? t("themeInspector.toggleOn", { hotkey: HOTKEY_LABEL }) : t("themeInspector.toggleOff", { hotkey: HOTKEY_LABEL })}
      </div>

      <div data-testid="theme-target-inspector-overlay" style={{ pointerEvents: "none" }}>
        {enabled && ghostOutlines.length > 0 && (
          <div
            data-testid="theme-target-ghost-layer"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 4500,
              pointerEvents: "none",
            }}
          >
            {ghostOutlines.map((outline, index) => {
              const scopeState = overrideVersion >= 0
                ? getAllScopeIndicatorState(outline.themeTargetId)
                : { hasGlobal: false, hasTarget: false, hasTargetKind: false };
              const anyOverride = scopeState.hasGlobal || scopeState.hasTarget || scopeState.hasTargetKind;
              const activeScopes = [
                scopeState.hasGlobal && "global",
                scopeState.hasTargetKind && "target-kind",
                scopeState.hasTarget && "target",
              ].filter(Boolean).join(", ");
              return (
                <div
                  key={`${outline.themeTargetId}-${index}`}
                  data-testid="theme-target-ghost-outline"
                  style={{
                    position: "absolute",
                    top: `${outline.top}px`,
                    left: `${outline.left}px`,
                    width: `${outline.width}px`,
                    height: `${outline.height}px`,
                    border: "1.5px dashed rgba(14, 165, 233, 0.85)",
                    boxShadow: "0 0 18px rgba(14, 165, 233, 0.35)",
                    borderRadius: "12px",
                    background: "rgba(14, 165, 233, 0.07)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "-1.5rem",
                      left: 0,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      backgroundColor: "rgba(15, 23, 42, 0.85)",
                      color: "rgba(226, 232, 240, 0.9)",
                      border: "1px solid rgba(14, 165, 233, 0.4)",
                      pointerEvents: "none",
                    }}
                  >
                    {outline.themeTargetId}
                  </span>
                  {anyOverride && (
                    <svg
                      className="lw-override-indicator-multi"
                      data-testid={`override-indicator-${outline.themeTargetId}`}
                      data-active-scopes={activeScopes}
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        pointerEvents: "auto",
                        overflow: "visible",
                      }}
                    >
                      <title>{`overrides: ${activeScopes}`}</title>
                      {/* gold — outermost ring: target scope */}
                      {scopeState.hasTarget && (
                        <circle cx="5" cy="5" r="4.25" fill="none" stroke="#ffb347" strokeWidth="1.5" />
                      )}
                      {/* cyan — middle ring: target-kind scope */}
                      {scopeState.hasTargetKind && (
                        <circle cx="5" cy="5" r="2.75" fill="none" stroke="#4facff" strokeWidth="1.5" />
                      )}
                      {/* cream — center fill: global scope */}
                      {scopeState.hasGlobal && (
                        <circle cx="5" cy="5" r="2" fill="#fff2c5" />
                      )}
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {enabled && warningBadges.length > 0 && (
          <div
            data-testid="theme-target-warning-layer"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 5200,
              pointerEvents: "none",
            }}
          >
            {warningBadges.map((badge) => {
              const viewportWidth = typeof window !== "undefined" ? window.innerWidth : undefined;
              const viewportHeight = typeof window !== "undefined" ? window.innerHeight : undefined;

              const desiredTop = badge.top - BADGE_VERTICAL_OFFSET_PX;
              const minTop = WARNING_LAYER_PADDING_PX;
              const maxTop = viewportHeight
                ? Math.max(viewportHeight - BADGE_APPROX_HEIGHT_PX - WARNING_LAYER_PADDING_PX, WARNING_LAYER_PADDING_PX)
                : undefined;
              const clampedTop =
                typeof maxTop === "number"
                  ? Math.min(Math.max(desiredTop, minTop), maxTop)
                  : Math.max(desiredTop, minTop);

              const desiredLeft = badge.left + badge.width - BADGE_HORIZONTAL_OFFSET_PX;
              const minLeft = WARNING_LAYER_PADDING_PX;
              const maxLeft = viewportWidth
                ? Math.max(viewportWidth - BADGE_APPROX_WIDTH_PX - WARNING_LAYER_PADDING_PX, WARNING_LAYER_PADDING_PX)
                : undefined;
              const clampedLeft =
                typeof maxLeft === "number"
                  ? Math.min(Math.max(desiredLeft, minLeft), maxLeft)
                  : Math.max(desiredLeft, minLeft);

              return (
                <div
                  key={badge.descriptor}
                  data-testid="theme-target-warning-badge"
                  title="Potential missing theme target"
                  style={{
                    position: "absolute",
                    top: `${clampedTop}px`,
                    left: `${clampedLeft}px`,
                    minWidth: "120px",
                    padding: "0.3rem 0.65rem",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(251, 191, 36, 0.92)",
                    color: "#0f172a",
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.35)",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.15rem",
                    pointerEvents: "none",
                  }}
                >
                  <span>{t("themeInspector.candidateSurface")}</span>
                  <span
                    style={{
                      fontSize: "0.55rem",
                      fontWeight: 500,
                      textTransform: "none",
                      letterSpacing: "0",
                      color: "rgba(15, 23, 42, 0.8)",
                    }}
                  >
                    {badge.signals.slice(0, 3).join(" • ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {showInspectorPanel && displayEntity && (
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <div
                  data-testid="theme-target-display-kind"
                  style={{ fontSize: "0.85rem", fontWeight: 600 }}
                >
                  {displayEntity.kind === "registered"
                    ? displayEntity.metadata?.label ?? displayEntity.themeTargetId
                    : t("themeInspector.candidateSurface")}
                </div>
                {pinnedEntity ? (
                  <span
                    data-testid="theme-target-pinned-state"
                    style={{
                      fontSize: "0.65rem",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      border: "1px solid rgba(148, 163, 184, 0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("themeInspector.pinned", { hotkey: PIN_HOTKEY_LABEL })}
                  </span>
                ) : (
                  <span
                    data-testid="theme-target-pin-hint"
                    style={{ fontSize: "0.65rem", color: "#94a3b8" }}
                  >
                    {t("themeInspector.pinHint", { hotkey: PIN_HOTKEY_LABEL })}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.65rem" }}>
                {displayEntity.kind === "registered"
                  ? `${displayEntity.themeTargetId} · surface ${displayEntity.metadata?.surface ?? "unknown"}`
                  : `${displayEntity.descriptor} ${displayEntity.dataTestId ? `· [${displayEntity.dataTestId}]` : ""}`}
              </div>

              {displayEntity.kind === "registered" ? (
                <dl style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                  {displayEntity.metadata?.status && (
                    <div>
                      <dt style={{ color: "#94a3b8" }}>{t("themeInspector.status")}</dt>
                      <dd>{displayEntity.metadata.status}</dd>
                    </div>
                  )}

                  {displayEntity.metadata?.visualHandle && (
                    <div style={{ marginTop: "0.35rem" }}>
                      <dt style={{ color: "#94a3b8" }}>{t("themeInspector.visualHandle")}</dt>
                      <dd>{displayEntity.metadata.visualHandle}</dd>
                    </div>
                  )}

                  {displayEntity.metadata?.editableProperties.length ? (
                    <div style={{ marginTop: "0.35rem" }}>
                      <dt style={{ color: "#94a3b8" }}>{t("themeInspector.editableProps")}</dt>
                      <dd>{displayEntity.metadata.editableProperties.join(", ")}</dd>
                    </div>
                  ) : null}

                  {hasTokenBindings ? (
                    <div style={{ marginTop: "0.35rem" }}>
                      <dt style={{ color: "#94a3b8" }}>{t("themeInspector.tokenBindings")}</dt>
                      <dd>
                        <ul style={{ paddingInlineStart: "1rem", margin: 0 }}>
                          {tokenBindingEntries.map(([property, path]) => (
                            <li key={property}>{`${property}: ${path}`}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : (
                    <div style={{ marginTop: "0.35rem", color: "#fbbf24" }}>{t("themeInspector.noTokenBindings")}</div>
                  )}
                  
                  {/* Override visibility indicator - shows when target has token bindings */}
                  {displayEntity.kind === "registered" && hasTokenBindings && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        backgroundColor: "rgba(251, 191, 36, 0.15)",
                        border: "1px solid rgba(251, 191, 36, 0.3)",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#fbbf24",
                          boxShadow: "0 0 8px rgba(251, 191, 36, 0.6)",
                        }}
                      />
                      <span style={{ fontSize: "0.7rem", color: "#fbbf24" }}>{t("themeInspector.hasOverrides")}</span>
                    </div>
                  )}
                </dl>
              ) : (
                <div style={{ fontSize: "0.75rem", lineHeight: 1.6 }}>
                  <div style={{ color: "#fbbf24", marginBottom: "0.35rem" }}>{t("themeInspector.reviewForRegistration")}</div>
                  <div>
                    <span style={{ color: "#94a3b8" }}>{t("themeInspector.signalsLabel", { count: String(displayEntity.signals.length) })} </span>
                    {displayEntity.signals.join(" · ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
