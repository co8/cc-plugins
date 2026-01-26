---
name: swarm
description: Multi-agent development orchestration for complex projects. Use this skill when orchestrating parallel development workstreams, coordinating multiple agent tasks, managing project documentation structure, or executing `/swarm` commands. Triggers on: (1) `/swarm <project-name>` to initialize new projects with full planning, (2) `/swarm` (no args) to continue existing or start new project, (3) requests involving parallel agent coordination, milestone commits, or multi-phase development workflows.
---

# Swarm Protocol

Multi-agent orchestration framework for complex software development projects. Coordinates parallel workstreams, manages project documentation, and automates milestone commits.

## Commands

| Command | Purpose |
|---------|---------|
| `/swarm <project-name>` | Initialize new project with full planning phase |
| `/swarm` | Continue existing project, convert a plan, or start new |
| `/swarm --from-plan=<name>` | Convert a specific plan file to swarm project |

---

## `/swarm` (No Arguments)

Smart project detection and continuation.

### Detection Flow

```
/swarm
  │
  ├─► Check git branch
  │   └─► feature/<n> → Extract project name
  │
  ├─► Check docs/projects/
  │   └─► List recent projects by modified date
  │
  ├─► Check ~/.claude/plans/
  │   └─► List recent plans available for conversion
  │
  └─► Decision:
      ├─► Project identified → "Continue <project>? [Y/n]"
      ├─► Multiple found → "Select project or create new"
      ├─► Plans available → "Convert plan to project?"
      └─► None found → "Create new project? Suggested: <n>"
```

### Behavior

1. **Branch detection**: If on `feature/<project-name>` branch, check for matching project in `docs/projects/<project-name>/`

2. **Recent projects**: List projects from `docs/projects/` sorted by last modified:
   ```
   Recent projects:
   1. zap-phoenix (modified: 2h ago) - Phase 2/4 in progress
   2. atlas-sync (modified: 1d ago) - Complete, pending review
   3. auth-refresh (modified: 3d ago) - Phase 1/3 in progress
   
   [1-3] Continue project | [n] New project | [q] Cancel
   ```

3. **Recent plans**: Check `~/.claude/plans/` for implementation plans that can be converted to swarm projects:
   ```
   Recent plans available for conversion:
   1. scalable-forging-lovelace (3h ago) - "RailwayCard Enhancement Plan"
   2. temporal-sleeping-ladybug (1d ago) - "Centralized Environment & Domain Configuration"
   3. optimized-crunching-fountain (2d ago) - "API Rate Limiting Implementation"

   [1-3] Convert to project | [s] Skip to projects | [n] New project
   ```

4. **New project suggestion**: If no projects found or user chooses new, offer 3 random names from the word pool:
   ```
   No active projects found.
   Create new project?

   Suggested names:
     1. ember
     2. prism
     3. quill

   [1-3] Select | [name] Custom name | [n] Cancel
   ```

### Project Name Word Pool

Random selection from these names (Barcelona region & Vallès):

```
saba, terra, rubi, palau, caldes, barbera, caste, matade, vacar, ullast,
rellin, gallifa, poliny, sentme, savall, vica, olesa, abrera, marto, collbato,
monistrol, castellbell, navarcles, sallent, artes, santpedor, manresa, rajadell, fonoll, mura,
mollet, grano, cardo, lica, paret, montme, montorn, martore, llinars, dosrius,
canov, franqu, roca, bigues, riells, figar, tagam, aigue, seva, tona,
premia, alella, tiana, mongat, cabrera, argentona, canet, arenys, caldetes, pineda,
malgrat, palafo, tordera, blanes, vilassar, masnou, ocata, matarell, llavaneres, calella,
gava, vilade, begues, cerve, palleja, corbera, molins, papiol, colbat, esparra,
piera, masque, gelida, ordal, subirats, lavern, pachs, vila, sitges, garraf,
olivella, canyelles, cubelles, vilanova, vendrell, calafell, cunit, segur, creixell
```

### Plan Conversion

When converting a plan from `~/.claude/plans/` to a swarm project:

