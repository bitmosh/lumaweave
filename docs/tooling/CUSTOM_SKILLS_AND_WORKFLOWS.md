# Custom Skills and Workflows v0

## Overview

This document defines custom skills and workflows for the Bandit Toolbelt. Skills encapsulate LumaWeave-specific knowledge and operations. Workflows capture repeated development patterns as reusable sequences.

## Skills

Skills are reusable capabilities that encapsulate LumaWeave-specific knowledge. They are implemented as MCP servers or as higher-level abstractions built on top of MCP servers.

### LumaWeave-Specific Skills

#### Skill: Large Bite Execution Skill
- **Purpose**: Execute a large bite (feature implementation) with full validation cycle
- **Inputs**: Bite description, files to modify, validation requirements
- **Step-by-step Workflow**:
  1. Read relevant files and understand context
  2. Plan implementation in phases
  3. Implement each phase incrementally
  4. Run typecheck after each phase
  5. Run Playwright tests after implementation
  6. Update QA checklist if needed
  7. Update documentation
  8. Create session log
- **Required Validation**: Typecheck must pass, Playwright must pass, QA checklist complete
- **Forbidden Actions**: No git push, no destructive operations, no writes outside workspace
- **Final Report Format**:
  ```markdown
  # Large Bite Execution Report
  
  ## Summary
  ## Files Changed
  ## Validation Results
  ## QA Checklist Status
  ## Issues Encountered
  ## Next Steps
  ```

#### Skill: QA Contract Authoring Skill
- **Purpose**: Author or update QA checklist entries for new features
- **Inputs**: Feature description, checklist key, version number
- **Step-by-step Workflow**:
  1. Read existing QA registry structure
  2. Identify relevant checks for feature
  3. Draft check entries with steps and expected results
  4. Add to qa-registry.ts
  5. Run typecheck
  6. Update handleset documentation if needed
- **Required Validation**: Typecheck must pass, no duplicate check IDs
- **Forbidden Actions**: No modification of existing checks without approval
- **Final Report Format**:
  ```markdown
  # QA Contract Authoring Report
  
  ## Checklist Key
  ## Checks Added
  ## Files Updated
  ## Validation Results
  ```

#### Skill: No Dead Controls Audit Skill
- **Purpose**: Audit control surface for dead controls (non-functional UI elements)
- **Inputs**: Control surface or feature area
- **Step-by-step Workflow**:
  1. Read control surface contract registry
  2. Read handleset documentation
  3. For each control in scope:
     - Verify UI element exists
     - Verify element is clickable/functional
     - Verify state updates correctly
     - Check QA coverage
     - Check Playwright coverage
  4. Generate gap report
  5. Update handleset documentation
- **Required Validation**: All controls verified, gaps documented
- **Forbidden Actions**: No modification of controls without approval
- **Final Report Format**:
  ```markdown
  # Dead Controls Audit Report
  
  ## Scope
  ## Controls Audited
  ## Dead Controls Found
  ## Coverage Gaps
  ## Recommendations
  ```

#### Skill: Theme Runtime Integrity Skill
- **Purpose**: Validate theme changes across all built-in themes
- **Inputs**: Theme change description or theme preset addition
- **Step-by-step Workflow**:
  1. Identify theme change
  2. Read theme token definitions
  3. Check token usage in components
  4. Verify all 4 themes (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin)
  5. Run Playwright theme tests
  6. Check haunted-observatory graph color is green
  7. Update theme documentation
- **Required Validation**: All 4 themes render correctly, Playwright tests pass
- **Forbidden Actions**: No modification of theme tokens without understanding impact
- **Final Report Format**:
  ```markdown
  # Theme Runtime Integrity Report
  
  ## Theme Change
  ## Tokens Modified
  ## Components Affected
  ## Theme Validation Results
  ## Playwright Test Results
  ```

#### Skill: Mission Control UX Skill
- **Purpose**: Validate Mission Control panel UX and functionality
- **Inputs**: Mission Control feature or change description
- **Step-by-step Workflow**:
  1. Read Mission Control implementation
  2. Verify all tabs are visible and functional
  3. Verify checklist navigation works
  4. Verify QA submission works
  5. Verify contract summary visible in Debug tab
  6. Verify layout remains readable with expanded content
  7. Run Playwright tests
