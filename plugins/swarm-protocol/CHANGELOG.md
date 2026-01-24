# Changelog

All notable changes to Swarm Protocol will be documented in this file.

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
