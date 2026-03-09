---
name: swarm-protocol
description: "Multi-agent development orchestration for complex projects. Use this skill when orchestrating parallel development workstreams, coordinating multiple agent tasks, managing project documentation structure, or executing `/swarm-protocol` commands. Triggers on: (1) `/swarm-protocol <project-name>` to initialize new projects with full planning, (2) `/swarm-protocol` (no args) to continue existing or start new project, (3) requests involving parallel agent coordination, milestone commits, or multi-phase development workflows."
---

# Swarm Protocol v2

Multi-agent orchestration framework for complex software development projects. Coordinates parallel workstreams using **specialized agent types**, manages project documentation, and automates milestone commits.

## Commands

| Command                                       | Purpose                                                 |
| --------------------------------------------- | ------------------------------------------------------- |
| `/swarm-protocol <project-name>`              | Initialize new project with full planning phase         |
| `/swarm-protocol`                             | Continue existing project, convert a plan, or start new |
| `/swarm-protocol --from-plan=<name>`          | Convert a specific plan file to swarm project           |
| `/swarm-protocol --review-only`               | Run only the Review Team phase on current changes       |

---

## `/swarm-protocol` (No Arguments)

Smart detection: Check branch (`feature/<name>`) → `docs/projects/` → `~/.claude/plans/` → prompt user.

**Detection priority**:
1. Current branch `feature/<name>` → match project in `docs/projects/<name>/`
2. List recent projects by modified date with status from CHANGELOG.md
3. List plans from `~/.claude/plans/` available for conversion
4. Offer new project with random name suggestions

**Project names**: Random from Barcelona region pool (rubi, sitges, mura, tiana, etc.)

**Plan conversion**: Parse plan → auto-populate PROJECT_PLAN.md, IMPLEMENTATION_PLAN.md, AGENT_SWARM_SPEC.md → review before execution.

---

## `/swarm-protocol <project-name>`

Initialize and execute a multi-agent development project.

### Phase 0: Project Setup

1. Create `docs/projects/<name>/` with: PROJECT_PLAN.md, IMPLEMENTATION_PLAN.md, AGENT_SWARM_SPEC.md, CODE_REVIEW.md, CHANGELOG.md
2. Create worktree: `git worktree add ../<repo>-<name> -b feature/<name>`
3. Supabase preview (if DB changes): `supabase branches create <name>`

### swarm-status.json — Progressive Auto-Update System (MANDATORY)

**CRITICAL**: `swarm-status.json` MUST be created at Phase 0 and updated **automatically at every action**. The ScopeTUI Swarm Monitor (`scopetui --swarm`) depends on this file being accurate. Stale status = broken monitoring.

**Location**: `docs/projects/<name>/swarm-status.json` inside the **worktree** (not master).

**Full schema + progressive update protocol**: See `references/swarm-status-schema.md`.

#### The Anti-Lag Rule

**Update BEFORE and AFTER every Agent dispatch — never batch updates.**

```
BEFORE dispatching agent → set agent "running" + write file
AFTER agent returns      → set agent "completed"/"failed" + write file
BEFORE phase transition  → advance currentPhaseId + write file
```

#### Quick Update Helper

```bash
# Atomic status update via jq (define once, use throughout)
swarm_update() {
  local file="$1" agent_id="$2" new_status="$3" now
  now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  jq --arg aid "$agent_id" --arg st "$new_status" --arg now "$now" '
    (.phases[].agents[] | select(.id == $aid)) |= (
      .status = $st |
      if $st == "running" then .startedAt = $now
      elif $st == "completed" then .completedAt = $now
      else . end
    ) | .updatedAt = $now
  ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Usage: swarm_update docs/projects/<name>/swarm-status.json "2.1" "running"
```

#### Orchestrator Owns Status

The **main session** (orchestrator) writes all status updates. Subagents NEVER touch swarm-status.json. This prevents race conditions and ensures consistent state.

#### Minimum viable format (TUI validates only `phases` array):
```json
{
  "project": "<name>",
  "branch": "feature/<name>",
  "currentPhaseId": "<active-phase-id>",
  "phases": [
    {
      "id": "1", "name": "Setup", "status": "completed",
      "agents": [{ "id": "1.1", "name": "Types", "status": "completed", "subagentType": "general-purpose" }]
    }
  ],
  "updatedAt": "<ISO 8601>"
}
```

### Phase 1: Planning (Sequential — use `feature-dev:code-architect`)

Generate all planning documents before implementation. See `references/templates.md` for document templates.

**Dispatch**: Use `Agent` tool with `subagent_type: "feature-dev:code-architect"` for architecture design, and `subagent_type: "feature-dev:code-explorer"` for codebase analysis.

**Planning sequence**:
1. **Explore** — Dispatch `feature-dev:code-explorer` agent to analyze existing codebase patterns, trace execution paths, map dependencies
2. **Architect** — Dispatch `feature-dev:code-architect` agent to design implementation blueprint based on exploration results
3. PROJECT_PLAN.md → Goals, success criteria, dependencies, risks
4. IMPLEMENTATION_PLAN.md → Architecture, file changes, migrations, API endpoints
5. AGENT_SWARM_SPEC.md → Phase breakdown, agent definitions with `subagent_type` assignments, parallelization strategy