- **Required Validation**: All tabs functional, navigation works, tests pass
- **Forbidden Actions**: No modification of Mission Control core structure
- **Final Report Format**:
  ```markdown
  # Mission Control UX Report
  
  ## Feature Tested
  ## Tabs Verified
  ## Navigation Verified
  ## Playwright Test Results
  ## Issues Found
  ```

#### Skill: Handleset Alignment Skill
- **Purpose**: Align handleset documentation with actual control implementation
- **Inputs**: Control ID or feature area
- **Step-by-step Workflow**:
  1. Read control surface contract registry
  2. Read handleset documentation (01_ACTIVE_HANDLES.md)
  3. Read actual control implementation
  4. Verify alignment (path, runtime binding, QA coverage)
  5. Update documentation if needed
  6. Update 06_HANDLES_REQUIRING_QA.md if coverage added
- **Required Validation**: Documentation matches implementation
- **Forbidden Actions**: No modification of control implementation
- **Final Report Format**:
  ```markdown
  # Handleset Alignment Report
  
  ## Control ID
  ## Documentation State
  ## Implementation State
  ## Alignment Status
  ## Updates Made
  ```

#### Skill: Playwright Coverage Expansion Skill
- **Purpose**: Add Playwright tests for uncovered controls or features
- **Inputs**: Control ID or feature description
- **Step-by-step Workflow**:
  1. Read handleset documentation to identify uncovered control
  2. Read existing test structure
  3. Design test with data-testid selectors
  4. Add test to appropriate test file
  5. Run test
  6. Fix selector or assertion issues
  7. Verify test passes
  8. Update handleset documentation
- **Required Validation**: Test passes, selectors stable, documentation updated
- **Forbidden Actions**: No modification of control implementation
- **Final Report Format**:
  ```markdown
  # Playwright Coverage Expansion Report
  
  ## Control ID
  ## Test Added
  ## Test File
  ## Validation Results
  ## Documentation Updated
  ```

#### Skill: Session Log / Handoff Skill
- **Purpose**: Create session log and prepare handoff for next conversation
- **Inputs**: Session summary, files changed, validation results
- **Step-by-step Workflow**:
  1. Collect tool usage evidence
  2. Collect file changes
  3. Collect validation results
  4. Generate session log markdown
  5. Write to `/docs/logs/sessions/`
  6. Generate handoff summary
  7. Identify next steps
- **Required Validation**: Session log complete, handoff clear
- **Forbidden Actions**: None
- **Final Report Format**:
  ```markdown
  # Session Log: [Task Name]
  
  ## Goal
  ## Files Changed
  ## What Changed
  ## Validation
  ## Issues
  ## Decision
  ## Next Step
  ```

#### Skill: Graph Interaction Regression Skill
- **Purpose**: Detect and prevent graph interaction regressions
- **Inputs**: Graph rendering or interaction change description
- **Step-by-step Workflow**:
  1. Read graph rendering implementation
  2. Identify interaction patterns (hover, click, drag, zoom)
  3. Run existing graph interaction tests
  4. Test new interaction if added
  5. Verify no regression in existing interactions
  6. Add test if new interaction
- **Required Validation**: No regressions, new interactions tested
- **Forbidden Actions**: No modification of graph core without validation
- **Final Report Format**:
  ```markdown
  # Graph Interaction Regression Report
  
  ## Change Description
  ## Interactions Tested
  ## Regression Status
  ## New Interactions
  ## Test Results
  ```

#### Skill: Advisory Proposal Skill
- **Purpose**: Generate and manage advisory proposals in Mission Control
- **Inputs**: Proposal topic or feature idea
- **Step-by-step Workflow**:
  1. Read advisory registry
  2. Generate proposal with title, summary, rationale
  3. Assess risk level
  4. Suggest next action
  5. Add to advisory registry
  6. Verify proposal renders in Advisory tab
- **Required Validation**: Proposal valid, renders correctly, no dead controls
- **Forbidden Actions**: No automatic implementation of proposals
- **Final Report Format**:
  ```markdown
  # Advisory Proposal Report
  
  ## Proposal Title
  ## Summary
  ## Rationale
  ## Risk Assessment
  ## Recommended Next Action
  ```