1. **Parse plan file**: Extract title (first `#` heading), summary, file changes, and implementation steps
2. **Generate project name**: Use plan filename or suggest from word pool
3. **Auto-populate documents**:
   - `PROJECT_PLAN.md` ← Plan title, summary, and goals
   - `IMPLEMENTATION_PLAN.md` ← File changes, code snippets, verification steps
   - `AGENT_SWARM_SPEC.md` ← Generate agents from implementation steps (one agent per logical unit of work)
4. **Review generated spec**: Present the auto-generated agent breakdown for user approval before execution

**Plan file format expected** (from Claude Code plan mode):
```markdown
# Plan Title

## Overview/Summary
Brief description...

## Changes Summary / Files to Modify
| File | Changes |
|------|---------|
| path/to/file.ts | Description of changes |

## Implementation Order / Steps
1. First step...
2. Second step...

## Verification
- [ ] Test step 1
- [ ] Test step 2
```

### Project Status Detection

When listing projects, show status from `CHANGELOG.md`:
- Parse last phase completed
- Count agents done vs total
- Show blocking issues if any

```
zap-phoenix: Phase 2 (3/4 agents) - Agent 2.3 in progress
atlas-sync: Phase 4 ✅ - Pending code review
auth-refresh: Phase 1 (1/2 agents) - Blocked: migration error
```

---

## `/swarm <project-name>`

Initialize and execute a multi-agent development project.

### Phase 0: Project Setup

1. **Create project structure**:
   ```
   docs/projects/<project-name>/
   ├── PROJECT_PLAN.md
   ├── IMPLEMENTATION_PLAN.md
   ├── AGENT_SWARM_SPEC.md
   ├── CODE_REVIEW.md
   └── CHANGELOG.md
   ```

2. **Create feature branch & worktree**:
   ```bash
   git worktree add ../studioFE-<project-name> -b feature/<project-name>
   ```

3. **Supabase preview** (if DB changes needed):
   ```bash
   supabase branches create <project-name>
   ```

### Phase 1: Planning (Sequential)

Generate all planning documents before implementation. See `references/templates.md` for document templates.

**Planning sequence**:
1. PROJECT_PLAN.md → Goals, success criteria, dependencies, risks
2. IMPLEMENTATION_PLAN.md → Architecture, file changes, migrations, API endpoints
3. AGENT_SWARM_SPEC.md → Phase breakdown, agent definitions, parallelization strategy

### Phase 2-N: Execution

**Parallelization rules**:
- Agents within a phase run parallel when no file conflicts exist
- Phases with dependencies wait for blockers to complete
- Use `Task` tool for parallel agent invocations

**Progress display** (with ANSI colors):
- **Pending**: Dim gray (`\x1b[2m` or `\x1b[90m`)
- **In Progress**: Yellow (`\x1b[33m`)
- **Complete**: Green (`\x1b[32m`)
- Section titles turn green when all items in section are complete

```
┌─────────────────────────────────────────┐
│  SWARM: <project-name>                  │
├─────────────────────────────────────────┤
│                                         │
│  Phase 1: Foundation ✓                  │  ← Green (complete)
│  ● Agent 1.1: Schema                    │  ← Green dot
│                                         │
│  Phase 2: Core [3/4]                    │  ← Yellow (in progress)
│  ● Agent 2.1: API                       │  ← Green dot
│  ● Agent 2.2: Services                  │  ← Green dot
│  ◐ Agent 2.3: UI                        │  ← Yellow dot (in progress)
│  ○ Agent 2.4: State                     │  ← Dim gray dot (pending)
│                                         │
│  Phase 3: Integration                   │  ← Dim gray (pending)
│  ○ Agent 3.1: Page Integration          │  ← Dim gray dot
│  ○ Agent 3.2: Navigation                │  ← Dim gray dot
│                                         │
└─────────────────────────────────────────┘

    _____
   / ____|
  | (_____      ____ _ _ __ _ __ ___
   \___ \ \ /\ / / _` | '__| '_ ` _ \
   ____) \ V  V / (_| | |  | | | | | |
  |_____/ \_/\_/ \__,_|_|  |_| |_| |_|
                           [Phase 2/3]
```

**Status symbols**:
| Symbol | Color | Meaning |
|--------|-------|---------|
| `●` | Green | Complete |
| `◐` | Yellow | In Progress |
| `○` | Dim Gray | Pending |

**ASCII art variants** (rotate at end of each progress report):

