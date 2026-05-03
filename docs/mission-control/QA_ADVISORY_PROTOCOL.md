# QA Advisory Protocol

## Overview

This protocol defines how QA advisory questions, proposals, and backlog should be managed across different passes to ensure feedback loops remain current and relevant.

## Canonical QA Key Tags

**Rule:** Each QA set has a unique canonical `qaKey` that binds together all identity surfaces.

**Version Tag Model:**
- Major QA identity family: v17, v18, v19, etc.
- Sub-pass tags within a family: v17a, v17b, v17c, etc.
- Sub-pass tags are used for repair or continuation passes inside a major family
- Move to next major tag (v18) when starting a new major topic/family

**Implementation:**
- `qaKey` is the canonical binding key (e.g., "v17", "v17a", "v18", "v18a")
- For normal sequential QA passes, `qaKey` should equal the user-facing version tag
- Sub-pass tags (v17a, v17b) are used for repair/continuation within the v17 family
- `featureId` can remain descriptive, but it is not the primary selector key
- `qaVersion` can remain numeric, but it is not enough by itself
- Dropdown values should use `qaKey`
- Header badge should display `qaKey`
- Submitted report should include `Checklist Key: <qaKey>` or `Checklist Key: <featureId>:<qaKey>` only if both are guaranteed derived from the same object
- Report must include `Advisory Set Key: <qaKey>`
- Advisory Questions must be selected by `qaKey`
- Copy Last Submission must use the same `qaKey`
- QA history entries must store the same `qaKey`

**Preferred display format:**
```
# QA Report — QA Key Binding Recovery v17a

**Checklist Key:** v17a
**Advisory Set Key:** v17a
```

**Acceptable alternative (if more context is needed):**
```
**Checklist Key:** qa-key-binding-recovery-v17a:v17a
**Advisory Set Key:** v17a
```

**Critical requirement:** Dropdown, header, checklist, and advisory must all derive from the same active checklist object.

**Stale localStorage handling:**
- Stale localStorage keys are ignored if the `qaKey` is unknown
- When a new checklist is created with a higher version, it should become the default
- Version comparison should use numeric `qaVersion`, not string comparison

**Identity drift:**
- Identity drift is a hard blocker
- Submission is blocked when active checklist and advisory set keys disagree
- Debug tab displays identity diagnostics for troubleshooting

**Bandit Questions:**
- Bandit Questions are keyed by `qaKey`
- Questions rotate per `qaKey` (per checklist)
- Stale questions are hidden when a new `qaKey` becomes active

**Durable state:**
- Proposal decisions and backlog order are durable unless intentionally changed
- These should persist across `qaKey` changes
- Do not erase durable proposal/backlog state when `qaKey` changes
- Do not use empty proposals/backlog as a way to avoid test failures

**Type definitions:**
```typescript
export interface QaCheckDefinition {
  id: string;
  featureId: string;
  featureName: string;
  qaVersion: number;
  qaKey?: string; // Canonical QA key tag (e.g., "v17", "v18")
  title: string;
  expected: string;
  steps: string[];
  required: boolean;
  fallbackAllowed?: boolean;
  active?: boolean;
  archived?: boolean;
}

// Adapter function to derive canonical qaKey from checklist definition
export function getChecklistIdentity(checklist: QaCheckDefinition): {
  qaKey: string;
  featureId: string;
  qaVersion: number;
} {
  const qaKey = checklist.qaKey ?? `v${checklist.qaVersion}`;
  return {
    qaKey,
    featureId: checklist.featureId,
    qaVersion: checklist.qaVersion,
  };
}
```