### Phase 1 Skills (v0)

#### Skill: LumaWeave File Navigator
- **Purpose**: Smart file finding with project structure awareness
- **Input**: File pattern, directory hint, feature context
- **Output**: File paths with relevance scores
- **Implementation**: Uses Filesystem MCP + grep + project structure knowledge
- **Knowledge**:
  - Knows LumaWeave directory structure (`src/app`, `src/graph`, `src/control-plane`, etc.)
  - Knows file naming conventions (`*.tsx`, `*.ts`, `*.spec.ts`)
  - Knows which directories are safe to modify
- **Operations**:
  - Find React components by feature name
  - Find test files by component name
  - Find configuration files by type
  - Find documentation by topic
- **Example**:
  ```
  Input: "theme selector component"
  Output: [
    { path: "src/app/AppShell.tsx", relevance: 0.9, reason: "Contains theme selector UI" },
    { path: "src/control-plane/settings/settings.store.ts", relevance: 0.7, reason: "Theme state management" }
  ]
  ```

#### Skill: TypeScript Validator
- **Purpose**: Run typecheck and interpret errors with LumaWeave context
- **Input**: File path or directory (optional)
- **Output**: Type errors with suggested fixes
- **Implementation**: Shell MCP + `npm run typecheck` + error parsing
- **Knowledge**:
  - Knows LumaWeave TypeScript configuration
  - Knows common type patterns in LumaWeave code
  - Knows how to interpret tsc errors
- **Operations**:
  - Run typecheck on entire project
  - Run typecheck on specific file
  - Parse tsc error output
  - Suggest fixes for common errors
- **Example**:
  ```
  Input: "src/control-plane/qa/QaPanel.tsx"
  Output: {
    passed: false,
    errors: [
      { line: 42, message: "Property 'x' does not exist", suggestion: "Check prop interface" }
    ]
  }
  ```

#### Skill: Playwright Test Runner
- **Purpose**: Run E2E tests and interpret failures
- **Input**: Test file pattern or test name (optional)
- **Output**: Test results with failure analysis
- **Implementation**: Shell MCP + `npm run qa:e2e` + Playwright MCP for screenshots
- **Knowledge**:
  - Knows LumaWeave test structure
  - Knows test ID conventions (`data-testid`)
  - Knows how to interpret Playwright errors
- **Operations**:
  - Run full test suite
  - Run specific test file
  - Run specific test by name
  - Capture screenshots on failure
  - Analyze failure context
- **Example**:
  ```
  Input: "contract-registry.spec.ts"
  Output: {
    passed: 28,
    failed: 1,
    failures: [
      { test: "v13 is default active checklist", error: "element not found", screenshot: "..." }
    ]
  }
  ```

#### Skill: Component Locator
- **Purpose**: Find React components by feature, role, or UI element
- **Input**: Component description or UI element description
- **Output**: Component file paths with role information
- **Implementation**: Filesystem MCP + AST analysis + grep
- **Knowledge**:
  - Knows LumaWeave component structure
  - Knows component naming conventions
  - Knows UI surface locations (topbar, graph, mission-control, settings)
- **Operations**:
  - Find component by feature name
  - Find component by UI role (button, dropdown, panel)
  - Find component by surface location
  - Find test file for component
- **Example**:
  ```
  Input: "theme selector dropdown"
  Output: [
    { path: "src/app/AppShell.tsx", role: "topbar", component: "ThemeSelector" }
  ]
  ```

### Phase 2 Skills (v1)

#### Skill: LumaWeave Graph Analyzer
- **Purpose**: Understand graph rendering pipeline and data flow
- **Input**: Graph rendering issue description
- **Output**: Analysis of graph pipeline with suggested fixes
- **Implementation**: Filesystem MCP + AST analysis + graph rendering knowledge
- **Knowledge**:
  - Knows SigmaGraphView implementation
  - Knows graph data flow (graph.json → normalization → rendering)
  - Knows theme token application to graph
  - Knows layout and physics configuration
- **Operations**:
  - Trace graph data from source to rendering
  - Identify where theme tokens are applied
  - Analyze layout configuration
  - Debug graph rendering issues
