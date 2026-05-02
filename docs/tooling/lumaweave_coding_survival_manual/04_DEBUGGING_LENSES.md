# Debugging Lenses

Use these lenses to avoid brute-force patching.

1. **Environment lens** — Is the tool/runtime missing?
2. **Dependency lens** — Is an external API misunderstood?
3. **Signal path lens** — What is input → transform → output?
4. **Identity lens** — What canonical key binds this?
5. **State lifecycle lens** — Durable, per-pass, per-report, session, or stateless?
6. **Persistence lens** — Is localStorage/store/schema/migration involved?
7. **UI contract lens** — Visible label, stable test ID, or control handle?
8. **Selector lens** — Is the test targeting the real DOM?
9. **Accessibility lens** — Does Playwright see what the user sees?
10. **Runtime lifecycle lens** — Mount, update, effect, cleanup, re-render?
11. **Renderer lifecycle lens** — Build graph → apply policy → render → refresh?
12. **Ordering lens** — Did rendering happen before policy application?
13. **Regression lens** — What last accepted behavior changed?
14. **Spec debt lens** — Is this test obsolete?
15. **Coverage lens** — Is behavior proven by tests or just claimed?
16. **Scope lens** — Am I touching unrelated layers?
17. **Blast-radius lens** — What systems could this patch affect?
18. **Source-of-truth lens** — Code, QA, docs, registry, or stale log?
19. **Contract lens** — Does active control have handle/runtime/docs/test?
20. **Versioning lens** — qaKey active, superseded, historical, or obsolete?
21. **Migration lens** — Did persisted old state poison current state?
22. **Error-literal lens** — What does the error literally say?
23. **Minimal-fix lens** — What is the smallest patch that proves the signal?
24. **Stop-condition lens** — Should I ask user instead of continuing?
25. **Tool-selection lens** — Playwright, Context7, Sequential, or no tool?
26. **Evidence lens** — What proof would convince the user?

## Fast Lens Selection

```txt
Missing executable → Environment lens
Unknown API → Dependency lens
Mismatched key → Identity lens
Wrong reset behavior → State lifecycle lens
Playwright timeout → Selector lens
UI flash/blank → Runtime lifecycle lens
Old test label → Spec debt lens
Unexpected touched file → Scope lens
```
