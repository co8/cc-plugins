# Secret Sauce

Best practices, rules, and templates extracted from real production projects.

## Installation

```bash
claude plugins install secret-sauce
```

## What's Included

### Skills

The main skill at `~/.claude/skills/secret-sauce/SKILL.md` provides:

- Quick reference tables for all patterns
- Framework-specific rule pointers
- Template locations
- Key patterns summary

### References

Detailed documentation in `references/`:

| File | Description |
|------|-------------|
| `claude-md-template.md` | How to structure CLAUDE.md files |
| `project-tracking.md` | Active/Pending/Completed project format |
| `coding-standards.md` | TypeScript, React patterns |
| `ai-flow-patterns.md` | OpenAI SDK v6 + Zod patterns |
| `data-fetching.md` | useFetch, usePolling hooks |
| `git-workflows.md` | Commit format, PR templates |
| `testing-patterns.md` | Jest, coverage, security tests |
| `supabase-patterns.md` | Migrations, MCP, RLS |
| `deployment-patterns.md` | Vercel + Railway hybrid |
| `browser-automation.md` | Tool selection matrix |
| `version-management.md` | Multi-file version sync |

### Rules

Quick checklists in `rules/`:

| File | Description |
|------|-------------|
| `typescript.md` | Strict TypeScript rules |
| `nextjs.md` | Next.js 16 patterns |
| `react.md` | Component patterns |
| `supabase.md` | Database patterns |
| `security.md` | OWASP checklist |

### Templates

Project starters in `templates/`:

| File | Description |
|------|-------------|
| `CLAUDE.md.template` | Project configuration starter |
| `settings.json.template` | Permission configuration |
| `project-plan.md.template` | Planning document |
| `implementation-plan.md.template` | Technical spec |
| `code-review.md.template` | Review summary |
| `changelog.md.template` | Project changelog |

## Usage

### Starting a New Project

1. Copy `templates/CLAUDE.md.template` to your project root:
   ```bash
   cp ~/.claude/skills/secret-sauce/templates/CLAUDE.md.template ./CLAUDE.md
   ```

2. Customize for your stack

3. Reference specific rules in your CLAUDE.md:
   ```markdown
   ## Rules
   - TypeScript: `~/.claude/skills/secret-sauce/rules/typescript.md`
   - Security: `~/.claude/skills/secret-sauce/rules/security.md`
   ```

### Referencing Patterns

In your project's CLAUDE.md:

```markdown
## Development Patterns

See `~/.claude/skills/secret-sauce/references/ai-flow-patterns.md` for AI flow development.
See `~/.claude/skills/secret-sauce/references/data-fetching.md` for React data fetching.
```

### Quick Reference

During development, ask Claude:

```
What's the commit format from secret-sauce?
Show me the AI flow pattern from secret-sauce
What's the security checklist?
```

## Key Patterns

### CLAUDE.md Structure

Every project should have:
1. YAML frontmatter (title, status, owner, tags)
2. Quick Reference with key commands
3. Active/Pending/Completed projects
4. Stack-specific guidelines

### Configuration Hierarchy

```
1. Database (system_configuration)
2. Environment (.env.local)
3. Hardcoded defaults
```

**Secrets** (API keys) → `.env.local` only
**Configs** (models, URLs) → Database with fallback

### Git Workflow

```
<type>(<scope>): <description>
```

- Max 50 characters
- Imperative mood
- Never commit without confirmation

### Testing Standards

- Target: >90% coverage
- 30s timeout for ML operations
- Security tests required

## Version

1.0.0

## License

MIT