- **Example**:
  ```
  Input: "nodes not showing correct color"
  Output: {
    trace: [
      "graph.json → node.color field",
      "SigmaGraphView → nodeColorTokens mapping",
      "themeTokens.ts → theme-specific colors"
    ],
    suggestion: "Check theme token mapping in SigmaGraphView.tsx line 332"
  }
  ```

#### Skill: Theme System Expert
- **Purpose**: Understand LumaWeave theme system and Solar Plasma grammar
- **Input**: Theme change or issue description
- **Output**: Theme analysis with implementation guidance
- **Implementation**: Filesystem MCP + theme token knowledge
- **Knowledge**:
  - Knows theme token structure (nodeColorTokens, edgeColorTokens, etc.)
  - Knows Solar Plasma visual grammar (plasma, flares, constellations)
  - Knows theme switching mechanism
  - Knows glitter and reduce motion implementation
- **Operations**:
  - Analyze theme token usage across components
  - Identify missing theme tokens
  - Suggest theme-consistent styling
  - Debug theme switching issues
- **Example**:
  ```
  Input: "add new theme token for selected edge color"
  Output: {
    filesToUpdate: [
      "src/themes/themeTokens.ts (add edgeColorTokens.selected)",
      "src/graph/renderers/sigma2d/SigmaGraphView.tsx (apply token)"
    ],
    existingPattern: "nodeColorTokens.selected pattern in line 343"
  }
  ```

#### Skill: QA Checklist Runner
- **Purpose**: Navigate and validate QA checklists
- **Input**: Checklist key or feature name
- **Output**: Checklist status with validation results
- **Implementation**: Filesystem MCP + qa-registry.ts knowledge
- **Knowledge**:
  - Knows QA registry structure
  - Knows checklist versioning (v11, v12, v13)
  - Knows QA panel implementation
  - Knows submission and history flow
- **Operations**:
  - Find checklist by feature or version
  - Validate checklist completeness
  - Check QA coverage for feature
  - Generate QA report
- **Example**:
  ```
  Input: "mission-control-advisory-channel"
  Output: {
    checklistKey: "mission-control-advisory-channel-v13",
    totalChecks: 30,
    completedChecks: 0,
    coverage: "full"
  }
  ```

#### Skill: Control Surface Auditor
- **Purpose**: Validate control surface contracts
- **Input**: Control ID or surface location
- **Output**: Contract validation with gap analysis
- **Implementation**: Filesystem MCP + contract registry knowledge
- **Knowledge**:
  - Knows control surface contract structure
  - Knows contract registry implementation
  - Knows handleset documentation
  - Knows QA and Playwright coverage requirements
- **Operations**:
  - Find control by ID or location
  - Validate contract completeness
  - Check QA and Playwright coverage
  - Identify missing documentation
- **Example**:
  ```
  Input: "qa.advisoryTab"
  Output: {
    contract: { id: "qa.advisoryTab", surface: "missionControl", ... },
    coverage: { qa: "v13", playwright: "contract-registry.spec.ts" },
    gaps: []
  }
  ```

### Phase 3 Skills (v2+)

#### Skill: LumaWeave Refactoring Assistant
- **Purpose**: Safe multi-file refactoring with validation
- **Input**: Refactoring description (rename, extract, move)
- **Output**: Refactoring plan with validation steps
- **Implementation**: AST MCP + Filesystem MCP + TypeScript Validator
- **Knowledge**:
  - Knows LumaWeave code patterns
  - Knows safe refactoring practices
  - Knows dependency relationships
- **Operations**:
  - Plan multi-file rename
  - Plan component extraction
  - Plan file move with imports update
  - Validate refactoring with typecheck

#### Skill: Feature Slice Planner
- **Purpose**: Break down features into implementation slices
- **Input**: Feature description or epic
- **Output**: Slice plan with dependencies
- **Implementation**: Sequential Thinking MCP + project knowledge
- **Knowledge**:
  - Knows LumaWeave development patterns
  - Knows typical slice structure
  - Knows validation requirements
- **Operations**:
  - Break feature into slices
  - Identify slice dependencies
  - Estimate slice complexity
  - Generate slice checklist

