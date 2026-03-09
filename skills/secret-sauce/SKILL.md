---
name: secret-sauce
description: Development best practices and project patterns. Use when starting projects, setting up CLAUDE.md, coding TypeScript/Next.js/React/Supabase, implementing AI flows, data fetching, testing, deployment, git workflows, browser automation, centralized configuration, or Tailwind CSS v4.
---

# Secret Sauce v2

Production-tested coding standards, patterns, and automated quality gates for TypeScript, Next.js, React, and Supabase projects.

**14 reference guides** covering every layer of the stack, **5 framework-specific rule sets** that enforce best practices, **6 ready-to-use project templates**, and a **parallel review team** of specialized subagents that catch bugs, security issues, silent failures, and design flaws before they ship.

### Why Secret Sauce?

- **Instant project setup** — CLAUDE.md template, settings, and planning docs get you productive in seconds
- **Automated quality gates** — 3-agent quick review or 5-agent full review, all dispatched in parallel
- **Real patterns, not theory** — Every rule and reference extracted from production codebases
- **AI flow patterns** — OpenAI SDK v6 + Anthropic SDK with Zod validation, streaming, tool use
- **Full-stack coverage** — TypeScript, Next.js, React, Supabase, Tailwind v4, Vitest, security, deployment

---

## Quick Reference

| Category | Reference File | Auto-Review Agent |
|----------|----------------|-------------------|
| **Tech Stack** | `references/tech-stack.md` | — |
| **Project Setup** | `references/claude-md-template.md` | — |
| **Project Tracking** | `references/project-tracking.md` | — |
| **Coding Standards** | `references/coding-standards.md` | `feature-dev:code-reviewer` |
| **Centralization** | `references/centralization-patterns.md` | `pr-review-toolkit:code-simplifier` |
| **Tailwind v4** | `references/tailwind-v4.md` | — |
| **AI Development** | `references/ai-flow-patterns.md` | `pr-review-toolkit:silent-failure-hunter` |
| **Data Fetching** | `references/data-fetching.md` | `pr-review-toolkit:silent-failure-hunter` |
| **Git Workflow** | `references/git-workflows.md` | — |
| **Testing** | `references/testing-patterns.md` | `pr-review-toolkit:pr-test-analyzer` |
| **Supabase** | `references/supabase-patterns.md` | `pr-review-toolkit:type-design-analyzer` |
| **Deployment** | `references/deployment-patterns.md` | — |
| **Browser Tools** | `references/browser-automation.md` | — |
| **Versioning** | `references/version-management.md` | — |

## Framework Rules

| Framework | Rule File | Auto-Review Agent |
|-----------|-----------|-------------------|
| TypeScript | `rules/typescript.md` | `pr-review-toolkit:type-design-analyzer` |
| Next.js | `rules/nextjs.md` | `feature-dev:code-reviewer` |
| React | `rules/react.md` | `react-doctor` skill |
| Supabase | `rules/supabase.md` | `feature-dev:code-reviewer` |
| Security | `rules/security.md` | `pr-review-toolkit:silent-failure-hunter` |

## Templates

| Template | Purpose |
|----------|---------|
| `templates/CLAUDE.md.template` | Project configuration starter |
| `templates/settings.json.template` | Permission configuration |
| `templates/project-plan.md.template` | Project planning document |
| `templates/implementation-plan.md.template` | Technical implementation plan |
| `templates/code-review.md.template` | Code review summary |
| `templates/changelog.md.template` | Project changelog |

---

## Automated Quality Gates

After completing a feature or significant code change, run these specialized agents to catch issues that manual review misses. Launch them **in parallel** (single message, multiple Agent tool calls).

### Quick Review (3 agents, parallel)

For fast feedback after any code change:

```
Agent(subagent_type="feature-dev:code-reviewer", prompt="Review changes for bugs, security, conventions...")
Agent(subagent_type="pr-review-toolkit:silent-failure-hunter", prompt="Check error handling in changes...")
Agent(subagent_type="pr-review-toolkit:code-simplifier", prompt="Simplify recently modified code...")
```

### Full Review (5 agents, parallel)