**Advisory lookup:**
```typescript
// Advisory lookup function keyed by canonical qaKey
export function getAdvisoryForQaKey(qaKey: string): BanditAdvisorySection {
  // v17 has its own advisory set
  if (qaKey === "v17") {
    return advisoryV16e;
  }
  
  // v18 (v16c) has its own advisory set
  if (qaKey === "v18") {
    return advisoryV16c;
  }
  
  // v16 (v16d) has its own advisory set
  if (qaKey === "v16") {
    return advisoryV16d;
  }
  
  // Fallback to small clearly-labeled fallback for unknown qaKeys
  return {
    questions: [
      {
        id: "fallback-no-advisory",
        prompt: "No advisory questions found for this QA key",
        context: `The QA key "${qaKey}" does not have specific advisory questions configured.`,
        responseType: "choice",
        userResponse: "",
        status: "unanswered",
      },
    ],
    proposals: [],
    backlog: [],
  };
}
```

## Checklist Identity Rule

**Requirement:** Header badge, dropdown selected value, checklist content, submitted report key, and advisory content must all come from the same active checklist.

**Implementation:**
- `activeQaKey` in QaPanel is the canonical selector
- `activeChecklistKey` is set to `activeQaKey` (canonical format: vXX, e.g., v17a)
- `getAdvisoryForQaKey(qaKey)` returns advisory content for that exact qaKey
- If these disagree, QA is invalid and submission is blocked

**Identity validation (v17 family and later):**
- Submit-time validation checks that all identity surfaces agree on the canonical `qaKey`
- If mismatch detected: block submission, show error, do not create report, do not update history

### Manual QA Evidence Policy (v27a correction)

- QA checks must be executable by **one** of the following evidence paths:
  1. Clicking or observing the LumaWeave app UI directly.
  2. Reading an in-app QA Debug readout (e.g., Mission Control Debug tab entries).
  3. Citing automated Playwright evidence that already exercises the behavior.
- Do **not** require engineers to paste JavaScript into DevTools unless the user explicitly asks for a console-driven workflow.
- When a Playwright spec covers the behavior, the checklist steps should reference that spec (and the `npm run qa:e2e` command) instead of manual scripting instructions.
- Use this policy for all future checklist updates to keep QA evidence reproducible and free of ad-hoc DevTools snippets.
- See `docs/lumaweave_bandit_brain_packet/docs/agent-learning/09_QA_PLAYWRIGHT_EVIDENCE_POLICY.md` for the canonical Bandit brain rules that must be mirrored in new QA passes.

## Bandit Questions

**Rule:** Bandit Questions are per-pass/per-checklist, not static forever.

**Implementation:**
- Each QA checklist may define its own advisory question set via `advisory-registry.ts`
- New implementation/repair passes should get fresh questions relevant to that pass
- Old questions may only be reused intentionally
- `getAdvisoryForChecklist(featureId, version)` returns the appropriate advisory for the current checklist

**Question derivation sources (for future AI generation):**
- Files changed in the current pass
- Final report from the current pass
- Unresolved risks from previous passes
- Manual QA notes from the current pass
- Newly introduced controls
- Changed behavior
- Next recommended bite

**Current implementation (v0):**
- Registry-driven static question sets per checklist
- No AI generation yet
- Manual question authoring per checklist

## Persistent vs Per-Run State

### Reset After Submit Report

**These fields reset to initial/empty state:**
- Checklist statuses (via `resetChecklistResults`)
- Checklist notes
- Bandit Question answer text (`userResponse`)
- Bandit Question status (`status`)
- Per-run proposal notes (`userNotes`), if report-specific

**Implementation:**
- In QaPanel.tsx `submitQaReport` function (lines 335-362)
- Clear localStorage key `lumaweave-advisory-question-answers`

### Preserve After Submit Report

**These fields persist across reports:**
- Backlog order (not reset)
- Proposal decisions (`userDecision`)
- Accepted/deferred/rejected roadmap decisions
- Proposal statuses

**Implementation:**
- In QaPanel.tsx `submitQaReport` function (lines 335-362)
- Backlog order preserved via localStorage key `lumaweave-advisory-backlog-order`
- Proposal decisions preserved by not resetting `userDecision` field

## Stable Questions

**Rule:** Keep every checklist:

**Required checks in every checklist:**
- Typecheck passes
- Playwright passes

