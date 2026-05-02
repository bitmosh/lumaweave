# MCP Server Candidates v0

## Overview

This document evaluates MCP (Model Context Protocol) servers for inclusion in the Bandit Toolbelt. Each candidate is assessed based on utility, risk, implementation complexity, and installation priority.

## Evaluation Criteria

- **Utility**: How useful is this server for LumaWeave development?
- **Risk**: What are the security/safety risks?
- **Complexity**: How complex is installation and configuration?
- **Priority**: v0 (immediate), v1 (near-term), v2+ (future), or Never

## Candidates by Category

### Filesystem Access

#### 1. Filesystem MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: High - essential for reading/writing code files
- **Risk**: Medium - file operations are powerful but can be constrained
- **Complexity**: Low - standard MCP server
- **Priority**: v0
- **Installation**: `npx @modelcontextprotocol/server-filesystem /home/boop/Projects/lumaweave`
- **Constraints**: Path-based allowlist, read/write/delete separation
- **Notes**: Core requirement for any code work. Must be configured with strict path constraints.

#### 2. Git MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: High - needed for git operations, commit history, diffs
- **Risk**: Medium - git operations can be destructive
- **Complexity**: Low - standard MCP server
- **Priority**: v1
- **Installation**: `npx @modelcontextprotocol/server-git`
- **Constraints**: Read-only by default, write operations require approval
- **Notes**: Read-only access to git history is safe. Write operations (add, commit) should require approval. Push/pull forbidden.

### Git Access

#### 3. GitHub MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Low - remote repo access not needed for local development
- **Risk**: High - could accidentally push/modify remote repo
- **Complexity**: Medium - requires GitHub token
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: Too risky for local development. All git work should be local. Remote access should be manual only.

### GitHub/Repo Management

#### 4. Repo Management MCP
- **Repository**: N/A - custom implementation would be needed
- **Utility**: Low - repo management is manual operation
- **Risk**: High - could accidentally delete/modify repos
- **Complexity**: High - custom implementation
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: Repo management should remain manual. No need for automated repo operations.

### Playwright/Browser Automation

#### 5. Playwright MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: High - essential for E2E testing and browser automation
- **Risk**: Low - browser automation is constrained to dev server
- **Complexity**: Medium - requires Playwright installation
- **Priority**: v0
- **Installation**: `npx @modelcontextprotocol/server-playwright`
- **Constraints**: Only localhost URLs, no external web access
- **Notes**: Critical for testing. Must be configured to only access localhost dev server.

### Sequential Thinking/Planning

#### 6. Sequential Thinking MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: High - essential for complex planning and reasoning
- **Risk**: None - internal state only, no external effects
- **Complexity**: Low - standard MCP server
- **Priority**: v0
- **Installation**: `npx @modelcontextprotocol/server-sequential-thinking`
- **Constraints**: None
- **Notes**: Critical for complex multi-step tasks. No safety concerns.

### Current Documentation Lookup

#### 7. Filesystem-based Documentation MCP
- **Repository**: Custom implementation
- **Utility**: High - needed for looking up LumaWeave docs
- **Risk**: Low - read-only access to docs
- **Complexity**: Medium - custom implementation
- **Priority**: v1
- **Installation**: Custom server for `/docs` directory
- **Constraints**: Read-only to `/docs`, write to `/docs/logs/sessions/` and `/docs/tooling/`
- **Notes**: Can use Filesystem MCP with path constraints as initial implementation. Custom server for better indexing later.

### Web Fetch/Research

#### 8. Fetch MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Medium - needed for researching dependencies, APIs
- **Risk**: High - uncontrolled web access
- **Complexity**: Low - standard MCP server
- **Priority**: v2+
- **Installation**: `npx @modelcontextprotocol/server-fetch`
- **Constraints**: URL allowlist, rate limiting (10 requests/session)
- **Notes**: Too risky for v0-v1. Implement in v2+ with strict allowlist (npmjs.com, github.com, mdn.io).

#### 9. Brave Search MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Low - web search not critical for local development
- **Risk**: High - uncontrolled web access
- **Complexity**: Medium - requires API key
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: Web search is not needed for local development. Documentation should be local.

### AST/Code Intelligence

#### 10. AST MCP
- **Repository**: Custom implementation
- **Utility**: High - needed for code analysis, refactoring
- **Risk**: Low - read-only code analysis
- **Complexity**: High - custom implementation
- **Priority**: v1
- **Installation**: Custom server using TypeScript compiler API
- **Constraints**: Read-only analysis only, no writes
- **Notes**: Complex to implement. Start with Filesystem MCP + grep, upgrade to AST MCP in v1.

#### 11. Code Intelligence MCP
- **Repository**: https://github.com/modelcontextprotocol/servers (if available)
- **Utility**: Medium - code completion, analysis
- **Risk**: Low - read-only analysis
- **Complexity**: High - requires language server integration
- **Priority**: v2+
- **Installation**: Not available yet, would need custom implementation
- **Constraints**: Read-only analysis only
- **Notes**: Not available as standard MCP server. Would require custom LSP integration. Park for v2+.