Before merge or PR creation — comprehensive quality check:

```
Agent(subagent_type="feature-dev:code-reviewer", prompt="Review for bugs, security, conventions...")
Agent(subagent_type="pr-review-toolkit:silent-failure-hunter", prompt="Check error handling...")
Agent(subagent_type="pr-review-toolkit:type-design-analyzer", prompt="Review type design quality...")
Agent(subagent_type="pr-review-toolkit:comment-analyzer", prompt="Check comment accuracy...")
Agent(subagent_type="pr-review-toolkit:pr-test-analyzer", prompt="Review test coverage gaps...")
```

### Skill Integration Points

Invoke these skills at key moments:

| Moment | Skill | Purpose |
|--------|-------|---------|
| After UI changes | `react-doctor` | Catch React anti-patterns, hooks issues |
| After writing tests | `full-test-coverage` | Verify test pyramid coverage |
| After code changes | `smart-test` | Run only relevant tests (fast feedback) |
| Before merge | `code-review` | Full structured review |
| Before PR | `pr-review-toolkit:review-pr` | Comprehensive PR review |

---

## Usage

### Starting a New Project

1. Copy `templates/CLAUDE.md.template` to your project root as `CLAUDE.md`
2. Customize sections for your stack
3. Reference specific rules: `~/.claude/skills/secret-sauce/rules/typescript.md`

### Setting Up Permissions

1. Copy `templates/settings.json.template` to `.claude/settings.json`
2. Adjust permissions for your workflow

### Project Documentation

Use templates for consistent project documentation:
- `project-plan.md.template` for planning
- `implementation-plan.md.template` for technical specs
- `code-review.md.template` for reviews

### Codebase Exploration

Use specialized agents to understand an existing codebase:

```
# Quick exploration
Agent(subagent_type="Explore", prompt="Find all API endpoints and their patterns...")

# Deep analysis
Agent(subagent_type="feature-dev:code-explorer", prompt="Trace auth flow end-to-end...")

# Architecture understanding
Agent(subagent_type="feature-dev:code-architect", prompt="Design implementation for <feature>...")
```

---

## Key Patterns

### CLAUDE.md Structure

Every project CLAUDE.md should include:
1. YAML frontmatter (title, status, owner, tags)
2. Quick Reference section with key commands
3. Active/Pending/Completed projects
4. Stack-specific guidelines
5. Development patterns

### Git Workflow

- Commit format: `<type>(<scope>): <description>`
- Never commit without confirmation
- Branch naming: `feature/<name>`, `fix/<name>`
- PR template with summary and test plan

### Centralization Pattern

All configuration in `@/config`:
```typescript
import { env, isProduction, getServiceUrl } from '@/config';
```

### Configuration Hierarchy

1. Database configuration (system_configuration table)
2. Environment variables (.env.local)
3. Hardcoded defaults

Secrets (API keys) → `.env.local` only
Configs (models, URLs) → Database with fallback

### Testing Standards

- Target: >90% coverage
- Prefer Vitest for new projects (fast, ESM-native); Jest for existing projects
- Use 30s timeout for ML/AI operations
- Add new test directories to test runners
- Security tests required for auth/validation
- After writing tests → invoke `smart-test` skill for intelligent test selection

### AI Flow Pattern

1. Zod schemas for input/output
2. Prompt builder functions
3. OpenAI SDK v6 with `zodResponseFormat()` — or Anthropic SDK with structured outputs
4. Error handling with Result types
5. Server action wrapper
6. After implementing → dispatch `pr-review-toolkit:silent-failure-hunter` to catch swallowed errors in AI error handling

### Data Fetching

- Always pass `signal` to fetch calls
- Use `isAbortError()` to handle cancellation
- Memoize fetch options to prevent refetches
- Use `usePolling` for dashboards with visibility-aware intervals

### Security Checklist

- Strict TypeScript (no `any`)
- Zod input validation
- Safe property access: `Object.prototype.hasOwnProperty.call()`
- XSS prevention on all user inputs
- Rate limiting in API routes
- After security-sensitive changes → dispatch `pr-review-toolkit:silent-failure-hunter`
