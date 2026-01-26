# Project: secret-sauce

## Overview

Create a Claude Code plugin that centralizes and evolves best practices from recent projects (studioFE, sweet-sweet-money, cc-plugins, etc.) into a reusable skill with rules, references, and templates. This enables carrying accumulated learnings to future projects automatically.

## Goals

- [x] Extract best practices from studioFE CLAUDE.md and other projects
- [ ] Create structured skill with references for each category
- [ ] Provide framework-specific rule sets (TypeScript, Next.js, React, Supabase)
- [ ] Include project templates (CLAUDE.md, settings.json, project docs)
- [ ] Register as installable plugin in cc-plugins marketplace

## Success Criteria

- [ ] Plugin structure follows cc-plugins conventions
- [ ] Skill references cover all identified categories (10+ files)
- [ ] Templates are immediately usable for new projects
- [ ] Plugin passes validation and can be installed via `claude plugins install`

## Dependencies

### Existing Infrastructure
- cc-plugins repository structure
- ~/.claude/skills/ installation target
- Existing swarm-protocol and telegram-plugin patterns

### External Services
- None (documentation-only plugin)

### Team Dependencies
- None

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Content too verbose | Medium | Low | Use references pattern for detailed content |
| Patterns become outdated | Medium | Medium | Version tracking, regular updates |
| Overlaps with official skills | Low | Low | Focus on personal workflow patterns |

## Timeline

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Planning Complete | 2026-01-26 | 🔄 |
| Phase 1: Foundation | 2026-01-26 | ⏳ |
| Phase 2: Content Extraction | 2026-01-26 | ⏳ |
| Phase 3: Templates | 2026-01-26 | ⏳ |
| Final Review | 2026-01-26 | ⏳ |

## Stakeholders

- **Owner**: Enrique R Grullon
- **Reviewers**: Self
- **Consumers**: All future projects using Claude Code
