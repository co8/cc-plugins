# Agent Dispatch Protocol

Centralized mapping of agent roles to Claude Code `subagent_type` values. Use this reference when writing AGENT_SWARM_SPEC.md and when dispatching agents during execution.

## Subagent Type Reference

### Planning & Exploration

| Subagent Type | Purpose | Use When |
|--------------|---------|----------|
| `Explore` | Fast codebase exploration — find files, search code, answer architecture questions | Need to quickly understand codebase structure, find patterns, locate files |
| `Plan` | Design implementation strategies, identify critical files, consider trade-offs | Need to plan before implementing, evaluate approaches |
| `feature-dev:code-explorer` | Deep codebase analysis — trace execution paths, map layers, document dependencies | Need thorough understanding of how a feature works end-to-end |
| `feature-dev:code-architect` | Design feature architectures using existing patterns, provide implementation blueprints | Need to design a new feature with specific files, components, data flows |

### Implementation

| Subagent Type | Purpose | Use When |
|--------------|---------|----------|
| `general-purpose` | Default agent for coding tasks — can read, write, edit, search, run commands | Implementing features, fixing bugs, writing code |
| `code-simplifier` | Simplify and refine code for clarity while preserving functionality | After writing code, want to clean it up |

### Review Team

| Subagent Type | Purpose | Use When |
|--------------|---------|----------|
| `feature-dev:code-reviewer` | Review for bugs, logic errors, security, code quality, project conventions | Primary code review — catches most issues |
| `pr-review-toolkit:code-reviewer` | Review against project guidelines, style guides, best practices | Checking adherence to CLAUDE.md and project standards |
| `pr-review-toolkit:silent-failure-hunter` | Find silent failures, swallowed errors, inadequate error handling, bad fallbacks | Code has try/catch, fallback logic, error handling |
| `pr-review-toolkit:type-design-analyzer` | Analyze type encapsulation, invariant expression, design quality | New types introduced or existing types modified |
| `pr-review-toolkit:comment-analyzer` | Check comment accuracy, completeness, potential for comment rot | Documentation or comments added/modified |
| `pr-review-toolkit:code-simplifier` | Simplify recently modified code for clarity and maintainability | After any coding task to reduce complexity |
| `pr-review-toolkit:pr-test-analyzer` | Review test coverage quality, identify gaps in test suite | After tests written, before merge |

---

## Dispatch Patterns

### Pattern 1: Parallel Review Team

Launch all reviewers in a **single message** — they have no dependencies on each other.

```
// In a single assistant message, include ALL of these Agent tool calls:

Agent(
  subagent_type="feature-dev:code-reviewer",
  description="Review code for bugs and security",
  prompt="Review all code changes for bugs, logic errors, security vulnerabilities, and adherence to project conventions. Changes: <git diff output>"
)

Agent(
  subagent_type="pr-review-toolkit:silent-failure-hunter",
  description="Hunt silent failures in changes",
  prompt="Analyze all code changes for silent failures, inadequate error handling, and inappropriate fallback behavior. Changes: <git diff output>"
)

Agent(
  subagent_type="pr-review-toolkit:type-design-analyzer",
  description="Review type design quality",
  prompt="Review all types being added or modified for encapsulation, invariant expression, and design quality. Changes: <git diff output>"
)

Agent(
  subagent_type="pr-review-toolkit:comment-analyzer",
  description="Check comment accuracy",
  prompt="Analyze all comments in changed files for accuracy, completeness, and long-term maintainability. Changes: <git diff output>"
)

Agent(
  subagent_type="pr-review-toolkit:code-simplifier",
  description="Simplify changed code",
  prompt="Review recently modified code for unnecessary complexity. Suggest simplifications that preserve functionality. Changes: <git diff output>"
)
```

### Pattern 2: Parallel Implementation Agents

Use `isolation: "worktree"` when agents may touch overlapping directories.

```
// Agents working on independent features — launch in parallel
Agent(
  subagent_type="general-purpose",
  description="Implement API routes",
  prompt="Implement the API routes as specified in IMPLEMENTATION_PLAN.md...",
  isolation="worktree"
)

Agent(
  subagent_type="general-purpose",
  description="Implement UI components",
  prompt="Build the UI components as specified in IMPLEMENTATION_PLAN.md...",
  isolation="worktree"
)
```

### Pattern 3: Background Exploration + Foreground Work

```
// Start exploration in background while doing setup work
Agent(
  subagent_type="feature-dev:code-explorer",
  description="Explore auth system",
  prompt="Trace the authentication flow end-to-end...",
  run_in_background=true
)

// Continue with immediate work while exploration runs
Agent(
  subagent_type="general-purpose",
  description="Create project scaffolding",
  prompt="Set up the project structure..."
)
```

### Pattern 4: Planning Pipeline

```
// Step 1: Explore first (foreground — need results)
Agent(
  subagent_type="feature-dev:code-explorer",
  description="Analyze existing patterns",
  prompt="Analyze the codebase to understand existing patterns for <feature area>..."
)

// Step 2: Architect based on exploration (foreground — need results)
Agent(
  subagent_type="feature-dev:code-architect",
  description="Design feature architecture",
  prompt="Based on the exploration results: <results>. Design the implementation..."
)
```

---

## Agent Prompting Guidelines

When dispatching agents, include in the prompt:

1. **Context**: Reference to IMPLEMENTATION_PLAN.md, relevant sections
2. **Scope**: Exact files to create/modify — prevent scope creep
3. **Constraints**: What NOT to do (don't modify other agents' files)
4. **Validation**: How to verify completion (run tests, typecheck, etc.)
5. **Output**: What to return (summary of changes, any issues encountered)

**Template**:
```
You are Agent {id}: {name} in a swarm development project.

## Context
{Reference to IMPLEMENTATION_PLAN.md section}

## Your Scope
Files to create/modify:
- {file1}
- {file2}

## Constraints
- Only modify files listed above
- Follow patterns from {reference files}
- Do NOT modify {other agents' files}

## Deliverables
- [ ] {deliverable 1}
- [ ] {deliverable 2}

## Validation
Run: {validation command}
Expected: {expected outcome}

## When Done
Return a summary of:
1. Files created/modified
2. Key decisions made
3. Any issues or blockers encountered
```

---

## Skill Integration Points

Invoke these skills at phase boundaries for quality gates:

| Phase Boundary | Skill to Invoke | Condition |
|---------------|----------------|-----------|
| After UI implementation | `react-doctor` | React/Next.js project |
| After writing tests | `full-test-coverage` | Verify pyramid coverage |
| After any implementation | `smart-test` | Select and run relevant tests |
| Before merge | `code-review` | Final review pass |

**How to invoke**: Use the `Skill` tool with `skill: "<skill-name>"`.
