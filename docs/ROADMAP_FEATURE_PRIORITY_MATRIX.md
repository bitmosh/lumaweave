# Feature Priority Matrix

## Overview

This matrix prioritizes features across all LumaWeave development chains, assessing their priority, phase, status, dependencies, and risk level.

## Matrix

| Feature | Chain | Priority | Phase | Status | Runtime change required? | Dependencies | Risk level | Recommended action |
|---------|--------|----------|-------|--------|-------------------------|-------------|------------|-------------------|
| Last Submitted QA Report | Mission Control | High | 1 | Planned | Yes (UI only) | QA panel, QA store | Low | Implement near term |
| Copy Last Submission | Mission Control | High | 1 | Planned | Yes (UI only) | QA panel, QA store | Low | Implement near term |
| QA history | Mission Control | High | 1 | Planned | Yes (UI + state) | QA panel, QA store | Low | Implement near term |
| Agent Chat / Mission Control | Mission Control | Medium | 2 | Planned | Yes (UI + state) | QA panel evolution, AI infrastructure | High | Scaffold only, implement very late |
| Theme preset dropdown | Theme System | High | 1 | Complete | Yes (UI + state) | Theme preset model, theme store | Medium | IMPLEMENTED (Phase 1A) |
| Save custom theme preset | Theme System | High | 1 | Planned | Yes (UI + state) | Theme preset model, theme store | Medium | Implement near term |
| Rename custom theme preset | Theme System | Medium | 1 | Planned | Yes (UI + state) | Theme preset model, theme store | Low | Implement near term |
| Graph-only theme editor | Theme System | Medium | 2 | Planned | Yes (UI + state) | Theme preset model, color picker | Medium | Implement after preset system |
| Full app theme editor | Theme System | Low | 3 | Planned | Yes (UI + state) | Graph-only theme editor, color picker | High | Implement very late |
| Pop-out color picker | Theme System | Low | 3 | Planned | Yes (UI) | Theme editor | Medium | Implement very late |
| Handleset TypeScript registry | Handleset | Medium | 1 | Planned | No (docs only) | Existing handleset docs | Low | Document only |
| Importantness weighting controls | Graph Intelligence | Low | 2 | Planned | Yes (UI + logic) | Edge confidence_score, weight data | Medium | Document only, implement later |
| Edge hover labels | Baseline B | High | 0 | Complete | Yes (implemented) | Graph label policy | Low | ACCEPTED - v7 |
| Label templates | Graph Intelligence | Low | 3 | Planned | Yes (UI + logic) | Label policy | High | Document only, implement very late |
| Source snippets | Graph Intelligence | Low | 3 | Planned | Yes (UI + logic) | Graph normalization | High | Document only, implement very late |
| Source linking | Graph Intelligence | Low | 3 | Planned | Yes (UI + logic) | Graph normalization | High | Document only, implement very late |
| Graph search/filter | Graph Intelligence | Low | 3 | Planned | Yes (UI + logic) | Graph state | Medium | Document only, implement later |
| Progressive depth slider | Graph Intelligence | Low | 2 | Planned | Yes (UI + logic) | Depth policy | Medium | Document only, implement later |
| Floating/resizable panels | Layout | Low | 3 | Planned | Yes (UI + state) | Layout system | High | Document only, implement very late |
| 3D/universe view | Graph Intelligence | Very Low | 4 | Planned | Yes (UI + renderer) | Stable 2D renderer | Very High | Document only, implement very late |

## Priority Levels

- **Very High:** Critical for baseline stability or user workflow
- **High:** Important for user experience or development efficiency
- **Medium:** Nice to have but not critical
- **Low:** Future enhancement
- **Very Low:** Distant future, may never be implemented

## Phase Definitions

- **Phase 0:** Baseline B Control Surface (stabilization)
- **Phase 1:** Near-term improvements (Mission Control, Theme presets)
- **Phase 2:** Medium-term features (Graph intelligence, Layout)
- **Phase 3:** Long-term features (Full theme editor, 3D)
- **Phase 4:** Very distant future (may never happen)

## Status Definitions

- **Complete:** Implemented and accepted
- **Planned:** Documented but not implemented
- **In Progress:** Currently being implemented
- **Blocked:** Waiting on dependency
- **Deprecated:** No longer planned

## Risk Levels

- **Low:** Simple implementation, low complexity, low chance of breaking changes
- **Medium:** Moderate complexity, some chance of breaking changes
- **High:** Complex implementation, high chance of breaking changes
- **Very High:** Very complex, high risk of breaking changes or major rework

## Recommended Actions

- **Implement near term:** Safe, high-priority features for immediate development
- **Scaffold only:** Document architecture but defer implementation
- **Implement later:** Implement after dependencies are met
- **Implement very late:** Implement only if explicitly requested
- **Document only:** Documentation only, no implementation planned

## Notes

- Edge hover labels are COMPLETE (accepted in v7)
- Baseline B Control Surface is NEAR STABLE
- Mission Control features are high priority for development efficiency
- Theme preset system is high priority for user customization
- Graph intelligence features are low priority and should be documented only
- 3D/universe view is very low priority and may never be implemented
