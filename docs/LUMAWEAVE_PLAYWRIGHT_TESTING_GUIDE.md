# LumaWeave Playwright Testing Guide

## Purpose

Playwright gives Bandit a real browser QA harness for LumaWeave. Instead of only relying on `npm run typecheck` or manual visual checks, Playwright can open the app, click controls, type into fields, verify state, and catch regressions like:

- QA notes textbox cannot type/delete
- QA notes disappear after navigation or refresh
- QA Submit does not clear the working form
- QA Next/Previous makes the graph disappear
- Core app shell does not load

This is now part of the Baseline B stabilization workflow.

---

## Project Location

```bash
cd ~/Projects/lumaweave
```

---

## Installed Tooling

Playwright was added as a dev dependency:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

---

## Package Scripts

These scripts belong in `package.json` under `"scripts"`:

```json
{
  "qa:e2e": "playwright test",
  "qa:e2e:headed": "playwright test --headed",
  "qa:e2e:ui": "playwright test --ui"
}
```

### Script meanings

```bash
npm run qa:e2e
```

Runs all Playwright browser tests headlessly. This is the default command Bandit should run.

```bash
npm run qa:e2e:headed
```

Runs tests with a visible browser window so the user can watch Playwright click around.

```bash
npm run qa:e2e:ui
```

Opens Playwright’s test UI/dashboard.

---

## Playwright Config

File:

```txt
playwright.config.ts
```

Current recommended config:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://localhost:1420",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:1420",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### Behavior

- Tests run against `http://localhost:1420`.
- If the app is already running, Playwright reuses it.
- If the app is not running, Playwright starts it with `npm run dev`.
- Tests are currently Chromium-only for simplicity.

---

## Test Directory

All browser tests currently live in:

```txt
tests/e2e/
```

---

## Current Test Files

### 1. `tests/e2e/app-smoke.spec.ts`

Checks that the core app shell loads.

Covers:

- LumaWeave Observatory title
- Graph Sources heading
- Control Plane heading

Command:

```bash
npx playwright test tests/e2e/app-smoke.spec.ts
```

---

### 2. `tests/e2e/qa-panel.spec.ts`

Checks that the QA notes textarea can type, delete, and type again.

Covers:

- notes textbox visible
- typing works
- deletion works
- new text after deletion works

Command:

```bash
npx playwright test tests/e2e/qa-panel.spec.ts
```

---

### 3. `tests/e2e/qa-navigation.spec.ts`

Checks that QA notes persist when moving Next then Previous.

Covers:

- type note
- click Next
- click Previous
- note remains

Command:

```bash
npx playwright test tests/e2e/qa-navigation.spec.ts
```

---

### 4. `tests/e2e/qa-refresh.spec.ts`

Checks that QA notes persist through browser refresh before Submit.

Covers:

- type note
- refresh page
- note remains

Command:

```bash
npx playwright test tests/e2e/qa-refresh.spec.ts
```

---

### 5. `tests/e2e/viewport-stability.spec.ts`

Checks that the graph canvas remains visible after QA navigation.

Covers:

- canvas exists
- canvas has non-zero width/height
- click QA Next/Previous
- canvas still visible and non-collapsed

Command:

```bash
npx playwright test tests/e2e/viewport-stability.spec.ts
```

---

### 6. `tests/e2e/qa-submit.spec.ts`

Checks that Submit clears the active working QA form.

Covers:

- type note
- set status to pass
- click Submit
- notes clear
- status resets to untested

Command:

```bash
npx playwright test tests/e2e/qa-submit.spec.ts
```

---

## Run All Tests

```bash
npm run qa:e2e
```

Current known passing result:

```txt
6 passed
```

Current coverage:

- App loads
- QA notes type/delete
- QA notes survive Next/Previous
- QA notes survive refresh before Submit
- Graph canvas remains visible after QA navigation
- Submit clears working QA form

---

## Bandit Validation Rule

For future Bandit tasks that touch QA, layout, settings, or graph viewport behavior, require:

```bash
npm run typecheck
npm run qa:e2e
```

Bandit should not claim those systems are fixed unless both pass.

---

## When to Use Each Command

### Normal Bandit validation

```bash
npm run typecheck
npm run qa:e2e
```

### Watch the test in a browser

```bash
npm run qa:e2e:headed
```

### Debug interactively

```bash
npm run qa:e2e:ui
```

---

## Common Playwright Failure Patterns

### Strict mode violation

Example:

```txt
getByText('Control Plane') resolved to 2 elements
```

Meaning:
Playwright found more than one matching element.

Fix:
Use a more specific locator.

Example:

```ts
page.getByRole("heading", { name: "Control Plane" })
```

instead of:

```ts
page.getByText("Control Plane")
```

---

### Wrong dropdown selected

Example:
A test tries:

```ts
page.locator("select").first().selectOption("pass")
```

but the first select is not the QA status dropdown.

Fix:
Find the dropdown that actually contains the needed option:

```ts
const statusSelect = page.locator("select").filter({
  has: page.locator("option[value='pass']"),
}).first();
```

---

## Selector Guidance

Prefer stable, human-readable selectors:

```ts
page.getByRole("button", { name: /next/i })
page.getByRole("heading", { name: "Control Plane" })
page.locator("textarea").first()
```

If tests become fragile, add minimal `data-testid` attributes to important controls:

- QA panel
- QA notes textarea
- QA Next button
- QA Previous button
- QA Submit button
- graph viewport
- Node Label Mode select
- Edge Label Mode select
- Edge Label Font Size slider

Do not add excessive test IDs.

---

## Suggested Next Tests

Add these after the next label/settings patch:

### Settings controls

- Node Label Mode dropdown exists
- Edge Label Mode dropdown exists
- Edge Label Font Size slider exists
- Show Labels On Hover checkbox exists

### Edge label font size

- change Edge Label Font Size slider
- verify debug row or setting value updates

### Hover/selection regression

Harder to verify visually, but possible with debug rows or screenshots:

- hover node updates debug row/state
- leave node clears hover state
- selected node remains selected
- background clears selection

### Screenshot smoke test

Possible later:

- take screenshot before QA Next
- click QA Next
- take screenshot after
- verify graph viewport is not blank

Use visual tests carefully because canvas rendering can be noisy.

---

## Current Baseline B Meaning

Playwright is now the automated QA bridge for Baseline B.

It does not replace manual visual QA, but it catches repeatable app-shell regressions quickly.

Baseline B validation should increasingly combine:

```bash
npm run typecheck
npm run qa:e2e
```

plus targeted manual QA for visual/canvas-specific behavior.