#### Skill: Bug Trace Investigator
- **Purpose**: Follow signal paths to find root cause
- **Input**: Bug description or error
- **Output**: Signal trace with root cause hypothesis
- **Implementation**: AST MCP + Filesystem MCP + Sequential Thinking
- **Knowledge**:
  - Knows LumaWeave signal patterns
  - Knows common bug locations
  - Knows debugging strategies
- **Operations**:
  - Trace error from UI to source
  - Identify signal breaks
  - Generate root cause hypothesis
  - Suggest minimal fix

#### Skill: Documentation Generator
- **Purpose**: Auto-generate documentation from code
- **Input**: Component or feature description
- **Output**: Generated documentation
- **Implementation**: AST MCP + Filesystem MCP + documentation templates
- **Knowledge**:
  - Knows LumaWeave documentation structure
  - Knows component documentation patterns
  - Knows API documentation format
- **Operations**:
  - Generate component docs from props
  - Generate API docs from TypeScript types
  - Generate session log from tool usage
  - Update handleset documentation

## Workflows

Workflows are reusable sequences of operations that capture common development patterns. They are implemented as YAML files in `.windsurf/workflows/`.

### LumaWeave-Specific Workflows

#### Workflow: Glitter Tsunami Workflow
- **Trigger**: Adding or modifying glitter effects across the application
- **Steps**:
  1. Identify all components using glitter
  2. Read glitter toggle implementation
  3. Verify glitter state management
  4. Update glitter usage in affected components
  5. Test glitter on/off in all themes
  6. Run Playwright glitter tests
  7. Update documentation
- **Validation Commands**: `npm run typecheck`, `npm run qa:e2e`
- **Stop Conditions**: Typecheck fails, Playwright fails, glitter breaks in any theme
- **Output Format**:
  ```markdown
  # Glitter Tsunami Report
  
  ## Components Updated
  ## Theme Validation Results
  ## Playwright Test Results
  ## Issues Found
  ```

#### Workflow: Focused Bugfix Workflow
- **Trigger**: Bug report with clear reproduction steps
- **Steps**:
  1. Reproduce bug
  2. Read relevant code
  3. Trace signal path
  4. Identify root cause
  5. Apply minimal fix
  6. Run typecheck
  7. Run relevant Playwright tests
  8. Verify fix resolves issue
  9. Add test if needed
  10. Update documentation if needed
- **Validation Commands**: `npm run typecheck`, `npm run qa:e2e` (if applicable)
- **Stop Conditions**: Typecheck fails, regression introduced, fix doesn't resolve issue
- **Output Format**:
  ```markdown
  # Bugfix Report
  
  ## Bug Description
  ## Root Cause
  ## Fix Applied
  ## Validation Results
  ## Test Added
  ```

#### Workflow: QA Checklist Activation Workflow
- **Trigger**: New feature requires QA checklist
- **Steps**:
  1. Read existing QA registry structure
  2. Identify feature area
  3. Generate checklist entries
  4. Add to qa-registry.ts
  5. Run typecheck
  6. Update handleset documentation
  7. Update 06_HANDLES_REQUIRING_QA.md
- **Validation Commands**: `npm run typecheck`
- **Stop Conditions**: Typecheck fails, duplicate check IDs
- **Output Format**:
  ```markdown
  # QA Checklist Activation Report
  
  ## Checklist Key
  ## Checks Added
  ## Files Updated
  ## Validation Results
  ```

#### Workflow: Contract Registry Update Workflow
- **Trigger**: New control added or control modified
- **Steps**:
  1. Read control surface contract registry
  2. Add or update control contract
  3. Verify runtime binding information
  4. Update QA coverage information
  5. Update Playwright coverage information
  6. Update handleset documentation
  7. Run typecheck
- **Validation Commands**: `npm run typecheck`
- **Stop Conditions**: Typecheck fails, contract incomplete
- **Output Format**:
  ```markdown
  # Contract Registry Update Report
  
  ## Control ID
  ## Contract Changes
  ## Documentation Updated
  ## Validation Results
  ```

#### Workflow: Theme Preset Addition Workflow
- **Trigger**: Adding new theme preset
- **Steps**:
  1. Read theme token structure
  2. Define new theme tokens
  3. Add theme to theme selector
  4. Test theme in all components
  5. Run Playwright theme tests
  6. Update theme documentation
  7. Update handleset documentation
