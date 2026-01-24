# Swarm Protocol

Multi-agent development orchestration for complex projects. Coordinates parallel workstreams, manages project documentation, and automates milestone commits.

## Features

- **Smart Project Detection**: Auto-detect existing projects or create new ones with memorable Catalan place names
- **Parallel Agent Execution**: Run multiple development tasks simultaneously when safe
- **Milestone Commits**: Automated commits after each phase completion
- **Supabase Integration**: Full database deployment workflow with preview branches
- **Progress Tracking**: Real-time status updates in CHANGELOG.md

## Installation

```bash
# Via Claude Code plugin system
/plugin install swarm-protocol
```

## Usage

### Start or Continue a Project

```bash
/swarm              # Auto-detect or create new project
/swarm my-feature   # Create specific project
```

### Options

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

```
├── PROJECT_PLAN.md          # Goals, success criteria, risks
├── IMPLEMENTATION_PLAN.md   # Architecture, file changes, migrations
├── AGENT_SWARM_SPEC.md      # Phase breakdown, agent definitions
├── CODE_REVIEW.md           # Quality metrics, issues, recommendations
└── CHANGELOG.md             # Real-time execution log
```

## Workflow

```
Setup → Planning → Execution (parallel agents) → Review
```

## Agent Patterns

Pre-built patterns for common project types:

- **Full-Stack Feature** - Complete CRUD with DB, API, UI
- **API-Only** - Backend services without UI
- **UI Refactor** - Frontend modernization
- **Data Migration** - Schema changes and data transforms
- **Integration** - Third-party service connections
- **Microservice** - New standalone services
- **Database Deployment** - Supabase preview to production

## Documentation

- `skills/swarm-protocol/SKILL.md` - Full protocol documentation
- `skills/swarm-protocol/references/templates.md` - Document templates
- `skills/swarm-protocol/references/agent-patterns.md` - Agent configurations
- `skills/swarm-protocol/references/supabase-deployment.md` - Database deployment workflow

## License

MIT