```
     __
    /  \  SWARM ACTIVE
   | 🐝 | Phase 2 of 3
    \__/  3 agents running
```

```
   ╔═══════════════╗
   ║  ◉ SWARM ◉    ║
   ║  ▓▓▓▓░░ 67%   ║
   ╚═══════════════╝
```

```
  ┌──●──●──◐──○──┐
  │   PROGRESS   │
  └──────────────┘
```

**Milestone commits** (after each phase):
```bash
git add -A
git commit -m "feat(<project>): complete phase N - <description>

- Agent N.1: <summary>
- Agent N.2: <summary>

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

### Phase Final: Review

Generate CODE_REVIEW.md with quality metrics, issues found, optimizations applied.

**Final steps**:
1. `npm run test && npm run typecheck && npm run lint`
2. Update project CLAUDE.md
3. **If Supabase preview used**: Execute database deployment workflow (see below)
4. Final commit with review summary

### Options

| Flag | Purpose |
|------|---------|
| `--skip-worktree` | Use current branch instead of creating worktree |
| `--skip-preview` | Skip Supabase preview branch creation |
| `--phases=1,2` | Run only specific phases |
| `--dry-run` | Generate plans only, no execution |
| `--from-phase=N` | Resume from specific phase |
| `--agent=N.M` | Run single agent only |
| `--from-plan=<name>` | Convert a specific plan file to project (e.g., `--from-plan=scalable-forging-lovelace`) |

---

## Supabase Database Deployment

When a project uses Supabase preview branches, follow this workflow before merging. See `references/supabase-deployment.md` for complete details.

### Deployment Flow

```
PREVIEW                              PRODUCTION
───────                              ──────────
1. Apply migrations                  6. Backup production
2. Fix errors → loop until success   7. Apply consolidated migration
3. Run security/perf advisors        8. Fix errors → loop until success
4. Fix advisor issues → loop clean   9. Run advisors
5. Consolidate migrations            10. Post-deploy backup + verify
```

### Quick Commands

| Step | Command |
|------|---------|
| Apply migrations | `supabase db push --linked` |
| Check diff | `supabase db diff --linked` |
| Run advisors | Supabase MCP / Dashboard |
| Backup (if script exists) | `./scripts/backup-db.sh production` |
| Consolidate | `supabase db diff --linked -f consolidated` |

### Validation Loops

**Migration errors**: Fix and re-run until `supabase db push` succeeds with no errors.

**Advisor issues**: Fix errors → warnings → info until all advisors pass clean.

### Pre-Production Checklist

```
Preview:
- [ ] Migrations: 0 errors
- [ ] Security advisor: 0 errors, 0 warnings  
- [ ] Performance advisor: 0 errors, 0 warnings
- [ ] Consolidated migration reviewed

Production:
- [ ] Pre-deployment backup verified
- [ ] Migration applied successfully
- [ ] All advisor issues resolved
- [ ] Post-deployment backup created
- [ ] Smoke tests passing
```

---

## Agent Design Principles

### Parallelization Strategy

**Safe to parallelize**:
- Agents working on different files/directories
- Independent feature implementations
- Test writing for completed features

**Must be sequential**:
- Schema → Types → API (dependency chain)
- Base components → Composite components
- Core logic → Integration tests

### Agent Scope Guidelines

Each agent should:
- Have a single, clear responsibility
- Own specific files (no overlap)
- Define completion criteria
- Include validation steps

### Communication Protocol

Agents communicate via:
1. **Shared context**: IMPLEMENTATION_PLAN.md, type definitions
2. **File system**: Completed deliverables available to dependent agents
3. **CHANGELOG.md**: Real-time progress updates

---

## Best Practices

1. **Plan thoroughly before execution** - Investment in planning prevents rework
2. **Keep agents focused** - One responsibility per agent
3. **Define clear interfaces** - Types and contracts before implementation
4. **Commit frequently** - Milestone commits after each phase
5. **Validate continuously** - Run tests after each agent completes
6. **Document decisions** - Update CODE_REVIEW.md with rationale

## Reference Files

- `references/templates.md` - Document templates for all project files
- `references/agent-patterns.md` - Common agent configurations and patterns
- `references/supabase-deployment.md` - Database deployment workflow with validation loops
