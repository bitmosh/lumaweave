const GRAPH_VIEWPORT_SELECTOR = "[data-testid='graph-viewport']";
const REGISTERED_TARGET_SELECTOR = "[data-lw-theme-target]";
const OVERLAY_ROOT_SELECTOR = "[data-testid='theme-target-inspector-overlay']";
const GHOST_LAYER_SELECTOR = "[data-testid='theme-target-ghost-layer']";
const GHOST_OUTLINE_SELECTOR = "[data-testid='theme-target-ghost-outline']";
const INSPECTOR_PANEL_SELECTOR = "[data-testid='theme-target-inspector-panel']";
const PROBE_EVENT_NAME = "lw:theme-target-probe";
const MIN_SIGNALS_REQUIRED = 3;

const STRUCTURAL_CLASSNAMES = ["lw-panel", "lw-card", "lw-graph-hud"];
const LAYOUT_SHIM_CLASSNAMES = ["lw-control-grid", "lw-control-row", "lw-control-strip"];
const LANDMARK_TESTID_PATTERNS = [/qa-panel/i, /mission-control/i, /settings-panel/i, /graph-hud/i, /backlog/i];
const BASE_SELECTORS = Array.from(
  new Set([
    ".lw-panel",
    ".lw-card",
    ".lw-graph-hud",
    "[data-testid*='panel']",
    "[data-testid*='mission-control']",
    "[data-testid*='hud']",
    "[data-testid='qa-panel']",
    "[data-testid='settings-panel']",
    "[role='region']",
    "[aria-label]",
    "[aria-labelledby]",
  ]),
);

const NEVER_WARN_TAGS = new Set([
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "svg",
  "canvas",
  "icon",
  "path",
]);

const NEVER_WARN_ROLES = new Set([
  "button",
  "tab",
  "tablist",
  "slider",
  "switch",
  "menu",
  "menuitem",
  "option",
  "combobox",
  "textbox",
  "treeitem",
  "row",
  "gridcell",
]);

const NEVER_WARN_TESTID_PREFIXES = [
  "qa-",
  "theme-inspector",
  "theme-target-ghost",
  "graph-viewport",
];

const NEVER_WARN_TESTID_EXACT = new Set([
  "theme-inspector-toggle-button",
  "theme-inspector-toggle-state",
  "theme-target-ghost-layer",
  "theme-target-inspector-panel",
]);

const INTERACTIVE_CHILD_SELECTOR =
  "button, input, select, textarea, [role='button'], [role='switch'], [role='tab'], [role='menuitem'], [role='option'], [data-testid*='dropdown'], [data-testid*='toggle'], [data-testid*='slider']";

export type ThemeTargetCandidateSignal =
  | "structural"
  | "landmark"
  | "layout"
  | "control-aggregation"
  | "graph-hud"
  | "registry-proximity";

export interface ThemeTargetProbeCandidate {
  descriptor: string;
  dataTestId?: string | null;
  signals: ThemeTargetCandidateSignal[];
  status: "candidate" | "unknown";
}

export interface ThemeTargetProbeResult {
  timestamp: number;
  totalElementsAnalyzed: number;
  excludedElementCount: number;
  candidateCount: number;
  unknownCount: number;
  candidates: ThemeTargetProbeCandidate[];
  unknown: ThemeTargetProbeCandidate[];
}

export interface ThemeTargetProbeOptions {
  minSignals?: number;
}

const describeElement = (element: HTMLElement): string => {
  const tag = element.tagName.toLowerCase();
  const idPart = element.id ? `#${element.id}` : "";
  const classes = Array.from(element.classList).slice(0, 2);
  const classPart = classes.length ? `.${classes.join(".")}` : "";
  const testId = element.getAttribute("data-testid");
  const testIdPart = testId ? `[${testId}]` : "";
  return `${tag}${idPart}${classPart}${testIdPart}`;
};

const hasStructuralHandle = (element: HTMLElement): boolean =>
  STRUCTURAL_CLASSNAMES.some((className) => element.classList.contains(className));

