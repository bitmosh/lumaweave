import { test, expect } from "@playwright/test";
import {
  completeChecklistAndSubmitReport,
  expectChecklistContainsChecks,
  expectCurrentQaKey,
  getLastReportText,
  markAllCurrentChecklistItems,
  openChecklistTab,
  openQaPanel,
  openAdvisoryTab,
  openDebugTab,
  submitQaReport,
} from "./helpers/qa";
import type { ThemeTargetProbeResult } from "../../src/themes/themeTargetHeuristics";

const CURRENT_QA_KEY = "v36a";
const PRIMARY_PROPOSAL_ID = "v36b-hotkey-inventory";
const SECONDARY_PROPOSAL_ID = "v36c-command-metadata";

type ProbeWindow = Window & {
  __lwRunThemeTargetProbe?: (options?: { minSignals?: number }) => ThemeTargetProbeResult | null;
  __LUMAWEAVE_THEME_OVERRIDE_STORAGE__?: {
    validateTokenPath: (path: string) => { isValid: boolean };
    setGlobalOverride: (path: string, value: string) => void;
    getGlobalOverride: (path: string) => string | undefined;
    removeGlobalOverride: (path: string) => void;
    resetAllOverrides: () => void;
    hasOverrides: () => boolean;
  };
};

test("Mission Control tabs are visible", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Verify all tabs are visible
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await expect(checklistTab).toBeVisible();

  const lastReportTab = page.getByTestId("qa-tab-last-submission");
  await expect(lastReportTab).toBeVisible();

  const historyTab = page.getByTestId("qa-tab-history");
  await expect(historyTab).toBeVisible();

  const debugTab = page.getByTestId("qa-tab-debug");
  await expect(debugTab).toBeVisible();
});

test("Mission Control Debug tab shows contract summary", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Debug tab
  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();

  // Verify contract summary section exists
  const contractSummary = page.getByTestId("contract-summary-section");
  await expect(contractSummary).toBeVisible();

  // Verify counts are displayed
  const totalActiveControls = page.getByTestId("contract-total-active");
  await expect(totalActiveControls).toBeVisible();

  const withQaCoverage = page.getByTestId("contract-with-qa");
  await expect(withQaCoverage).toBeVisible();

  const withPlaywrightCoverage = page.getByTestId("contract-with-playwright");
  await expect(withPlaywrightCoverage).toBeVisible();

  // Verify surface grouping is displayed
  const surfaceGrouping = page.getByTestId("contract-surface-grouping");
  await expect(surfaceGrouping).toBeVisible();
});

test("QA status selectors are visible", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Checklist tab
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();

  // Verify status selector is visible
  const statusSelector = page.getByTestId("qa-status-selector");
  await expect(statusSelector).toBeVisible();

  // Verify status options exist
  const statusOptions = page.locator('[data-testid="qa-status-selector"] option');
  await expect(statusOptions).toHaveCount(5); // untested, pass, fail, blocked, unverified
});

test("Copy Last Submission button is visible when submission exists", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Last Report tab
  const lastReportTab = page.getByTestId("qa-tab-last-submission");
  await lastReportTab.click();

  // The button only appears if there's a last submission
  // Check if the "No submissions yet" message is visible instead
  const noSubmissions = page.getByText("No submissions yet");
  const hasSubmission = await noSubmissions.count() === 0;

  if (hasSubmission) {
    // Verify Copy Last Submission button exists
    const copyLastSubmission = page.getByTestId("qa-copy-last-submission");
    await expect(copyLastSubmission).toBeVisible();
  } else {
    // Verify no submissions message is shown
    await expect(noSubmissions).toBeVisible();
  }
});

test("Theme runtime integrity - theme selector works", async ({ page }) => {
  await page.goto("/");

  // Switch to solar-plasma theme using specific test ID
  const themeSelector = page.getByTestId("theme-preset-selector");
  await expect(themeSelector).toBeVisible();
  await themeSelector.selectOption("solar-plasma");

  // Verify the selected value is solar-plasma
  await expect(themeSelector).toHaveValue("solar-plasma");

  // Switch to haunted-observatory theme
  await themeSelector.selectOption("haunted-observatory");

  // Verify the selected value is haunted-observatory
  await expect(themeSelector).toHaveValue("haunted-observatory");
});