### Phase 2-N: Execution

#### FULL EXECUTION, MAXIMUM PARALLELIZATION

**Agent dispatch**: Use the `Agent` tool for all agent invocations. See `references/agent-dispatch.md` for the centralized dispatch protocol mapping roles → subagent_types.

**Worktree isolation**: For parallel agents that touch overlapping directories, use `isolation: "worktree"` on the Agent tool call. This gives each agent an isolated repo copy, eliminating file conflicts and enabling more aggressive parallelization.

**Parallelization rules**:
- Agents within a phase run parallel when no file conflicts exist (or use worktree isolation)
- Phases with dependencies wait for blockers to complete
- Launch all independent agents in a **single message** with multiple Agent tool calls
- Use `run_in_background: true` for agents whose results aren't needed immediately

**Progress display**: See `references/templates.md` for colored box format, ANSI codes, and ASCII art variants.

**Status symbols**: `●` (green/complete), `◐` (yellow/in-progress), `○` (dim gray/pending)

**Milestone commits** (after each phase):
```bash
git add -A
git commit -m "feat(<project>): complete phase N - <description>

- Agent N.1: <summary>
- Agent N.2: <summary>

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

**Quality gates** (invoke after relevant phases):
- After UI phases → invoke `react-doctor` skill if React project
- After implementation → invoke `smart-test` skill for intelligent test selection
- After test writing → invoke `full-test-coverage` skill to verify pyramid coverage

### Phase Review & Repair: Review Team + Repair

**Review Team**: Dispatch a **parallel team of specialized reviewers** instead of a single review pass. This is the core improvement — each reviewer is a specialized subagent that catches different classes of issues.

**In swarm-status.json**, this is a single phase with id `"review-repair"` and name `"Review Team & Repair"`, containing review agents + repair agent.

#### Review Team (Parallel — launch ALL in a single message)

| Agent | Subagent Type | Focus |
|-------|--------------|-------|
| R.1 Code Reviewer | `feature-dev:code-reviewer` | Bugs, logic errors, security, conventions |
| R.2 Silent Failure Hunter | `pr-review-toolkit:silent-failure-hunter` | Inadequate error handling, swallowed errors, bad fallbacks |
| R.3 Type Design Analyzer | `pr-review-toolkit:type-design-analyzer` | Type encapsulation, invariant expression, design quality |
| R.4 Comment Analyzer | `pr-review-toolkit:comment-analyzer` | Comment accuracy, stale docs, misleading descriptions |
| R.5 Code Simplifier | `pr-review-toolkit:code-simplifier` | Unnecessary complexity, redundant code, clarity improvements |

**Dispatch all 5 in parallel**:
```
Agent(subagent_type="feature-dev:code-reviewer", prompt="Review all changes in <diff>...")
Agent(subagent_type="pr-review-toolkit:silent-failure-hunter", prompt="Analyze error handling in <diff>...")
Agent(subagent_type="pr-review-toolkit:type-design-analyzer", prompt="Review types introduced in <diff>...")
Agent(subagent_type="pr-review-toolkit:comment-analyzer", prompt="Check comment accuracy in <diff>...")
Agent(subagent_type="pr-review-toolkit:code-simplifier", prompt="Simplify recently modified code in <diff>...")
```

**After all reviewers complete**: Consolidate findings into CODE_REVIEW.md with issues categorized by severity (High/Medium/Low), source reviewer, and recommendations.

#### Repair (Sequential — after Review Team completes)

**Repair steps**:
1. **High-severity issues**: Fix all critical bugs, security vulnerabilities, and breaking issues
2. **Medium-severity issues**: Resolve performance problems, missing validation, incomplete error handling
3. **Low-severity issues**: Fix code style violations, naming inconsistencies, minor improvements
4. **Recommendations (Immediate)**: Implement all "Before Merge" recommendations from CODE_REVIEW.md
5. **Simplifications**: Apply code-simplifier suggestions — reduce complexity while preserving functionality
6. **Suggestions & nits**: Apply code suggestions, improve readability, clean up dead code
7. **Enhancements**: Add small enhancements identified during review (better types, missing edge cases, improved UX)
8. Update CODE_REVIEW.md — mark all resolved issues with resolution details
9. Commit all repair changes

**Repair rules**:
- Work through issues by severity: High → Medium → Low → Recommendations → Simplifications → Nits → Enhancements
- Each fix must not introduce new issues
- Update the `Resolution` column in CODE_REVIEW.md for every addressed item
- If a fix requires significant refactoring, document the trade-off and proceed

### Phase Verify: Final Verification

Validate that all repairs are correct and the project is ready for merge.

**Verification steps**:
1. `npm run test && npm run typecheck && npm run lint`
2. Dispatch `feature-dev:code-reviewer` on repair diff to confirm no regressions introduced
3. Verify all CODE_REVIEW.md issues marked as resolved
4. Update project CLAUDE.md
5. **If Supabase preview used**: Execute database deployment workflow (see below)
6. Final commit with verification summary

### Options

| Flag                 | Purpose                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------- |
| `--skip-worktree`    | Use current branch instead of creating worktree                                         |
| `--skip-preview`     | Skip Supabase preview branch creation                                                   |
| `--phases=1,2`       | Run only specific phases                                                                |
| `--dry-run`          | Generate plans only, no execution                                                       |
| `--from-phase=N`     | Resume from specific phase                                                              |
| `--agent=N.M`        | Run single agent only                                                                   |
| `--from-plan=<name>` | Convert a specific plan file to project (e.g., `--from-plan=scalable-forging-lovelace`) |
| `--resume`           | Auto-detect last incomplete agent and resume from there                                 |
| `--max-agents=N`     | Limit concurrent parallel agents (default: 4)                                           |
| `--graph`            | Output agent dependency graph in Mermaid format                                         |
| `--review-only`      | Run only the Review Team phase on current changes (no planning/execution)               |
| `--isolate`          | Force worktree isolation for all parallel agents                                        |

---

## Supabase Database Deployment

If project uses Supabase preview branches, see `references/supabase-deployment.md` for the full deployment workflow including migration validation loops, advisor checks, and production deployment steps.

**Quick ref**: `supabase db push --linked` → fix errors → run advisors → consolidate → deploy to production.

---

## Agent Dispatch Protocol

**CRITICAL**: Always use the correct `subagent_type` when dispatching agents. See `references/agent-dispatch.md` for the complete mapping.

**Quick reference**:

| Agent Role | Subagent Type | When to Use |
|-----------|--------------|-------------|
| Codebase exploration | `Explore` | Understanding existing code, finding patterns |
| Architecture design | `feature-dev:code-architect` | Planning implementation, designing components |
| Deep codebase analysis | `feature-dev:code-explorer` | Tracing execution paths, mapping dependencies |
| Code review | `feature-dev:code-reviewer` | Reviewing for bugs, security, conventions |
| Silent failure hunting | `pr-review-toolkit:silent-failure-hunter` | Finding swallowed errors, bad fallbacks |
| Type design review | `pr-review-toolkit:type-design-analyzer` | Reviewing type encapsulation, invariants |
| Comment review | `pr-review-toolkit:comment-analyzer` | Checking comment accuracy, staleness |
| Code simplification | `pr-review-toolkit:code-simplifier` | Reducing complexity, improving clarity |
| Test coverage analysis | `pr-review-toolkit:pr-test-analyzer` | Reviewing test completeness |
| General implementation | `general-purpose` | Default for coding agents |
| Planning | `Plan` | Designing implementation strategies |

**Dispatch rules**:
1. **Single message, multiple agents**: Launch all independent agents in ONE message with multiple Agent tool calls
2. **Background when possible**: Use `run_in_background: true` for agents whose output isn't needed to proceed
3. **Worktree isolation**: Use `isolation: "worktree"` when parallel agents may touch overlapping files
4. **Resume capability**: Store agent IDs to resume failed/interrupted agents via the `resume` parameter

## Agent Design Principles

**Parallelization**: Safe when different files/dirs, independent features, tests for completed work. Sequential for dependency chains (Schema→Types→API), base→composite components, core→integration. Use `isolation: "worktree"` to unlock parallelism when agents share directories.

**Agent scope**: Single responsibility, own specific files (no overlap), define completion criteria, include validation.

**Communication**: IMPLEMENTATION_PLAN.md + type definitions (shared context), file system (deliverables), CHANGELOG.md (progress).

### Agent Failure Protocol

| Failure              | Action                                                              |
| -------------------- | ------------------------------------------------------------------- |
| **Timeout** (>15min) | Log to CHANGELOG, mark blocked, continue non-dependent, prompt user |
| **Error**            | Log, retry once, if fails pause and prompt, block dependents        |
| **File Conflict**    | Halt agents, alert user, request resolution                         |

**Recovery**: `/swarm-protocol --resume` (auto-resume) | `/swarm-protocol-protocol --agent=2.3 --retry` | `/swarm-protocol-protocol --skip-agent=2.3`

---

## Project Archival

After merge: move docs to `docs/archive/`, remove worktree, delete feature branch, clean Supabase preview if used.

```bash
mv docs/projects/<name> docs/archive/<name>
git worktree remove ../<repo>-<name>
git branch -d feature/<name>
supabase branches delete <name>  # if applicable
```

---

## Best Practices

Plan thoroughly → Use specialized subagent types → Keep agents focused → Define interfaces first → Launch parallel agents in single messages → Commit per phase → Review with full team → Repair all issues → Verify before merge → Document decisions in CODE_REVIEW.md

## Reference Files

| File                                | Load When                          |
| ----------------------------------- | ---------------------------------- |
| `references/agent-dispatch.md`      | Always (subagent type mapping)     |
| `references/templates.md`           | Always (document templates)        |
| `references/agent-patterns.md`      | Always (agent configurations)      |
| `references/supabase-deployment.md` | DB migrations present              |
| `references/progress-art.md`        | Display customization              |