const hasLandmarkMetadata = (element: HTMLElement): boolean => {
  const role = element.getAttribute("role");
  const ariaLabel = element.getAttribute("aria-label");
  const ariaLabelledBy = element.getAttribute("aria-labelledby");
  const testId = element.getAttribute("data-testid") || "";
  if (role === "region" || ariaLabel || ariaLabelledBy) {
    return true;
  }
  return LANDMARK_TESTID_PATTERNS.some((pattern) => pattern.test(testId));
};

const hasLargeLayoutFootprint = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  if (!rect || (!rect.width && !rect.height)) {
    return false;
  }
  if (rect.width >= 320 || rect.height >= 120) {
    const childGroupCount = element.children.length;
    return childGroupCount >= 2;
  }
  return false;
};

const hasControlAggregation = (element: HTMLElement): boolean => {
  const interactiveChildren = element.querySelectorAll(INTERACTIVE_CHILD_SELECTOR);
  return interactiveChildren.length >= 2;
};

const isGraphHudAdjacent = (element: HTMLElement, graphRect: DOMRect | null): boolean => {
  if (!graphRect) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return false;
  }
  const horizontalGap = Math.max(graphRect.left - rect.right, rect.left - graphRect.right, 0);
  const verticalOverlap = Math.min(rect.bottom, graphRect.bottom) - Math.max(rect.top, graphRect.top);
  return horizontalGap <= 80 && verticalOverlap > 0;
};

const hasRegistryProximity = (element: HTMLElement): boolean => {
  const descendant = element.querySelector(REGISTERED_TARGET_SELECTOR);
  if (descendant) {
    return true;
  }
  const ancestor = element.parentElement?.closest(REGISTERED_TARGET_SELECTOR);
  if (ancestor) {
    return true;
  }
  const sibling = element.previousElementSibling?.matches(REGISTERED_TARGET_SELECTOR)
    ? element.previousElementSibling
    : element.nextElementSibling?.matches(REGISTERED_TARGET_SELECTOR)
      ? element.nextElementSibling
      : null;
  return Boolean(sibling);
};

const isInsideSigma = (element: HTMLElement): boolean =>
  Boolean(
    element.closest(`${GRAPH_VIEWPORT_SELECTOR} canvas`) ||
      element.closest(`${GRAPH_VIEWPORT_SELECTOR} svg`) ||
      element.closest(`${GRAPH_VIEWPORT_SELECTOR} [data-sigma-element]`),
  );

const isOverlayInternal = (element: HTMLElement): boolean =>
  Boolean(
    element.closest(OVERLAY_ROOT_SELECTOR) ||
      element.closest(GHOST_LAYER_SELECTOR) ||
      element.closest(GHOST_OUTLINE_SELECTOR) ||
      element.closest(INSPECTOR_PANEL_SELECTOR),
  );

const hasNeverWarnTestId = (element: HTMLElement): boolean => {
  const testId = element.getAttribute("data-testid");
  if (!testId) {
    return false;
  }
  if (NEVER_WARN_TESTID_EXACT.has(testId)) {
    return true;
  }
  return NEVER_WARN_TESTID_PREFIXES.some((prefix) => testId.startsWith(prefix));
};

const hasNeverWarnRoleOrTag = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  if (NEVER_WARN_TAGS.has(tagName)) {
    return true;
  }
  const role = element.getAttribute("role");
  if (role && NEVER_WARN_ROLES.has(role)) {
    return true;
  }
  return false;
};

const hasHandleMetadata = (element: HTMLElement): boolean =>
  element.hasAttribute("data-handle-id") ||
  element.hasAttribute("data-settings-key") ||
  element.dataset.handleId !== undefined ||
  element.dataset.settingsKey !== undefined ||
  Boolean(element.closest("[data-handle-id]"));

const isLayoutShimElement = (element: HTMLElement): boolean =>
  LAYOUT_SHIM_CLASSNAMES.some((className) => element.classList.contains(className)) ||
  element.hasAttribute("data-layout-shim") ||
  (element.getAttribute("data-testid") ?? "").includes("layout-shim");

