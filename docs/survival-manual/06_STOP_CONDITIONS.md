---
id: manual.stop.conditions
title: Stop Conditions
type: manual
status: accepted
version: v73c
domain: survival-manual
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [stop, conditions, self-split, survival]
---

# Stop Conditions

Stop conditions are not failures. They are the correct response to situations where continuing would make things worse. Using them is discipline, not defeat.

---

## Hard Stop Conditions (Immediate — No Exceptions)

Stop immediately and report when any of these occur:

```
1. The same failure has occurred 3 times with 3 genuinely distinct strategies
   → Self-split protocol. Back out. Debug report. Wait.

2. More than 5 Playwright failures appear simultaneously
   → Cascade. Classify shared root. Do not patch individually.

3. The fix requires touching files outside the explicitly defined scope
   → Scope creep. Report why before expanding.

4. The fix would cross a forbidden boundary
   → Contract required. Never cross without one.

5. Another agent has modified a file you need and changes conflict
   → Multi-agent collision. Report both states. Human resolves.

6. The active QA key cannot be determined with confidence
   → QA key uncertainty. Stop. Verify with user before touching QA bundle.

7. Repo is in a dirty state that can't be explained by this pass
   → Pre-existing dirty state. Report it. Do not commit on top of unknown changes.
```

---

## Soft Stop Conditions (Pause and Ask)

Pause and ask the user before continuing when:

```
- Something unexpected appeared in git diff
- A file you didn't intend to touch appears changed
- A test that was passing is now failing with no related change
- The fix seems to require a structural change to a shared system
- You're not sure whether a QA key rotation is needed
- You've been working for a while with no acceptance checkpoint
- The next step feels risky and you're not sure it's in scope
```

---

## What to Do When You Stop

```
1. Back out any uncommitted changes if safe to do so
2. Report current state clearly (what failed, what was tried, what's dirty)
3. Wait for user direction
4. Do not make "small cleanup" changes while waiting
5. Do not speculate further without new information
```

---

## What "Stop" Does NOT Mean

- It does not mean the pass failed permanently
- It does not mean XP is lost (recovery passes earn +0, but clean passes after recovery earn full XP)
- It does not mean something is wrong with the project
- It means the situation needs human judgment before continuing

---

## Quest Mode Stop Conditions

In Quest Mode (multi-sub-pass sequences), hitting a stop condition in any sub-pass stops the entire quest. The quest does not automatically resume. Explicit human authorization is required before continuing.
