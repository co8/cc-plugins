# Implementation Plan: secret-sauce

## Architecture

The secret-sauce plugin follows the standard cc-plugins structure with a skill-based approach. The main SKILL.md serves as an index with trigger conditions, while detailed content lives in the `references/` subdirectory. Framework-specific rules are separated into `rules/` for easy selective loading, and `templates/` provides ready-to-use project starters.

```
plugins/secret-sauce/
├── .claude-plugin/           # Plugin configuration
│   ├── plugin.json           # Minimal metadata
│   └── marketplace.json      # Extended marketplace info
├── skills/
│   └── secret-sauce/
│       ├── SKILL.md          # Index & triggers
│       └── references/       # Detailed content (11 files)
├── rules/                    # Framework checklists (5 files)
├── templates/                # Project starters (6 files)
└── README.md                 # Usage documentation
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.claude-plugin/plugin.json` | Create | Plugin metadata |
| `.claude-plugin/marketplace.json` | Create | Marketplace listing |
| `skills/secret-sauce/SKILL.md` | Create | Main skill index |
| `skills/secret-sauce/references/claude-md-template.md` | Create | studioFE-style CLAUDE.md guide |
| `skills/secret-sauce/references/coding-standards.md` | Create | TypeScript, React patterns |
| `skills/secret-sauce/references/git-workflows.md` | Create | Commit, branch, PR patterns |
| `skills/secret-sauce/references/ai-flow-patterns.md` | Create | OpenAI SDK v6 + Zod |
| `skills/secret-sauce/references/data-fetching.md` | Create | useFetch, usePolling patterns |
| `skills/secret-sauce/references/testing-patterns.md` | Create | Jest, coverage configs |
| `skills/secret-sauce/references/supabase-patterns.md` | Create | Migrations, MCP usage |
| `skills/secret-sauce/references/browser-automation.md` | Create | Tool selection matrix |
| `skills/secret-sauce/references/deployment-patterns.md` | Create | Vercel + Railway |
| `skills/secret-sauce/references/project-tracking.md` | Create | Status format |
| `skills/secret-sauce/references/version-management.md` | Create | Multi-file sync |
| `rules/typescript.md` | Create | Strict TS checklist |
| `rules/nextjs.md` | Create | Next.js 16 patterns |
| `rules/react.md` | Create | Component patterns |
| `rules/supabase.md` | Create | DB patterns |
| `rules/security.md` | Create | OWASP checklist |
| `templates/CLAUDE.md.template` | Create | Project starter |
| `templates/settings.json.template` | Create | Permissions config |
| `templates/project-plan.md.template` | Create | From swarm |
| `templates/implementation-plan.md.template` | Create | From swarm |
| `templates/code-review.md.template` | Create | From swarm |
| `templates/changelog.md.template` | Create | From swarm |
| `README.md` | Create | Plugin documentation |

## Database Migrations

N/A - Documentation-only plugin

## API Endpoints

N/A - Documentation-only plugin

## Content Sources

| Source File | → Extracted To |
|-------------|----------------|
| `~/Documents/ScopeData/studioFE/CLAUDE.md` | `references/claude-md-template.md`, `references/coding-standards.md` |
| `~/.claude/CLAUDE.md` | `references/browser-automation.md` |
| `~/.claude/settings.json` | `templates/settings.json.template` |
| `~/.claude/skills/swarm/references/templates.md` | `templates/*.template` |
| `~/.claude/skills/swarm/SKILL.md` | Pattern reference |
| `~/Documents/sweet-sweet-money/CLAUDE.md` | Project memory patterns |

## Installation Target

After plugin creation, skill will be installed to:
```
~/.claude/skills/secret-sauce/
├── SKILL.md
└── references/
```

## Phases

See `AGENT_SWARM_SPEC.md` for detailed phase breakdown.
