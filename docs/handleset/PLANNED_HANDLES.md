---
id: handleset.planned
title: Planned Handles
type: registry
status: accepted
version: v73c
domain: handleset
cluster: gold
agent_readable: true
include_in_self_graph: true
last_updated: v73c
tags: [handleset, planned, controls, future, architecture]
---

# Planned Handles

Controls that are documented but not yet implemented. Do not add source settings for planned handles unless explicitly requested.

---

## Layout

```
layout.leftRailMode       select: expanded | collapsed | hidden
layout.rightRailMode      select: expanded | collapsed | hidden
layout.topBarThemeSelector  links to appearance.theme
layout.layoutPreset       select: default | focus | debug | inspector | qa
```

---

## Mission Control

```
missionControl.enabled          boolean — show/hide panel
missionControl.mode             select: checklist | history | debug | agent-chat
missionControl.activeChecklistId  string — current QA checklist
missionControl.lastSubmittedReport  object — cached last report
missionControl.agentChatEnabled boolean — show Agent Chat tab (default: false)
```

---

## Theme

```
theme.activePreset           string — active preset ID
theme.customPresets          array — user-created presets
theme.exportFormat           select: json | css
```

---

## Graph Intelligence (Future)

```
graph.clusterGravity         number — cluster gravity strength
graph.communityColorEnabled  boolean — color nodes by community
graph.physicsDialect         select: helix | constellation | galaxy
```

---

## Performance

```
performance.maxNodes         number — max nodes to render (LOD)
performance.enableCulling    boolean — view frustum culling
performance.enableLOD        boolean — level of detail
```

---

## Audio (Future — Requires Promotion Contract)

```
audio.sourceType      select: synthetic | local-file | microphone (future)
audio.enabled         boolean — audio reactivity on/off
audio.channel.bass    number 0-1 — bass sensitivity
audio.channel.beat    number 0-1 — beat sensitivity
```

All audio handles require an explicit promotion contract before implementation.