test("Theme runtime integrity - glitter toggle updates visual state", async ({ page }) => {
  await page.goto("/");

  // Find glitter toggle checkbox in top bar
  const glitterToggle = page.locator("input[type='checkbox']").first();
  
  // Get initial state
  const initialState = await glitterToggle.isChecked();
  
  // Toggle glitter
  await glitterToggle.click();
  
  // Verify state changed
  const newState = await glitterToggle.isChecked();
  expect(newState).toBe(!initialState);
});

test("Advisory tab is visible", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Verify Advisory tab exists
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await expect(advisoryTab).toBeVisible();
});

test("Bandit Questions render in Advisory tab", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Questions section is visible
  const questionsSection = page.getByText("Bandit Questions").first();
  await expect(questionsSection).toBeVisible();
});

test("Question status can be changed", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find a question status selector
  const firstStatusSelector = page.locator("select").filter({ hasText: "Unanswered" }).first();
  await expect(firstStatusSelector).toBeVisible();

  // Change status
  await firstStatusSelector.selectOption("answered");

  // Verify value changed
  await expect(firstStatusSelector).toHaveValue("answered");
});

test("Bandit Proposals render in Advisory tab", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Proposals section is visible
  const proposalsSection = page.getByText("Bandit Proposals");
  await expect(proposalsSection).toBeVisible();
});

test.skip("Proposal decision can be changed", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const decisionDropdown = page.getByTestId(`bandit-proposal-decision-${PRIMARY_PROPOSAL_ID}`);
  await expect(decisionDropdown).toBeVisible();
  await decisionDropdown.selectOption("accept-for-future");
  await expect(decisionDropdown).toHaveValue("accept-for-future");
});

test.skip("Proposal notes field accepts input", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const notesTextarea = page.getByTestId(`bandit-proposal-notes-${SECONDARY_PROPOSAL_ID}`);
  await expect(notesTextarea).toBeVisible();
  await notesTextarea.fill("Test notes for proposal");
  await expect(notesTextarea).toHaveValue("Test notes for proposal");
});

test.skip("Bandit Backlog Top 10 renders", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const backlogItem = page.getByTestId("bandit-backlog-item-1");
  await expect(backlogItem).toBeVisible();
  await expect(backlogItem.getByTestId("bandit-backlog-title")).not.toHaveText("");
});

test("v36a is default active checklist", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await expectCurrentQaKey(page, CURRENT_QA_KEY);
});

test("v36a identity diagnostics visible in Debug tab", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();

  const pageContent = await page.content();
  expect(pageContent).toContain("Checklist Identity Diagnostics");
  expect(pageContent).toContain("Active Checklist");
  expect(pageContent).toContain("Dropdown Selection");
  expect(pageContent).toContain("Report Key");
  expect(pageContent).toContain("Advisory Set Key");
  expect(pageContent).toContain(CURRENT_QA_KEY);
  expect(pageContent).toContain("Identity Valid");
});

test("Runtime probe summary updates after manual run", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openDebugTab(page);

  await page.evaluate(() => {
    (window as ProbeWindow).__lwRunThemeTargetProbe?.();
  });

  const summary = page.getByTestId("theme-target-probe-summary");
  await expect(summary).toContainText("Candidates:");
  await expect(summary).toContainText("Unknown:");
  await expect(summary).toContainText("Last Run:");
});

test("Debug tab shows grouped missing Playwright coverage", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);

  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();

  await expect(page.getByTestId("missing-playwright-topbar")).toContainText("Fully covered");
  await expect(page.getByTestId("missing-playwright-settings")).toContainText("Fully covered");
  await expect(page.getByTestId("missing-playwright-graph")).toContainText("Neighborhood Depth");
  await expect(page.getByTestId("missing-playwright-graph")).toContainText("Hover Node Color");
  await expect(page.getByTestId("missing-playwright-missionControl")).toContainText("Mission Control Tabs");
});

test.skip("advisory backlog reorder moves item up", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const secondTitle = await page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-up-2").click();
  await expect(page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title")).toHaveText(secondTitle || "");
});

test.skip("advisory backlog reorder moves item down", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const firstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-down-1").click();
  await expect(page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title")).toHaveText(firstTitle || "");
});

test.skip("advisory backlog reorder persists through tab switching", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  await page.getByTestId("bandit-backlog-move-down-1").click();
  const reorderedFirstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();

  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();
  await openAdvisoryTab(page);

  await expect(page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title")).toHaveText(reorderedFirstTitle || "");
});

