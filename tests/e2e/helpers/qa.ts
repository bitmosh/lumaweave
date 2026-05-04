import { Page, expect } from "@playwright/test";

function parseQuestionCounterText(text: string | null): { total: number } {
  if (!text) {
    return { total: 1 };
  }
  const match = text.match(/\/(\s*\d+)/);
  if (match) {
    const parsed = parseInt(match[1].trim(), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return { total: parsed };
    }
  }
  return { total: 1 };
}

/**
 * Playwright helpers for QA panel interactions
 * Makes granular checklist submission easy and reduces test code duplication
 */

/**
 * Open the QA panel in the left dock
 */
export async function openQaPanel(page: Page): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();
}

/**
 * Switch to the Advisory tab in QA panel
 */
export async function openAdvisoryTab(page: Page): Promise<void> {
  const advisoryTab = page.getByTestId("qa-tab-advisory");
  await advisoryTab.click();
}

/**
 * Switch to the Checklist tab in QA panel
 */
export async function openChecklistTab(page: Page): Promise<void> {
  const checklistTab = page.getByTestId("qa-tab-checklist");
  await checklistTab.click();
}

/**
 * Switch to the Debug tab in QA panel
 */
export async function openDebugTab(page: Page): Promise<void> {
  const debugTab = page.getByTestId("qa-tab-debug");
  await debugTab.click();
}

/**
 * Switch to the Last Report tab in QA panel
 */
export async function openLastReportTab(page: Page): Promise<void> {
  const lastReportTab = page.getByTestId("qa-tab-last-submission");
  await lastReportTab.click();
}

/**
 * Mark all current checklist items with the specified status
 * @param page - Playwright page
 * @param status - Status to mark: "pass", "fail", "blocked", "unverified"
 */
export async function markAllCurrentChecklistItems(page: Page, status: "pass" | "fail" | "blocked" | "unverified"): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  const counterText = await qaPanel.getByTestId("qa-question-counter").textContent();
  const { total } = parseQuestionCounterText(counterText);

  for (let i = 0; i < total; i++) {
    const statusSelector = qaPanel.getByTestId("qa-status-selector");
    await statusSelector.selectOption(status);

    if (i < total - 1) {
      await qaPanel.getByTestId("qa-check-next").click();
    }
  }

  // Return to the first check to keep helper usage predictable
  for (let i = total - 1; i > 0; i--) {
    await qaPanel.getByTestId("qa-check-previous").click();
  }
}

/**
 * Submit the QA report
 * Assumes checklist items are already marked
 */
export async function submitQaReport(page: Page): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  const submitButton = qaPanel.getByRole("button", { name: /submit report/i });
  await submitButton.click();
}

/**
 * Copy the last submission to clipboard
 */
export async function copyLastSubmission(page: Page): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  const copyButton = qaPanel.getByRole("button", { name: /copy last submission/i });
  await copyButton.click();
}

/**
 * Expect the current QA key to match the expected value
 * Checks header badge and dropdown selection
 * @param page - Playwright page
 * @param expectedQaKey - Expected QA key (e.g., "v17")
 */
export async function expectCurrentQaKey(page: Page, expectedQaKey: string): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Check header badge shows expected QA key
  const versionBadge = qaPanel.locator(".lw-badge").filter({ hasText: new RegExp(expectedQaKey, "i") });
  await expect(versionBadge).toBeVisible();

  // Check dropdown value matches expected QA key
  const dropdown = qaPanel.getByTestId("qa-checklist-selector");
  await expect(dropdown).toHaveValue(expectedQaKey);
}

/**
 * Switch the QA key using the checklist selector dropdown
 * @param page - Playwright page
 * @param qaKey - QA key to switch to (e.g., "v48")
 */
export async function switchQaKey(page: Page, qaKey: string): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  const dropdown = qaPanel.getByTestId("qa-checklist-selector");
  await dropdown.selectOption(qaKey);
  await expect(dropdown).toHaveValue(qaKey);
}

/**
 * Wait for the advisory section to be visible
 * Use this only after opening the Advisory tab
 */
export async function waitForAdvisorySection(page: Page): Promise<void> {
  await page.waitForSelector('[data-testid="qa-advisory-section"]', { state: "visible" });
}

/**
 * Expect the report to include the Advisory Set Key
 * @param page - Playwright page
 * @param expectedQaKey - Expected QA key (e.g., "v17")
 */
export async function expectReportAdvisorySetKey(page: Page, expectedQaKey: string): Promise<void> {
  const pageContent = await page.content();
  expect(pageContent).toContain("Advisory Set Key:");
  expect(pageContent).toContain(expectedQaKey);
}

/**
 * Expect the report to include the Checklist Key
 * @param page - Playwright page
 * @param expectedQaKey - Expected QA key (e.g., "v17")
 */
export async function expectReportChecklistKey(page: Page, expectedQaKey: string): Promise<void> {
  const pageContent = await page.content();
  expect(pageContent).toContain("Checklist Key:");
  expect(pageContent).toContain(expectedQaKey);
}

/**
 * Mark a specific check by title with the specified status
 * @param page - Playwright page
 * @param checkTitle - Title of the check to mark
 * @param status - Status to mark: "pass", "fail", "blocked", "unverified"
 */
export async function markCheckByTitle(page: Page, checkTitle: string, status: "pass" | "fail" | "blocked" | "unverified"): Promise<void> {
  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  // Find the check by title
  const checkElement = qaPanel.getByText(checkTitle);
  await expect(checkElement).toBeVisible();

  // Find the status button for this check (usually nearby)
  const statusButton = qaPanel.getByRole("button", { name: new RegExp(status, "i") }).first();
  await statusButton.click();
}

/**
 * Complete the full checklist and submit a report
 * This is a helper function that combines multiple steps into a single workflow
 * @param page - Playwright page
 * @param status - Status to mark all checks: "pass" (default), "fail", "blocked", "unverified"
 */
export async function completeChecklistAndSubmitReport(page: Page, status: "pass" | "fail" | "blocked" | "unverified" = "pass"): Promise<void> {
  // Open QA panel
  await openQaPanel(page);
  
  // Switch to Checklist tab
  await openChecklistTab(page);
  
  // Mark all current checklist items with the specified status
  await markAllCurrentChecklistItems(page, status);
  
  // Submit the report
  await submitQaReport(page);
}

/**
 * Inspect the last report text
 * @param page - Playwright page
 * @returns The full text content of the last report
 */
export async function getLastReportText(page: Page): Promise<string> {
  // Switch to Last Report tab
  await openLastReportTab(page);
  
  // Get the full page content
  return await page.content();
}

export async function expectChecklistContainsChecks(page: Page, expectedTitles: string[]): Promise<void> {
  await openQaPanel(page);
  await openChecklistTab(page);

  const qaPanel = page.getByTestId("qa-panel").first();
  await expect(qaPanel).toBeVisible();

  const counterText = await qaPanel.getByTestId("qa-question-counter").textContent();
  const { total } = parseQuestionCounterText(counterText);
  const remaining = new Set(expectedTitles);

  for (let i = 0; i < total; i++) {
    const title = (await qaPanel.getByTestId("qa-check-title").textContent())?.trim();
    if (title) {
      for (const target of Array.from(remaining)) {
        if (title.includes(target)) {
          remaining.delete(target);
        }
      }
    }

    if (i < total - 1) {
      await qaPanel.getByTestId("qa-check-next").click();
    }
  }

  expect(Array.from(remaining)).toEqual([]);

  // Reset to the first check for cleanliness
  for (let i = total - 1; i > 0; i--) {
    await qaPanel.getByTestId("qa-check-previous").click();
  }
}
