# QA Mission Control Policy

## Purpose

The current QA panel is the active development checkpoint system for LumaWeave.

Long-term, it may evolve into or be replaced by a collapsible Agent Chat / Mission Control panel.

This policy keeps QA useful now while preparing for that future.

## Core Rule

```txt
The in-app QA checklist is the single checklist for each pass.
```

Do not create a separate long checklist in chat if the in-app QA panel is working.

If the app checklist is stale or missing, fix or update the app checklist.

## QA Panel Current Role

During development, the QA panel should provide:

- active checklist for the current pass
- per-check status
- per-check notes
- acceptance decision
- report copy/submit workflow
- checklist versioning
- regression coverage for accepted behavior

## Future Mission Control Role

Mission Control may eventually include:

- QA checklist
- agent chat
- debug summary
- last submitted report
- Playwright failure summary
- handleset status summary
- current phase/status
- suggested next checklist
- local agent/tool routing

## Checklist Versioning Rules

Each implementation pass that changes QA scope should increment the active checklist version.

Example:

```txt
baseline-b-consolidation-followup-v0:v4
baseline-b-consolidation-followup-v0:v5
baseline-b-consolidation-followup-v0:v6
```

Old checklists should be:

```txt
active: false
archived: true
```

Do not delete old checklists unless explicitly requested.

## Active Checklist Rules

1. Only one checklist should be active for the current pass unless there is a deliberate reason.
2. The QA panel should default to the newest active checklist.
3. If the selected checklist has no active checks, the panel should fall back to the newest active checklist.
4. The panel should not show “No QA checks found” when an active checklist exists.
5. Archived checklists should not appear in the normal active selector.

## Report Copy / Submit Rules

Current behavior:

```txt
Copy Report before Submit = captures filled answers.
Submit = finalizes and clears working form.
Copy Report after Submit = may capture blank/reset form.
```

Future improvement:

```txt
Last Submitted Report
Copy Last Submission
QA History
```

These should be planned for Mission Control.

## Mission Control Development Roadmap

### Stage 1 — Current QA Panel

- stable checklist rendering
- status/notes
- submit/copy
- versioning
- active checklist fallback

### Stage 2 — Better Development Checkpoint

- Last Submitted Report
- Copy Last Submission
- checklist history
- current accepted baseline summary
- active QA version badge

### Stage 3 — Mission Control Shell

- collapsible panel framing
- debugging mode
- session summary
- Playwright result area
- handleset status summary

### Stage 4 — Agent Chat Integration

- collapsible chat box
- agent can summarize current phase
- agent can explain QA failures
- agent can propose next checklist
- agent can inspect docs/handleset/test output
- eventually route to local tools/agents

## QA Checklist Design Rules

A checklist should be:

- focused on current pass
- regression-aware
- no more than 20 checks unless explicitly justified
- not repetitive if prior baseline is accepted
- specific enough for manual verification
- aligned with accepted contracts

## When to Generate a New Checklist

Generate a new active checklist when:

- a new runtime feature is added
- accepted behavior might regress
- QA scope changes
- a previous checklist became stale
- a pass introduced new manual visual behavior

## When Not to Generate a New Checklist

Do not generate a new checklist for:

- docs-only changes
- typo fixes
- session log updates
- pure roadmap/scaffold docs with no active behavior change

## Stop Conditions

Stop and fix QA/Mission Control before continuing if:

1. QA panel shows no checks while active checks exist
2. Playwright QA tests fail due to checklist rendering
3. checklist version is stale
4. active checklist does not match current pass
5. user reports checklist is repetitive/stale
6. submit/copy behavior causes report loss

## Bandit Report Requirements

For QA-related work, report:

1. active featureId
2. active qaVersion
3. number of active checks
4. archived checklist versions
5. whether Playwright QA tests pass
6. whether the checklist matches current pass
7. whether Last Submitted Report is needed
8. manual QA instructions