**Do not keep stale product/design questions unless still relevant.**

**Implementation:**
- Typecheck and Playwright checks should be included in every new checklist
- Product/design questions should be specific to the current pass
- When a new checklist is created, review old questions and only reuse if still relevant

## Advisory Set Identification

**Requirement:** QA reports should make it obvious which advisory question set was used.

**Implementation:**
- Report includes `Checklist Key: ${activeFeatureId}:v${activeQaVersion}`
- Future enhancement: Add explicit "Advisory Set Key" or "Advisory Version" field
- Future enhancement: Include advisory content metadata in report (question count, proposal count)

## Future Bandit Question Generation Protocol

**For future AI-driven question generation:**

1. **Input sources:**
   - Final report from current pass
   - Changed files list
   - Unresolved risks from previous passes
   - Manual QA notes
   - Newly introduced controls
   - Changed behavior
   - Next recommended bite

2. **Question types:**
   - Validation: Does X work as expected?
   - Decision: Should we do Y?
   - Risk: Is Z a concern?
   - Next step: What should we do next?

3. **Question lifecycle:**
   - Generated per pass
   - Stored per checklist
   - Not reused across passes unless intentionally
   - Stale questions hidden when new checklist becomes active

4. **Question persistence:**
   - Question definitions stored in advisory registry (current v0)
   - Question answers reset after submit
   - Question decisions persist if applicable

## Implementation Checklist

For each new checklist:

- [ ] Create checklist entry in `qa-registry.ts` with unique `featureId` and `qaVersion`
- [ ] Set `active: true` on new checklist
- [ ] Create advisory content in `advisory-registry.ts` for the new checklist
- [ ] Update `getAdvisoryForChecklist` to handle the new checklist
- [ ] Include Typecheck and Playwright checks
- [ ] Include pass-specific product/design questions
- [ ] Test that dropdown selects new checklist as default
- [ ] Test that report key matches checklist key
- [ ] Test that advisory questions are specific to new checklist
- [ ] Test that old questions do not appear
- [ ] Test that question answers reset after submit
- [ ] Test that proposal decisions persist
- [ ] Test that backlog order persists

## Future Checklist Granularity Policy

**Rule:** Protocol repair checklists may use compact bundled checks only when explicitly justified. Normal feature/repair passes should use granular checks.

**Implementation:**
- Protocol-focused checklists (like v16d, v16e) may use a single bundled check when the pass is primarily about protocol validation
- Normal feature/repair passes should use multiple granular checks covering different aspects of the feature
- Typecheck and Playwright checks remain mandatory in all checklists
- Advisory questions should be pass-specific and relevant to the current work
- Checklist identity drift is a hard blocker - submission must be blocked when identity surfaces disagree

**Justification for compact checklists:**
- Protocol validation passes that test system-wide behavior rather than feature-specific implementation
- Emergency hotfix checklists where rapid verification is prioritized over granular coverage
- Meta-QA passes that validate the QA system itself

**Granular checklist requirements:**
- Feature implementation passes should have multiple checks covering:
  - Core functionality
  - Edge cases
  - Error handling
  - Integration points
  - Performance considerations
  - Accessibility (if applicable)

## Anti-Patterns

**Do not:**
- Reuse old advisory questions across multiple passes without review
- Hardcode v15 or any specific version as default in QaPanel initialization
- Allow localStorage stale values to override newer active checklists
- Use same featureId for different passes (use unique featureId per major pass)
- Fall back to generic v13 questions for new checklists (create specific questions)
- Erase durable proposal decisions on submit
- Erase durable backlog order on submit
- Use compact bundled checklists for normal feature passes without explicit justification
- Allow checklist identity drift to pass without blocking submission

**Do:**
- Create unique featureId for each major pass
- Create specific advisory questions for each checklist
- Use numeric qaVersion for version comparison
- Auto-select newest active checklist as default
- Preserve proposal decisions across submits
- Preserve backlog order across submits
- Reset question answers after submit
- Include Typecheck and Playwright in every checklist