test("v36a advisory tab renders shell questions", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Navigate to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify v36a advisory section is visible
  const pageContent = await page.content();
  expect(pageContent).toContain("Command Deck"); // General indicator of Command Deck
  expect(pageContent).toContain("shell"); // General indicator of shell functionality
});

test("v36a report includes Advisory Set Key", async ({ page }) => {
  await page.goto("/");

  // Complete checklist and submit report using helper
  await completeChecklistAndSubmitReport(page);

  // Get last report text
  const reportText = await getLastReportText(page);

  // Verify report includes Advisory Set Key: v36a
  expect(reportText).toContain("Advisory Set Key:");
  expect(reportText).toContain(CURRENT_QA_KEY);
});

test("v36a report stays blocked when control checks are unverified", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openChecklistTab(page);
  await markAllCurrentChecklistItems(page, "unverified");
  await submitQaReport(page);

  const reportText = await getLastReportText(page);
  expect(reportText).toContain("## Acceptance Decision");
  expect(reportText).toContain("**BLOCKED**");
  expect(reportText).toMatch(/- Unverified:\s*\d+/);
  expect(reportText).not.toContain("**ACCEPT**");
});

test("v36a acceptance decision requires zero blocked or unverified", async ({ page }) => {
  await page.goto("/");
  await completeChecklistAndSubmitReport(page);

  const reportText = await getLastReportText(page);
  expect(reportText).toContain("## Acceptance Decision");
  expect(reportText).toContain("**ACCEPT**");
  expect(reportText).toContain("- Blocked: 0");
  expect(reportText).toContain("- Unverified: 0");
});

test("v36a checklist includes shell checks", async ({ page }) => {
  await page.goto("/");
  await expectChecklistContainsChecks(page, [
    "v36a is default active checklist",
    "Command Deck shell is visible",
    "Command Deck shell is read-only",
    "No command execution controls",
    "No new hotkeys",
    "Accessibility requirements",
    "Typecheck passes",
    "Playwright passes with 0 skipped",
  ]);
});

test("v34b narrow theme mapping control behavior preserved", async ({ page }) => {
  await page.goto("/");

  // Verify v34b narrow theme mapping control behavior still works
  // panel.background control is still canonical and writable
  const validationResult = await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { validateTokenPath } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    return validateTokenPath("panel.background");
  });
  expect(validationResult).toEqual({ isValid: true });

  // setGlobalOverride works for panel.background
  await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { setGlobalOverride, getGlobalOverride } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    setGlobalOverride("panel.background", "#1a1a2e");
    return getGlobalOverride("panel.background");
  });
  const value = await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { getGlobalOverride } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    return getGlobalOverride("panel.background");
  });
  expect(value).toBe("#1a1a2e");

  // removeGlobalOverride works
  await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { removeGlobalOverride } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    removeGlobalOverride("panel.background");
  });
  const afterRemove = await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { getGlobalOverride } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    return getGlobalOverride("panel.background");
  });
  expect(afterRemove).toBeUndefined();

  // resetAllOverrides works
  await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { setGlobalOverride, resetAllOverrides } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    setGlobalOverride("panel.background", "#1a1a2e");
    resetAllOverrides();
  });
  const afterReset = await page.evaluate(() => {
    const windowWithStorage = window as ProbeWindow;
    const { hasOverrides } = windowWithStorage.__LUMAWEAVE_THEME_OVERRIDE_STORAGE__!;
    return hasOverrides();
  });
  expect(afterReset).toBe(false);
});

test.skip("v36a proposal decisions and backlog order persist after submit", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const decisionDropdown = page.getByTestId(`bandit-proposal-decision-${PRIMARY_PROPOSAL_ID}`);
  await decisionDropdown.selectOption("accept-for-future");
  await expect(decisionDropdown).toHaveValue("accept-for-future");

  const originalFirstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-down-1").click();
  const reorderedFirstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
  expect(reorderedFirstTitle?.trim()).not.toEqual(originalFirstTitle?.trim());

  await completeChecklistAndSubmitReport(page);
  await openAdvisoryTab(page);

  await expect(page.getByTestId(`bandit-proposal-decision-${PRIMARY_PROPOSAL_ID}`)).toHaveValue("accept-for-future");
  await expect(page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title")).toHaveText(reorderedFirstTitle || "");
});