### Graph/Dependency Analysis

#### 12. Dependency Analysis MCP
- **Repository**: Custom implementation
- **Utility**: Medium - needed for understanding dependencies
- **Risk**: Low - read-only analysis
- **Complexity**: High - custom implementation
- **Priority**: v2+
- **Installation**: Custom server using dependency-cruiser or similar
- **Constraints**: Read-only analysis only
- **Notes**: Can use `npm list` or `dependency-cruiser` via Shell MCP initially. Custom server for v2+.

### Local Database Access

#### 13. SQLite MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Low - LumaWeave doesn't use local database
- **Risk**: Medium - database operations can be destructive
- **Complexity**: Medium - standard MCP server
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: LumaWeave doesn't use local database. Not needed.

#### 14. PostgreSQL MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Low - LumaWeave doesn't use PostgreSQL
- **Risk**: Medium - database operations can be destructive
- **Complexity**: Medium - standard MCP server
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: LumaWeave doesn't use PostgreSQL. Not needed.

### Design-System/Figma Access

#### 15. Figma MCP
- **Repository**: https://github.com/modelcontextprotocol/servers
- **Utility**: Low - Figma not used for LumaWeave
- **Risk**: High - external API access
- **Complexity**: High - requires Figma token
- **Priority**: Never
- **Installation**: Not recommended
- **Constraints**: N/A
- **Notes**: Figma not used for LumaWeave. Not needed.

### Memory/Project Knowledge

#### 16. Memory MCP
- **Repository**: Custom implementation
- **Utility**: High - needed for project knowledge persistence
- **Risk**: Low - isolated memory store
- **Complexity**: Medium - custom implementation
- **Priority**: v2+
- **Installation**: Custom server using SQLite or file-based storage
- **Constraints**: Isolated to LumaWeave project only
- **Notes**: Can use session logs as initial memory. Custom memory server for v2+.

### Shell/Command Execution

#### 17. Shell MCP
- **Repository**: Custom implementation
- **Utility**: High - needed for running npm, playwright, git commands
- **Risk**: Very High - arbitrary command execution
- **Complexity**: Medium - custom implementation
- **Priority**: v2+
- **Installation**: Custom server with strict allowlist
- **Constraints**: Allowlist only: `npm run typecheck`, `npm run qa:e2e`, `npx playwright install`
- **Notes**: Too dangerous for v0-v1. Implement in v2+ with strict allowlist. Block `rm -rf`, `sudo`, package installs.

## Installation Summary

### v0 (Immediate)
1. Filesystem MCP - with path constraints
2. Sequential Thinking MCP - no constraints needed
3. Playwright MCP - with URL constraints (localhost only)

### v1 (Near-term)
4. Git MCP - read-only, write with approval
5. Documentation MCP - read-only core docs, write logs
6. AST MCP - custom implementation for code analysis

### v2+ (Future)
7. Fetch MCP - with URL allowlist and rate limiting
8. Memory MCP - custom implementation for project knowledge
9. Shell MCP - with strict command allowlist

### Never
- GitHub MCP
- Repo Management MCP
- Brave Search MCP
- SQLite MCP
- PostgreSQL MCP
- Figma MCP

## Configuration Examples

### Filesystem MCP Configuration
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/home/boop/Projects/lumaweave"
      ]
    }
  }
}
```

### Playwright MCP Configuration
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-playwright"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true"
      }
    }
  }
}
```

### Sequential Thinking MCP Configuration
```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

### Git MCP Configuration (v1)
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-git"],
      "cwd": "/home/boop/Projects/lumaweave"
    }
  }
}
```

## Risk Mitigation

### Path Constraints
- All file operations constrained to `/home/boop/Projects/lumaweave`
- Write operations constrained to `src/`, `docs/`, `tests/`
- Delete operations require explicit approval

### Command Constraints
- Shell MCP uses allowlist only
- Forbidden: `rm -rf`, `sudo`, package manager installs
- Git commands via Git MCP only, not Shell MCP

### URL Constraints
- Playwright MCP only allows localhost URLs
- Fetch MCP uses allowlist (npmjs.com, github.com, mdn.io)
- Rate limiting: 10 requests per session

### Approval Workflow
- Write operations require explicit approval
- Delete operations require explicit approval
- Git write operations require explicit approval

## Alternatives Considered

### Using IDE Built-in Tools
- **Pros**: No installation needed, already integrated
- **Cons**: Not accessible to Bandit agent, limited automation
- **Decision**: Use MCP servers for Bandit, IDE tools for manual work

### Using CLI Scripts
- **Pros**: Full control, no MCP overhead
- **Cons**: Harder to integrate with Bandit, no standard protocol
- **Decision**: Use MCP servers for standardization

### Using Custom Servers Only
- **Pros**: Full control, tailored to LumaWeave
- **Cons**: More maintenance, missing community features
- **Decision**: Use standard MCP servers where available, custom for LumaWeave-specific needs
