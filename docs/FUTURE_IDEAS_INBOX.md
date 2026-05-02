# Future Ideas Inbox

## Purpose

Prevent future ideas from exploding into many speculative files. This is a concise inbox for future feature concepts.

---

## Cluster Gravity / Color-Coded Neighborhoods

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Important nodes/edges act as gravity centers. Graph distance, relationship strength, degree, weight, confidence, or importance score define boundaries. Clusters/neighborhoods receive color identities. Overlaps can blend, stripe, prioritize strongest gravity, or show mixed halos.  
**Dependencies:** Importantness/weighting model, handleset registry, theme token system, stable depth/neighborhood traversal, cluster color tokens.  
**Do-not-implement-until:** Stable integer depth/neighborhood traversal is proven, and theme token system is implemented.

---

## Progressive Depth Slider

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Decimal depth slider allowing fine-grained neighborhood control (e.g., 1.5, 2.7) instead of integer-only depth.  
**Dependencies:** Stable integer depth/neighborhood traversal, depth computation refactoring.  
**Do-not-implement-until:** Integer depth is stable and proven with repeated runs.

---

## Agent Chat / Mission Control v2

**Status:** planned  
**Phase:** Mission Control  
**Summary:** AI-assisted debugging and QA workflow integration. Agent Chat tab can explain graph state, summarize QA failures, suggest next checklist, inspect handleset status, summarize Playwright failures, route to local agents/tools.  
**Dependencies:** AI infrastructure, local agent routing, agent prompt engineering.  
**Do-not-implement-until:** AI infrastructure is ready and local agent routing is proven.

---

## Full Theme Editor

**Status:** planned  
**Phase:** Theme System  
**Summary:** Graph-only or full-app theme editor with pop-out color picker, custom preset creation, save/rename/delete/export/import functionality.  
**Dependencies:** Theme preset model, color picker, graph visual token system.  
**Do-not-implement-until:** Theme preset model and graph-only theme editor are implemented and stable.

---

## Graph Search / Filter

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Search nodes/edges by label, attribute, or metadata. Filter by type, community, confidence, importance, or custom criteria.  
**Dependencies:** Graph normalization, attribute indexing, search UI.  
**Do-not-implement-until:** Graph normalization is stable and attribute system is proven.

---

## Label Template System

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Configurable label templates for different node/edge types, communities, or importance levels. Templates can include metadata, confidence scores, or custom formatting.  
**Dependencies:** Label policy refactoring, template engine, metadata system.  
**Do-not-implement-until:** Label modes are stable and metadata system is implemented.

---

## Source Snippet Labels

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Show code snippets inline or on hover for nodes/edges, linked to source files and line ranges.  
**Dependencies:** Source linking, graph normalization with source metadata, snippet extraction.  
**Do-not-implement-until:** Source linking is implemented and graph normalization includes source metadata.

---

## Source Linking / Open in Editor

**Status:** planned  
**Phase:** Graph Intelligence  
**Summary:** Click node/edge to open source file in editor at correct line range. Bidirectional linking between graph and code.  
**Dependencies:** Graph normalization with source metadata, editor integration (VS Code, etc.).  
**Do-not-implement-until:** Graph normalization includes source metadata and editor integration is proven.

---

## 3D / Universe View

**Status:** very-low-priority  
**Phase:** Graph Intelligence  
**Summary:** Three-dimensional graph visualization with spatial layout, orbital mechanics, and universe/simulation modes.  
**Dependencies:** Stable 2D renderer, Three.js/React Three Fiber, physics engine, spatial layout algorithms.  
**Do-not-implement-until:** 2D renderer is stable and mature, and explicit user demand exists.
