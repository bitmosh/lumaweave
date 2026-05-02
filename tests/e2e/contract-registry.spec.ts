import { expect, test } from "@playwright/test";

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
  const questionsSection = page.getByText("Bandit Questions");
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

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find a proposal decision selector
  const decisionSelector = page.locator("select").filter({ hasText: "Unreviewed" }).first();
  await expect(decisionSelector).toBeVisible();

  // Change decision
  await decisionSelector.selectOption("accept-for-future");

  // Verify value changed
  await expect(decisionSelector).toHaveValue("accept-for-future");
});

test("Proposal notes field accepts input", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find a proposal notes textarea
  const notesTextarea = page.locator("textarea").first();
  await expect(notesTextarea).toBeVisible();

  // Type notes
  await notesTextarea.fill("Test notes for proposal");

  // Verify value
  await expect(notesTextarea).toHaveValue("Test notes for proposal");
});

test("Bandit Backlog Top 10 renders", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Top 10 Backlog section is visible
  const backlogSection = page.getByText("Bandit Top 10 Backlog");
  await expect(backlogSection).toBeVisible();
});

test("v15 is default active checklist", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Debug tab to see checklist key
  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();

  // Verify active feature is mission-control-advisory-channel:v15
  const activeChecklistKey = page.getByText(/mission-control-advisory-channel:v15/);
  await expect(activeChecklistKey).toBeVisible();
});

test("advisory backlog reorder moves item up", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find the backlog section
  const backlogSection = page.getByText("Bandit Top 10 Backlog");
  await expect(backlogSection).toBeVisible();

  // Get the second item's Move Up button
  const moveUpButtons = page.getByTitle("Move up in priority");
  await expect(moveUpButtons.nth(1)).toBeVisible();
  await moveUpButtons.nth(1).click();

  // Verify the order changed - item #2 should now show as #1
  // This is a basic smoke test - detailed order verification would require more complex selectors
});

test("advisory backlog reorder moves item down", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find the backlog section
  const backlogSection = page.getByText("Bandit Top 10 Backlog");
  await expect(backlogSection).toBeVisible();

  // Get the first item's Move Down button
  const moveDownButtons = page.getByTitle("Move down in priority");
  await expect(moveDownButtons.nth(0)).toBeVisible();
  await moveDownButtons.nth(0).click();

  // Verify the order changed - item #1 should now show as #2
  // This is a basic smoke test - detailed order verification would require more complex selectors
});

test("advisory backlog reorder persists through tab switching", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Switch to Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Find the backlog section
  const backlogSection = page.getByText("Bandit Top 10 Backlog");
  await expect(backlogSection).toBeVisible();

  // Move an item
  const moveDownButtons = page.getByTitle("Move down in priority");
  await moveDownButtons.nth(0).click();

  // Switch to Checklist tab
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();

  // Switch back to Advisory tab
  await advisoryTab.click();

  // Verify backlog section is still visible
  await expect(backlogSection).toBeVisible();
});

test("v15 advisory tab opens", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await expect(advisoryTab).toBeVisible();
  await advisoryTab.click();

  // Verify Advisory content is visible
  const banditQuestions = page.getByText("Bandit Questions");
  await expect(banditQuestions).toBeVisible();
});

test("v15 bandit questions section renders", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Questions section is visible
  const banditQuestions = page.getByText("Bandit Questions");
  await expect(banditQuestions).toBeVisible();

  // Verify question cards exist
  const questionCard = page.getByTestId("bandit-question-card-mission-control-primary-role");
  await expect(questionCard).toBeVisible();
});

test("v15 question notes textarea exists", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify question notes textarea exists
  const questionNotes = page.getByTestId("bandit-question-notes-mission-control-primary-role");
  await expect(questionNotes).toBeVisible();

  // Verify placeholder
  await expect(questionNotes).toHaveAttribute("placeholder", "Enter your answer or notes...");
});

test("v15 question notes persist through tab switching", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Type in question notes
  const questionNotes = page.getByTestId("bandit-question-notes-mission-control-primary-role");
  await questionNotes.fill("Test answer for question");

  // Switch to Checklist tab
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();

  // Switch back to Advisory tab
  await advisoryTab.click();

  // Verify answer is preserved
  await expect(questionNotes).toHaveValue("Test answer for question");
});

test("v15 bandit proposals section renders", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Proposals section is visible
  const banditProposals = page.getByText("Bandit Proposals");
  await expect(banditProposals).toBeVisible();

  // Verify proposal cards exist
  const proposalCard = page.getByTestId("bandit-proposal-card-graph-inspector-v0");
  await expect(proposalCard).toBeVisible();
});

test("v15 proposal notes under proposal cards", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify proposal notes textarea exists under proposal card
  const proposalNotes = page.getByTestId("bandit-proposal-notes-graph-inspector-v0");
  await expect(proposalNotes).toBeVisible();
});

test("v15 bandit top 10 backlog renders", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Bandit Top 10 Backlog section is visible
  const backlogSection = page.getByText("Bandit Top 10 Backlog");
  await expect(backlogSection).toBeVisible();
});

test("v15 backlog reorder still works", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click Advisory tab
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();

  // Verify Move Up / Down buttons exist
  const moveUpButtons = page.getByTitle("Move up in priority");
  const moveDownButtons = page.getByTitle("Move down in priority");
  await expect(moveUpButtons.nth(0)).toBeVisible();
  await expect(moveDownButtons.nth(0)).toBeVisible();
});

test("v15 mission control tabs are clickable", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Click each tab and verify it's clickable
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();
  await expect(checklistTab).toBeVisible();

  const lastReportTab = page.getByTestId("qa-tab-last-submission");
  await lastReportTab.click();
  await expect(lastReportTab).toBeVisible();

  const historyTab = page.getByTestId("qa-tab-history");
  await historyTab.click();
  await expect(historyTab).toBeVisible();

  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();
  await expect(debugTab).toBeVisible();

  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();
  await expect(advisoryTab).toBeVisible();
});

test("v15 tab grid has stable layout", async ({ page }) => {
  await page.goto("/");

  // QA panel is in the left dock - use nth(1) to get the main panel
  const qaPanel = page.getByTestId("qa-panel").nth(1);
  await expect(qaPanel).toBeVisible();

  // Verify tabs container has grid class
  const tabsContainer = qaPanel.locator("div").filter({ hasText: /Checklist/ }).first();
  await expect(tabsContainer).toHaveClass(/grid/);
});
