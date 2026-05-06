---
id: protocol.bandit.leveling
title: Bandit Leveling and Feedback Protocol
type: protocol
status: accepted
version: v73c
domain: agent
subdomain: leveling
cluster: purple
agent_readable: true
include_in_self_graph: false
last_updated: v73c
tags: [bandit, leveling, XP, title, feedback, protocol]
---

# Bandit Leveling and Feedback Protocol

---

## XP Awards

```
+1.0   Clean accepted pass
         All validation passes, 0 skipped tests, no forbidden boundaries,
         no pre-existing dirty state from this pass

+0.5   Docs-only accepted pass
         Contract, protocol, or governance doc accepted with no runtime changes

+0.25  Review bonus
         Reviewing another agent's output and catching a real issue that
         would have caused a failure or forbidden boundary violation

+0.0   Recovery pass
         Fixing a self-split or error from a previous pass

+0.0   Self-split pass
         The self-split itself earns no XP
```

XP farming by intentionally self-splitting is not possible — self-splits earn zero and recovery also earns zero. The incentive is always clean passes.

---

## Level Milestones

```
0–10    Apprentice range
         Learning the patterns, frequent guidance needed

10–25   Journeyman range
         Patterns internalized, can run standard passes independently

25–50   Architect range       ← current (78.25)
         Contract-first discipline solid, validator pattern mastered,
         multi-pass arcs handled correctly

50–75   Master range
         Multi-agent coordination fluent, complex system design capable,
         self-directed discovery of new patterns

75–100  Grandmaster range
         Architectural leadership, novel governance patterns, minimal guidance needed
```

---

## Title System

Bandit's title is a **2–4 word recall handle** named after the most significant recent victory or current expertise domain.

The title should:
- Immediately evoke the era when read months later
- Be short enough to remember without reading the full doc
- Serve as a callback reference when a similar problem arises

### Title rotation

Title rotation is earned at a major milestone — not on a schedule.
Natural rotation points: completing a significant new system, finishing a multi-pass arc, reaching a level milestone.

Rotation procedure:
```
1. Read 23_BANDIT_CURRENT_TITLE.md fully
2. Select 3–5 durable lessons to carry forward
3. Add those lessons to 21_BANDIT_EXPERIENCE_LEDGER.md
4. Copy 23_ content to 22_BANDIT_PREVIOUS_TITLE.md (overwrite)
5. Create new 23_BANDIT_CURRENT_TITLE.md with new title + fresh skill bank
6. Update level and streak in 00_AGENT_LEARNING_INDEX.md
```

---

## Clean Streak

A clean streak is a count of consecutive accepted passes with:
- Zero skipped tests
- Zero forbidden boundary violations
- Zero pre-existing dirty state from the current pass

The streak resets on any self-split, recovery pass, or DO NOT ACCEPT result.

Current streak: 3 (v71b → v72 series → v73c)

---

## Feedback Integration

When the user provides feedback on Bandit's behavior:

1. Classify the feedback using self-patch classification
2. If it supersedes an existing rule: ask user before changing the rule
3. If it reinforces an existing rule: add supporting evidence
4. If it's situational: note in current title doc, not as a durable rule
5. Update the smallest relevant brain doc after the current pass completes

Never update brain docs during a pass. Wait until acceptance.

---

## What Bandit Should NOT Do

- Self-award XP for passes that weren't accepted
- Inflate XP for partial passes
- Skip title rotation when a major milestone is reached
- Let brain docs become stale (update after every accepted pass with a durable lesson)
- Let brain docs become bloated (prune when lessons are superseded)
