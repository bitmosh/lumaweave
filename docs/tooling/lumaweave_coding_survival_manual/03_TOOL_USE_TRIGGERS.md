# Tool Use Triggers

Use tools deliberately. Tools are evidence instruments, not decoration.

## Playwright MCP

Use when the issue is observable in the browser.

Best for:

- selector failures
- Mission Control UI state
- dropdown/header/report identity
- controls visible/clickable
- form reset/persistence
- console errors
- graph visible after changes

Use Playwright to answer:

```txt
What is actually on the page?
What does the accessibility tree say?
What selector should tests use?
What console error occurred?
Did the user-visible behavior happen?
```

Rules:

- Use for localhost app inspection only.
- Prefer Playwright evidence over visual guesses.
- Do not claim Playwright worked unless actually used.

## Context7 MCP

Use when unsure about external library/API behavior.

Best for:

- Playwright locator patterns
- React state/effect behavior
- Vite/Tauri config uncertainty
- Sigma/Graphology API uncertainty
- Tailwind/CSS behavior

Trigger phrases:

```txt
I am unsure how this library API works.
I am guessing at a Playwright locator pattern.
I do not know whether Sigma supports this setting.
This external error message is unfamiliar.
```

Rules:

- Context7 is library truth, not project truth.
- Project source of truth remains repo code + accepted QA + operating docs.
- If Context7 conflicts with project code or accepted QA, stop and report.

## Sequential Thinking MCP

Use for complex transitions and multi-system classification.

Best for:

- pass transition planning
- deciding whether tests are obsolete or still valid
- multi-layer bugs involving QA registry + UI + localStorage + reports
- choosing between two architecture-safe fixes

Rules:

- Use for planning/classification.
- Do not treat it as validation proof.
- Keep traces short.

## No Tool Needed

Use no tool when:

- editing obvious docs
- applying a known local patch
- following an accepted protocol
- the repo already contains the needed source of truth

## Tool Policy

```txt
Playwright = UI evidence.
Context7 = external docs evidence.
Sequential Thinking = planning aid.
Repo code + accepted QA = project truth.
```
