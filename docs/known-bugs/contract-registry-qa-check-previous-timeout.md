# contract-registry qa-check-previous timeout

## Symptom

`tests/e2e/contract-registry.spec.ts:305 — v48 checklist includes
detail mode checks` times out at 30000ms while clicking the
`qa-check-previous` button inside the QA panel.

The button is reported as visible, enabled, and stable by Playwright's
locator before the click. The click action is dispatched and then
hangs indefinitely until the test timeout fires.locator resolved to <button data-testid="qa-check-previous" ...>Previous</button>

attempting click action

waiting for element to be visible, enabled and stable
element is visible, enabled and stable
scrolling into view if needed
[timeout]




## Where the failure originates

`tests/e2e/helpers/qa.ts:284` inside `expectChecklistContainsChecks`:

```javascript// Reset to the first check for cleanliness
for (let i = total - 1; i > 0; i--) {
await qaPanel.getByTestId("qa-check-previous").click();
}

The loop walks backwards through checklist items by clicking
"Previous" repeatedly. One of those clicks (not always the first or
last) hangs.

## First observed

Failure has surfaced in full qa:e2e runs since at least 2026-05-17.
Investigation deferred during v86b finish (filed out of scope) and
v86c Scope A (unrelated).

## Possible causes (untested)

1. **Click race with re-render.** The "Previous" button's onClick
   triggers a state update that re-renders the QA panel and may
   detach the original button element before the click completes.
   Playwright's click action would then be operating on a stale
   DOM node.

2. **Disabled-state flicker.** The button has
   `disabled:opacity-50 disabled:cursor-not-allowed` classes. If
   the button transitions through a brief `disabled` state during
   the click, Playwright may be waiting for it to become enabled
   again without ever timing out the wait.

3. **Focus-trap / modal interaction.** Something on the page (a
   focused element, a modal, an open command palette) may be
   capturing the click before it reaches the button.

## How to reproducenpm run qa:e2e -- tests/e2e/contract-registry.spec.ts --grep "v48 checklist includes detail mode checks"

Reproduces reliably in full-suite runs. Behavior in isolated runs
unknown.

## Workaround for now

None applied. Test currently fails on every full qa:e2e run. The
1 failing count is documented in commit messages as "flaky helper,
unrelated to v86c."

## Suggested fix path

Either:
- Investigate which iteration of the loop hangs (add diagnostic
  count + console.log per iteration before the click).
- Rewrite `expectChecklistContainsChecks` to not require walking
  backwards — set the checklist position directly via
  `__lwStore` if a setter exists.

Priority: low. Test correctness is real but failure pattern is
known and contained.