- **Validation Commands**: `npm run typecheck`, `npm run qa:e2e`
- **Stop Conditions**: Typecheck fails, Playwright fails, theme breaks in any component
- **Output Format**:
  ```markdown
  # Theme Preset Addition Report
  
  ## Theme Name
  ## Tokens Defined
  ## Components Tested
  ## Playwright Test Results
  ## Documentation Updated
  ```

#### Workflow: Mission Control Upgrade Workflow
- **Trigger**: Adding new tab or feature to Mission Control
- **Steps**:
  1. Read Mission Control implementation
  2. Design new tab or feature
  3. Implement UI changes
  4. Add data-testid attributes
  5. Verify layout remains readable
  6. Run Playwright tests
  7. Update QA checklist if needed
  8. Update documentation
- **Validation Commands**: `npm run typecheck`, `npm run qa:e2e`
- **Stop Conditions**: Typecheck fails, Playwright fails, layout breaks
- **Output Format**:
  ```markdown
  # Mission Control Upgrade Report
  
  ## Feature Added
  ## UI Changes
  ## Layout Validation
  ## Playwright Test Results
  ## QA Checklist Updated
  ```

#### Workflow: Graph Renderer Safe Patch Workflow
- **Trigger**: Bug fix or enhancement to graph renderer
- **Steps**:
  1. Read graph renderer implementation
  2. Understand current rendering pipeline
  3. Apply minimal patch
  4. Run typecheck
  5. Run graph interaction tests
  6. Verify no regression in existing interactions
  7. Add test if new interaction added
  8. Update documentation
- **Validation Commands**: `npm run typecheck`, `npm run qa:e2e`
- **Stop Conditions**: Typecheck fails, regression in graph interactions
- **Output Format**:
  ```markdown
  # Graph Renderer Safe Patch Report
  
  ## Change Description
  ## Patch Applied
  ## Interaction Tests
  ## Regression Status
  ## Test Added
  ```

#### Workflow: Documentation Sync Workflow
- **Trigger**: Code changes require documentation updates
- **Steps**:
  1. Identify which docs need updates
  2. Read existing documentation
  3. Update documentation with code changes
  4. Verify links and references
  5. Update handleset if controls changed
  6. Update QA registry if checks changed
  7. Run typecheck
- **Validation Commands**: `npm run typecheck` (if source files changed)
- **Stop Conditions**: Typecheck fails, broken links
- **Output Format**:
  ```markdown
  # Documentation Sync Report
  
  ## Code Changes
  ## Docs Updated
  ## Handleset Updated
  ## QA Registry Updated
  ## Validation Results
  ```

#### Workflow: Playwright Regression Workflow
- **Trigger**: Code changes that could break existing tests
- **Steps**:
  1. Identify affected test files
  2. Run full Playwright suite
  3. Analyze any failures
  4. Fix selectors or assertions if needed
  5. Re-run tests
  6. Verify all tests pass
  7. Update test documentation if selectors changed
- **Validation Commands**: `npm run qa:e2e`
- **Stop Conditions**: Tests fail, regression detected
- **Output Format**:
  ```markdown
  # Playwright Regression Report
  
  ## Test Files Run
  ## Failures Found
  ## Fixes Applied
  ## Final Test Results
  ```

#### Workflow: New Conversation Migration Workflow
- **Trigger**: Starting new conversation after completing work
- **Steps**:
  1. Review previous session log
  2. Collect files changed
  3. Collect validation results
  4. Generate handoff summary
  5. Identify next steps
  6. Create new session log entry
  7. Prepare context for new conversation
- **Validation Commands**: None
- **Stop Conditions**: None
- **Output Format**:
  ```markdown
  # Handoff Summary
  
  ## Previous Work
  ## Files Changed
  ## Validation Status
  ## Next Steps
  ## Context for New Conversation
  ```

### Phase 1 Workflows (v0)

