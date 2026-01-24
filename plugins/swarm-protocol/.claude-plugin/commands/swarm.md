# /swarm - Multi-Agent Development Orchestration

Initialize or continue a multi-agent development project.

## Usage

```
/swarm [project-name]
```

## Behavior

### With project name: `/swarm my-feature`
- Creates new project structure at `docs/projects/my-feature/`
- Creates feature branch & worktree
- Generates planning documents (PROJECT_PLAN.md, IMPLEMENTATION_PLAN.md, AGENT_SWARM_SPEC.md)
- Executes parallel agent workstreams
- Manages milestone commits

### Without arguments: `/swarm`
1. **Auto-detect**: Check current branch (`feature/<n>`) and `docs/projects/`
2. **List recent**: Show projects sorted by last modified with status
3. **Prompt**: Continue existing, select from list, or create new

```
Recent projects:
1. gallifa (2h ago) - Phase 2/4 in progress
2. tiana (1d ago) - Complete, pending review
3. mura (3d ago) - Phase 1/3 in progress

[1-3] Continue | [n] New project | [q] Cancel
```

### New project name suggestions
Offers 3 random names from Barcelona region:
```
Suggested names:
  1. begues
  2. mollet
  3. sitges

[1-3] Select | [name] Custom name | [n] Cancel
```

## Options

| Flag | Purpose |
|------|---------|
| `--skip-worktree` | Use current branch |
| `--skip-preview` | Skip Supabase preview |
| `--phases=1,2` | Run specific phases |
| `--dry-run` | Generate plans only |
| `--from-phase=N` | Resume from phase |
| `--agent=N.M` | Run single agent |

## Project Structure

Creates at `docs/projects/<project-name>/`:
- `PROJECT_PLAN.md` - Goals, success criteria, risks
- `IMPLEMENTATION_PLAN.md` - Architecture, file changes, migrations
- `AGENT_SWARM_SPEC.md` - Phase breakdown, agent definitions
- `CODE_REVIEW.md` - Quality metrics, issues, recommendations
- `CHANGELOG.md` - Real-time execution log

## Workflow

```
Setup → Planning → Execution (parallel agents) → Review
```

## See Also

Full documentation in skill: `skills/swarm-protocol/SKILL.md`
