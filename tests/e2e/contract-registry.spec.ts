import { test, expect } from "@playwright/test";
import {
  completeChecklistAndSubmitReport,
  expectChecklistContainsChecks,
  expectCurrentQaKey,
  getLastReportText,
  openQaPanel,
  openAdvisoryTab,
} from "./helpers/qa";

const CURRENT_QA_KEY = "v24";
const PRIMARY_PROPOSAL_ID = "ghost-overlay-next-step";
const SECONDARY_PROPOSAL_ID = "registered-heuristic-plan";

test("Mission Control tabs are visible", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel, not the nested one
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Verify Advisory tab exists
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await expect(advisoryTab).toBeVisible();
});

test("Bandit Questions render in Advisory tab", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
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
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Proposals section is visible
  const proposalsSection = page.getByText("Bandit Proposals");
  await expect(proposalsSection).toBeVisible();
});

test("Proposal decision can be changed", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const decisionDropdown = page.getByTestId(`bandit-proposal-decision-${PRIMARY_PROPOSAL_ID}`);
  await expect(decisionDropdown).toBeVisible();
  await decisionDropdown.selectOption("accept-for-future");
  await expect(decisionDropdown).toHaveValue("accept-for-future");
});

test("Proposal notes field accepts input", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const notesTextarea = page.getByTestId(`bandit-proposal-notes-${SECONDARY_PROPOSAL_ID}`);
  await expect(notesTextarea).toBeVisible();
  await notesTextarea.fill("Test notes for proposal");
  await expect(notesTextarea).toHaveValue("Test notes for proposal");
});

test("Bandit Backlog Top 10 renders", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const backlogItem = page.getByTestId("bandit-backlog-item-1");
  await expect(backlogItem).toBeVisible();
  await expect(backlogItem.getByTestId("bandit-backlog-title")).not.toHaveText("");
});

test("v24 is default active checklist", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await expectCurrentQaKey(page, CURRENT_QA_KEY);
});

test("v24 identity diagnostics visible in Debug tab", async ({ page }) => {
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

test("advisory backlog reorder moves item up", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const secondTitle = await page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-up-2").click();
  await expect(page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title")).toHaveText(secondTitle || "");
});

test("advisory backlog reorder moves item down", async ({ page }) => {
  await page.goto("/");
  await openQaPanel(page);
  await openAdvisoryTab(page);

  const firstTitle = await page.getByTestId("bandit-backlog-item-1").getByTestId("bandit-backlog-title").textContent();
  await page.getByTestId("bandit-backlog-move-down-1").click();
  await expect(page.getByTestId("bandit-backlog-item-2").getByTestId("bandit-backlog-title")).toHaveText(firstTitle || "");
});

test("advisory backlog reorder persists through tab switching", async ({ page }) => {
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

test("v24 advisory questions are specific to current pass", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Navigate to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify v24-specific questions are visible
  const pageContent = await page.content();
  expect(pageContent).toContain("mission-control-toggle-accessibility");
  expect(pageContent).toContain("inspector-toggle-hotkey-parity");
  expect(pageContent).toContain("ui-part-role-model-doc");

  // Verify old v15/v13/v16d/v17 questions are NOT visible (stale questions should not appear)
  expect(pageContent).not.toContain("Mission Control Advisory cleanup");
  expect(pageContent).not.toContain("Should Mission Control become the primary left-dock cockpit?");
  expect(pageContent).not.toContain("token-path-required-vocab");
  expect(pageContent).not.toContain("visual-handle-token-declaration");
});

test("v24 report includes Advisory Set Key", async ({ page }) => {
  await page.goto("/");

  // Complete checklist and submit report using helper
  await completeChecklistAndSubmitReport(page);

  // Get last report text
  const reportText = await getLastReportText(page);

  // Verify report includes Advisory Set Key: v20
  expect(reportText).toContain("Advisory Set Key:");
  expect(reportText).toContain(CURRENT_QA_KEY);
});

test("v24 checklist includes toggle checks", async ({ page }) => {
  await page.goto("/");
  await expectChecklistContainsChecks(page, [
    "UI Inspector toggle appears in QA Debug",
    "Toggle enables UI Inspector",
    "Alt+Shift+I still toggles overlay",
    "Playwright passes with 0 skipped",
  ]);
});

test("v24 proposal decisions and backlog order persist after submit", async ({ page }) => {
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