#### Workflow: new-feature-slice
- **Purpose**: Implement a feature slice with validation
- **Steps**:
  1. Create feature branch (if git available)
  2. Read relevant files (component, types, tests)
  3. Implement slice changes
  4. Run typecheck
  5. Fix type errors
  6. Add/update tests
  7. Run Playwright tests
  8. Fix test failures
  9. Update documentation
  10. Create session log
  11. Commit changes (if git available)
- **Inputs**: Feature description, files to modify
- **Outputs**: Implemented slice, validation results, session log
- **Validation Gates**: Typecheck must pass, Playwright must pass
- **Location**: `.windsurf/workflows/new-feature-slice.md`

#### Workflow: typecheck-fix-loop
- **Purpose**: Iteratively fix TypeScript errors
- **Steps**:
  1. Run typecheck
  2. Parse errors
  3. For each error:
     - Analyze error context
     - Apply fix
     - Re-run typecheck
  4. Repeat until typecheck passes or max iterations reached
- **Inputs**: File path or directory
- **Outputs**: Fixed files, error log
- **Validation Gates**: Typecheck must pass
- **Location**: `.windsurf/workflows/typecheck-fix-loop.md`

#### Workflow: playwright-test-add
- **Purpose**: Add E2E test for new feature
- **Steps**:
  1. Identify feature to test
  2. Find existing test file or create new
  3. Add test with data-testid selectors
  4. Run test
  5. Fix selector or assertion issues
  6. Verify test passes
  7. Update handleset documentation
- **Inputs**: Feature description, test file path
- **Outputs**: Test file, updated documentation
- **Validation Gates**: Test must pass
- **Location**: `.windsurf/workflows/playwright-test-add.md`

#### Workflow: session-log-create
- **Purpose**: Create session log after work completion
- **Steps**:
  1. Collect tool usage evidence
  2. Collect file changes
  3. Collect validation results
  4. Generate session log markdown
  5. Write to `/docs/logs/sessions/`
- **Inputs**: Session summary, files changed
- **Outputs**: Session log file
- **Validation Gates**: None
- **Location**: `.windsurf/workflows/session-log-create.md`

### Phase 2 Workflows (v1)

#### Workflow: control-surface-audit
- **Purpose**: Audit control surface contracts
- **Steps**:
  1. Read contract registry
  2. Read handleset documentation
  3. For each control:
     - Verify contract completeness
     - Check QA coverage
     - Check Playwright coverage
     - Check documentation
  4. Generate gap report
  5. Update handleset documentation
- **Inputs**: Control ID or surface (optional)
- **Outputs**: Gap report, updated documentation
- **Validation Gates**: None
- **Location**: `.windsurf/workflows/control-surface-audit.md`

#### Workflow: theme-validation
- **Purpose**: Validate theme changes across all themes
- **Steps**:
  1. Identify theme change
  2. Check theme token definitions
  3. Check token usage in components
  4. Verify all 4 themes (solar-plasma, obsidian-aurora, haunted-observatory, glitter-goblin)
  5. Run Playwright theme tests
  6. Update theme documentation
- **Inputs**: Theme change description
- **Outputs**: Validation results, updated documentation
- **Validation Gates**: Playwright tests must pass
- **Location**: `.windsurf/workflows/theme-validation.md`

#### Workflow: qa-checklist-update
- **Purpose**: Add new QA checks to registry
- **Steps**:
  1. Identify feature to add checks for
  2. Find existing checklist version
  3. Generate new checks
  4. Add to qa-registry.ts
  5. Update handleset documentation
  6. Run typecheck
- **Inputs**: Feature description, checklist version
- **Outputs**: Updated qa-registry.ts, updated documentation
- **Validation Gates**: Typecheck must pass
- **Location**: `.windsurf/workflows/qa-checklist-update.md`

#### Workflow: graph-rendering-debug
- **Purpose**: Debug graph rendering issues
- **Steps**:
  1. Describe rendering issue
  2. Trace data from source to rendering
  3. Identify where issue occurs
  4. Apply minimal fix
  5. Validate fix
  6. Add test if needed
- **Inputs**: Rendering issue description
- **Outputs**: Fixed files, test (if added)
- **Validation Gates**: Typecheck must pass, Playwright tests must pass
- **Location**: `.windsurf/workflows/graph-rendering-debug.md`

### Phase 3 Workflows (v2+)

