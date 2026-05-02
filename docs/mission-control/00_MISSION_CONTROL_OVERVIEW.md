# Mission Control Overview

## Current State

LumaWeave currently has a QA panel (`src/control-plane/qa/QaPanel.tsx`) that serves as a development-time debugging and verification tool. The QA panel is useful during active development but is not intended as the long-term user-facing interface.

## QA Panel Role (Current)

The current QA panel provides:
- Active checklist display with step-by-step verification
- Notes field for each check
- Pass/Fail/Not Applicable status selection
- Submit report generation
- Copy report to clipboard
- Checklist version awareness (qaVersion in registry)
- Results persistence (via qa.store.ts)

## Mission Control Role (Future)

Mission Control will evolve from the QA panel to become:
- A collapsible debug checkpoint panel
- A development-time workflow hub
- An Agent Chat interface for AI-assisted debugging
- A handleset status inspector
- A QA history viewer
- A Playwright failure summarizer

## Evolution Path

### Phase 1: QA Panel Enhancements (Near Term)
- Add Last Submitted Report view
- Add Copy Last Submission button
- Add QA history panel
- Add active QA version badge
- Add debug checkpoint summary

### Phase 2: Mission Control Collapsible Panel
- Rename QA panel to Mission Control
- Make panel collapsible
- Add tab system: Checklist | History | Debug | Agent Chat
- Keep existing QA functionality intact

### Phase 3: Agent Chat Integration (Future)
- Add Agent Chat tab
- Implement explain current graph state
- Implement summarize QA failures
- Implement suggest next checklist
- Implement inspect handleset status
- Implement summarize Playwright failures
- Route to local agents/tools (very late)

## What Stays During Development

The following QA panel features will remain throughout the evolution:
- Active checklist display
- Notes field per check
- Pass/Fail/Not Applicable status
- Submit report generation
- Copy report to clipboard
- Checklist version awareness
- Results persistence

These features are core to the development workflow and should not be removed or significantly altered.

## Near-Term Improvements

### Last Submitted Report
- Display the most recently submitted QA report
- Show feature name, version, timestamp
- Show pass/fail counts
- Show notes from each check
- Allow copying the report

### Copy Last Submission
- One-click button to copy the last submitted report
- Useful for quick sharing or documentation

### QA History
- Show list of all submitted QA reports
- Filter by feature, version, date
- Click to view historical report
- Export history as JSON

### Active QA Version Badge
- Display current active qaVersion prominently
- Show feature ID and feature name
- Indicate if checklist is archived

### Debug Checkpoint Summary
- Show current graph state summary
- Show active handleset status
- Show recent Playwright test results
- Show any runtime warnings/errors

## Future Agent Chat Capabilities

### Explain Current Graph State
- Summarize loaded graph
- Show node/edge counts
- Show community structure
- Show important nodes
- Explain current label/selection/hover state

### Summarize QA Failures
- Aggregate failed checks
- Identify common failure patterns
- Suggest likely root causes
- Recommend next actions

### Suggest Next Checklist
- Based on current state
- Based on recent changes
- Based on failure patterns
- Based on handleset status

### Inspect Handleset Status
- Show active handles
- Show partial handles
- Show planned handles
- Show handles requiring QA
- Show handleset audit summary

### Summarize Playwright Failures
- Aggregate Playwright test failures
- Identify flaky tests
- Suggest test fixes
- Recommend test additions

### Route to Local Agents/Tools
- Very late feature
- Requires local agent infrastructure
- Requires tool registry
- Requires agent routing system

## Architecture

### Current
```
QaPanel
  ├── qa-registry.ts (checklist definitions)
  ├── qa.store.ts (state persistence)
  └── qa.types.ts (type definitions)
```

### Future
```
MissionControl (collapsible)
  ├── Tab: Checklist (current QaPanel)
  ├── Tab: History (QA history viewer)
  ├── Tab: Debug (debug checkpoint summary)
  └── Tab: Agent Chat (future AI assistant)
      ├── Graph state explainer
      ├── QA failure summarizer
      ├── Checklist suggester
      ├── Handleset inspector
      └── Playwright failure summarizer
```

## Dependencies

- QA panel (current implementation)
- QA store (state persistence)
- QA registry (checklist definitions)
- Handleset documentation (for inspection)
- Playwright test results (for summarization)
- Graph state (for explanation)

## Risk Assessment

### Low Risk
- Adding Last Submitted Report view
- Adding Copy Last Submission button
- Adding QA history panel
- Adding active QA version badge
- Adding debug checkpoint summary

### Medium Risk
- Making panel collapsible (UI change)
- Adding tab system (UI change)
- Renaming to Mission Control (conceptual change)

### High Risk
- Agent Chat implementation (complex)
- Local agent routing (complex)
- AI-powered debugging (complex)

## Timeline

- Phase 1 (QA Panel Enhancements): 1-2 weeks
- Phase 2 (Mission Control Collapsible): 1 week
- Phase 3 (Agent Chat Integration): 2-3 weeks (very late)

## Notes

- This is documentation and architecture scaffolding only
- No implementation unless explicitly requested
- Manual QA overrides code inspection
- QA panel must remain functional during evolution
