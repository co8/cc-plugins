# Changelog

All notable changes to Swarm Protocol will be documented in this file.

## [1.1.0] - 2025-01-26

### Changed
- **Optimized SKILL.md** from 13KB to 6KB (~52% reduction) for better token efficiency
- Condensed verbose sections (detection flow, examples, failure protocol) into compact tables
- Moved ASCII art and progress bars to `references/progress-art.md`
- Consolidated agent pattern duplicates between templates and patterns files

### Added
- New CLI flags: `--resume`, `--max-agents=N`, `--graph`
- Agent Failure Protocol with timeout/error/conflict handling
- Project Archival workflow with cleanup checklist
- 8 horizontal progress bar styles in progress-art.md
- Conditional reference loading documentation

### Fixed
- Removed duplicate content between SKILL.md and templates.md
- Clarified reference file loading (always vs conditional)

---

## [1.0.0] - 2024-01-24

### Added
- Initial release as Claude Code plugin
- `/swarm` command with smart project detection
- `/swarm <project-name>` for new project initialization
- Project name suggestions from Barcelona region place names (100 words)
- Document templates (PROJECT_PLAN, IMPLEMENTATION_PLAN, AGENT_SWARM_SPEC, CODE_REVIEW, CHANGELOG)
- Agent patterns for common project types:
  - Full-Stack Feature
  - Full-Stack Feature + Supabase Deployment
  - Database Deployment (Standalone)
  - API-Only
  - UI Refactor
  - Data Migration
  - Integration
  - Microservice
- Supabase deployment workflow with:
  - Preview branch validation
  - Migration error resolution loops
  - Security & performance advisor integration
  - Migration consolidation
  - Production deployment with backup verification
- Progress tracking with emoji status indicators
- Milestone commit automation
- Parallelization decision tree
- Error recovery options (retry, skip, abort, manual)