#### Workflow: safe-refactor
- **Purpose**: Multi-file refactoring with validation
- **Steps**:
  1. Describe refactoring
  2. Plan refactoring (files affected, changes needed)
  3. Apply changes
  4. Run typecheck
  5. Run Playwright tests
  6. Fix any issues
  7. Update documentation
  8. Commit changes
- **Inputs**: Refactoring description
- **Outputs**: Refactored files, validation results
- **Validation Gates**: Typecheck must pass, Playwright tests must pass
- **Location**: `.windsurf/workflows/safe-refactor.md`

#### Workflow: dependency-update
- **Purpose**: Update dependencies with safety checks
- **Steps**:
  1. Identify dependency to update
  2. Check current version
  3. Check latest version
  4. Review changelog
  5. Update package.json
  6. Run `npm install`
  7. Run typecheck
  8. Run Playwright tests
  9. Fix any breaking changes
- **Inputs**: Dependency name, version (optional)
- **Outputs**: Updated package.json, validation results
- **Validation Gates**: Typecheck must pass, Playwright tests must pass
- **Location**: `.windsurf/workflows/dependency-update.md`

#### Workflow: performance-audit
- **Purpose**: Audit performance bottlenecks
- **Steps**:
  1. Identify performance concern
  2. Profile component or feature
  3. Identify bottlenecks
  4. Suggest optimizations
  5. Apply optimizations
  6. Validate improvement
- **Inputs**: Performance concern description
- **Outputs**: Optimization report, optimized files
- **Validation Gates**: Typecheck must pass, Playwright tests must pass
- **Location**: `.windsurf/workflows/performance-audit.md`

#### Workflow: accessibility-audit
- **Purpose**: Audit accessibility compliance
- **Steps**:
  1. Identify component or feature
  2. Check ARIA labels
  3. Check keyboard navigation
  4. Check color contrast
  5. Run accessibility tests
  6. Fix issues
  7. Validate fixes
- **Inputs**: Component or feature description
- **Outputs**: Accessibility report, fixed files
- **Validation Gates**: Typecheck must pass, Playwright tests must pass, accessibility tests must pass
- **Location**: `.windsurf/workflows/accessibility-audit.md`

## Workflow File Format

Workflows are stored as YAML files in `.windsurf/workflows/` with the following format:

```yaml
---
description: Brief description of the workflow
---

## Steps

1. First step description
   // turbo (if safe to auto-run)
   Details of what to do in this step

2. Second step description
   Details of what to do in this step

## Inputs

- Input 1: Description
- Input 2: Description

## Outputs

- Output 1: Description
- Output 2: Description

## Validation Gates

- Gate 1: Description
- Gate 2: Description
```

## Skill Implementation Notes

### Skill Implementation Options

1. **MCP Server**: Implement as a custom MCP server (best for reusable tools)
2. **Function**: Implement as a function in a skill library (best for one-off operations)
3. **Workflow**: Implement as a workflow (best for multi-step operations)

### Skill Knowledge Storage

Skills can store knowledge in:
- Code (hardcoded patterns)
- Configuration files (JSON/YAML)
- Documentation (read at runtime)
- Memory MCP (v2+)

### Skill Testing

Skills should be tested by:
- Unit tests (if implemented as code)
- Integration tests (run in real environment)
- Manual testing (for complex operations)

## Workflow Execution

### Workflow Triggers

Workflows can be triggered by:
- User command (slash command in IDE)
- Automatic (based on file changes)
- Scheduled (for recurring tasks)
- Manual (user selects workflow)

### Workflow State

Workflows should track:
- Current step
- Inputs provided
- Outputs generated
- Validation results
- Errors encountered

### Workflow Recovery

Workflows should support:
- Pause/resume
- Step retry
- Error recovery
- Rollback on failure

## Future Enhancements

### Skill Enhancements

- Add more LumaWeave-specific knowledge
- Improve error handling and recovery
- Add skill composition (skills calling other skills)
- Add skill versioning

### Workflow Enhancements

- Add workflow templates
- Add workflow scheduling
- Add workflow dependencies
- Add workflow analytics

### Integration Enhancements

- Integrate with IDE features
- Add visual workflow editor
- Add workflow marketplace
- Add skill marketplace
