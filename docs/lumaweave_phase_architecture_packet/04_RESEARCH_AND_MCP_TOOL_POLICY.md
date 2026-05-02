# Research and MCP Tool Policy

## Use Research When Unsure About

- Sigma label rendering options
- Sigma reducers / attributes / settings
- Playwright selectors / screenshots / traces
- Zustand persist / hydration behavior
- React effect lifecycle
- TypeScript architecture patterns
- design token structure
- testing strategy

## Source Priority

1. Official docs
2. Installed package types/source
3. Maintainer examples
4. High-quality community examples
5. Blogs/forums only if official sources are insufficient

## Tooling Direction

Prefer local, scoped tooling:

- Playwright browser tests
- filesystem/repo search
- Git diff/status
- official docs/web search
- browser screenshots
- package type inspection

## Research Report Requirement

If Bandit uses research, it should report:

1. what question it researched
2. what source answered it
3. what decision changed because of the research