const isNeverWarnElement = (element: HTMLElement): boolean =>
  element.matches(REGISTERED_TARGET_SELECTOR) ||
  hasNeverWarnRoleOrTag(element) ||
  hasNeverWarnTestId(element) ||
  isLayoutShimElement(element) ||
  isOverlayInternal(element) ||
  isInsideSigma(element) ||
  hasHandleMetadata(element);

const collectSignals = (element: HTMLElement, graphRect: DOMRect | null): ThemeTargetCandidateSignal[] => {
  const signals: ThemeTargetCandidateSignal[] = [];
  if (hasStructuralHandle(element)) {
    signals.push("structural");
  }
  if (hasLandmarkMetadata(element)) {
    signals.push("landmark");
  }
  if (hasLargeLayoutFootprint(element)) {
    signals.push("layout");
  }
  if (hasControlAggregation(element)) {
    signals.push("control-aggregation");
  }
  if (isGraphHudAdjacent(element, graphRect)) {
    signals.push("graph-hud");
  }
  if (hasRegistryProximity(element)) {
    signals.push("registry-proximity");
  }
  return signals;
};

const collectCandidateElements = (): HTMLElement[] => {
  const elements = new Set<HTMLElement>();
  for (const selector of BASE_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      if (element && element.isConnected) {
        elements.add(element);
      }
    });
  }
  return Array.from(elements);
};

export const runThemeTargetProbe = (options?: ThemeTargetProbeOptions): ThemeTargetProbeResult => {
  if (typeof document === "undefined") {
    return {
      timestamp: Date.now(),
      totalElementsAnalyzed: 0,
      excludedElementCount: 0,
      candidateCount: 0,
      unknownCount: 0,
      candidates: [],
      unknown: [],
    };
  }

  const minSignals = options?.minSignals ?? MIN_SIGNALS_REQUIRED;
  const graphViewport = document.querySelector<HTMLElement>(GRAPH_VIEWPORT_SELECTOR);
  const graphRect = graphViewport?.getBoundingClientRect() ?? null;
  const elements = collectCandidateElements();

  const candidates: ThemeTargetProbeCandidate[] = [];
  const unknown: ThemeTargetProbeCandidate[] = [];
  let excluded = 0;
  let inspected = 0;

  for (const element of elements) {
    inspected += 1;
    if (isNeverWarnElement(element)) {
      excluded += 1;
      continue;
    }

    const signals = collectSignals(element, graphRect);
    if (signals.length === 0) {
      continue;
    }

    const descriptor = describeElement(element);
    const candidate: ThemeTargetProbeCandidate = {
      descriptor,
      dataTestId: element.getAttribute("data-testid"),
      signals,
      status: signals.length >= minSignals ? "candidate" : "unknown",
    };

    if (candidate.status === "candidate") {
      candidates.push(candidate);
    } else {
      unknown.push(candidate);
    }
  }

  return {
    timestamp: Date.now(),
    totalElementsAnalyzed: inspected,
    excludedElementCount: excluded,
    candidateCount: candidates.length,
    unknownCount: unknown.length,
    candidates,
    unknown,
  };
};

export const recordThemeTargetProbeResult = (result: ThemeTargetProbeResult): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.__lwLastThemeTargetProbeResult = result;
  const event = new CustomEvent<ThemeTargetProbeResult>(PROBE_EVENT_NAME, { detail: result });
  window.dispatchEvent(event);
};

export const runAndRecordThemeTargetProbe = (options?: ThemeTargetProbeOptions): ThemeTargetProbeResult => {
  const result = runThemeTargetProbe(options);
  recordThemeTargetProbeResult(result);
  return result;
};

export const installThemeTargetProbeGlobal = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.__lwRunThemeTargetProbe) {
    return;
  }
  window.__lwRunThemeTargetProbe = (options?: ThemeTargetProbeOptions) => runAndRecordThemeTargetProbe(options);
};

export const THEME_TARGET_PROBE_EVENT = PROBE_EVENT_NAME;

declare global {
  interface Window {
    __lwRunThemeTargetProbe?: (options?: ThemeTargetProbeOptions) => ThemeTargetProbeResult;
    __lwLastThemeTargetProbeResult?: ThemeTargetProbeResult | null;
  }
}
